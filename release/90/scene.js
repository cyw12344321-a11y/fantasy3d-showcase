/* MIT three-mesh-bvh accelerates the existing camera rays, with the same clipping predicate. */
(function(){
 'use strict';
 function buildTree(geometry){
  return new MeshBVHLib.MeshBVH(geometry,{indirect:true,strategy:MeshBVHLib.CENTER,targetLeafSize:12});
 }

 // This same script also runs as a dedicated Worker. The offline Three wrapper
 // exports on window, but none of its geometry routines needs a DOM.
 if(typeof window==='undefined'){
  self.window=self;
  importScripts('vendor/three.offline.js','vendor/three-mesh-bvh.js');
  self.onmessage=({data})=>{
   const results=data.map(({position,index,groups,drawRange})=>{
    const geometry=new THREE.BufferGeometry();
    geometry.setAttribute('position',new THREE.BufferAttribute(position,3));
    if(index)geometry.setIndex(new THREE.BufferAttribute(index,1));
    geometry.groups=groups;geometry.drawRange=drawRange;
    const result=MeshBVHLib.MeshBVH.serialize(buildTree(geometry),{cloneBuffers:false});
    // The main thread already owns the original index, including the no-index case.
    result.index=null;
    return result;
   });
   self.postMessage(results,results.flatMap(result=>[...result.roots,result.indirectBuffer.buffer]));
  };
  return;
 }

 async function buildTrees(geometries){
  if(typeof Worker==='function'){
   let worker,timer;
   try{
    worker=new Worker(new URL('camera-query.js',document.baseURI));
    const results=await new Promise((resolve,reject)=>{
     worker.onmessage=event=>resolve(event.data);
     worker.onerror=()=>reject(new Error('Camera index worker unavailable'));
     worker.onmessageerror=()=>reject(new Error('Camera index response unreadable'));
     timer=setTimeout(()=>reject(new Error('Camera index worker timed out')),8000);
     // Structured clone keeps the live GPU buffers in the render thread.
     worker.postMessage(geometries.map(g=>({position:g.attributes.position.array,
      index:g.index?.array,groups:g.groups,drawRange:g.drawRange})));
    });
    return {mode:'worker',trees:results.map((data,i)=>
     MeshBVHLib.MeshBVH.deserialize(data,geometries[i],{setIndex:false}))};
   }catch(_){
    // file:// pages and restrictive worker policies still get exact collision.
   }finally{
    if(timer!==undefined)clearTimeout(timer);
    worker?.terminate();
   }
  }
  const trees=[];
  for(const geometry of geometries){
   if((geometry.index?.count??geometry.attributes.position.count)>12000)await TempleAssets.yieldFrame();
   trees.push(buildTree(geometry));
  }
  return {mode:'main',trees};
 }

 window.TempleCameraQuery={async create(T,meshes,sharedGeometry=new Map()){
  const entries=[],ray=new T.Ray(),localRay=new T.Ray(),direction=new T.Vector3(),hit=new T.Vector3();
  const geometries=meshes.map(mesh=>sharedGeometry.get(mesh.geometry)??mesh.geometry);
  const unique=[...new Set(geometries)],{mode,trees}=await buildTrees(unique);
  const indexed=new Map(unique.map((g,i)=>[g,trees[i]]));
  for(let i=0;i<meshes.length;i++){
   const mesh=meshes[i];mesh.updateMatrixWorld(true);
   entries.push({mesh,tree:indexed.get(geometries[i]),inverse:mesh.matrixWorld.clone().invert(),
    bounds:new T.Box3().setFromObject(mesh),scale:mesh.matrixWorld.getMaxScaleOnAxis()});
  }
  function clearDistance(from,to,padding=.22){
   direction.subVectors(to,from);const length=direction.length();if(length<.001)return length;
   direction.divideScalar(length);ray.set(from,direction);let distance=length;
   for(const {mesh,tree,inverse,bounds,scale} of entries){
    if(!ray.intersectsBox(bounds))continue;
    localRay.copy(ray).applyMatrix4(inverse);
    for(const intersection of tree.raycast(localRay,T.DoubleSide,.06/scale,distance/scale)){
     hit.copy(intersection.point).applyMatrix4(mesh.matrixWorld);
     if(mesh.userData.templeInteriorClip?.contains(hit.x,hit.y,hit.z))continue;
     const d=from.distanceTo(hit);if(d>.06&&d<distance)distance=d;
    }
   }
   return distance<length?Math.max(.12,distance-padding):length;
  }
  return{clearDistance,meshes:entries.length,trees:unique.length,buildThread:mode};
 }};
})();
;
/* Independent solid interior. No triangles are copied from the uploaded temple. */
(function(){
 'use strict';
 const spec={version:1,id:'continuous-r3-inner-shell',innerBounds:{minX:-20,maxX:20,minZ:-15.55,maxZ:14.4},wallThickness:.24,roofThickness:.14,finishFloorY:-.012,wainscotY:1.25,corniceHeight:.28,portal:{id:'main-entry',centreX:0,width:9.6,height:8,fromZ:14.4,toZ:15.2},clip:{bounds:{minX:-20.12,maxX:20.12,minZ:-15.67,maxZ:14.52,minY:-.13},xProfile:[[-20.24,15.2702],[0,22],[20.24,15.2702]],zProfile:[[-15.79,15.30],[-15.67,15.35],[-13,16.65],[-12.7,16.65],[-11.5,22],[9.8,22],[11.3,16.5],[12.6,16.5],[14.64,15.35]],roofOffset:.07}};
 const copy=x=>JSON.parse(JSON.stringify(x));
 function interpolate(profile,t){for(let i=1;i<profile.length;i++)if(t<=profile[i][0]){const a=profile[i-1],b=profile[i];return a[1]+(b[1]-a[1])*(t-a[0])/(b[0]-a[0]);}const a=profile[profile.length-2],b=profile[profile.length-1];return a[1]+(b[1]-a[1])*(t-a[0])/(b[0]-a[0]);}
 const roofAt=(x,z)=>Math.min(interpolate(spec.clip.xProfile,x),interpolate(spec.clip.zProfile,z));
 function containsClipPoint(x,y,z){const b=spec.clip.bounds;return x>=b.minX&&x<=b.maxX&&z>=b.minZ&&z<=b.maxZ&&y>=b.minY&&y<=roofAt(x,z)+spec.clip.roofOffset;}
 function adornSideWalls(T,root,bounds){
  const positions=[],colours=[],indices=[],turn=2*Math.PI;
  const ochre=new T.Color(0xa08966),paleGold=new T.Color(0xb19b75);
  function arc(x,y,r,width,from=0,to=turn,colour=ochre){
   const first=positions.length/3,steps=Math.max(6,Math.ceil((to-from)*Math.max(4,r*8)));
   for(let i=0;i<=steps;i++){
    const a=from+(to-from)*i/steps,c=Math.cos(a),s=Math.sin(a);
    for(const radius of [Math.max(0,r-width/2),r+width/2]){
     positions.push(x+radius*c,y+radius*s,0);
     colours.push(colour.r,colour.g,colour.b);
    }
    if(i<steps){const k=first+i*2;indices.push(k,k+1,k+3,k,k+3,k+2);}
   }
  }
  // The overlapping circles form six lenses like a lotus carved with a compass.
  arc(0,0,2.38,.055);
  arc(0,0,2.28,.024,0,turn,paleGold);
  arc(0,0,1.63,.044);
  for(let i=0;i<6;i++){
   const a=i*turn/6,c=Math.cos(a),s=Math.sin(a);
   arc(.795*c,.795*s,.795,.036);
   arc(1.96*c,1.96*s,.148,.048);
   arc(0,0,2.57,.052,a+.10,a+turn/6-.10,paleGold);
  }
  arc(0,0,.135,.10,0,turn,paleGold);
  // Progressively smaller satellites leave the wall around the medallion open.
  for(const side of [-1,1]){
   arc(side*3.46,0,.60,.048);
   arc(side*3.46,0,.44,.031,0,turn,paleGold);
   arc(side*4.52,0,.15,.068);
   arc(side*5.02,0,.05,.1,0,turn,paleGold);
  }
  const geometry=new T.BufferGeometry();
  geometry.setAttribute('position',new T.Float32BufferAttribute(positions,3));
  geometry.setAttribute('color',new T.Float32BufferAttribute(colours,3));
  geometry.setIndex(indices);geometry.computeVertexNormals();geometry.computeBoundingSphere();
  const material=new T.MeshStandardMaterial({vertexColors:true,roughness:.95});
  material.name='Matte ochre and pale gold inlay';
  for(const [label,x,angle] of [['West',bounds.minX+.016,Math.PI/2],['East',bounds.maxX-.016,-Math.PI/2]]){
   const wall=root.getObjectByName(label+' continuous plaster'),inlay=new T.Mesh(geometry,material);
   inlay.name=label+' ceremonial wall inlay';inlay.userData.interiorDecoration=true;
   inlay.position.set(x,7.8,-3.4);inlay.rotation.y=angle;inlay.receiveShadow=true;
   wall.add(inlay);
  }
 }
 function liningMaterial(T,roof){
  const lining=roof.clone();
  lining.name='Quiet temple cedar soffit';
  lining.onBeforeCompile=(shader,renderer)=>{
   roof.onBeforeCompile.call(roof,shader,renderer);
   shader.uniforms.soffitCedar={value:new T.Color(0xbc9673)};
   shader.vertexShader='varying vec3 vSoffit;\n'+shader.vertexShader;
   shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>',
    '#include <begin_vertex>\nvSoffit=vec3(position.xz,-normal.y);');
   shader.fragmentShader='varying vec3 vSoffit; uniform vec3 soffitCedar;\n'+shader.fragmentShader;
   shader.fragmentShader=shader.fragmentShader.replace('#include <color_fragment>',`#include <color_fragment>
    if(vSoffit.z>0.01){
     vec2 board=vec2(vSoffit.x/0.74,vSoffit.y/4.85);
     board.y+=mod(floor(board.x),3.0)/3.0;
     vec2 edge=min(fract(board),1.0-fract(board));
     vec2 aa=max(fwidth(board),vec2(.0008));
     vec2 joint=1.0-smoothstep(vec2(.004),vec2(.004)+aa,edge);
     float tone=0.978+0.022*cos(floor(board.x)*2.31+floor(board.y)*.89);
     float endGrain=mix(0.44,1.0,smoothstep(0.26,0.82,vSoffit.z));
     diffuseColor.rgb=soffitCedar*endGrain*tone*(1.0-0.22*max(joint.x,joint.y));
    }`);
  };
  lining.customProgramCacheKey=()=>roof.customProgramCacheKey()+'-cedar-soffit-v1';
  return lining;
 }
 function addCedarRafters(T,root,bounds){
  const positions=[],colours=[];
  const edge=new T.Color(0x936a49),face=new T.Color(0xa57c55),step=new T.Color(0xb9936a);
  function quad(a,b,c,d,col){
   for(const pt of [a,b,d,b,c,d]){positions.push(...pt);colours.push(col.r,col.g,col.b);}
  }
  function band(x0,z0,x1,z1,width,top,depth){
   const length=Math.hypot(x1-x0,z1-z0),dx=(z1-z0)*width/(2*length),dz=(x0-x1)*width/(2*length);
   const corners=[[x0-dx,z0-dz],[x0+dx,z0+dz],[x1+dx,z1+dz],[x1-dx,z1-dz]];
   const points=drop=>corners.map(([x,z])=>[x,roofAt(x,z)-drop,z]);
   const a=points(top),b=points(top+depth);
   quad(b[0],b[1],b[2],b[3],face);
   for(let i=0;i<4;i++){const j=(i+1)%4;quad(a[i],a[j],b[j],b[i],top===0?step:edge);}
  }
  // Seven paired rafters lie against the long pitched faces below the ridge.
  for(const z of [-10.2,-7.05,-3.9,-.75,2.4,5.55,8.7]){
   for(const x of [bounds.minX,bounds.maxX]){
    band(0,z,x,z,.28,0,.055);
    band(0,z,x,z,.16,.055,.135);
   }
  }
  band(0,-11.45,0,9.75,.38,.17,.09);
  const g=new T.BufferGeometry();
  g.setAttribute('position',new T.Float32BufferAttribute(positions,3));
  g.setAttribute('color',new T.Float32BufferAttribute(colours,3));g.computeVertexNormals();g.computeBoundingSphere();
  const m=new T.Mesh(g,new T.MeshStandardMaterial({vertexColors:true,roughness:.94,side:T.DoubleSide}));
  m.name='Main hall paired cedar rafters and ridge';m.receiveShadow=true;m.userData.interiorDecoration=true;root.add(m);
 }
 function create(T,{parent,materials={},cameraBox,obstacle}={}){
  if(!parent)throw Error('Independent interior shell requires an authoring parent');
  const root=new T.Group();root.name='Continuous independent temple interior';parent.add(root);
  const material=(name,color)=>materials[name]||new T.MeshStandardMaterial({color,roughness:.94,side:T.DoubleSide});
  const plaster=material('plaster',0xc9bfae),wood=material('wood',0x443027),roof=liningMaterial(T,materials.roof||wood),redwood=material('redwood',0x623b30),meshes=[],prisms=[];
  function add(geometry,mat,name,role,record){geometry.computeVertexNormals();geometry.computeBoundingBox();geometry.computeBoundingSphere();const mesh=new T.Mesh(geometry,mat);mesh.name=name;mesh.userData.interiorShell=true;mesh.userData.role=role;mesh.castShadow=mesh.receiveShadow=true;root.add(mesh);meshes.push(mesh);if(record)prisms.push({...record,name,role});return mesh;}
  function wallProfile(axis,fixed,a,b){const profile=axis==='z'?spec.clip.xProfile:spec.clip.zProfile,constant=axis==='z'?interpolate(spec.clip.zProfile,fixed):interpolate(spec.clip.xProfile,fixed),samples=[a,b,...profile.map(p=>p[0]).filter(t=>t>a&&t<b)];
   for(let i=1;i<profile.length;i++){const p=profile[i-1],q=profile[i];if((p[1]-constant)*(q[1]-constant)<0){const t=p[0]+(q[0]-p[0])*(constant-p[1])/(q[1]-p[1]);if(t>a&&t<b)samples.push(t);}}
   return [...new Set(samples)].sort((a,b)=>a-b).map(t=>[t,axis==='z'?roofAt(t,fixed):roofAt(fixed,t)]);
  }
  function slab(axis,fixed,a,b,side,role,lower,upper,mat,name,portalEdge){const points=wallProfile(axis,fixed,a,b),bottom=points.map(([u,h])=>[u,typeof lower==='function'?lower(h):lower]),top=points.map(([u,h])=>[u,typeof upper==='function'?upper(h):upper]);if(top.some((p,i)=>p[1]-bottom[i][1]<.00001))throw Error('Invalid interior wall band '+name);
   const shape=new T.Shape();shape.moveTo(bottom[0][0],bottom[0][1]);for(const p of bottom.slice(1))shape.lineTo(...p);for(const p of top.slice().reverse())shape.lineTo(...p);shape.closePath();const geometry=new T.ExtrudeGeometry(shape,{depth:spec.wallThickness,bevelEnabled:false,steps:1,curveSegments:1}),p=geometry.attributes.position;
   for(let i=0;i<p.count;i++){const u=p.getX(i),y=p.getY(i),depth=p.getZ(i);if(axis==='z')p.setXYZ(i,u,y,fixed+side*depth);else p.setXYZ(i,fixed+side*depth,y,u);}
   if((axis==='z'&&side<0)||(axis==='x'&&side>0)){for(let i=0;i<p.count;i+=3)for(let k=0;k<3;k++){const t=p.array[(i+1)*3+k];p.array[(i+1)*3+k]=p.array[(i+2)*3+k];p.array[(i+2)*3+k]=t;}}
   const materials=portalEdge===undefined?mat:[mat,redwood];
   if(portalEdge!==undefined){
    geometry.clearGroups();
    let start=0,finish=0;
    for(let i=0;i<p.count;i+=3){
     const timber=[i,i+1,i+2].every(vertex=>Math.abs(p.getX(vertex)-portalEdge)<.0001)?1:0;
     if(timber===finish)continue;
     if(i>start)geometry.addGroup(start,i-start,finish);
     start=i;finish=timber;
    }
    geometry.addGroup(start,p.count-start,finish);
   }
   const mesh=add(geometry,materials,name,role,{axis,fixed,a,b,side,thickness:spec.wallThickness,profile:points,bottom,top});
   const minY=Math.min(...bottom.map(p=>p[1])),maxY=Math.max(...top.map(p=>p[1]));if(cameraBox){const centre=(a+b)/2;cameraBox(axis==='x'?spec.wallThickness:b-a,maxY-minY,axis==='x'?b-a:spec.wallThickness,axis==='x'?fixed+side*spec.wallThickness/2:centre,(minY+maxY)/2,axis==='x'?centre:fixed+side*spec.wallThickness/2,'Independent perimeter wall');}
   return mesh;
  }
  function wall(axis,fixed,a,b,side,prefix,bottom=spec.finishFloorY,portalEdge){
   if(bottom<spec.wainscotY){slab(axis,fixed,a,b,side,'wall',bottom,spec.wainscotY,wood,prefix+' timber wainscot',portalEdge);bottom=spec.wainscotY;}
   slab(axis,fixed,a,b,side,'wall',bottom,h=>h-spec.corniceHeight,plaster,prefix+' continuous plaster',portalEdge);slab(axis,fixed,a,b,side,'trim',h=>h-spec.corniceHeight,h=>h,wood,prefix+' joined roof cornice');
  }
  const b=spec.innerBounds,t=spec.wallThickness,half=spec.portal.width/2;
  wall('x',b.minX,b.minZ,b.maxZ,-1,'West');wall('x',b.maxX,b.minZ,b.maxZ,1,'East');wall('z',b.minZ,b.minX-t,b.maxX+t,-1,'Rear');
  wall('z',b.maxZ,b.minX-t,-half,1,'Front west',spec.finishFloorY,-half);wall('z',b.maxZ,half,b.maxX+t,1,'Front east',spec.finishFloorY,half);wall('z',b.maxZ,-half,half,1,'Front over-portal',spec.portal.height+.54);
  slab('z',b.maxZ,-half,half,1,'wall',spec.portal.height,spec.portal.height+.54,wood,'Front portal continuous timber head');
  function box(w,h,d,mat,x,y,z,name,role='trim',collision=false){const geometry=new T.BoxGeometry(w,h,d);geometry.translate(x,y,z);const mesh=add(geometry,mat,name,role,{kind:'box',size:[w,h,d],position:[x,y,z]});if(cameraBox)cameraBox(w,h,d,x,y,z,'Independent '+role);if(collision&&obstacle)obstacle(x,z,w/2,d/2,'内墙实体');return mesh;}
  // Rear skirting returns across the original 120mm floor-to-wall strip; no open foot gap.
  box(40,.20,.22,wood,0,.088,-15.44,'Rear continuous floor-to-wall skirting');
  // Deep, unbroken jamb and head returns bridge the inner wall to the existing door frame.
  // The wall extrusion already owns the first 240mm of the aperture reveal.
  // Start the timber returns at its outer face instead of laying a second
  // coplanar side/bottom face over the plaster end caps.
  const returnStart=spec.portal.fromZ+t,depth=spec.portal.toZ-returnStart,returnCentre=(returnStart+spec.portal.toZ)/2;
  const partBounds=name=>{const part=parent.getObjectByName(name);return part?new T.Box3().setFromObject(part):null;};
  const shoe=partBounds('Entry frame stone shoe -1'),collar=partBounds('Entry frame lower collar -1'),lintel=partBounds('Entry frame through lintel');
  const shoeTop=shoe?.max.y??.18,shoeBack=shoe?.min.z??spec.portal.toZ-.52,collarTop=collar?.max.y??.28,collarBack=collar?.min.z??spec.portal.toZ-.505,headBack=lintel?.min.z??spec.portal.toZ-.52;
  for(const side of[-1,1]){
   box(.04,8-collarTop,depth,redwood,side*(half+.02),(8+collarTop)/2,returnCentre,'Main portal full-depth jamb return '+side,'portalReturn');
   box(.04,collarTop-shoeTop,collarBack-returnStart,redwood,side*(half+.02),(collarTop+shoeTop)/2,(returnStart+collarBack)/2,'Main portal collar return '+side,'portalReturn');
   box(.04,shoeTop,shoeBack-returnStart,redwood,side*(half+.02),shoeTop/2,(returnStart+shoeBack)/2,'Main portal base return '+side,'portalReturn');
  }
  box(spec.portal.width,.10,headBack-returnStart,wood,0,8.05,(returnStart+headBack)/2,'Main portal full-depth head return','portalReturn');
  // Each convex roof patch is a solid closed prism. X/Z profile intersections are
  // explicitly split, so adjacent planar boards meet at exactly the same crease.
  function clip(poly,fn,positive){const out=[];for(let i=0;i<poly.length;i++){const a=poly[i],b=poly[(i+1)%poly.length],fa=fn(a),fb=fn(b),ina=positive?fa>=-1e-8:fa<=1e-8,inb=positive?fb>=-1e-8:fb<=1e-8;if(ina)out.push(a);if(ina!==inb){const ratio=fa/(fa-fb);out.push([a[0]+(b[0]-a[0])*ratio,a[1]+(b[1]-a[1])*ratio]);}}return out.filter((p,i)=>!i||Math.hypot(p[0]-out[i-1][0],p[1]-out[i-1][1])>1e-7);}
  const xp=spec.clip.xProfile,zp=spec.clip.zProfile,roofPatches=[];
  function roofPatch(poly){if(poly.length>1&&Math.hypot(poly[0][0]-poly[poly.length-1][0],poly[0][1]-poly[poly.length-1][1])<1e-7)poly.pop();let changed=true;while(changed&&poly.length>3){changed=false;for(let i=0;i<poly.length;i++){const a=poly[(i+poly.length-1)%poly.length],b=poly[i],c=poly[(i+1)%poly.length];if(Math.abs((b[0]-a[0])*(c[1]-b[1])-(b[1]-a[1])*(c[0]-b[0]))<1e-8){poly.splice(i,1);changed=true;break;}}}if(poly.length<3)return;let area=0;for(let i=0;i<poly.length;i++){const a=poly[i],b=poly[(i+1)%poly.length];area+=a[0]*b[1]-b[0]*a[1];}if(Math.abs(area)<1e-8)return;
   const bottom=poly.map(([x,z])=>[x,roofAt(x,z),z]),top=bottom.map(([x,y,z])=>[x,y+spec.roofThickness,z]),positions=[];
   const tri=(a,b,c)=>positions.push(...a,...b,...c);for(let i=1;i<poly.length-1;i++){tri(bottom[0],bottom[i],bottom[i+1]);tri(top[0],top[i+1],top[i]);}for(let i=0;i<poly.length;i++){const j=(i+1)%poly.length;tri(bottom[i],top[j],bottom[j]);tri(bottom[i],top[i],top[j]);}
   const geometry=new T.BufferGeometry();geometry.setAttribute('position',new T.Float32BufferAttribute(positions,3));geometry.setAttribute('uv',new T.Float32BufferAttribute(positions.flatMap((_,i)=>i%3===0?[positions[i]/3,positions[i+2]/3]:[]),2));const id=roofPatches.length;add(geometry,roof,'Independent planar roof board '+id,'roof',{kind:'roofPrism',polygon:poly,thickness:spec.roofThickness});roofPatches.push(poly);
  }
  for(let xi=1;xi<xp.length;xi++)for(let zi=1;zi<zp.length;zi++){const rect=[[xp[xi-1][0],zp[zi-1][0]],[xp[xi][0],zp[zi-1][0]],[xp[xi][0],zp[zi][0]],[xp[xi-1][0],zp[zi][0]]],fn=p=>interpolate(xp,p[0])-interpolate(zp,p[1]),values=rect.map(fn);if(values.every(v=>Math.abs(v)<1e-8))roofPatch(rect);else{roofPatch(clip(rect,fn,false));roofPatch(clip(rect,fn,true));}}
  if(obstacle){obstacle(-20.12,(b.minZ+b.maxZ)/2,.12,(b.maxZ-b.minZ)/2,'西侧完整内墙');obstacle(20.12,(b.minZ+b.maxZ)/2,.12,(b.maxZ-b.minZ)/2,'东侧完整内墙');obstacle(0,-15.67,20.24,.12,'后侧完整内墙');for(const side of[-1,1]){const a=side<0?-20.24:half,c=side<0?-half:20.24;obstacle((a+c)/2,14.52,(c-a)/2,.12,'前侧完整内墙');}}
  adornSideWalls(T,root,b);
  addCedarRafters(T,root,b);
  root.updateMatrixWorld(true);
  const state={ready:true,independentGeometry:true,sourceTrianglesCopied:0,wallCount:6,roofPatches:roofPatches.length,meshCount:meshes.length,clearWidth:spec.portal.width,clearHeight:spec.portal.height,wallThickness:spec.wallThickness,roofThickness:spec.roofThickness};
  return {root,meshes,prisms,spec:copy(spec),envelope:getClipEnvelope(),roofAt,containsClipPoint,roofPatches:roofPatches.length,wallCount:6,portal:copy(spec.portal),state,report:state,scope:'New independent closed prisms, not a copy of the source interior triangles'};
 }
 const getClipEnvelope=()=>copy(spec.clip);
 window.TempleInteriorShell={spec:copy(spec),getClipEnvelope,roofAt,containsClipPoint,create};
})();
;
/* Clean, source-independent interior finishes. Geometry and original atlas stay intact. */
(function(){
 'use strict';
 const PALETTE={plaster:0xc9bfae,wood:0x443027,redwood:0x623b30,roof:0x433027};
 function create(T){
  function finish(role,colour,wooden=false,banded=false){
   const material=new T.MeshStandardMaterial({color:colour,roughness:wooden?.88:.98,metalness:0,side:T.DoubleSide});
   material.name='Quiet temple clean '+role;
   material.userData.templeFinish={version:1,palette:'warm-plaster-dark-timber',role,procedural:true,sourceAtlas:false};
   material.onBeforeCompile=shader=>{
    shader.uniforms.templeWoodColour={value:new T.Color(PALETTE.wood)};
    shader.uniforms.templeRoofColour={value:new T.Color(PALETTE.roof)};
    shader.vertexShader='varying vec3 vTempleFinishPosition;\nvarying vec3 vTempleFinishNormal;\n'+shader.vertexShader;
    shader.vertexShader=shader.vertexShader.replace('#include <project_vertex>',`#include <project_vertex>
      vec4 templeFinishPoint=vec4(transformed,1.0);
      vec3 templeFinishNormal=objectNormal;
      #ifdef USE_INSTANCING
       templeFinishPoint=instanceMatrix*templeFinishPoint;
       templeFinishNormal=mat3(instanceMatrix)*templeFinishNormal;
      #endif
      vTempleFinishPosition=(modelMatrix*templeFinishPoint).xyz;
      vTempleFinishNormal=normalize(mat3(modelMatrix)*templeFinishNormal);`);
    shader.fragmentShader='varying vec3 vTempleFinishPosition;\nvarying vec3 vTempleFinishNormal;\nuniform vec3 templeWoodColour;\nuniform vec3 templeRoofColour;\n'+shader.fragmentShader;
    shader.fragmentShader=shader.fragmentShader.replace('#include <color_fragment>',`#include <color_fragment>
      vec3 templeP=vTempleFinishPosition;
      vec3 templeN=abs(normalize(vTempleFinishNormal));
      vec2 templeGrain=templeN.y>.55?templeP.xz:(templeN.x>.55?templeP.zy:templeP.xy);
      float templeTimber=${wooden?'1.0':'0.0'};
      ${banded?`if(templeP.y<1.25){diffuseColor.rgb=templeWoodColour;templeTimber=1.0;}
      else if(templeP.y>14.1){diffuseColor.rgb=templeRoofColour;templeTimber=1.0;}`:''}
      float templeFine=sin(templeGrain.x*42.0+sin(templeGrain.y*1.7)*.7);
      float templeBroad=sin(templeGrain.x*7.0+sin(templeGrain.y*.43)*.6);
      float templePlaster=sin(templeP.x*4.7+sin(templeP.y*3.1))*sin(templeP.z*4.1+templeP.y*2.9);
      diffuseColor.rgb*=mix(1.0+templePlaster*.009,1.0+templeFine*.018+templeBroad*.022,templeTimber);`);
   };
   material.customProgramCacheKey=()=>`temple-clean-finish-v1-${role}-${wooden?1:0}-${banded?1:0}`;
   return material;
  }
  // The attached source walls include carved relief. Treat the entire relief as
  // timber rather than painting its irregular fragments white. Warm plaster is
  // reserved for the new, planar room walls authored in world.js.
  const plaster=finish('plaster',PALETTE.plaster),wood=finish('wood',PALETTE.wood,true),redwood=finish('redwood',PALETTE.redwood,true),roof=finish('roof',PALETTE.roof,true),wall=finish('wall',PALETTE.redwood,true,true);
  function applyLining(geometry,kind){
   geometry.userData.templeInteriorFinish={kind,sourceGeometryRetained:true};
   return kind==='roof'?roof:wall;
  }
  function applySourceShell(geometry,sourceMaterial,options={}){
   const shell=window.TempleInteriorShell,envelope=options.envelope??shell?.getClipEnvelope?.(),index=geometry.index;
   if(!index)throw Error('Temple source shell must retain its original indexed topology');
   if(!envelope)throw Error('The rebuilt interior shell must provide its static clip envelope');
   const bounds=envelope.bounds??envelope.clipBounds,xProfile=envelope.xProfile,zProfile=envelope.zProfile,roofOffset=envelope.roofOffset??.07;
   const finite=Number.isFinite;
   if(!bounds||!['minX','maxX','minZ','maxZ','minY'].every(k=>finite(bounds[k]))||!(bounds.maxX>bounds.minX&&bounds.maxZ>bounds.minZ))throw Error('Invalid interior clip bounds');
   for(const profile of[xProfile,zProfile])if(!Array.isArray(profile)||profile.length<2||profile.some((p,i)=>!Array.isArray(p)||p.length!==2||!p.every(finite)||(i>0&&p[0]<=profile[i-1][0])))throw Error('Invalid interior clip roof profile');
   if(!finite(roofOffset))throw Error('Invalid interior clip roof offset');
   const floorCutoff=options.floorCutoff??null;
   if(floorCutoff!==null&&!finite(floorCutoff))throw Error('Invalid source foundation cutoff');
   const cutouts=options.cutouts??[];
   if(cutouts.some(b=>b.length!==6||!b.every(finite)||b[1]<=b[0]||b[3]<=b[2]||b[5]<=b[4]))throw Error('Invalid source replacement cutout');
   const spec={bounds:{...bounds},xProfile:xProfile.map(p=>[...p]),zProfile:zProfile.map(p=>[...p]),roofOffset,...(floorCutoff===null?{}:{floorCutoff}),...(cutouts.length?{cutouts}:{} )};
   const profileAt=(profile,v)=>{if(v<=profile[0][0])return profile[0][1];for(let i=1;i<profile.length;i++)if(v<=profile[i][0]){const a=profile[i-1],b=profile[i],t=(v-a[0])/(b[0]-a[0]);return a[1]+(b[1]-a[1])*t;}return profile[profile.length-1][1];};
   const roofAt=(x,z)=>Math.min(profileAt(spec.xProfile,x),profileAt(spec.zProfile,z));
   const containsByProfile=(x,y,z)=>(floorCutoff!==null&&y<floorCutoff)||(x>=bounds.minX&&x<=bounds.maxX&&z>=bounds.minZ&&z<=bounds.maxZ&&y>=bounds.minY&&y<=roofAt(x,z)+roofOffset);
   // Production rays use the geometry owner's predicate. Profile parity is
   // independently checked so this CPU query and all three shaders agree.
   const baseContains=options.containsPoint??(!options.envelope&&shell?.containsClipPoint?(x,y,z)=>shell.containsClipPoint(x,y,z):containsByProfile);
   const contains=(x,y,z)=>(floorCutoff!==null&&y<floorCutoff)||cutouts.some(b=>x>=b[0]&&x<=b[1]&&y>=b[2]&&y<=b[3]&&z>=b[4]&&z<=b[5])||baseContains(x,y,z);
   const number=n=>Number(n).toFixed(9),profileCode=(name,profile)=>{
    let code=`float ${name}(float v){\n if(v<=${number(profile[0][0])})return ${number(profile[0][1])};\n`;
    for(let i=1;i<profile.length;i++){const a=profile[i-1],b=profile[i];code+=` if(v<=${number(b[0])})return mix(${number(a[1])},${number(b[1])},clamp((v-(${number(a[0])}))/${number(b[0]-a[0])},0.0,1.0));\n`;}
    return code+` return ${number(profile[profile.length-1][1])};\n}\n`;
   };
   const glsl=profileCode('templeSourceRoofX',spec.xProfile)+profileCode('templeSourceRoofZ',spec.zProfile)+`bool templeSourceIsRetired(vec3 p){
    ${floorCutoff!==null?`if(p.y<${number(floorCutoff)})return true;`:''}
    ${cutouts.map(b=>`if(p.x>=${number(b[0])}&&p.x<=${number(b[1])}&&p.y>=${number(b[2])}&&p.y<=${number(b[3])}&&p.z>=${number(b[4])}&&p.z<=${number(b[5])})return true;`).join('\n')}
    if(p.x<${number(bounds.minX)}||p.x>${number(bounds.maxX)}||p.z<${number(bounds.minZ)}||p.z>${number(bounds.maxZ)}||p.y<${number(bounds.minY)})return false;
    return p.y<=min(templeSourceRoofX(p.x),templeSourceRoofZ(p.z))+${number(roofOffset)};
   }\n`;
   const report={version:3,mode:'static-world-envelope',triangleCount:index.count/3,envelope:spec,positionAndNormalsRetained:true,sourceUVRetained:true,sourceIndexRetained:true,sourceAtlasMaterialIndex:0,sourceAtlasSide:'DoubleSide',classification:'Only fragments of the old temple inside the new sealed shell are discarded; outside atlas, island and all other assets stay unchanged; no camera-dependent hiding',shadowParity:'The same world-space predicate is injected into standard, depth and distance shaders'};
   const inject=material=>{
    material.userData.templeSourceClip={mode:report.mode,envelope:spec,glsl};
    material.onBeforeCompile=shader=>{
     shader.vertexShader='varying vec3 vTempleSourceClipPosition;\n'+shader.vertexShader;
     if(!shader.vertexShader.includes('#include <project_vertex>'))throw Error('Source clip vertex injection point missing');
     shader.vertexShader=shader.vertexShader.replace('#include <project_vertex>',`#include <project_vertex>
      vec4 templeSourceClipPoint=vec4(transformed,1.0);
      #ifdef USE_INSTANCING
       templeSourceClipPoint=instanceMatrix*templeSourceClipPoint;
      #endif
      vTempleSourceClipPosition=(modelMatrix*templeSourceClipPoint).xyz;`);
     shader.fragmentShader='varying vec3 vTempleSourceClipPosition;\n'+glsl+shader.fragmentShader;
     if(!/void main\s*\(\s*\)\s*\{/.test(shader.fragmentShader))throw Error('Source clip fragment injection point missing');
     shader.fragmentShader=shader.fragmentShader.replace(/void main\s*\(\s*\)\s*\{/,match=>match+'\n if(templeSourceIsRetired(vTempleSourceClipPosition))discard;\n');
    };
    material.customProgramCacheKey=()=>`temple-retired-source-v3-${JSON.stringify(spec)}`;
    material.needsUpdate=true;return material;
   };
   sourceMaterial.side=T.DoubleSide;inject(sourceMaterial);
   const depthMaterial=inject(new T.MeshDepthMaterial({depthPacking:T.RGBADepthPacking,side:T.DoubleSide})),distanceMaterial=inject(new T.MeshDistanceMaterial({side:T.DoubleSide}));
   geometry.clearGroups();geometry.addGroup(0,index.count,0);geometry.userData.templeInteriorFinish=report;
   return {geometry,materials:[sourceMaterial],report,depthMaterial,distanceMaterial,clip:{spec,contains,containsByProfile,roofAt,glsl}};
  }
  return {palette:{...PALETTE},plaster,wood,redwood,roof,wall,applyLining,applySourceShell};
 }
 window.TempleInteriorFinish={create,palette:{...PALETTE}};
})();
;
/* Measured, open timber door lining. Original portal and uploaded mesh are retained. */
(function(){
 'use strict';
 // Bounds for the new head and its two outside reveals. The same dimensions
 // drive the rendered wood and the retired fragments of the scanned facade.
 function replacements(opening){
  const half=opening.clearWidth/2,y=opening.clearHeight,z=opening.centre[2],width=opening.clearWidth;
  const revealWidth=3.6,revealX=half+.59+revealWidth/2;
  return [
   {name:'solid upper frieze',size:[width+1.16,1,1.82],centre:[0,y+1.04,z+.045],finish:'wood'},
   {name:'frieze cap',size:[width+1.28,.09,1.91],centre:[0,y+1.585,z+.045],finish:'edge'},
   ...[-1,1].map(side=>({name:'outer jamb casing '+side,size:[.18,y+.552,1.26],
    centre:[side*(half+.52),(y+.528)/2,z+.025],finish:'wood'})),
   ...[-1,1].flatMap(side=>[
    {name:'stone reveal plinth '+side,size:[revealWidth,.48,.96],centre:[side*revealX,.228,z-.19],finish:'stone'},
    {name:'solid timber reveal '+side,size:[revealWidth,y-.48,.90],centre:[side*revealX,(y+.456)/2,z-.19],finish:'wood'}
   ])
  ];
 }
 function sourceCutouts(opening){
  return replacements(opening).map(p=>{
   const [x,y,z]=p.centre,[w,h,d]=p.size,margin=.0015;
   return [x-w/2-margin,x+w/2+margin,y-h/2-margin,y+h/2+margin,z-d/2-margin,z+d/2+margin];
  });
 }
 window.TempleEntryFrame={sourceCutouts,create(T,{parent,opening,materials={},cameraBox,obstacle}={}){
  if(!parent)throw Error('Main entry frame requires an interior parent');
  const portal=opening||window.TempleNavigation.templeSceneLayout.openings.find(o=>o.id==='main-entry');
  const half=portal.clearWidth/2,top=portal.clearHeight,entryZ=portal.centre[2],z=entryZ;
  const root=new T.Group();root.name='Measured open main-entry timber frame';root.userData.openingId=portal.id;parent.add(root);
  const material=(key,color,roughness=.82,metalness=0)=>materials[key]||new T.MeshStandardMaterial({color,roughness,metalness});
  const timber=material('redwood',0x633b2e),edge=material('darkwood',0x32251d),gold=material('bronze',0x9c8050,.64,.35),stone=material('entryStone',0x938b78,.96);
  const solids=[],unit=new T.BoxGeometry(1,1,1);
  function part(name,w,h,d,mat,x,y,pz,collision=false){
   const o=new T.Mesh(unit,mat);o.name='Entry frame '+name;o.scale.set(w,h,d);o.position.set(x,y,pz);o.castShadow=o.receiveShadow=true;o.userData.entryFrame=true;root.add(o);
   const record={name:o.name,size:[w,h,d],position:[x,y,pz],collision};solids.push(record);
   if(cameraBox&&y+h/2>0)cameraBox(w,h,d,x,y,pz,'Main entry frame');
   if(collision&&obstacle)obstacle(x,pz,w/2,d/2,'正门木作门柱');
   return o;
  }
  // Narrow structural jambs occupy the measured clear gap before the retained
  // source carving (source starts at |x| ~5.376m). Their trim stops at |x|5.32m.
  for(const side of[-1,1]){
   const x=side*(half+.26);
   part('stone shoe '+side,.52,.192,1.04,stone,x,.084,z,true);
   part('jamb '+side,.44,top-.18,.94,timber,x,(top+.18)/2,z,true);
   part('lower collar '+side,.52,.10,1.01,edge,x,.23,z);
   part('capital '+side,.52,.20,1.04,edge,x,top+.10,z);
   for(const face of[-1,1]){
    const faceZ=z+face*.487;
    part('jamb face '+side+' '+face,.28,top-.68,.04,timber,x,top/2+.12,faceZ);
    // Recess-like dark margins give the face a readable raised timber centre;
    // the warm metal is limited to the two base/capital lines.
    for(const s of[-1,1])part('jamb quirk '+side+' '+face+' '+s,.018,top-.73,.046,edge,x+s*.155,top/2+.12,faceZ);
    part('shoe bead '+side+' '+face,.39,.022,.025,gold,x,.29,faceZ+.025*face);
    part('capital bead '+side+' '+face,.43,.022,.025,gold,x,top-.055,faceZ+.025*face);
   }
  }
  // All lintel volumes begin at or above the contracted 8m clear head height.
  // Through lintel + two returns gives a real deep reveal, not a sign over a wall.
  part('through lintel',portal.clearWidth+1.04,.42,1.04,edge,0,top+.21,z);
  for(const face of[-1,1]){
   const faceZ=z+face*.555;
   part('lintel fascia '+face,portal.clearWidth+1.04,.28,.07,timber,0,top+.22,faceZ);
   part('lintel lower quirk '+face,portal.clearWidth+.92,.035,.08,edge,0,top+.052,faceZ);
   part('lintel gold bead '+face,portal.clearWidth+.84,.018,.018,gold,0,top+.36,faceZ+.045*face);
  }
  part('crown rail',portal.clearWidth+1.04,.12,1.12,timber,0,top+.48,z);
  // Rebuilt timber and stone finish the heads and sides of the original portal.
  for(const p of replacements(portal)){
   part(p.name,...p.size,p.finish==='edge'?edge:p.finish==='stone'?stone:timber,...p.centre);
  }
  // Seat the room-side casing on the wall face and carry its inner bead
  // continuously around both jambs and the underside of the frieze.
  const roomFace=window.TempleInteriorShell?.spec.portal.fromZ??z-.8;
  const casingWidth=.58,casingDepth=.008,baseY=-.012,headY=top+.54;
  const roomZ=roomFace-casingDepth/2,trimZ=roomFace-casingDepth-.0009;
  const beadInset=.074,beadSize=.027,beadY=top+.076,footTop=.27;
  for(const side of[-1,1]){
   const x=side*(half+casingWidth/2);
   part('hall casing foot '+side,casingWidth,footTop-baseY,casingDepth,edge,x,(baseY+footTop)/2,roomZ,true);
   part('hall casing jamb '+side,casingWidth,headY-footTop,casingDepth,timber,x,(footTop+headY)/2,roomZ);
   part('hall casing outer moulding '+side,.048,headY-footTop,.0018,edge,side*(half+casingWidth-.035),(footTop+headY)/2,trimZ);
   part('hall casing inner bead '+side,beadSize,beadY-beadSize/2-footTop,.0018,gold,side*(half+beadInset),
     (beadY-beadSize/2+footTop)/2,trimZ);
  }
  part('hall casing head',portal.clearWidth,.54,casingDepth,timber,0,top+.27,roomZ);
  part('hall casing head bead',portal.clearWidth+beadInset*2+beadSize,beadSize,.0018,gold,0,beadY,trimZ);
  // Flush threshold. Its top is the existing -12mm finished floor; it adds no step.
  part('flush stone sill',portal.clearWidth,.012,.80,stone,0,-.018,entryZ-.40);
  // The sill is one solid finish; coplanar edge strips caused moving stripes.
  root.userData.clearWidth=portal.clearWidth;root.userData.clearHeight=top;root.userData.thresholdY=portal.thresholdY;
  root.userData.sourceRelation='Freestanding door lining inside the retained source portal; no new door leaf';
  root.updateMatrixWorld(true);
  return{
   root,solids,clearWidth:portal.clearWidth,clearHeight:top,thresholdY:portal.thresholdY,openingId:portal.id,
   roomSideOuterHalfWidth:half+casingWidth,roomSideFaceZ:roomFace-casingDepth
  };
 }};
})();
;
(function () {
  'use strict';
  const sources = {
    timber:'assets/finish-nanmu.webp',
    lacquer:'assets/finish-jade-lacquer.webp',
    stone:'assets/finish-bluestone.webp',
    plaster:'assets/finish-limewash.webp',
    dragons:'assets/finish-dragon-caisson.webp',
    relief:'assets/finish-dragon-relief.webp',
    altar:'assets/altar-buddha-panels.webp',
    wealth:'assets/altar-wealth-panel.webp',
    couplets:'assets/main-hall-couplets.webp'
  };
  const requests = new Map();

  function load(T, finish) {
    if (!requests.has(finish)) {
      requests.set(finish, window.TempleAssets.texture(T, sources[finish]).then(texture => {
        texture.colorSpace = finish === 'relief' ? T.NoColorSpace : T.SRGBColorSpace;
        texture.anisotropy = 4;
        return texture;
      }).catch(error => {
        requests.delete(finish);
        throw error;
      }));
    }
    return requests.get(finish);
  }

  function apply(T, material, finish, {repeat=1, tint=0xffffff, bump=.018, roughness=material.roughness}={}) {
    return load(T, finish).then(base => {
      const texture = base.clone();
      texture.wrapS = texture.wrapT = T.RepeatWrapping;
      texture.repeat.set(repeat, repeat);
      texture.needsUpdate = true;
      material.color.set(tint);
      material.map = texture;
      material.bumpMap = texture;
      material.bumpScale = bump;
      material.roughness = roughness;
      material.needsUpdate = true;
      return true;
    }).catch(() => false);
  }

  function floor(T, material, canvas) {
    return load(T, 'timber').then(timber => {
      const context = canvas.getContext('2d');
      context.save();
      context.globalCompositeOperation = 'soft-light';
      context.globalAlpha = .80;
      context.drawImage(timber.image, 0, 0, canvas.width, canvas.height);
      context.restore();
      material.map.needsUpdate = true;
      material.bumpMap = material.map;
      material.bumpScale = .035;
      material.roughness = .47;
      material.needsUpdate = true;
      return true;
    }).catch(() => false);
  }

  function caissonPlaque(T, material) {
    return Promise.all([load(T,'dragons'),load(T,'relief')]).then(([color, height]) => {
      material.color.set(0xffffff);
      material.map = color;
      material.bumpMap = height;
      material.bumpScale = .072;
      material.metalnessMap = height;
      material.metalness = .32;
      material.needsUpdate = true;
      return height;
    }).catch(() => null);
  }

  function altarPanel(T, material, finish) {
    return load(T,finish).then(texture=>{
      material.color.set(0xf5ead6);
      material.map=material.bumpMap=material.emissiveMap=texture;
      material.bumpScale=finish==='wealth'?.023:.035;
      material.emissive.set(0xc69858);
      material.emissiveIntensity=.16;
      material.needsUpdate=true;
      return true;
    }).catch(()=>false);
  }
  window.TempleFinishes = {apply,floor,caissonPlaque,altarPanel,load};
})();
;
(function () {
  'use strict';
  const centerZ = .20;
  const bayHalf = 5.86;
  const tiers = [
    {outer:5.04, inner:4.44, low:15.12, high:15.88},
    {outer:4.44, inner:3.78, low:15.88, high:16.70},
    {outer:3.78, inner:3.14, low:16.70, high:17.58},
    {outer:3.14, inner:2.59, low:17.58, high:18.38}
  ];
  const points = Array.from({length:8}, (_, index) => {
    const angle = Math.PI/8 + index*Math.PI/4;
    return [Math.cos(angle),Math.sin(angle)];
  });

  const pavilionPalette={
    tea:{
      coffer:0xd4ad66,timber:0xad8046,accent:0xe0bf81,gold:0xf0cc80,plaque:0x856033,
      frieze:['#ad7840','#f0d69d','#6e4e2f','#f7d88f','#ffe6af'],
      panel:['#f1d498','#b6884c','#765134','#c39252','#f4d899','#e7ca94','#b3834e','#d6ad71']
    },
    scripture:{
      coffer:0xc9ad83,timber:0x9a7853,accent:0xe0caab,gold:0xc29d64,plaque:0x596657,
      frieze:['#b39775','#ead5b1','#6c7766','#f3deb3','#e3cca3'],
      panel:['#e4d6b9','#b99d79','#82674f','#b29673','#e9d2a5','#b3ad92','#b59670','#77816b']
    }
  };

  function fretwork(T, [ground,edge,cloud,line,bead]=['#633b32','#9b6944','#283d34','#c49b5b','#c19353']) {
    const canvas = document.createElement('canvas');
    canvas.width=640; canvas.height=96;
    const context=canvas.getContext('2d');
    context.fillStyle=ground;
    context.fillRect(0,0,640,96);
    context.fillStyle=edge;
    context.fillRect(0,4,640,3);
    context.fillRect(0,89,640,3);
    for(let x=40;x<640;x+=80){
      context.beginPath();
      context.moveTo(x-31,68);
      context.bezierCurveTo(x-16,67,x-19,40,x,23);
      context.bezierCurveTo(x+19,40,x+16,67,x+31,68);
      context.bezierCurveTo(x+22,55,x+11,68,x+6,76);
      context.lineTo(x-6,76);
      context.bezierCurveTo(x-11,68,x-22,55,x-31,68);
      context.fillStyle=cloud;
      context.fill();
      context.strokeStyle=line;
      context.lineWidth=2;
      context.stroke();
      context.fillStyle=bead;
      context.beginPath();
      context.ellipse(x,52,3,7,0,0,Math.PI*2);
      context.fill();
    }
    const texture=new T.CanvasTexture(canvas);
    texture.colorSpace=T.SRGBColorSpace;
    texture.wrapS=T.RepeatWrapping;
    texture.anisotropy=4;
    return texture;
  }

  function paintedPanels(T, [center,edge,outer,rim,gold,line,petal,leaf]=['#3b574c','#1a302d','#332321','#875143','#b39560','#6e8876','#916052','#617d6a']) {
    const canvas=document.createElement('canvas');
    canvas.width=canvas.height=512;
    const context=canvas.getContext('2d');
    const dye=context.createRadialGradient(256,256,40,256,256,360);
    dye.addColorStop(0,center);
    dye.addColorStop(1,edge);
    context.fillStyle=dye;
    context.fillRect(0,0,512,512);
    context.strokeStyle='#0e211f26';
    context.lineWidth=1;
    for(let x=3;x<512;x+=5){
      context.beginPath();context.moveTo(x,0);
      context.bezierCurveTo(x+8,110,x-10,350,x+2,512);context.stroke();
    }
    for(const [inset,color,width] of [[7,outer,14],[16,rim,8],[26,gold,2],[36,line,2]]){
      context.strokeStyle=color;context.lineWidth=width;
      context.strokeRect(inset,inset,512-2*inset,512-2*inset);
    }
    context.translate(256,256);
    context.strokeStyle='#ad8b54';
    context.lineWidth=2;
    for(const radius of [48,133,147]){
      context.beginPath();context.arc(0,0,radius,0,2*Math.PI);context.stroke();
    }
    for(let i=0;i<8;i++){
      context.save();
      context.rotate(i*Math.PI/4);
      context.beginPath();context.moveTo(0,-17);
      context.bezierCurveTo(-45,-49,-27,-89,0,-125);
      context.bezierCurveTo(27,-89,45,-49,0,-17);
      context.fillStyle=i%2?petal:leaf;
      context.fill();context.stroke();
      context.beginPath();context.moveTo(0,-32);context.quadraticCurveTo(-12,-71,0,-110);
      context.stroke();
      context.restore();
    }
    context.fillStyle='#ad8855';context.beginPath();context.arc(0,0,11,0,2*Math.PI);context.fill();
    const texture=new T.CanvasTexture(canvas);
    texture.colorSpace=T.SRGBColorSpace;
    texture.anisotropy=4;
    return texture;
  }

  function bracketProfile(T) {
    // Irregular lipped arms catch the light at the same edges as carved wood.
    const shape=new T.Shape();
    shape.moveTo(-.5,.39);shape.lineTo(.5,.39);shape.lineTo(.5,.25);
    shape.bezierCurveTo(.27,.24,.24,.03,.10,0);
    shape.lineTo(-.10,0);
    shape.bezierCurveTo(-.24,.03,-.27,.24,-.5,.25);
    shape.closePath();
    const geometry=new T.ExtrudeGeometry(shape,{
      depth:1, curveSegments:4, bevelEnabled:true, bevelSize:.024, bevelThickness:.024, bevelSegments:1
    });
    geometry.translate(0,-.19,-.5);
    return geometry;
  }

  function plaqueGeometry(T, radius) {
    const along=8, segments=8*along, rings=40;
    const positions=[0,0,0],uv=[.5,.5],index=[];
    for(let ring=1;ring<=rings;ring++){
      for(let sample=0;sample<segments;sample++){
        const side=Math.floor(sample/along), fraction=(sample%along)/along;
        const a=points[side],b=points[(side+1)%8];
        const x=(a[0]+(b[0]-a[0])*fraction)*ring/rings;
        const y=(a[1]+(b[1]-a[1])*fraction)*ring/rings;
        positions.push(x*radius,y*radius,0);
        uv.push(x/2+.5,y/2+.5);
        const next=(sample+1)%segments, start=1+(ring-1)*segments;
        if(ring===1)index.push(0,start+sample,start+next);
        else index.push(start-segments+sample,start+sample,start+next,start-segments+sample,start+next,start-segments+next);
      }
    }
    const geometry=new T.BufferGeometry();
    geometry.setIndex(index);
    geometry.setAttribute('position',new T.Float32BufferAttribute(positions,3));
    geometry.setAttribute('uv',new T.Float32BufferAttribute(uv,2));
    geometry.computeVertexNormals();
    return geometry;
  }

  function sculptRelief(panel, heightTexture) {
    const canvas=document.createElement('canvas');
    const size=256;
    canvas.width=canvas.height=size;
    const context=canvas.getContext('2d',{willReadFrequently:true});
    context.drawImage(heightTexture.image,0,0,size,size);
    const pixels=context.getImageData(0,0,size,size).data;
    const {position,uv}=panel.geometry.attributes;
    for(let i=0;i<position.count;i++){
      const x=Math.round(uv.getX(i)*(size-1)),y=Math.round((1-uv.getY(i))*(size-1));
      position.setZ(i,.145*pixels[(y*size+x)*4]/255);
    }
    position.needsUpdate=true;
    panel.geometry.computeVertexNormals();
    panel.geometry.computeBoundingSphere();
  }

  function create(T, world, pavilion=null) {
    const root = new T.Group();
    root.name=pavilion?(pavilion.id==='scripture'?'Scripture library':'Wealth pavilion')+' octagonal dragon ceiling':'Main hall octagonal dragon caisson';
    const first=tiers[0],planScale=.96,heightScale=.80;
    let halfX=0,halfZ=0;
    if(pavilion){
      const [a,b,c,d]=pavilion.bounds;
      halfX=((b-a)/2-.11)/planScale;
      halfZ=((d-c)/2-.11)/planScale;
      root.scale.set(planScale,heightScale,planScale);
      root.position.set(pavilion.x,pavilion.ceilingY-first.low*heightScale,(c+d)/2);
    }else root.position.z=centerZ;
    world.interiorRoot.add(root);
    const finish = window.TempleFinishes;
    const palette=pavilionPalette[pavilion?.id];
    const physical=(color,roughness,metalness=0)=>new T.MeshStandardMaterial({color,roughness,metalness});
    const jade=physical(palette?.coffer??0x294238,.59,.10);
    const timber=physical(palette?.timber??0x402a22,.61,.05);
    const red=physical(palette?.accent??0x6d3530,.63,.04);
    const gold=physical(palette?.gold??0xa77b44,.46,.47);
    const plaque=physical(palette?.plaque??0x213e34,.66,.18);
    const frieze=physical(0xf1d4ac,.72,.09);
    const painted=physical(0xe3d7ba,.73,.06);
    frieze.map=fretwork(T,palette?.frieze);
    painted.map=paintedPanels(T,palette?.panel);
    const state={tiers:tiers.length,brackets:0,triangleCount:0,drawCalls:0,plaqueLoaded:false};
    const strips=new Map();
    const section=(radius,height,index)=>[points[index][0]*radius,height,points[index][1]*radius];
    function face(material, corners, uv) {
      let data=strips.get(material);
      if(!data)strips.set(material,data={positions:[],uv:[]});
      for(let i=1;i<corners.length-1;i++){
        for(const index of [0,i,i+1]){
          data.positions.push(...corners[index]);data.uv.push(...uv[index]);
        }
      }
    }
    function strip(material, r0,y0,r1,y1, repeats=1) {
      for(let side=0;side<8;side++){
        const next=(side+1)%8;
        face(material,[section(r0,y0,side),section(r0,y0,next),section(r1,y1,next),section(r1,y1,side)],
          [[0,0],[repeats,0],[repeats,1],[0,1]]);
      }
    }
    strip(timber,first.outer+.16,first.low+.21,first.outer+.16,first.low-.08);
    strip(timber,first.outer+.16,first.low-.08,first.outer-.18,first.low-.08);
    strip(gold,first.outer-.19,first.low-.083,first.outer-.23,first.low-.082);
    for(const {outer,inner,low,high} of tiers) {
      strip(jade,outer-.02,low,inner,high-.08,3);
      strip(red,outer+.025,low-.12,outer+.025,low+.085);
      strip(frieze,outer-.035,low+.066,outer-.25,low+.30);
      strip(gold,inner+.085,high-.17,inner+.049,high-.14);
      strip(timber,inner+.049,high-.14,inner,high);
    }
    const plateRadius=tiers.at(-1).inner;
    const plateHeight=tiers.at(-1).high;
    strip(gold,plateRadius+.045,plateHeight-.035,plateRadius-.09,plateHeight-.022);
    // Four painted spandrels close the space between the octagon and its square beam bay.
    const soffitY=first.low-.079;
    for(let side=0;side<8;side++){
      const next=(side+1)%8;
      const a=section(first.outer+.155,soffitY,side),b=section(first.outer+.155,soffitY,next);
      const out=([x,y,z])=>{
        const scale=bayHalf/Math.max(Math.abs(x),Math.abs(z));
        return [x*scale,y,z*scale];
      };
      const corners=[a,b,out(b)];
      if(Math.sign(a[0])===Math.sign(b[0])&&Math.sign(a[2])===Math.sign(b[2])){
        corners.push([Math.sign(a[0])*bayHalf,soffitY,Math.sign(a[2])*bayHalf]);
      }
      corners.push(out(a));
      face(painted,corners,corners.map(([x,,z])=>[(bayHalf-Math.abs(x))/2.8,(bayHalf-Math.abs(z))/2.8]));
    }
    const baySpan=bayHalf*2/3,wingEdge=10.4,boardsY=soffitY+.05;
    const panelUV=[[0,0],[1,0],[1,1],[0,1]];
    function coffer(x,z,endX,endZ){
      face(painted,[[x,boardsY,z],[endX,boardsY,z],[endX,boardsY,endZ],[x,boardsY,endZ]],panelUV);
    }
    const xCuts=[-halfX,-bayHalf,-bayHalf/3,bayHalf/3,bayHalf,halfX];
    const zCuts=[-halfZ,-bayHalf,-bayHalf/3,bayHalf/3,bayHalf,halfZ];
    if(pavilion){
      for(let row=0;row<5;row++)for(let column=0;column<5;column++){
        if(row!==0&&row!==4&&column!==0&&column!==4)continue;
        coffer(xCuts[column],zCuts[row],xCuts[column+1],zCuts[row+1]);
      }
      state.coverage='wall-to-wall';state.perimeterCoffers=16;
      state.edgeHeight=pavilion.ceilingY;
      state.centreHeight=root.position.y+plateHeight*heightScale;
    }else for(const side of [-1,1]){
      for(let i=0;i<3;i++){
        const z=-bayHalf+i*baySpan;
        coffer(side*bayHalf,z,side*wingEdge,z+baySpan);
      }
    }
    for(const [material,{positions,uv}] of strips){
      const geometry=new T.BufferGeometry();
      geometry.setAttribute('position',new T.Float32BufferAttribute(positions,3));
      geometry.setAttribute('uv',new T.Float32BufferAttribute(uv,2));
      geometry.computeVertexNormals();
      material.side=T.DoubleSide;
      const mesh=new T.Mesh(geometry,material);
      if(material===painted)mesh.name='Painted caisson spandrels and side coffers';
      mesh.receiveShadow=true;
      root.add(mesh);
    }

    const panel=new T.Mesh(plaqueGeometry(T,plateRadius),plaque);
    panel.name='Double-dragon ceiling plaque';
    panel.rotation.x=Math.PI/2;panel.position.y=plateHeight+.005;
    root.add(panel);
    const block=new T.BoxGeometry(1,1,1),arm=bracketProfile(T);
    const batches=new Map(), transform=new T.Object3D();
    function stamp(geometry,material,x,y,z,w,h,d,angle=0) {
      let byMaterial=batches.get(geometry);
      if(!byMaterial)batches.set(geometry,byMaterial=new Map());
      let instances=byMaterial.get(material);
      if(!instances)byMaterial.set(material,instances=[]);
      transform.position.set(x,y,z);transform.rotation.set(0,angle,0);transform.scale.set(w,h,d);
      transform.updateMatrix();
      instances.push(transform.matrix.clone());
    }
    for(const [index,{outer,inner,low,high}] of tiers.entries()){
      for(let side=0;side<8;side++){
        const [ax,az]=points[side], [bx,bz]=points[(side+1)%8];
        const angle=-Math.atan2(bz-az,bx-ax);
        const spacing=index<2?[.15,.38,.62,.85]:[.23,.5,.77];
        for(const step of spacing){
          const x=ax+(bx-ax)*step,z=az+(bz-az)*step;
          for(let level=0;level<3;level++){
            const fraction=(level+.8)/4.1,radius=outer+(inner-outer)*fraction;
            const y=low+(high-low)*fraction-.11;
            const width=.32+level*.14;
            stamp(arm,level===1?red:jade,x*radius,y,z*radius,width,.44,.29+level*.028,angle);
            stamp(block,gold,x*(radius-.11),y+.115,z*(radius-.11),width*.88,.033,.067,angle);
          }
          state.brackets++;
        }
      }
    }
    // Support the peripheral coffers on complete transverse and longitudinal beams.
    if(pavilion){
      const railBeadY=soffitY-.12,railBeadHeight=.027;
      state.perimeterTrimBottom=root.position.y+(railBeadY-railBeadHeight/2)*heightScale;
      function rail(x0,z0,x1,z1,wide){
        const span=Math.hypot(x1-x0,z1-z0),x=(x0+x1)/2,z=(z0+z1)/2;
        const angle=-Math.atan2(z1-z0,x1-x0),width=wide?.31:.16;
        stamp(block,timber,x,soffitY+.06,z,span,.35,width,angle);
        stamp(block,gold,x,railBeadY,z,span,railBeadHeight,width*.35,angle);
      }
      for(const x of xCuts){
        if(Math.abs(x)>=bayHalf)rail(x,-halfZ,x,halfZ,true);
        else{rail(x,-halfZ,x,-bayHalf,false);rail(x,bayHalf,x,halfZ,false);}
      }
      for(const z of zCuts){
        if(Math.abs(z)>=bayHalf)rail(-halfX,z,halfX,z,true);
        else{rail(-halfX,z,-bayHalf,z,false);rail(bayHalf,z,halfX,z,false);}
      }
      for(const z of [-halfZ+.38,halfZ-.38]){
        for(const x of [-halfX+.47,-bayHalf,bayHalf,halfX-.47]){
          stamp(arm,red,x,soffitY-.20,z,.55,.52,.30);
          stamp(block,gold,x,soffitY-.19,z,.24,.055,.33);
        }
      }
    }else for(const side of [-1,1]){
      const x=side*bayHalf;
      stamp(block,timber,x,15.16,0,.29,.59,2*bayHalf);
      stamp(block,gold,x,14.858,0,.065,.027,2*bayHalf);
      stamp(block,timber,side*wingEdge,15.18,0,.24,.47,2*bayHalf);
      for(let i=0;i<=3;i++){
        const z=-bayHalf+i*baySpan;
        stamp(block,timber,side*(wingEdge+bayHalf)/2,15.09,z,wingEdge-bayHalf,.35,.20);
      }
      stamp(block,timber,0,15.19,x,2*wingEdge,.64,.37);
      stamp(block,gold,0,14.865,x,2*wingEdge,.026,.13);
      for(const localZ of [-bayHalf,bayHalf]){
        const roof=world.architecture.shell.roofAt(x,localZ+centerZ);
        const bottom=15.39;
        if(roof>bottom)stamp(block,timber,x,(roof+bottom)/2,localZ,.28,roof-bottom,.30);
      }
    }
    // A small moulded outer cornice echoes the gilded lantern brackets in the reference.
    for(let index=0;index<8;index+=2){
      const [a,b]=[points[index],points[(index+1)%8]];
      const x=(a[0]+b[0])*2.47,z=(a[1]+b[1])*2.47,angle=-Math.atan2(b[1]-a[1],b[0]-a[0]);
      stamp(arm,gold,x,15.19,z,1.12,.53,.44,angle);
      stamp(arm,jade,x*.99,15.40,z*.99,.72,.48,.46,angle);
    }
    for(const [geometry,byMaterial] of batches){
      for(const [material,instances] of byMaterial){
        const mesh=new T.InstancedMesh(geometry,material,instances.length);
        mesh.receiveShadow=true;
        instances.forEach((matrix,index)=>mesh.setMatrixAt(index,matrix));
        mesh.instanceMatrix.needsUpdate=true;
        mesh.computeBoundingSphere();
        root.add(mesh);
      }
    }
    const power=pavilion?370:630;
    const bounce=new T.SpotLight(0xffd9a5,power,0,pavilion?.81:.59,.75,2);
    bounce.name='Caisson warm reflected light';
    bounce.position.set(-1.9,pavilion?first.low-5.8:7.9,pavilion?2.6:3.8);
    bounce.target.position.set(0,plateHeight,0);
    root.add(bounce,bounce.target);
    for(const child of root.children){
      if(!child.isMesh)continue;
      state.drawCalls++;
      const count=child.geometry.index?.count??child.geometry.attributes.position.count;
      state.triangleCount+=count/3*(child.isInstancedMesh?child.count:1);
    }
    const ready=finish ? Promise.all([
      ...(!palette?[
        finish.apply(T,jade,'lacquer',{tint:0xc2d8c8,bump:.018}),
        finish.apply(T,timber,'timber',{tint:0xcdb3a0,bump:.023})
      ]:[]),
      finish.caissonPlaque(T,plaque).then(height=>{
        state.plaqueLoaded=!!height;
        if(height)sculptRelief(panel,height);
        return !!height;
      })
    ]) : Promise.resolve([]);
    const target=root.localToWorld(new T.Vector3(0,plateHeight,0));
    return {
      root,state,ready,
      aimCamera(camera){
        if(pavilion){
          const elevation=.90,span=Math.max(halfZ*planScale,halfX*planScale/camera.aspect),height=pavilion.ceilingY-elevation;
          const fov=T.MathUtils.clamp(T.MathUtils.radToDeg(2*Math.atan(span*1.10/height)),74,124);
          camera.position.set(root.position.x,elevation,root.position.z+.085);
          if(camera.fov!==fov){camera.fov=fov;camera.updateProjectionMatrix();}
          camera.lookAt(target);camera.updateMatrixWorld();return;
        }
        const desktop=T.MathUtils.smoothstep(camera.aspect,.55,1.45);
        const elevation=T.MathUtils.lerp(1.75,5.25,desktop);
        camera.position.set(0,elevation,centerZ+T.MathUtils.lerp(.65,2.60,desktop));
        const halfHeight=soffitY-elevation-.35;
        const fov=T.MathUtils.clamp(T.MathUtils.radToDeg(2*Math.atan(6.35/(halfHeight*camera.aspect))),65,103);
        if(camera.fov!==fov){camera.fov=fov;camera.updateProjectionMatrix();}
        camera.lookAt(target);
        camera.updateMatrixWorld();
      },
      setLight(time,weather){
        bounce.intensity=power*(time==='night'?490/630:time==='sunset'?760/630:1)*(weather==='clear'?1:.84);
      }
    };
  }
  window.TempleCeiling={
    create,
    beamBay:{minZ:centerZ-bayHalf,maxZ:centerZ+bayHalf}
  };
})();
;
(function () {
  'use strict';

  function instances(T, parent, layer) {
    const batches = new Map(), pose = new T.Object3D();
    function add(geometry, material, position, size, yaw=0) {
      let materials = batches.get(geometry);
      if(!materials)batches.set(geometry,materials=new Map());
      let list = materials.get(material);
      if(!list)materials.set(material,list=[]);
      pose.position.set(...position);pose.scale.set(...size);pose.rotation.set(0,yaw,0);
      pose.updateMatrix();list.push(pose.matrix.clone());
    }
    function finish(castShadow=false) {
      for(const [geometry,materials] of batches)for(const [material,list] of materials){
        const mesh=new T.InstancedMesh(geometry,material,list.length);
        mesh.layers.set(layer);
        mesh.castShadow=castShadow;
        mesh.receiveShadow=true;
        list.forEach((matrix,index)=>mesh.setMatrixAt(index,matrix));
        mesh.instanceMatrix.needsUpdate=true;
        mesh.computeBoundingSphere();
        parent.add(mesh);
      }
    }
    return {add,finish};
  }

  function lightFalloff(T) {
    const canvas=document.createElement('canvas');
    canvas.width=canvas.height=64;
    const context=canvas.getContext('2d'),radial=context.createRadialGradient(32,32,2,32,32,31);
    radial.addColorStop(0,'rgba(32,21,16,.40)');
    radial.addColorStop(.49,'rgba(32,21,16,.25)');
    radial.addColorStop(1,'rgba(32,21,16,0)');
    context.fillStyle=radial;context.fillRect(0,0,64,64);
    const texture=new T.CanvasTexture(canvas);
    texture.colorSpace=T.SRGBColorSpace;
    return texture;
  }

  function windowLight(T, parent) {
    const strength={value:.2};
    const material=(fragment,blending=T.AdditiveBlending)=>new T.ShaderMaterial({
      uniforms:{strength},transparent:true,depthWrite:false,side:T.DoubleSide,blending,
      vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
      fragmentShader:fragment
    });
    const shaft=material(`varying vec2 vUv;uniform float strength;
      void main(){
        float edge=1.-smoothstep(.12,.5,abs(vUv.x-.5));
        float fade=smoothstep(0.,.16,vUv.y)*(1.-smoothstep(.58,1.,vUv.y));
        gl_FragColor=vec4(1.,.70,.40,strength*.25*edge*fade);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }`);
    const veil=new T.Group();veil.name='Afternoon light through the main portal';parent.add(veil);
    for(const y of [0,1]){
      const geometry=new T.BufferGeometry();
      geometry.setAttribute('position',new T.Float32BufferAttribute(y===0?
        [-1.55,7.12,14.24,1.45,7.12,14.24,-5.1,.23,-1.7,.65,.23,-1.7]:
        [-.05,5.6,14.25,-.05,7.84,14.25,-4.20,.06,-.9,-4.20,1.45,-.9],3));
      geometry.setAttribute('uv',new T.Float32BufferAttribute([0,0,1,0,0,1,1,1],2));
      geometry.setIndex([0,1,2,1,3,2]);
      const mesh=new T.Mesh(geometry,shaft);
      mesh.renderOrder=3;veil.add(mesh);
    }
    const bounce=material(`varying vec2 vUv;uniform float strength;
      void main(){
        vec2 p=vUv*2.-1.;
        float edge=1.-smoothstep(.03,1.,length(p));
        float mullion=.87+.13*cos(p.x*30.+p.y*7.);
        gl_FragColor=vec4(.98,.61,.29,edge*edge*mullion*strength*.39);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }`);
    const wash=new T.Mesh(new T.PlaneGeometry(8.15,15.6),bounce);
    wash.name='Soft portal light on oiled floor';wash.rotation.x=-Math.PI/2;
    wash.rotation.z=-.17;wash.position.set(-1.65,-.007,6.48);
    veil.add(wash);
    return {root:veil,strength};
  }

  function interior(T, world) {
    const root=new T.Group();root.name='Finished hall millwork and lamps';world.interiorRoot.add(root);
    const batch=instances(T,root,0);
    const cube=new T.BoxGeometry(1,1,1),hex=new T.CylinderGeometry(.5,.5,1,8);
    const cap=new T.CylinderGeometry(.19,.58,.16,8);
    const brass=new T.MeshStandardMaterial({color:0xa27642,roughness:.56,metalness:.44});
    const lacquer=new T.MeshStandardMaterial({color:0x382622,roughness:.56});
    const paper=new T.MeshStandardMaterial({color:0xe7bd7d,emissive:0xef9a48,emissiveIntensity:.49,roughness:.80});
    const contact=new T.PlaneGeometry(2,2);
    contact.rotateX(-Math.PI/2);
    const contactMat=new T.MeshBasicMaterial({map:lightFalloff(T),transparent:true,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-1});
    for(const mat of world.mats){
      if(!mat.room)batch.add(contact,contactMat,[mat.x,-.009,mat.z],[.91,1,1.03]);
    }
    for(const {x,z} of world.architecture.columns) {
      const side=Math.sign(x),lampX=x-side*.64;
      batch.add(contact,contactMat,[x,-.008,z],[1.04,1,1.04]);
      for(const y of [.29,4.67,15.55])batch.add(hex,brass,[x,y,z],[.78,.057,.78],Math.PI/8);
      batch.add(cube,lacquer,[x-side*.39,4.86,z],[.84,.14,.18]);
      batch.add(hex,paper,[lampX,4.34,z],[.47,.68,.47],Math.PI/8);
      batch.add(cap,brass,[lampX,4.775,z],[.72,.90,.72],Math.PI/8);
      batch.add(hex,brass,[lampX,3.974,z],[.58,.09,.58],Math.PI/8);
      for(let i=0;i<8;i++){
        const angle=i*Math.PI/4+Math.PI/8;
        const dx=Math.cos(angle)*.224,dz=Math.sin(angle)*.224;
        batch.add(cube,lacquer,[lampX+dx,4.34,z+dz],[.029,.72,.029],angle);
      }
    }
    // Fine rails and recessed timber panels are mounted directly to the sealed walls.
    for(const side of [-1,1]) {
      const x=side*19.955;
      batch.add(cube,lacquer,[x,.13,-.58],[.074,.19,29.7]);
      batch.add(cube,brass,[x,1.265,-.58],[.068,.027,29.7]);
      batch.add(cube,lacquer,[x,1.32,-.58],[.064,.07,29.7]);
      for(let z=-14.87;z<14;z+=1.64)batch.add(cube,lacquer,[x,.69,z],[.047,1.09,.069]);
    }
    batch.finish();
    const falloff=windowLight(T,world.interiorRoot);
    return {
      root,
      setAtmosphere(time,weather){
        const overcast=weather==='clear'?1:.34;
        falloff.strength.value=(time==='night'?0:time==='sunset'?.49:.21)*overcast;
        falloff.root.visible=falloff.strength.value>0;
        paper.emissiveIntensity=time==='night'?.83:time==='sunset'?.66:.43;
      }
    };
  }

  function entranceDrums(T, batch, specifications, stone, rim, tile) {
    const profile=[
      [0,-.248],[.396,-.248],[.442,-.236],[.475,-.205],[.51,-.16],
      [.536,-.075],[.543,0],[.535,.095],[.512,.156],[.478,.204],[.443,.238],[.399,.247],[0,.247]
    ];
    const barrel=new T.LatheGeometry(profile.map(([radius,depth])=>new T.Vector2(radius,depth)),40);
    barrel.rotateX(Math.PI/2);
    const ridge=new T.TorusGeometry(.416,.021,7,40);
    const medallion=new T.TorusGeometry(.272,.014,6,36);
    const shape=new T.Shape();
    shape.moveTo(-.50,.145);shape.lineTo(.50,.145);shape.lineTo(.50,.27);
    shape.bezierCurveTo(.46,.39,.37,.49,.301,.43);
    shape.bezierCurveTo(.24,.32,.11,.312,0,.312);
    shape.bezierCurveTo(-.11,.312,-.24,.32,-.301,.43);
    shape.bezierCurveTo(-.37,.49,-.46,.39,-.50,.27);
    shape.closePath();
    const saddle=new T.ExtrudeGeometry(shape,{depth:.57,bevelEnabled:true,bevelSize:.019,bevelThickness:.018,bevelSegments:2,curveSegments:6});
    saddle.translate(0,0,-.285);
    const rosette=new T.Shape();
    for(let i=0;i<72;i++){
      const angle=i*Math.PI/36,radius=.167+.033*Math.cos(angle*8);
      const x=Math.cos(angle)*radius,y=Math.sin(angle)*radius;
      if(i===0)rosette.moveTo(x,y);else rosette.lineTo(x,y);
    }
    rosette.closePath();
    const flower=new T.ExtrudeGeometry(rosette,{depth:.018,bevelEnabled:true,bevelSize:.009,bevelThickness:.009,bevelSegments:1,steps:1});
    const boss=new T.SphereGeometry(1,12,8);
    for(const specification of specifications){
      const {sites,bottom,width,depth,scale}=specification;
      const [,heightScale,depthScale]=scale;
      for(const [x,z] of sites){
        // Both drum faces are upright; the carved faces look into the approach.
        const direction=-Math.sign(x-(specification.centreX??0));
        const yaw=direction*Math.PI/2;
        const add=(geometry,material,y,offset,size=[1,1,1])=>{
          batch.add(geometry,material,[x+direction*offset*depthScale,bottom+y*heightScale,z],size.map((length,axis)=>length*scale[axis]),yaw);
        };
        add(tile,rim,.081,0,[width,.162,depth]);
        add(tile,stone,.172,0,[width-.046,.074,depth-.042]);
        add(saddle,stone,0,0);
        add(barrel,stone,.836,0);
        add(ridge,rim,.836,.241);
        add(ridge,rim,.836,-.241);
        add(medallion,rim,.836,.244);
        add(flower,stone,.836,.245);
        add(boss,rim,.836,.264,[.058,.058,.025]);
      }
    }
  }

  function forecourt(T, world) {
    const root=new T.Group();root.name='Stone lanterns and entrance drums';world.scene.add(root);
    const batch=instances(T,root,1);
    const base=new T.CylinderGeometry(.46,.54,.14,8);
    const post=new T.CylinderGeometry(.16,.23,.69,8);
    const shelf=new T.CylinderGeometry(.32,.27,.13,8);
    const roof=new T.CylinderGeometry(.16,.48,.21,8);
    const tile=new T.BoxGeometry(1,1,1);
    const stone=new T.MeshStandardMaterial({color:0x737d77,roughness:.94});
    const rim=new T.MeshStandardMaterial({color:0x545f57,roughness:.83});
    const warm=new T.MeshStandardMaterial({color:0xc2a376,emissive:0xe3a356,emissiveIntensity:.33,roughness:.94});
    const windows=new T.CylinderGeometry(.29,.29,.32,8);
    for(const [x,z,y] of world.architecture.forecourtLanterns){
      batch.add(base,stone,[x,y+.07,z],[1,1,1]);
      batch.add(post,stone,[x,y+.45,z],[1,1,1]);
      batch.add(shelf,rim,[x,y+.84,z],[1,1,1]);
      batch.add(windows,warm,[x,y+1.065,z],[1,1,1]);
      for(let i=0;i<8;i++){
        const a=i*Math.PI/4;
        batch.add(tile,rim,[x+Math.cos(a)*.28,y+1.065,z+Math.sin(a)*.28],[.061,.36,.060],a);
      }
      batch.add(roof,stone,[x,y+1.405,z],[1,1,1]);
      batch.add(shelf,rim,[x,y+1.548,z],[.38,.7,.38]);
    }
    batch.finish();
    const drums=instances(T,root,1);
    entranceDrums(T,drums,[world.architecture.entryDrums,world.architecture.scriptureEntryDrums,world.architecture.wealthEntryDrums],stone,rim,tile);
    drums.finish(true);
    window.TempleFinishes?.apply(T,stone,'stone',{tint:0xb5c2be,bump:.032,roughness:.92});
    return {
      root,
      setAtmosphere(time){warm.emissiveIntensity=time==='night'?1.2:time==='sunset'?.72:.28;}
    };
  }
  window.TempleEnvironment={interior,forecourt};
})();
;
/* Small optional assets: shared geometry, lazy requests, no shadow casting. */
(function(){
 'use strict';
 const sources={cap:'assets/monk-cap-game.glb',gourd:'assets/gourd-game.glb',bracket:'assets/temple-bracket-game.glb'};
 const pending=new Map();
 function load(id){
  if(!pending.has(id))pending.set(id,window.TempleGLB.load(sources[id]).then(gltf=>{
   gltf.scene.updateMatrixWorld(true);
   const parts=[];
   gltf.scene.traverse(o=>{if(!o.isMesh)return;const geometry=o.geometry.clone();geometry.applyMatrix4(o.matrixWorld);parts.push({geometry,material:o.material});});
   if(!parts.length)throw Error('Empty decorative asset: '+id);
   return parts;
  }).catch(error=>{pending.delete(id);throw error;}));
  return pending.get(id);
 }
 function model(T,id){
  const group=new T.Group();group.name='Game accessory '+id;group.userData.asset=id;
  let loading=false;
  group.userData.retry=()=>{
   if(loading||group.userData.loaded||group.userData.disposed)return group.userData.ready||Promise.resolve();
   loading=true;group.userData.error=null;
   // An actor retains its accessory group between wardrobe choices. Reusing a
   // failed group must be able to recover after the connection comes back.
   group.userData.ready=Promise.resolve().then(()=>load(id)).then(parts=>{
    if(group.userData.disposed)return;
    for(const part of parts){const material=Array.isArray(part.material)?part.material.map(m=>m.clone()):part.material.clone();const child=new T.Mesh(part.geometry,material);child.userData.sharedDecorGeometry=true;child.castShadow=false;child.receiveShadow=false;group.add(child);}
    group.userData.loaded=true;
   }).catch(error=>{if(!group.userData.disposed)group.userData.error=String(error.message||error);}).finally(()=>{loading=false;});
   return group.userData.ready;
  };
  group.userData.retry();
  return group;
 }
 function createGear(T,slot,id){
  if(slot==='head'&&id==='cap')return model(T,id);
  if(slot==='waist'&&id==='gourd'){
   const group=model(T,id);
   // Tie the uploaded bottle's red loop to the belt; a rigid bottle alone floated.
   const start=new T.Vector3(.030,.090,0),end=new T.Vector3(0,.220,-.015),direction=end.clone().sub(start);
   const tie=new T.Mesh(new T.CylinderGeometry(.003,.003,direction.length(),6),new T.MeshStandardMaterial({color:0x913d31,roughness:.94}));
   tie.name='Gourd belt tie';tie.position.copy(start).add(end).multiplyScalar(.5);tie.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),direction.normalize());group.add(tie);
   return group;
  }
  if(slot==='aura'&&id==='halo'){
   const material=new T.MeshBasicMaterial({color:0xeac574,transparent:true,opacity:.62,depthWrite:false});
   const halo=new T.Mesh(new T.TorusGeometry(.40,.009,5,64),material);
   halo.name='Quiet golden halo';halo.rotation.x=Math.PI/2;return halo;
  }
  if(slot==='waist'&&id==='muyu'){
   const group=new T.Group();group.name='Wooden fish belt charm';
   const wood=new T.MeshStandardMaterial({color:0x986134,roughness:.67}),cord=new T.MeshStandardMaterial({color:0x8b372b,roughness:.9});
   const fish=new T.Mesh(new T.SphereGeometry(1,16,10),wood);fish.scale.set(.065,.043,.049);group.add(fish);
   const slit=new T.Mesh(new T.BoxGeometry(.003,.014,.070),new T.MeshStandardMaterial({color:0x3b281d,roughness:1}));slit.position.set(0,.035,.004);group.add(slit);
   const loop=new T.Mesh(new T.TorusGeometry(.022,.003,5,20),cord);loop.position.y=.064;group.add(loop);
   return group;
  }
  return null;
 }
 function architecture(T,world){
  const root=new T.Group();root.name='Shared carved dougong accents';world.interiorRoot.add(root);
  const state={ready:false,loading:false,attempts:0,disposed:false,instances:0,drawCalls:0,optional:true,error:null};
  const inactive=Promise.resolve(false);let attempt=null;
  const eligible=context=>context?.coreReady===true&&context.entered===true&&context.near===true;
  function request(context){
   // The owner supplies real core/entry/proximity signals. No clock or render
   // loop may start optional downloads while the player is still entering.
   if(state.disposed||!eligible(context))return inactive;
   if(state.ready||state.loading||state.error)return attempt||inactive;
   state.loading=true;state.attempts++;
   attempt=Promise.resolve().then(()=>state.disposed?null:load('bracket')).then(parts=>{
    if(state.disposed||!parts)return false;
    const stations=world.architecture.decorStations||[];
    const transform=new T.Object3D(),local=new T.Matrix4();
    for(const part of parts){
     const batch=new T.InstancedMesh(part.geometry,part.material,stations.length);
     batch.name='Instanced red and gold bracket';batch.castShadow=false;batch.receiveShadow=false;
     stations.forEach((s,i)=>{transform.position.set(s.x,s.y,s.z);transform.rotation.y=s.rotation||0;transform.scale.setScalar(s.scale||1);transform.updateMatrix();local.copy(transform.matrix);batch.setMatrixAt(i,local);});
     batch.computeBoundingSphere();root.add(batch);
    }
    state.ready=true;state.instances=stations.length;state.drawCalls=parts.length;return true;
   }).catch(error=>{if(!state.disposed)state.error=String(error.message||error);return false;}).finally(()=>{state.loading=false;});
   return attempt;
  }
  function retry(context){
   // A reconnect while away may arm a later retry; it still cannot download
   // until all three gates are true again.
   if(!state.disposed&&!state.loading)state.error=null;
   return request(context);
  }
  function dispose(){
   if(state.disposed)return;state.disposed=true;
   // Geometry and materials belong to the shared parsed-asset cache.
   for(const batch of root.children)batch.dispose();root.clear();root.removeFromParent();
  }
  world.architecture.state.carvedBrackets=state;
  return{root,state,request,retry,dispose,get ready(){return attempt||inactive;}};
 }
 window.TempleDecor={createGear,architecture,load,sources};
})();
;
/* Compass-drawn inlays on the inward faces of the wealth pavilion. */
(function(){
  'use strict';
  function add(T,parent,hall){
    const [left,right,back,front]=hall.bounds;
    const xy=[],rgb=[],index=[],tau=2*Math.PI;
    const ink=new T.Color(0x8b602e),champagne=new T.Color(0xc5984e),moss=new T.Color(0xaa8559);
    const inlay=new T.MeshStandardMaterial({color:0xd7a75c,metalness:.42,roughness:.46});
    const wood=new T.MeshStandardMaterial({color:0x936342,roughness:.68});
    const panelFace=new T.MeshStandardMaterial({color:0xe3c999,roughness:.81});
    const reliefs=new Map(),matrix=new T.Matrix4();
    const root=new T.Group();root.name='Wealth hall gilded wall panels and aisle';parent.add(root);
    let wall,centre,unit;
    function bar(material,along,y,w,h,depth,projection){
      const x=wall.x+wall.dx*along-wall.dz*projection,z=wall.z+wall.dz*along+wall.dx*projection;
      matrix.makeRotationY(Math.atan2(-wall.dz,wall.dx)).scale(new T.Vector3(w,h,depth)).setPosition(x,y,z);
      if(!reliefs.has(material))reliefs.set(material,[]);
      reliefs.get(material).push(matrix.clone());
    }
    function stroke(points,width,tint=ink){
      const first=xy.length/3;
      for(let i=0;i<points.length;i++){
        const before=points[Math.max(0,i-1)],after=points[Math.min(points.length-1,i+1)];
        const dx=after[0]-before[0],dy=after[1]-before[1],len=Math.hypot(dx,dy)||1;
        for(const side of [-1,1]){
          const along=centre+unit*(points[i][0]-side*dy/len*width*.5);
          const y=3.78+unit*(points[i][1]+side*dx/len*width*.5);
          xy.push(wall.x+wall.dx*along,y,wall.z+wall.dz*along);
          rgb.push(tint.r,tint.g,tint.b);
        }
        if(i){const k=first+i*2;index.push(k-2,k-1,k,k,k-1,k+1);}
      }
    }
    function ring(x,y,r,w=.04,tint=ink,start=0,end=tau){
      const count=Math.max(10,Math.ceil((end-start)*Math.sqrt(r)*7));
      const points=[];
      for(let i=0;i<=count;i++){const a=start+(end-start)*i/count;points.push([x+r*Math.cos(a),y+r*Math.sin(a)]);}
      stroke(points,w,tint);
    }
    function orbit(count,d,r,tint=ink,phase=0){
      for(let i=0;i<count;i++){const a=tau*i/count+phase;ring(d*Math.cos(a),d*Math.sin(a),r,.044,tint);}
    }
    function medallion(kind){
      ring(0,0,1.25,.049,champagne);ring(0,0,1.15,.023,ink);
      switch(kind){
        case 0: orbit(6,.5,.5);ring(0,0,.13,.052,champagne);break;
        case 1: {
          for(let j=0;j<3;j++){const points=[];for(let i=0;i<=74;i++){const t=i/74,r=.08+.91*t,a=t*4.3+j*tau/3;points.push([r*Math.cos(a),r*Math.sin(a)]);}stroke(points,.065);}
          break;
        }
        case 2: {
          for(const [x,r] of [[0,.44],[-.70,.22],[.70,.22],[-1,.075],[1,.075]]){ring(x,0,r,.054);ring(x,0,r*.62,.028,champagne);}
          ring(0,0,.76,.028,moss,.24*Math.PI,.76*Math.PI);ring(0,0,.76,.028,moss,1.24*Math.PI,1.76*Math.PI);break;
        }
        case 3: ring(0,0,.88,.10);ring(0,0,.73,.025,champagne);stroke([[-.31,-.31],[.31,-.31],[.31,.31],[-.31,.31],[-.31,-.31]],.069);break;
        case 4: orbit(3,.47,.49,moss,Math.PI/2);orbit(3,.85,.11,champagne,-Math.PI/2);break;
        case 5: {
          for(let j=0;j<5;j++){const a=tau*j/5,b=a+.58;ring(.34*Math.cos(a),.34*Math.sin(a),.61,.047,ink,b,b+Math.PI*1.48);}
          ring(0,0,.12,.055,champagne);break;
        }
        case 6: ring(0,0,.56,.042,moss);orbit(8,.79,.15);orbit(8,.38,.055,champagne,Math.PI/8);break;
        case 7: for(let i=0;i<5;i++)ring(-.32+i*.08,0,.19+i*.16,.04,i%2?moss:ink);break;
      }
    }
    function panel(x,z,dx,dz,length,kinds,framed=false){
      wall={x,z,dx,dz};
      const span=length/kinds.length;
      kinds.forEach((kind,i)=>{
        centre=span*(i+.5);unit=Math.min(1.16,span/3.17);
        medallion(kind);
        for(const sign of [-1,1]){
          const a=sign*1.38;ring(a,0,.052,.043,champagne);
          stroke([[a-.25,1.59],[a,1.71],[a+.25,1.59]],.027,moss);
          stroke([[a-.25,-1.59],[a,-1.71],[a+.25,-1.59]],.027,moss);
        }
        if(framed){
          const w=span-.37,half=w/2,tall=4.23,y=3.79;
          // The warm backing sits behind the inlay and the paired metal lines
          // project from the bead, away from the adjacent plaster.
          bar(panelFace,centre,y,w,tall,.014,-.011);
          for(const side of [-1,1]){
            bar(wood,centre+side*half,y,.117,tall+.14,.089,.04);
            bar(inlay,centre+side*(half-.063),y,.026,tall-.08,.031,.087);
            bar(wood,centre,y+side*tall/2,w,.118,.085,.04);
            bar(inlay,centre,y+side*(tall/2-.066),w-.106,.028,.033,.087);
          }
        }
      });
      centre=0;unit=1;
      if(framed){
        for(const [y,h,material] of [[1.32,.13,wood],[1.394,.026,inlay],[6.22,.037,inlay],[6.33,.172,wood],[6.455,.028,inlay]]){
          bar(material,length/2,y,length-.29,h,.095,.04);
        }
      }else for(const y of [-2.02,-1.94,1.95,2.03])stroke([[.13,y],[length-.13,y]],.027,champagne);
    }
    const edge=.133,wings=(right-left-hall.door.width)/2-.26;
    panel(left+edge,front,0,-1,front-back,[2,0,5],true);
    panel(right-edge,back,0,1,front-back,[4,7,1],true);
    panel(left,back+edge,1,0,right-left,[6,3,0,3,6],true);
    panel(left,front-edge,1,0,wings,[7,4]);
    panel(right,front-edge,-1,0,wings,[5,2]);
    const geom=new T.BufferGeometry();
    geom.setAttribute('position',new T.Float32BufferAttribute(xy,3));geom.setAttribute('color',new T.Float32BufferAttribute(rgb,3));geom.setIndex(index);geom.computeBoundingSphere();
    const mesh=new T.Mesh(geom,new T.MeshStandardMaterial({vertexColors:true,side:T.DoubleSide,roughness:.71,metalness:.12}));
    mesh.name='Wealth hall compass wallpaper';mesh.userData.motifCount=8;
    mesh.receiveShadow=true;root.add(mesh);
    const strip=new T.BoxGeometry(1,1,1);
    for(const [material,matrices] of reliefs){
      const batch=new T.InstancedMesh(strip,material,matrices.length);
      batch.name='Wealth hall relief panel trim';batch.receiveShadow=true;
      matrices.forEach((transform,i)=>batch.setMatrixAt(i,transform));
      batch.computeBoundingSphere();root.add(batch);
    }
    const cloth=document.createElement('canvas');cloth.width=384;cloth.height=640;
    const ctx=cloth.getContext('2d'),shade=ctx.createLinearGradient(0,0,384,0);
    shade.addColorStop(0,'#5b2c23');shade.addColorStop(.49,'#874438');shade.addColorStop(1,'#5b2c23');
    ctx.fillStyle=shade;ctx.fillRect(0,0,384,640);
    ctx.strokeStyle='#cba05b';ctx.lineWidth=3;ctx.strokeRect(15,15,354,610);
    ctx.strokeStyle='#9e6d43';ctx.lineWidth=2;ctx.strokeRect(27,27,330,586);
    for(let y=60;y<=580;y+=52){
      for(const x of [43,341]){
        ctx.beginPath();ctx.moveTo(x,y-12);ctx.lineTo(x+7,y);ctx.lineTo(x,y+12);ctx.lineTo(x-7,y);ctx.closePath();ctx.stroke();
      }
    }
    for(const y of [138,320,502]){
      ctx.strokeStyle='#c49b59';
      for(const radius of [39,54]){
        ctx.beginPath();ctx.ellipse(192,y,radius,radius*.82,0,0,tau);ctx.stroke();
      }
      ctx.beginPath();
      for(let i=0;i<=80;i++){
        const a=tau*i/80,r=24+8*Math.cos(8*a),x=192+r*Math.cos(a),v=y+r*.82*Math.sin(a);
        if(i===0)ctx.moveTo(x,v);else ctx.lineTo(x,v);
      }
      ctx.stroke();
    }
    const woven=new T.CanvasTexture(cloth);woven.colorSpace=T.SRGBColorSpace;woven.anisotropy=4;
    const runner=new T.Mesh(new T.PlaneGeometry(2.35,4.52),new T.MeshStandardMaterial({map:woven,bumpMap:woven,bumpScale:.009,roughness:.98}));
    runner.name='Wealth hall woven burgundy aisle runner';runner.rotation.x=-Math.PI/2;
    runner.position.set(hall.x,-.007,front-2.86);runner.receiveShadow=true;root.add(runner);
  }
  window.TempleWealthWallpaper={add};
})();
;
/* Printed silk panels. Each room uses one mesh; the player can move while its print loads. */
(function () {
  'use strict';

  function install(T, parent, room) {
    const {bounds, panelHeight, bottom, inset, doorHalf, motif} = room;
    const [left, right, back, front] = bounds;
    const positions = [], uvs = [], indices = [];
    function panel(x0, z0, x1, z1) {
      const base = positions.length / 3;
      const repeats = Math.max(1, Math.round(Math.hypot(x1 - x0, z1 - z0) / (2 * panelHeight)));
      positions.push(x0,bottom,z0, x1,bottom,z1, x1,bottom+panelHeight,z1, x0,bottom+panelHeight,z0);
      uvs.push(0,0, repeats,0, repeats,1, 0,1);
      indices.push(base,base+1,base+2, base,base+2,base+3);
    }
    const centre = (left + right) / 2;
    // All panels face inward. The front wings end at the outer faces of the jambs.
    panel(left+inset, front-inset, left+inset, back+inset);
    panel(right-inset, back+inset, right-inset, front-inset);
    if (room.backPanel) panel(left+inset, back+inset, right-inset, back+inset);
    panel(centre-doorHalf, front-inset, left+inset, front-inset);
    panel(right-inset, front-inset, centre+doorHalf, front-inset);

    const geometry = new T.BufferGeometry();
    geometry.setAttribute('position', new T.Float32BufferAttribute(positions, 3));
    geometry.setAttribute('uv', new T.Float32BufferAttribute(uvs, 2));
    geometry.setIndex(indices);
    geometry.computeVertexNormals();
    geometry.computeBoundingSphere();
    const material = new T.MeshStandardMaterial({color:0xffffff, roughness:.98});
    const mesh = new T.Mesh(geometry, material);
    mesh.name = 'Printed silk wall panels - ' + motif;
    mesh.receiveShadow = true;
    mesh.visible = false;
    parent.add(mesh);

    let pending = false, retryAt = 0;
    return function approach(point, now) {
      if (mesh.visible || pending || now < retryAt) return;
      if (point.x < left-10 || point.x > right+10 || point.z < back-10 || point.z > front+10) return;
      pending = true;
      window.TempleAssets.texture(T, 'assets/interior-' + motif + '-silk.webp').then(texture => {
        texture.wrapS = T.RepeatWrapping;
        texture.colorSpace = T.SRGBColorSpace;
        texture.anisotropy = 4;
        material.map = texture;
        material.needsUpdate = true;
        mesh.visible = true;
      }).catch(() => { retryAt = performance.now() + 60000; }).finally(() => { pending = false; });
    };
  }

  window.TempleWallPrints = {create(T, parent, shell, halls, roomSideOuterHalfWidth = shell.portal.width/2) {
    const b = shell.innerBounds;
    const load = [install(T, parent, {
      bounds:[b.minX,b.maxX,b.minZ,b.maxZ], bottom:shell.wainscotY+.035, panelHeight:3.85,
      // The paper sits between the wall and the front face of the timber casing.
      inset:.004, doorHalf:roomSideOuterHalfWidth+.012, motif:'lotus', backPanel:false
    })];
    for (const hall of halls) {
      load.push(install(T, parent, {
        bounds:hall.bounds, bottom:1.29, panelHeight:3.68, inset:.127,
        doorHalf:hall.door.width/2+.28, motif:hall.id==='tea' ? 'ruyi' : 'bamboo', backPanel:true
      }));
    }
    let nextCheck = 0;
    return point => {
      const now = performance.now();
      if (!point || now < nextCheck) return;
      nextCheck = now + 400;
      for (const approach of load) approach(point, now);
    };
  }};
})();
;
/* Approved user-sketch R3 interior. Dimensions and activity anchors come from the shared contract. */
(function(){
 'use strict';
 window.TempleWorld={create(T){
  const L=window.TempleNavigation.templeSceneLayout,D=L.design,floorY=L.floorY;
  const scene=new T.Scene();scene.background=new T.Color(0x3e3730);scene.fog=new T.FogExp2(0x71604b,.006);
  const interiorRoot=new T.Group();interiorRoot.name='Approved '+D.revision+' temple interior';interiorRoot.position.y=floorY;scene.add(interiorRoot);
  const mats=[],obstacles=[],cameraObstacles=[],interactables=[],flames=[],smoke=[],lights=[],sideRooms=[],floorCoverage=[],columns=[],openings=[],bookBoxes=[],seatProps={};
  const architecture={state:{ready:false,error:null,revision:D.revision,roofReady:false,roofTriangles:0,mainLowRoofRemoved:true,area:1283.4},columns,openings,pavilionCeilings:{},pavilionDoors:[]};
  let seed=67159;const rnd=()=>((seed=(Math.imul(seed,1664525)+1013904223)>>>0)/4294967296);
  const mat=(color,roughness=.85,metalness=0)=>new T.MeshStandardMaterial({color,roughness,metalness});
  const finish=window.TempleInteriorFinish?.create(T);
  const wood=finish?.wood??mat(0x73513b),darkwood=mat(0x30251f),redwood=finish?.redwood??mat(0x704337),plaster=finish?.plaster??mat(0xb6a285,.98),bronze=mat(0x997c4a,.58,.42),gold=mat(0xb69b63,.55,.48),linen=mat(0xc8baa0,.98),celadon=mat(0x819c8c,.45,.05),paper=mat(0xe2d3b5,.95),ink=mat(0x4d5348,.95),burgundy=mat(0x78483f,.95);
  const paleOak=mat(0xc29a6d,.73),oakEdge=mat(0xa57951,.65),warmIvory=mat(0xe8d7b8,.92),libraryLinen=mat(0xe7e3d1,.96),warmGold=mat(0xe7be6e,.38,.54);
  const unitBox=new T.BoxGeometry(1,1,1),batchBoxes=[];
  const mesh=(geometry,material,x=0,y=0,z=0,parent=interiorRoot)=>{const o=new T.Mesh(geometry,material);o.position.set(x,y,z);o.castShadow=o.receiveShadow=true;parent.add(o);return o;};
  const box=(w,h,d,material,x,y,z,parent=interiorRoot,batch=true)=>{const o=mesh(unitBox,material,x,y,z,parent);o.scale.set(w,h,d);if(batch)batchBoxes.push(o);return o;};
  const sphere=(rx,ry,rz,material,x,y,z,parent=interiorRoot,seg=16)=>{const o=mesh(new T.SphereGeometry(1,seg,12),material,x,y,z,parent);o.scale.set(rx,ry,rz);return o;};
  const cylinder=(rt,rb,h,material,x,y,z,parent=interiorRoot,seg=20)=>mesh(new T.CylinderGeometry(rt,rb,h,seg),material,x,y,z,parent);
  const torus=(r,t,material,x,y,z,parent=interiorRoot)=>mesh(new T.TorusGeometry(r,t,6,32),material,x,y,z,parent);
  const canvas=(w,h)=>{const c=document.createElement('canvas');c.width=w;c.height=h;return c;};
  const texture=c=>{const t=new T.CanvasTexture(c);t.colorSpace=T.SRGBColorSpace;t.anisotropy=4;return t;};
  function obstacle(x,z,hx,hz,label,extra={}){obstacles.push({x,z,hx,hz,label,...extra});}
  function cameraBox(w,h,d,x,y,z,label){cameraObstacles.push({x,y:floorY+y,z,hx:w/2,hy:h/2,hz:d/2,label});}
  function solid(w,h,d,material,x,y,z,label,extra={}){const o=box(w,h,d,material,x,y,z,interiorRoot,false);o.name=label;obstacle(x,z,w/2,d/2,label,extra);cameraBox(w,h,d,x,y,z,label);return o;}
  function labelledPlane(text,width,height,material,x,y,z,rotationY=0,english=''){
   const cw=Math.round(256*width/height),c=canvas(cw,256),ctx=c.getContext('2d');ctx.fillStyle='#30251f';ctx.fillRect(0,0,cw,256);ctx.strokeStyle='#ae9567';ctx.lineWidth=7;ctx.strokeRect(10,10,cw-20,236);ctx.fillStyle='#e1cd9d';ctx.textAlign='center';ctx.textBaseline='middle';ctx.font=(width>8?'128':'84')+'px Microsoft YaHei, SimHei, sans-serif';ctx.fillText(text,cw/2,english?94:128);if(english){ctx.font='38px Georgia, serif';ctx.fillText(english,cw/2,201);}
   const o=mesh(new T.PlaneGeometry(width,height),new T.MeshStandardMaterial({map:texture(c),roughness:.9}),x,y,z);o.rotation.y=rotationY;o.name='Door sign '+text;return o;
  }
  // One continuous, thick floor is the authoritative substrate for all five zones.
  const grain=canvas(1024,1024),ctx=grain.getContext('2d');ctx.fillStyle='#614533';ctx.fillRect(0,0,1024,1024);
  for(let x=0;x<1024;x+=64){let y=-rnd()*270;while(y<1024){const len=210+rnd()*260;ctx.fillStyle=`hsl(${24+rnd()*5},${25+rnd()*8}%,${28+rnd()*8}%)`;ctx.fillRect(x+1,y+1,62,len-2);ctx.strokeStyle='rgba(27,20,15,.55)';ctx.lineWidth=2;ctx.strokeRect(x,y,64,len);for(let k=0;k<11;k++){ctx.strokeStyle='rgba(205,175,130,.065)';const gx=x+5+rnd()*53;ctx.beginPath();ctx.moveTo(gx,y);ctx.bezierCurveTo(gx+8,y+len*.3,gx-7,y+len*.7,gx+1,y+len);ctx.stroke();}y+=len;}}
  const ft=texture(grain);ft.wrapS=ft.wrapT=T.RepeatWrapping;ft.repeat.set(41.4/8,31/8);
  const floorMat=new T.MeshStandardMaterial({map:ft,roughness:.59,color:0xd3bfa5});
  // Stagger the end joints and carry any board crossing the tile edge through
  // to the opposite side. Close to the floor, long fibers curl around knots.
  const tileSize=1024,plankWidth=64;
  const pavilionGrain=canvas(tileSize,tileSize),plankInk=pavilionGrain.getContext('2d');
  let boardSeed=19481;
  const boardRandom=()=>((boardSeed=(Math.imul(boardSeed,1664525)+1013904223)>>>0)/4294967296);
  const boardTones=[['#956b48','#825736','#6f472e'],['#8c6144','#784e34','#65402a'],['#a07852','#875b3c','#754c30'],['#926548','#7e5237','#6b432e']];
  plankInk.fillStyle='#543722';plankInk.fillRect(0,0,tileSize,tileSize);
  for(let column=0;column<tileSize/plankWidth;column++){
   const x=column*plankWidth;
   const first=270+boardRandom()*95,second=300+boardRandom()*85;
   let start=52+boardRandom()*380;
   for(const length of [first,second,tileSize-first-second]){
    const tone=boardTones[Math.floor(boardRandom()*boardTones.length)];
    const knot=boardRandom()<.48?{x:x+18+boardRandom()*28,y:length*(.23+boardRandom()*.55)}:null;
    const fibers=Array.from({length:34},(_,i)=>({
     x:x+3+boardRandom()*(plankWidth-6),start:boardRandom()*.28,span:.44+boardRandom()*.27,
     bend:(boardRandom()-.5)*12,width:.65+boardRandom()*1.6,light:i%3===0,
     opacity:.08+boardRandom()*.21
    }));
    for(const y of [start,start-tileSize]){
     if(y>=tileSize||y+length<=0)continue;
     const boardWash=plankInk.createLinearGradient(x,0,x+plankWidth,0);
     boardWash.addColorStop(0,tone[2]);boardWash.addColorStop(.16,tone[1]);boardWash.addColorStop(.58,tone[0]);boardWash.addColorStop(1,tone[1]);
     plankInk.fillStyle=boardWash;plankInk.fillRect(x+1,y+1,plankWidth-2,length-2);
     plankInk.save();plankInk.beginPath();plankInk.rect(x+1,y+1,plankWidth-2,length-2);plankInk.clip();
     for(const fiber of fibers){
      const from=y+fiber.start*length,to=from+fiber.span*length;
      const curl=knot?Math.sign(fiber.x-knot.x)*12*Math.exp(-Math.abs(fiber.x-knot.x)/11):0;
      plankInk.strokeStyle=fiber.light?`rgba(226,177,119,${fiber.opacity})`:`rgba(48,24,13,${fiber.opacity})`;
      plankInk.lineWidth=fiber.width;
      plankInk.beginPath();plankInk.moveTo(fiber.x,from);
      plankInk.bezierCurveTo(fiber.x+fiber.bend+curl,from+(to-from)*.34,fiber.x-fiber.bend+curl,to-(to-from)*.34,fiber.x+fiber.bend*.26,to);
      plankInk.stroke();
     }
     if(knot){
      plankInk.strokeStyle='rgba(62,33,20,.42)';plankInk.lineWidth=1.2;
      for(const radius of [2,4,7]){
       plankInk.beginPath();plankInk.ellipse(knot.x,y+knot.y,radius,radius*3.2,.12,0,Math.PI*2);plankInk.stroke();
      }
     }
     plankInk.restore();
     plankInk.fillStyle='rgba(216,168,111,.22)';
     plankInk.fillRect(x+1,y+1,1,length-2);plankInk.fillRect(x+1,y+1,plankWidth-2,1);
    }
    start+=length;
   }
  }
  const pavilionTimber=texture(pavilionGrain);
  pavilionTimber.wrapS=pavilionTimber.wrapT=T.RepeatWrapping;pavilionTimber.repeat.set(3,2);
  const pavilionFloor=new T.MeshStandardMaterial({map:pavilionTimber,bumpMap:pavilionTimber,bumpScale:.012,roughness:.71,color:0xf2decb});
  const finishedFloor={minX:-20.12,maxX:20.12,minZ:-15.55,maxZ:14.4},entry=L.openings.find(o=>o.id==='main-entry'),entryHalf=entry.clearWidth/2,entryEnd=entry.centre[2];
  // Timber ends at the sill. The stone threshold owns the next 0.8m, so two
  // upward faces never share the finished floor plane at the main entrance.
  const fs=new T.Shape();fs.moveTo(finishedFloor.minX,finishedFloor.minZ);fs.lineTo(finishedFloor.maxX,finishedFloor.minZ);fs.lineTo(finishedFloor.maxX,finishedFloor.maxZ);fs.lineTo(finishedFloor.minX,finishedFloor.maxZ);fs.closePath();
  const fg=new T.ShapeGeometry(fs);fg.rotateX(Math.PI/2);const fp=fg.attributes.position;for(let i=0;i<fp.count;i++)fp.setY(i,-L.character.groundInset);const fi=fg.index;for(let i=0;i<fi.count;i+=3){const b=fi.getX(i+1);fi.setX(i+1,fi.getX(i+2));fi.setX(i+2,b);}fg.computeVertexNormals();
  const fu=fg.attributes.uv;for(let i=0;i<fp.count;i++)fu.setXY(i,(fp.getX(i)-finishedFloor.minX)/(finishedFloor.maxX-finishedFloor.minX),(fp.getZ(i)-finishedFloor.minZ)/(entryEnd-finishedFloor.minZ));
  const floor=mesh(fg,floorMat);floor.castShadow=false;floor.name='Continuous inset finished timber floor';
  box(finishedFloor.maxX-finishedFloor.minX,.24,finishedFloor.maxZ-finishedFloor.minZ,darkwood,0,-.144,(finishedFloor.minZ+finishedFloor.maxZ)/2);box(entry.clearWidth,.24,entryEnd-finishedFloor.maxZ,darkwood,0,-.144,(entryEnd+finishedFloor.maxZ)/2);
  floorCoverage.push({name:'inset-temple-finish',meshName:floor.name,...finishedFloor,y:floorY-L.character.groundInset},{name:'central-entry-stone-sill',meshName:'Entry frame flush stone sill',minX:-entryHalf,maxX:entryHalf,minZ:finishedFloor.maxZ,maxZ:entryEnd,y:floorY-L.character.groundInset});
  architecture.state.finishedFloorArea=(finishedFloor.maxX-finishedFloor.minX)*(finishedFloor.maxZ-finishedFloor.minZ)+entry.clearWidth*(entryEnd-finishedFloor.maxZ);architecture.finishedFloor=finishedFloor;
  if(window.TempleEntryFrame)architecture.entryFrame=window.TempleEntryFrame.create(T,{parent:interiorRoot,opening:entry,materials:{redwood,darkwood,bronze},cameraBox,obstacle});
  // A single framed bilingual plaque stands just forward of the repaired head.
  box(12.2,2.20,.20,darkwood,0,9.67,16.30,interiorRoot,false).name='Main hall auspicious bilingual plaque';
  for(const x of[-3.8,3.8])box(.2,.35,.05,darkwood,x,9.18,16.175);
  labelledPlane('吉祥',12.04,2.07,darkwood,0,9.67,16.405,0,'GOOD FORTUNE');
  cameraBox(12.2,2.20,.25,0,9.67,16.275,'Main bilingual plaque');
  const coupletInk=mat(0x612e26,.67,.06);
  const coupletWidth=.96,coupletHeight=6.14,coupletDepth=.16;
  const coupletY=1.86+coupletHeight/2,coupletZ=entryEnd+.66;
  const verses=[
   {side:-1,text:'雷音光耀護蒼生'},
   {side:1,text:'明燭恆輝昭聖德'}
  ];
  for(const [index,{side,text}] of verses.entries()){
   const x=side*(entryHalf+1.25);
   const board=box(coupletWidth,coupletHeight,coupletDepth,darkwood,x,coupletY,coupletZ,interiorRoot,false);
   board.name='Main hall couplet board '+side;
   board.layers.set(1);
   const backingZ=entryEnd+.255,mountDepth=coupletZ-coupletDepth/2+.012-backingZ;
   for(const y of [coupletY-2.27,coupletY+2.27]){
    const cleat=box(.32,.19,mountDepth,darkwood,x,y,backingZ+mountDepth/2,interiorRoot,false);
    cleat.name='Main hall couplet cleat '+side;
    cleat.layers.set(1);
   }
   const geometry=new T.PlaneGeometry(coupletWidth-.025,coupletHeight-.028),uv=geometry.attributes.uv;
   for(let i=0;i<uv.count;i++)uv.setX(i,(index+.008+uv.getX(i)*.984)/2);
   const inscription=mesh(geometry,coupletInk,x,coupletY,coupletZ+coupletDepth/2+.003);
   inscription.name=text;
   inscription.userData.coupletSide=side;
   inscription.layers.set(1);
   inscription.castShadow=false;
   obstacle(x,coupletZ,coupletWidth/2,coupletDepth/2,'大殿门联');
   cameraBox(coupletWidth,coupletHeight,coupletDepth+.008,x,coupletY,coupletZ,'Main hall couplet');
  }
  architecture.entryDrums=L.entryDrums;
  architecture.scriptureEntryDrums=L.scriptureEntryDrums;
  architecture.wealthEntryDrums=L.wealthEntryDrums;
  for(const [drums,label] of [[L.entryDrums,'大殿石鼓'],[L.scriptureEntryDrums,'藏经阁石鼓'],[L.wealthEntryDrums,'财神殿石鼓']]){
   const {bottom,width,depth,height,scale:[sx,sy,sz]}=drums;
   for(const [x,z] of drums.sites){
    obstacle(x,z,depth*sz/2,width*sx/2,label);
    cameraBox(depth*sz,height*sy,width*sx,x,bottom-floorY+height*sy/2,z,label);
   }
  }
  // Each wall is constructed as an exact solid rectangle subtraction: jamb segments
  // plus the overhead lintel volume. No decorative door is placed over a solid wall.
  function wallSegment(axis,fixed,a,b,h=6.6,surface=plaster){if(b-a<.001)return;const centre=(a+b)/2,w=axis==='x'?.24:b-a,d=axis==='x'?b-a:.24,x=axis==='x'?fixed:centre,z=axis==='x'?centre:fixed;
   box(w,h,d,surface,x,h/2,z);cameraBox(w,h,d,x,h/2,z,'Room wall');obstacle(x,z,w/2,d/2,'小殿墙体');
   // Continuous timber wainscot and plaster; every return follows a cut wall segment.
   box(axis==='x'?.29:w,1.20,axis==='x'?d:.29,paleOak,x,.60,z);
   box(axis==='x'?.34:w,.10,axis==='x'?d:.34,oakEdge,x,.07,z);
   box(axis==='x'?.34:w,.10,axis==='x'?d:.34,oakEdge,x,1.22,z);
   box(axis==='x'?.32:w,.18,axis==='x'?d:.32,paleOak,x,h-.09,z);
   const bays=Math.max(1,Math.ceil((b-a)/1.65));
   for(let i=0;i<=bays;i++){const along=a+(b-a)*i/bays,stile=box(axis==='x'?.325:.07,1.12,axis==='x'?.07:.325,oakEdge,axis==='x'?fixed:along,.61,axis==='x'?along:fixed);stile.name='Joined lower wall panel stile';}
  }
  const pavilionFrame={jambWidth:.24,depth:1.37,offsetZ:.565,headThickness:.27};
  const ceilingReturnTimber=[redwood,redwood,paleOak,paleOak,redwood,paleOak];
  const pillarStone=mat(0xb1a797,.92);
  function wallWithOpening(axis,fixed,a,b,opening,top){
   // The masonry aperture encloses the timber assembly. Its end caps meet the
   // OUTER post faces instead of sharing the visible inner door reveal.
   const centre=axis==='x'?opening.centre[2]:opening.centre[0],half=opening.clearWidth/2+pavilionFrame.jambWidth,height=opening.clearHeight+pavilionFrame.headThickness,roughWidth=half*2;
   wallSegment(axis,fixed,a,centre-half,top);wallSegment(axis,fixed,centre+half,b,top);
   const x=axis==='x'?fixed:centre,z=axis==='x'?centre:fixed;
   box(axis==='x'?.24:roughWidth,top-height,axis==='x'?roughWidth:.24,plaster,x,(top+height)/2,z);cameraBox(axis==='x'?.24:roughWidth,top-height,axis==='x'?roughWidth:.24,x,(top+height)/2,z,'Door overhead wall');
   box(axis==='x'?.32:roughWidth,.18,axis==='x'?roughWidth:.32,wood,x,top-.09,z);
   // One frame is built below. The old inner posts, lintel and floor strip
   // duplicated that frame and are deliberately absent from this wall builder.
   openings.push({id:opening.id,axis,fixed,centre,width:opening.clearWidth,height:opening.clearHeight,roughWidth,roughHeight:height,thresholdY:floorY,wallThickness:.24,open:true});
  }
  const libraryFloor=pavilionFloor.clone();libraryFloor.color.set(0xbb9b80);
  const wealthFloor=pavilionFloor.clone();wealthFloor.color.set(0x987b69);wealthFloor.roughness=.54;
  const wealthLacquer=redwood.clone();wealthLacquer.color.set(0x803c2d);
  wealthLacquer.side=T.FrontSide;wealthLacquer.onBeforeCompile=redwood.onBeforeCompile;wealthLacquer.customProgramCacheKey=redwood.customProgramCacheKey;
  const blindReed=mat(0xb79b67,.94);
  function pavilionDoors(cx,insideFace,clearHalf,label){
   const pivot=clearHalf-.012,width=pivot-.003,z=insideFace-.18;
   const bottom=-L.character.groundInset+.004,top=3.985,height=top-bottom,mid=(top+bottom)/2;
   const leaves=[],studShape=new T.SphereGeometry(1,10,6),radius=L.character.radius;
   for(const side of [-1,1]){
    const hingeX=cx+side*pivot,centre=-side*width/2,group=new T.Group();
    group.name=label+' lacquered door '+side;group.position.set(hingeX,0,z);interiorRoot.add(group);
    box(width,height,.16,wealthLacquer,centre,mid,0,group,false).name=label+' door leaf';
    if(side===-1)box(.051,height-.010,.030,redwood,width-.004,mid,.094,group,false).name=label+' door meeting stile';
    const studs=new T.InstancedMesh(studShape,warmGold,84),m=new T.Matrix4();
    for(const [index,face] of [-1,1].entries()){
     for(const dx of [-1.10,1.10])box(.12,height,.045,redwood,centre+dx,mid,face*.093,group,false);
     for(const y of [.13,.52,3.73,3.9])box(2.22,.105,.047,redwood,centre,y,face*.094,group,false);
     for(let i=0;i<42;i++)studs.setMatrixAt(index*42+i,m.makeScale(.047,.047,.029).setPosition(centre+(i%6-2.5)*.345,.81+Math.floor(i/6)*.43,face*.102));
     for(const dx of [-1.061,1.061])box(.024,3.34,.018,warmGold,centre+dx,2.17,face*.112,group,false);
     for(const y of [.50,3.84])box(2.146,.026,.017,warmGold,centre,y,face*.112,group,false);
     const pullPlate=sphere(.174,.181,.025,bronze,centre-side*.89,1.66,face*.09,group,14);
     pullPlate.name=label+' gilt handle backplate';
     torus(.10,.020,warmGold,centre-side*.89,1.66,face*.126,group).name=label+' door pull';
    }
    studs.castShadow=studs.receiveShadow=true;group.add(studs);
    for(const y of [.47,1.98,3.57]){
     cylinder(.034,.034,.24,bronze,hingeX,y,z,interiorRoot,12).name=label+' bronze hinge';
     box(.32,.105,.038,bronze,-side*.16,y,-.083,group,false);
     box(.10,.12,.20,bronze,hingeX+side*.04,y,insideFace-.084);
    }
    leaves.push({group,side,hingeX,reach:width+(side===-1?.022:0)});
   }

   let progress=0,angle=0,hold=0;
   const sweepRadius=width+.16+radius;
   function approaches(p){
    if(!p)return false;
    const dx=Math.abs(p.x-cx),dz=Math.abs(p.z-z);
    return dx<=clearHalf+.75&&dz<=6.3 ||
     p.z<=z+radius&&Math.hypot(dx-pivot,dz)<=sweepRadius;
   }
   function hits(x,zNext,a,clearance){
    if(Math.abs(zNext-z)>sweepRadius||Math.abs(x-cx)>pivot+sweepRadius)return false;
    const ca=Math.cos(a),sa=Math.sin(a),dz=zNext-z;
    return leaves.some(({side,hingeX,reach})=>{
     const dx=x-hingeX,along=-side*dx*ca-dz*sa,across=-side*dx*sa+dz*ca;
     return Math.hypot(Math.max(0,-along,along-reach),Math.max(0,Math.abs(across)-.146))<clearance;
    });
   }
   return {
    get progress(){return progress;},
    blocksStep(x,zNext){return hits(x,zNext,angle,radius);},
    update(dt,position,peers=[]){
     const nearby=approaches(position)?[position]:[];
     for(const {target,actor} of peers){
      const visible=actor.root.position;
      if(approaches(target))nearby.push(target);
      if(approaches(visible))nearby.push(visible);
     }
     hold=nearby.length?2.1:Math.max(0,hold-dt);
     const next=T.MathUtils.clamp(progress+(hold>0?dt/.72:-dt/1.12),0,1);
     if(next===progress)return;
     const nextAngle=Math.PI*T.MathUtils.smoothstep(next,0,1);
     if(nearby.some(p=>hits(p.x,p.z,nextAngle,radius)&&!hits(p.x,p.z,angle,radius)))return;
     progress=next;angle=nextAngle;
     for(const {group,side} of leaves)group.rotation.y=-side*angle;
    }
   };
  }
  function loadPavilionArt(pictures,source){
   if(!window.TempleAssets)return Promise.resolve(false);
   return window.TempleAssets.texture(T,source).then(map=>{
    map.colorSpace=T.SRGBColorSpace;map.anisotropy=4;
    for(const picture of pictures){
     picture.material.map=map;
     picture.material.color.set(0xffffff);picture.material.needsUpdate=true;
    }
    return true;
   }).catch(error=>{
    console.warn('Pavilion artwork texture unavailable:',source,error);
    return false;
   });
  }
  function calligraphyMaterial(column){
   const material=new T.MeshLambertMaterial({color:0xf1e6cf});
   material.onBeforeCompile=shader=>{
    shader.uniforms.coupletColumn={value:column};
    shader.fragmentShader='uniform float coupletColumn;\n'+shader.fragmentShader;
    shader.fragmentShader=shader.fragmentShader.replace('#include <map_fragment>',`
     #ifdef USE_MAP
      vec2 panel=vMapUv;
      vec2 artwork=(panel-vec2(.235,.045))/vec2(.53,.91);
      vec2 original=vec2((coupletColumn+clamp(artwork.x,0.0,1.0)*92.0)/568.0,
        1.0-mix(990.0,68.0,clamp(artwork.y,0.0,1.0))/1062.0);
      vec3 rubbed=texture2D(map,original).rgb;
      float ink=smoothstep(.085,.255,dot(rubbed,vec3(.2126,.7152,.0722)));
      ink*=step(0.0,artwork.x)*step(artwork.x,1.0)*step(0.0,artwork.y)*step(artwork.y,1.0);
      vec2 margin=min(panel,vec2(1.0)-panel);
      float border=step(.043,margin.x)*step(.008,margin.y)-step(.057,margin.x)*step(.0105,margin.y);
      float fibre=sin(panel.x*183.0+sin(panel.y*488.0)*1.4)*sin(panel.y*713.0+panel.x*97.0);
      vec3 paper=vec3(.893,.800,.623)*(1.0+.017*fibre);
      paper=mix(paper,vec3(.48,.321,.172),border*.74);
      diffuseColor.rgb*=mix(paper,vec3(.005,.004,.003),ink);
     #endif
    `);
   };
   material.customProgramCacheKey=()=> 'library-couplet-xuan-paper';
   return material;
  }
  function libraryArt(cx,eastWall,rearWall,wallMidZ){
   const thangkaHeight=4.67,thangkaWidth=thangkaHeight*947/1660,thangkaY=3.47;
   const thangka=mesh(new T.PlaneGeometry(thangkaWidth,thangkaHeight),mat(0x513623,.94),cx,thangkaY,rearWall+.014);
   thangka.name='Scripture centre thangka';thangka.castShadow=false;
   for(const side of [-1,1]){
    const rod=cylinder(.037,.037,thangkaWidth+.15,oakEdge,cx,thangkaY+side*thangkaHeight/2,rearWall+.04,interiorRoot,10);
    rod.rotation.z=Math.PI/2;
   }

   const width=7.2,height=width*750/1600,x=eastWall-.181,z=wallMidZ,y=1.55+height/2;
   box(.085,height,width,darkwood,x,y,z,interiorRoot,false).name='Scripture landscape frame backing';
   const landscape=mesh(new T.PlaneGeometry(width,height),mat(0x857863,.95),x-.044,y,z);
   landscape.rotation.y=-Math.PI/2;
   landscape.name='Scripture framed landscape on opposite wall';landscape.castShadow=false;
   const couplets=[];
   const verses=[
    {side:1,key:'upper',text:'發上等願，結中等緣，享下等福',column:293},
    {side:-1,key:'lower',text:'擇高處立，尋平處住，向寬處行',column:203}
   ];
   const scrollHeight=4.38,scrollWidth=scrollHeight*216/1160,scrollWood=mat(0x956949,.88);
   for(const {side,key,text,column} of verses){
    const x=cx+side*1.94;
    const panel=mesh(new T.PlaneGeometry(scrollWidth,scrollHeight),calligraphyMaterial(column),x,thangkaY,rearWall+.014);
    panel.name='Scripture thangka verse '+key;
    panel.userData.inscription=text;panel.castShadow=false;
    for(const end of [-1,1]){
     const rod=cylinder(.032,.032,scrollWidth+.10,scrollWood,x,thangkaY+end*scrollHeight/2,rearWall+.034,interiorRoot,10);
     rod.rotation.z=Math.PI/2;
    }
    couplets.push(panel);
   }
   return ()=>Promise.all([
    loadPavilionArt([thangka],'assets/library-thangka.webp'),
    loadPavilionArt([landscape],'assets/library-ink-landscape.webp'),
    loadPavilionArt(couplets,'assets/library-couplet-calligraphy.webp')
   ]);
  }
  for(const h of L.sideHalls){
   const [a,b,c,d]=h.bounds,cx=h.x,cz=(c+d)/2,width=b-a,depth=d-c,ceilingY=h.ceilingY,frontDoor=D.openings.find(o=>o.id===(h.side<0?'west-foyer-link':'east-foyer-link'));
   const wealthHall=h.id==='tea';
   const wallTone=wealthHall?warmIvory:libraryLinen;
   wallSegment('x',a,c,d,ceilingY,wallTone);wallSegment('x',b,c,d,ceilingY,wallTone);wallSegment('z',c,a,b,ceilingY,wallTone);
   // One thick facade owns the lower wings and upper frieze. Its inner face
   // is plaster; the exterior is red timber. No old thin wall sits inside it.
   const facadeWidth=width+.6,roughHalf=frontDoor.clearWidth/2+pavilionFrame.jambWidth;
   const facadeTop=6.8;
   const facadeMaterials=[redwood,redwood,redwood,redwood,redwood,wallTone];
   for(const side of[-1,1]){
    const x=cx+side*facadeWidth/2,z=d+1.25;
    const postHeight=facadeTop-1.22,postCentre=1.22+postHeight/2;
    cylinder(.22,.22,postHeight,redwood,x,postCentre,z,interiorRoot,20).name=h.id+' connected facade column '+side;
    cylinder(.28,.30,.12,bronze,x,1.16,z,interiorRoot,20);
    obstacle(x,z,.22,.22,'小殿外柱');cameraBox(.44,postHeight+.12,.44,x,postCentre-.06,z,'Pavilion facade column');
    // Both pavilions use the same original-platform section under the post.
    const foot=wealthHall?'Wealth':'Scripture';
    solid(.58,.44,.58,pillarStone,x,.85,z,foot+' stone column foot '+side);
    box(.62,.052,.62,pillarStone,x,1.076,z,interiorRoot,false).name=foot+' stone column foot cap '+side;
    cameraBox(.62,.052,.62,x,1.076,z,foot+' stone column foot cap');
   }
   for(const side of[-1,1]){
    const wingWidth=facadeWidth/2-roughHalf,x=cx+side*(roughHalf+wingWidth/2);
    solid(wingWidth,4.27,pavilionFrame.depth,facadeMaterials,x,2.135,d+pavilionFrame.offsetZ,h.id+' joined facade wing '+side);
    const faceZ=d+1.25,wy=2.65;
    const disk=cylinder(1.03,1.03,.065,paper,x,wy,faceZ+.043,interiorRoot,48);disk.rotation.x=Math.PI/2;disk.name=h.id+' round window backing '+side;
    torus(1.10,.065,bronze,x,wy,faceZ+.09);torus(1.02,.035,darkwood,x,wy,faceZ+.10);
    box(.075,2.02,.065,darkwood,x,wy,faceZ+.115);box(2.02,.075,.065,darkwood,x,wy,faceZ+.115);
    box(.45,.45,.06,paper,x,wy,faceZ+.16);for(const dy of[-.26,.26])box(.59,.065,.06,bronze,x,wy+dy,faceZ+.21);for(const dx of[-.26,.26])box(.065,.46,.06,bronze,x+dx,wy,faceZ+.21);
   }
   openings.push({id:frontDoor.id,axis:'z',fixed:d,centre:cx,width:frontDoor.clearWidth,height:frontDoor.clearHeight,roughWidth:roughHalf*2,roughHeight:4.27,thresholdY:floorY,wallThickness:pavilionFrame.depth,open:true});
   const wingFloor=box(width,.24,depth,wealthHall?wealthFloor:libraryFloor,cx,-.132,cz,interiorRoot,false);wingFloor.name=h.id+' pavilion continuous timber floor';
   box(width,4.76,depth,mat(0xaaa394,.96),cx,-2.632,cz,interiorRoot,false).name=h.id+' foundation below timber substrate';
   floorCoverage.push({name:h.id+'-floor',minX:a,maxX:b,minZ:c,maxZ:d,y:floorY-.012});
   // A deep, solid fascia replaces the ragged imported doorway relief.
   // The fascia sits ON the dark beam; it no longer duplicates the beam's
   // downward-facing underside at 4.27m.
   const fasciaHeight=facadeTop-4.45,fasciaCentre=4.45+fasciaHeight/2;
   box(facadeWidth,fasciaHeight,pavilionFrame.depth,facadeMaterials,cx,fasciaCentre,d+pavilionFrame.offsetZ,interiorRoot,false).name=h.id+' continuous exterior fascia';
   cameraBox(facadeWidth,fasciaHeight,pavilionFrame.depth,cx,fasciaCentre,d+pavilionFrame.offsetZ,'Pavilion upper facade');
   // Join the raised interior to the fascia using a timber-faced return
   // behind the lower eave. The two faces match the outside and the coffers.
   const upperWallTop=ceilingY+.13,upperWallHeight=upperWallTop-facadeTop;
   const upperWallCentre=facadeTop+upperWallHeight/2;
   box(width+.24,upperWallHeight,.24,ceilingReturnTimber,cx,upperWallCentre,d,interiorRoot,false).name=h.id+' timber ceiling wall return';
   cameraBox(width+.24,upperWallHeight,.24,cx,upperWallCentre,d,'Pavilion timber ceiling wall return');
   box(facadeWidth+.16,.18,1.42,darkwood,cx,4.36,d+.62,interiorRoot,false).name=h.id+' pavilion fascia lower beam';box(facadeWidth+.2,.055,1.46,bronze,cx,4.485,d+.62);
   const signY=5.38,signEnglish=wealthHall?'GET RICH':'SUTRA LIBRARY';
   box(3.55,1.08,.12,darkwood,cx,signY,d+1.32);
   const sign=labelledPlane(h.label,3.4,.98,darkwood,cx,signY,d+1.385,0,signEnglish);
   if(wealthHall){
    architecture.wealthPlaqueReady=loadPavilionArt([sign],'assets/wealth-plaque.webp');
    for(const side of [-1,1]){
     box(3.96,.068,.10,warmGold,cx,signY+side*.64,d+1.40);
     box(.072,1.22,.10,bronze,cx+side*1.94,signY,d+1.40);
     box(4.64,.086,.065,bronze,cx+side*5.55,4.74,d+1.30);
    }
   }
   const frameZ=d+pavilionFrame.offsetZ,frameWidth=frontDoor.clearWidth+2*pavilionFrame.jambWidth;
   for(const side of[-1,1]){const x=cx+side*(frontDoor.clearWidth/2+pavilionFrame.jambWidth/2),jamb=box(pavilionFrame.jambWidth,frontDoor.clearHeight,pavilionFrame.depth,redwood,x,frontDoor.clearHeight/2,frameZ,interiorRoot,false);jamb.name=h.label+' solid entrance jamb';obstacle(x,frameZ,pavilionFrame.jambWidth/2,pavilionFrame.depth/2,'小殿门框');cameraBox(pavilionFrame.jambWidth,frontDoor.clearHeight,pavilionFrame.depth,x,frontDoor.clearHeight/2,frameZ,'Pavilion jamb');}
   box(frameWidth,pavilionFrame.headThickness,pavilionFrame.depth,darkwood,cx,frontDoor.clearHeight+pavilionFrame.headThickness/2,frameZ,interiorRoot,false).name=h.id+' single entrance lintel';
   cameraBox(frameWidth,pavilionFrame.headThickness,pavilionFrame.depth,cx,frontDoor.clearHeight+pavilionFrame.headThickness/2,frameZ,'Pavilion lintel');
   for(const face of[-1,1])box(frameWidth,.04,.03,bronze,cx,frontDoor.clearHeight+.205,frameZ+face*(pavilionFrame.depth/2+.015));
   const doors=pavilionDoors(cx,frameZ-pavilionFrame.depth/2,frontDoor.clearWidth/2,wealthHall?'Wealth':'Scripture');
   architecture.pavilionDoors.push(doors);
   if(wealthHall)architecture.wealthDoors=doors;
   else{
    architecture.scriptureDoors=doors;
    const guide=L.props.fortuneGuide;
    obstacle(guide.x,guide.z,.37,.37,'求签小和尚');
    const wallWash=new T.SpotLight(0xffebd3,44,10,.59,.9,2);
    wallWash.position.set(cx-.36,5.23,c+5.25);
    wallWash.target.position.set(cx,3.28,c+.2);
    interiorRoot.add(wallWash,wallWash.target);
    lights.push(wallWash);
   }
   if(window.TempleCeiling){
    const ceiling=window.TempleCeiling.create(T,{interiorRoot},h);
    architecture.pavilionCeilings[h.id]=ceiling;
    architecture.state[wealthHall?'wealthCeiling':'scriptureCeiling']=ceiling.state;
   }else{
    const ceiling=box(width+.24,.22,depth+.24,plaster,cx,ceilingY+.11,cz,interiorRoot,false);
    ceiling.name='Inset '+h.id+' sealed coffered ceiling';
    for(let z=c+.2;z<=d;z+=3.6)box(width,.4,.25,darkwood,cx,ceilingY-.20,z);
   }
   cameraBox(width+.24,.22,depth+.24,cx,ceilingY+.11,cz,'Pavilion ceiling');
   const cornerPostHeight=ceilingY-.20;
   for(const x of[a+.18,b-.18]){box(.28,.4,depth,oakEdge,x,ceilingY-.20,cz);for(const z of[c+.18,d-.18]){box(.28,cornerPostHeight,.28,paleOak,x,cornerPostHeight/2,z);box(.4,.12,.4,warmGold,x,.06,z);}}
   if(wealthHall)window.TempleWealthWallpaper?.add(T,interiorRoot,h);
   sideRooms.push({id:h.id,label:h.label,bounds:{min:[a,0,c],max:[b,ceilingY,d]},grossBounds:h.bounds,door:h.door,frontDoor:h.door,area:width*depth,finishedArea:width*depth,usable:{x:cx,z:cz,hx:width/2-.35,hz:depth/2-.35}});
   if(h.id==='scripture'){
    const loadLibraryArtwork=libraryArt(cx,b,c+.178,cz);
    const desk=D.furniture.find(f=>f.id==='reading-table');
    const artWidth=2.44,artHeight=artWidth*(982/1552),frame=.12;
    const tabletopY=desk.position[1]+desk.size[1]+.018;
    const art=new T.Group();art.name='Scripture original calligraphy in wood frame';
    art.position.set(a+.18,tabletopY+.95+artHeight/2+frame,desk.position[2]);
    art.rotation.y=-Math.PI/2;interiorRoot.add(art);
    box(artWidth+frame*2,artHeight+frame*2,.10,darkwood,0,0,0,art,false).name='Scripture artwork backing';
    for(const side of[-1,1]){box(artWidth+frame*2,frame,.14,wood,0,side*(artHeight+frame)/2,-.035,art,false).name='Scripture artwork wood horizontal frame';box(frame,artHeight,.14,wood,side*(artWidth+frame)/2,0,-.035,art,false).name='Scripture artwork wood vertical frame';}
    const artCanvas=canvas(1280,Math.round(1280*982/1552)),artContext=artCanvas.getContext('2d');artContext.fillStyle='#c4ae76';artContext.fillRect(0,0,artCanvas.width,artCanvas.height);
    const artTexture=texture(artCanvas),artPlane=mesh(new T.PlaneGeometry(artWidth,artHeight),new T.MeshBasicMaterial({map:artTexture,toneMapped:false}),0,0,-.056,art);artPlane.rotation.y=Math.PI;artPlane.castShadow=artPlane.receiveShadow=false;artPlane.name='Scripture preserved handwritten calligraphy';
    const artState={ready:false,source:'assets/scripture-calligraphy-original.jpg',rotationDegrees:-90,crop:[7,333,982,1552],width:artWidth,height:artHeight,wall:'west inside wall',error:null};architecture.state.scriptureArtwork=artState;
    architecture.loadScriptureArtwork=()=>{
     if(architecture.libraryArtworkReady)return;
     architecture.libraryArtworkReady=loadLibraryArtwork();
     const sourcePromise=window.TempleAssets?.texture?window.TempleAssets.texture(T,artState.source):typeof Image!=='undefined'?new T.TextureLoader().loadAsync(artState.source):null;
     architecture.artworkReady=sourcePromise?sourcePromise.then(source=>{const image=source.image,sx=image.width/1008,sy=image.height/2048;artContext.clearRect(0,0,artCanvas.width,artCanvas.height);artContext.save();artContext.translate(0,artCanvas.height);artContext.rotate(-Math.PI/2);artContext.drawImage(image,7*sx,333*sy,982*sx,1552*sy,0,0,artCanvas.height,artCanvas.width);artContext.restore();artTexture.needsUpdate=true;source.dispose();artState.ready=true;return art;} ).catch(error=>{artState.error=String(error?.message||error);console.warn('Calligraphy texture unavailable',error);return null;}):Promise.resolve(null);
    };
   }
  }
  // The user removed the low front gallery: the shared stone forecourt stays
  // open, without its roof, beams, posts or invisible post collisions.
  architecture.state.frontGalleryRemoved=true;
  // A complete, measured interior shell replaces the fractured source skins.
  // Its solid walls and roof share the same envelope with the exterior cutaway.
  architecture.shell=window.TempleInteriorShell.create(T,{parent:interiorRoot,materials:{plaster,wood,redwood,darkwood,bronze,roof:finish?.roof??wood},cameraBox,obstacle});
  // The fitted leaves fold back along the room-side frontage, clear of the sill.
  const leafWidth=entryHalf-.042,leafDepth=.15;
  const leafBottom=entry.thresholdY-L.character.groundInset+.039,leafTop=entry.clearHeight-.033;
  const leafHeight=leafTop-leafBottom,leafCentreY=(leafBottom+leafTop)/2;
  const frame=architecture.entryFrame,jambEdge=frame?.roomSideOuterHalfWidth??entryHalf+.58;
  const casingZ=frame?.roomSideFaceZ??architecture.shell.spec.portal.fromZ;
  const leafZ=casingZ-.005-leafDepth/2,faceZ=leafZ-leafDepth/2;
  const pivotX=jambEdge+.019,pivotZ=faceZ-.061,nearEdge=pivotX+.051;
  const leafLacquer=mat(0x79362b,.55),leafInset=mat(0x5e2b26,.58);
  const hingeBronze=mat(0x84633d,.46,.62);
  const hingeProfile=[
   [0,-.199],[.039,-.199],[.049,-.182],[.040,-.163],
   [.057,-.160],[.062,-.150],[.062,-.062],[.055,-.051],[.041,-.050],
   [.041,-.041],[.058,-.040],[.064,-.028],[.064,.028],[.058,.040],[.041,.041],
   [.041,.050],[.055,.051],[.062,.062],[.062,.150],[.057,.160],
   [.040,.163],[.049,.182],[.039,.199],[0,.199]
  ];
  const hingeBarrel=new T.LatheGeometry(hingeProfile.map(point=>new T.Vector2(...point)),16);
  const hingeRivet=new T.SphereGeometry(1,8,6),casingOffset=casingZ-pivotZ;
  function installHinge(side,y,index){
   const hinge=new T.Group();
   hinge.name='Main hall door hinge '+side+' '+index;
   hinge.position.set(side*pivotX,y,pivotZ);hinge.scale.x=side;interiorRoot.add(hinge);
   mesh(hingeBarrel,hingeBronze,0,0,0,hinge).name='Vertical hinge pin and knuckles';
   box(.31,.227,.084,hingeBronze,.173,0,.021,hinge,false).name='Door leaf hinge strap';
   box(.29,.244,.032,hingeBronze,-.191,0,casingOffset-.016,hinge,false).name='Jamb hinge strap';
   box(.117,.180,casingOffset-.012,hingeBronze,-.093,0,casingOffset/2-.006,hinge);
   box(.144,.168,.038,hingeBronze,-.060,0,.005,hinge);
   for(const [x,z] of [[.251,-.020],[-.263,casingOffset-.035]])for(const height of [-.061,.061]){
    const rivet=mesh(hingeRivet,warmGold,x,height,z,hinge);
    rivet.scale.set(.023,.023,.014);
   }
   const frontZ=pivotZ-.066;
   cameraBox(.68,.40,casingZ-frontZ,side*(pivotX-.005),y,(frontZ+casingZ)/2,'Main hall door hinge');
  }
  const studs=new T.InstancedMesh(new T.SphereGeometry(1,12,8),warmGold,2*8*9);
  studs.name='Raised gilded studs on both main hall doors';studs.castShadow=studs.receiveShadow=true;
  const studPose=new T.Object3D();let studIndex=0;
  for(const side of [-1,1]){
   const x=side*(nearEdge+leafWidth/2);
   solid(leafWidth,leafHeight,leafDepth,leafLacquer,x,leafCentreY,leafZ,'Main hall open door leaf '+side);
   const insetBottom=leafBottom+1.13,insetTop=leafTop-.23;
   box(leafWidth-.34,insetTop-insetBottom,.04,leafInset,x,(insetTop+insetBottom)/2,faceZ-.023);
   for(const t of [-1,1]){
    box(.084,leafHeight-.29,.04,warmGold,x+t*(leafWidth/2-.135),leafCentreY,faceZ-.052);
    box(leafWidth-.27,.075,.04,warmGold,x,t<0?leafBottom+.21:leafTop-.18,faceZ-.052);
   }
   box(leafWidth-.39,.053,.06,warmGold,x,leafBottom+1.20,faceZ-.07);
   const ringX=x+side*(leafWidth/2-.55);
   sphere(.155,.177,.046,bronze,ringX,1.64,faceZ-.072);
   torus(.123,.025,warmGold,ringX,1.51,faceZ-.115);
   for(const [index,fraction] of [.18,.50,.82].entries())installHinge(side,leafBottom+leafHeight*fraction,index);
   for(let row=0;row<9;row++)for(let column=0;column<8;column++){
    const studY=T.MathUtils.lerp(leafBottom+2.13,leafTop-.48,row/8);
    studPose.position.set(x+(column-3.5)*(leafWidth-.99)/7,studY,faceZ-.058);
    studPose.scale.set(.104,.104,.065);studPose.updateMatrix();studs.setMatrixAt(studIndex++,studPose.matrix);
   }
  }
  studs.instanceMatrix.needsUpdate=true;studs.computeBoundingSphere();interiorRoot.add(studs);
  // Tall visible timber frame, in front of the image reserves. The loaded outer
  // roof and attached lining define the real roof profile; no 7m central cap remains.
  const frameStations=[D.regions.find(r=>r.id==='sanctuary').bounds[3]+.9,D.regions.find(r=>r.id==='prayer-hall').bounds[3]-.2,D.regions.find(r=>r.id==='central-aisle').bounds[3]-.6];
  const statueFrontStation=frameStations[0];
  architecture.decorStations=[];
  for(const side of[-1,1])for(const z of frameStations){
   // The open altar sightline omits the nearest pair of columns.
   if(Math.abs(z-statueFrontStation)<.001)continue;
   const x=side*10.4,h=16.0;const p=cylinder(.34,.39,h,redwood,x,h/2,z,interiorRoot,20);p.name='Main hall full-height timber column';columns.push({x,z,height:h});obstacle(x,z,.40,.40,'正殿木柱');cameraBox(.8,h,.8,x,h/2,z,'Main hall column');
   cylinder(.48,.5,.18,bronze,x,.09,z);cylinder(.46,.38,.22,darkwood,x,15.89,z);
  }
  const caissonBay=window.TempleCeiling?.beamBay;
  const beamStations=frameStations.filter(z=>!caissonBay||z<caissonBay.minZ||z>caissonBay.maxZ);
  for(const z of beamStations){
   box(21.1,.62,.60,darkwood,0,16.09,z).name='Main hall transverse beam';
   box(20.7,.16,.70,redwood,0,15.73,z).name='Main hall transverse moulding';
  }
  for(const z of frameStations){
   if(z!==statueFrontStation)for(const side of[-1,1])architecture.decorStations.push({x:side*10.4,y:15.0,z,rotation:side<0?0:Math.PI,scale:1.10});
  }
  const buddhaScreen=mat(0x314239,.76,.06),wealthScreen=mat(0xe5bd86,.76,.06);
  wealthScreen.onBeforeCompile=shader=>{
   shader.fragmentShader=shader.fragmentShader.replace('#include <map_fragment>',`#include <map_fragment>
    diffuseColor.rgb=mix(diffuseColor.rgb,vec3(.76,.59,.39),.42);`);
  };
  const altarLamps=[],screenCapHeight=.158;
  function framedScreen(label,x,width,height,bottom,back,screenMaterial,atlasIndex,power,lightTrim=false){
   const frame=new T.Group();
   frame.name=label;
   frame.position.set(x,bottom,back);
   interiorRoot.add(frame);
   const timber=lightTrim?paleOak:redwood,edgeGold=lightTrim?warmGold:bronze;
   const backing=box(width+.36,height,.27,lightTrim?oakEdge:darkwood,0,height/2,.135,frame);
   backing.name=label+' continuous backing';
   const panelGeometry=new T.PlaneGeometry(width,height);
   if(atlasIndex!==null){
    const uv=panelGeometry.attributes.uv;
    for(let i=0;i<uv.count;i++)uv.setX(i,(atlasIndex+.008+uv.getX(i)*.984)/3);
   }
   const panel=mesh(panelGeometry,screenMaterial,0,height/2,.274,frame);
   panel.name=label+' painted lacquer';
   panel.castShadow=false;
   for(const side of[-1,1]){
    const edgeX=side*(width/2+.117);
    box(.234,height,.32,timber,edgeX,height/2,.16,frame);
    box(.028,height,.05,edgeGold,side*(width/2+.019),height/2,.322,frame);
   }
   for(const y of[.074,height-.074]){
    box(width+.45,.148,.375,timber,0,y,.188,frame);
    box(width+.32,.024,.048,edgeGold,0,y,.381,frame);
   }
   box(width+.63,.13,.42,lightTrim?oakEdge:darkwood,0,height+.065,.197,frame);
   box(width+.55,.048,.45,edgeGold,0,height+screenCapHeight-.024,.197,frame,!lightTrim).name=label+' upper gold cap';
   cameraBox(width+.63,height+.16,.45,x,bottom+(height+.16)/2,back+.20,label);
   obstacle(x,back+.20,(width+.63)/2,.225,label);
   if(power){
    const lamp=new T.SpotLight(0xffcf91,power,height*1.6,.69,.85,2);
    lamp.name=label+' warm picture light';
    lamp.position.set(-width*.135,height*.88,height*.37);
    lamp.target.position.set(0,height*.69,.28);
    frame.add(lamp,lamp.target);
    altarLamps.push({lamp,power});
   }
  }
  const altar=D.altar.platform;
  const icons=D.altar.statues;
  for(const [i,label] of ['Crowned Buddha ruyi screen','Central Buddha lotus screen','Guanyin lotus screen'].entries()){
   framedScreen(label,icons[i].position[0],i===1?12.7:10.62,13.74,altar.topY,-15.566,buddhaScreen,i,i===1?74:0);
  }
  architecture.loadSurfaces=()=>{
   const finish=window.TempleFinishes;
   if(!finish)return Promise.resolve([]);
   return Promise.all([
    finish.floor(T,floorMat,grain),
    finish.apply(T,wood,'timber',{tint:0xbfa78f,bump:.023,roughness:.61}),
    finish.apply(T,redwood,'timber',{tint:0xe9a394,bump:.022,roughness:.57}),
    finish.apply(T,plaster,'plaster',{tint:0xe7e1d4,bump:.026,roughness:.95}),
    finish.altarPanel(T,buddhaScreen,'altar'),
    finish.altarPanel(T,wealthScreen,'wealth'),
    finish.apply(T,coupletInk,'couplets',{tint:0xffffff,bump:.013,roughness:.67}).then(loaded=>{
     if(loaded){
      coupletInk.emissiveMap=coupletInk.map;
      coupletInk.emissive.set(0xd6b77a);
      coupletInk.emissiveIntensity=.18;
      coupletInk.needsUpdate=true;
     }
     return loaded;
    })
   ]);
  };
  // Altar plinth is not circulation. Stair-like front mouldings are joined solids.
  const [pa,pb,pc,pd]=altar.boundsXZ;
  const plinthCap=.10,plinthTop=altar.topY;
  solid(pb-pa,plinthTop-plinthCap,pd-pc,wood,(pa+pb)/2,(plinthTop-plinthCap)/2,(pc+pd)/2,'Altar timber plinth body');
  box(pb-pa+.10,plinthCap,pd-pc+.04,bronze,(pa+pb)/2,plinthTop-plinthCap/2,(pc+pd)/2,interiorRoot,false).name='Altar bronze plinth cap';
  for(let i=0;i<3;i++)box(pb-pa+.35,.18,.28,darkwood,0,.09+i*.18,pd+.12+i*.16,interiorRoot,false).name='Altar front moulding '+i;
  const statue=new T.Group();statue.name='Central Buddha anchor';statue.position.set(0,1.2,-10.7);interiorRoot.add(statue);
  const table=D.altar.frontOfferingTable,[tx,ty,tz]=table.position,[tw,th,td]=table.size;
  box(tw,.14,td,wood,tx,th-.07,tz,interiorRoot,false).name='Offering table timber top';box(tw+.12,.045,td+.1,bronze,tx,th+.0225,tz,interiorRoot,false).name='Offering table bronze cap';
  const altarLacquer=mat(0x642d25,.58),fuelGold=mat(0xe8b756,.37,.66);
  const apron=canvas(768,160),apronInk=apron.getContext('2d');
  apronInk.fillStyle='#522723';apronInk.fillRect(0,0,768,160);apronInk.strokeStyle='#e5b969';apronInk.lineWidth=4;apronInk.strokeRect(5,5,758,150);apronInk.lineWidth=1.5;apronInk.strokeRect(12,12,744,136);
  for(let i=0;i<12;i++){
   const x=(i+.5)*64;apronInk.beginPath();apronInk.arc(x,79,20,0,Math.PI*2);apronInk.stroke();
   for(let j=0;j<8;j++){const a=j*Math.PI/4;apronInk.beginPath();apronInk.ellipse(x+8*Math.cos(a),79+8*Math.sin(a),8,3,a,0,Math.PI*2);apronInk.stroke();}
   apronInk.beginPath();apronInk.moveTo(x-27,114);apronInk.bezierCurveTo(x-19,101,x-8,132,x,118);apronInk.bezierCurveTo(x+8,132,x+19,101,x+27,114);apronInk.stroke();
  }
  const apronMat=new T.MeshStandardMaterial({map:texture(apron),roughness:.49,metalness:.19});
  for(const side of [-1,1]){
   const face=tz+side*(td/2-.046);
   box(tw-.17,.39,.078,altarLacquer,tx,th-.26,face);
   const carving=mesh(new T.PlaneGeometry(tw-.35,.355),apronMat,tx,th-.26,face+side*.04);carving.rotation.y=side<0?Math.PI:0;carving.name='Gilded lotus apron on the main offering table';
   for(const y of [th-.455,th-.074])box(tw-.14,.044,.043,fuelGold,tx,y,face+side*.031);
  }
  for(const xx of[tx-tw/2+.31,tx-tw/6,tx+tw/6,tx+tw/2-.31])for(const zz of[tz-td/2+.16,tz+td/2-.16]){
   cylinder(.099,.081,th-.19,altarLacquer,xx,(th-.19)/2+.029,zz,interiorRoot,10);
   box(.30,.064,.25,darkwood,xx,.033,zz);
   box(.24,.042,.24,fuelGold,xx,.095,zz);
   box(.27,.09,.26,fuelGold,xx,th-.46,zz);
  }
  obstacle(tx,tz,tw/2+.06,td/2+.05,'供桌');cameraBox(tw,th,td,tx,th/2,tz,'Offering table');
  // Seven water offerings rest on the existing cap; the open bowl profile owns
  // its inner wall, so the inset water never shares a face with a closed lid.
  const offeringBowls=new T.Group();offeringBowls.name='Seven golden water offering bowls';offeringBowls.position.set(tx,th+.045,tz);interiorRoot.add(offeringBowls);
  const bowlProfile=[[0,0],[.10,0],[.12,.025],[.12,.055],[.19,.09],[.275,.18],[.31,.245],[.306,.257],[.29,.26],[.285,.242],[.25,.178],[.17,.108],[.09,.075],[0,.075]].map(([r,y])=>new T.Vector2(r,y));
  const bowlGeometry=new T.LatheGeometry(bowlProfile,32),bowlGold=mat(0xd9ac45,.23,.78),waterGeometry=new T.CircleGeometry(.269,32),waterMaterial=mat(0xb8dced,.18,.04);waterGeometry.rotateX(-Math.PI/2);
  const bowlBatch=new T.InstancedMesh(bowlGeometry,bowlGold,7),waterBatch=new T.InstancedMesh(waterGeometry,waterMaterial,7),bowlPlacement=new T.Matrix4();
  bowlBatch.name='Seven open gold offering bowls';bowlBatch.castShadow=bowlBatch.receiveShadow=true;waterBatch.name='Seven pale blue offering water surfaces';waterBatch.receiveShadow=true;
  for(let i=0;i<7;i++){const x=(i-3)*.92;bowlBatch.setMatrixAt(i,bowlPlacement.makeTranslation(x,0,0));waterBatch.setMatrixAt(i,bowlPlacement.makeTranslation(x,.216,0));}
  for(const batch of[bowlBatch,waterBatch]){batch.instanceMatrix.needsUpdate=true;batch.computeBoundingSphere();offeringBowls.add(batch);}
  offeringBowls.userData={count:7,spacing:.92,waterHeight:.216,waterRadius:.269,waterColor:0xb8dced,tableTop:th+.045};
  const propAnchors={oilLamps:[]};
  const wickFlame=new T.MeshBasicMaterial({color:0xffe2a0});
  function addOilLamp(position,height,label){
   const fallback=new T.Group();fallback.name=label+' fallback';fallback.position.set(...position);
   fallback.scale.setScalar(height/L.props.oilLamps.height);interiorRoot.add(fallback);
   cylinder(.22,.30,.13,bronze,0,.065,0,fallback);
   cylinder(.11,.14,.72,gold,0,.465,0,fallback);
   cylinder(.19,.095,.115,bronze,0,.85,0,fallback);
   const flame=sphere(.055,.15,.055,wickFlame,0,.985,0,fallback);
   flames.push(flame);propAnchors.oilLamps.push({fallback,position,height,label});
  }
  for(const [index,x] of [-6.1,6.1].entries())addOilLamp([x,th+.045,tz],L.props.oilLamps.height,'佛前油灯'+(index+1));
  // Incense burner stays at human scale, independent of the larger statues.
  const burner=new T.Group();burner.name='Human scale incense burner';const burn=L.rituals.incense.burner;burner.position.set(burn.x,0,burn.z);interiorRoot.add(burner);
  for(let i=0;i<3;i++){const a=i*Math.PI*2/3;cylinder(.065,.09,.48,bronze,Math.sin(a)*.235,.28,Math.cos(a)*.235,burner,12);sphere(.09,.055,.09,bronze,Math.sin(a)*.27,.07,Math.cos(a)*.27,burner);}
  sphere(.405,.265,.405,bronze,0,.685,0,burner,28);cylinder(.415,.335,.25,bronze,0,.845,0,burner,32);
  torus(.397,.035,gold,0,.972,0,burner).rotation.x=Math.PI/2;const fallbackAsh=cylinder(.362,.362,.023,mat(0xb5afa0,1),0,.978,0,burner,32);fallbackAsh.name='Fallback incense ash';
  for(const side of[-1,1])torus(.12,.029,bronze,side*.426,.83,0,burner).rotation.y=Math.PI/2;
  propAnchors.burner={fallback:burner,ash:fallbackAsh,position:[burn.x,0,burn.z]};
  obstacle(burn.x,burn.z,.50,.49,'香炉');cameraBox(1,1.24,.98,burn.x,.62,burn.z,'Incense burner');
  const wb=L.props.wealthBurner,wealthBurner=burner.clone(true);wealthBurner.name='Wealth incense burner fallback';wealthBurner.position.set(...wb.position);wealthBurner.scale.setScalar(wb.height/L.props.burner.height);interiorRoot.add(wealthBurner);propAnchors.wealthBurner={fallback:wealthBurner,ash:wealthBurner.getObjectByName('Fallback incense ash'),position:[...wb.position]};
  const [burnerX,burnerBase,burnerZ]=wb.position;
  solid(wb.baseWidth,burnerBase,wb.baseWidth,darkwood,burnerX,burnerBase/2,burnerZ,'财神殿独立香炉座');
  for(const y of [.038,burnerBase-.032]){
   box(wb.baseWidth+.025,.038,wb.baseWidth+.025,y>.1?warmGold:bronze,burnerX,y,burnerZ);
  }
  cameraBox(wb.baseWidth,wb.height,wb.baseWidth,burnerX,burnerBase+wb.height/2,burnerZ,'Wealth incense burner');
  const wealth=L.props.caishen,plinth=wealth.plinth;
  solid(plinth.size[0],plinth.size[1]-.04,plinth.size[2],altarLacquer,plinth.position[0],(plinth.size[1]-.04)/2,plinth.position[2],'财神供台');
  box(plinth.size[0]+.04,.04,plinth.size[2]+.04,warmGold,plinth.position[0],plinth.size[1]-.02,plinth.position[2],interiorRoot,false).name='Wealth altar contact cap';
  box(plinth.size[0]+.076,.065,plinth.size[2]+.074,darkwood,plinth.position[0],.041,plinth.position[2]);
  box(plinth.size[0]+.026,.024,plinth.size[2]+.027,bronze,plinth.position[0],.090,plinth.position[2]);
  const teaRoom=L.sideHalls.find(room=>room.id==='tea');
  const wealthScreenBase=.33,wealthBeam=architecture.pavilionCeilings.tea?.state.perimeterTrimBottom??teaRoom.ceilingY;
  const wealthScreenHeight=wealthBeam-wealthScreenBase-screenCapHeight-.008;
  framedScreen('Caishen red lacquer screen',wealth.position[0],6.72,wealthScreenHeight,wealthScreenBase,teaRoom.bounds[2]+.109,wealthScreen,null,40,true);
  const treasures=addWealthTreasure(T,interiorRoot,teaRoom,wealth,wealthBeam,obstacle,cameraBox);
  for(const {x,z} of treasures.lights){
   const wash=new T.PointLight(0xffc269,20,5.8,2);
   wash.position.set(x,2.25,z);interiorRoot.add(wash);lights.push(wash);
   altarLamps.push({lamp:wash,power:20});
  }
  architecture.state.wealthTreasure=treasures.state;
  cameraBox(plinth.size[0],wealth.height,plinth.size[2],wealth.position[0],wealth.position[1]+wealth.height/2,wealth.position[2],'财神像');
  const {position:[wealthX,,wealthZ],size:[offeringWidth,offeringHeight,offeringDepth]}=L.props.wealthOfferingTable;
  const gifts=new T.Group();gifts.name='Wealth offering table with fruit and lamps';gifts.position.set(wealthX,0,wealthZ);interiorRoot.add(gifts);
  box(offeringWidth,.13,offeringDepth,darkwood,0,offeringHeight-.093,0,gifts,false);
  box(offeringWidth-.088,.028,offeringDepth-.066,paleOak,0,offeringHeight-.014,0,gifts,false);
  box(offeringWidth+.018,.026,offeringDepth+.018,warmGold,0,offeringHeight-.092,0,gifts,false);
  for(const side of [-1,1]){
   const x=side*(offeringWidth/2-.28);
   for(const z of [-.43,.43]){
    box(.22,offeringHeight-.13,.21,wealthLacquer,x,(offeringHeight-.13)/2,z,gifts,false);
    box(.32,.102,.30,darkwood,x,.051,z,gifts,false);
    for(const y of [.14,offeringHeight-.41])box(.251,.038,.238,bronze,x,y,z,gifts,false);
   }
   box(.13,.28,offeringDepth-.26,wealthLacquer,x,offeringHeight-.263,0,gifts,false);
  }
  for(const z of [-.48,.48])box(offeringWidth-.40,.30,.13,wealthLacquer,0,offeringHeight-.293,z,gifts,false);
  const apronZ=.553,apronY=offeringHeight-.291;
  for(const dy of [-.12,.12])box(offeringWidth-.52,.022,.023,bronze,0,apronY+dy,apronZ,gifts,false);
  function ruyiContour(path,s){
   path.moveTo(-.185*s,-.031*s);
   path.bezierCurveTo(-.252*s,.056*s,-.145*s,.091*s,-.091*s,.045*s);
   path.bezierCurveTo(-.049*s,.147*s,.049*s,.147*s,.091*s,.045*s);
   path.bezierCurveTo(.145*s,.091*s,.252*s,.056*s,.185*s,-.031*s);
   path.bezierCurveTo(.103*s,-.102*s,.050*s,-.055*s,0,-.077*s);
   path.bezierCurveTo(-.050*s,-.055*s,-.103*s,-.102*s,-.185*s,-.031*s);
   return path;
  }
  const emblem=ruyiContour(new T.Shape(),1.08);
  emblem.holes.push(ruyiContour(new T.Path(),.78));
  const medallionShape=new T.ExtrudeGeometry(emblem,{depth:.014,curveSegments:5,bevelEnabled:true,bevelThickness:.004,bevelSize:.004,bevelSegments:1});
  const medallions=new T.InstancedMesh(medallionShape,warmGold,9),medallionMatrix=new T.Matrix4();
  medallions.name='Wealth offering table gilded apron relief';
  for(let i=0;i<medallions.count;i++){
   medallions.setMatrixAt(i,medallionMatrix.makeTranslation((i-4)*.491,apronY,apronZ+.004));
  }
  medallions.castShadow=medallions.receiveShadow=true;medallions.instanceMatrix.needsUpdate=true;medallions.computeBoundingSphere();gifts.add(medallions);
  obstacle(wealthX,wealthZ,offeringWidth/2+.01,offeringDepth/2+.01,'财神殿供桌');
  cameraBox(offeringWidth,offeringHeight,offeringDepth,wealthX,offeringHeight/2,wealthZ,'Wealth offering table');
  const mandarin=mat(0xe79435,.47),peach=mat(0xea9a76,.54),cake=mat(0xeecda8,.56),fruitLeaf=mat(0x526331,.67);
  const fruitGeometry=new T.SphereGeometry(1,16,10),presentations=new Map();
  function gift(material,x,y,z,rx,ry,rz){
   let entries=presentations.get(material);
   if(!entries)presentations.set(material,entries=[]);
   entries.push(new T.Matrix4().makeScale(rx,ry,rz).setPosition(x,y,z));
  }
  function tray(x,radius,material,offering){
   const dish=cylinder(radius,radius*.83,.075,material,x,offeringHeight+.038,0,gifts,30);
   dish.name='Wealth offering '+offering;dish.userData.offering=offering;
   const rim=torus(radius-.017,.019,bronze,x,offeringHeight+.082,0);
   rim.rotation.x=Math.PI/2;gifts.add(rim);
  }
  for(const [x,fruit,plate,offering] of [[-1.46,mandarin,celadon,'柑橘'],[0,peach,burgundy,'寿桃']]){
   tray(x,.51,plate,offering);
   for(let i=0;i<6;i++){
    const angle=i*Math.PI/3+.2,dx=Math.cos(angle)*.245,dz=Math.sin(angle)*.245;
    gift(fruit,x+dx,offeringHeight+.205,dz,.133,.127,.135);
    gift(fruitLeaf,x+dx+.04,offeringHeight+.323,dz,.062,.014,.029);
   }
   for(const z of [-.104,.104])gift(fruit,x,offeringHeight+.376,z,.134,.127,.134);
   gift(fruitLeaf,x+.066,offeringHeight+.491,.104,.071,.018,.032);
  }
  tray(1.46,.51,celadon,'糕点');
  for(let i=0;i<6;i++){
   const angle=i*Math.PI/3;
   gift(cake,1.46+Math.cos(angle)*.278,offeringHeight+.128,Math.sin(angle)*.278,.109,.046,.109);
  }
  gift(cake,1.46,offeringHeight+.143,0,.14,.062,.14);
  for(const side of [-1,1])addOilLamp([wealthX+side*2.40,offeringHeight,wealthZ-.12],.76,'财神前油灯'+(side<0?1:2));
  for(const [material,matrices] of presentations){
   const batch=new T.InstancedMesh(fruitGeometry,material,matrices.length);
   batch.name='Tabletop offerings';batch.castShadow=batch.receiveShadow=true;
   matrices.forEach((matrix,index)=>batch.setMatrixAt(index,matrix));
   batch.instanceMatrix.needsUpdate=true;batch.computeBoundingSphere();gifts.add(batch);
  }
  architecture.state.wealthOfferings={types:['柑橘','寿桃','糕点'],oilLamps:2,tableHeight:offeringHeight};
  // Exterior wooden columns stand on the replaced stone, and keep real
  // collision even while the player walks up its surrounding treads.
  for(const h of L.foundations)for(const side of[-1,1])for(const px of[9.2,20.6]){
   const x=h.x+side*px*h.scale,z=h.z+15.45*h.scale;
   obstacle(x,z,.58*h.scale,.58*h.scale,'殿外木柱');cameraBox(1.16*h.scale,13*h.scale,1.16*h.scale,x,h.top+6.5*h.scale,z,'Exterior column');
  }
  architecture.forecourtLanterns=L.forecourtLanterns;
  for(const [x,z,y] of architecture.forecourtLanterns){
   obstacle(x,z,.49,.49,'庭院石灯');
   cameraBox(1.08,1.64,1.08,x,y-floorY+.82,z,'Forecourt stone lantern');
  }
  const fishAnchor=L.anchors.woodfish,[fx,fz]=fishAnchor;box(.95,.045,.86,burgundy,fx,.44,fz);for(const x of[-.31,.31])for(const z of[-.26,.26])box(.09,.42,.09,darkwood,fx+x,.21,fz+z);
  const woodfish=new T.Group();woodfish.name='Woodfish instrument';woodfish.position.set(fx,.48,fz);interiorRoot.add(woodfish);
  sphere(.405,.285,.35,mat(0x92603d,.65),0,.255,0,woodfish,28);sphere(.29,.025,.035,darkwood,0,.235,.32,woodfish,24);
  for(const side of[-1,1]){sphere(.09,.09,.11,gold,side*.30,.31,.19,woodfish);sphere(.022,.024,.018,darkwood,side*.32,.33,.278,woodfish);}
  torus(.075,.025,darkwood,0,.48,-.1,woodfish).rotation.x=-.4;obstacle(fx,fz,.475,.43,'木鱼');cameraBox(.95,1.08,.86,fx,.54,fz,'Woodfish stand');
  const wealthApproach=L.props.wealthBurner.approach;
  const rituals={incense:{...L.rituals.incense,burner:{...L.rituals.incense.burner,y:L.rituals.incense.burner.y+floorY}},wealthIncense:{x:wealthApproach[0],z:wealthApproach[1],burner:{x:wb.position[0],y:wb.position[1]+.972*wb.height/L.props.burner.height+floorY,z:wb.position[2]}},woodfish:{...L.rituals.woodfish,target:{...L.rituals.woodfish.target,y:L.rituals.woodfish.target.y+floorY},mesh:woodfish}};
  Object.assign(rituals.incense.burner,{ashY:.9895+floorY,ashRadius:.362});
  Object.assign(rituals.wealthIncense.burner,{ashY:wb.position[1]+.9895*wealthBurner.scale.y+floorY,ashRadius:.362*wealthBurner.scale.x});
  // Unified mat silhouettes and warm cloth. All seat and NPC assignments are shared.
  const cloth=canvas(256,256),cp=cloth.getContext('2d');cp.fillStyle='#814e45';cp.fillRect(0,0,256,256);cp.strokeStyle='#bda576';cp.lineWidth=3;cp.setLineDash([4,5]);cp.strokeRect(12,12,232,232);cp.setLineDash([]);
  cp.strokeStyle='rgba(214,181,126,.47)';cp.lineWidth=1.8;cp.strokeRect(23,23,210,210);
  for(let y=3;y<256;y+=3){cp.fillStyle=y%2?'rgba(245,208,159,.07)':'rgba(44,24,21,.08)';cp.fillRect(0,y,256,1);}
  for(const x of [26,230])for(const y of [26,230]){
   cp.save();cp.translate(x,y);cp.rotate(Math.PI/4);
   cp.strokeStyle='#c2a16b';cp.lineWidth=2;cp.strokeRect(-12,-12,24,24);cp.strokeRect(-6,-6,12,12);cp.restore();
  }
  const cushionTexture=texture(cloth);
  const cushionMat=new T.MeshStandardMaterial({map:cushionTexture,bumpMap:cushionTexture,bumpScale:.024,roughness:.92,color:0xd9c7b2});
  const shape=new T.Shape(),w=.64,h=.69,r=.08;shape.moveTo(-w+r,-h);shape.lineTo(w-r,-h);shape.quadraticCurveTo(w,-h,w,-h+r);shape.lineTo(w,h-r);shape.quadraticCurveTo(w,h,w-r,h);shape.lineTo(-w+r,h);shape.quadraticCurveTo(-w,h,-w,h-r);shape.lineTo(-w,-h+r);shape.quadraticCurveTo(-w,-h,-w+r,-h);
  const cushionGeo=new T.ExtrudeGeometry(shape,{depth:.09,bevelEnabled:true,bevelThickness:.025,bevelSize:.025,bevelSegments:2,steps:1,curveSegments:3});cushionGeo.rotateX(-Math.PI/2);
  const uv=cushionGeo.attributes.uv,ps=cushionGeo.attributes.position;for(let i=0;i<uv.count;i++)uv.setXY(i,(ps.getX(i)+.7)/1.4,(ps.getZ(i)+.75)/1.5);
  const cushionBase=.045;
  cushionGeo.computeBoundingBox();
  const cushionTop=cushionBase+cushionGeo.boundingBox.max.y;
  for(const q of L.mats){const c=mesh(cushionGeo,cushionMat,q.x,cushionBase,q.z);c.name='Prayer cushion '+q.id;c.castShadow=false;mats.push({...q,mesh:c});}
  function prayerMatLift(x,z){
   // Let the leading foot step up before the actor's centre crosses the rounded edge.
   const stepReach=.18;
   for(const m of mats){
    const dx=Math.abs(x-m.x),dz=Math.abs(z-m.z);
    if(dx>=w+stepReach||dz>=h+stepReach)continue;
    const edge=Math.hypot(Math.max(0,dx-w+r),Math.max(0,dz-h+r))-r;
    return cushionTop*(1-T.MathUtils.smoothstep(edge,0,stepReach));
   }
   return 0;
  }
  const bookMats=[mat(0x657064),mat(0x77594b),mat(0x7c7258),mat(0x50616a)];
  function book(x,y,z,width=.20,height=.4,depth=.28,parent=interiorRoot,orientation=0){const o=box(width,height,depth,bookMats[Math.floor(rnd()*bookMats.length)],x,y+height/2,z,parent,false);o.rotation.y=orientation;o.name='Readable scripture volume';o.userData.bookReadable=true;bookBoxes.push(o);return o;}
  function openBook(x,y,z,parent=interiorRoot){
   const g=new T.Group();g.position.set(x,y,z);parent.add(g);g.name='Open scripture on reading table';
   box(.76,.035,.48,bookMats[1],0,.0175,0,g,false);const left=box(.35,.018,.44,paper,-.18,.05,0,g,false),right=box(.35,.018,.44,paper,.18,.05,0,g,false);left.rotation.z=-.06;right.rotation.z=.06;
   for(const page of[left,right]){page.userData.bookReadable=true;interactables.push(page);}for(let j=0;j<5;j++)box(.22,.003,.006,ink,-.18,.066,-.15+j*.065,g);
   return g;
  }
  function teaSet(x,y,z,scale=1,parent=interiorRoot,withDisplayCups=true){
   const g=new T.Group();g.name='Celadon tea service';g.position.set(x,y,z);g.scale.setScalar(scale);parent.add(g);
   box(.80,.035,.50,darkwood,0,.0175,0,g);sphere(.135,.105,.12,celadon,-.13,.145,0,g);cylinder(.055,.08,.04,celadon,-.13,.25,0,g);torus(.09,.018,celadon,.02,.15,0,g).rotation.y=Math.PI/2;
   if(withDisplayCups)for(const xx of[-.25,.23]){cylinder(.065,.05,.085,celadon,xx,.078,.16,g,16);cylinder(.066,.066,.012,paper,xx,.126,.16,g,16);}
   return g;
  }
  const jarProfile=[[0,0],[.13,0],[.17,.035],[.15,.095],[.22,.17],[.238,.28],[.20,.38],[.117,.45],[.091,.51],[.096,.59],[.111,.61],[.111,.64],[.083,.64],[.083,.60],[.071,.58],[.070,.52],[.099,.46],[.16,.40],[.17,.35],[0,.32]];
  const vaseGeo=new T.LatheGeometry(jarProfile.map(point=>new T.Vector2(...point)),24);
  const ivoryCeramic=mat(0xeae0c6,.36,.02),mistCeramic=mat(0x9db8ae,.38,.02),blueCeramic=mat(0x718e9d,.43,.03);
  function shelfVase(parent,x,y,z,size,tone){
   const vase=mesh(vaseGeo,tone,x,y,z,parent);vase.name='Antique display ceramic vase';vase.scale.setScalar(size);
   const border=torus(.106*size,.012*size,warmGold,x,y+.61*size,z,parent);border.rotation.x=Math.PI/2;
   return vase;
  }
  function stitchedBook(x,base,z,washed,depth,parent){
   const width=washed?.48:.14,height=washed?.087:.35;
   book(x,base,z,width,height,depth,parent);
   const pageZ=z+depth/2+.002;
   box(washed?width*.86:.035,washed?height*.48:.20,.007,paper,x,base+height*.56,pageZ,parent);
   if(!washed)for(const y of [.05,.15,.25])box(width*.92,.009,.010,linen,x,base+y,pageZ+.006,parent);
  }
  // Stain the two end faces of one tabletop. Separate rim solids shared its top plane.
  const lowTableTop=new T.BoxGeometry(1,1,1);
  const endFaceStart=lowTableTop.groups[4].start;
  lowTableTop.clearGroups();
  lowTableTop.addGroup(0,endFaceStart,0);
  lowTableTop.addGroup(endFaceStart,lowTableTop.index.count-endFaceStart,1);
  const lowTableFinish=[wood,paleOak];
  const furniture=[];
  for(const f of D.furniture){
   if(f.id==='incense'||f.id==='woodfish')continue;
   const [x,,z]=f.position,[fw,fh,fd]=f.size;
   if(f.type.includes('table')){
    if(f.type.endsWith('-low')){
     const top=mesh(lowTableTop,lowTableFinish,x,fh-.0225,z);
     top.scale.set(fw+.025,.081,fd+.025);
     top.name='Low table top '+f.id;
     const support=new T.TubeGeometry(new T.QuadraticBezierCurve3(new T.Vector3(0,.044,0),new T.Vector3(-.17,.26,0),new T.Vector3(0,fh-.063,0)),9,.027,6,false);
     for(const edge of [-1,1]){
      const xx=x+edge*(fw/2-.10);
      box(.118,.055,fd-.11,oakEdge,xx,.029,z);
      box(.14,.065,fd-.09,wood,xx,fh-.063,z);
      for(let n=-3;n<=3;n++){
       const leg=mesh(support,wood,xx,0,z+n*(fd-.25)/7);leg.scale.x=edge;
      }
     }
    }else{
    box(fw,.07,fd,paleOak,x,fh-.035,z);box(fw+.035,.018,fd+.035,paleOak,x,fh+.009,z);
    for(const side of [-1,1]){
     box(fw-.12,.135,.087,oakEdge,x,fh-.135,z+side*(fd/2-.06));
     box(fw-.20,.019,.045,warmGold,x,fh-.162,z+side*(fd/2-.011));
     box(.065,.135,fd-.13,oakEdge,x+side*(fw/2-.055),fh-.135,z);
     for(const dz of[-fd/2+.12,fd/2-.12]){
      const xx=x+side*(fw/2-.12),zz=z+dz;
      cylinder(.077,.051,fh-.06,oakEdge,xx,(fh-.06)/2,zz,interiorRoot,10);box(.15,.042,.15,paleOak,xx,.022,zz);
     }
    }
    }
    obstacle(x,z,fw/2,fd/2,f.id);cameraBox(fw,fh,fd,x,fh/2,z,f.id);
    if(f.type.includes('reading')){openBook(x,fh+.02,z);if(!f.type.endsWith('-low')){shelfVase(interiorRoot,x+.19,fh+.02,z-.94,.49,blueCeramic);box(.27,.024,.20,ink,x+.15,fh+.032,z+.54);}}
    else{const service=teaSet(x,fh+.02,z,.78,interiorRoot,!L.seats.some(s=>s.action==='tea'&&s.tableId===f.id));service.userData.tableId=f.id;}
   }else if(f.type==='scripture-display-console'){
    box(fw,.085,fd,wood,x,fh-.043,z);
    box(fw-.10,.115,fd-.09,oakEdge,x,fh-.140,z);
    for(const dx of [-fw/2+.15,fw/2-.15])for(const dz of [-fd/2+.12,fd/2-.12])box(.084,fh-.075,.087,wood,x+dx,(fh-.075)/2,z+dz);
    shelfVase(interiorRoot,x-1.55,fh,z,.90,blueCeramic);shelfVase(interiorRoot,x+1.50,fh,z,.78,mistCeramic);
    for(let i=0;i<3;i++)stitchedBook(x+.71,fh+i*.088,z+.02,true,.43,interiorRoot);
    obstacle(x,z,fw/2,fd/2,f.id);cameraBox(fw,fh,fd,x,fh/2,z,f.id);
   }else if(f.type==='scripture-bookcase'){
    const alongX=fw>fd,span=alongX?fw:fd,depth=alongX?fd:fw;
    const group=new T.Group();group.name='Bogugu antiquarian shelves '+f.id;group.position.set(x,0,z);group.rotation.y=f.front==='-X'?-Math.PI/2:alongX?0:Math.PI/2;interiorRoot.add(group);
    const bays=Math.ceil(span/2.35),bay=span/bays;
    const bookcase=f.style==='books',cabinet=f.style==='cabinet';
    box(span,fh,.075,warmIvory,0,fh/2,-depth/2+.039,group);
    const plinth=cabinet?.13:.28;
    box(span,plinth,depth,paleOak,0,plinth/2,0,group);
    for(let i=0;i<=bays;i++)box(.095,fh,depth,oakEdge,-span/2+i*bay,fh/2,0,group);
    for(let i=0;i<bays;i++){
     const mid=-span/2+(i+.5)*bay,split=mid+(i%2?.30:-.30);
     const heights=cabinet?[.17,.56]:bookcase?[.31,1.11,1.91,2.71,3.39]:i%2?[.31,1.06,2.13,3.10]:[.31,1.32,2.45,3.19];
     for(const [row,y] of heights.entries()){
      box(bay,.065,depth,paleOak,mid,y,0,group);
      box(bay-.08,.023,.037,warmGold,mid,y-.008,depth/2+.009,group);
      const smallCell=!bookcase&&!cabinet&&(i+row)%3!==1;
      if(smallCell){
       const partition=heights[row+1]??fh-.08;
       box(.076,partition-y-.06,depth*.86,oakEdge,split,(partition+y)/2,.02,group);
       const displayX=mid+(i%2?.68:-.68);
       shelfVase(group,displayX,y+.034,.06,.81+(row%2)*.22,[mistCeramic,ivoryCeramic,blueCeramic][(row+i)%3]);
       for(let k=0;k<3;k++)stitchedBook(mid+(i%2?-.27:.27)+k*.036,y+.037+k*.088,.02,true,.51,group);
      }else{
       if(!bookcase&&row<heights.length-1)shelfVase(group,mid+bay*.30,y+.034,0,cabinet?.44:.60,[mistCeramic,ivoryCeramic,blueCeramic][(row+i)%3]);
       const count=Math.floor((bay-(bookcase?.25:.75))/.184);
       for(let k=0;k<count;k++)stitchedBook(mid-bay/2+.18+k*.184,y+.035,depth*.085,false,depth*.73,group);
      }
     }
    }
    box(span+.05,.135,depth+.025,oakEdge,0,fh-.065,0,group);
    if(cabinet){shelfVase(group,-span*.31,fh,0,.64,mistCeramic);shelfVase(group,span*.25,fh,0,.54,blueCeramic);}
    obstacle(x,z,fw/2,fd/2,f.id);cameraBox(fw,fh,fd,x,fh/2,z,f.id);
   }else if(f.type==='tea-ceramic-cabinet'){
    solid(fw,fh,fd,wood,x,fh/2,z,f.id);for(let i=0;i<6;i++){const xx=x-fw/2+(i+.5)*fw/6;box(fw/6-.06,fh-.15,.035,redwood,xx,fh/2,z+fd/2+.015);sphere(.024,.024,.018,bronze,xx+.16,fh/2,z+fd/2+.045);}
    teaSet(x,fh+.03,z,1.4);sphere(.13,.22,.13,celadon,x+fw*.36,fh+.22,z);sphere(.4,.5,.25,mat(0x5b7253),x+fw*.36,fh+.66,z);
   }
   furniture.push({...f});
  }
  // A fixed low footrest follows every chair's facing. It is part of the same
  // reservable seat collider, so controlled seating can ignore it safely.
  const reedCushion=new T.LatheGeometry([[0,0],[.35,0],[.406,.023],[.427,.057],[.423,.122],[.395,.151],[.33,.16],[0,.16]].map(([r,y])=>new T.Vector2(r,y)),32);
  for(const seat of L.seats.filter(s=>s.room!=='garden')){
   const [x,y,z]=seat.position,g=new T.Group();g.name='Activity seat '+seat.id;g.position.set(x,0,z);g.rotation.y=seat.yaw;interiorRoot.add(g);
   let target;
   if(seat.seatHeight>.25){
    target=box(.72,.055,.65,libraryLinen,0,seat.seatHeight-.0275,0,g,false);
    box(.74,.095,.66,paleOak,0,seat.seatHeight-.101,0,g);
    for(const dx of[-.29,.29]){
     for(const dz of[-.24,.24])box(.077,seat.seatHeight-.07,.077,oakEdge,dx,(seat.seatHeight-.07)/2,dz,g);
     box(.063,.68,.071,oakEdge,dx,.68,-.356,g);
     box(.056,.043,.57,paleOak,dx,.696,-.075,g);
     box(.052,.23,.054,oakEdge,dx,.576,.172,g);
    }
    box(.648,.083,.096,paleOak,0,1.013,-.356,g);
    box(.55,.095,.033,libraryLinen,0,.84,-.357,g);
    for(const dx of [-.21,-.105,0,.105,.21])box(.025,.19,.028,oakEdge,dx,.828,-.37,g);
    box(.62,.055,.28,paleOak,0,.1525,.36,g);for(const dx of[-.25,.25])box(.075,.125,.075,oakEdge,dx,.0625,.36,g);
    // Footrest top=.18, dimensioned to the original short-legged character.
   }else if(seat.room==='scripture'){
    target=mesh(reedCushion,blindReed,0,0,0,g);
    for(const [r,y] of [[.401,.040],[.421,.073],[.416,.111],[.389,.142],[.341,.157],[.275,.161],[.194,.161],[.117,.161]])torus(r,.006,linen,0,y,0,g).rotation.x=Math.PI/2;
   }else{target=mesh(cushionGeo,cushionMat,0,.035,0,g);target.scale.set(.78,.9,.78);target.castShadow=false;}
   target.name='Clickable seat '+seat.id;target.userData.seatId=seat.id;target.userData.seatHeight=seat.seatHeight;interactables.push(target);
   obstacle(x,z,seat.seatHeight>.25?.37:.50,seat.seatHeight>.25?.33:.54,'Seat '+seat.id,{seatId:seat.id});
   cameraBox(seat.seatHeight>.25?.74:1.0,seat.seatHeight,seat.seatHeight>.25?.66:1.08,x,seat.seatHeight/2,z,'Seat '+seat.id);
   if(seat.action==='tea'){
    const table=D.furniture.find(f=>f.id===seat.tableId),c=Math.cos(seat.yaw),s=Math.sin(seat.yaw);
    const cup=new T.Group();cup.name=seat.id+' resting cup';cup.userData.cupForSeat=seat.id;cup.rotation.y=seat.yaw;interiorRoot.add(cup);
    // The short floor chair uses a higher table than the old animation's
    // seatHeight+.28 rest pose. Keep the real cup on the actual finished top;
    // export that same target for the hand animation to reach and return it.
    const halfX=Math.abs(c)*.116+Math.abs(s)*.065,halfZ=Math.abs(s)*.116+Math.abs(c)*.065;
    const tx=table.position[0],tz=table.position[2],top=table.size[1]+.018;
    const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
    cup.position.set(clamp(x+c*.185+s*.375,tx-table.size[0]/2+halfX+.012,tx+table.size[0]/2-halfX-.012),top,clamp(z-s*.185+c*.375,tz-table.size[2]/2+halfZ+.012,tz+table.size[2]/2-halfZ-.012));
    mesh(new T.CylinderGeometry(.065,.047,.105,20,1,true),celadon,0,.0525,0,cup);
    cylinder(.048,.048,.008,celadon,0,.006,0,cup,20);
    cylinder(.058,.058,.003,mat(0x896d3f),0,.094,0,cup,20);
    torus(.064,.006,celadon,0,.105,0,cup).rotation.x=Math.PI/2;
    torus(.032,.009,celadon,.075,.055,0,cup);
    const dx=cup.position.x-x,dz=cup.position.z-z;
    seatProps[seat.id]={cup,tableId:table.id,cupTarget:{x:c*dx-s*dz,y:top-(seat.actorRootY??0),z:s*dx+c*dz},tableTopY:floorY+top};
   }
  }
  // Soft local lighting retains gold separation; the large hall is not flooded
  // with dozens of per-object point lights.
  const ambient=new T.AmbientLight(0xf5dfbf,.59);scene.add(ambient);lights.push(ambient);
  const hemi=new T.HemisphereLight(0xe6e9df,0x856044,.75);scene.add(hemi);lights.push(hemi);
  const key=new T.DirectionalLight(0xffdfac,2.23);key.position.set(-7,13,14);key.target.position.set(0,6,-9);key.castShadow=true;key.userData.hallShadow=true;key.shadow.mapSize.set(1024,1024);Object.assign(key.shadow.camera,{left:-23,right:23,top:23,bottom:-23,near:.5,far:65});key.shadow.normalBias=.025;interiorRoot.add(key,key.target);lights.push(key);
  const rim=new T.DirectionalLight(0xbfd5d0,.57);rim.position.set(15,17,-9);rim.target.position.set(0,7,-8);interiorRoot.add(rim,rim.target);lights.push(rim);
  architecture.setLight=(time,weather)=>{
   const night=time==='night', dusk=time==='sunset';
   ambient.intensity=night?.53:.59;
   hemi.color.set(night?0xc3cae7:dusk?0xeabca2:0xe6e9df);
   key.color.set(night?0xffcb83:dusk?0xffb36e:0xffdfac);
   key.intensity=(night?1.68:dusk?2.37:2.23)*(weather==='clear'?1:.77);
   rim.intensity=night?.34:.57;
   for(const {lamp,power} of altarLamps)lamp.intensity=power*(night?1.2:dusk?1.08:1);
  };
  architecture.state.mainHallPendantsRemoved=true;
  architecture.state.sideRoomLanternsRemoved=true;
  architecture.state.centralDoorLanternRemoved=true;
  // Burning incense owns its smoke. An empty or extinguished burner is quiet.
  // Instance repeated architectural boxes by material after all interactive objects
  // are recorded. Book spines, seats and ritual props deliberately retain their tags.
  interiorRoot.updateMatrixWorld(true);
  const grouped=new Map();for(const o of batchBoxes){if(!grouped.has(o.material))grouped.set(o.material,[]);grouped.get(o.material).push(o);}
  const inverseRoot=interiorRoot.matrixWorld.clone().invert();
  for(const[material,objects]of grouped){if(objects.length<4)continue;const instanced=new T.InstancedMesh(unitBox,material,objects.length);instanced.name='Approved architectural details';instanced.castShadow=instanced.receiveShadow=true;for(let i=0;i<objects.length;i++){instanced.setMatrixAt(i,objects[i].matrixWorld.clone().premultiply(inverseRoot));objects[i].removeFromParent();}instanced.instanceMatrix.needsUpdate=true;interiorRoot.add(instanced);}
  // A click on any book instance opens the curated random reading collection.
  // Four cover batches keep hundreds of readable book spines inexpensive.
  const bookGroups=new Map();for(const o of bookBoxes){if(!bookGroups.has(o.material))bookGroups.set(o.material,[]);bookGroups.get(o.material).push(o);}
  for(const[material,objects]of bookGroups){const instanced=new T.InstancedMesh(unitBox,material,objects.length);instanced.name='Readable scripture volumes';instanced.userData.bookReadable=true;instanced.userData.volumeCount=objects.length;instanced.castShadow=instanced.receiveShadow=true;for(let i=0;i<objects.length;i++){instanced.setMatrixAt(i,objects[i].matrixWorld.clone().premultiply(inverseRoot));objects[i].removeFromParent();}instanced.instanceMatrix.needsUpdate=true;instanced.computeBoundingSphere();interiorRoot.add(instanced);interactables.push(instanced);}
  architecture.state.readableVolumes=bookBoxes.length;
  // Fixtures attach to the new continuous roof, never the retired source triangles.
  for(const z of beamStations)for(const x of[-10.4,0,10.4]){
   const supportY=architecture.shell.roofAt(x,z),beamTopY=16.4,h=supportY-beamTopY;
   if(h>0){const post=box(.26,h,.28,wood,x,(supportY+beamTopY)/2,z,interiorRoot,false);post.name='Measured roof-contact timber strut';post.userData.roofContact={x,z,supportY,beamTopY};}
  }
  // Keep three spatial batches so a side hall can still be culled separately.
  // Only fixed architectural boxes are combined; gameplay props stay separate.
  interiorRoot.updateMatrixWorld(true);
  const fixedGroups=new Map();
  for(const o of interiorRoot.children){
   if(!o.isMesh||o.isInstancedMesh||o.geometry!==unitBox||Array.isArray(o.material)||!/wall|ceiling|timber|jamb|lintel|fascia|substrate|stile|floor/i.test(o.name))continue;
   const region=o.position.x<-25?'scripture':o.position.x>25?'wealth':'hall',key=[region,o.material.uuid,o.castShadow,o.receiveShadow,o.layers.mask].join(':');
   if(!fixedGroups.has(key))fixedGroups.set(key,[]);fixedGroups.get(key).push(o);
  }
  let mergedParts=0,buildingBatches=0;
  for(const objects of fixedGroups.values()){
   if(objects.length<2)continue;const first=objects[0],batch=new T.InstancedMesh(unitBox,first.material,objects.length);
   batch.name='Static building batch '+buildingBatches++;batch.castShadow=first.castShadow;batch.receiveShadow=first.receiveShadow;batch.layers.mask=first.layers.mask;batch.userData.sourceNames=objects.map(o=>o.name);
   objects.forEach((o,i)=>{batch.setMatrixAt(i,o.matrixWorld.clone().premultiply(inverseRoot));o.layers.mask=0;o.userData.batchedSource=true;});
   batch.instanceMatrix.needsUpdate=true;batch.computeBoundingSphere();interiorRoot.add(batch);mergedParts+=objects.length;
  }
  architecture.state.staticBatching={mergedParts,batches:buildingBatches,regions:3,collision:'unchanged'};
  const trianglesFor=role=>architecture.shell.meshes.filter(m=>m.userData.role===role).reduce((n,m)=>n+(m.geometry.index?.count??m.geometry.attributes.position.count)/3,0);
  Object.assign(architecture.state,{shellReady:true,shellVersion:architecture.shell.spec.id,wallReady:true,wallTriangles:trianglesFor('wall'),roofReady:true,roofTriangles:trianglesFor('roof'),perimeterReady:true,perimeterSolidParts:architecture.shell.prisms.length,retiredSourceSkins:true,ready:true});
  const roofReady=Promise.resolve(architecture.shell);
  architecture.decor=window.TempleDecor?.architecture(T,{interiorRoot,architecture});
  const updatePrints=window.TempleWallPrints?.create(T,interiorRoot,architecture.shell.spec,L.sideHalls,architecture.entryFrame?.roomSideOuterHalfWidth);
  function update(time,dt,playerPosition,viewPosition=playerPosition,effects=1){
   updatePrints?.(playerPosition);treasures.update(time,viewPosition,effects);
   for(let i=0;i<flames.length;i++)flames[i].scale.y=1+Math.sin(time*4.7+i)*.09;
  }
  return {scene,interiorRoot,floorY,mats,prayerMatLift,obstacles,cameraObstacles,flames,smoke,lights,sideRooms,floorCoverage,statue,rituals,propAnchors,interactables,seats:L.seats,seatProps,furniture,architecture,roofReady,update};
 }};
 function addWealthTreasure(T,parent,room,wealth,beamBottom,obstacle,cameraBox){
  const root=new T.Group();
  root.name='Caishen treasure from screen pillars to throne';
  parent.add(root);
  let seed=68351;
  const random=()=>((seed=(Math.imul(seed,1664525)+1013904223)>>>0)/4294967296);
  const metal=(color,emissive,strength)=>new T.MeshStandardMaterial({
   color,metalness:.65,roughness:.30,emissive,emissiveIntensity:strength
  });
  const gold=metal(0xffbf42,0xff9418,.24),silver=metal(0xecedf2,0xc0c6eb,.15);
  const bronze=metal(0xc48938,0xce6b10,.14);
  const jade=new T.MeshStandardMaterial({color:0x37b887,metalness:.20,roughness:.28,emissive:0x1dcc8a,emissiveIntensity:.19});
  const pearl=new T.MeshStandardMaterial({color:0xffefcb,metalness:.24,roughness:.24,emissive:0xffdbb3,emissiveIntensity:.12});
  const gemColors=[0xff385e,0x53a9ff,0xaa66ff,0x36efad];
  const gems=gemColors.map(color=>new T.MeshStandardMaterial({
   color,roughness:.21,metalness:.30,emissive:color,emissiveIntensity:.27,flatShading:true
  }));
  const lacquer=new T.MeshStandardMaterial({color:0x64221c,roughness:.46});
  const silk=new T.MeshStandardMaterial({color:0x991b36,roughness:.82});
  const cube=new T.BoxGeometry(1,1,1);
  const bead=new T.SphereGeometry(1,10,7),gem=new T.IcosahedronGeometry(1,0);
  const bar=new T.CylinderGeometry(.78,1,1,4).rotateY(Math.PI/4);
  bar.translate(0,.5,0);
  const ingot=new T.LatheGeometry([
   [0,0],[.64,0],[.87,.12],[1,.42],[.96,.49],[.8,.36],[.48,.31],[0,.34]
  ].map(([r,y])=>new T.Vector2(r,y)),24);
  const ip=ingot.attributes.position;
  for(let i=0;i<ip.count;i++){
   const x=ip.getX(i),y=ip.getY(i);
   ip.setY(i,y+.38*x*x*Math.min(1,y/.37));
  }
  ingot.computeVertexNormals();
  const cashShape=new T.Shape();
  cashShape.absarc(0,0,1,0,Math.PI*2,false);
  const square=new T.Path();
  square.moveTo(-.28,-.28);square.lineTo(-.28,.28);square.lineTo(.28,.28);square.lineTo(.28,-.28);square.closePath();
  cashShape.holes.push(square);
  const cash=new T.ExtrudeGeometry(cashShape,{depth:.14,curveSegments:6,bevelEnabled:false}).rotateX(-Math.PI/2);
  const bracelet=new T.TorusGeometry(1,.16,6,24).rotateX(-Math.PI/2);
  const pendantShape=new T.Shape();
  pendantShape.moveTo(0,1);pendantShape.bezierCurveTo(.96,1,1.15,.16,.63,-.52);
  pendantShape.quadraticCurveTo(0,-1.14,-.63,-.52);pendantShape.bezierCurveTo(-1.15,.16,-.96,1,0,1);
  const eye=new T.Path();
  eye.absarc(0,.42,.18,0,Math.PI*2,true);pendantShape.holes.push(eye);
  const pendant=new T.ExtrudeGeometry(pendantShape,{depth:.12,curveSegments:7,bevelThickness:.045,bevelSize:.04,bevelSegments:1}).rotateX(-Math.PI/2);
  const ruyiPath=new T.CatmullRomCurve3([[0,0,-.90],[.14,0,-.48],[.19,0,.10],[-.03,0,.56],[-.20,0,.66]].map(v=>new T.Vector3(...v)));
  const ruyi=new T.TubeGeometry(ruyiPath,12,.12,7,false);
  const batches=new Map(),pose=new T.Object3D(),sparkles=[];
  function piece(name,geometry,material,x,y,z,sx,sy,sz,yaw=0,tilt=0,placement){
   const key=name+' '+material.id;
   if(!batches.has(key))batches.set(key,{name,geometry,material,matrices:[]});
   pose.position.set(x,y,z);pose.scale.set(sx,sy,sz);pose.rotation.set(tilt,yaw,0);pose.updateMatrix();
   const matrix=pose.matrix.clone();
   if(placement)matrix.premultiply(placement);
   batches.get(key).matrices.push(matrix);
  }
  function shine(x,y,z,color,size){sparkles.push({x,y,z,color,size,phase:random()*Math.PI*2});}
  function treasure(kind,x,y,z,size,yaw,variant=0){
   items+=kind===3?4:1;
   switch(kind){
    case 0: case 1: {
     const finish=kind===0?gold:silver;
     piece(kind===0?'Gold sycee':'Silver sycee',ingot,finish,x,y,z,size,size,size*.56,yaw);
     piece('Sycee rounded centre',bead,finish,x,y+size*.37,z,size*.37,size*.19,size*.27,yaw);
     if(size>.27)shine(x,y+size*.71,z,kind===0?0xffc348:0xffebcb,size*.65);
     return size*.46;
    }
    case 2:
     piece('Stamped bullion',bar,variant%3===0?silver:gold,x,y,z,size,size*.41,size*.64,yaw);
     return size*.41;
    case 3:
     for(let i=0;i<4;i++)piece('Square-holed cash',cash,i===3?gold:bronze,x+i*.006,y+i*size*.15,z,size*.68,size,size*.68,yaw+i*.3);
     return size*.58;
    case 4:
     piece('Carved jade pendant',pendant,jade,x,y+.03,z,size*.62,size,size,yaw);
     piece('Pendant gold eyelet',bracelet,gold,x+Math.sin(yaw)*size*.42,y+.06,z+Math.cos(yaw)*size*.42,size*.13,size*.13,size*.13);
     shine(x,y+.18,z,0x62ffca,size*.78);
     return size*.20;
    case 5:
     piece('Jade bangle',bracelet,jade,x,y+size*.16,z,size,size,size,yaw);
     return size*.32;
    case 6:
     for(let i=0;i<15;i++){
      const angle=yaw+i*Math.PI*2/15,r=size*.72;
      piece('Pearl necklace',bead,pearl,x+Math.cos(angle)*r,y+size*.20,z+Math.sin(angle)*r*.69,size*.18,size*.18,size*.18);
     }
     shine(x,y+size*.3,z,0xffecd3,size*.62);
     return size*.33;
    default:
     piece('Faceted ruby sapphire amethyst emerald',gem,gems[variant%4],x,y+size*.58,z,size*.71,size*.66,size*.70,yaw);
     shine(x,y+size*1.06,z,gemColors[variant%4],size*1.13);
     return size*1.1;
   }
  }
  function casket(x,y,z,yaw){
   items++;
   const lidTilt=-.91;
   piece('Lacquer jewel chest',cube,lacquer,x,y+.19,z,.86,.38,.57,yaw);
   piece('Silk-lined chest',cube,silk,x,y+.383,z,.77,.029,.49,yaw);
   const lidX=x-Math.sin(yaw)*.43,lidZ=z-Math.cos(yaw)*.43;
   piece('Open gilt chest lid',cube,bronze,lidX,y+.59,lidZ,.89,.072,.54,yaw,lidTilt);
   piece('Chest jade clasp',bead,jade,x+Math.sin(yaw)*.30,y+.27,z+Math.cos(yaw)*.30,.105,.08,.045,yaw);
   for(let i=0;i<5;i++)treasure(i%2===0?7:6,x+(i-2)*.125,y+.40,z,.13,yaw,i);
  }
  const lights=[],counts={};
  const rear=room.bounds[2],centre=wealth.position[0],floor=-.012;
  const profiles=[
   {x:4.78,z:2.80,rx:1.94,rz:2.53,peak:4.24},
   {x:6.13,z:3.58,rx:2.50,rz:2.67,peak:3.88},
   {x:5.10,z:4.83,rx:2.25,rz:2.28,peak:3.28},
   {x:6.06,z:6.51,rx:2.10,rz:1.61,peak:1.43}
  ];
  const bounds={left:2.84,right:8.64,back:.22,front:8.15};
  function height(u,v,side){
   let y=0;
   for(const {x,z,rx,rz,peak} of profiles){
    const r=Math.hypot((u-x)/rx,(v-z)/rz);
    y=Math.max(y,peak*Math.pow(Math.max(0,1-r*r),1.58));
   }
   const roughness=.067*Math.sin(9*u+3*v+side)*Math.sin(11*v-2*u)+.037*Math.cos(17*u-14*v);
   return floor+y+roughness*Math.min(1,y*3);
  }
  const bulkMetal=metal(0xffffff,0xff8a19,.15);
  const earth=new T.MeshStandardMaterial({vertexColors:true,color:0xffffff,emissive:0xb96110,emissiveIntensity:.12,roughness:.75,metalness:.33});
  const bulkCoin=new T.CircleGeometry(1,7).rotateX(-Math.PI/2);
  const bulkNote=new T.PlaneGeometry(1,1).rotateX(-Math.PI/2);
  const bulkGem=new T.OctahedronGeometry(1,0);
  const bulkBatches=[
   {name:'Loose gold and silver coins',geometry:bulkCoin,entries:[]},
   {name:'Small gold bars',geometry:bar,entries:[]},
   {name:'Loose gold foil notes',geometry:bulkNote,entries:[]},
   {name:'Small coloured jewels',geometry:bulkGem,entries:[]}
  ];
  const goldTints=[0xb27424,0xd8972d,0xeab142,0xffca55,0xffe299];
  const surfaceTints=[0x996024,0xb47b27,0xb88b34,0xd59c39,0xc98b2c];
  function mound(side){
   const surface=new T.PlaneGeometry(bounds.right-bounds.left,bounds.front-bounds.back,45,56).rotateX(-Math.PI/2);
   const vertices=surface.attributes.position,colors=[],tint=new T.Color();
   for(let i=0;i<vertices.count;i++){
    const u=vertices.getX(i)+(bounds.left+bounds.right)/2,v=vertices.getZ(i)+(bounds.back+bounds.front)/2;
    vertices.setXYZ(i,centre+side*u,height(u,v,side)-.009,rear+v);
    tint.set(surfaceTints[Math.floor(random()*surfaceTints.length)]);
    colors.push(tint.r,tint.g,tint.b);
   }
   if(side<0){
    const index=surface.index;
    for(let i=0;i<index.count;i+=3){const second=index.getX(i+1);index.setX(i+1,index.getX(i+2));index.setX(i+2,second);}
   }
   surface.setAttribute('color',new T.Float32BufferAttribute(colors,3));
   surface.computeVertexNormals();
   const hill=new T.Mesh(surface,earth);
   hill.name='Supported gold mound '+side;hill.receiveShadow=true;root.add(hill);
   // Trace the mound's footprint in short strips so the side walkway follows its outline.
   const dz=.52;
   for(let v=bounds.back+dz/2;v<bounds.front;v+=dz){
    let left=Infinity,right=-Infinity,y=0;
    for(let u=bounds.left;u<=bounds.right;u+=.12){
     const h=Math.max(...[-dz/2,0,dz/2].map(d=>height(u,v+d,side)));
     if(h<.10)continue;
     left=Math.min(left,u);right=Math.max(right,u);y=Math.max(y,h);
    }
    if(right<=left)continue;
    const x=centre+side*(left+right)/2,z=rear+v,rx=(right-left)/2+.09;
    obstacle(x,z,rx,dz/2,'财神殿财宝堆');
    cameraBox(rx*2,y+.23,dz,x,(y+.23)/2,z,'Wealth treasure pile');
   }
  }
  function propTexture(width,height,draw){
   const canvas=document.createElement('canvas');
   canvas.width=width;canvas.height=height;
   draw(canvas.getContext('2d'),width,height);
   const texture=new T.CanvasTexture(canvas);
   texture.colorSpace=T.SRGBColorSpace;texture.anisotropy=4;
   return texture;
  }
  function noteFace(foil){
   return new T.MeshStandardMaterial({
    roughness:foil?.38:.89,metalness:foil?.42:.02,
    map:propTexture(256,112,(ink,w,h)=>{
     ink.fillStyle=foil?'#eab345':'#b8c4a3';ink.fillRect(0,0,w,h);
     ink.strokeStyle=foil?'#91621d':'#536e4a';ink.lineWidth=3;ink.strokeRect(8,8,w-16,h-16);
     ink.lineWidth=1;ink.strokeRect(14,14,w-28,h-28);
     ink.fillStyle=foil?'#795117':'#304a36';ink.textAlign='center';
     ink.font='bold 22px Georgia';ink.fillText('100',40,42);ink.fillText('100',216,92);
     ink.font='bold 38px Georgia';ink.fillText('$',128,69);
     ink.font='bold 13px sans-serif';ink.fillText('USD',128,91);
     ink.strokeStyle=foil?'#ab7421':'#758d68';ink.beginPath();ink.ellipse(128,54,32,34,0,0,Math.PI*2);ink.stroke();
    })
   });
  }
  const usd=noteFace(false),foil=noteFace(true);
  const paperEdge=new T.MeshStandardMaterial({color:0xb9c6a6,roughness:.8});
  const band=new T.MeshStandardMaterial({color:0xecdbc9,roughness:.75});
  function bills(x,y,z,width,yaw,gilded,bundled){
   const thick=bundled?.092:.009,depth=width*.44;
   const type=gilded?'Gold foil US dollar notes':'US dollar bundles';
   piece(type,cube,gilded?gold:paperEdge,x,y+thick/2,z,width,thick,depth,yaw);
   piece(type+' face',bulkNote,gilded?foil:usd,x,y+thick+.001,z,width,1,depth,yaw);
   if(bundled)piece('US dollar bundle paper strap',cube,band,x,y+thick*.49,z,width*.17,thick+.007,depth+.008,yaw);
   if(gilded)shine(x,y+thick+.07,z,0xffd86b,.16);
   items++;
  }
  function bottleGeometry(profile){return new T.LatheGeometry(profile.map(([r,y])=>new T.Vector2(r,y)),16);}
  const redWine=bottleGeometry([[0,0],[.10,0],[.119,.038],[.119,.43],[.108,.49],[.048,.59],[.044,.78],[.053,.80],[0,.80]]);
  const maotai=bottleGeometry([[0,0],[.108,0],[.129,.041],[.132,.39],[.127,.46],[.094,.52],[.059,.57],[.057,.68],[0,.68]]);
  const greenGlass=new T.MeshStandardMaterial({color:0x282319,roughness:.25,metalness:.28});
  const porcelain=new T.MeshStandardMaterial({color:0xfff0d6,roughness:.32});
  const redSeal=new T.MeshStandardMaterial({color:0x9b1526,roughness:.34});
  const labelPlane=new T.PlaneGeometry(1,1);
  const wineLabelShape=new T.CylinderGeometry(.121,.121,.244,12,1,true,-.99,1.98);
  const moutaiLabelShape=new T.CylinderGeometry(.134,.134,.232,12,1,true,-.91,1.82);
  const bottleCap=new T.CylinderGeometry(.94,1,1,12).translate(0,.5,0);
  function bottleLabel(chinese){
   return new T.MeshStandardMaterial({roughness:.76,side:T.DoubleSide,map:propTexture(128,144,(ink,w,h)=>{
    ink.fillStyle='#f3e7c8';ink.fillRect(0,0,w,h);ink.strokeStyle=chinese?'#ae2427':'#623c37';
    ink.lineWidth=4;ink.strokeRect(4,4,w-8,h-8);
    ink.fillStyle=chinese?'#a21b21':'#6b2431';ink.textAlign='center';
    if(chinese){
     ink.fillRect(12,13,104,20);
     ink.font='bold 24px sans-serif';ink.fillText('贵州茅台',64,71);
     ink.font='bold 17px Georgia';ink.fillText('MOUTAI',64,104);
    }else{
     ink.font='bold 28px Georgia';ink.fillText('RED',64,58);ink.fillText('WINE',64,89);
     ink.font='14px sans-serif';ink.fillText('红葡萄酒',64,116);
    }
   })});
  }
  const wineLabel=bottleLabel(false),moutaiLabel=bottleLabel(true);
  function bottle(x,y,z,scale,yaw,tilt,chinese){
   const placement=new T.Matrix4().compose(new T.Vector3(x,y,z),
    new T.Quaternion().setFromEuler(new T.Euler(tilt,yaw,0,'YXZ')),new T.Vector3(scale,scale,scale));
   const type=chinese?'Moutai display bottles':'Red wine display bottles';
   piece(type,chinese?maotai:redWine,chinese?porcelain:greenGlass,0,0,0,1,1,1,0,0,placement);
   const capWidth=chinese?.075:.062;
   piece(type+' cap',bottleCap,redSeal,0,chinese?.64:.73,0,capWidth,.096,capWidth,0,0,placement);
   piece(type+' label',chinese?moutaiLabelShape:wineLabelShape,chinese?moutaiLabel:wineLabel,0,.29,0,1,1,1,0,0,placement);
   if(chinese)piece('Moutai red ribbon',labelPlane,redSeal,.047,.56,.075,.059,.17,1,0,.15,placement);
   items++;
  }
  let items=0;
  for(const side of [-1,1]){
   mound(side);
   // Larger, recognisable objects sit across the crests and on the approach face.
   const tops=[0,2,0,4,0,7,3,0,2,5,0,1,2,6,0,8];
   for(let row=0;row<14;row++)for(let col=0;col<9;col++){
    const u=3.08+col*.65+random()*.35,v=.57+row*.50+random()*.28;
    const level=height(u,v,side);
    if(level<.10)continue;
    const x=centre+side*u,z=rear+v,y=level-.032;
    const size=.22+random()*.30,yaw=random()*Math.PI*2;
    treasure(tops[(row*7+col*3)%tops.length],x,y,z,size,yaw,Math.floor(random()*16));
    if((row+col)%4===0)bills(x+side*.19,y+.06,z+.13,.31+random()*.15,yaw,true,false);
   }
   const chestX=centre+side*4.44,chestZ=rear+6.86;
   const chestY=Math.max(floor,height(4.44,6.86,side)-.095);
   casket(chestX,chestY,chestZ,side*.22);
   obstacle(chestX,chestZ,.53,.73,'财神殿珠宝匣');
   cameraBox(1.06,chestY+.87,1.46,chestX,(chestY+.87)/2,chestZ,'Wealth jewel chest');
   const dx=centre+side*4.59,dz=rear+7.75,yaw=side*.65;
   const ruyiY=Math.max(floor,height(4.59,7.75,side));
   piece('Jade ruyi',ruyi,jade,dx,ruyiY+.052,dz,.63,.50,.63,yaw);
   piece('Gilt ruyi head',bead,gold,dx+(Math.sin(yaw)*.59-Math.cos(yaw)*.19)*.63,ruyiY+.063,dz+(Math.cos(yaw)*.59+Math.sin(yaw)*.19)*.63,.19,.081,.14,yaw);
   items++;
   // Spill bottle clusters and bundles down the lower slope with their faces visible from the aisle.
   const bottleOffsets=[[5.85,7.03,.96,-.13,.23],[6.15,7.39,1.07,.10,-.44],
    [6.46,7.62,.91,-.29,.19],[7.22,7.44,1.22,.40,-.72],[7.51,7.00,1.10,-.18,.31]];
   for(const [i,[u,v,scale,yaw,tilt]] of bottleOffsets.entries()){
    const x=centre+side*u,z=rear+v,y=Math.max(floor,height(u,v,side)-.07);
    bottle(x,y,z,scale,yaw*side,tilt,i%2===0);
    const reach=.13+Math.abs(Math.sin(tilt))*.69*scale,top=y+.83*scale;
    obstacle(x,z,.15,reach,'财神殿财宝堆中的酒');
    cameraBox(.30,top,reach*2,x,top/2,z,'Bottle among treasure');
   }
   const noteOffsets=[[5.22,7.19],[5.52,7.51],[5.98,7.75],[6.45,7.93],[6.90,7.81],
    [7.08,7.53],[7.55,7.40],[7.59,6.73],[6.82,6.94],[5.46,6.85]];
   for(const [i,[u,v]] of noteOffsets.entries()){
    const x=centre+side*u,z=rear+v,y=Math.max(floor,height(u,v,side)-.012);
    const yaw=side*((random()-.5)*1.9);
    bills(x,y,z,.29+random()*.13,yaw,i%3===0,true);
    if(i%2===0)bills(x+side*.023,y+.092,z+.021,.30,yaw+side*.39,i%3!==0,true);
   }
   lights.push({x:centre+side*5.28,z:rear+6.0});
  }
  // Count one complete ingot, necklace, note bundle or bottle as one object.
  // Version 82 contained 688 such objects, including each individual cash coin.
  const target=688*50,detailCount=items;
  for(const side of [-1,1]){
   const count=(target-detailCount)>>1;
   const end=items+count+(side===1?(target-detailCount)%2:0);
   while(items<end){
    const u=bounds.left+random()*(bounds.right-bounds.left),v=bounds.back+random()*(bounds.front-bounds.back);
    const y=height(u,v,side);
    if(y<floor+.025)continue;
    const kindRoll=random(),kind=kindRoll<.72?0:kindRoll<.86?1:kindRoll<.955?2:3;
    const size=.048+random()*.057,yaw=random()*Math.PI*2;
    const baseY=Math.max(floor+.002,y-.006),hx=centre+side*u,z=rear+v;
    const slant=Math.atan2(height(u,v+.045,side)-height(u,v-.045,side),.09);
    const tilt=(random()-.5)*.65-slant;
    const scale=[[size,1,size],[size*1.18,size*.51,size*.67],[size*2.26,1,size],[size*.62,size*.53,size*.54]][kind];
    pose.position.set(hx,baseY+([.009,0,.021,size*.38][kind])+random()*.019,z);
    pose.scale.set(...scale);pose.rotation.set(tilt,yaw,(random()-.5)*.40,'YXZ');pose.updateMatrix();
    const value=kind===3?gemColors[Math.floor(random()*4)]:kind===0&&random()<.043?0xb9b5a0:goldTints[Math.floor(random()*goldTints.length)];
    bulkBatches[kind].entries.push([pose.matrix.clone(),value]);
    items++;
    if(items%161===0)shine(hx,baseY+.082,z,kind===3?value:0xffcf62,.10+random()*.13);
   }
  }
  pose.rotation.order='XYZ';
  for(const {name,geometry,entries} of bulkBatches){
   const batch=new T.InstancedMesh(geometry,bulkMetal,entries.length),color=new T.Color();
   batch.name=name;batch.receiveShadow=true;
   entries.forEach(([matrix,tint],i)=>{batch.setMatrixAt(i,matrix);batch.setColorAt(i,color.set(tint));});
   batch.instanceMatrix.needsUpdate=true;batch.instanceColor.needsUpdate=true;batch.computeBoundingSphere();
   counts[name]=entries.length;root.add(batch);
  }
  let pieces=items-detailCount;
  for(const {name,geometry,material,matrices} of batches.values()){
   const batch=new T.InstancedMesh(geometry,material,matrices.length);
   batch.name=name;batch.receiveShadow=true;
   matrices.forEach((matrix,i)=>batch.setMatrixAt(i,matrix));
   batch.instanceMatrix.needsUpdate=true;batch.computeBoundingSphere();
   root.add(batch);
   pieces+=matrices.length;counts[name]=(counts[name]??0)+matrices.length;
  }

  // One depth-tested billboard batch puts color and glints on the treasure itself.
  const geometry=new T.PlaneGeometry(2,2);
  const clock={value:0};
  const glintMat=new T.ShaderMaterial({
   uniforms:{time:clock},transparent:true,depthWrite:false,blending:T.AdditiveBlending,toneMapped:false,
   vertexShader:`
    attribute vec3 hue; attribute float phase; attribute float size;
    varying vec2 point; varying vec3 tint; varying float flicker;
    uniform float time;
    void main(){
     point=position.xy; tint=hue;
     flicker=pow(0.5+0.5*sin(time*1.9+phase),9.0);
     vec4 center=modelViewMatrix*instanceMatrix*vec4(0.0,0.0,0.0,1.0);
     center.xy+=position.xy*size*(0.78+0.22*flicker);
     gl_Position=projectionMatrix*center;
    }`,
   fragmentShader:`
    varying vec2 point; varying vec3 tint; varying float flicker;
    void main(){
     vec2 p=abs(point);
     float halo=exp(-dot(p,p)*12.0)*0.28;
     float ray=max(exp(-p.x*95.0-p.y*4.4),exp(-p.y*95.0-p.x*4.4));
     float edge=1.0-smoothstep(0.55,1.0,max(p.x,p.y));
     vec3 light=mix(tint,vec3(1.0,0.95,0.82),ray*0.6);
     gl_FragColor=vec4(light,edge*(halo*(0.20+0.70*flicker)+ray*0.72*flicker));
    }`
  });
  const shimmer=new T.InstancedMesh(geometry,glintMat,sparkles.length);
  shimmer.name='Warm gold and jewel-coloured glints';
  shimmer.renderOrder=3;
  const colors=[],phases=[],sizes=[],color=new T.Color(),matrix=new T.Matrix4();
  sparkles.forEach(({x,y,z,color:hue,size,phase},i)=>{
   shimmer.setMatrixAt(i,matrix.makeTranslation(x,y,z));
   color.set(hue);colors.push(color.r,color.g,color.b);phases.push(phase);sizes.push(size);
  });
  geometry.setAttribute('hue',new T.InstancedBufferAttribute(new Float32Array(colors),3));
  geometry.setAttribute('phase',new T.InstancedBufferAttribute(new Float32Array(phases),1));
  geometry.setAttribute('size',new T.InstancedBufferAttribute(new Float32Array(sizes),1));
  shimmer.instanceMatrix.needsUpdate=true;shimmer.computeBoundingSphere();root.add(shimmer);
  const rain=addTreasureRain(T,root,{centre,rear,beamBottom,height,ingot,cash,bulkNote,gold,foil,usd});
  return {lights,state:{items,pieces,counts,glints:sparkles.length,drawCalls:batches.size+bulkBatches.length+3,rain:rain.state},
   update(time,viewer,effects){clock.value=time;rain.update(time,viewer,effects);}};
 }

 function addTreasureRain(T,root,{centre,rear,beamBottom,height,ingot,cash,bulkNote,gold,foil,usd}){
  const {lerp,smoothstep}=T.MathUtils;
  const top=beamBottom-.42;
  const pose=new T.Object3D(),tint=new T.Color();
  let seed=97181;
  const random=()=>((seed=(Math.imul(seed,1664525)+1013904223)>>>0)/4294967296);
  const goldMetal=gold.clone();
  goldMetal.emissiveIntensity=.42;
  const goldPaper=foil.clone(),greenPaper=usd.clone();
  for(const material of [goldPaper,greenPaper]){
   material.side=T.DoubleSide;
   material.emissive.copy(material.color).multiplyScalar(.37);
   material.emissiveMap=material.map;
  }
  const styles=[
   {name:'Gold sycees',mesh:ingot,material:goldMetal,count:30,size:.12,variation:.10,shape:[1,1,.59]},
   {name:'Gold cash coins',mesh:cash,material:goldMetal,count:56,size:.07,variation:.08,shape:[1,1,1]},
   {name:'Gold notes',mesh:bulkNote,material:goldPaper,count:30,size:.24,variation:.15,shape:[1,1,.45],paper:true},
   {name:'Paper bills',mesh:bulkNote,material:greenPaper,count:18,size:.23,variation:.15,shape:[1,1,.45],paper:true}
  ];
  const holder=new T.Group();
  holder.name='Continuous treasure rain';
  holder.visible=false;
  root.add(holder);
  const batches=styles.map(style=>{
   const batch=new T.InstancedMesh(style.mesh,style.material,style.count);
   batch.name='Falling '+style.name;
   batch.instanceMatrix.setUsage(T.DynamicDrawUsage);
   // The whole effect is already culled by distance. Instance centres move.
   batch.frustumCulled=false;
   holder.add(batch);
   const paths=Array.from({length:style.count},(_,i)=>{
    const side=i%2===0?-1:1;
    const u=4.62+random()*1.52,v=3.35+random()*.65;
    const endU=lerp(u,6.45+random()*.88,.72),endV=v+1.53+random()*1.50;
    const startU=u+(random()-.5)*.82,startV=v+(random()-.5)*.70;
    const fall=(style.paper?1.37:.70)+random()*(style.paper?1.0:.51);
    const slide=(style.paper?1.47:1.07)+random()*.95;
    const period=fall+slide+.10+random()*.40;
    const size=style.size+random()*style.variation;
    const yaw=random()*Math.PI*2,spin=(random()-.5)*7.2;
    const offset=period*((i*.61803398875+random()*.056)%1);
    const y=height(u,v,side)+.16+size*.2,spawnY=top-.05-random()*.37;
    if(!style.paper)batch.setColorAt(i,tint.set([0xffc04a,0xffd478,0xffe2a1][i%3]));
    return {side,u,v,endU,endV,startU,startV,fall,slide,period,size,y,yaw,spin,offset,spawnY};
   });
   return {style,batch,paths};
  });
  const state={active:0,maxInstances:styles.reduce((sum,style)=>sum+style.count,0),drawCalls:styles.length};
  function update(time,viewer,effects){
   holder.visible=!!viewer&&Math.hypot(viewer.x-centre,viewer.z-(rear+4.2))<27;
   state.active=0;
   if(!holder.visible)return;
   const quality=T.MathUtils.clamp(effects,.45,1);
   for(const {style,batch,paths} of batches){
    batch.count=2*Math.max(1,Math.floor(paths.length*quality/2));
    state.active+=batch.count;
    for(let i=0;i<batch.count;i++){
     const p=paths[i],age=(time+p.offset)%p.period;
     const descent=Math.min(1,age/p.fall),flow=T.MathUtils.clamp((age-p.fall)/p.slide,0,1);
     const flutter=Math.sin(Math.PI*descent)*(style.paper?.38:.08);
     const drift=Math.sin(age*7+p.yaw)*flutter;
     const run=flow*(1.32-.32*flow);
     const u=lerp(p.startU,p.u,descent)+drift+(p.endU-p.u)*run;
     const v=lerp(p.startV,p.v,descent)+drift*.53+(p.endV-p.v)*run;
     const fallProgress=style.paper?descent*(.87+.13*descent):descent*(.22+.78*descent);
     const bounce=Math.abs(Math.sin(flow*Math.PI*3))*Math.pow(1-flow,4)*(style.paper?.12:.31);
     const y=age<p.fall?lerp(p.spawnY,p.y,fallProgress):
      height(u,v,p.side)+.16+p.size*.2+bounce;
     const scale=Math.max(.0001,p.size*smoothstep(age,0,.17)*(1-smoothstep(flow,.81,1)));
     const tilt=(1-flow)*(style.paper?Math.sin(age*6.1+p.yaw)*.95:Math.sin(descent*5.4+p.yaw)*1.05);
     pose.position.set(centre+p.side*u,y,rear+v);
     pose.rotation.set(tilt,p.yaw+age*p.spin,Math.sin(age*5.3+p.yaw)*(1-flow)*.8,'YXZ');
     pose.scale.set(scale*style.shape[0],scale*style.shape[1],scale*style.shape[2]);
     pose.updateMatrix();batch.setMatrixAt(i,pose.matrix);
    }
    batch.instanceMatrix.needsUpdate=true;
   }
  }
  return {state,update};
 }
})();
;
(function(){'use strict';
  // Authored 3D plants, rooted in the existing terrain. No extra ground sheets.
  // The library is the west pavilion at (-44,14.4); its rear faces negative Z.
  const layout={version:'sunflower-library-rear-2',anchor:'scripture',centre:[-51,-22],radii:[20,22],spacing:.8,rearLimitZ:-1.4,pathHalfWidth:2.65};
  const pathX=z=>-46+3.3*Math.sin((z+1.4)*.085);
  const pathContains=(x,z)=>z>=-46&&z<=2&&Math.abs(x-pathX(z))<layout.pathHalfWidth;
  const hash=(x,z,k)=>{const v=Math.sin(x*127.1+z*311.7+k*73.9)*43758.5453;return v-Math.floor(v);};
  function placements(N){
    const plants=[];
    for(let row=0;row<58;row++)for(let column=0;column<53;column++){
      const x=-72+(column+(row%2)*.5)*layout.spacing+(hash(column,row,1)-.5)*.56,z=-45+row*layout.spacing+(hash(column,row,2)-.5)*.56;
      const edge=Math.hypot((x-layout.centre[0])/layout.radii[0],(z-layout.centre[1])/layout.radii[1]);
      const outline=1+.035*Math.sin(x*.31)+.025*Math.sin(z*.39);
      if(edge>outline||z>layout.rearLimitZ||x> -30.5||Math.abs(x-pathX(z))<layout.pathHalfWidth)continue;
      if(edge>.91&&hash(column,row,7)<(edge-.91)*2.2)continue;
      const y=N.islandHeight(x,z);if(!Number.isFinite(y)||!N.templeCanStand(x,z))continue;
      if(N.islandTrees.some(t=>Math.hypot(x-t.x,z-t.z)<2.6))continue;
      // A low border opens the view; taller blooms form the middle of the field.
      const border=Math.min(1,Math.max(0,(outline-edge)*5));
      const scale=.65+hash(column,row,3)*.27+border*.18;
      plants.push({x,y:y-.003,z,scale,yaw:Math.PI+.24+(hash(column,row,4)-.5)*1.2,tone:hash(column,row,5)});
    }
    return plants;
  }
  function create(T,N,parent){
    const root=new T.Group();root.name='Golden sunflower clearing';parent.add(root);
    const time={value:0},plants=placements(N),dummy=new T.Object3D();
    function buildParts(distant){
    const make=()=>({p:[],c:[],uv:[]}),green=make(),gold=make(),seeds=make();
    const colour=hex=>new T.Color(hex),leafDark=colour(0x304e24),leafLight=colour(0x5e7c30),petalDark=colour(0xd58a09),petalLight=colour(0xffc52d),heart=colour(0x68401b);
    const triangle=(b,a,c,d,ca,cb=ca,cc=ca,uvs)=>{b.p.push(...a,...c,...d);for(const k of[ca,cb,cc])b.c.push(k.r,k.g,k.b);b.uv.push(...(uvs||[0,0,1,0,.5,1]));};
    function tube(points,radius){
      const sides=distant?3:6;
      for(let j=0;j<points.length-1;j++)for(let k=0;k<sides;k++){
        const a=k*Math.PI*2/sides,b=(k+1)*Math.PI*2/sides,r0=radius*(1-j*.12),r1=radius*(1-(j+1)*.12);
        const q=(p,r,t)=>[p[0]+Math.cos(t)*r,p[1],p[2]+Math.sin(t)*r];
        const p0=q(points[j],r0,a),p1=q(points[j],r0,b),p2=q(points[j+1],r1,b),p3=q(points[j+1],r1,a);
        triangle(green,p0,p1,p2,leafDark,leafLight,leafLight);triangle(green,p0,p2,p3,leafDark,leafLight,leafDark);
      }
    }
    tube([[0,0,0],[.012,.48,-.018],[.024,1.03,.006],[0,1.51,.035]],.026);
    // Folded, pointed leaves with a raised central vein and separate petioles.
    for(let leaf=0;leaf<4;leaf++){
      const angle=leaf*2.4+.4,h=.32+leaf*.24,len=.57-(leaf%2)*.065;
      const start=[.012,h,0],neck=[Math.sin(angle)*.12,h+.045,Math.cos(angle)*.12];tube([start,neck],.012);
      const point=(t,w)=>{const breadth=Math.pow(Math.sin(Math.PI*t),.8)*.21*w;return[neck[0]+Math.sin(angle)*len*t+Math.cos(angle)*breadth,neck[1]+.19*Math.sin(t*2.3)-.13*t+Math.abs(w)*-.045*Math.sin(Math.PI*t),neck[2]+Math.cos(angle)*len*t-Math.sin(angle)*breadth];};
      const steps=distant?2:4,across=distant?1:2;
      for(let s=0;s<steps;s++)for(let side=0;side<across;side++){
        const t0=s/steps,t1=(s+1)/steps,w0=side*2/across-1,w1=(side+1)*2/across-1;
        const a=point(t0,w0),b=point(t0,w1),c=point(t1,w1),d=point(t1,w0);
        triangle(green,a,b,c,leafDark,leafLight,leafLight);triangle(green,a,c,d,leafDark,leafLight,leafDark);
      }
    }
    const headY=1.52,headZ=.045;
    // Two staggered whorls. Curved 3D petal ribbons have no overlapping flat faces.
    for(let layer=0;layer<(distant?1:2);layer++)for(let petal=0;petal<18;petal++){
      const angle=(petal+layer*.5)*Math.PI/9,reach=.29+Math.sin(petal*4.7)*.022-layer*.04;
      const petalPoint=(t,w)=>{const r=.155+reach*t,width=Math.pow(Math.sin(Math.PI*t),.75)*(.061-layer*.006)*w;return[Math.cos(angle)*r-Math.sin(angle)*width,headY+Math.sin(angle)*r,headZ-layer*.032+.065*Math.sin(t*Math.PI)-.073*t*t-Math.abs(w)*.025*Math.sin(Math.PI*t)];};
      const steps=distant?2:3,across=distant?1:2;
      for(let s=0;s<steps;s++)for(let side=0;side<across;side++){
        const t0=s/steps,t1=(s+1)/steps,w0=side*2/across-1,w1=(side+1)*2/across-1;
        const a=petalPoint(t0,w0),b=petalPoint(t0,w1),c=petalPoint(t1,w1),d=petalPoint(t1,w0);
        const warm=petalDark.clone().lerp(petalLight,.36+.6*t1);
        triangle(gold,a,c,b,warm,petalLight,warm);triangle(gold,a,d,c,warm,warm,petalLight);
      }
    }
    // Domed seed head and a green rear calyx: readable from both sides of the path.
    const diskSides=distant?10:28;
    for(let i=0;i<diskSides;i++){
      const a=i*Math.PI*2/diskSides,b=(i+1)*Math.PI*2/diskSides;
      const front=(r,t)=>[Math.cos(t)*r,headY+Math.sin(t)*r,headZ+.027+.055*(1-(r/.202)**2)];
      const uv=p=>[p[0]/.404+.5,(p[1]-headY)/.404+.5];
      const p0=front(0,0),p1=front(.102,a),p2=front(.102,b),p3=front(.202,a),p4=front(.202,b);
      for(const tri of[[p0,p1,p2],[p1,p3,p4],[p1,p4,p2]])triangle(seeds,...tri,heart,heart,heart,tri.flatMap(uv));
      triangle(green,[0,headY,headZ-.06],[Math.cos(b)*.205,headY+Math.sin(b)*.205,headZ-.018],[Math.cos(a)*.205,headY+Math.sin(a)*.205,headZ-.018],leafDark);
    }
    function geometry(b){
      const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(b.p,3));g.setAttribute('color',new T.Float32BufferAttribute(b.c,3));g.setAttribute('uv',new T.Float32BufferAttribute(b.uv,2));g.computeVertexNormals();
      // Share surface normals across ribbon triangles while retaining vertex colour.
      const p=g.attributes.position,n=g.attributes.normal,sums=new Map(),keys=[];
      for(let i=0;i<p.count;i++){const key=[p.getX(i),p.getY(i),p.getZ(i)].map(v=>Math.round(v*100000)).join(',');keys.push(key);if(!sums.has(key))sums.set(key,new T.Vector3());sums.get(key).add(new T.Vector3().fromBufferAttribute(n,i));}
      for(const normal of sums.values())normal.normalize();for(let i=0;i<n.count;i++){const v=sums.get(keys[i]);n.setXYZ(i,v.x,v.y,v.z);}
      g.computeBoundingSphere();return g;
    }
    return [geometry(green),geometry(gold),geometry(seeds)];
    }
    const nearParts=buildParts(false),farParts=buildParts(true),lodBatches=[];
    const windCode='vec3 flowerBase=instanceMatrix[3].xyz;float flowerBend=position.y*position.y;transformed.x+=sin(sunflowerTime*.85+flowerBase.x*.17+flowerBase.z*.11)*flowerBend*.035;transformed.z+=cos(sunflowerTime*.67+flowerBase.z*.19)*flowerBend*.018;';
    function wind(material,seedDetail=false){
      material.onBeforeCompile=s=>{s.uniforms.sunflowerTime=time;s.vertexShader='uniform float sunflowerTime;\n'+(seedDetail?'varying vec2 sunflowerUV;\n':'')+s.vertexShader;s.vertexShader=s.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\n'+windCode+(seedDetail?'\nsunflowerUV=uv;':''));
        if(seedDetail){s.fragmentShader='varying vec2 sunflowerUV;\n'+s.fragmentShader;s.fragmentShader=s.fragmentShader.replace('#include <color_fragment>','#include <color_fragment>\nvec2 cell=sunflowerUV*39.;cell.x+=mod(floor(cell.y),2.)*.5;float seedSpot=1.-smoothstep(.15,.49,length(fract(cell)-.5));float fleck=fract(sin(dot(floor(cell),vec2(12.9898,78.233)))*43758.5453);diffuseColor.rgb*=.68+seedSpot*(.65+fleck*.6);');}};
      material.customProgramCacheKey=()=>seedDetail?'sunflower-seeds-1':'sunflower-wind-1';return material;
    }
    const parts=[{name:'leaves and stems',geometry:nearParts[0],far:farParts[0],material:wind(new T.MeshStandardMaterial({vertexColors:true,roughness:.93,side:T.DoubleSide}))},{name:'golden petals',geometry:nearParts[1],far:farParts[1],material:wind(new T.MeshStandardMaterial({vertexColors:true,roughness:.83,side:T.DoubleSide}))},{name:'seed heads',geometry:nearParts[2],far:farParts[2],material:wind(new T.MeshStandardMaterial({vertexColors:true,roughness:1,side:T.DoubleSide}),true)}];
    const depth=wind(new T.MeshDepthMaterial({depthPacking:T.RGBADepthPacking,side:T.DoubleSide}));
    let drawCalls=0;
    for(let band=0;band<4;band++){
      const bandPlants=plants.filter(p=>Math.min(3,Math.max(0,Math.floor((p.x+72)/10.5)))===band);if(!bandPlants.length)continue;
      for(const part of parts){
        const mesh=new T.InstancedMesh(part.geometry,part.material,bandPlants.length);mesh.name='Sunflowers '+part.name+' '+band;mesh.layers.set(1);mesh.castShadow=part.name!=='leaves and stems';mesh.receiveShadow=true;mesh.customDepthMaterial=depth;mesh.userData.sunflowerBand=band;root.add(mesh);lodBatches.push({mesh,near:part.geometry,far:part.far});drawCalls++;
        bandPlants.forEach((p,i)=>{dummy.position.set(p.x,p.y,p.z);dummy.rotation.set(0,p.yaw,0);dummy.scale.setScalar(p.scale);dummy.updateMatrix();mesh.setMatrixAt(i,dummy.matrix);const tint=new T.Color().setRGB(1,.93+p.tone*.07,.78+p.tone*.18);mesh.setColorAt(i,tint);});
        mesh.instanceMatrix.needsUpdate=true;mesh.computeBoundingBox();mesh.boundingBox.expandByScalar(.16);mesh.computeBoundingSphere();mesh.boundingSphere.radius+=.16;
      }
    }
    const trianglesPerPlant=parts.reduce((n,p)=>n+p.geometry.attributes.position.count/3,0);
    const state={ready:true,version:layout.version,plants:plants.length,drawCalls,triangles:trianglesPerPlant*plants.length,region:'scripture-pavilion-rear',pathClearWidth:3.1,groundInset:.003,wind:true,geometry:'curved-3d-petals-domed-seeds-and-folded-leaves'};
    root.userData.sunflowerState=state;
    return{root,plants,state,lodBatches,update:t=>{time.value=t;}};
  }
  window.TempleSunflowers={create,placements,layout,pathX,pathContains};
})();
;
(function(){'use strict';
 const layout={centre:[48,-21],radii:[25,20],spacing:.82,treeClearance:6.2,pathClearance:2.2,path:[[58,1],[58,-12],[44,-12]]};
 const hash=(x,z,k)=>{const v=Math.sin(x*127.1+z*311.7+k*73.9)*43758.5453;return v-Math.floor(v);};
 function pathDistance(x,z){let best=Infinity;for(let i=1;i<layout.path.length;i++){const a=layout.path[i-1],b=layout.path[i],dx=b[0]-a[0],dz=b[1]-a[1],t=Math.max(0,Math.min(1,((x-a[0])*dx+(z-a[1])*dz)/(dx*dx+dz*dz)));best=Math.min(best,Math.hypot(x-a[0]-t*dx,z-a[1]-t*dz));}return best;}
 function placements(N){const plants=[],tree=N.templeSceneLayout.props.wishingTree.position;
  for(let row=0;row<49;row++)for(let col=0;col<62;col++){
   const x=23+col*layout.spacing+(hash(col,row,1)-.5)*.45,z=-41+row*layout.spacing+(hash(col,row,2)-.5)*.45;
   const edge=Math.hypot((x-48)/25,(z+21)/20);
   if(edge>1+.025*Math.sin(z*.6)||z> -2||Math.hypot(x-tree[0],z-tree[2])<layout.treeClearance||pathDistance(x,z)<layout.pathClearance)continue;
   if(!N.templeCanStand(x,z)||N.islandTrees.some(t=>Math.hypot(x-t.x,z-t.z)<2.8))continue;
   const y=N.islandHeight(x,z);if(!Number.isFinite(y))continue;
   const kind=hash(col,row,3)<.58?'lavender':'tulip';
   plants.push({x,y:y-.006,z,kind,tone:hash(col,row,4),scale:.72+hash(col,row,5)*.3,yaw:hash(col,row,6)*Math.PI*2});
  }return plants;
 }
 function create(T,N,parent){const root=new T.Group();root.name='Wishing tree lavender and tulip meadow';parent.add(root);const plants=placements(N),time={value:0},dummy=new T.Object3D();
  const green=new T.Color(0x3c6841),leaf=new T.Color(0x6c8e57),purple=new T.Color(0x7951a8),lightPurple=new T.Color(0xb390d1);
  function shape(kind,distant){const p=[],c=[];const tri=(a,b,d,tint)=>{p.push(...a,...b,...d);for(let i=0;i<3;i++)c.push(tint.r,tint.g,tint.b);};
   const tube=(x,z,h,r)=>{const sides=distant?3:6;for(let i=0;i<sides;i++){const a=i*Math.PI*2/sides,b=(i+1)*Math.PI*2/sides,A=[x+Math.cos(a)*r,0,z+Math.sin(a)*r],B=[x+Math.cos(b)*r,0,z+Math.sin(b)*r],C=[B[0],h,B[2]],D=[A[0],h,A[2]];tri(A,B,C,green);tri(A,C,D,green);}};
   const leaves=(x,z,h,angle,len,width)=>{const point=(t,w)=>[x+Math.sin(angle)*len*t+Math.cos(angle)*Math.sin(t*Math.PI)*width*w,h+.35*Math.sin(t*2.3)-.16*t,z+Math.cos(angle)*len*t-Math.sin(angle)*Math.sin(t*Math.PI)*width*w];const steps=distant?2:4,across=distant?1:2;for(let j=0;j<steps;j++)for(let s=0;s<across;s++){const t0=j/steps,t1=(j+1)/steps,w0=s*2/across-1,w1=(s+1)*2/across-1,a=point(t0,w0),b=point(t0,w1),cc=point(t1,w1),d=point(t1,w0);tri(a,b,cc,leaf);tri(a,cc,d,green);}};
   if(kind==='lavender')for(let stem=0;stem<5;stem++){
    const angle=stem*2.4,x=Math.sin(angle)*.15,z=Math.cos(angle)*.15,h=.60+(stem%3)*.10;tube(x,z,h,.012);leaves(x,z,.18,angle,.25,.025);
    const rings=distant?3:7,sides=distant?4:6;
    for(let ring=0;ring<rings;ring++)for(let side=0;side<sides;side++){
     const point=(r,k)=>{const radius=(.055+.012*(r%2))*Math.sin((r+1)/9*Math.PI),a=k*Math.PI*2/sides;return[x+Math.cos(a)*radius,h-.03+r*.036,z+Math.sin(a)*radius];};
     const lower=Math.round(ring*7/rings),upper=Math.round((ring+1)*7/rings);
     const a=point(lower,side),b=point(lower,side+1),cc=point(upper,side+1),d=point(upper,side),tint=purple.clone().lerp(lightPurple,(lower%2)*.45+lower*.04);tri(a,b,cc,tint);tri(a,cc,d,tint);
    }
   }else{
    tube(0,0,.82,.018);leaves(0,0,.12,.3,.4,.085);leaves(0,0,.3,3.1,.34,.07);
    for(let petal=0;petal<6;petal++){
     const angle=petal*Math.PI/3;
     const point=(u,v)=>{const a=angle+v*.58,r=.025+.15*Math.sin(u*1.7),y=.79+u*.34-.055*v*v*Math.pow(u,3);return[Math.cos(a)*r,y,Math.sin(a)*r];};
     const steps=distant?2:4,across=distant?1:3;
     for(let j=0;j<steps;j++)for(let k=0;k<across;k++){const u=j/steps,v=-1+k*2/across,a=point(u,v),b=point(u,v+2/across),cc=point(u+1/steps,v+2/across),d=point(u+1/steps,v),tint=new T.Color().setRGB(.95,.43+u*.44,.52+u*.40);tri(a,b,cc,tint);tri(a,cc,d,tint);}
    }
   }
   const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(p,3));g.setAttribute('color',new T.Float32BufferAttribute(c,3));g.computeVertexNormals();g.computeBoundingSphere();return g;
  }
  function wind(m){m.onBeforeCompile=s=>{s.uniforms.meadowTime=time;s.vertexShader='uniform float meadowTime;\n'+s.vertexShader;s.vertexShader=s.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nvec3 base=instanceMatrix[3].xyz;transformed.x+=sin(meadowTime*.9+base.x*.23+base.z*.19)*position.y*position.y*.035;');};m.customProgramCacheKey=()=> 'wishing-meadow-wind-1';return m;}
  const lodBatches=[];let triangles=0;
  for(const kind of['lavender','tulip']){
   const rows=plants.filter(p=>p.kind===kind),geometry=shape(kind,false),material=wind(new T.MeshStandardMaterial({vertexColors:true,roughness:.86,side:T.DoubleSide})),m=new T.InstancedMesh(geometry,material,rows.length);m.name='Wishing meadow '+kind;m.layers.set(1);m.receiveShadow=true;m.castShadow=false;
   rows.forEach((p,i)=>{dummy.position.set(p.x,p.y,p.z);dummy.rotation.set(0,p.yaw,0);dummy.scale.setScalar(p.scale);dummy.updateMatrix();m.setMatrixAt(i,dummy.matrix);m.setColorAt(i,kind==='tulip'?new T.Color().setRGB(1,.72+p.tone*.28,.63+p.tone*.37):new T.Color().setRGB(.89+p.tone*.11,.91+p.tone*.09,1));});m.instanceMatrix.needsUpdate=true;m.computeBoundingBox();m.boundingBox.expandByScalar(.07);m.computeBoundingSphere();m.boundingSphere.radius+=.07;root.add(m);lodBatches.push({mesh:m,near:geometry,far:shape(kind,true)});triangles+=geometry.attributes.position.count/3*rows.length;
  }
  const counts=Object.fromEntries(['lavender','tulip'].map(k=>[k,plants.filter(p=>p.kind===k).length]));const state={ready:true,region:'wealth-pavilion-rear',...counts,plants:plants.length,drawCalls:2,triangles,pathClearWidth:3.4,treeClearance:layout.treeClearance};return{root,state,plants,lodBatches,update:t=>{time.value=t;}};
 }
 window.TempleWishingFlowers={create,placements,layout,pathDistance};
})();
;
(function(){'use strict';
 // Each field repeats a small authored mesh thousands of times. Reuse complete
 // vertices on adjacent triangles, including distinct normals, UVs and colours.
 function indexFlowerGeometry(field){
  if(!field)return;
  const geometries=new Set(field.lodBatches.flatMap(batch=>[batch.near,batch.far]));
  for(const geometry of geometries){
   if(geometry.index)continue;
   const attributes=Object.values(geometry.attributes),count=geometry.attributes.position.count;
   const firstVertex=new Map(),indices=[];
   for(let i=0;i<count;i++){
    const key=attributes.map(a=>a.array.subarray(i*a.itemSize,(i+1)*a.itemSize).join(',')).join('/');
    let first=firstVertex.get(key);
    if(first===undefined){first=i;firstVertex.set(key,i);}
    indices.push(first);
   }
   geometry.setIndex(indices);
  }
 }

 function snowTracks(T,N,root,compact){
  const capacity=compact?144:240,life=40,spacing=.89;
  const pixels=new Uint8Array(96*64*4);
  const oval=(x,y,cx,cy,rx,ry)=>Math.hypot((x-cx)/rx,(y-cy)/ry);
  for(let form=0;form<3;form++)for(let y=0;y<64;y++)for(let x=0;x<32;x++){
   const u=(x+.5)/16-1,v=(y+.5)/64;
   const forefoot=Math.hypot((u-.045)/.80,(v-.33)/.245);
   const heel=Math.hypot((u+.04)/.63,(v-.69)/.245);
   let shape=Math.min(forefoot,heel);
   if(form===1){
    shape=oval(u,v,0,.64,.53,.23);
    for(const [toeX,toeY] of [[-.56,.35],[-.19,.25],[.20,.25],[.56,.35]])shape=Math.min(shape,oval(u,v,toeX,toeY,.182,.115));
   }else if(form===2)shape=Math.min(oval(u,v,-.32,.51,.28,.34),oval(u,v,.32,.51,.28,.34));
   const edge=1-T.MathUtils.smoothstep(shape,.91,1.07);
   const rim=T.MathUtils.smoothstep(shape,.76,1.02);
   const tread=.5+.5*Math.sin(v*138-Math.abs(u)*2.7);
   const shade=43*rim+15*tread*(1-rim);
   pixels.set([103+shade,125+shade,147+shade,Math.round(edge*(174-69*rim))],(y*96+form*32+x)*4);
  }
  const texture=new T.DataTexture(pixels,96,64);
  texture.colorSpace=T.SRGBColorSpace;
  texture.minFilter=texture.magFilter=T.LinearFilter;
  texture.needsUpdate=true;
  const geometry=new T.PlaneGeometry(.265,.475);
  geometry.rotateX(-Math.PI/2);
  const birth=new T.InstancedBufferAttribute(new Float32Array(capacity),1).setUsage(T.DynamicDrawUsage);
  const forms=new T.InstancedBufferAttribute(new Float32Array(capacity),1).setUsage(T.DynamicDrawUsage);
  geometry.setAttribute('printBirth',birth);
  geometry.setAttribute('printForm',forms);
  const material=new T.MeshBasicMaterial({map:texture,transparent:true,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-1,polygonOffsetUnits:-1});
  const ageClock={value:0};
  material.onBeforeCompile=shader=>{
   shader.uniforms.printClock=ageClock;
   shader.vertexShader='uniform float printClock;attribute float printBirth,printForm;varying float printAge;\n'+shader.vertexShader;
   shader.vertexShader=shader.vertexShader.replace('#include <uv_vertex>','#include <uv_vertex>\n#ifdef USE_MAP\nvMapUv.x=(vMapUv.x*31.+.5+32.*printForm)/96.;\n#endif');
   shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nprintAge=printClock-printBirth;');
   shader.fragmentShader='varying float printAge;\n'+shader.fragmentShader;
   shader.fragmentShader=shader.fragmentShader.replace('#include <map_fragment>',`#include <map_fragment>\ndiffuseColor.a*=1.-smoothstep(18.,${life.toFixed(1)},printAge);`);
  };
  const mesh=new T.InstancedMesh(geometry,material,capacity);
  mesh.name='Left and right footprints in snow';mesh.layers.set(1);mesh.count=0;mesh.frustumCulled=false;
  mesh.instanceMatrix.setUsage(T.DynamicDrawUsage);root.add(mesh);
  const state={active:false,stamps:0,animalStamps:0,capacity},matrix=new T.Matrix4();
  const up=new T.Vector3(),forward=new T.Vector3(),right=new T.Vector3(),footScale=new T.Vector3();
  const gait={cat:[.29,.13,.19,.47,1],dog:[.39,.16,.24,.59,1],alpaca:[.56,.23,.43,.72,2]};
  let animals=new WeakMap();
  let slot=0,stride=.42,side=1,lastStamp=-Infinity;
  function surface(x,z){
   const land=N.islandHeight(x,z);
   if(!(land>N.islandLandscape.seaY+.62)||N.templeIndoorArea(x,z))return NaN;
   const ground=N.templeGroundHeight(x,z);
   return Math.abs(ground-land-.025)<.008?land:ground-N.templeSceneLayout.character.groundInset;
  }
  function stamp(x,z,dx,dz,time,form=0,scale=1){
   const y=surface(x,z),south=surface(x,z+.20),north=surface(x,z-.20),east=surface(x+.14,z),west=surface(x-.14,z);
   if(!Number.isFinite(y+south+north+east+west)||Math.max(south,north,east,west,y)-Math.min(south,north,east,west,y)>.36)return;
   const sx=(east-west)/.28,sz=(south-north)/.40;
   up.set(-sx,1,-sz).normalize();forward.set(dx,sx*dx+sz*dz,dz).normalize();right.crossVectors(up,forward);
   matrix.makeBasis(right,up,forward).scale(footScale.setScalar(scale)).setPosition(x,y+.013,z);
   mesh.setMatrixAt(slot,matrix);birth.setX(slot,time);forms.setX(slot,form);
   mesh.instanceMatrix.needsUpdate=true;birth.needsUpdate=true;forms.needsUpdate=true;
   mesh.count=Math.min(mesh.count+1,capacity);slot=(slot+1)%capacity;lastStamp=time;state.stamps++;if(form)state.animalStamps++;
  }
  function animal(actor,kind,ax,az,bx,bz){
   const profile=gait[kind];if(!state.active||!profile)return;
   const [step,spread,length,scale,form]=profile,distance=Math.hypot(bx-ax,bz-az);
   if(distance<1e-6||distance>step)return;
   let trail=animals.get(actor);
   if(!trail){trail={stride:step*.60,side:1};animals.set(actor,trail);}
   if(trail.stride+distance>=step){
    const dx=(bx-ax)/distance,dz=(bz-az)/distance,offset=step-trail.stride,x=ax+dx*offset,z=az+dz*offset;
    for(const end of [-1,1]){
     const lateral=end*trail.side*spread;
     stamp(x+dx*end*length+dz*lateral,z+dz*end*length-dx*lateral,dx,dz,ageClock.value,form,scale);
    }
    trail.side=-trail.side;
   }
   trail.stride=(trail.stride+distance)%step;
  }
  function walk(ax,az,bx,bz,time){
   if(!state.active)return;
   const distance=Math.hypot(bx-ax,bz-az);
   if(distance<1e-6||distance>spacing)return;
   if(stride+distance>=spacing){
    const dx=(bx-ax)/distance,dz=(bz-az)/distance,step=spacing-stride;
    stamp(ax+dx*step+dz*side*.132,az+dz*step-dx*side*.132,dx,dz,time);
    side=-side;
   }
   stride=(stride+distance)%spacing;
  }
  function clear(){mesh.count=0;slot=0;lastStamp=-Infinity;}
  function setActive(active){
   if(state.active===active)return;
   state.active=active;stride=.42;side=1;state.stamps=0;state.animalStamps=0;animals=new WeakMap();clear();
  }
  return {state,walk,animal,setActive,update(time){ageClock.value=time;if(mesh.count&&time-lastStamp>=life)clear();}};
 }

 window.TempleIslandLandscape={create(T,world,parent){
  const N=window.TempleNavigation,G=N.islandLandscape,root=new T.Group();root.position.y=-N.templeSceneLayout.assetOffsetY;root.name='Continuous coastal meadow';parent.add(root);
  const snowCover={value:0};
  const coastSnowY=(G.seaY+.28).toFixed(2),fullSnowY=(G.seaY+1.04).toFixed(2);
  const compactMeadow=!!window.matchMedia?.('(pointer: coarse)').matches || (window.navigator?.deviceMemory||8)<=4;
  const tracks=snowTracks(T,N,root,compactMeadow);
  const sheltered=N.templeSceneLayout.zones.map(({bounds:[a,b,c,d]})=>
   `(p.x>=${a.toFixed(2)}&&p.x<=${b.toFixed(2)}&&p.z>=${c.toFixed(2)}&&p.z<=${d.toFixed(2)})`).join('||');
  function coatSnow(material,exposure='1.',roof=false){
   const prepare=material.onBeforeCompile,cacheKey=material.customProgramCacheKey();
   material.customProgramCacheKey=()=>cacheKey+'-coastal-snow-'+exposure+'-'+roof;
   material.onBeforeCompile=function(shader,renderer){
    prepare.call(this,shader,renderer);
    shader.uniforms.snowCover=snowCover;
    shader.vertexShader='varying vec3 snowPoint;\n'+shader.vertexShader;
    shader.vertexShader=shader.vertexShader.replace('#include <project_vertex>',`#include <project_vertex>
     vec4 snowWorld=vec4(transformed,1.);
     #ifdef USE_INSTANCING
     snowWorld=instanceMatrix*snowWorld;
     #endif
     snowPoint=(modelMatrix*snowWorld).xyz;`);
    shader.fragmentShader='varying vec3 snowPoint;uniform float snowCover;\n'+shader.fragmentShader;
    shader.fragmentShader=shader.fragmentShader.replace('#include <normal_fragment_maps>',`#include <normal_fragment_maps>
     if(snowCover>0.){
      vec3 p=snowPoint;
      float facing=dot(nonPerturbedNormal,viewMatrix[1].xyz);
      float drift=.5+.5*sin(p.x*1.9+p.z*.87)*sin(p.x*.62-p.z*1.48);
      float cap=${roof?'smoothstep(.14,.49,facing+drift*.10)*smoothstep(.02,.14,facing)':'smoothstep(.24,.72,facing+drift*.16)'};
      diffuseColor.rgb=mix(diffuseColor.rgb,vec3(.86,.93,1.)*(.91+drift*.09),snowCover*cap*(${exposure}));
     }`);
   };
  }
  const openStone=`(p.y<4.5&&(${sheltered})?0.:.98)`;
  const p=[],col=[],indices=[],sand=new T.Color(0xd8c7a7),grass=new T.Color(0x789267),sage=new T.Color(0x50684b),hay=new T.Color(0x9a9a68),rock=new T.Color(0x90958a),wetSand=new T.Color(0x8c8f80),c=new T.Color();
  const smooth=(a,b,x)=>{const t=T.MathUtils.clamp((x-a)/(b-a),0,1);return t*t*(3-2*t);};
  // Broad patches persist into the distance as the camera-local blades fade.
  const meadowPatch=(x,z)=>.5+.30*Math.sin(x*.084+Math.sin(z*.11))+.20*Math.cos(z*.137-x*.065);
  for(let j=0;j<G.rows;j++)for(let i=0;i<G.columns;i++){
   const x=G.x0+i*G.step,z=G.z0+j*G.step,y=N.islandVertexHeight(x,z),r=N.islandRadius(x,z),slope=Math.hypot(N.islandVertexHeight(x+1,z)-N.islandVertexHeight(x-1,z),N.islandVertexHeight(x,z+1)-N.islandVertexHeight(x,z-1))/2;
   const patch=meadowPatch(x,z);
   p.push(x,y,z);
   c.copy(sage).lerp(grass,smooth(.04,.71,patch)).lerp(hay,smooth(.57,1.,patch)*.65);
   c.lerp(sand,smooth(.769,.852,r+(patch-.5)*.025));
   if(r<.79)c.lerp(rock,smooth(.35,.8,slope)*.45);
   if(r>.85)c.lerp(wetSand,1-smooth(G.seaY+.05,G.seaY+1.45,y));
   c.multiplyScalar(.97+.025*Math.sin(x*.17+Math.sin(z*.13))+.02*Math.cos(z*.23));
   col.push(c.r,c.g,c.b);
   if(i<G.columns-1&&j<G.rows-1){const a=j*G.columns+i,b=a+1,d=a+G.columns,cc=d+1;indices.push(a,d,cc,a,cc,b);}
  }
  const geometry=new T.BufferGeometry();geometry.setAttribute('position',new T.Float32BufferAttribute(p,3));geometry.setAttribute('color',new T.Float32BufferAttribute(col,3));geometry.setIndex(indices);geometry.computeVertexNormals();
  const material=new T.MeshStandardMaterial({vertexColors:true,roughness:1});
  material.onBeforeCompile=s=>{
   s.uniforms.snowCover=snowCover;
   s.vertexShader='varying vec3 landPoint;\n'+s.vertexShader;
   s.vertexShader=s.vertexShader.replace('#include <project_vertex>','#include <project_vertex>\nlandPoint=(modelMatrix*vec4(transformed,1.)).xyz;');
   s.fragmentShader='varying vec3 landPoint;uniform float snowCover;\n'+s.fragmentShader;
   s.fragmentShader=s.fragmentShader.replace('#include <color_fragment>',`#include <color_fragment>
    if(snowCover>0.){
     float drift=.5+.5*sin(landPoint.x*.37+sin(landPoint.z*.21))*cos(landPoint.z*.43);
     float settled=smoothstep(${coastSnowY},${fullSnowY},landPoint.y+drift*.24);
     vec3 blanket=mix(vec3(.70,.80,.90),vec3(.91,.96,1.),drift);
     diffuseColor.rgb=mix(diffuseColor.rgb,blanket,settled*snowCover);
    }
    vec2 grainUV=landPoint.xz*vec2(17.,23.);
    float detail=1.-smoothstep(.2,1.6,max(fwidth(grainUV.x),fwidth(grainUV.y)));
    float grain=sin(grainUV.x+sin(landPoint.z*13.))*sin(grainUV.y);
    diffuseColor.rgb*=1.+grain*.035*detail;`);
  };
  const terrain=new T.Mesh(geometry,material);terrain.name='Continuous coastal island terrain';terrain.layers.set(1);terrain.receiveShadow=true;root.add(terrain);
  const sunflowers=window.TempleSunflowers?.create(T,N,root)||null;
  const wishingFlowers=window.TempleWishingFlowers?.create(T,N,root)||null;
  const flowerFields=[sunflowers,wishingFlowers].filter(Boolean);
  for(const field of flowerFields)indexFlowerGeometry(field);
  const dummy=new T.Object3D(),trunkMat=new T.MeshStandardMaterial({color:0x846049,roughness:1}),leaves=new T.MeshStandardMaterial({color:0x9ab881,roughness:1}),trunks=new T.InstancedMesh(new T.CylinderGeometry(.65,1,1,9),trunkMat,N.islandTrees.length),crowns=new T.InstancedMesh(new T.IcosahedronGeometry(1,2),leaves,N.islandTrees.length*5);
  coatSnow(leaves);
  trunks.layers.set(1);crowns.layers.set(1);trunks.castShadow=crowns.castShadow=true;trunks.receiveShadow=crowns.receiveShadow=true;root.add(trunks,crowns);
  for(let i=0;i<N.islandTrees.length;i++){const t=N.islandTrees[i],y=N.islandHeight(t.x,t.z);dummy.position.set(t.x,y+t.height*.32,t.z);dummy.rotation.set(0,t.seed*6.28,.05);dummy.scale.set(t.radius,t.height*.64,t.radius);dummy.updateMatrix();trunks.setMatrixAt(i,dummy.matrix);
   for(let j=0;j<5;j++){const a=j*Math.PI*.5+t.seed*2;dummy.position.set(t.x+Math.cos(a)*(j===4?0:1.35),y+t.height*(j===4?.90:.69),t.z+Math.sin(a)*(j===4?0:1.35));dummy.rotation.set(0,a,.1);dummy.scale.set(1.8,2.0,1.6);dummy.updateMatrix();crowns.setMatrixAt(i*5+j,dummy.matrix);crowns.setColorAt(i*5+j,new T.Color().setHSL(.22+t.seed*.04,.23,.42+j*.018));}
   world.cameraObstacles.push({x:t.x,y:y+t.height*.32,z:t.z,hx:t.radius,hy:t.height*.32,hz:t.radius,label:'Coastal tree trunk'});
  }
  let seed=74113;const rand=()=>((seed=Math.imul(seed,1664525)+1013904223>>>0)/4294967296);
  // Dense local grass has one draw call; stable world seeds prevent crawling.
  // The distant meadow remains the same continuous terrain underneath it.
  // Keep the same near-field blades. Limit the far-field radius on small devices.
  const gridHalf=compactMeadow?46:64, gridSide=gridHalf*2+1, grassCapacity=gridSide*gridSide;
  const grassRadius=compactMeadow?33:49, fadeFrom=compactMeadow?19:30, fadeTo=compactMeadow?28:44;
  const blade=new T.BufferGeometry(),bp=[],bc=[];
  for(let i=0;i<8;i++){
   const a=i*2.399,dx=Math.cos(a),dz=Math.sin(a),radius=.065+(i%3)*.074;
   const ox=dx*radius,oz=dz*radius,h=.22+(i%4)*.060,w=.016+(i%3)*.005;
   const left=[ox+dz*w,0,oz-dx*w],right=[ox-dz*w,0,oz+dx*w];
   const tip=[ox+dx*(.08+i*.011),h,oz+dz*(.08+i*.011)];
   const tall=i%4===3,shoulder=[ox+dx*.038-dz*w*.45,h*.50,oz+dz*.038+dx*w*.45];
   const points=tall?[left,right,shoulder,left,shoulder,tip]:[left,right,tip];
   for(const v of points){
    const t=v[1]/h,glaucous=i%2;
    bp.push(...v);bc.push(.135+.20*t+.025*glaucous,.245+.235*t,.052+.075*t+.014*glaucous);
   }
  }
  blade.setAttribute('position',new T.Float32BufferAttribute(bp,3));blade.setAttribute('color',new T.Float32BufferAttribute(bc,3));blade.computeVertexNormals();
  const wind={value:0},grassMat=new T.MeshStandardMaterial({vertexColors:true,side:T.DoubleSide,roughness:1});
  grassMat.onBeforeCompile=s=>{
   s.uniforms.meadowTime=wind;
   s.vertexShader='uniform float meadowTime;\n'+s.vertexShader;
   // Sunlight through a thin leaf lifts its colour on the side facing away.
   s.fragmentShader=s.fragmentShader.replace('#include <emissivemap_fragment>',
    '#include <emissivemap_fragment>\n\n#if NUM_HEMI_LIGHTS > 0\n totalEmissiveRadiance+=diffuseColor.rgb*.22*hemisphereLights[0].skyColor.g;\n#endif');
   s.vertexShader=s.vertexShader.replace('#include <begin_vertex>',`#include <begin_vertex>
    vec3 base=instanceMatrix[3].xyz;
    float fade=1.-smoothstep(${fadeFrom.toFixed(1)},${fadeTo.toFixed(1)},distance(base.xz,cameraPosition.xz));
    float bend=position.y*position.y*fade;
    float breeze=sin(meadowTime*.83+base.x*.17+base.z*.13);
    transformed.y*=fade;
    // Rotate prevailing world wind back into this randomly oriented clump.
    vec2 dir=normalize(vec2(instanceMatrix[0].x,instanceMatrix[2].x));
    transformed.xz+=dir*bend*(.12+.23*breeze);`);
  };
  const blades=new T.InstancedMesh(blade,grassMat,grassCapacity);blades.name='Wind brushed meadow grass';blades.layers.set(1);blades.receiveShadow=true;blades.frustumCulled=false;blades.count=0;root.add(blades);
  let grassCenterX=NaN,grassCenterZ=NaN,grassBuild=null;
  const grassStaging=new Float32Array(grassCapacity*16),grassWork={lastMs:0,maxMs:0,builds:0};
  // One rolling cache slot per grid cell. Coordinates distinguish newly exposed
  // cells after movement or a camera cut, including at negative world positions.
  const cachedGX=new Int32Array(grassCapacity),cachedGZ=new Int32Array(grassCapacity);
  const cachedKind=new Uint8Array(grassCapacity),cachedMatrices=new Float32Array(grassCapacity*16);
  const cachedX=new Float64Array(grassCapacity),cachedZ=new Float64Array(grassCapacity);
  const hash=(x,z,k)=>{const v=Math.sin(x*127.1+z*311.7+k*73.9)*43758.5453;return v-Math.floor(v);};
  function updateView(camera){
   if(snowCover.value)return;
   // Use each batch's full authored bounds. Close flowers always regain their
   // original geometry. The gap prevents toggling at the edge of a field.
   for(const field of flowerFields){
    let triangles=0;
    for(const {mesh,near,far} of field.lodBatches){
     const distance=mesh.boundingBox.distanceToPoint(camera);
     if(distance>28)mesh.geometry=far;
     else if(distance<22)mesh.geometry=near;
     triangles+=mesh.count*mesh.geometry.index.count/3;
    }
    field.state.selectedTriangles=triangles;
   }
   const cx=Math.round(camera.x/6)*8,cz=Math.round(camera.z/6)*8;
   if(grassBuild && (Math.abs(grassBuild.cx-cx)>gridHalf || Math.abs(grassBuild.cz-cz)>gridHalf))grassBuild=null;
   if(!grassBuild){if(cx===grassCenterX&&cz===grassCenterZ)return;grassBuild={cx,cz,index:0,count:0};}
   const job=grassBuild,start=performance.now();
   // Keep the previous grass visible while rebuilding the next region in small
   // chunks. Camera movement never rebuilds all 16,641 candidates in one frame.
   while(job.index<grassCapacity){
    const i=Math.floor(job.index/gridSide)-gridHalf,j=job.index%gridSide-gridHalf;job.index++;
    const gx=job.cx+i,gz=job.cz+j;
    const slot=((gx%gridSide+gridSide)%gridSide)*gridSide+(gz%gridSide+gridSide)%gridSide;
    const offset=slot*16;
    if(!cachedKind[slot]||cachedGX[slot]!==gx||cachedGZ[slot]!==gz){
     const x=gx*.75+(hash(gx,gz,1)-.5)*.98,z=gz*.75+(hash(gx,gz,2)-.5)*.98;
     cachedGX[slot]=gx;cachedGZ[slot]=gz;cachedX[slot]=x;cachedZ[slot]=z;cachedKind[slot]=1;
     if(!((sunflowers&&window.TempleSunflowers.pathContains(x,z))||N.islandRadius(x,z)>.795+(meadowPatch(x,z)-.5)*.035||Math.abs(x)<65&&z<37&&z>-32||N.templeGardenLayout.pads.some(p=>Math.abs(x-p.x)<3&&Math.abs(z-p.z)<3))){
      const y=N.islandHeight(x,z);if(Number.isFinite(y)){
       dummy.position.set(x,y-.035,z);dummy.rotation.set(0,hash(x,z,3)*6.28,0);const size=.70+hash(x,z,4)*.45,patch=meadowPatch(x,z);dummy.scale.set(size,size*(1.25-.56*patch),size);dummy.updateMatrix();
       cachedMatrices.set(dummy.matrix.elements,offset);cachedKind[slot]=2;
      }
     }
    }
    if(cachedKind[slot]===2&&Math.hypot(cachedX[slot]-job.cx*.75,cachedZ[slot]-job.cz*.75)<=grassRadius){
     const dest=job.count++*16;
     for(let k=0;k<16;k++)grassStaging[dest+k]=cachedMatrices[offset+k];
    }
    if(job.index%8===0&&performance.now()-start>=2)break;
   }
   if(job.index===grassCapacity){blades.instanceMatrix.array.set(grassStaging.subarray(0,job.count*16));blades.count=job.count;blades.instanceMatrix.needsUpdate=true;grassCenterX=job.cx;grassCenterZ=job.cz;grassBuild=null;grassWork.builds++;}
   grassWork.lastMs=performance.now()-start;grassWork.maxMs=Math.max(grassWork.maxMs,grassWork.lastMs);
  }
  const pebbleMat=new T.MeshStandardMaterial({color:0x8f9585,roughness:1}),stones=[];
  coatSnow(pebbleMat,'smoothstep('+coastSnowY+','+fullSnowY+',p.y)');
  for(let i=0;i<60;i++){const a=rand()*Math.PI*2,r=.85+rand()*.08,x=Math.cos(a)*180*r,z=125+Math.sin(a)*210*r,y=N.islandHeight(x,z);if(y<G.seaY+.6)continue;dummy.position.set(x,y+.1,z);dummy.rotation.set(rand(),rand()*6.28,rand());dummy.scale.set(.25+rand()*.9,.16+rand()*.4,.35+rand()*.75);dummy.updateMatrix();stones.push(dummy.matrix.clone());}
  const pebbles=new T.InstancedMesh(new T.IcosahedronGeometry(1,1),pebbleMat,stones.length);pebbles.name='Scattered beach stones';pebbles.layers.set(1);pebbles.castShadow=pebbles.receiveShadow=true;stones.forEach((m,i)=>pebbles.setMatrixAt(i,m));root.add(pebbles);
  function setWeather(mode){
   const snowing=mode==='snow';snowCover.value=Number(snowing);tracks.setActive(snowing);
   blades.visible=!snowing;
   for(const field of flowerFields)field.root.visible=!snowing;
  }
  return {terrain,root,state:{ready:true,version:G.version,triangles:indices.length/3,trees:N.islandTrees.length,grassCapacity,compactMeadow,grassMode:'camera-local-stable-seed',grassWork,oldIslandRetired:true,oldWalkwayRetired:true,sunflowers:sunflowers?.state??null,wishingFlowers:wishingFlowers?.state??null,snow:tracks.state},
   coatSnow,coatRoofSnow:(material,minimumY)=>coatSnow(material,`smoothstep(${minimumY.toFixed(2)},${(minimumY+.55).toFixed(2)},p.y)`,true),coatOpenStone:material=>coatSnow(material,openStone),setWeather,trackWalk:tracks.walk,trackAnimal:tracks.animal,updateView,
   update:(dt,time)=>{wind.value=time;tracks.update(time);sunflowers?.update(time);wishingFlowers?.update(time);}};
 }};
})();
;
(function(){
 'use strict';
 window.TempleExterior={create(T,world){
  const nav=window.TempleNavigation,layout=nav.templeSceneLayout;
  const group=new T.Group();group.name='Temple exterior on stone platform';group.position.y=layout.assetOffsetY;world.scene.add(group);
  const sharedCameraGeometry=new Map();
  let cameraQuery=null;
  async function indexVisibility(){
   await TempleAssets.yieldFrame();
   group.updateMatrixWorld(true);
   const start=performance.now();
   cameraQuery=await TempleCameraQuery.create(T,[...group.children.filter(o=>o.isMesh),...(landscape?[landscape.terrain]:[])],sharedCameraGeometry);
   state.cameraQuery={mode:'bvh',meshes:cameraQuery.meshes,trees:cameraQuery.trees,buildThread:cameraQuery.buildThread,buildMs:performance.now()-start};
  }
  function clearDistance(from,to,padding=.22){return cameraQuery?cameraQuery.clearDistance(from,to,padding):from.distanceTo(to);}
  const state={ready:false,error:null,triangles:0,templeTriangles:0,islandTriangles:0,platformTop:layout.floorY,railingsRemoved:false,roomReservesReady:false};
  const stone=new T.MeshStandardMaterial({color:0xbdb6a7,roughness:.96,metalness:0});
  const paving=new T.MeshStandardMaterial({color:0xaba79d,roughness:.91,metalness:0});
  const entryStone=new T.MeshStandardMaterial({color:0x918c85,roughness:.86,metalness:.03});
  const pathReady=TempleAssets.texture(T,'assets/entrance-step-paving.jpg').then(texture=>{
   texture.colorSpace=T.SRGBColorSpace;texture.wrapS=texture.wrapT=T.RepeatWrapping;texture.anisotropy=4;
   paving.color.set(0xffffff);paving.map=texture;paving.bumpMap=texture;paving.bumpScale=.035;paving.needsUpdate=true;
  }).catch(error=>{state.pavingError=String(error.message||error);});
  const landscape=window.TempleIslandLandscape.create(T,world,group);world.landscape=landscape;state.landscape=landscape.state;
  const roofs=world.architecture?.shell?.meshes.filter(mesh=>mesh.userData.role==='roof')??[];
  for(const material of new Set(roofs.map(mesh=>mesh.material)))landscape.coatRoofSnow(material,5.8);
  landscape.coatOpenStone(stone);landscape.coatOpenStone(paving);landscape.coatOpenStone(entryStone);
  function slab(w,h,d,x,y,z,mat=stone){const m=new T.Mesh(new T.BoxGeometry(w,h,d),mat);m.position.set(x,y,z);m.layers.set(1);m.receiveShadow=true;group.add(m);return m;}
  const platformMaterial=stone;
  function worldStoneUV(mesh,repeat=9){const p=mesh.geometry.attributes.position,n=mesh.geometry.attributes.normal,uv=[];for(let i=0;i<p.count;i++){const x=p.getX(i)+mesh.position.x,y=p.getY(i)+mesh.position.y,z=p.getZ(i)+mesh.position.z;uv.push((Math.abs(n.getX(i))>.6?z:x)/repeat,(Math.abs(n.getY(i))>.5?z:y)/repeat);}mesh.geometry.setAttribute('uv',new T.Float32BufferAttribute(uv,2));return mesh;}
  function entryStoneUV(mesh){
   // UV swatches measured on the original plinth cap and front riser.
   const g=mesh.geometry,p=g.attributes.position,n=g.attributes.normal,uv=[];
   g.computeBoundingBox();
   const {min,max}=g.boundingBox;
   for(let i=0;i<p.count;i++){
    const top=Math.abs(n.getY(i))>.5,side=Math.abs(n.getX(i))>.5;
    const x=(p.getX(i)-min.x)/(max.x-min.x),y=(p.getY(i)-min.y)/(max.y-min.y),z=(p.getZ(i)-min.z)/(max.z-min.z);
    if(top)uv.push(.112+x*.033,.681+z*.005);
    else uv.push(.475+(side?z:x)*.006,.2465+y*.005);
   }
   g.setAttribute('uv',new T.Float32BufferAttribute(uv,2));
  }
  const mainSill=world.architecture?.entryFrame?.root?.getObjectByName('Entry frame flush stone sill');
  if(mainSill){
   mainSill.geometry=mainSill.geometry.clone();
   mainSill.material=entryStone;
   entryStoneUV(mainSill);
  }
  // Keep the hidden foundation below the lowered timber floor, not above it.
  // No broad legacy slab: its uncovered edges stood above the new grass.
  // Extend the original facade's white stone footings down to the lowered floor.
  // The L-shaped returns stay outside the doorway and its wider outdoor path.
  const footingStone=new T.MeshStandardMaterial({color:0xaaa394,roughness:.96});
  landscape.coatOpenStone(footingStone);
  const stoneFinish=window.TempleFinishes;
  if(stoneFinish){
   void stoneFinish.apply(T,stone,'stone',{tint:0xbec8c2,bump:.048,roughness:.89});
   void stoneFinish.apply(T,footingStone,'stone',{tint:0xb7beb6,bump:.028,roughness:.94});
   pathReady.then(()=>stoneFinish.load(T,'stone')).then(aggregate=>{
    const bump=aggregate.clone();bump.wrapS=bump.wrapT=T.RepeatWrapping;bump.repeat.set(2.8,2.8);bump.needsUpdate=true;
    paving.bumpMap=bump;paving.bumpScale=.035;paving.roughness=.81;paving.needsUpdate=true;
   }).catch(()=>{});
  }
  // All three perimeter bases are generated below from shared foundation
  // surfaces. The former front-only solid boxes had no matching navigation.
  state.foundations=layout.foundations.map(h=>({id:h.id,top:h.top,sourceCutoff:h.cutoff,sharedCollision:true}));
  // Visual structure is generated from the same world-space faces used by navigation.
  // Convert world Y once because the retained user assets are under a translated root.
  const surfaceInset=layout.character.groundInset,structureThickness=.6;
  const names={ramp:'Three stone stair flights with two rest landings',connector:'Connected stone walkway'};
  for(const surface of nav.templeGetStructure()){
   const top=surface.vertices.map(([x,y,z])=>{
    // Close the exposed recess edges up to the measured stone cap.
    const edge=surface.recesses?.some(([x0,x1,z0,z1])=>x>=x0-1e-6&&x<=x1+1e-6&&z>=z0-1e-6&&z<=z1+1e-6);
    const height=surface.originalStone&&!edge?Math.min(y-.22,surface.backingHeight):y;
    return [x,height-layout.assetOffsetY-surfaceInset,z];
   });
   const bottom=top.map(([x,y,z])=>[x,y-(surface.thickness??structureThickness),z]);
   const positions=[...top,...bottom].flat(),indices=[...surface.indices],count=top.length,edges=new Map();
   for(let i=0;i<surface.indices.length;i+=3){
    const [a,b,c]=surface.indices.slice(i,i+3);indices.push(c+count,b+count,a+count);
    for(const [from,to] of [[a,b],[b,c],[c,a]]){
     const key=Math.min(from,to)+','+Math.max(from,to);
     if(edges.has(key))edges.delete(key);else edges.set(key,[from,to]);
    }
   }
   // Only boundary edges receive sides: adjacent top triangles share no internal wall.
   for(const [a,b] of edges.values())indices.push(a,b+count,b,a,a+count,b+count);
   let geometry=new T.BufferGeometry();geometry.setAttribute('position',new T.Float32BufferAttribute(positions,3));geometry.setIndex(indices);if(surface.originalStone)geometry.setAttribute('uv',new T.Float32BufferAttribute([...surface.uv,...surface.uv],2));geometry=geometry.toNonIndexed();geometry.computeVertexNormals();
   const paved=!surface.originalStone && (surface.id.startsWith('entry-')||surface.id.startsWith('court-'));
   const mesh=new T.Mesh(geometry,surface.stoneAtlas?entryStone:paved?paving:stone);
   mesh.name=names[surface.id]||'Level stone entrance apron '+surface.id;
   mesh.userData.structureId=surface.id;mesh.layers.set(1);mesh.receiveShadow=true;
   if(surface.originalStone){mesh.userData.originalStoneRepair=true;mesh.name=surface.id;}
   else if(surface.stoneAtlas)entryStoneUV(mesh);
   else worldStoneUV(mesh,paved?4.8:9);
   group.add(mesh);
  }
  const hemi=new T.HemisphereLight(0xe9d7b4,0x514638,2);hemi.layers.set(1);world.scene.add(hemi);
  const key=new T.DirectionalLight(0xffe3b5,2.1);key.position.set(-22,45,22);key.layers.set(1);key.castShadow=true;key.shadow.mapSize.set(1024,1024);Object.assign(key.shadow.camera,{left:-40,right:40,top:40,bottom:-40,near:.1,far:120});key.shadow.camera.layers.set(1);key.shadow.normalBias=.025;world.scene.add(key,key.target);
  function focusShadows(point){const coastal=Math.abs(point.x)>70||point.z>65,x=coastal?point.x:0,z=coastal?point.z:0,y=coastal?(nav.islandHeight(x,z)||0):0;key.target.position.set(x,y,z);key.position.set(x-22,y+45,z+22);key.target.updateMatrixWorld();}
  function restoreOriginalStone(source,options,cutoff){
   source.updateWorldMatrix(true,false);const g=source.geometry.clone(),p=g.attributes.position,idx=g.index,kept=[],v=new T.Vector3();
   for(let i=0;i<idx.count;i+=3){let low=false;for(let j=0;j<3;j++){v.fromBufferAttribute(p,idx.getX(i+j)).applyMatrix4(source.matrixWorld);if(v.y<cutoff)low=true;}if(low)kept.push(idx.getX(i),idx.getX(i+1),idx.getX(i+2));}
   g.setIndex(kept);const sourceMaterial=Array.isArray(source.material)?source.material[0]:source.material;
   const material=new T.MeshStandardMaterial({map:sourceMaterial.map,roughness:.86,metalness:.03,side:T.DoubleSide});
   const f=window.TempleInteriorFinish.create(T).applySourceShell(g,material,{...options,floorCutoff:null,cutouts:[...(options.cutouts||[]),[-1000,1000,cutoff,1000,-1000,1000]]});
   landscape.coatOpenStone(material);
   const skin=new T.Mesh(g,f.materials);skin.name=source.name+' original stone skin';skin.position.copy(source.position);skin.scale.copy(source.scale);skin.layers.set(1);skin.receiveShadow=true;skin.castShadow=false;skin.userData.templeInteriorClip=f.clip;group.add(skin);
  }
  function extractScanSection(source,bounds,scale,offset){
   const [xmin,xmax,ymin,ymax,zmin,zmax]=bounds;
   const {position,normal,uv}=source.attributes,idx=source.index;
   const remap=new Map(),vertices=[],normals=[],coords=[],indices=[];
   for(let i=0;i<idx.count;i+=3){
    const a=idx.getX(i),b=idx.getX(i+1),c=idx.getX(i+2);
    const x=(position.getX(a)+position.getX(b)+position.getX(c))*scale/3;
    const y=(position.getY(a)+position.getY(b)+position.getY(c))*scale/3+offset;
    const z=(position.getZ(a)+position.getZ(b)+position.getZ(c))*scale/3;
    if(x<xmin||x>xmax||y<ymin||y>ymax||z<zmin||z>zmax)continue;
    for(const vertex of [a,b,c]){
     if(!remap.has(vertex)){
      remap.set(vertex,vertices.length/3);
      vertices.push(position.getX(vertex),position.getY(vertex),position.getZ(vertex));
      normals.push(normal.getX(vertex),normal.getY(vertex),normal.getZ(vertex));
      coords.push(uv.getX(vertex),uv.getY(vertex));
     }
     indices.push(remap.get(vertex));
    }
   }
   if(!indices.length)return null;
   const section=new T.BufferGeometry();
   section.setAttribute('position',new T.Float32BufferAttribute(vertices,3));
   section.setAttribute('normal',new T.Float32BufferAttribute(normals,3));
   section.setAttribute('uv',new T.Float32BufferAttribute(coords,2));
   section.setIndex(indices);section.computeBoundingSphere();
   return section;
  }
  function restoreMainLanternTassel(source,material){
   // The original right scan stops at the cap. Copy the left tassel below
   // its cap and align its neck with the underside of the right fixture.
   const tassel=extractScanSection(source,[-8.12,-7.26,5.2,7.76,19.3,20.22],1,layout.assetOffsetY-.009);
   if(!tassel)return;
   const fixture=new T.Mesh(tassel,material.clone());
   fixture.name='Main hall right entrance lantern tassel';
   fixture.position.set(.10,-.009,0);
   fixture.scale.x=-1;
   fixture.layers.set(1);fixture.castShadow=fixture.receiveShadow=true;
   group.add(fixture);
   state.triangles+=tassel.index.count/3;
  }
  function pavilionLanternPair(source,material,h){
   // The left scan includes its entire tassel. Take only the two fixtures
   // below the eave attachment and reuse that complete fixture on both sides.
   const xmin=3.04,xmax=4.74,ymin=2.45,ymax=6.14,zmin=8.64,zmax=10.69;
   const scale=h.scale,offset=layout.assetOffsetY*scale-.0045;
   const lamp=extractScanSection(source,[-xmax,-xmin,ymin,ymax,zmin,zmax],scale,offset);
   if(!lamp)return [];
   const finish=material.clone();
   const cutouts=[];
   for(const side of [-1,1]){
    const fixture=new T.Mesh(lamp,finish);
    fixture.name=(h.id==='scripture'?'Scripture':'Wealth')+' matched entrance lantern '+side;
    fixture.position.set(h.x,offset-layout.assetOffsetY,h.z);
    fixture.scale.set(-side*scale,scale,scale);
    fixture.layers.set(1);fixture.castShadow=fixture.receiveShadow=true;group.add(fixture);
    const [a,b]=side<0?[-xmax,-xmin]:[xmin,xmax];
    cutouts.push([h.x+a,h.x+b,ymin,ymax,h.z+zmin,h.z+zmax]);
   }
   state.triangles+=lamp.index.count*2/3;
   return cutouts;
  }
  async function loadAsset(file,label){
   const response=await TempleAssets.fetch('assets/'+file);if(!response.ok)throw Error('Exterior manifest unavailable');const manifest=await response.json();
   const data=await TempleAssets.fetch('assets/'+manifest.file);if(!data.ok)throw Error('Exterior mesh unavailable');const bytes=await data.arrayBuffer();if(bytes.byteLength!==manifest.byteLength)throw Error('Exterior mesh length mismatch');
   const geometry=new T.BufferGeometry();
   for(const name of ['position','uv']){const a=manifest.attributes[name],size=name==='uv'?2:3,packed=new Uint16Array(bytes,a.byteOffset,a.length),values=new Float32Array(a.length);for(let i=0;i<values.length;i++)values[i]=a.min[i%size]+packed[i]/65535*a.scale[i%size];geometry.setAttribute(name,new T.BufferAttribute(values,size));}
   const n=manifest.attributes.normal;geometry.setAttribute('normal',new T.BufferAttribute(new Int8Array(bytes,n.byteOffset,n.length),3,true));
   const a=manifest.attributes.index;geometry.setIndex(new T.BufferAttribute(new Uint32Array(bytes,a.byteOffset,a.length),1));geometry.computeBoundingBox();geometry.computeBoundingSphere();
   if(file==='temple-shell-lowered.json')state.roomReservesReady=true;
   const texture=await TempleAssets.texture(T,'assets/'+manifest.texture);texture.colorSpace=T.SRGBColorSpace;texture.flipY=true;texture.anisotropy=4;
   if(file==='temple-shell-lowered.json'){entryStone.map=texture;entryStone.color.set(0xffffff);entryStone.needsUpdate=true;}
   for(const repair of group.children.filter(o=>o.userData.originalStoneRepair))repair.material=footingStone;
   const material=new T.MeshStandardMaterial({map:texture,roughness:.86,metalness:.03,side:T.DoubleSide});
   let renderedMaterial=material,finished=null;
   const opening=layout.openings.find(item=>item.id==='main-entry');
   const doorCutouts=world.architecture?.entryFrame&&window.TempleEntryFrame?window.TempleEntryFrame.sourceCutouts(opening):[[-5.38,5.38,7.99,9.55,14.35,16.15]];
   const mainFoundation=layout.foundations[0];
   // The original broken riser extends slightly ahead of the new cap.
   const drumRecesses=mainFoundation.recesses.map(bounds=>{
    const [x0,x1,z0,z1]=bounds;
    // The inner return terminates below the original red door surround.
    const cutoff=mainFoundation.entryReturns.includes(bounds)?1.69:mainFoundation.cutoff;
    return [x0,x1,layout.floorY-.6,cutoff,z0,z1+.24];
   });
   const cutouts=[...doorCutouts,...drumRecesses];
   if(file==='temple-shell-lowered.json')restoreMainLanternTassel(geometry,material);
   if(file==='temple-shell-lowered.json'&&window.TempleInteriorFinish){const finish=window.TempleInteriorFinish.create(T);finished=finish.applySourceShell(geometry,material,{assetOffsetY:layout.assetOffsetY-.009,floorCutoff:layout.foundations[0].cutoff,cutouts});renderedMaterial=finished.materials;state.interiorFinish=finished.report;}
   landscape.coatRoofSnow(material,5.8);
   const mesh=new T.Mesh(geometry,renderedMaterial);mesh.name=label;if(file==='temple-shell-lowered.json')mesh.position.y=-.009;if(finished){mesh.customDepthMaterial=finished.depthMaterial;mesh.customDistanceMaterial=finished.distanceMaterial;mesh.userData.templeInteriorClip=finished.clip;}mesh.layers.set(1);mesh.receiveShadow=true;mesh.castShadow=true;group.add(mesh);
   if(file==='temple-shell-lowered.json'){
    restoreOriginalStone(mesh,{cutouts},layout.foundations[0].cutoff);
    for(const h of layout.sideHalls){
     const g=geometry.clone(),m=material.clone();
     // Only the world transform and clipping predicate differ between these shells.
     sharedCameraGeometry.set(g,geometry);m.onBeforeCompile=()=>{};m.customProgramCacheKey=()=>'';
     const [a,b,c,d]=h.bounds,edge=h.ceilingY+.13,ridge=h.ceilingY+2.78;
     // Clear the raised frame and its centre bay, keeping the original eaves.
     const envelope={bounds:{minX:a-.13,maxX:b+.13,minZ:c-.13,maxZ:d+1.2,minY:-.14},
      xProfile:[[a-.13,edge],[a+1.45,edge],[a+4.25,ridge],[b-4.25,ridge],[b-1.45,edge],[b+.13,edge]],
      zProfile:[[c-.13,edge],[c+.75,edge],[c+3.25,ridge],[d-3.25,ridge],[d-.85,edge],[d+.13,edge],[d+1.2,6.83]],roofOffset:0};
     const pavilionCutouts=pavilionLanternPair(geometry,material,h);
     const foundation=layout.foundations.find(f=>f.id===h.id);
     const stoneCutouts=(h.entryPad?.bounds??[]).map(([x0,x1,z0,z1])=>[x0,x1,-.3,foundation.cutoff,z0,z1+.04]);
     const f=window.TempleInteriorFinish.create(T).applySourceShell(g,m,{envelope,cutouts:pavilionCutouts,floorCutoff:foundation.cutoff});
     landscape.coatRoofSnow(m,6.5);
     const pavilion=new T.Mesh(g,f.materials);pavilion.name='User '+h.label+' matching exterior';pavilion.position.set(h.x,layout.assetOffsetY*h.scale-layout.assetOffsetY-.0045,h.z);pavilion.scale.setScalar(h.scale);pavilion.customDepthMaterial=f.depthMaterial;pavilion.customDistanceMaterial=f.distanceMaterial;pavilion.userData.templeInteriorClip=f.clip;pavilion.userData.sideHallId=h.id;pavilion.layers.set(1);pavilion.castShadow=pavilion.receiveShadow=true;group.add(pavilion);restoreOriginalStone(pavilion,{envelope,cutouts:stoneCutouts},foundation.cutoff);
    }
    state.sideHalls=layout.sideHalls.map(h=>({id:h.id,x:h.x,z:h.z,scale:h.scale,door:h.door}));
   }
   state.triangles+=manifest.triangleCount*(file==='temple-shell-lowered.json'?3:1);return manifest.triangleCount;
  }
  const ready=Promise.all([loadAsset('temple-shell-lowered.json','User temple - door removed'),pathReady]).then(async([temple])=>{state.templeTriangles=temple;state.islandTriangles=landscape.state.triangles;state.railingsRemoved=true;await indexVisibility();state.ready=true;}).catch(error=>{state.error=String(error.message||error);console.error('Temple exterior:',error);});return{state,ready,group,clearDistance,focusShadows};
 }};
})();
;
/* Camera-local precipitation: one draw call per active mode, GPU animation. */
(function(){
 'use strict';
 window.TempleWeather={create(T,world){
  const navigation=window.TempleNavigation,layout=navigation.templeSceneLayout;
  const group=new T.Group();group.name='Optional outdoor rain and snow';world.scene.add(group);
  const coarse=window.matchMedia?.('(pointer: coarse)').matches||false;
  const reduced=window.matchMedia?.('(prefers-reduced-motion: reduce)').matches||false;
  const count=coarse?720:1400,snowCount=coarse?400:760;
  const state={mode:'clear',rainParticles:count,snowParticles:snowCount,gpuAnimated:true,drawCalls:0};
  const uniforms={time:{value:0},center:{value:new T.Vector3()},ground:{value:0},pointScale:{value:420},maxFlake:{value:32},
   roof0:{value:new T.Vector4(-22,22,-17,17)},roof1:{value:new T.Vector4()},roof2:{value:new T.Vector4()},floorY:{value:world.floorY??0},
   density:{value:reduced?.45:1}};
  layout.sideHalls.forEach((hall,i)=>uniforms['roof'+(i+1)].value.set(hall.bounds[0]-1.2,hall.bounds[1]+1.2,hall.bounds[2]-1.2,hall.bounds[3]+1.2));
  const common=`uniform float time,ground,floorY;uniform vec3 center;uniform vec4 roof0,roof1,roof2;varying vec3 weatherPoint;
   bool covered(vec3 p,vec4 r,float height){return p.x>r.x&&p.x<r.y&&p.z>r.z&&p.z<r.w&&p.y<floorY+height;}
   bool underRoof(vec3 p){return covered(p,roof0,23.)||covered(p,roof1,13.)||covered(p,roof2,13.);}`;
  let seed=16341;const rand=()=>((seed=(Math.imul(seed,1664525)+1013904223)>>>0)/4294967296);
  const rainPositions=new Float32Array(count*6),rainPhase=new Float32Array(count*2),rainTips=new Float32Array(count*2);
  for(let i=0;i<count;i++){const x=rand()*64-32,y=rand()*34,z=rand()*64-32,phase=rand();for(let k=0;k<2;k++){const at=i*6+k*3;rainPositions[at]=x;rainPositions[at+1]=y;rainPositions[at+2]=z;rainPhase[i*2+k]=phase;rainTips[i*2+k]=k;}}
  const rainGeometry=new T.BufferGeometry();rainGeometry.setAttribute('position',new T.BufferAttribute(rainPositions,3));rainGeometry.setAttribute('phase',new T.BufferAttribute(rainPhase,1));rainGeometry.setAttribute('tip',new T.BufferAttribute(rainTips,1));
  const rainMaterial=new T.ShaderMaterial({uniforms,transparent:true,depthWrite:false,
   vertexShader:common+`attribute float phase,tip;void main(){vec3 p=position;p.x=mod(p.x+time*1.8+32.,64.)-32.+center.x+tip*.09;p.z+=center.z+tip*.025;
    float drop=mod(position.y-time*(19.+phase*6.),34.);p.y=center.y+drop-5.+tip*.75;weatherPoint=p;gl_Position=projectionMatrix*viewMatrix*vec4(p,1.);}`,
   fragmentShader:common+`uniform float density;void main(){if(underRoof(weatherPoint)||weatherPoint.y<ground)discard;float edge=1.-smoothstep(20.,32.,distance(weatherPoint.xz,center.xz));gl_FragColor=vec4(.69,.82,.91,.48*edge*density);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
   }`});
  const rain=new T.LineSegments(rainGeometry,rainMaterial);rain.name='GPU rain streaks';rain.frustumCulled=false;group.add(rain);
  const snowPositions=new Float32Array(snowCount*3),snowPhase=new Float32Array(snowCount);
  for(let i=0;i<snowCount;i++){snowPositions.set([rand()*54-27,rand()*23,rand()*54-27],i*3);snowPhase[i]=rand();}
  const snowGeometry=new T.BufferGeometry();snowGeometry.setAttribute('position',new T.BufferAttribute(snowPositions,3));snowGeometry.setAttribute('phase',new T.BufferAttribute(snowPhase,1));
  const snowMaterial=new T.ShaderMaterial({uniforms,transparent:true,depthWrite:false,
   vertexShader:common+`attribute float phase;uniform float pointScale,maxFlake;varying float flutter,depth;
    void main(){vec3 p=position;flutter=time*(.40+phase*.40)+phase*31.;
    p.x=mod(p.x+time*.72+27.,54.)-27.+center.x+sin(flutter)*.67;
    p.z+=center.z+cos(flutter*.73)*.62;
    p.y=center.y+mod(position.y-time*(.78+phase*.92),23.)-6.;
    weatherPoint=p;vec4 mv=viewMatrix*vec4(p,1.);depth=-mv.z;gl_Position=projectionMatrix*mv;
    gl_PointSize=clamp(pointScale*mix(.095,.32,phase*phase)/max(2.2,depth),2.,maxFlake);}`,
   fragmentShader:common+`uniform float density;varying float flutter,depth;
    void main(){if(underRoof(weatherPoint)||weatherPoint.y<ground)discard;
    vec2 p=gl_PointCoord*2.-1.;float c=cos(flutter),s=sin(flutter);p=mat2(c,-s,s,c)*p;
    float core=1.-smoothstep(.29,.85,length(p*vec2(.92,1.34)));
    float tuft=1.-smoothstep(.17,.49,length(p-vec2(.37,.15)));
    float feather=1.-smoothstep(.11,.41,length(p+vec2(.31,.25)));
    float alpha=max(core,max(tuft*.73,feather*.74));
    float edge=1.-smoothstep(19.,28.,distance(weatherPoint.xz,center.xz));
    gl_FragColor=vec4(.95,.98,1.,alpha*.92*edge*density*smoothstep(.7,2.6,depth));
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
   }`});
  const snow=new T.Points(snowGeometry,snowMaterial);snow.name='GPU drifting snow';snow.frustumCulled=false;group.add(snow);
  snow.onBeforeRender=(renderer,scene,camera)=>{
   uniforms.pointScale.value=renderer.domElement.height*.5*camera.projectionMatrix.elements[5];
   uniforms.maxFlake.value=(coarse?27:33)*renderer.getPixelRatio();
  };
  const flash=new T.DirectionalLight(0xc7deff,0);flash.position.set(-90,100,45);flash.layers.set(1);flash.name='Distant storm lightning light';flash.userData.weatherManaged=true;world.scene.add(flash);
  const boltGeometry=new T.BufferGeometry(),boltVertices=[];
  const branch=[[0,0],[2,-5],[-1,-10],[3,-15],[1,-21],[4,-28],[2,-36]];
  for(let i=1;i<branch.length;i++)boltVertices.push(branch[i-1][0],branch[i-1][1],0,branch[i][0],branch[i][1],0);
  boltVertices.push(-1,-10,0,-7,-15,1,-7,-15,1,-9,-21,2);
  boltGeometry.setAttribute('position',new T.Float32BufferAttribute(boltVertices,3));
  const bolt=new T.LineSegments(boltGeometry,new T.LineBasicMaterial({color:0xe3efff,transparent:true,opacity:0,depthWrite:false}));bolt.name='Distant branched lightning';bolt.frustumCulled=false;group.add(bolt);
  let lastTime=0,nextLightning=Infinity,lightningAt=-Infinity,thunderAt=Infinity,strength=0;
  state.lightningCount=0;
  function setMode(mode){if(!['clear','rain','snow'].includes(mode))mode='clear';state.mode=mode;rain.visible=mode==='rain';snow.visible=mode==='snow';group.visible=mode!=='clear';state.drawCalls=group.visible?1:0;nextLightning=mode==='rain'?lastTime+8:Infinity;thunderAt=Infinity;lightningAt=-Infinity;flash.intensity=0;bolt.material.opacity=0;bolt.visible=false;return mode;}
  function triggerLightning(time=lastTime){if(state.mode!=='rain')return;strength=.65+rand()*.35;lightningAt=time;thunderAt=time+1.4+rand()*1.7;nextLightning=time+19+rand()*19;state.lightningCount++;}
  function update(dt,time,player,cameraPosition){if(time<lastTime){nextLightning=state.mode==='rain'?time+8:Infinity;thunderAt=Infinity;lightningAt=-Infinity;}lastTime=time;if(!group.visible)return;uniforms.time.value=reduced?time*.4:time;const x=player?.x??0,z=player?.z??7.5,y=player?.y??0;
   // Overlook and aerial views can be far from the player. Centre snow on the
   // view while retaining the player-relative rain and lightning contract.
   if(state.mode==='snow'&&cameraPosition)uniforms.center.value.copy(cameraPosition);
   else uniforms.center.value.set(x,y,z);
   const seaY=navigation.islandLandscape.seaY;
   uniforms.ground.value=state.mode==='snow'?seaY:Math.min(navigation.islandHeight(x,z),seaY);
   if(state.mode==='rain'&&time>=nextLightning){triggerLightning(time);bolt.position.set(x-90,92,z-130);}
   const age=time-lightningAt,pulse=age>=0&&age<.20?Math.max(0,1-age/.20)*strength:0;
   const indoors=!!navigation.templeIndoorArea(x,z);flash.intensity=reduced||indoors?0:pulse*.85;bolt.material.opacity=reduced?0:pulse;bolt.visible=!reduced&&state.mode==='rain'&&pulse>0;state.drawCalls=1+(bolt.visible?1:0);
   if(time>=thunderAt){thunderAt=Infinity;return{thunder:strength};}
  }
  function setQuality(value=1){const fraction=Math.max(.2,Math.min(1,Number.isFinite(value)?value:1));
   state.quality=fraction;state.rainParticles=Math.round(count*fraction);state.snowParticles=Math.round(snowCount*fraction);
   rainGeometry.setDrawRange(0,state.rainParticles*2);snowGeometry.setDrawRange(0,state.snowParticles);
  }
  setMode('clear');setQuality(1);
  return{state,group,setMode,setQuality,update,triggerLightning,dispose(){group.removeFromParent();flash.removeFromParent();rainGeometry.dispose();snowGeometry.dispose();rainMaterial.dispose();snowMaterial.dispose();boltGeometry.dispose();bolt.material.dispose();}};
 }};
})();
;
/* Local, procedural sea / sky / seasons. No remote textures or services. */
(function () {
  'use strict';
  window.TempleAmbience = { create(T, world, exterior) {
    const seaY = window.TempleNavigation.islandLandscape.seaY, scene = world.scene, group = new T.Group();
    group.name = 'Sea sky and four seasons'; scene.add(group);
    const state = { ready: true, time: 'day', season: 'spring', weather:'clear', seaLevel: seaY, shorelineReady: false, shorelineSamples: 0, flowers: 540 };
    const weather=window.TempleWeather?.create(T,world)||null;
    try { const saved=JSON.parse(localStorage.getItem('quiet-temple-ambience')||'null'); if(saved && ['day','sunset','night'].includes(saved.time))state.time=saved.time;if(saved&&['spring','summer','autumn','winter'].includes(saved.season))state.season=saved.season;if(saved&&['clear','rain','snow'].includes(saved.weather))state.weather=saved.weather; } catch (_) {}
    weather?.setMode(state.weather);world.landscape?.setWeather(state.weather);
    state.precipitation=weather?.state??null;
    const palettes={
      day:{top:0x4a86b1,horizon:0xc9e0e0,sea:0x79caba,deep:0x245668,fog:0xd2e3df,night:0,key:1.80,hemi:1.22},
      sunset:{top:0x766b91,horizon:0xf1bd93,sea:0x82aaa1,deep:0x415f73,fog:0xd9bbb0,night:.12,key:1.38,hemi:1.05},
      night:{top:0x111b3b,horizon:0x6e7f9d,sea:0x345866,deep:0x152c46,fog:0x36455e,night:1,key:.28,hemi:.35}
    };
    const U={time:{value:0},night:{value:0},overcast:{value:0},sunHeight:{value:.42},top:{value:new T.Color()},horizon:{value:new T.Color()},sea:{value:new T.Color()},deep:{value:new T.Color()}};
    const sky = new T.Mesh(new T.SphereGeometry(950,32,20),new T.ShaderMaterial({side:T.BackSide,depthWrite:false,fog:false,uniforms:U,
      vertexShader:'varying vec3 vDirection;void main(){vDirection=normalize(position);gl_Position=projectionMatrix*vec4(mat3(viewMatrix)*position,1.0);gl_Position.z=gl_Position.w*.99999;}',
      fragmentShader:`varying vec3 vDirection;uniform float time,night,sunHeight,overcast;uniform vec3 top,horizon;
        float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
        float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hash(i),hash(i+vec2(1.,0.)),f.x),mix(hash(i+vec2(0.,1.)),hash(i+1.),f.x),f.y);}
        void main(){vec3 d=normalize(vDirection);float h=max(d.y,0.);vec3 col=mix(horizon,top,pow(smoothstep(-.05,.65,h),.45));
          vec2 cloud=d.xz/max(.18,d.y+.12)*2.2+vec2(time*.003,0.);float n=noise(cloud)*.6+noise(cloud*2.1)*.28+noise(cloud*4.1)*.12;
          float veil=smoothstep(.53,.69,n)*smoothstep(.03,.18,h)*(1.-smoothstep(.65,.96,h));col=mix(col,mix(vec3(.98,.95,.86),vec3(.40,.45,.62),night),veil*.76);
          float storm=noise(cloud*.72+vec2(time*.005))* .65+noise(cloud*1.8)*.35;col=mix(col,mix(vec3(.34,.40,.48),vec3(.62,.67,.72),storm)*(1.-night*.7),overcast*smoothstep(-.04,.16,h));
          vec3 sunDir=normalize(vec3(-.65,sunHeight,-.5));float sd=max(dot(d,sunDir),0.);col+=vec3(1.,.76,.40)*pow(sd,90.)*.28*(1.-night)*(1.-overcast);col=mix(col,vec3(1.,.91,.65),smoothstep(.99935,.9998,sd)*(1.-night)*(1.-overcast));
          vec3 moonDir=normalize(vec3(.48,.55,-.65));float md=max(dot(d,moonDir),0.);col+=vec3(.48,.61,.85)*pow(md,65.)*.18*night;col=mix(col,vec3(.92,.95,1.),smoothstep(.9992,.9997,md)*night);
          vec2 starUV=vec2(atan(d.z,d.x),asin(clamp(d.y,-1.,1.)))*vec2(140.,200.);vec2 cell=floor(starUV);float star=hash(cell);float dotStar=1.-smoothstep(.025,.12,length(fract(starUV)-.5));col+=dotStar*step(.985,star)*night*smoothstep(.04,.3,h)*(.55+.18*sin(time*.4+star*100.));
          gl_FragColor=vec4(col,1.);
          #include <tonemapping_fragment>
          #include <colorspace_fragment>
        }` }));
    sky.position.set(0,0,135);sky.name='Continuous horizon sky';sky.frustumCulled=false;sky.renderOrder=-10;group.add(sky);
    // Sample the same triangulated surface used under the player's feet. More
    // rings near the waterline let the swell lift and settle on the wet sand.
    const nav = window.TempleNavigation;
    const sectors = 360, centreZ = 135;
    const offsets = [-12,-7,-4,-2,0,2,4,7,11,17,26,42,70,120,220,440,900,5200];
    const vertices = [], coast = [], triangles = [], coastPoints=[];
    for (let n=0; n<sectors; n++) {
      const angle = n*Math.PI*2/sectors, dx = Math.cos(angle), dz = Math.sin(angle);
      let lo = 0, hi = 300;
      for (let j=0; j<13; j++) {
        const radius = (lo+hi)*.5, h = nav.islandHeight(dx*radius, centreZ+dz*radius);
        if (Number.isFinite(h) && h>seaY) lo=radius; else hi=radius;
      }
      const shoreline = (lo+hi)*.5;
      coastPoints.push(new T.Vector3(dx*shoreline,seaY,centreZ+dz*shoreline));
      for (let j=0; j<offsets.length; j++) {
        const r=shoreline+offsets[j], x=dx*r, z=centreZ+dz*r;
        const ground=nav.islandHeight(x,z);
        vertices.push(x,seaY,z);
        coast.push(offsets[j],Number.isFinite(ground)?seaY-ground:8);
        if (j+1===offsets.length) continue;
        const a=n*offsets.length+j, b=((n+1)%sectors)*offsets.length+j;
        triangles.push(a,b,a+1,b,b+1,a+1);
      }
    }
    const seaGeometry = new T.BufferGeometry();
    seaGeometry.setAttribute('position',new T.Float32BufferAttribute(vertices,3));
    seaGeometry.setAttribute('coast',new T.Float32BufferAttribute(coast,2));
    seaGeometry.setIndex(triangles);
    const breakerPhase=`float breakerPhase(float coastDistance,vec2 point,float seconds){
      return coastDistance*.69+seconds*1.04+.76*sin(dot(point,vec2(.037,.019)))+.30*sin(dot(point,vec2(-.021,.048))-.17*seconds);
    }`;
    const sea = new T.Mesh(seaGeometry,new T.ShaderMaterial({
      uniforms:U,transparent:true,depthWrite:false,fog:false,
      vertexShader:`attribute vec2 coast;
        uniform float time;
        varying vec3 vWorld;
        varying vec2 vCoast;
        ${breakerPhase}
        void main() {
          vec4 p=modelMatrix*vec4(position,1.);
          float shallow=1.-smoothstep(4.,45.,coast.x);
          float shoreSwell=sin(breakerPhase(coast.x,p.xz,time));
          float offshore=sin(dot(p.xz,vec2(.21,.14))-time*.72);
          float level=.038*sin(time*.24)+mix(.065*offshore,.082*shoreSwell,shallow);
          p.y+=level; vWorld=p.xyz; vCoast=coast+vec2(0.,level);
          gl_Position=projectionMatrix*viewMatrix*p;
        }`,
      fragmentShader:`varying vec3 vWorld;
        varying vec2 vCoast;
        uniform float time,night,sunHeight;
        uniform vec3 sea,deep,horizon,top;
        ${breakerPhase}
        void main() {
          vec2 p=vWorld.xz;
          vec3 eye=normalize(cameraPosition-vWorld);
          float depth=max(vCoast.y,0.), dist=length(cameraPosition.xz-p);
          float phaseA=dot(p,vec2(.29,.19))-.85*time+.87*sin(p.y*.063+p.x*.033);
          float phaseB=dot(p,vec2(-.21,.47))+.98*time+1.17*sin(p.x*.087-p.y*.048);
          float phaseC=dot(p,vec2(1.57,.91))+1.3*time+.7*sin(phaseB)+.52*sin(phaseA);
          float detail=1.-smoothstep(.2,1.9,fwidth(phaseC));
          vec2 slope=vec2(.045,.029)*cos(phaseA)*(1.-smoothstep(.4,2.,fwidth(phaseA)));
          slope+=vec2(-.027,.061)*cos(phaseB)*(1.-smoothstep(.4,2.,fwidth(phaseB)));
          slope+=vec2(.044,.025)*cos(phaseC)*detail;
          // Short wind ripples fade before their period becomes smaller than a pixel.
          float ripple=dot(p,vec2(7.1,-5.3))+time*2.1+.78*sin(phaseC);
          float rippleB=dot(p,vec2(4.2,8.7))-time*2.6+.86*sin(phaseB);
          float rippleDetail=1.-smoothstep(.32,1.85,max(fwidth(ripple),fwidth(rippleB)));
          slope+=(vec2(.037,-.031)*cos(ripple)+vec2(.018,.039)*cos(rippleB))*rippleDetail;
          slope*=1.-.65*smoothstep(55.,300.,dist);
          vec3 normal=normalize(vec3(-slope.x,1.,-slope.y));
          float facing=max(dot(eye,normal),0.);
          float fresnel=.035+.74*pow(1.-facing,4.);
          vec3 reflected=reflect(-eye,normal);
          vec3 sky=mix(horizon,top,smoothstep(-.06,.8,reflected.y));
          float absorption=1.-exp(-depth*.82);
          vec3 water=mix(sea,deep,absorption);
          float sandTransmission=exp(-depth*1.16)*smoothstep(-4.,2.,vCoast.x);
          water=mix(water,vec3(.45,.51,.31),sandTransmission*.22*(1.-night));
          vec3 col=mix(water,sky,fresnel);
          vec3 sunDir=normalize(vec3(-.65,sunHeight,-.5));
          vec3 moonDir=normalize(vec3(.48,.55,-.65));
          float sun=max(0.,dot(sunDir,reflected)), moon=max(0.,dot(moonDir,reflected));
          // Average the narrow glints over a pixel footprint at grazing angles.
          float footprint=length(fwidth(p));
          float sharpness=mix(340.,75.,smoothstep(.18,2.6,footprint));
          col+=vec3(1.,.76,.46)*(pow(sun,48.)*.12+pow(sun,sharpness)*(.83*sharpness/340.))*(1.-night);
          col+=vec3(.55,.73,1.)*pow(moon,190.)*.64*night;
          // Two soft, broken edges of the incoming wash run along the beach.
          float nearShore=1.-smoothstep(1.,7.,vCoast.x);
          float arriving=breakerPhase(vCoast.x,p,time);
          float wave=sin(arriving);
          float crest=smoothstep(.64,.98,wave);
          float swash=smoothstep(-.25,.9,cos(arriving-.4))*(1.-smoothstep(.4,2.7,depth));
          // Clear shallow wash reveals the wet sand, then leaves a thin broken edge as it recedes.
          float bottomLight=(1.-night)*(1.-smoothstep(.28,2.2,depth))*detail*smoothstep(.01,.20,depth);
          col+=vec3(.060,.072,.043)*bottomLight*smoothstep(.74,.96,sin(phaseA+sin(phaseB))*sin(phaseC*.78));
          float crosswash=sin(dot(p,vec2(.37,-.14))+.21*time)+.75*sin(phaseC)*detail;
          float fragments=smoothstep(-.67,.88,crosswash);
          float grain=.65+.35*sin(dot(p,vec2(2.6,-2.4))+.75*sin(phaseC))*detail;
          float lacing=.61+.39*smoothstep(-.53,.66,sin(ripple+rippleB*.36)+.46*sin(rippleB));
          float lace=nearShore*crest*fragments*grain*(.5+.5*detail)*mix(1.,lacing,rippleDetail);
          col=mix(col,mix(vec3(.83,.93,.90),vec3(.30,.43,.49),night),lace*mix(.40,.68,swash));
          col=mix(col,horizon,smoothstep(140.,1050.,dist)*.91);
          float opacity=mix(.17+.055*swash,1.,smoothstep(0.,2.85,depth));
          opacity=mix(opacity,1.,max(fresnel,lace*.8));
          gl_FragColor=vec4(col,opacity);
          #include <tonemapping_fragment>
          #include <colorspace_fragment>
        }`
    }));
    sea.name='Unbroken ocean horizon';sea.frustumCulled=false;sea.renderOrder=-1;group.add(sea);
    state.shorelineReady=true;state.shorelineSamples=sectors;state.waterlineSegments=sectors;
    let exteriorLights=[];
    const reducedMotion=window.matchMedia?.('(prefers-reduced-motion: reduce)').matches||false;
    function flowerTexture(season){
      const c=document.createElement('canvas');c.width=c.height=128;const ctx=c.getContext('2d');ctx.translate(64,64);
      const specs={spring:['#f5c2cb','#fff0e6',5,20,32],summer:['#f2d4c8','#fff0db',8,14,35],autumn:['#e9b657','#ffe5a0',4,20,23],winter:['#d68caa','#f8d8e3',5,19,26]},[outer,inner,n,w,l]=specs[season];
      for(let i=0;i<n;i++){ctx.save();ctx.rotate(i*Math.PI*2/n);const g=ctx.createLinearGradient(0,0,0,-l-15);g.addColorStop(0,outer);g.addColorStop(1,inner);ctx.fillStyle=g;ctx.beginPath();ctx.moveTo(0,3);ctx.bezierCurveTo(-w,-8,-w,-l,0,-l-12);ctx.bezierCurveTo(w,-l,w,-8,0,3);ctx.fill();ctx.restore();}
      ctx.fillStyle='#d5ac62';ctx.beginPath();ctx.arc(0,0,5,0,Math.PI*2);ctx.fill();const tx=new T.CanvasTexture(c);tx.colorSpace=T.SRGBColorSpace;return tx;
    }
    const textures=Object.fromEntries(['spring','summer','autumn','winter'].map(s=>[s,flowerTexture(s)]));
    const flowerMat=new T.MeshBasicMaterial({map:textures[state.season],transparent:true,alphaTest:.035,depthWrite:false,side:T.DoubleSide,fog:true,color:0xffffff});
    const flowers=new T.InstancedMesh(new T.PlaneGeometry(1,1),flowerMat,state.flowers);flowers.name='Seasonal drifting blossoms';flowers.frustumCulled=false;group.add(flowers);
    const dummy=new T.Object3D(),petals=[];let seed=31273;const rand=()=>((seed=1664525*seed+1013904223>>>0)/4294967296);
    for(let i=0;i<state.flowers;i++)petals.push({x:rand()*86-43,z:rand()*86-43,y:rand()*24,phase:rand()*Math.PI*2,speed:.28+rand()*.35,size:.10+rand()*.17,spin:.2+rand()*.5});
    let activePalette=palettes[state.time],lightingTime='';
    function applyTime(){
      const base=palettes[state.time],wet=state.weather!=='clear';activePalette=wet?{...base,top:new T.Color(base.top).lerp(new T.Color(0x697b8b),.6).getHex(),horizon:new T.Color(base.horizon).lerp(new T.Color(0xabbac2),.5).getHex(),fog:new T.Color(base.fog).lerp(new T.Color(0x9aadb8),.45).getHex(),key:base.key*.65}:base;U.overcast.value=state.weather==='rain'?.88:state.weather==='snow'?.55:0;U.top.value.set(activePalette.top);U.horizon.value.set(activePalette.horizon);U.sea.value.set(activePalette.sea);U.deep.value.set(activePalette.deep);U.night.value=activePalette.night;
      U.sunHeight.value=state.time==='sunset'?.065:.42;
      scene.background=new T.Color(activePalette.horizon);
      if(scene.fog){scene.fog.color.set(activePalette.fog);scene.fog.density=.0015;}
      exteriorLights=scene.children.filter(o=>(o.isDirectionalLight||o.isHemisphereLight)&&o.layers.mask===2&&!o.userData.weatherManaged);
      for(const light of exteriorLights){light.intensity=light.isDirectionalLight?activePalette.key:activePalette.hemi;if(light.isDirectionalLight)light.color.set(state.time==='night'?0xb6c9ff:state.time==='sunset'?0xffbd8d:0xfff3dd);else{light.color.set(state.time==='night'?0x657fa9:state.time==='sunset'?0xe3bfd0:0xc7e1f0);light.groundColor.set(0x53613c);}}
      world.architecture?.setLight?.(state.time,state.weather);
      world.architecture?.caisson?.setLight(state.time,state.weather);
      for(const ceiling of Object.values(world.architecture?.pavilionCeilings??{}))ceiling.setLight(state.time,state.weather);
      world.architecture?.millwork?.setAtmosphere(state.time,state.weather);
      world.architecture?.forecourt?.setAtmosphere(state.time,state.weather);
      flowerMat.color.set(state.time==='night'?0xa8b7dc:0xffffff);flowers.visible=state.weather==='clear';lightingTime=state.time+':'+state.weather;
    }
    const labels={
      'zh-CN':{toggle:'天时',title:'海天 · 四时',time:'天色',day:'白天',sunset:'黄昏',night:'夜晚',season:'花季',spring:'春 · 樱花',summer:'夏 · 莲花',autumn:'秋 · 桂花',winter:'冬 · 梅花',close:'收起天时设置'},
      'zh-TW':{toggle:'天時',title:'海天 · 四時',time:'天色',day:'白天',sunset:'黃昏',night:'夜晚',season:'花季',spring:'春 · 櫻花',summer:'夏 · 蓮花',autumn:'秋 · 桂花',winter:'冬 · 梅花',close:'收起天時設定'},
      en:{toggle:'Sky',title:'Sea & seasons',time:'Light',day:'Day',sunset:'Dusk',night:'Night',season:'Blossoms',spring:'Spring · Cherry',summer:'Summer · Lotus',autumn:'Autumn · Osmanthus',winter:'Winter · Plum',close:'Close sky settings'}
    };
    Object.assign(labels,window.TempleLocaleBundles?.sky);
    const weatherLabels={'zh-CN':{weather:'天气',clear:'晴天',rain:'雨 · 雷声',snow:'下雪'},'zh-TW':{weather:'天氣',clear:'晴天',rain:'雨 · 雷聲',snow:'下雪'},en:{weather:'Weather',clear:'Clear',rain:'Rain & thunder',snow:'Snow'},ja:{weather:'天気',clear:'晴れ',rain:'雨・雷',snow:'雪'},ko:{weather:'날씨',clear:'맑음',rain:'비 · 천둥',snow:'눈'}};
    for(const locale of Object.keys(labels))Object.assign(labels[locale],weatherLabels[locale]||weatherLabels.en);
    function element(tag,parent,attrs={},text=''){const e=document.createElement(tag);for(const [k,v]of Object.entries(attrs))e.setAttribute(k,v);if(text)e.textContent=text;parent?.appendChild(e);return e;}
    const ui=element('div',null,{class:'ambience-controls'});
    const toggle=element('button',ui,{id:'ambience-toggle',type:'button','aria-expanded':'false','aria-controls':'ambience-panel'},'☼ ');element('span',toggle,{'data-sky-label':'toggle'});
    const panel=element('section',ui,{id:'ambience-panel','aria-label':'Sea and seasons'});panel.hidden=true;
    const header=element('header',panel);element('strong',header,{'data-sky-label':'title'});element('button',header,{id:'ambience-close',type:'button','aria-label':'Close'},'×');
    element('div',panel,{class:'ambience-label','data-sky-label':'time'});element('div',panel,{class:'ambience-times'});element('div',panel,{class:'ambience-label','data-sky-label':'season'});element('div',panel,{class:'ambience-seasons'});
    element('div',panel,{class:'ambience-label','data-sky-label':'weather'});element('div',panel,{class:'ambience-weather'});
    (document.querySelector('main')||document.body).appendChild(ui);
    function setOpen(open){panel.hidden=!open;toggle.setAttribute('aria-expanded',String(open));if(open){document.exitPointerLock?.();document.dispatchEvent(new CustomEvent('temple-ui-open',{detail:'weather'}));}else if(panel.contains(document.activeElement))toggle.focus();}
    toggle.addEventListener('click',()=>setOpen(panel.hidden));ui.querySelector('#ambience-close').addEventListener('click',()=>setOpen(false));
    document.addEventListener('temple-hud-hidden',()=>setOpen(false));
    document.addEventListener('temple-ui-open',event=>{if(event.detail==='pets')setOpen(false);});
    const movementKeys=new Set(['KeyW','KeyA','KeyS','KeyD','ArrowUp','ArrowDown','ArrowLeft','ArrowRight']);
    ui.addEventListener('keydown',e=>{
      if(e.key==='Escape'&&!panel.hidden){setOpen(false);e.preventDefault();e.stopPropagation();return;}
      if(e.key!=='Escape'&&!movementKeys.has(e.code))e.stopPropagation();
    });
    ui.addEventListener('pointerdown',e=>e.stopPropagation());
    document.addEventListener('pointerdown',e=>{if(!ui.contains(e.target)&&!panel.hidden)setOpen(false);});
    const buttons=[];
    function save(){try{localStorage.setItem('quiet-temple-ambience',JSON.stringify({time:state.time,season:state.season,weather:state.weather}));}catch(_){}}
    function setWeather(value){if(!['clear','rain','snow'].includes(value))return;state.weather=value;weather?.setMode(value);world.landscape?.setWeather(value);applyTime();save();refresh();}
    for(const [kind,values] of [['time',['day','sunset','night']],['season',['spring','summer','autumn','winter']],['weather',['clear','rain','snow']]])for(const value of values){const b=document.createElement('button');b.type='button';b.dataset.skyLabel=value;b.dataset[kind]=value;b.addEventListener('click',()=>{if(kind==='weather'){setOpen(false);setWeather(value);return;}state[kind]=value;if(kind==='time')applyTime();else{flowerMat.map=textures[value];flowerMat.needsUpdate=true;}save();refresh();});ui.querySelector(kind==='time'?'.ambience-times':kind==='season'?'.ambience-seasons':'.ambience-weather').appendChild(b);buttons.push({b,kind,value});}
    function refresh(){const l=labels[window.TempleI18n?.locale]||labels['zh-CN'];for(const e of ui.querySelectorAll('[data-sky-label]'))e.textContent=l[e.dataset.skyLabel];panel.setAttribute('aria-label',l.title);toggle.querySelector('span').textContent=l.weather;toggle.setAttribute('aria-label',l.weather);ui.querySelector('#ambience-close').setAttribute('aria-label',l.close);for(const {b,kind,value}of buttons)b.setAttribute('aria-pressed',String(state[kind]===value));}
    window.TempleI18n?.onChange(refresh);refresh();applyTime();
    function update(dt,clock,player,cameraPosition){
      world.landscape?.update(dt,clock);
      const time=reducedMotion?0:clock;U.time.value=time;
      if(scene.fog)scene.fog.color.set(activePalette.fog);
      if(lightingTime!==state.time+':'+state.weather||exteriorLights.length===0)applyTime();
      const stormEvent=weather?.update(dt,clock,player,cameraPosition);
      const px=player?.x??0,pz=player?.z??7.5,py=player?.y??0;
      if(flowers.visible)for(let i=0;i<flowers.count;i++){const p=petals[i],x=px+((p.x+time*.28+43)%86)-43,z=pz+((p.z+Math.sin(time*.09+p.phase)*2+43)%86)-43,y=py+((p.y-time*p.speed)%24+24)%24+1.8;
        const insideTemple=Math.abs(x)<31&&z<29&&z>-29;
        dummy.position.set(x+Math.sin(time*.35+p.phase)*.7,y,z);dummy.rotation.set(Math.sin(time*.3+p.phase)*.7,p.phase+time*p.spin,p.phase+Math.sin(time*.7+p.phase)*.4);dummy.scale.setScalar(insideTemple?0:p.size*(state.season==='autumn'?.7:1));dummy.updateMatrix();flowers.setMatrixAt(i,dummy.matrix);}
      if(flowers.visible)flowers.instanceMatrix.needsUpdate=true;return stormEvent;
    }
    const point=coastPoints[199];
    const lookX=point.x*.854, lookZ=centreZ+(point.z-centreZ)*.854;
    const coastalLookout={
      position:new T.Vector3(lookX,nav.islandHeight(lookX,lookZ)+1.5,lookZ),
      target:coastPoints[159].clone()
    };
    function setQuality(value=1){const fraction=Math.max(.2,Math.min(1,Number.isFinite(value)?value:1));state.quality=fraction;
      flowers.count=Math.round(petals.length*fraction);state.flowers=flowers.count;weather?.setQuality(fraction);
    }
    return { state,update,group,coastalLookout,setWeather,setQuality,closePanel:()=>setOpen(false) };
  }};
})();

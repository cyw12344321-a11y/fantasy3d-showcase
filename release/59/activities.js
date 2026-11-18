(function(){
 'use strict';
 const assetPromises=new Map();
 const textilePaths=Object.freeze(Object.fromEntries(['moss','moon','saffron','plum','tide','golden'].map(id=>[id,'assets/robe-'+id+'.webp'])));
 const textilePromises=new Map(),textileTextures=new Map(),materialStyles=new WeakMap();
 function textile(T,id){
  if(!textilePromises.has(id)){
   const pending=TempleAssets.texture(T,textilePaths[id]).then(texture=>{
    texture.colorSpace=T.SRGBColorSpace;texture.flipY=true;texture.anisotropy=4;
    textileTextures.set(id,texture);return texture;
   }).catch(error=>{textilePromises.delete(id);throw error;});
   textilePromises.set(id,pending);
  }
  return textilePromises.get(id);
 }
 const feetIndex=id=>id==='hemp'?1:id==='indigo'?2:0;
 // All coordinates used for patterns are bind-pose coordinates, so the cloth
 // follows its existing ankle and hem weights without sliding during animation.
 const shoeColors=`
 vec3 slipperColor(vec3 p,float style){
  float y=p.y,z=p.z;
  float braid=.5+.5*sin(26.*p.x+24.*z+2.*sin(13.*z))*cos(20.*p.x-21.*z);
  float sideSeam=1.-smoothstep(.025,.085,abs(y+.49));
  float instep=1.-smoothstep(.04,.14,abs(z-.32-.14*abs(p.x)));
  vec3 hemp=mix(vec3(.27,.139,.048),vec3(.65,.438,.18),.24+.49*braid);
  vec3 indigo=mix(vec3(.022,.047,.099),vec3(.045,.102,.19),.3+.35*braid);
  vec3 top=style<1.5?hemp:indigo;
  if(style>1.5){
   vec2 q=vec2(abs(p.x)-.39,(z-.57)*1.45);
   float curl=abs(length(q)-.16);
   top=mix(top,vec3(.55,.60,.53),(1.-smoothstep(.011,.042,curl))*smoothstep(.1,.42,y));
  }
  top=mix(top,style<1.5?vec3(.21,.092,.031):vec3(.15,.245,.32),.85*instep);
  top=mix(top,vec3(.085,.064,.045),1.-smoothstep(-.61,-.53,y));
  return mix(top,style<1.5?vec3(.82,.56,.25):vec3(.63,.60,.47),sideSeam*.9);
 }
`;
 function shoeMaterial(T,id){
  if(id==='original')return new T.MeshStandardMaterial({color:'#66564a',roughness:.86});
  const material=new T.MeshStandardMaterial({color:0xffffff,roughness:.92});
  material.onBeforeCompile=shader=>{
   shader.vertexShader='varying vec3 shoePoint;\n'+shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nshoePoint=position;');
   shader.fragmentShader='varying vec3 shoePoint;\n'+shoeColors+shader.fragmentShader.replace('#include <color_fragment>','#include <color_fragment>\ndiffuseColor.rgb=slipperColor(shoePoint,'+feetIndex(id)+'.0);');
  };
  material.customProgramCacheKey=()=> 'slipper-'+id;return material;
 }
 function gearPreview(T,slot,id){
  if(slot==='feet'){
   if(!['original','indigo','hemp'].includes(id))return null;
   const group=new T.Group(),g=new T.SphereGeometry(1,18,12),m=shoeMaterial(T,id);
   group.name='Slippers '+id;
   for(const sign of [-1,1]){const shoe=new T.Mesh(g,m);shoe.scale.set(.103,.063,.175);shoe.position.x=sign*.12;group.add(shoe);}
   return group;
  }
  if(slot==='neck'){
   if(id!=='gold'&&id!=='sandal')return null;
   const gold=id==='gold',count=gold?48:32,dummy=new T.Object3D(),threadPoints=[];
   const material=new T.MeshStandardMaterial({color:gold?0xe4b249:0x906043,metalness:gold?.52:0,roughness:gold?.32:.55});
   const strand=new T.InstancedMesh(new T.SphereGeometry(1,10,7),material,count);
   strand.name=gold?'Gold prayer beads':'Sandalwood prayer beads';
   for(let i=0;i<count;i++){
    const a=i*2*Math.PI/count,front=Math.cos(a);
    dummy.position.set(.18*Math.sin(a),.10-.19*Math.pow(Math.max(0,front),1.5),.012+(front>0?.223:.135)*front);
    threadPoints.push(dummy.position.clone());
    dummy.scale.setScalar(i===0?.026:(gold?.0155:.019));
    dummy.updateMatrix();strand.setMatrixAt(i,dummy.matrix);
    if(!gold)strand.setColorAt(i,new T.Color().setRGB(.70+.18*Math.cos(i*2.3),.69+.14*Math.cos(i*2.3),.64+.10*Math.sin(i)));
   }
   // Thread follows the sag of the strand and passes through every bead center.
   const threadPath=new T.CatmullRomCurve3(threadPoints,true,'centripetal');
   const thread=new T.Mesh(new T.TubeGeometry(threadPath,count*3,gold?.0032:.0042,5,true),
     new T.MeshStandardMaterial({color:gold?0x846129:0x493324,roughness:.89}));
   thread.name='Continuous prayer bead thread';strand.add(thread);
   strand.computeBoundingSphere();return strand;
  }
  if(slot!=='waist'||(id!=='pouch'&&id!=='jade'))return null;
  // Combine cloth, cord and ornament into a single vertex-colored mesh.
  const positions=[],normals=[],colors=[];
  function add(geometry,color,x,y,z,sx=1,sy=1,sz=1,rx=0,ry=0,rz=0){
   const shape=new T.Object3D();shape.position.set(x,y,z);shape.scale.set(sx,sy,sz);shape.rotation.set(rx,ry,rz);shape.updateMatrix();
   geometry.applyMatrix4(shape.matrix);const p=geometry.attributes.position,n=geometry.attributes.normal,c=new T.Color(color);
   for(let i=0;i<(geometry.index?.count??p.count);i++){const j=geometry.index?geometry.index.getX(i):i;positions.push(p.getX(j),p.getY(j),p.getZ(j));normals.push(n.getX(j),n.getY(j),n.getZ(j));colors.push(c.r,c.g,c.b);}
   geometry.dispose();
  }
  const gold=0xd5ad5a,cord=0xa43e2e;
  const loop=(r,t)=>new T.TorusGeometry(r,t,6,24);
  add(loop(.025,.004),gold,0,.092,0,.78,1,1);
  if(id==='pouch'){
   const profile=[[.001,-.066],[.047,-.06],[.071,-.025],[.073,.018],[.045,.048],[.034,.061],[.048,.072],[.045,.076],[.001,.074]].map(([r,y])=>new T.Vector2(r,y));
   add(new T.LatheGeometry(profile,18),0xab493b,0,-.007,0,1,1,.69);
   add(loop(.038,.004),gold,0,.053,0,1,.72,1,Math.PI/2);
   for(let i=-1;i<=1;i++)add(new T.SphereGeometry(1,9,6),gold,i*.015,-.014,.05,.011,.023,.003,0,0,-i*.53);
  }else{
   add(loop(.050,.014),0x579a80,0,.017,0);
   add(loop(.043,.0028),0xa9c9a5,0,.017,.012);
   add(loop(.012,.004),gold,0,.070,0,.9,1,1);
   add(new T.SphereGeometry(.009,10,6),gold,0,-.046,0,1,.72,1);
   for(let i=-2;i<=2;i++)add(new T.CylinderGeometry(.002,.004,.065,6),cord,i*.005,-.083,0,1,1,1,0,0,i*.06);
  }
  const geometry=new T.BufferGeometry();
  for(const [name,values]of [['position',positions],['normal',normals],['color',colors]])geometry.setAttribute(name,new T.Float32BufferAttribute(values,3));
  const ornament=new T.Mesh(geometry,new T.MeshStandardMaterial({vertexColors:true,roughness:id==='jade'?.40:.83,metalness:.06}));
  ornament.name=id==='pouch'?'Lotus drawstring pouch':'Jade ring and tassel';return ornament;
 }
 function tint(T,material,id,feet='original'){
  const style=feetIndex(feet),cloud=['cloud','moss','moon','plum'].includes(material.userData.outfitAsset);
  const user=material.userData;
  let state=materialStyles.get(material);
  const first=!state;
  if(first){
   state={baseMap:material.map,current:null,requested:null,request:0,pending:null,disposed:false};materialStyles.set(material,state);
   material.addEventListener('dispose',()=>{state.disposed=true;state.request++;});
  }
  if(state.disposed)return null;
  user.clothTint||={value:new T.Vector3(1,1,1)};
  user.tintEnabled||={value:0};user.vermilion||={value:0};
  user.shoeStyle||={value:0};user.shoeStyle.value=style;
  if(first){
  material.onBeforeCompile=shader=>{
   Object.assign(shader.uniforms,{clothTint:user.clothTint,tintEnabled:user.tintEnabled,vermilion:user.vermilion,shoeStyle:user.shoeStyle});
   shader.vertexShader='varying vec3 garmentPoint;\n'+shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\ngarmentPoint=position;');
   shader.fragmentShader='varying vec3 garmentPoint; uniform vec3 clothTint;uniform float tintEnabled,vermilion,shoeStyle;\n'+shoeColors+shader.fragmentShader;
   shader.fragmentShader=shader.fragmentShader.replace('#include <map_fragment>',`#include <map_fragment>
    float hi=max(diffuseColor.r,max(diffuseColor.g,diffuseColor.b)),lo=min(diffuseColor.r,min(diffuseColor.g,diffuseColor.b));
    float mask=(1.-smoothstep(.045,.12,hi-lo))*(1.-smoothstep(.60,.85,hi))*smoothstep(.02,.08,hi)*tintEnabled;
    diffuseColor.rgb=mix(diffuseColor.rgb,diffuseColor.rgb*clothTint,mask);
    if(vermilion>.5){
     vec3 rest=garmentPoint;float hem=rest.y+.20;
     float hemLine=1.-smoothstep(.003,.007,min(abs(hem),abs(hem-.022)));
     // Trace the uploaded collar's right piping from the sash knot to the neck.
     float lapelX=min(.108,.69*(rest.y-.30)-.091);
     float piping=1.-smoothstep(.002,.006,abs(rest.x-lapelX));
     float aboveSash=smoothstep(.299,.309,rest.y)*(1.-smoothstep(.617,.638,rest.y));
     float front=smoothstep(.035,.090,rest.z);
     float border=max(hemLine,piping*aboveSash*front);
     vec2 tile=fract(vec2((rest.x+rest.z*.53)*10.,rest.y*12.))-.5;
     float cloudCurl=1.-smoothstep(.030,.085,abs(length(tile*vec2(1.,1.5))-.25));
     float shade=.32+1.25*sqrt(max(.0,hi));
     vec3 brocade=mix(vec3(.352,.058,.037),vec3(.49,.116,.057),cloudCurl*.48);
     vec3 gilt=vec3(.61,.381,.110);
     diffuseColor.rgb=mix(brocade,gilt,max(border,.7*smoothstep(.06,.24,hi-lo)))*shade;
    }`+(cloud?`
    float boot=1.-smoothstep(-.34,-.322,garmentPoint.y);
    if(shoeStyle>.5&&boot>0.){
     vec3 shoe=vec3((garmentPoint.x-sign(garmentPoint.x)*.108)/.11,(garmentPoint.y+.397)/.065,(garmentPoint.z-.033)/.177);
     diffuseColor.rgb=mix(diffuseColor.rgb,slipperColor(shoe,shoeStyle),boot);
    }`:''));
  };
  material.customProgramCacheKey=()=>cloud?'quiet-temple-cloud-gear-v1':'quiet-temple-robe-gear-v1';
  material.needsUpdate=true;
  }
  if(state.requested===id&&state.pending)return state.pending;
  state.requested=id;const request=++state.request;state.pending=null;
  if(state.current===id)return null;
  const baked=!cloud&&Object.hasOwn(textilePaths,id);
  function apply(texture){
   if(state.disposed||request!==state.request)return;
   material.map=texture;state.current=id;state.pending=null;user.outfitTintId=id;
   const color=new T.Color(id==='cloud'?'#b6d8e8':id==='vermilion'?'#a04436':'#b8b2a0');
   user.clothTint.value.set(color.r/.45,color.g/.45,color.b/.45);
   user.tintEnabled.value=baked||id==='lotus'||cloud?0:1;
   user.vermilion.value=id==='vermilion'?1:0;
  }
  if(!baked||textileTextures.has(id)){
   apply(baked?textileTextures.get(id):state.baseMap);return null;
  }
  // Keep the previous cloth until the complete atlas is ready. Each actor owns
  // its material state, while all wearers of a style share one immutable texture.
  const pending=textile(T,id).then(apply).catch(error=>{
   if(request===state.request){state.requested=null;state.pending=null;}
   throw error;
  });
  state.pending=pending;return pending;
 }
 window.TempleWardrobe={gearPreview,shoeMaterial,tint,textilePaths,
  load(T,id='lotus'){
  const key=['cloud','moss','moon','plum'].includes(id)?id:'lotus';if(assetPromises.has(key))return assetPromises.get(key);
  const promise=(async()=>{
   const m=await(await TempleAssets.fetch('assets/'+key+'-outfit.json')).json(),b=await(await TempleAssets.fetch('assets/'+m.file)).arrayBuffer();if(b.byteLength!==m.byteLength)throw Error('Outfit mesh length mismatch');const g=new T.BufferGeometry();
   for(const name of ['position','uv']){const a=m.attributes[name],size=name==='uv'?2:3,src=new Uint16Array(b,a.byteOffset,a.length),v=new Float32Array(a.length);for(let i=0;i<v.length;i++)v[i]=a.min[i%size]+src[i]/65535*a.scale[i%size];g.setAttribute(name,new T.BufferAttribute(v,size));}
   for(const name of ['normal','skinIndex','skinWeight']){const a=m.attributes[name],type=name==='normal'?Int8Array:Uint8Array;g.setAttribute(name,new T.BufferAttribute(new type(b,a.byteOffset,a.length),name==='normal'?3:4,name!=='skinIndex'));}
   const a=m.attributes.index;g.setIndex(new T.BufferAttribute(new Uint32Array(b,a.byteOffset,a.length),1));g.computeBoundingSphere();const [texture,normalMap]=await Promise.all([TempleAssets.texture(T,'assets/'+m.texture),m.normalTexture?TempleAssets.texture(T,'assets/'+m.normalTexture):null]);texture.colorSpace=T.SRGBColorSpace;texture.flipY=true;texture.anisotropy=4;
   if(normalMap){normalMap.flipY=true;normalMap.anisotropy=4;}
   // Both scans are closed meshes. Back faces of occluded folds protrude when the arms move.
   const material=new T.MeshStandardMaterial({map:texture,normalMap,roughness:.88,side:T.FrontSide});if(normalMap)material.normalScale.set(.8,.8);material.userData.outfitAsset=key;
   let solePoints=null;
   if(['moss','moon','plum'].includes(key)){
    const p=g.attributes.position,j=g.attributes.skinIndex,w=g.attributes.skinWeight;
    solePoints=[12,13].map(joint=>{
     const points=[];
     for(let i=0;i<p.count;i++)if(p.getY(i)<-.30){
      let influence=0;for(let k=0;k<4;k++)if(j.array[i*4+k]===joint)influence+=w.array[i*4+k]/255;
      if(influence>.95)points.push([p.getX(i),p.getY(i),p.getZ(i)]);
     }
     // Support samples come from each uploaded shoe, computed once on load.
     // All subsequent frames use this compact convex outline, not a mesh scan.
     const selected=new Set();
     for(let n=0;n<32;n++)for(const lean of [-.25,0,.25]){
      const a=n*Math.PI/16,dy=Math.cos(a),dz=Math.sin(a);let best=Infinity,chosen=null;
      for(const point of points){const d=point[0]*lean+point[1]*dy+point[2]*dz;if(d<best){best=d;chosen=point;}}
      if(chosen)selected.add(chosen);
     }
     return [...selected];
    });
   }
   return{geometry:g,material,triangles:m.triangleCount,key,boneNames:m.boneNames,fullAvatar:!!m.fullAvatar,headOffsetY:m.headOffsetY||0,solePoints};
  })().catch(e=>{assetPromises.delete(key);throw e;});assetPromises.set(key,promise);return promise;
 }};
})();
;
/* Shared articulated monk rig with locally bundled, skinned outfits. */
(function () {
  'use strict';
  function canonicalOutfit(id){
    return ['cloud','golden','vermilion','moss','moon','saffron','plum','tide'].includes(id)?id:'lotus';
  }
  window.TempleActors = {
    create(THREE, appearance = {}) {
      const root = new THREE.Group();
      root.rotation.order='YXZ';
      const body = new THREE.Group();
      root.add(body);
      const mat = color => new THREE.MeshStandardMaterial({ color, roughness: .86 });
      const skin = mat(appearance.skin || '#d8a476');
      const robe = mat(appearance.robe || '#939e98');
      const sash = mat(appearance.sash || '#d5b963');
      const shoes = mat('#66564a');
      const dark = mat('#4b3d31');
      const eyeMat = mat('#443325');
      const unitY = new THREE.Vector3(0, 1, 0);
      function mesh(geometry, material, parent, x, y, z, sx = 1, sy = 1, sz = 1) {
        const m = new THREE.Mesh(geometry, material);
        m.position.set(x, y, z); m.scale.set(sx, sy, sz);
        m.castShadow = true; m.receiveShadow = true; parent.add(m); return m;
      }
      const sphere = new THREE.SphereGeometry(1, 18, 12);
      mesh(new THREE.CylinderGeometry(.265, .335, .63, 16), robe, body, 0, .31, 0);
      mesh(sphere, robe, body, 0, .59, 0, .29, .12, .22);
      // Follow the same 16 facets as the tunic so the sash cannot disappear into the torso.
      const sashPanel=new THREE.CylinderGeometry(.273,.334,.55,3,1,true,0,Math.PI*3/8);
      mesh(sashPanel,sash,body,0,.30,0);
      mesh(sashPanel,sash,body,0,.30,0).rotation.y=Math.PI;
      mesh(new THREE.TorusGeometry(.325,.014,6,32),sash,body,0,.08,0).rotation.x=Math.PI/2;
      mesh(new THREE.CylinderGeometry(.12, .13, .11, 12), skin, body, 0, .69, 0);
      const head = new THREE.Group(); head.position.set(0, .99, .005); body.add(head);
      mesh(sphere, skin, head, 0, 0, 0, .335, .35, .31);
      mesh(sphere, skin, head, -.331, -.025, .005, .057, .082, .055);
      mesh(sphere, skin, head, .331, -.025, .005, .057, .082, .055);
      mesh(sphere, skin, head, 0, -.055, .305, .046, .038, .044);
      [-1, 1].forEach(side => {
        mesh(sphere, eyeMat, head, side * .105, -.025, .292, .018, .025, .012);
        mesh(sphere, mat('#c68d72'), head, side * .183, -.095, .26, .048, .019, .007);
      });
      const mouth = mesh(new THREE.TorusGeometry(.035, .006, 4, 12, Math.PI), dark, head, 0, -.115, .293);
      mouth.rotation.z = Math.PI;
      const trouserLegs=[],walkingShoes=[];
      const trouserLining=mat(0xb9b2a6);
      const legGeometry = new THREE.CylinderGeometry(.095, .09, .38, 10);
      const legs = [-1, 1].map(side => {
        const pivot = new THREE.Group(); pivot.position.set(side * .135, .12, 0); root.add(pivot);
        trouserLegs.push(mesh(legGeometry, robe, pivot, 0, -.19, 0));
        walkingShoes.push(mesh(sphere, shoes, pivot, 0, -.35, .055, .103, .063, .175));
        return pivot;
      });
      const sleeveGeometry = new THREE.CylinderGeometry(.10, .118, 1, 10);
      const lowerGeometry = new THREE.CylinderGeometry(.082, .09, 1, 10);
      const arms = [-1, 1].map(side => {
        const upper = mesh(sleeveGeometry, robe, body, 0, 0, 0);
        const lower = mesh(lowerGeometry, robe, body, 0, 0, 0);
        const palm = mesh(sphere, skin, body, 0, 0, 0, .063, .087, .05);
        palm.name=side<0?'Left palm':'Right palm';
        // The scanned cuffs are closed. Connect the visible palm to the
        // forearm so bending the wrist cannot open a gap at the cuff.
        const wrist = mesh(sphere, skin, body, 0, 0, 0, .036, .074, .036);
        wrist.name = side < 0 ? 'Left wrist' : 'Right wrist';
        wrist.visible = false;
        return { side, upper, lower, palm, wrist };
      });
      function segment(m, a, b) {
        const difference = b.clone().sub(a);
        m.position.copy(a).add(b).multiplyScalar(.5);
        m.quaternion.setFromUnitVectors(unitY, difference.clone().normalize());
        m.scale.y = difference.length();
      }
      // The robe is bound to anatomical joints. Keep limb lengths fixed instead of
      // stretching the old cylinder helpers (which stretched the cloth up to 2x).
      const upperArmLength=Math.hypot(.055,.25,.01),forearmLength=Math.hypot(.01,.19,.025);
      function armPose(arm,shoulder,elbow,hand) {
        const direction=hand.clone().sub(shoulder),requested=direction.length();
        if(requested<.00001)direction.set(0,-1,0);else direction.divideScalar(requested);
        const reach=THREE.MathUtils.clamp(requested,Math.abs(upperArmLength-forearmLength)+.002,upperArmLength+forearmLength-.0005);
        hand.copy(shoulder).addScaledVector(direction,reach);
        const bend=elbow.clone().sub(shoulder);bend.addScaledVector(direction,-bend.dot(direction));
        if(bend.lengthSq()<.000001){bend.set(arm.side,0,0);bend.addScaledVector(direction,-bend.dot(direction));}
        bend.normalize();
        const along=(upperArmLength*upperArmLength-forearmLength*forearmLength+reach*reach)/(2*reach);
        elbow.copy(shoulder).addScaledVector(direction,along).addScaledVector(bend,Math.sqrt(Math.max(0,upperArmLength*upperArmLength-along*along)));
        segment(arm.upper,shoulder,elbow);segment(arm.lower,elbow,hand);arm.palm.position.copy(hand);
      }
      const smooth = x => { x = Math.min(1, Math.max(0, x)); return x * x * (3 - 2 * x); };
      const mix = THREE.MathUtils.lerp;
      let joinedPalms=0,groundSitBlend=0,kneelingHemBlend=0;
      function pose(t, walking, prayerProgress = null) {
        joinedPalms=0;groundSitBlend=0;
        root.userData.loungeBlend=0;
        root.rotation.x=0;root.rotation.z=0;
        legs.forEach(leg=>leg.visible=true);
        if(typeof loungeLegs!=='undefined')loungeLegs.visible=false;
        const wave = Math.sin(t * 8.8);
        let join = 0, kneel = 0, bow = 0;
        if (prayerProgress !== null) {
          const p = prayerProgress;
          join = smooth(p / .16) * (1 - smooth((p - .87) / .13));
          kneel = smooth((p - .18) / .18) * (1 - smooth((p - .70) / .18));
          bow = smooth((p - .30) / .18) * (1 - smooth((p - .65) / .20));
        }
        kneelingHemBlend=kneel;
        joinedPalms=join*(1-bow);
        const hip = mix(.46, .245, kneel);
        body.position.y = hip + (walking ? Math.abs(wave) * .025 : Math.sin(t * 1.7) * .007) * (1 - join);
        body.rotation.x = bow * 1.18 + join * .035;
        body.rotation.z = walking ? wave * .025 : 0;
        legs.forEach((leg, i) => {
          leg.position.set((i?1:-1)*.135,hip+.02,0);
          // Fold the shins behind the kneeling figure as the torso bows forward.
          const fold=kneel*1.18;
          const angle=fold+(walking?wave*(i?1:-1)*.40:0)*(1-kneel);
          leg.rotation.set(angle,0,0);
          const shoe=walkingShoes[i];
          shoe.rotation.x=-fold;
          // As the knees descend, keep a level sole and lift it just enough to clear the floor.
          // The separate shoe belongs at the ankle opening while standing.
          // Bring it back under the hem as the shin folds for a bow.
          const shoeOffset=mix(.415,.35,kneel);
          const shoeY=leg.position.y-shoeOffset*Math.cos(angle)-.055*Math.sin(angle);
          const soleRadius=Math.hypot(.063*Math.cos(angle-fold),.175*Math.sin(angle-fold));
          const lift=Math.max(0,soleRadius+.002-shoeY);
          shoe.position.set(0,-shoeOffset+lift*Math.cos(angle),.055-lift*Math.sin(angle));
        });
        arms.forEach(a => {
          const side = a.side;
          const shoulder = new THREE.Vector3(side * .255, .55, .01);
          const elbow = new THREE.Vector3(mix(side * .31, side * .24, join), mix(.30, .34, join), mix(0, .28, join));
          const hand = new THREE.Vector3(mix(side * .32, side * .055, join), mix(.11, .51, join), mix(.025, .38, join));
          if(bow>0){
            // Floor-contact targets are in actor space, then transformed back to
            // the bent torso. The old torso-local target put both hands underground.
            body.updateMatrix();const inverseBody=body.matrix.clone().invert();
            elbow.lerp(new THREE.Vector3(side*.24,.29,.49).applyMatrix4(inverseBody),bow);
            hand.lerp(new THREE.Vector3(side*.055,.11,.75).applyMatrix4(inverseBody),bow);
          }
          if (walking && !join) { hand.z += wave * side * .16; elbow.z += wave * side * .07; }
          armPose(a,shoulder,elbow,hand);
          a.palm.rotation.x = -bow * .7;
          a.palm.scale.set(.063,.087,.05);
        });
        head.rotation.x = join * .07;
      }
      const mallet = new THREE.Group(); body.add(mallet); mallet.visible = false;
      mesh(new THREE.CylinderGeometry(.017, .022, .42, 8), mat('#794c2b'), mallet, 0, 0, .20).rotation.x = Math.PI / 2;
      mesh(sphere, mat('#b77c40'), mallet, 0, 0, .44, .085, .072, .085);
      const carriedIncense = new THREE.Group(); body.add(carriedIncense); carriedIncense.visible = false;
      [-.035, 0, .035].forEach(x => {
        mesh(new THREE.CylinderGeometry(.009, .009, .60, 6), mat('#a77b43'), carriedIncense, x, .26, 0);
        mesh(sphere, new THREE.MeshBasicMaterial({ color: '#e39b53' }), carriedIncense, x, .56, 0, .012, .018, .012);
      });
      // Sitting uses articulated thighs/calves while the original leg pivots keep
      // the uploaded robe's existing rigid thigh bindings. No bone is scaled.
      const loungeLegs=new THREE.Group();loungeLegs.name='Articulated seated legs';root.add(loungeLegs);loungeLegs.visible=false;
      const loungeLimbs=[-1,1].map(side=>({side,
        thigh:mesh(new THREE.CylinderGeometry(.092,.095,1,10),robe,loungeLegs,0,0,0),
        calf:mesh(new THREE.CylinderGeometry(.085,.09,1,10),robe,loungeLegs,0,0,0),
        shoe:mesh(sphere,shoes,loungeLegs,0,0,0,.103,.063,.175)
      }));
      const heldBook=new THREE.Group();heldBook.name='Held open scripture';body.add(heldBook);heldBook.visible=false;
      const coverMaterial=mat('#705343'),pageMaterial=mat('#e0d6bd'),inkMaterial=mat('#5e5a4a');
      for(const side of [-1,1]){const leaf=new THREE.Group();leaf.rotation.z=side*.10;heldBook.add(leaf);
        mesh(new THREE.BoxGeometry(.23,.018,.29),coverMaterial,leaf,side*.117,0,0);
        mesh(new THREE.BoxGeometry(.214,.013,.27),pageMaterial,leaf,side*.116,.015,0);
        for(let line=0;line<5;line++)mesh(new THREE.BoxGeometry(.16,.0018,.004),inkMaterial,leaf,side*.116,.023,-.09+line*.041);
      }
      const turningPage=new THREE.Group();heldBook.add(turningPage);mesh(new THREE.BoxGeometry(.215,.004,.27),pageMaterial,turningPage,.108,.028,0);
      const heldCup=new THREE.Group();heldCup.name='Hand-held celadon tea cup';body.add(heldCup);heldCup.visible=false;
      const cupMaterial=mat('#839a88');
      mesh(new THREE.CylinderGeometry(.065,.047,.105,20,1,true),cupMaterial,heldCup,0,.0525,0);
      mesh(new THREE.CylinderGeometry(.048,.048,.008,20),cupMaterial,heldCup,0,.006,0);
      mesh(new THREE.CylinderGeometry(.058,.058,.003,20),mat('#896d3f'),heldCup,0,.094,0);
      mesh(new THREE.TorusGeometry(.064,.006,6,24),cupMaterial,heldCup,0,.105,0).rotation.x=Math.PI/2;
      mesh(new THREE.TorusGeometry(.032,.009,6,14),cupMaterial,heldCup,.075,.055,0);
      function loungePose(t,kind,progress=0,options={}){
        pose(t,false);mallet.visible=false;carriedIncense.visible=false;
        const seat=Number.isFinite(options.seatHeight)?options.seatHeight:.42,blend=smooth(options.blend??1);root.userData.loungeBlend=blend;
        if(kind==='sit'&&seat<=.18)groundSitBlend=blend;
        body.position.y=mix(.46,seat,blend);body.rotation.set(kind==='read'?.025:0,0,0);head.rotation.x=kind==='read'?.17:.035;
        loungeLegs.visible=blend>.001;legs.forEach(leg=>leg.visible=blend<=.001);
        loungeLimbs.forEach((limb,i)=>{
          const hip=new THREE.Vector3(limb.side*.135,mix(.48,seat+.02,blend),0),ankle=new THREE.Vector3(limb.side*.135,.10,0);
          const target=kind==='ride'?new THREE.Vector3(limb.side*.31,seat-.275,.08):seat>.3?new THREE.Vector3(limb.side*.135,seat-.17,.19):new THREE.Vector3(limb.side*.135,seat-.10,.19-Math.sqrt(.19*.19-.12*.12));ankle.lerp(target,blend);
          const direction=ankle.clone().sub(hip),reach=Math.min(.3799,direction.length());direction.normalize();
          const bend=new THREE.Vector3(kind==='ride'?limb.side*.45:0,0,1);bend.addScaledVector(direction,-bend.dot(direction)).normalize();
          const knee=hip.clone().addScaledVector(direction,reach/2).addScaledVector(bend,Math.sqrt(Math.max(0,.19*.19-reach*reach/4)));
          ankle.copy(hip).addScaledVector(direction,reach);segment(limb.thigh,hip,knee);segment(limb.calf,knee,ankle);
          // Seated legs blend from the same ankle height as the visible standing shoe.
          // The scanned avatar uses these helpers as drivers with a different rest origin.
          const standingShoeY=importedOutfit?.fullAvatar ? .03 : -.035;
          limb.shoe.position.copy(ankle).add(new THREE.Vector3(0,mix(standingShoeY,seat>.3?-.007:.003,blend),mix(.055,seat>.3?.055:-.055,blend)));limb.shoe.rotation.y=seat>.3?0:Math.PI*blend;
          legs[i].position.copy(hip);legs[i].quaternion.setFromUnitVectors(new THREE.Vector3(0,-1,0),knee.clone().sub(hip).normalize());
        });
        heldBook.visible=kind==='read'&&blend>.7;
        const phase=((Number.isFinite(progress)?progress:t/8)%1+1)%1;
        const lift=smooth((phase-.18)/.18)*(1-smooth((phase-.70)/.18));
        heldCup.visible=kind==='tea'&&blend>.7&&phase>=.10&&phase<.94;
        arms.forEach(a=>{
          const shoulder=new THREE.Vector3(a.side*.255,.55,.01),elbow=new THREE.Vector3(a.side*.28,.30,.22);
          const hand=kind==='ride'?new THREE.Vector3(a.side*.19,.27,.33):kind==='sit'?new THREE.Vector3(a.side*.23,.15,.22):kind==='read'?new THREE.Vector3(a.side*.20,.33,.38):a.side>0?new THREE.Vector3(mix(.23,.075,lift),mix(.28,.77,lift),mix(.36,.37,lift)):new THREE.Vector3(-.18,.20,.23);
          armPose(a,shoulder,elbow,hand);a.palm.rotation.x=kind==='read'?.2:-lift*.3;
        });
        if(kind==='read'){
          heldBook.position.copy(arms[0].palm.position).add(arms[1].palm.position).multiplyScalar(.5);heldBook.position.y+=.008;heldBook.position.z+=.09;heldBook.rotation.x=-.18;
          const explicit=Number.isFinite(options.pageTurn)?options.pageTurn:null,flip=explicit===null?smooth((phase-.76)/.13):smooth(explicit);
          turningPage.rotation.z=-Math.PI*flip;turningPage.visible=explicit===null?phase>.76&&phase<.94:explicit>0&&explicit<1;
        }else{
          const hand=arms.find(a=>a.side>0).palm.position;heldCup.position.copy(hand);heldCup.position.x-=.045;heldCup.position.z+=.015;heldCup.rotation.x=-lift*.25;
        }
        root.userData.lounge={kind,seatHeight:seat,phase,lift,cupInHand:heldCup.visible,upperArmLength,forearmLength};
      }
      function ritualPose(t, kind, progress) {
        pose(t, false);
        mallet.visible = kind === 'woodfish';
        carriedIncense.visible = kind === 'incense' && progress < .63;
        if (kind === 'woodfish') {
          body.position.y = .27; body.rotation.x = .08;
          legs.forEach(leg => { leg.position.y = .29; leg.rotation.x = -1.18; });
          const cycle = ((t % .8) + .8) % .8 / .8;
          const hit = Math.pow(Math.sin(cycle * Math.PI), 2);
          const hand = new THREE.Vector3(.20, .63 + .10 * (1 - hit), .43);
          arms.forEach(a => {
            const shoulder = new THREE.Vector3(a.side * .255, .55, .01);
            const elbow = new THREE.Vector3(a.side * .29, .38, .25);
            const palm = a.side > 0 ? hand : new THREE.Vector3(-.17, .30, .29);
            armPose(a,shoulder,elbow,palm);
          });
          mallet.position.copy(hand); mallet.rotation.x = -.92 + hit * 1.10;
          return;
        }
        if (kind === 'incense') {
          const raised = smooth(progress / .24);
          const reach = smooth((progress - .29) / .25);
          joinedPalms=progress<.63?1-reach:smooth((progress-.63)/.07);
          const bow = smooth((progress - .68) / .12) * (1 - smooth((progress - .88) / .12));
          body.rotation.x = .13 * reach + bow * .27;
          arms.forEach(a => {
            const shoulder = new THREE.Vector3(a.side * .255, .55, .01);
            const elbow = new THREE.Vector3(a.side * .22, .42 + raised * .12, .29 + reach * .18);
            const palm = new THREE.Vector3(a.side * .05, mix(.51 + raised * .39, .61, reach), .35 + reach * .39);
            if(progress >= .63) { palm.y = .51; palm.z = .38; elbow.y = .34; elbow.z = .28; }
            armPose(a,shoulder,elbow,palm);
          });
          carriedIncense.position.copy(arms[0].palm.position).add(arms[1].palm.position).multiplyScalar(.5);
          carriedIncense.rotation.x = -body.rotation.x;
        }
      }
      function hideProps() { mallet.visible = false; carriedIncense.visible = false; heldBook.visible=false;heldCup.visible=false; }
      let importedOutfit=null,wantedOutfit=canonicalOutfit(appearance.outfitId),disposed=false;
      let retryAt=0,retryDelay=3000,pendingTextile=null;
      appearance.outfitId=wantedOutfit;
      const importedOutfits=new Map(),outfitsLoading=new Set();
      const originalClothes=[];root.traverse(o=>{if(o.isMesh&&(o.material===robe||o.material===sash))originalClothes.push(o);});
      const originalBodyMeshes=[],props=new Set([mallet,carriedIncense,heldBook,heldCup]);root.traverse(o=>{if(!o.isMesh)return;for(let p=o.parent;p;p=p.parent)if(props.has(p))return;originalBodyMeshes.push(o);});
      const ornaments=new Map(),shoeMaterials=new Map([['original',shoes]]);
      const currentGear={feet:'original',neck:appearance.goldBeads?'gold':'none',waist:'none'};
      const choices={feet:['original','hemp','indigo'],neck:['none','sandal','gold'],waist:['none','pouch','jade']};
      function readGear(next){
        for(const slot of Object.keys(choices))if(choices[slot].includes(next?.[slot]))currentGear[slot]=next[slot];
      }
      readGear(appearance.gear);appearance.gear=currentGear;
      appearance.goldBeads=currentGear.neck==='gold';
      function refreshGear(){
        if(!importedOutfit||!window.TempleWardrobe)return;
        const {feet,neck,waist}=currentGear;
        if(!shoeMaterials.has(feet))shoeMaterials.set(feet,window.TempleWardrobe.shoeMaterial(THREE,feet));
        const material=shoeMaterials.get(feet);
        for(let i=0;i<2;i++){walkingShoes[i].material=material;loungeLimbs[i].shoe.material=material;}
        for(const group of ornaments.values())group.visible=false;
        for(const [slot,id] of [['neck',neck],['waist',waist]]){
          if(id==='none')continue;
          let item=ornaments.get(id);
          if(!item){item=window.TempleWardrobe.gearPreview(THREE,slot,id);ornaments.set(id,item);body.add(item);}
          if(slot==='neck')item.position.set(0,.55,importedOutfit.fullAvatar?.021:0);
          else{
            item.position.set(.19,.17,importedOutfit.fullAvatar?.249:.157);
            item.rotation.y=.4;
          }
          item.visible=true;
        }
      }
      const calfDrivers=legs.map(()=>{const p=new THREE.Group();root.add(p);return p;}),footDrivers=legs.map(()=>{const p=new THREE.Group();root.add(p);return p;});
      const palmDrivers=arms.map(()=>{const p=new THREE.Group();root.add(p);return p;}),forearmRestInverses=[];
      const hemDriver=new THREE.Group();root.add(hemDriver);
      const legDown=new THREE.Vector3(0,-1,0),calfDirection=new THREE.Vector3(),calfOffset=new THREE.Vector3();
      function updateLegDrivers(){
       body.updateMatrix();for(let i=0;i<2;i++){const palm=palmDrivers[i],arm=arms[i];palm.position.copy(arm.palm.position).applyMatrix4(body.matrix);palm.quaternion.copy(body.quaternion).multiply(arm.lower.quaternion).multiply(forearmRestInverses[i]).multiply(arm.palm.quaternion);}
       hemDriver.position.copy(body.position);
       hemDriver.position.y=Math.max(.26,hemDriver.position.y);
       hemDriver.rotation.copy(body.rotation);hemDriver.rotation.x*=.20;
       if(!loungeLegs.visible){
         const fold=THREE.MathUtils.clamp((.46-body.position.y)/.215,0,1);
         // Gather the long rear panel over the folded calves, away from the heels.
         hemDriver.position.y+=.053*fold;
         hemDriver.position.z+=.050*fold;
       }
       for(let i=0;i<2;i++){
        const calf=calfDrivers[i],foot=footDrivers[i],leg=legs[i];leg.updateMatrix();
        if(loungeLegs.visible){const limb=loungeLimbs[i];calfDirection.set(0,1,0).applyQuaternion(limb.calf.quaternion);calfOffset.copy(calfDirection).multiplyScalar(-limb.calf.scale.y/2);calf.position.copy(limb.calf.position).add(calfOffset);calf.quaternion.setFromUnitVectors(legDown,calfDirection);foot.position.copy(limb.shoe.position);foot.position.y+=.067*(root.userData.loungeBlend||0);foot.quaternion.copy(limb.shoe.quaternion);}
        else{calf.position.set(0,-.19,0).applyMatrix4(leg.matrix);calf.quaternion.copy(leg.quaternion);foot.position.set(0,-.35,.055).applyMatrix4(leg.matrix);foot.quaternion.copy(leg.quaternion);}
       }
      }
      const restParts=[body,...arms.map(a=>a.upper),...arms.map(a=>a.lower),...legs,head,...palmDrivers,...calfDrivers,...footDrivers,hemDriver];
      let partInverses=null,bodyBind=null;
      const rigUnitScale=new THREE.Vector3(1,1,1),rigPosition=new THREE.Vector3(),rigRotation=new THREE.Quaternion(),rigIgnoredScale=new THREE.Vector3();
      function rigidPartMatrix(part,inverseRoot,matrix=new THREE.Matrix4()){
        matrix.copy(part.matrixWorld).premultiply(inverseRoot);
        matrix.decompose(rigPosition,rigRotation,rigIgnoredScale);
        return matrix.compose(rigPosition,rigRotation,rigUnitScale);
      }
      function prepareHemPoses(geometry){
        if(geometry.morphAttributes.position)return;
        const p=geometry.attributes.position,offsets=new Float32Array(p.count*3);
        for(let i=0;i<p.count;i++){
          // Gather the bottom seven centimetres of loose cloth. The back rests
          // lower than the front when the hips move down and the knees bend.
          const x=p.getX(i),z=p.getZ(i),rise=Math.max(0,-.181-p.getY(i))*(.10-.9*z);
          if(rise===0)continue;
          offsets[3*i]=rise*x*.9;offsets[3*i+1]=rise;offsets[3*i+2]=rise*z*2.2;
        }
        const target=new THREE.BufferAttribute(offsets,3);target.name='Ground seated hem';
        // Gather the ankle-length panels along the folded shins. The front
        // drape tucks towards the knees as it approaches the cushion.
        const kneelingOffsets = new Float32Array(p.count * 3);
        for (let i = 0; i < p.count; i++) {
          const y = p.getY(i), z = p.getZ(i);
          kneelingOffsets[3*i+1] = .087 * smooth((-.047-y)/.185);
          kneelingOffsets[3*i+2] = -.014 * smooth((z-.035)/.155) * smooth((.03-y)/.155);
        }
        const kneelingHem = new THREE.BufferAttribute(kneelingOffsets, 3);
        kneelingHem.name = 'Kneeling hem';
        geometry.morphAttributes.position = [target, kneelingHem];
        geometry.morphTargetsRelative = true;
      }
      function refreshOutfit(){
       const key=['cloud','moss','moon','plum'].includes(wantedOutfit)?wantedOutfit:'lotus';
       const selected=importedOutfits.get(key);
       root.userData.outfitReady=!!selected;
       retryAt=0;
       if(selected){
         const requested=wantedOutfit;
         const pending=window.TempleWardrobe.tint(THREE,selected.mesh.material,requested,currentGear.feet);
         if(pending){
           root.userData.outfitReady=false;root.userData.outfitError=null;
           if(pendingTextile!==pending){
             pendingTextile=pending;
             pending.then(()=>{
               if(disposed||pendingTextile!==pending||wantedOutfit!==requested)return;
               pendingTextile=null;refreshOutfit();updateOutfit();
             }).catch(error=>{
               if(disposed||pendingTextile!==pending||wantedOutfit!==requested)return;
               pendingTextile=null;root.userData.outfitError=String(error.message||error);
               retryAt=Date.now()+retryDelay;retryDelay=Math.min(30000,retryDelay*2);
               console.error('Outfit texture:',error);
             });
           }
           return;
         }
         pendingTextile=null;
         if(importedOutfit!==selected){
           if(importedOutfit)importedOutfit.mesh.visible=false;
           importedOutfit=selected;
           originalBodyMeshes.forEach(o=>o.visible=!selected.fullAvatar);
           originalClothes.forEach(o=>o.visible=false);
           // The grey robe ends above the ankle. Retain its fitted lining and the rig's shoes.
           for(const leg of trouserLegs){
             leg.visible=!selected.fullAvatar;
             leg.material=trouserLining;
             leg.scale.set(.73,1,.73);
           }
         }
         // The first robe exposes the procedural face; the yellow scanned avatar owns its head.
         head.scale.setScalar(selected.fullAvatar?1:.95);
         head.position.y=(selected.fullAvatar?.99:.9725)+(selected.headOffsetY||0);
         refreshGear();
         selected.mesh.visible=true;
         root.userData.outfitAsset=key;
         // When supine, the scanned avatar's rear extent becomes its floor contact.
         if(selected.fullAvatar&&!selected.mesh.geometry.boundingBox)selected.mesh.geometry.computeBoundingBox();
         root.userData.supineLift=selected.fullAvatar?-selected.mesh.geometry.boundingBox.min.z+.002:.34;
         root.userData.outfitError=null;
         retryDelay=3000;
         return;
       }
       // Keep the last real costume while switching. On first load hide the rig until dressed.
       if(!importedOutfit){
         originalBodyMeshes.forEach(o=>o.visible=false);
         root.userData.outfitAsset=null;
       }
       if(outfitsLoading.has(key)||!window.TempleWardrobe)return;
       outfitsLoading.add(key);
       window.TempleWardrobe.load(THREE,key).then(asset=>{
        if(disposed)return;
        const boneNames=asset.boneNames||['Torso','Left upper arm','Right upper arm','Left forearm','Right forearm','Left thigh','Right thigh'],parts=restParts.slice(0,boneNames.length);
        const bones=parts.map((_,i)=>{const b=new THREE.Bone();b.name=boneNames[i];b.matrixAutoUpdate=false;b.matrix.copy(bodyBind);root.add(b);return b;});
        if(key==='lotus')prepareHemPoses(asset.geometry);
        const mesh=new THREE.SkinnedMesh(asset.geometry,asset.material.clone());mesh.name=asset.fullAvatar?'Complete uploaded monk - '+key:'First upgrade - uploaded monk robe';mesh.position.y=.46;mesh.castShadow=true;mesh.receiveShadow=false;root.add(mesh);root.updateMatrixWorld(true);mesh.bind(new THREE.Skeleton(bones));mesh.frustumCulled=false;
        mesh.visible=false;
        importedOutfits.set(key,{mesh,bones,parts,fullAvatar:asset.fullAvatar,headOffsetY:asset.headOffsetY,solePoints:asset.solePoints});
        refreshOutfit();updateOutfit();
       }).catch(error=>{
         if(disposed||key!==(['cloud','moss','moon','plum'].includes(wantedOutfit)?wantedOutfit:'lotus'))return;
         root.userData.outfitError=String(error.message||error);
         retryAt=Date.now()+retryDelay;
         retryDelay=Math.min(30000,retryDelay*2);
         console.error('Outfit:',error);
       }).finally(()=>outfitsLoading.delete(key));
      }
      // The scanned hands have different rest axes from the procedural forearms.
      // Use the hand centres and rest-to-prayer frames measured on the uploaded mesh.
      const cloudPalms=[
        {centre:new THREE.Vector3(-.311955,.089852,.082411),frame:new THREE.Quaternion(0.9952830,-0.0322780,-0.0200793,0.0892561).normalize()},
        {centre:new THREE.Vector3(.310350,.089333,.083286),frame:new THREE.Quaternion(0.9962464,-0.0124870,0.0529882,0.0673015).normalize()}
      ];
      let cloudArmRest;
      const liveAxis=new THREE.Vector3(),swing=new THREE.Quaternion();
      function alignCloudArm(matrix,index){
        const left=index===1||index===3||index===8,arm=arms[left?0:1],palm=index>=8;
        const joint=index<3?arm.upper:arm.lower,pivot=palm?arm.palm:joint;
        const rest=cloudArmRest[left?0:1][index<3?'upper':palm?'palm':'lower'];
        liveAxis.copy(unitY).applyQuaternion(joint.quaternion);
        // Match rest and posed bone directions directly. Deriving twist from +Y for a
        // downward pointing sleeve becomes ambiguous as it crosses that axis during a step.
        swing.setFromUnitVectors(rest.axis,liveAxis);
        if(palm)swing.multiply(arm.palm.quaternion);
        swing.premultiply(body.quaternion);
        palmTarget.copy(pivot.position).applyMatrix4(body.matrix);
        palmOffset.copy(rest.pivot).applyQuaternion(swing);
        matrix.compose(palmTarget.sub(palmOffset),swing,rigUnitScale);
      }
      const palmCentre=new THREE.Vector3(),palmTarget=new THREE.Vector3(),palmOffset=new THREE.Vector3();
      const palmRotation=new THREE.Quaternion(),targetRotation=new THREE.Quaternion();
      function alignCloudPalm(matrix,index){
        const rest=cloudPalms[index],side=index===0?-1:1;
        palmCentre.copy(rest.centre).applyMatrix4(matrix);
        palmTarget.addVectors(arms[0].palm.position,arms[1].palm.position).multiplyScalar(.5);
        palmTarget.x=side*.020;palmTarget.applyMatrix4(body.matrix);
        palmCentre.lerp(palmTarget,joinedPalms);
        palmRotation.setFromRotationMatrix(matrix);
        targetRotation.copy(rest.frame);
        palmRotation.slerp(targetRotation,joinedPalms);
        palmOffset.copy(rest.centre).applyQuaternion(palmRotation);
        matrix.compose(palmCentre.sub(palmOffset),palmRotation,rigUnitScale);
      }
      const cloudSoleProfile=[[-.438,-.117],[-.457,-.108],[-.461,-.065],[-.461,.136],[-.460,.171],[-.454,.196],[-.447,.212],[-.445,.215]];
      // The two scanned openings are slightly offset from the arm rig's axis.
      // These points lie on the inner cuff rims in original garment coordinates.
      const cuffRims = [new THREE.Vector3(-.297,.142,.073), new THREE.Vector3(.296,.141,.063)];
      const cuffPoint = new THREE.Vector3(), wristAxis = new THREE.Vector3(), inverseBody = new THREE.Matrix4();
      function fitWrists() {
        inverseBody.copy(body.matrix).invert();
        for (let i=0; i<arms.length; i++) {
          const {wrist,palm} = arms[i];
          cuffPoint.copy(cuffRims[i]).applyMatrix4(importedOutfit.bones[3+i].matrix).applyMatrix4(inverseBody);
          wristAxis.subVectors(cuffPoint,palm.position);
          const length = wristAxis.length();
          wrist.position.copy(palm.position).lerp(cuffPoint,.5);
          wrist.scale.y = length*.5+.025;
          if(length>1e-6) wrist.quaternion.setFromUnitVectors(unitY,wristAxis.divideScalar(length));
        }
      }
      const posedPartMatrix=new THREE.Matrix4(),outfitRootInverse=new THREE.Matrix4();
      function updateOutfit(){
       if(retryAt&&Date.now()>=retryAt)refreshOutfit();
       if(!importedOutfit){if(window.TempleWardrobe)hideProps();return;}
       const hem = importedOutfit.mesh.morphTargetInfluences;
       if(hem && !importedOutfit.fullAvatar){
        hem[0] = groundSitBlend;
        hem[1] = kneelingHemBlend;
       }
       if(importedOutfit.fullAvatar)updateLegDrivers();
       root.updateMatrixWorld(true);outfitRootInverse.copy(root.matrixWorld).invert();
       const full=importedOutfit.fullAvatar;
       const kneel=full&&!loungeLegs.visible?THREE.MathUtils.clamp((.46-body.position.y)/.215,0,1):0;
       const heelLift=.084*kneel+.089*Math.sin(Math.PI*kneel);
       importedOutfit.parts.forEach((part,i)=>{
         const matrix=rigidPartMatrix(part,outfitRootInverse,posedPartMatrix);
         if(i)matrix.multiply(partInverses[i]).multiply(bodyBind);
         if(full){
           const e=matrix.elements;
           if(i===5||i===6||(i>=10&&i<=13))e[13]+=heelLift;
           if(i===12||i===13){
             // Support the original scan at heel, ball and toe. Its rounded soles
             // pitch about the ankle during the stride and descend as the shins fold.
             let floor=Infinity;
             if(importedOutfit.solePoints?.[i-12]?.length){
               for(const [x,y,z] of importedOutfit.solePoints[i-12])floor=Math.min(floor,e[13]+x*e[1]+y*e[5]+z*e[9]);
             }else for(const [y,z] of cloudSoleProfile)floor=Math.min(floor,e[13]+y*e[5]+z*e[9]-(.22*Math.abs(e[1])));
             e[13]+=Math.max(0,.001-floor);
             e[14]-=.055*kneel;
           }
           if((i>=1&&i<=4)||i===8||i===9)alignCloudArm(matrix,i);
           if(joinedPalms>0&&(i===8||i===9))alignCloudPalm(matrix,i-8);
         }
         importedOutfit.bones[i].matrix.copy(matrix);
         importedOutfit.bones[i].matrixWorldNeedsUpdate=true;
       });
       if(!importedOutfit.fullAvatar)fitWrists();
      }
      function setAppearance(next = {}) {
        let gearChanged=false;
        // Legacy appearance packets may carry only the original necklace flag.
        if(next.goldBeads!==undefined&&next.gear?.neck===undefined){
          const neck=next.goldBeads?'gold':(currentGear.neck==='sandal'?'sandal':'none');
          if(currentGear.neck!==neck){currentGear.neck=neck;gearChanged=true;}
        }
        if(next.gear){
          for(const slot of Object.keys(choices)){
            const id=next.gear[slot];
            if(choices[slot].includes(id)&&currentGear[slot]!==id){currentGear[slot]=id;gearChanged=true;}
          }
        }
        appearance.goldBeads=currentGear.neck==='gold';
        let outfitChanged=false;
        if(next.outfitId!==undefined){
          const nextOutfit=canonicalOutfit(next.outfitId);
          if(nextOutfit!==wantedOutfit){wantedOutfit=nextOutfit;appearance.outfitId=nextOutfit;outfitChanged=true;}
        }
        if(gearChanged||outfitChanged)refreshOutfit();
        for (const [key, ownedMaterial] of [['robe', robe], ['sash', sash], ['skin', skin]]) {
          if (typeof next[key] === 'string' && /^#[0-9a-f]{6}$/i.test(next[key])) {
            ownedMaterial.color.set(next[key]);
            appearance[key] = next[key];
          }
        }
      }
      pose(0, false);
      cloudArmRest=arms.map(arm=>Object.fromEntries(['upper','lower','palm'].map(key=>{
        const direction=key==='upper'?arm.upper:arm.lower;
        return [key,{axis:unitY.clone().applyQuaternion(direction.quaternion),pivot:arm[key].position.clone()}];
      })));
      arms.forEach(a=>forearmRestInverses.push(a.lower.quaternion.clone().invert()));updateLegDrivers();root.updateMatrixWorld(true);const initialInverse=root.matrixWorld.clone().invert();bodyBind=body.matrix.clone();partInverses=restParts.map(p=>rigidPartMatrix(p,initialInverse).invert());refreshOutfit();
      function dispose(){if(disposed)return;disposed=true;const geometries=new Set(),materials=new Set(),sharedGeometries=new Set([...importedOutfits.values()].map(o=>o.mesh.geometry));root.traverse(o=>{if(!o.isMesh)return;if(!sharedGeometries.has(o.geometry))geometries.add(o.geometry);for(const m of Array.isArray(o.material)?o.material:[o.material])if(m)materials.add(m);});for(const g of geometries)g.dispose();materials.add(trouserLining);for(const m of shoeMaterials.values())materials.add(m);for(const item of ornaments.values())if(item.isInstancedMesh)item.dispose();for(const m of materials)m.dispose();for(const outfit of importedOutfits.values())outfit.mesh.skeleton.dispose();}
      function freePose(t,kind,blend=1){
       hideProps();
       if(kind==='sit')loungePose(t,'sit',0,{seatHeight:.18,blend});
       else{
        pose(kind==='run'?t*1.65:t,kind==='run');
        if(kind==='lie'){body.position.y=.46;body.rotation.set(0,0,0);head.rotation.x=0;root.rotation.x=-Math.PI/2*smooth(blend);}
        if(kind==='run')body.rotation.x=.09;
        if(kind==='jump'){body.rotation.x=.05;legs.forEach(l=>l.rotation.x=-.22);}
        if(kind==='greet'){
         const b=smooth(blend);joinedPalms=b;body.rotation.x=.035*b;head.rotation.x=.075*b;
         for(const a of arms){const side=a.side;
          armPose(a,new THREE.Vector3(side*.255,.55,.01),new THREE.Vector3(mix(side*.31,side*.22,b),mix(.30,.35,b),mix(0,.18,b)),new THREE.Vector3(mix(side*.32,side*.025,b),mix(.11,.54,b),mix(.025,.35,b)));
          a.palm.scale.set(mix(.063,.025,b),mix(.087,.10,b),mix(.05,.065,b));
         }
        }
       }
       updateOutfit();
      }
      const dressedPose=(...args)=>{pose(...args);updateOutfit();},dressedRitualPose=(...args)=>{ritualPose(...args);updateOutfit();},dressedLoungePose=(...args)=>{loungePose(...args);updateOutfit();};
      return { root, body, head, pose:dressedPose, ritualPose:dressedRitualPose,loungePose:dressedLoungePose,freePose, hideProps, setAppearance, appearance,dispose };
    }
  };
})();
;
(function () {
  'use strict';

  const rainMix = {
    outdoors: { level: 0.068, cutoff: 2450 },
    indoors: { level: 0.022, cutoff: 900 }
  };

  // Context creation is deliberately deferred until the user's first gesture.
  class TempleAudio {
    constructor() {
      this.context = null;
      this.master = null;
      this.muted = false;
      this._unlockPromise = null;
      this._ambience = [];
      this._voices = new Set();
      this._lastBell = -Infinity;
      this._lastStep = -Infinity;
      this._lastKnock = -Infinity;
      this._playedKnocks = 0;
      this._elapsed = 0;
      this._nextAmbientUpdate = 0;
      this._hallAmbience = false;
      this._ambientKnocks = 0;
      this._chantPromise = null;
      this._chantSource = null;
      this._chantGain = null;
      this._chantBuffer = null;
      this._chantError = null;
      this._chantLevel = null;
      this._chantStartedAt = null;
      this._surf = [];
      this._surfGain = null;
      this._surfLevel = null;
      this._surfError = null;
      this._coastStrength = 0;
      this._environmentActive = true;
      this._environmentIndoors = false;
      this._weather = 'clear';
      this._weatherNoiseBuffer = null;
      this._weatherNoiseError = false;
      this._rain = null;
      this._rainLevel = null;
      this._rainError = null;
      this._thunders = new Set();
      this._lastThunder = -Infinity;
      this._thunderCount = 0;
    }

    get available() {
      return typeof (window.AudioContext || window.webkitAudioContext) === 'function';
    }

    get enabled() {
      return !!this.context && this.context.state === 'running' && !this.muted;
    }

    get status() {
      return {
        available: this.available,
        enabled: this.enabled,
        state: this.context ? this.context.state : 'not-started',
        muted: this.muted,
        playedKnocks: this._playedKnocks,
        hallAmbience:this._hallAmbience,
        ambientKnocks:this._ambientKnocks,
        chantLoaded:!!this._chantBuffer,
        chantLoop:!!this._chantSource?.loop,
        chantAudible:!!this._chantSource&&this.enabled&&this._hallAmbience,
        chantSeconds:this._chantBuffer?.duration||0,
        chantSampleRate:this._chantBuffer?.sampleRate||0,
        chantLoops:this._chantSource?Math.floor(Math.max(0,this.context.currentTime-this._chantStartedAt)/this._chantBuffer.duration):0,
        chantError:this._chantError,
        surfLoaded:this._surf.length===2,
        surfAudible:this._surf.length>0&&this.enabled&&this._environmentActive&&this._coastStrength>0&&!this._hallAmbience,
        coastStrength:this._coastStrength,
        surfLevel:this._surfLevel||0,
        surfError:this._surfError,
        rainLoaded:!!this._rain,
        rainAudible:!!this._rain&&this.enabled&&this._environmentActive&&this._weather==='rain',
        rainLevel:this._rainLevel||0,
        rainError:this._rainError,
        thunderCount:this._thunderCount,
        activeThunders:this._thunders.size
      };
    }

    async unlock() {
      if (!this.available) return false;
      if (this._unlockPromise) return this._unlockPromise;
      this._unlockPromise = this._open();
      try {
        return await this._unlockPromise;
      } finally {
        this._unlockPromise = null;
      }
    }

    async _open() {
      try {
        if (!this.context || this.context.state === 'closed') {
          const AudioContextClass = window.AudioContext || window.webkitAudioContext;
          this.context = new AudioContextClass();
          this.master = this.context.createGain();
          this.master.gain.value = 0;
          this.master.connect(this.context.destination);
          this._ambience = [];
          this._voices.clear();
          this._lastBell = -Infinity;
          this._lastStep = -Infinity;
          this._lastKnock = -Infinity;
          this._surf = [];
          this._surfGain = null;
          this._surfLevel = null;
          this._surfError = null;
          this._weatherNoiseBuffer = null;
          this._weatherNoiseError = false;
          this._rain = null;
          this._rainLevel = null;
          this._rainError = null;
          this._thunders.clear();
          this._lastThunder = -Infinity;
        }
        if (this.context.state !== 'running') await this.context.resume();
        if (!this._ambience.length) this._startAmbience();
        // Read the latest preference after resume: a mute click can occur while
        // the browser is resolving its audio permission / activation state.
        this._fadeMaster();
        // Optional sound loads after the gesture without holding up game entry.
        this._loadChant();
        return this.context.state === 'running';
      } catch (_) {
        // Audio is optional. Browser/device failures must not interrupt play.
        return false;
      }
    }

    setMuted(value) {
      this.muted = !!value;
      this._fadeMaster();
      this._fadeChant();
      this._fadeSurf();
      this._fadeRain();
      if(this.muted)this._stopThunders();
      return this.muted;
    }

    setHallActive(value) {
      this._hallAmbience=!!value;
      this._fadeChant();
      this._fadeSurf();
      this._fadeRain();
    }

    _fadeChant() {
      if(!this._chantGain||!this.context||this.context.state==='closed')return;
      const level=this._hallAmbience&&!this.muted?0.58:0;
      if(this._chantLevel===level)return;
      this._chantLevel=level;
      this._chantGain.gain.setTargetAtTime(level,this.context.currentTime,.18);
    }

    _loadChant() {
      if(this._chantPromise||this._chantSource||!this.context)return;
      const context=this.context;
      this._chantError=null;
      this._chantPromise=(async()=>{
        const response=await (window.TempleAssets?.fetch('assets/hall-chant-loop.mp3')||fetch('assets/hall-chant-loop.mp3'));
        if(!response.ok)throw new Error('Chant unavailable');
        const bytes=await response.arrayBuffer();
        // Decode mono at 24 kHz: about 7 MB for this long recording, rather
        // than tying its memory cost to a phone's 48/96 kHz output device.
        const Offline=window.OfflineAudioContext||window.webkitOfflineAudioContext;
        const decoder=Offline?new Offline(1,1,24000):context;
        const buffer=await decoder.decodeAudioData(bytes);
        if(context!==this.context||context.state==='closed')return;
        const gain=context.createGain();gain.gain.value=0;gain.connect(this.master);
        const source=context.createBufferSource();source.buffer=buffer;
        source.loop=true;source.loopStart=0;source.loopEnd=buffer.duration;
        source.connect(gain);
        this._chantBuffer=buffer;this._chantGain=gain;this._chantSource=source;
        this._chantLevel=null;this._chantStartedAt=context.currentTime;source.start();this._fadeChant();
      })().catch(()=>{this._chantError='unavailable';}).finally(()=>{this._chantPromise=null;});
    }

    _fadeMaster() {
      if (!this.master || !this.context || this.context.state === 'closed') return;
      const now = this.context.currentTime;
      const gain = this.master.gain;
      if (typeof gain.cancelAndHoldAtTime === 'function') {
        gain.cancelAndHoldAtTime(now);
      } else {
        const current = gain.value;
        gain.cancelScheduledValues(now);
        gain.setValueAtTime(current, now);
      }
      gain.setTargetAtTime(this.muted ? 0 : 0.38, now, 0.055);
    }

    _startAmbience() {
      const now = this.context.currentTime;
      [87.31, 130.81].forEach((frequency, index) => {
        const oscillator = this.context.createOscillator();
        const gain = this.context.createGain();
        oscillator.type = 'sine';
        oscillator.frequency.value = frequency;
        gain.gain.setValueAtTime(index ? 0.0035 : 0.005, now);
        oscillator.connect(gain);
        gain.connect(this.master);
        oscillator.start(now);
        this._ambience.push({ oscillator: oscillator, gain: gain });
      });
    }

    _coastalStrength(environment, inHall) {
      if (!environment || environment.active === false || environment.indoors || inHall) return 0;
      const p=environment.position, radius=window.TempleNavigation?.islandRadius;
      if (!p || !Number.isFinite(p.x) || !Number.isFinite(p.z) || typeof radius!=='function') return 0;
      const r=radius(p.x,p.z);
      if (!Number.isFinite(r)) return 0;
      // A quiet approach across the meadow grows into surf at the sand/water
      // boundary. The same irregular island radius defines the visible shore.
      const t=Math.max(0,Math.min(1,(r-.60)/.32));
      return t*t*(3-2*t);
    }

    _weatherNoise() {
      if(this._weatherNoiseBuffer)return this._weatherNoiseBuffer;
      if(this._weatherNoiseError)throw new Error('Weather audio unavailable');
      try {
        // No recording download and no ScriptProcessor/main-thread audio loop:
        // rain, surf and thunder share one small immutable noise buffer.
        const rate=16000,buffer=this.context.createBuffer(1,rate*6,rate),samples=buffer.getChannelData(0);
        let seed=1923741;
        for(let i=0;i<samples.length;i++){
          seed=(Math.imul(seed,1664525)+1013904223)>>>0;
          samples[i]=seed/2147483648-1;
        }
        this._weatherNoiseBuffer=buffer;
        return buffer;
      }catch(error){this._weatherNoiseError=true;throw error;}
    }

    _startSurf() {
      if (this._surf.length || this._surfError || !this.enabled) return;
      const context=this.context,created=[];
      try {
        const buffer=this._weatherNoise();
        const output=context.createGain();output.gain.value=0;output.connect(this.master);created.push(output);
        this._surfGain=output;this._surfLevel=null;
        for(const [kind,frequency,q,offset] of [['lowpass',420,.55,0],['bandpass',1050,.65,2.7]]){
          const source=context.createBufferSource(),filter=context.createBiquadFilter(),gain=context.createGain();
          created.push(source,filter,gain);
          source.buffer=buffer;source.loop=true;source.loopStart=0;source.loopEnd=buffer.duration;
          filter.type=kind;filter.frequency.value=frequency;filter.Q.value=q;
          gain.gain.value=0;source.connect(filter);filter.connect(gain);gain.connect(output);
          source.start(context.currentTime,offset);
          this._surf.push({source,filter,gain});
        }
        this._fadeSurf();
      } catch (_) {
        for(const node of created){try{node.stop?.();}catch(_){}try{node.disconnect();}catch(_){}}
        this._surf=[];this._surfGain=null;this._surfLevel=null;this._surfError='unavailable';
      }
    }

    _fadeSurf() {
      if(!this._surfGain||!this.context||this.context.state==='closed')return;
      const level=!this.muted&&this._environmentActive&&!this._hallAmbience?this._coastStrength:0;
      if(this._surfLevel!==null&&Math.abs(this._surfLevel-level)<.003&&level!==0&&level!==1)return;
      if(this._surfLevel===level)return;
      this._surfLevel=level;
      this._surfGain.gain.setTargetAtTime(level,this.context.currentTime,.65);
    }

    _updateSurf() {
      if(!this._surf.length)return;
      const now=this.context.currentTime;
      // Two slow, unequal cycles keep the wash and undertow from sounding like
      // a mechanical hiss. Filtered audio continues smoothly between updates.
      const swell=Math.pow(.5+.5*Math.sin(now*.72),2),undertow=.5+.5*Math.sin(now*.51+1.8);
      this._surf[0].gain.gain.setTargetAtTime(.11*(.50+.50*undertow),now,.45);
      this._surf[1].gain.gain.setTargetAtTime(.19*(.20+.80*swell),now,.40);
    }

    _startRain() {
      if(this._rain||this._rainError||!this.enabled)return;
      const context=this.context,created=[];
      try{
        const buffer=this._weatherNoise(),source=context.createBufferSource(),high=context.createBiquadFilter(),low=context.createBiquadFilter(),gain=context.createGain();
        created.push(source,high,low,gain);
        source.buffer=buffer;source.loop=true;source.loopStart=0;source.loopEnd=buffer.duration;
        high.type='highpass';high.frequency.value=180;high.Q.value=.45;
        low.type='lowpass';low.frequency.value=rainMix.outdoors.cutoff;low.Q.value=.45;
        gain.gain.value=0;source.connect(high);high.connect(low);low.connect(gain);gain.connect(this.master);
        this._rain={source,high,low,gain};this._rainLevel=null;
        source.start(context.currentTime,1.3);this._fadeRain();
      }catch(_){
        for(const node of created){try{node.stop?.();}catch(_){}try{node.disconnect();}catch(_){}}
        this._rain=null;this._rainLevel=null;this._rainError='unavailable';
      }
    }

    _fadeRain() {
      if(!this._rain||!this.context||this.context.state==='closed')return;
      const indoors=this._environmentIndoors||this._hallAmbience;
      const blend=indoors?rainMix.indoors:rainMix.outdoors;
      const level=!this.muted&&this._environmentActive&&this._weather==='rain'?blend.level:0;
      if(this._rainLevel===level)return;
      this._rainLevel=level;
      this._rain.gain.gain.setTargetAtTime(level,this.context.currentTime,.55);
      this._rain.low.frequency.setTargetAtTime(blend.cutoff,this.context.currentTime,.45);
    }

    thunder(strength = 1) {
      if(!this.enabled||!this._environmentActive||this._weather!=='rain'||this._thunders.size>=2)return false;
      const context=this.context,now=context.currentTime;
      if(now-this._lastThunder<3.8)return false;
      const numeric=Number(strength),amount=Math.max(.2,Math.min(1,Number.isFinite(numeric)?numeric:1)),indoors=this._environmentIndoors||this._hallAmbience,created=[];
      let voice=null;
      try{
        const buffer=this._weatherNoise(),source=context.createBufferSource(),filter=context.createBiquadFilter(),gain=context.createGain();
        created.push(source,filter,gain);
        source.buffer=buffer;source.loop=true;source.playbackRate.value=.42;
        filter.type='lowpass';filter.frequency.value=indoors?90:180;filter.Q.value=.55;
        const duration=2.4+amount*1.4,peak=.096*amount*(indoors?.34:1);
        // Let the distant rumble swell gradually behind the steady rain.
        gain.gain.setValueAtTime(.00001,now);
        gain.gain.exponentialRampToValueAtTime(peak,now+.25);
        gain.gain.exponentialRampToValueAtTime(peak*.45,now+1);
        gain.gain.exponentialRampToValueAtTime(.00001,now+duration);
        source.connect(filter);filter.connect(gain);gain.connect(this.master);
        voice={source,filter,gain};this._thunders.add(voice);
        source.onended=()=>{source.disconnect();filter.disconnect();gain.disconnect();this._thunders.delete(voice);};
        source.start(now,(now*.37)%3);source.stop(now+duration+.03);
        this._lastThunder=now;this._thunderCount++;return true;
      }catch(_){
        if(voice)this._thunders.delete(voice);
        for(const node of created){try{node.stop?.();}catch(_){}try{node.disconnect();}catch(_){}}
        return false;
      }
    }

    _stopThunders() {
      if(!this.context||this.context.state==='closed')return;
      const now=this.context.currentTime;
      this._thunders.forEach(voice=>{
        if(voice.stopping)return;
        voice.stopping=true;
        const gain=voice.gain.gain;
        gain.cancelScheduledValues(now);gain.setTargetAtTime(0,now,.05);
        try{voice.source.stop(now+.2);}catch(_){}
      });
    }

    _tone(frequency, volume, duration, delay, endFrequency) {
      if (!this.enabled || this._voices.size >= 8) return;
      const oscillator = this.context.createOscillator();
      const gain = this.context.createGain();
      const start = this.context.currentTime + (delay || 0);
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(frequency, start);
      if (endFrequency) {
        oscillator.frequency.exponentialRampToValueAtTime(endFrequency, start + duration);
      }
      gain.gain.setValueAtTime(0.00001, start);
      gain.gain.exponentialRampToValueAtTime(volume, start + 0.012);
      gain.gain.exponentialRampToValueAtTime(0.00001, start + duration);
      oscillator.connect(gain);
      gain.connect(this.master);
      this._voices.add(oscillator);
      oscillator.onended = () => {
        oscillator.disconnect();
        gain.disconnect();
        this._voices.delete(oscillator);
      };
      oscillator.start(start);
      oscillator.stop(start + duration + 0.03);
    }

    bell(kind = 'start') {
      if (!this.enabled) return;
      const now = this.context.currentTime;
      if (now - this._lastBell < 0.45) return;
      this._lastBell = now;
      const complete = kind === 'complete';
      const base = complete ? 440 : 349.23;
      this._tone(base, 0.072, complete ? 2.4 : 1.8, 0);
      this._tone(base * 2.38, 0.022, 1.3, 0);
      this._tone(base * 3.91, 0.009, 0.85, 0);
    }

    step() {
      if (!this.enabled) return;
      const now = this.context.currentTime;
      if (now - this._lastStep < 0.22) return;
      this._lastStep = now;
      this._tone(106, 0.035, 0.085, 0, 58);
    }

    knock() {
      if (!this.enabled || this._voices.size > 6) return;
      const now = this.context.currentTime;
      if (now - this._lastKnock < 0.2) return;
      this._lastKnock = now;
      // A short falling body tone plus a quiet overtone suggests wood without
      // loading recordings or creating a continuous extra oscillator.
      this._tone(560, 0.055, 0.11, 0, 380);
      this._tone(900, 0.017, 0.075, 0);
      this._playedKnocks += 1;
    }

    incense() {
      this.bell('start');
    }

    update(dt, inHall = false, environment = null) {
      this._environmentActive=environment?.active!==false;
      this._environmentIndoors=!!environment?.indoors;
      this._weather=environment?.weather||'clear';
      this._coastStrength=this._coastalStrength(environment,inHall);
      this.setHallActive(inHall);
      if(this._coastStrength>0&&!this._surf.length)this._startSurf();
      if(this._weather==='rain'&&this._environmentActive&&!this._rain)this._startRain();
      if(!this._environmentActive||this._weather!=='rain')this._stopThunders();
      if (!this.enabled || !this._ambience.length) return;
      const now = this.context.currentTime;
      this._elapsed += Math.max(0, Math.min(Number(dt) || 0, 0.25));
      if (this._elapsed < this._nextAmbientUpdate) return;
      this._nextAmbientUpdate = this._elapsed + 0.15;
      this._updateSurf();
      this._ambience.forEach((voice, index) => {
        const base = index ? 0.0035 : 0.005;
        const level = base * (0.84 + 0.16 * Math.sin(this._elapsed * 0.19 + index * 2));
        voice.gain.gain.setTargetAtTime(level, now, 0.6);
      });
    }

    dispose() {
      if (!this.context) return;
      this.setMuted(true);
      if(this._chantSource){try{this._chantSource.stop();}catch(_){}this._chantSource.disconnect();}
      this._chantGain?.disconnect();
      this._chantSource=null;this._chantGain=null;this._chantBuffer=null;
      this._surf.forEach(voice=>{
        try{voice.source.stop();}catch(_){}
        voice.source.disconnect();voice.filter.disconnect();voice.gain.disconnect();
      });
      this._surfGain?.disconnect();this._surf=[];this._surfGain=null;this._surfLevel=null;
      if(this._rain){
        try{this._rain.source.stop();}catch(_){}
        this._rain.source.disconnect();this._rain.high.disconnect();this._rain.low.disconnect();this._rain.gain.disconnect();
      }
      this._rain=null;this._rainLevel=null;
      this._thunders.forEach(voice=>{try{voice.source.stop();}catch(_){}voice.source.disconnect();voice.filter.disconnect();voice.gain.disconnect();});this._thunders.clear();
      this._weatherNoiseBuffer=null;
      this._ambience.forEach(voice => {
        try { voice.oscillator.stop(); } catch (_) { /* already stopped */ }
        voice.oscillator.disconnect();
        voice.gain.disconnect();
      });
      this._ambience = [];
      this._voices.forEach(voice => {
        try { voice.stop(); } catch (_) { /* already stopped */ }
      });
      if (this.context.state !== 'closed') this.context.close().catch(() => {});
    }
  }

  window.TempleAudio = TempleAudio;
})();
;
/* One local planner for rituals and seats. The shared collision contract remains authoritative. */
(function(){'use strict';
 window.TemplePaths={find(from,destination,options){
  const {layout,canStand,canTravel,seatId}=options,inside=p=>p.x>=layout.pathfinding.minX&&p.x<=layout.pathfinding.maxX&&p.z>=layout.pathfinding.minZ&&p.z<=layout.pathfinding.maxZ,B=inside(from)&&inside(destination)?layout.pathfinding:{minX:Math.min(from.x,destination.x)-5,maxX:Math.max(from.x,destination.x)+5,minZ:Math.min(from.z,destination.z)-5,maxZ:Math.max(from.z,destination.z)+5,step:.25},step=B.step;
  const clear=(a,b)=>{const length=Math.hypot(b.x-a.x,b.z-a.z);if(length<=14&&!canTravel(a.x,a.z,b.x,b.z,seatId))return false;const n=Math.max(1,Math.ceil(length/.06));let p=a;for(let i=1;i<=n;i++){const q={x:a.x+(b.x-a.x)*i/n,z:a.z+(b.z-a.z)*i/n};if(!canStand(q.x,q.z,seatId)||!canTravel(p.x,p.z,q.x,q.z,seatId))return false;p=q;}return true;};
  if(clear(from,destination))return[{x:destination.x,z:destination.z}];
  const cols=Math.floor((B.maxX-B.minX)/step)+1,rows=Math.floor((B.maxZ-B.minZ)/step)+1;
  const point=id=>({x:B.minX+(id%cols)*step,z:B.minZ+Math.floor(id/cols)*step});
  function nearest(p){const cx=Math.round((p.x-B.minX)/step),cz=Math.round((p.z-B.minZ)/step);let best=null,dist=Infinity;for(let dx=-2;dx<=2;dx++)for(let dz=-2;dz<=2;dz++){const x=cx+dx,z=cz+dz;if(x<0||z<0||x>=cols||z>=rows)continue;const id=z*cols+x,q=point(id),d=Math.hypot(q.x-p.x,q.z-p.z);if(d<dist&&canStand(q.x,q.z,seatId)&&clear(p,q)){best=id;dist=d;}}return best;}
  const start=nearest(from),goal=nearest(destination);if(start===null||goal===null)return null;
  const heap=[],score=new Float64Array(cols*rows).fill(Infinity),previous=new Int32Array(cols*rows).fill(-1),closed=new Uint8Array(cols*rows),openable=new Int8Array(cols*rows);
  const h=id=>Math.abs(id%cols-goal%cols)+Math.abs(Math.floor(id/cols)-Math.floor(goal/cols));
  function push(id,cost){heap.push({id,cost});let n=heap.length-1;while(n>0){const p=(n-1)>>1;if(heap[p].cost<=cost)break;heap[n]=heap[p];n=p;}heap[n]={id,cost};}
  function pop(){const first=heap[0],last=heap.pop();if(heap.length){let n=0;while(n*2+1<heap.length){let c=n*2+1;if(c+1<heap.length&&heap[c+1].cost<heap[c].cost)c++;if(heap[c].cost>=last.cost)break;heap[n]=heap[c];n=c;}heap[n]=last;}return first.id;}
  score[start]=0;previous[start]=start;push(start,h(start));
  while(heap.length){const id=pop();if(closed[id])continue;closed[id]=1;if(id===goal)break;const x=id%cols,z=Math.floor(id/cols),a=point(id);for(const[dx,dz]of[[0,-1],[1,0],[0,1],[-1,0]]){const nx=x+dx,nz=z+dz;if(nx<0||nz<0||nx>=cols||nz>=rows)continue;const next=nz*cols+nx;if(closed[next])continue;const b=point(next);if(!openable[next])openable[next]=canStand(b.x,b.z,seatId)?1:-1;if(openable[next]<0||!canTravel(a.x,a.z,b.x,b.z,seatId))continue;const g=score[id]+1;if(g>=score[next])continue;score[next]=g;previous[next]=id;push(next,g+h(next));}}
  if(previous[goal]<0)return null;const raw=[];for(let id=goal;id!==start;id=previous[id])raw.push(point(id));raw.push(point(start));raw.reverse();raw.push({x:destination.x,z:destination.z});
  const result=[];let anchor=from;for(let i=0;i<raw.length;){let far=i;for(let j=i+1;j<raw.length&&j<i+60;j++){if(!clear(anchor,raw[j]))break;far=j;}result.push(raw[far]);anchor=raw[far];i=far+1;}return result;
 }};
})();
;
(function () {
  'use strict';
  window.TempleRituals = {
    create({ THREE: T, world, player, audio, blocked, canMove, isAwaitingMovementAck, canStart, onStart, onComplete, onNotice }) {
      let active = null;
      const sticks = [], burner = world.rituals.incense.burner;
      const MAX_GROUPS=16,MAX_STICKS=MAX_GROUPS*3,SMOKE_PER_STICK=2,BURN_SECONDS=120,SMOKE_SECONDS=2.6;
      const slots=new Map(),dummy=new T.Object3D();let effects=null,disposed=false,settled=false;
      function createIncenseEffects(){
        if(effects)return effects;
        const root=new T.Group();root.name='Burning incense in both halls';
        const stems=new T.InstancedMesh(new T.CylinderGeometry(.011,.011,1,6),new T.MeshStandardMaterial({color:0xa77c42,roughness:.94}),MAX_STICKS);
        const embers=new T.InstancedMesh(new T.SphereGeometry(.016,6,4),new T.MeshBasicMaterial({color:0xef994d}),MAX_STICKS);
        stems.name='Incense stems';embers.name='Descending incense embers';
        for(const batch of[stems,embers]){batch.instanceMatrix.setUsage(T.DynamicDrawUsage);batch.frustumCulled=false;batch.count=0;root.add(batch);}
        const geometry=new T.BufferGeometry(),positions=new Float32Array(MAX_STICKS*SMOKE_PER_STICK*3),opacity=new Float32Array(MAX_STICKS*SMOKE_PER_STICK),sizes=new Float32Array(opacity.length);
        for(const [name,array,size]of[['position',positions,3],['aOpacity',opacity,1],['aSize',sizes,1]])geometry.setAttribute(name,new T.BufferAttribute(array,size).setUsage(T.DynamicDrawUsage));
        geometry.setDrawRange(0,0);
        const material=new T.ShaderMaterial({transparent:true,depthWrite:false,toneMapped:false,uniforms:{smokeColor:{value:new T.Color(0xc4c0b5)},pointScale:{value:240}},
          vertexShader:'attribute float aOpacity;attribute float aSize;uniform float pointScale;varying float smokeOpacity;void main(){vec4 view=modelViewMatrix*vec4(position,1.);gl_Position=projectionMatrix*view;gl_PointSize=clamp(aSize*pointScale/max(.1,-view.z),1.,96.);smokeOpacity=aOpacity;}',
          fragmentShader:'uniform vec3 smokeColor;varying float smokeOpacity;void main(){vec2 q=(gl_PointCoord-vec2(.5))*2.;q.x*=1.5;float r=length(q);float alpha=smokeOpacity*pow(max(0.,1.-r*r),1.6);if(alpha<.003)discard;gl_FragColor=vec4(smokeColor,alpha);\n#include <colorspace_fragment>\n}'});
        const smoke=new T.Points(geometry,material);smoke.name='Incense smoke from burning tips';smoke.frustumCulled=false;root.add(smoke);world.scene.add(root);world.smoke?.push(smoke);
        // World-size smoke must follow the actual framebuffer and camera, including
        // low-quality resolution scaling. A fixed 240-pixel factor made it tiny.
        smoke.onBeforeRender=(renderer,scene,camera)=>{material.uniforms.pointScale.value=renderer.domElement.height*.5*camera.projectionMatrix.elements[5];};
        effects={root,stems,embers,smoke,positions,opacity,sizes};return effects;
      }
      // Separate from the walking/ritual state machine: the game updates this
      // during active play even after the offering action has finished.
      function updateIncense(dt=0){
        if(disposed||settled||!sticks.length)return;
        const step=Number.isFinite(dt)?Math.max(0,dt):0,e=createIncenseEffects();let instance=0,particle=0,hasSmoke=false,allExtinguished=true;
        for(const record of sticks){
          record.age+=step;
          if(record.age<BURN_SECONDS+SMOKE_SECONDS)allExtinguished=false;
          const target=record.target,ash=Number.isFinite(target.ashY)?target.ashY:target.y,radius=Number.isFinite(target.ashRadius)?target.ashRadius:.36;
          const ring=Math.min(.18,radius*.48),x=target.x+Math.sin(record.slot*2.4)*ring,z=target.z+Math.cos(record.slot*2.4)*ring*.78;
          const length=.65-.605*Math.min(1,record.age/BURN_SECONDS),base=ash-.025,tip=base+length;
          for(let strand=0;strand<3;strand++){
            const sx=x+(strand-1)*.035;
            dummy.position.set(sx,base+length/2,z);dummy.scale.set(1,length,1);dummy.updateMatrix();e.stems.setMatrixAt(instance,dummy.matrix);
            dummy.position.y=tip;dummy.scale.setScalar(record.age<BURN_SECONDS?1:0);dummy.updateMatrix();e.embers.setMatrixAt(instance++,dummy.matrix);
            for(let puff=0;puff<SMOKE_PER_STICK;puff++){
              const age=(record.age+puff*SMOKE_SECONDS/2+strand*.43+record.slot*.29)%SMOKE_SECONDS,phase=age/SMOKE_SECONDS,birth=record.age-age;
              const live=birth>=0&&birth<BURN_SECONDS;
              e.positions[particle*3]=sx+Math.sin(record.age*.72+strand+record.slot)*phase*.075;
              e.positions[particle*3+1]=tip+.015+phase*.72;
              e.positions[particle*3+2]=z+Math.cos(record.age*.58+puff+record.slot)*phase*.055;
              e.opacity[particle]=live?Math.sin(phase*Math.PI)*.22:0;e.sizes[particle]=.085+phase*.15;
              hasSmoke||=e.opacity[particle]>.003;particle++;
            }
          }
        }
        e.stems.count=e.embers.count=instance;e.stems.instanceMatrix.needsUpdate=e.embers.instanceMatrix.needsUpdate=true;
        e.smoke.geometry.setDrawRange(0,particle);for(const attribute of Object.values(e.smoke.geometry.attributes))attribute.needsUpdate=true;e.smoke.visible=hasSmoke;
        settled=allExtinguished;
      }
      function insertIncense(target=burner) {
        if(disposed||![target.x,target.y,target.z].every(Number.isFinite))return;
        const same=sticks.filter(record=>record.target===target);
        if(same.length>=8)sticks.splice(sticks.indexOf(same[0]),1);
        const slot=slots.get(target)||0;slots.set(target,(slot+1)%8);sticks.push({target,slot,age:0});settled=false;
        if(sticks.length>MAX_GROUPS)sticks.shift();updateIncense(0);
      }
      // A small unweighted grid search follows the same collision predicate as walking.
      function findPath(destination) {
        if(window.TemplePaths)return window.TemplePaths.find(player.root.position,destination,{layout:window.TempleNavigation.templeSceneLayout,canStand:(x,z)=>!blocked(x,z),canTravel:window.TempleNavigation.templeCanTravel});
        const step = .30, cols = 47, rows = 49, ox = -6.9, oz = -5.4;
        const toCell = (x,z) => [Math.max(0,Math.min(cols-1,Math.round((x-ox)/step))),Math.max(0,Math.min(rows-1,Math.round((z-oz)/step)))];
        const [sx,sz] = toCell(player.root.position.x,player.root.position.z), [gx,gz]=toCell(destination.x,destination.z);
        const start=sz*cols+sx, goal=gz*cols+gx;
        const previous=new Int32Array(cols*rows).fill(-1),queue=[start];previous[start]=start;
        for(let q=0;q<queue.length;q++){
          const cell=queue[q];if(cell===goal)break;
          const x=cell%cols,z=Math.floor(cell/cols);
          for(const [dx,dz] of [[0,-1],[1,0],[0,1],[-1,0]]){
            const nx=x+dx,nz=z+dz;if(nx<0||nx>=cols||nz<0||nz>=rows)continue;
            const next=nz*cols+nx;if(previous[next]!==-1||blocked(ox+nx*step,oz+nz*step))continue;
            previous[next]=cell;queue.push(next);
          }
        }
        if(previous[goal]===-1)return null;
        const raw=[];for(let c=goal;c!==start;c=previous[c])raw.push({x:ox+(c%cols)*step,z:oz+Math.floor(c/cols)*step});raw.reverse();
        const path=[];
        for(let i=0;i<raw.length;i++){
          const a=raw[i-1],b=raw[i],c=raw[i+1];
          if(!a||!c||Math.abs((b.x-a.x)*(c.z-b.z)-(b.z-a.z)*(c.x-b.x))>.001)path.push(b);
        }
        path.push({x:destination.x,z:destination.z});return path;
      }
      function start(kind,site='hall') {
        if(disposed||active||!canStart(kind,site)||!world.rituals[kind])return false;
        const data=kind==='incense'&&site==='wealth'?world.rituals.wealthIncense:world.rituals[kind];
        if(!data)return false;
        const path=findPath(data);
        if(!path){onNotice('暂时走不过去，请稍微挪开后再试');return false;}
        active={kind,site,stage:'walking',path,index:0,time:0,strikes:0,inserted:false,burner:data.burner||burner};
        onStart(kind);return true;
      }
      function update(dt,clock) {
        if(!active)return;
        const a=active;
        if(a.stage==='walking'){
          const target=a.path[a.index],p=player.root.position;
          if(!target){a.awaitingMovementAck=false;a.stage='acting';a.time=0;player.root.rotation.y=Math.PI;audio&&audio.bell('start');return;}
          const dx=target.x-p.x,dz=target.z-p.z,d=Math.hypot(dx,dz),travel=Math.min(d,dt*2.35);
          if(d>.005){const nx=p.x+dx/d*travel,nz=p.z+dz/d*travel;if(canMove&&!canMove(nx,nz)){if(isAwaitingMovementAck?.(nx,nz)===true){a.awaitingMovementAck=true;player.hideProps();player.pose(clock,false);return;}cancel();onNotice('暂时走不过去，请稍微挪开后再试');return;}a.awaitingMovementAck=false;p.x=nx;p.z=nz;const facing=Math.atan2(dx,dz);player.root.rotation.y+=Math.atan2(Math.sin(facing-player.root.rotation.y),Math.cos(facing-player.root.rotation.y))*Math.min(1,dt*12);}
          if(d<.07)a.index++;
          player.hideProps();player.pose(clock,true);return;
        }
        a.time+=dt;
        const duration=a.kind==='woodfish'?7.2:5.8,progress=Math.min(1,a.time/duration);
        player.root.rotation.y=Math.PI;
        player.ritualPose(a.time,a.kind,progress);
        if(a.kind==='woodfish'){
          const expected=Math.min(8,Math.max(0,Math.floor((a.time-.4)/.8)+1));
          if(expected>a.strikes){a.strikes=expected;audio&&audio.knock&&audio.knock();}
          const beat=(a.time%.8)/.8;
          world.rituals.woodfish.mesh.scale.y=1-Math.max(0,1-Math.abs(beat-.5)*16)*.035;
        }else if(progress>=.63&&!a.inserted){a.inserted=true;insertIncense(a.burner);audio&&audio.incense&&audio.incense();}
        if(progress>=1){const kind=a.kind;active=null;player.hideProps();world.rituals.woodfish.mesh.scale.y=1;onComplete(kind);}
      }
      function cancel(){active=null;player.hideProps();world.rituals.woodfish.mesh.scale.y=1;}
      function dispose(){if(disposed)return;disposed=true;active=null;sticks.length=0;slots.clear();if(!effects)return;effects.root.removeFromParent();if(world.smoke){const i=world.smoke.indexOf(effects.smoke);if(i>=0)world.smoke.splice(i,1);}for(const item of[effects.stems,effects.embers,effects.smoke]){item.dispose?.();item.geometry.dispose();item.material.dispose();}}
      function incenseDiagnostics(){return{groups:sticks.length,burningGroups:sticks.filter(s=>s.age<BURN_SECONDS).length,burnSeconds:BURN_SECONDS,batches:effects?3:0,particleCapacity:MAX_STICKS*SMOKE_PER_STICK,particles:effects?.smoke.geometry.drawRange.count||0,disposed};}
      return {start,update,cancel,insertIncense,updateIncense,dispose,incenseDiagnostics,get active(){return active;},get action(){return active?(active.stage==='walking'?'walk':active.kind):'idle';},get progress(){return active&&active.stage==='acting'?Math.min(1,active.time/(active.kind==='woodfish'?7.2:5.8)):0;},get inserted(){return sticks.length;}};
    }
  };
})();
;
(function(){'use strict';
 // Keep unacknowledged turns; a delayed HTTP reply must not stop local input.
 window.TempleMovementTrail={create(canTravel){
  let anchor={x:0,z:0,seq:0},points=[],next=0,sent=0;
  const same=(a,b)=>Math.hypot(a.x-b.x,a.z-b.z)<1e-7;
  function reset(p,seq=0){anchor={x:p.x,z:p.z,seq};points=[];next=sent=seq;}
  function record(p){
   const tail=points.at(-1)||anchor;if(same(tail,p))return tail.seq;
   const before=points.length>1?points.at(-2):anchor;
   if(points.length&&tail.seq>sent&&Math.hypot(p.x-before.x,p.z-before.z)<=1&&canTravel(before,p)){
    tail.x=p.x;tail.z=p.z;return tail.seq;
   }
   points.push({x:p.x,z:p.z,seq:++next});return next;
  }
  function acknowledge(p,seq){
   if(!Number.isSafeInteger(seq)||seq<anchor.seq)return;
   anchor={x:p.x,z:p.z,seq};points=points.filter(q=>q.seq>seq);next=Math.max(next,seq);sent=Math.max(sent,seq);
  }
  function packet(through=next){const result=points.filter(p=>p.seq<=through).map(p=>({...p}));if(result.length)sent=Math.max(sent,result.at(-1).seq);return result;}
  function canAdvance(p){
   if(points.length>=240)return false;
   let total=0,from=anchor;for(const to of points){total+=Math.hypot(to.x-from.x,to.z-from.z);from=to;}
   return total+Math.hypot(p.x-from.x,p.z-from.z)<55;
  }
  return{reset,record,acknowledge,packet,canAdvance,get sequence(){return next;},get size(){return points.length;}};
 }};
})();
;
/* Same-origin room synchronisation. Players and saved merit come from the server. */
(function () {
  'use strict';
  const CALLBACKS = ['onWelcome', 'onJoined', 'onLeft', 'onSnapshot', 'onChat', 'onPresence', 'onReward', 'onStatus', 'onError', 'onProfile', 'onSeats', 'onMotion'];
  const ACTIONS = new Set(['idle', 'walk', 'run', 'jump', 'sit', 'lie', 'greet', 'pray', 'woodfish', 'incense', 'read', 'tea']);
  const RITUALS = new Set(['pray', 'woodfish', 'incense']);
  const VISITOR_KEY = 'quiet-temple-visitor-v1';
  const SAVE_KEY = window.TEMPLE_CONFIG?.multiplayer ? 'quiet-temple-rooms-v1' : 'quiet-temple-v1';
  const record = value => value !== null && typeof value === 'object' && !Array.isArray(value);
  const finite = Number.isFinite;
  const text = (value, maximum) => typeof value === 'string' ? Array.from(value).slice(0, maximum).join('') : '';
  const cleanText = value => text(value, 40).replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, '').trim();
  const randomId = () => typeof crypto.randomUUID === 'function' ? crypto.randomUUID() : Array.from(crypto.getRandomValues(new Uint8Array(24)), n => n.toString(16).padStart(2, '0')).join('');
  const wardrobeIds = new Set(['lotus', 'vermilion', 'moss', 'moon', 'cloud', 'saffron', 'plum', 'tide', 'golden']);
  const robeMilestones = new Set([60,100,200,600,1200,10000]);
  const equippedId = id => wardrobeIds.has(id) ? id : 'lotus';
  const gearItems={feet:['original','hemp','indigo'],neck:['none','sandal','gold'],waist:['none','pouch','jade']};
  function cleanGear(raw,goldBeads){
    const result={feet:'original',neck:goldBeads?'gold':'none',waist:'none'};
    if(record(raw))for(const [slot,items] of Object.entries(gearItems))if(items.includes(raw[slot]))result[slot]=raw[slot];
    return result;
  }
  function cleanGearUnlocked(raw){
    return Object.fromEntries(Object.entries(gearItems).map(([slot,items])=>[slot,
      items.filter((item,index)=>!index||Array.isArray(raw?.[slot])&&raw[slot].includes(item))
    ]));
  }
  function cleanAppearance(value) {
    const p = record(value) ? value : {}, result = { name: text(p.name, 16) || '随喜香客' };
    for (const key of ['robe', 'sash', 'skin']) if (typeof p[key] === 'string' && /^#[0-9a-f]{6}$/i.test(p[key])) result[key] = p[key];
    result.outfitId=equippedId(p.outfitId);
    result.gear=cleanGear(p.gear,p.goldBeads===true);
    result.goldBeads=result.gear.neck==='gold';
    return result;
  }
  function cleanStats(value) {
    if (!record(value)) return null;
    const result = {};
    for (const key of ['merit', 'count', 'incense', 'practice', 'offerings']) {
      if (!Number.isSafeInteger(value[key]) || value[key] < 0) return null;
      result[key] = value[key];
    }
    return result;
  }
  function cleanPlayer(value) {
    if (!record(value) || !text(value.id, 100) || !finite(value.x) || !finite(value.z)) return null;
    return { id: text(value.id, 100), ...cleanAppearance(value), x: value.x, z: value.z,
      yaw: finite(value.yaw) ? value.yaw : Math.PI,
      action: ACTIONS.has(value.action) ? value.action : 'idle',
      progress: finite(value.progress) ? Math.max(0, Math.min(1, value.progress)) : 0 };
  }
  function state(value) {
    if (!record(value) || !finite(value.x) || !finite(value.z) || !finite(value.yaw) || !ACTIONS.has(value.action)) return null;
    return { x: value.x, z: value.z, yaw: Math.atan2(Math.sin(value.yaw), Math.cos(value.yaw)), action: value.action,
      progress: finite(value.progress) ? Math.max(0, Math.min(1, value.progress)) : 0 };
  }

  class TempleNetwork {
    constructor(callbacks = {}) {
      this._callbacks = {};
      for (const name of CALLBACKS) if (typeof callbacks[name] === 'function') this._callbacks[name] = callbacks[name];
      this._status = { connected: false, connecting: false, id: null, room: null, online: null, rooms: null,
        error: null, pendingComplete: false, transport: 'http', persistent: true, storageAvailable: true };
      this._visitorId = null;
      try {
        const existing = localStorage.getItem(VISITOR_KEY);
        this._visitorId = existing && /^[a-zA-Z0-9_-]{20,80}$/.test(existing) ? existing : randomId();
        localStorage.setItem(VISITOR_KEY, this._visitorId);
      } catch (_) { this._visitorId = randomId(); this._status.storageAvailable = false; }
      this._manual = true; this._generation = 0; this._timer = null; this._controller = null; this._inFlight = false;
      this._session = null; this._resumeSession = null; this._appearance = {}; this._room = 'auto'; this._state = null;
      this._actionStates = new Map(); this._operations = []; this._players = new Map(); this._stats = null;
      this._cursor = 0; this._failureCount = 0; this._welcomed = false; this._lastStarted = -Infinity;
      this._lastChatEnqueued = -Infinity;
      this._profileSnapshot='';this._blessingAcks=new Set();
      this._seatPromises=new Map();
      this._movementProtocol=false;this._heldSeatId=null;
      this._poseSocket=null;this._poseReady=false;this._poseSeq=0;this._poseLastSent=0;this._poseLastState=null;this._poseReconnectTimer=null;this._poseRetry=0;
      this._lastAcknowledged=-Infinity;
      this._trail=window.TempleMovementTrail?.create((a,b)=>window.TempleNavigation?.templeCanTravel(a.x,a.z,b.x,b.z,this._heldSeatId))||null;
    }
    get canRoam(){return !this._manual&&!!this._session&&(this._status.connected||(this._movementProtocol&&performance.now()-this._lastAcknowledged<12000));}
    get status() { return { ...this._status, canRoam:this.canRoam, movementPrediction:this._movementProtocol, pendingWaypoints:this._trail?.size||0,seatReleasePending:this._operations.some(o=>o.kind==='seat'&&o.release),acknowledgementAgeMs:Number.isFinite(this._lastAcknowledged)?Math.round(performance.now()-this._lastAcknowledged):null }; }
    _emit(name, message) {
      try { this._callbacks[name]?.(message); } catch (error) { console.error('TempleNetwork callback failed:', name, error); }
    }
    _statusChanged() { this._status.pendingComplete = this._operations.some(op => op.kind === 'complete'); this._emit('onStatus', this.status); }
    _publishProfile(result,force=false){
      const p=result.profile;
      if(!record(p)||typeof p.dharmaName!=='string'||!Array.isArray(p.unlocked)||!Array.isArray(p.blessings))return;
      const profile={dharmaName:text(p.dharmaName,8),merit:Number.isSafeInteger(p.merit)?p.merit:0,
        gearAvailable:p.gearAvailable===true,gear:cleanGear(p.gear,p.beadsEquipped),gearUnlocked:cleanGearUnlocked(p.gearUnlocked),
        perksAvailable:p.perksAvailable!==false&&typeof p.beadsUnlocked==='boolean',beadsUnlocked:p.beadsUnlocked===true,beadsEquipped:p.beadsEquipped===true,
        beadBows:Number.isSafeInteger(p.beadBows)?Math.max(0,Math.min(3,p.beadBows)):0,
        dailyPetals:Number.isSafeInteger(p.dailyPetals)&&p.dailyPetals>=0?p.dailyPetals:0,
        unlocked:[...new Set(['lotus',...p.unlocked.filter(id=>wardrobeIds.has(id))])],equipped:equippedId(p.equipped),
        nextThreshold:robeMilestones.has(p.nextThreshold)?p.nextThreshold:null,
        blessings:p.blessings.filter(n=>robeMilestones.has(n)),renameRemaining:p.renameRemaining===1?1:0};
      if(record(p.baseColors)){
        const base=cleanAppearance(p.baseColors);
        if(base.robe&&base.sash)profile.baseColors={robe:base.robe,sash:base.sash};
      }
      const appearance=cleanAppearance(result.appearance);appearance.outfitId=profile.equipped;
      const snapshot=JSON.stringify({profile,appearance});
      if(force||snapshot!==this._profileSnapshot){this._profileSnapshot=snapshot;this._emit('onProfile',{profile,appearance});}
    }
    _readSeed() {
      try {
        const p = JSON.parse(localStorage.getItem(SAVE_KEY) || 'null');
        if (!record(p)) return undefined;
        const number = key => Number.isSafeInteger(p[key]) && p[key] >= 0 ? p[key] : 0;
        return { count: number('count'), practice: number('practice'), offerings: number('offerings'),
          merit: number('merit'), incense: number('incense') };
      } catch (_) { return undefined; }
    }
    connect(identity, room = 'auto') {
      this.disconnect();
      if (!/^https?:$/.test(location.protocol)) {
        this._status.error = '当前是离线文件模式'; this._statusChanged(); return false;
      }
      this._appearance = cleanAppearance(identity);
      this._room = typeof room === 'string' && /^(?:auto|[a-zA-Z0-9_-]{1,32})$/.test(room) ? room : 'auto';
      this._manual = false; this._session = null; this._state = null; this._actionStates.clear();
      this._operations = []; this._players.clear(); this._cursor = 0; this._failureCount = 0;
      this._status.connecting = true; this._status.error = null; this._statusChanged();
      this._join(this._generation); return true;
    }
    async _request(route, data, generation) {
      const controller = new AbortController(); this._controller = controller;
      const timeout = setTimeout(() => controller.abort(), 8000);
      try {
        const response = await fetch(new URL(route, window.TEMPLE_CONFIG.roomOrigin), { method: 'POST', credentials: 'omit', cache: 'no-store',
          headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data), signal: controller.signal });
        const raw = await response.text();
        if (raw.length > 200000) throw new Error('服务器消息过大');
        let result;
        try { result = JSON.parse(raw); } catch (_) { throw new Error('服务器响应格式无效'); }
        if (!record(result)) throw new Error('服务器响应格式无效');
        if (!response.ok) {
          const error = new Error(text(result.message || result.error?.message, 240) || '连接暂时不可用');
          error.status = response.status; error.code = result.code || result.error?.code; throw error;
        }
        if (generation !== this._generation || this._manual) return null;
        return result;
      } finally { clearTimeout(timeout); if (this._controller === controller) this._controller = null; }
    }
    async _join(generation) {
      if (this._manual || generation !== this._generation || this._inFlight) return;
      this._inFlight = true;
      try {
        const seedStats = this._readSeed(), resumeSession=this._resumeSession;
        const result = await this._request('/api/join', { visitorId: this._visitorId, room: this._room,
          ...this._appearance, ...(seedStats ? { seedStats } : {}), ...(resumeSession?{resumeSession}:{}) }, generation);
        if (!result) return;
        const saved = cleanStats(result.stats);
        if (typeof result.id !== 'string' || typeof result.token !== 'string' || typeof result.room !== 'string' || !saved || !Array.isArray(result.players)) throw new Error('入场信息不完整');
        this._session = { id: text(result.id, 100), token: result.token };
        this._resumeSession=null;
        this._cursor = typeof result.sinceCursor === 'string' || finite(result.sinceCursor) ? result.sinceCursor : 0;
        this._stats = saved; this._failureCount = 0;
        this._status = { ...this._status, connected: true, connecting: false, id: this._session.id, room: text(result.room, 64), error: null };
        if (Number.isSafeInteger(result.online) && result.online >= 0) this._status.online = result.online;
        if (Number.isSafeInteger(result.rooms) && result.rooms >= 0) this._status.rooms = result.rooms;
        const players = result.players.slice(0, 50).map(cleanPlayer).filter(Boolean);
        this._players = new Map(players.map(p => [p.id, p]));
        const own = this._players.get(this._session.id); if (own) this._state = state(own);this._confirmedState=own?state(own):null;this._inFlightState=null;this._uncertainStates=[];
        this._movementProtocol=result.movementProtocol===1&&!!this._trail;this._heldSeatId=null;
        this._lastAcknowledged=performance.now();
        if(own)this._trail?.reset(own,result.players.find(p=>p.id===this._session.id)?.moveSeq||0);
        const reconnected = this._welcomed; this._welcomed = true;
        this._emit('onWelcome', { type: 'welcome', id: this._session.id, room: this._status.room, players, stats: { ...saved },
          capacity: 50, statsScope: 'persistent', reconnected, resumedPosition:!!resumeSession&&result.resumedPosition===true, cumulative: true, online: this._status.online, rooms: this._status.rooms });
        this._openPoseStream(generation);
        this._publishProfile(result,true);
        this._statusChanged();
      } catch (error) { this._failed(error, generation); }
      finally {
        if (generation === this._generation) this._inFlight = false;
        if (!this._manual && generation === this._generation) this._schedule(this._failureCount ? this._retryDelay() : 500, generation);
      }
    }
    _openPoseStream(generation) {
      if (this._manual || generation !== this._generation || !this._session || !this._status.room || typeof WebSocket === 'undefined') return;
      if (this._poseSocket && (this._poseSocket.readyState === WebSocket.CONNECTING || this._poseSocket.readyState === WebSocket.OPEN)) return;
      clearTimeout(this._poseReconnectTimer); this._poseReconnectTimer = null;
      let endpoint;
      try {
        endpoint = new URL('/api/pose-stream', window.TEMPLE_CONFIG.roomOrigin);
        endpoint.protocol = endpoint.protocol === 'https:' ? 'wss:' : 'ws:';
        endpoint.searchParams.set('room', this._status.room);
      } catch (error) {
        console.warn('Temple realtime endpoint unavailable:', error);
        return;
      }
      const socket = new WebSocket(endpoint.href);
      this._poseSocket = socket; this._poseReady = false; this._poseLastState = null;
      socket.addEventListener('open', () => {
        if (this._manual || generation !== this._generation || this._poseSocket !== socket || !this._session) {
          socket.close(1000, 'Session changed'); return;
        }
        try {
          socket.send(JSON.stringify({type:'auth', id:this._session.id, token:this._session.token, motionProtocol:1}));
        } catch (_) { socket.close(); }
      });
      socket.addEventListener('message', event => {
        if (this._manual || generation !== this._generation || this._poseSocket !== socket) return;
        let data;
        try { data = JSON.parse(event.data); } catch (_) { return; }
        if (!record(data)) return;
        if (data.type === 'ready') {
          if (data.motionProtocol !== 1) { socket.close(1008, 'Unsupported motion protocol'); return; }
          this._poseReady = true; this._poseRetry = 0;
          if (Number.isSafeInteger(data.minSeq)) this._poseSeq = Math.max(this._poseSeq, data.minSeq);
          this._status.transport = 'websocket+http'; this._statusChanged();
          this._sendPose(true);
          return;
        }
        if (data.type === 'motion') {
          if (typeof data.id !== 'string' || !finite(data.x) || !finite(data.z) || !finite(data.yaw) ||
              !['idle','walk','run','lie'].includes(data.action)) return;
          this._emit('onMotion', data);
        } else if (data.type === 'pose' && typeof data.id === 'string' && typeof data.lying === 'boolean') {
          this._emit('onMotion', data);
        }
      });
      socket.addEventListener('close', () => {
        if (this._poseSocket !== socket) return;
        this._poseSocket = null; this._poseReady = false;
        this._status.transport = 'http'; this._statusChanged();
        if (this._manual || generation !== this._generation || !this._session) return;
        const delay = Math.min(5000, 500 * Math.pow(2, Math.min(this._poseRetry++, 4)));
        clearTimeout(this._poseReconnectTimer);
        this._poseReconnectTimer = setTimeout(() => {
          this._poseReconnectTimer = null;
          this._openPoseStream(generation);
        }, delay);
      });
      socket.addEventListener('error', () => {
        try { socket.close(); } catch (_) {}
      });
    }
    _sendPose(force=false) {
      const socket = this._poseSocket, current = this._state;
      if (!this._poseReady || !socket || socket.readyState !== WebSocket.OPEN || !current ||
          !['idle','walk','run','lie'].includes(current.action)) return false;
      const now = performance.now(), previous = this._poseLastState;
      const actionChanged = !previous || previous.action !== current.action;
      const moved = !previous || Math.hypot(current.x-previous.x,current.z-previous.z) >= .018;
      const turned = !previous || Math.abs(Math.atan2(Math.sin(current.yaw-previous.yaw),Math.cos(current.yaw-previous.yaw))) >= .025;
      if (!force && !actionChanged && !moved && !turned) return false;
      if (!force && !actionChanged && now-this._poseLastSent < 50) return false;
      const seq = ++this._poseSeq;
      try {
        socket.send(JSON.stringify({type:'motion',seq,x:current.x,z:current.z,yaw:current.yaw,action:current.action,
          ...(Number.isSafeInteger(current._moveSeq)?{moveSeq:current._moveSeq}:{})}));
        this._poseLastSent = now;
        this._poseLastState = {x:current.x,z:current.z,yaw:current.yaw,action:current.action};
        return true;
      } catch (_) {
        try { socket.close(); } catch (_) {}
        return false;
      }
    }
    _closePoseStream() {
      clearTimeout(this._poseReconnectTimer); this._poseReconnectTimer = null;
      const socket = this._poseSocket;
      this._poseSocket = null; this._poseReady = false; this._poseLastState = null;
      this._status.transport = 'http';
      if (socket && socket.readyState < WebSocket.CLOSING) {
        try { socket.close(1000, 'Client disconnected'); } catch (_) {}
      }
    }
    _retryDelay() { return Math.min(10000, 500 * Math.pow(2, Math.min(this._failureCount, 5))); }
    _failed(error, generation) {
      if (this._manual || generation !== this._generation) return;
      if(this._inFlightState){this._uncertainStates??=[];if(!this._uncertainStates.some(p=>p.x===this._inFlightState.x&&p.z===this._inFlightState.z))this._uncertainStates.push({...this._inFlightState});}
      this._failureCount++;
      this._status.connected = false; this._status.connecting = true;
      this._status.error = error?.message || '连接中断，正在恢复；累计功德不会清零';
      if (error?.status === 401 || error?.status === 404 || error?.code === 'expired_session') {
        this._closePoseStream();
        if(this._session)this._resumeSession={...this._session};
        this._session = null;
        // The durable balance is recovered by join; an unconfirmed ritual cannot be resumed in a new session.
        this._operations = this._operations.filter(op => op.kind !== 'complete');
      }
      this._statusChanged();
    }
    _schedule(delay, generation = this._generation) {
      clearTimeout(this._timer);
      this._timer = setTimeout(() => {
        this._timer = null;
        if (this._manual || generation !== this._generation) return;
        if (this._session) this._poll(generation); else this._join(generation);
      }, Math.max(0, delay));
    }
    async _poll(generation) {
      if (this._manual || generation !== this._generation || this._inFlight || !this._session) return;
      this._inFlight = true; this._lastStarted = performance.now();
      const now = Date.now();
      const pendingComplete = this._operations.find(op => op.kind === 'complete');
      const completing = pendingComplete && pendingComplete.notBefore <= now ? pendingComplete : null;
      const chatting = this._operations.find(op => op.kind === 'chat' && op.notBefore <= now);
      const outgoing = { ...this._session, sinceCursor: this._cursor };
      const current = pendingComplete?.actionState || this._state;
      if (current) outgoing.state = { ...current };
      if(current&&this._movementProtocol)outgoing.movement=this._trail.packet(current._moveSeq);
      if (chatting) outgoing.chat = { opId: chatting.opId, text: chatting.text };
      if (completing) outgoing.complete = { opId: completing.opId, action: completing.action };
      const gear=this._operations.find(op=>op.kind==='gear'&&op.notBefore<=now);
      if(gear)outgoing.gear={opId:gear.opId,slot:gear.slot,item:gear.item};
      const beads=this._operations.find(op=>op.kind==='beads'&&op.notBefore<=now);
      if(beads)outgoing.beads={opId:beads.opId,equipped:beads.equipped};
      for(const kind of ['equip','rename']){const op=this._operations.find(o=>o.kind===kind&&o.notBefore<=now);if(op)outgoing[kind]=kind==='equip'?{opId:op.opId,outfitId:op.outfitId}:{opId:op.opId,name:op.name};}
      const seating=this._operations.find(o=>o.kind==='seat'&&o.notBefore<=now);if(seating)outgoing.seat={opId:seating.opId,seatId:seating.seatId,...(seating.release?{release:true}:{})};
      const blessingAcks=[...this._blessingAcks];if(blessingAcks.length)outgoing.ackBlessings=blessingAcks;
      this._inFlightState=outgoing.state?{...outgoing.state}:null;
      try {
        const result = await this._request('/api/sync', outgoing, generation);
        if (!result) return;
        this._lastAcknowledged=performance.now();
        this._failureCount = 0; this._status.connected = true; this._status.connecting = false; this._status.error = null;
        const acks = Array.isArray(result.acks) ? result.acks.filter(id => typeof id === 'string') : [];
        const responseErrors = Array.isArray(result.errors) ? result.errors : [];
        const confirmed=Array.isArray(result.players)?result.players.find(p=>p.id===this._session?.id):null;
        const accepted=confirmed?state(confirmed):null;
        if(accepted){this._confirmedState=accepted;this._uncertainStates=[];
          if(this._movementProtocol){
            if(responseErrors.some(e=>['invalid_state','speed'].includes(e?.code))){this._trail.reset(accepted,confirmed.moveSeq||0);this._state={...accepted,_moveSeq:this._trail.sequence};}
            else this._trail.acknowledge(accepted,confirmed.moveSeq);
          }
        }
        else if(!responseErrors.some(e=>['invalid_state','speed','wrong_place','seat_required','busy'].includes(e?.code))&&outgoing.state)this._confirmedState={...outgoing.state};
        if(seating&&acks.includes(seating.opId)&&!responseErrors.some(e=>e.opId===seating.opId))this._heldSeatId=seating.release?null:seating.seatId;
        for(const [id,resolve]of this._seatPromises){if(acks.includes(id)){resolve(true);this._seatPromises.delete(id);}else if(responseErrors.some(e=>e.opId===id&&!e.retryable)){resolve(false);this._seatPromises.delete(id);}}
        if(Array.isArray(result.seats))this._emit('onSeats',result.seats.filter(s=>record(s)&&typeof s.id==='string'&&typeof s.sessionId==='string'));
        const completedAction = completing && acks.includes(completing.opId) && !responseErrors.some(error => error?.opId === completing.opId) ? completing.action : null;
        const profileOperationAcked=this._operations.some(op=>['equip','rename','beads','gear'].includes(op.kind)&&acks.includes(op.opId));
        this._operations = this._operations.filter(op => !acks.includes(op.opId));
        for (const error of responseErrors) {
          if (!record(error)) continue;
          const op = this._operations.find(item => item.opId === error.opId);
          if (op && error.retryable === true) { op.notBefore = Date.now() + 600; continue; }
          if (op) this._operations = this._operations.filter(item => item !== op);
          this._emit('onError', { type: 'error', code: text(error.code, 64), message: text(error.message, 240) || '这次操作未完成，请稍后重试', ...(['invalid_state','speed'].includes(error.code)&&accepted?{confirmed:accepted}:record(error.confirmed)?{confirmed:error.confirmed}:{}) });
        }
        if (Array.isArray(result.players)) {
          const players = result.players.slice(0, 50).map(cleanPlayer).filter(Boolean);
          const next = new Map(players.map(p => [p.id, p]));
          for (const p of players) if (!this._players.has(p.id) && p.id !== this._status.id) this._emit('onJoined', { type: 'joined', player: p });
          for (const id of this._players.keys()) if (!next.has(id) && id !== this._status.id) this._emit('onLeft', { type: 'left', id });
          this._players = next; this._emit('onSnapshot', { type: 'snapshot', players, delta: false });
        }
        for (const chat of Array.isArray(result.chats) ? result.chats.slice(0, 100) : []) {
          if (record(chat) && typeof chat.id === 'string') this._emit('onChat', { type: 'chat', id: text(chat.id, 100), text: cleanText(chat.text) });
        }
        if (typeof result.sinceCursor === 'string' || finite(result.sinceCursor)) this._cursor = result.sinceCursor;
        const saved = cleanStats(result.stats);
        if (saved && (completedAction || JSON.stringify(saved) !== JSON.stringify(this._stats))) {
          this._stats = saved; this._emit('onReward', { type: 'reward', stats: { ...saved }, action: completedAction, silent: !completedAction, statsScope: 'persistent' });
        }
        if (Number.isSafeInteger(result.online) && result.online >= 0) this._status.online = result.online;
        if (Number.isSafeInteger(result.rooms) && result.rooms >= 0) this._status.rooms = result.rooms;
        if(record(result.profile)&&Array.isArray(result.profile.blessings))for(const n of blessingAcks)if(!result.profile.blessings.includes(n))this._blessingAcks.delete(n);
        this._publishProfile(result,profileOperationAcked);
        this._emit('onPresence', { type: 'presence', online: this._status.online, rooms: this._status.rooms, scope: 'shared_database' });
        this._statusChanged();
      } catch (error) { this._failed(error, generation); }
      finally {
        if (generation === this._generation){this._inFlight = false;this._inFlightState=null;}
        if (!this._manual && generation === this._generation) {
          const interval = document.hidden ? 10000 : 500;
          this._schedule(this._failureCount ? this._retryDelay() : Math.max(0, interval - (performance.now() - this._lastStarted)), generation);
        }
      }
    }
    // Gate turns against every position the server may currently accept. This
    // preserves the server's segment collision rule across a curved local path.
    get movementAnchors(){return[this._confirmedState,this._inFlightState,...(this._uncertainStates||[])].filter(Boolean).map(p=>({x:p.x,z:p.z}));}
    get predictsMovement(){return this._movementProtocol;}
    canAdvance(x,z){return !this._movementProtocol||this._trail.canAdvance({x,z});}
    sendState(value) {
      const current = state(value); if (!current || this._manual) return false;
      if(this._movementProtocol)current._moveSeq=this._trail.record(current);
      this._state = current; if (RITUALS.has(current.action)) this._actionStates.set(current.action, { ...current });
      this._sendPose(false);
      return this._status.connected;
    }
    sendChat(value) {
      const content = cleanText(value);
      if (!content || !this._status.connected || this._operations.filter(op => op.kind === 'chat').length >= 4) return false;
      if (Date.now() - this._lastChatEnqueued < 2000) return false;
      this._lastChatEnqueued = Date.now();
      this._operations.push({ kind: 'chat', opId: randomId(), text: content, notBefore: Date.now() });
      return true;
    }
    equip(outfitId){
      if(!this._status.connected||!wardrobeIds.has(outfitId)||this._operations.some(op=>['equip','rename'].includes(op.kind)))return false;
      this._operations.push({kind:'equip',opId:randomId(),outfitId,notBefore:Date.now()});return true;
    }
    setGear(slot,item){
      if(!this._status.connected||!Object.hasOwn(gearItems,slot)||!gearItems[slot].includes(item))return false;
      if(this._operations.some(op=>op.kind==='gear'||slot==='neck'&&op.kind==='beads'))return false;
      this._operations.push({kind:'gear',opId:randomId(),slot,item,notBefore:Date.now()});
      return true;
    }
    setGoldBeads(equipped){
      if(typeof equipped!=='boolean'||!this._status.connected||this._operations.some(op=>op.kind==='beads'||op.kind==='gear'&&op.slot==='neck'))return false;
      this._operations.push({kind:'beads',opId:randomId(),equipped,notBefore:Date.now()});
      return true;
    }
    rename(name){
      if(!this._status.connected||typeof name!=='string'||Array.from(name).length!==2||!/^\p{Script=Han}{2}$/u.test(name)||this._operations.some(op=>['equip','rename'].includes(op.kind)))return false;
      this._operations.push({kind:'rename',opId:randomId(),name,notBefore:Date.now()});return true;
    }
    acknowledgeBlessings(thresholds){for(const n of thresholds||[])if(n===1000||robeMilestones.has(n))this._blessingAcks.add(n);}
    requestSeat(seatId,release=false){
      if(!this._status.connected||this._manual)return Promise.resolve(false);
      if(seatId===null&&this._operations.some(o=>o.kind==='seat'&&o.seatId===null))return Promise.resolve(true);
      const opId=randomId();return new Promise(resolve=>{const timer=setTimeout(()=>{if(!this._seatPromises.has(opId))return;this._seatPromises.delete(opId);this._operations=this._operations.filter(o=>o.opId!==opId);resolve(false);},12000);this._seatPromises.set(opId,value=>{clearTimeout(timer);resolve(value);});this._operations.push({kind:'seat',opId,seatId,release,notBefore:Date.now()});});
    }
    releaseSeat(id=null){return this.requestSeat(id,true);}
    complete(action = 'pray') {
      // A ritual that finishes during a transient outage remains an unconfirmed
      // operation on its existing session. Reconnection must not silently drop it.
      if (!RITUALS.has(action) || this._manual || !this._session) return false;
      if (this._operations.some(op => op.kind === 'complete')) return false;
      const actionState = this._actionStates.get(action);
      if (!actionState) return false;
      // Keep the ritual endpoint immutable while the player walks away before acknowledgement.
      if(this._movementProtocol)this._trail.packet(actionState._moveSeq);
      this._operations.push({ kind: 'complete', opId: randomId(), action, actionState: { ...actionState }, notBefore: Date.now() });
      this._statusChanged(); return true;
    }
    disconnect() {
      this._closePoseStream();
      for(const resolve of this._seatPromises?.values()||[])resolve(false);this._seatPromises?.clear();
      const previous = this._session;
      this._manual = true; this._generation++; clearTimeout(this._timer); this._timer = null;
      this._controller?.abort(); this._controller = null; this._inFlight = false;
      this._session = null; this._resumeSession = null; this._operations = []; this._players.clear();
      this._status.connected = false; this._status.connecting = false; this._status.id = null; this._status.pendingComplete = false;
      if (previous) {
        fetch(new URL('/api/leave', window.TEMPLE_CONFIG.roomOrigin), {method:'POST', credentials:'omit', keepalive:true, headers:{'Content-Type':'application/json'}, body:JSON.stringify(previous)}).catch(()=>{});
      }
      this._statusChanged();
    }
  }
  window.TempleNetwork = TempleNetwork;
})();
;
/* A private fitting-room actor. The player's island actor and save remain separate. */
(function () {
  'use strict';
  window.TempleRobeFitting = function (T, stage) {
    const renderer = new T.WebGLRenderer({alpha: true, antialias: true, powerPreference: 'low-power'});
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.4));
    renderer.setClearColor(0x000000, 0);
    const canvas = renderer.domElement;
    canvas.setAttribute('aria-hidden', 'true');
    stage.append(canvas);
    const scene = new T.Scene();
    const camera = new T.PerspectiveCamera(31, 1, .05, 16);
    const fill = new T.HemisphereLight(0xfff5e3, 0xbdb3a4, 1.85);
    const key = new T.DirectionalLight(0xffecd3, 2.3);
    key.position.set(-2, 3, 3);
    const rim = new T.DirectionalLight(0xc7dae1, 1.15);
    rim.position.set(2, 2, -2);
    scene.add(fill, key, rim);
    let actor, walking = false, yaw = -.18, clock = 0, accumulator = 0;
    let width = 0, height = 0, drag = null;
    canvas.onpointerdown = event => {
      drag = {id: event.pointerId, x: event.clientX};
      canvas.setPointerCapture(event.pointerId);
    };
    canvas.onpointermove = event => {
      if (!drag || event.pointerId !== drag.id) return;
      yaw += (event.clientX - drag.x) * .017;
      drag.x = event.clientX;
    };
    canvas.onpointercancel = canvas.onlostpointercapture = canvas.onpointerup = () => { drag = null; };
    return {
      select(id, appearance) {
        const next = {...appearance, outfitId: id};
        if (actor) actor.setAppearance(next);
        else { actor = window.TempleActors.create(T, next); scene.add(actor.root); }
        accumulator = 1;
      },
      turn(direction) { yaw += direction * Math.PI / 4; accumulator = 1; },
      walk(value) { walking = value; clock = 0; accumulator = 1; },
      tick(dt) {
        if (!actor || document.hidden) return;
        accumulator += dt;
        if (accumulator < 1 / 24) return;
        clock += Math.min(accumulator, .1);
        accumulator = 0;
        const w = stage.clientWidth, h = stage.clientHeight;
        if (!w || !h) return;
        if (w !== width || h !== height) {
          width = w; height = h;
          renderer.setSize(w, h, false);
          camera.aspect = w/h;
          camera.position.set(0, 1.12, Math.max(3.65, 2.2/camera.aspect));
          camera.lookAt(0, .88, 0); camera.updateProjectionMatrix();
        }
        // Do not pass the procedural base mesh off as the requested imported robe during loading.
        actor.root.visible = !!actor.root.userData.outfitReady;
        actor.root.rotation.y = yaw;
        actor.pose(clock, walking);
        renderer.render(scene, camera);
        return actor.root.userData.outfitError ? 'error' : actor.root.visible ? 'ready' : 'loading';
      },
      dispose() {
        actor?.dispose();
        renderer.dispose();
        renderer.forceContextLoss();
        canvas.remove();
      }
    };
  };
})();
;
/* Server-owned practice profile and gentle milestone presentation. */
(function(){
 'use strict';
 const ROWS=[
 ['open','我的修行','我的修行','My practice'],['close','关闭','關閉','Close'],['name','法号','法號','Dharma name'],['waiting','正在连接修行记录…','正在連接修行紀錄…','Connecting to your practice record…'],
 ['merit','累计功德','累計功德','Total merit'],['bows','礼拜次数','禮拜次數','Completed bows'],['next','下一套僧衣','下一套僧衣','Next robe'],['left','还差 {n} 功德','還差 {n} 功德','{n} merit to go'],['all','僧衣已全部解锁','僧衣已全部解鎖','All robes unlocked'],
 ['beads','金色念珠','金色念珠','Golden prayer beads'],['beadEarn','三次礼拜圆满，金色念珠已收入衣柜。','三次禮拜圓滿，金色念珠已收入衣櫃。','Three bows completed. Golden prayer beads are in your wardrobe.'],
 ['beadNeed','完成三次礼拜可领取（{n}/3）','完成三次禮拜可領取（{n}/3）','Complete three bows to collect ({n}/3)'],['beadStored','已收入衣柜','已收入衣櫃','In your wardrobe'],
 ['wearBeads','戴上','戴上','Put on'],['removeBeads','摘下','摘下','Take off'],['dayPetals','到访莲瓣 · {n} 枚','到訪蓮瓣 · {n} 枚','Visit petals · {n}'],['dailyGift','今日到访礼物：一枚莲瓣。','今日到訪禮物：一枚蓮瓣。','A lotus petal for today’s visit.'],
 ['wardrobe','衣柜','衣櫃','Wardrobe'],['plain','素心僧衣','素心僧衣','Simple robe'],['lotus','莲心僧衣','蓮心僧衣','Lotus robe'],['cloud','云水僧衣','雲水僧衣','Cloud robe'],['golden','金愿僧衣','金願僧衣','Golden vow robe'],
 ['initial','初始僧衣','初始僧衣','Starting robe'],['threshold','{n} 功德解锁','{n} 功德解鎖','Unlock at {n} merit'],['equip','穿上','穿上','Wear'],['equipped','已穿戴','已穿戴','Wearing'],['locked','尚未解锁','尚未解鎖','Locked'],['saving','正在保存…','正在儲存…','Saving…'],
 ['tryOn','试穿','試穿','Try on'],['fitting','试衣镜','試衣鏡','Fitting mirror'],['turnLeft','向左转','向左轉','Turn left'],['turnRight','向右转','向右轉','Turn right'],['walk','走两步','走兩步','Walk'],['stand','站好','站好','Stand still'],['loadingRobe','正在取僧衣…','正在取僧衣…','Loading robe…'],['previewFailed','试衣镜暂时无法显示，请重新打开试穿。','試衣鏡暫時無法顯示，請重新開啟試穿。','The fitting mirror is unavailable. Reopen it to try again.'],
 ['rename','更改法号','更改法號','Change dharma name'],['renameHint','仅可更改一次，请输入两个汉字。','僅可更改一次，請輸入兩個漢字。','You may change it once. Enter two Chinese characters.'],['renameUsed','改名机会已使用','改名機會已使用','Your name change has been used'],['renameConfirm','确认使用这个法号，此后无法再次修改。','確認使用這個法號，此後無法再次修改。','Use this name. It cannot be changed again.'],['renameSubmit','确认改名（仅一次）','確認改名（僅一次）','Confirm name (once only)'],['renameInvalid','请输入两个汉字，并勾选确认。','請輸入兩個漢字，並勾選確認。','Enter two Chinese characters and check the confirmation.'],
 ['retry','暂未确认保存，请稍后重试。','尚未確認儲存，請稍後重試。','Save not confirmed. Please try again shortly.'],['failed','暂未完成，请稍后重试。','尚未完成，請稍後重試。','Not completed. Please try again shortly.'],['blessing','一念善行 · 莲光相伴','一念善行 · 蓮光相伴','A kind moment · A gentle lotus glow'],['unlocked','{robe} 已解锁','{robe} 已解鎖','{robe} unlocked'],['note','僧衣由累计功德解锁，穿戴不消耗功德。','僧衣由累計功德解鎖，穿戴不消耗功德。','Robes unlock through total merit. Wearing one does not spend merit.'],['busy','请在礼拜结束后查看','請在禮拜結束後查看','Open after the ritual finishes'],['gamePoints','功德仅为游戏记录','功德僅為遊戲紀錄','Merit is an in-game record']
 ];
 const DICT={'zh-CN':{},'zh-TW':{},en:{}};for(const [key,cn,tw,en]of ROWS){DICT['zh-CN'][key]=cn;DICT['zh-TW'][key]=tw;DICT.en[key]=en;}
 Object.assign(DICT,window.TempleLocaleBundles?.profile);
 const catalogLabels=[
  ['outfitSaved','已保存穿戴：{item}','已儲存穿戴：{item}','Outfit saved: {item}','着用を保存しました：{item}','착용 저장됨: {item}'],
  ['nameSaved','法号已保存：{name}','法號已儲存：{name}','Name saved: {name}','法名を保存しました：{name}','법명 저장됨: {name}'],
  ['robes','僧衣','僧衣','Robes','僧衣','승복'],['feet','布履','布履','Shoes','履物','신발'],['neck','颈饰','頸飾','Necklaces','首飾り','목 장식'],['waist','腰饰','腰飾','Belt charms','腰飾り','허리 장식'],
  ['vermilion','绛云袈裟','絳雲袈裟','Vermilion robe','紅雲の袈裟','진홍 가사'],['original','素布鞋','素布鞋','Plain cloth shoes','素布の靴','소박한 천신'],['hemp','蒲编草履','蒲編草履','Woven rush sandals','蒲編みの草履','부들 짚신'],['indigo','靛青云纹鞋','靛青雲紋鞋','Indigo cloud shoes','藍雲文の靴','쪽빛 구름무늬 신'],
  ['sandal','檀木念珠','檀木念珠','Sandalwood beads','白檀の念珠','백단 염주'],['gold','金色念珠','金色念珠','Golden prayer beads','金の念珠','금빛 염주'],['pouch','莲纹香囊','蓮紋香囊','Lotus sachet','蓮文の香袋','연꽃 향낭'],['jade','青玉环佩','青玉環佩','Jade ring pendant','青玉の環佩','청옥 고리 장식'],
  ['moss','金米斜披袈裟','金米斜披袈裟','Golden cream kasaya','金生成りの袈裟','금빛 크림 가사'],['moon','象牙白云纹袈裟','象牙白雲紋袈裟','Ivory cloud kasaya','象牙色の雲文袈裟','상아빛 구름무늬 가사'],
  ['saffron','秋金稻穗袈裟','秋金稻穗袈裟','Golden harvest kasaya','秋金の稲穂袈裟','가을빛 이삭 가사'],['plum','莲花连帽僧衣','蓮花連帽僧衣','Lotus hoodie','蓮のパーカー僧衣','연꽃 후드 승복'],['tide','靛海潮纹袈裟','靛海潮紋袈裟','Indigo tide kasaya','藍海の潮文袈裟','쪽빛 파도 가사'],
  ['neck-none','不戴颈饰','不戴頸飾','No necklace','首飾りなし','목 장식 없음'],['waist-none','不系腰饰','不繫腰飾','No belt charm','腰飾りなし','허리 장식 없음'],
  ['owned','已拥有','已擁有','Owned','所持','보유'],['newItem','新获得','新獲得','New','新着','새로 획득'],['viewWardrobe','查看衣柜','查看衣櫃','View wardrobe','衣櫃を見る','옷장 보기'],['unwear','取下','取下','Remove','外す','해제'],['previewing','试穿中','試穿中','Trying on','試着中','미리 보기'],['wearItem','装备','裝備','Equip','装備','장착'],['gearUnavailable','暂时无法保存搭配','暫時無法儲存搭配','Wardrobe sync unavailable','装備の保存ができません','장비를 저장할 수 없습니다'],
  ['beadEarn','获得金色念珠 · 已收入衣柜','獲得金色念珠 · 已收入衣櫃','Golden prayer beads added to your wardrobe','金の念珠を獲得 · 衣櫃に入りました','금빛 염주 획득 · 옷장에 보관되었습니다']
 ];
 for(const [key,...labels] of catalogLabels)for(const [i,locale] of ['zh-CN','zh-TW','en','ja','ko'].entries()){
   DICT[locale]??={};DICT[locale][key]=labels[i];
 }
 const OUTFITS=[
  {id:'lotus',at:0,robe:'#b8b2a0',sash:'#b9855c'},
  {id:'vermilion',at:0,robe:'#a04436',sash:'#cda65d'},
  {id:'moss',at:0,robe:'#d8bf85',sash:'#e4c478'},
  {id:'moon',at:60,robe:'#e8e2d8',sash:'#c7bfb4'},
  {id:'cloud',at:100,robe:'#d4ae5b',sash:'#a57437'},
  {id:'saffron',at:200,robe:'#c89244',sash:'#814e35'},
  {id:'plum',at:600,robe:'#eee5d6',sash:'#deb466'},
  {id:'tide',at:1200,robe:'#39576e',sash:'#c3b48b'},
  {id:'golden',at:10000,robe:'#8b6347',sash:'#e1bd62'}
 ];
 const ITEMS=[...OUTFITS.map(o=>({...o,slot:'robes'})),...Object.entries({feet:['original','hemp','indigo'],neck:['none','sandal','gold'],waist:['none','pouch','jade']}).flatMap(([slot,ids])=>ids.map(id=>({slot,id,at:id==='indigo'?50:id==='jade'?300:0})))];
 const itemName=item=>item.id==='none'?item.slot+'-none':item.id;
 const originalGear={feet:'original',neck:'none',waist:'none'};
 const integer=n=>Number.isSafeInteger(n)&&n>=0?n:0;
 const han=name=>typeof name==='string'&&Array.from(name).length===2&&/^\p{Script=Han}{2}$/u.test(name);
 window.TempleProfile={create(options){
  const {THREE:T,scene,statue,player}=options;let profile=null,stats={},appearance={},started=false,busy=false,shown=false,pending=null,lastFocus=null,lastLocale='';
  const seen=new Set(),queue=[];let active=null,ackPending=[],ackRetry=0,elapsed=0,disposed=false;
  const blessedItems=new Set();
  const restoredThresholds=new Set();
  function rewardBlessing(item){
    if(disposed||!item)return;
    const key=item.slot+':'+item.id;
    if(blessedItems.has(key))return;
    blessedItems.add(key);
    try{options.onRewardBlessing?.({slot:item.slot,id:item.id,threshold:item.at||0});}catch(error){console.warn('Reward blessing unavailable:',error);}
  }
  const tr=(key,args={})=>{const locale=window.TempleI18n?.locale||'zh-CN';return (DICT[locale]?.[key]||DICT.en[key]||key).replace(/\{(\w+)\}/g,(all,k)=>String(args[k]??all));};
  const create=(tag,className,text)=>{const el=document.createElement(tag);if(className)el.className=className;if(text!==undefined)el.textContent=text;return el;};
  const host=document.getElementById('game')||document.body,actions=document.querySelector('.top-actions')||host;
  const trigger=create('button','icon-button profile-trigger','◉');trigger.id='profile-open';trigger.type='button';trigger.disabled=true;actions.prepend(trigger);
  const wardrobeShortcut=create('button','icon-button wardrobe-shortcut');wardrobeShortcut.type='button';
  wardrobeShortcut.addEventListener('click',()=>open('wardrobe'));actions.prepend(wardrobeShortcut);
  const dialog=create('dialog','practice-dialog');dialog.id='practice-profile';dialog.setAttribute('aria-modal','true');dialog.setAttribute('aria-labelledby','practice-title');
  const panel=create('section','practice-panel');dialog.append(panel);
  const heading=create('header','practice-heading'),headingCopy=create('div');const eyebrow=create('p','practice-eyebrow'),title=create('h2');title.id='practice-title';headingCopy.append(eyebrow,title);const closeButton=create('button','practice-close','×');closeButton.type='button';heading.append(headingCopy,closeButton);panel.append(heading);
  const summary=create('div','practice-summary'),nameLabel=create('span','practice-name-label'),dharma=create('strong','practice-dharma');summary.append(nameLabel,dharma);panel.append(summary);
  const totals=create('div','practice-totals'),meritBox=create('div'),bowBox=create('div'),meritLabel=create('span'),bowLabel=create('span'),meritValue=create('strong'),bowValue=create('strong');meritBox.append(meritLabel,meritValue);bowBox.append(bowLabel,bowValue);totals.append(meritBox,bowBox);panel.append(totals);
  const progressBox=create('div','practice-progress'),progressHeader=create('div','practice-progress-header'),progressLabel=create('span'),progressValue=create('span'),progress=create('progress'),progressNote=create('p');progress.max=100;progressHeader.append(progressLabel,progressValue);progressBox.append(progressHeader,progress,progressNote);panel.append(progressBox);
  const wardrobeTitle=create('h3','practice-section-title'),cards=create('div','practice-cards');
  const gallery=create('div','wardrobe-gallery'),inventory=create('div','wardrobe-inventory'),tabs=create('div','wardrobe-tabs');
  tabs.setAttribute('role','group');inventory.append(tabs,cards);
  const mirror=create('section','fitting-mirror'),mirrorHead=create('header'),mirrorName=create('h4'),mirrorState=create('p'),stage=create('div','fitting-stage'),stageMessage=create('span','fitting-load');
  const controls=create('div','fitting-controls');
  function control(className,action){const button=create('button',className);button.type='button';button.addEventListener('click',action);return button;}
  let selected=null,category='robes',viewer=null,walking=false,viewState='loading',trial={};
  const left=control('fitting-turn',()=>viewer?.turn(-1)),right=control('fitting-turn',()=>viewer?.turn(1));
  const motion=control('fitting-motion',()=>{walking=!walking;viewer?.walk(walking);render();});
  const wear=control('practice-equip',()=>wearItem(selected));
  const dismiss=control('practice-close',()=>{const last=selected;hideMirror();cardNodes.find(n=>n.item===last)?.tryOn.focus();});
  dismiss.textContent='×';mirrorHead.append(mirrorName,dismiss);stage.append(stageMessage);
  controls.append(left,motion,right,wear);mirror.append(mirrorHead,stage,mirrorState,controls);
  mirror.hidden=true;mirrorState.setAttribute('aria-live','polite');gallery.append(mirror,inventory);panel.append(wardrobeTitle,gallery);
  const tabNodes=['robes','feet','neck','waist'].map(slot=>{
    const button=control('wardrobe-tab',()=>{category=slot;render();});
    button.dataset.category=slot;tabs.append(button);return {button,slot};
  });
  const cardNodes=ITEMS.map(item=>{
    const card=create('article','practice-outfit'),key=itemName(item);
    if(item.slot==='robes')card.dataset.outfit=item.id;
    card.dataset.slot=item.slot;card.dataset.item=key;
    const preview=create('div','practice-robe-preview');preview.setAttribute('aria-hidden','true');
    if(item.id==='none')preview.append(create('span','wardrobe-empty','∅'));
    else{
      const image=create('img'),legacy=item.id==='lotus'||item.id==='cloud';
      image.loading='lazy';image.decoding='async';image.alt='';
      image.src=TempleAssets.url(legacy?'assets/'+item.id+'-outfit-preview.jpg':'assets/wardrobe-'+item.id+'.webp');preview.append(image);
    }
    const name=create('h4'),hint=create('p'),badge=create('span','wardrobe-new');
    const tryOn=control('practice-try',()=>showMirror(item)),button=control('practice-equip',()=>wearItem(item));
    button.dataset.equip=key;tryOn.dataset.preview=key;badge.hidden=true;
    card.addEventListener('click',event=>{
      if(wardrobeOnly&&!event.target.closest('button'))showMirror(item);
    });
    card.append(preview,name,hint,tryOn,button,badge);cards.append(card);return{item,card,name,hint,button,tryOn,badge};
  });
  function worn(){return {robes:profile?.equipped||'lotus',...originalGear,neck:profile?.beadsEquipped?'gold':'none',...profile?.gear};}
  function owns(item){
    if(!profile)return false;
    if(item.slot==='robes')return profile.unlocked?.includes(item.id)||item.id==='lotus';
    if(!profile.gearAvailable)return false;
    return profile.gearUnlocked?.[item.slot]?.includes(item.id)===true;
  }
  function eligibility(item){
    if(item.slot==='robes')return item.at?tr('threshold',{n:item.at.toLocaleString()}):tr('gearUnavailable');
    if(!profile?.gearAvailable)return tr('gearUnavailable');
    if(item.id==='gold')return tr('beadNeed',{n:Math.min(3,integer(profile?.beadBows??stats.count))});
    return tr('left',{n:Math.max(0,item.at-integer(profile?.merit)).toLocaleString()});
  }
  function wearItem(item){
    if(!item||!owns(item)||worn()[item.slot]===item.id)return;
    if(pending||busy)return;
    if(selected&&selected!==item)showMirror(item,{focus:false});
    if(item.slot==='robes'){equip(item.id);return;}
    command(item.slot,item.id,id=>options.onGear?.(item.slot,id)??false);
  }
  function refreshViewer(){
    if(!selected)return;
    const look={...worn(),...trial},outfit=OUTFITS.find(o=>o.id===look.robes)||OUTFITS[0];
    try{
      viewer=viewer||window.TempleRobeFitting(T,stage);
      viewer.select(outfit.id,{...appearance,robe:outfit.robe,sash:outfit.sash,goldBeads:look.neck==='gold',gear:{feet:look.feet,neck:look.neck,waist:look.waist}});
    }catch(_){viewState='error';}
  }
  function showMirror(item,{focus=true,inspect=true}={}){
    selected=item;trial[item.slot]=item.id;viewState='loading';mirror.hidden=false;
    if(inspect&&item.id==='gold')inspectGold();
    refreshViewer();viewer?.walk(walking);render();
    if(focus){
      // On narrow screens the mirror is above the scrollable list of outfits.
      mirror.scrollIntoView?.({block:'nearest',inline:'nearest'});
      if(!wardrobeOnly)dismiss.focus({preventScroll:true});
    }
  }
  function hideMirror(){viewer?.dispose();viewer=null;selected=null;trial={};walking=false;mirror.hidden=true;render();}
  function updateMirror(){
    if(!selected)return;
    const equipped=worn()[selected.slot]===selected.id,available=owns(selected);
    mirrorName.textContent=tr('fitting')+' · '+tr(itemName(selected));dismiss.setAttribute('aria-label',tr('close'));dismiss.hidden=wardrobeOnly;
    mirrorState.textContent=available?tr(equipped?'equipped':'previewing'):tr('previewing')+' · '+eligibility(selected);
    left.textContent='↶';right.textContent='↷';left.setAttribute('aria-label',tr('turnLeft'));right.setAttribute('aria-label',tr('turnRight'));
    motion.textContent=tr(walking?'stand':'walk');motion.setAttribute('aria-pressed',String(walking));
    for(const button of [left,motion,right])button.disabled=viewState==='error';
    const equipLabel=selected.slot==='robes'?'equip':selected.id==='none'?'unwear':'wearItem';
    const saving=pending?.kind===(selected.slot==='robes'?'equip':selected.slot)&&pending.value===selected.id;
    wear.textContent=tr(saving?'saving':equipped?'equipped':available?equipLabel:'locked');wear.disabled=!available||equipped||busy||!!pending;
    stageMessage.hidden=viewState==='ready';stageMessage.textContent=tr(viewState==='error'?'previewFailed':'loadingRobe');
  }
  function drawCatalog(){
    const wornItems=worn();tabs.hidden=!wardrobeOnly;tabs.setAttribute('aria-label',tr('wardrobe'));
    for(const {button,slot} of tabNodes){
      const fresh=slot==='neck'&&newGold;
      button.textContent=tr(slot);button.setAttribute('aria-label',fresh?tr(slot)+' · '+tr('newItem'):tr(slot));
      button.setAttribute('aria-pressed',String(slot===category));button.dataset.fresh=String(fresh);
    }
    for(const {item,card,name,hint,button,tryOn,badge} of cardNodes){
      const available=owns(item),equipped=wornItems[item.slot]===item.id,key=itemName(item);
      card.hidden=item.slot!==(wardrobeOnly?category:'robes');
      tryOn.textContent=tr('tryOn');name.textContent=tr(key);
      hint.textContent=available?tr(equipped?'equipped':'owned'):tr('locked')+' · '+eligibility(item);
      if(wardrobeOnly&&available&&item.slot==='robes')hint.textContent+=' · '+(item.at?tr('threshold',{n:item.at.toLocaleString()}):tr('initial'));
      tryOn.setAttribute('aria-label',[tr('tryOn'),tr(key),hint.textContent,item.id==='gold'&&newGold?tr('newItem'):''].filter(Boolean).join(' · '));tryOn.setAttribute('aria-pressed',String(selected===item));
      const saving=pending?.kind===(item.slot==='robes'?'equip':item.slot)&&pending.value===item.id;
      const action=item.slot==='robes'?'equip':item.id==='none'?'unwear':'wearItem';
      button.textContent=tr(saving?'saving':equipped?'equipped':available?action:'locked');button.disabled=!available||equipped||!!pending||busy;
      button.setAttribute('aria-label',button.textContent+' · '+tr(key));button.setAttribute('aria-pressed',String(equipped));
      card.classList.toggle('is-locked',!available);card.classList.toggle('is-equipped',equipped);card.dataset.selected=String(item===selected);
      badge.hidden=item.id!=='gold'||!newGold;badge.textContent=tr('newItem');
    }
  }
  const accessory=create('section','wardrobe-accessory'),beadIcon=create('span','wardrobe-beads'),beadCopy=create('div'),beadName=create('strong'),beadHint=create('p');
  beadIcon.setAttribute('aria-hidden','true');beadCopy.append(beadName,beadHint);
  const toggleBeads=control('practice-equip',()=>changeBeads(!profile?.beadsEquipped));
  accessory.append(beadIcon,beadCopy,toggleBeads);
  const petalTotal=create('p','wardrobe-petals'),wardrobeNote=create('p','practice-note');panel.append(accessory,petalTotal,wardrobeNote);
  const gift=create('div','wardrobe-gift'),giftText=create('span'),giftWear=control('practice-equip',()=>changeBeads(true));
  const viewGift=control('practice-try',()=>{
    if(!shown&&!open('wardrobe',true))return;
    wardrobeOnly=true;dialog.dataset.wardrobe='true';category='neck';
    const item=cardNodes.find(n=>n.item.id==='gold');showMirror(item.item,{focus:false});item.tryOn.focus();
  });
  gift.setAttribute('role','status');gift.setAttribute('aria-live','polite');gift.hidden=true;gift.append(giftText,viewGift,giftWear);host.append(gift);
  let wardrobeOnly=false,giftKind=null,giftUntil=0,lastGold=null,newGold=false,dailyCount=null,petalWaiting=false,goldPending=false;
  function goldStorage(action,value){
    try{const k='qt-gift-note:'+localStorage.getItem('quiet-temple-visitor-v1')+':gold-unseen';
      if(action==='get')return localStorage.getItem(k)==='1';localStorage.setItem(k,value?'1':'0');
    }catch{}return false;
  }
  function inspectGold(){if(newGold){newGold=false;goldStorage('set',false);}}
  function showGift(kind){
    if(performance.now()<giftUntil&&giftKind!==kind){
      petalWaiting=true;
      if(giftKind==='beads')return;
    }
    giftKind=kind;giftUntil=performance.now()+(kind==='beads'?12000:4200);
    gift.hidden=false;
  }
  function changeBeads(on){
    if(!profile?.beadsUnlocked||on===profile.beadsEquipped)return;
    if(on)inspectGold();
    command('beads',on,options.onGoldBeads);
  }
  function drawCollection(){
    title.textContent=tr(wardrobeOnly?'wardrobe':'open');
    wardrobeShortcut.disabled=!started||busy||!profile;wardrobeShortcut.title=tr('wardrobe');
    wardrobeShortcut.textContent=tr('wardrobe');wardrobeShortcut.dataset.fresh=String(newGold);
    wardrobeShortcut.setAttribute('aria-label',tr('wardrobe')+(newGold?' · '+tr('newItem'):''));
    accessory.hidden=(!profile||profile.perksAvailable===false)||(wardrobeOnly&&profile.gearAvailable===true);
    beadName.textContent=tr('beads');
    beadHint.textContent=profile?.beadsUnlocked?tr(profile.beadsEquipped?'equipped':'beadStored'):tr('beadNeed',{n:Math.min(3,integer(profile?.beadBows??stats.count))});
    toggleBeads.textContent=tr(profile?.beadsEquipped?'removeBeads':'wearBeads');
    toggleBeads.disabled=!started||!profile?.beadsUnlocked||!!pending||busy;
    if(profile?.beadsEquipped)toggleBeads.setAttribute('aria-pressed','true');else toggleBeads.setAttribute('aria-pressed','false');
    petalTotal.hidden=(!profile||profile.perksAvailable===false)||!Number.isSafeInteger(profile?.dailyPetals);petalTotal.textContent=tr('dayPetals',{n:integer(profile?.dailyPetals)});
    if(giftKind){
      giftText.textContent=tr(giftKind==='beads'?'beadEarn':'dailyGift');
      giftWear.hidden=giftKind!=='beads'||!!profile?.beadsEquipped;
      viewGift.hidden=giftKind!=='beads';viewGift.disabled=!started||!profile;viewGift.textContent=tr('viewWardrobe');
      giftWear.disabled=!!pending;giftWear.textContent=tr('wearBeads');
    }
  }
  function trackGifts(next){
    if(!next||next.perksAvailable===false)return;
    // Server counts own the collection. These local flags only suppress repeated welcome messages.
    const mark=(key,value)=>{
      try{
        const visitor=localStorage.getItem('quiet-temple-visitor-v1')||'local',k='qt-gift-note:'+visitor+':'+key;
        if(localStorage.getItem(k)===String(value))return false;
        localStorage.setItem(k,String(value));
      }catch{}
      return true;
    };
    if(Number.isSafeInteger(next.dailyPetals)&&next.dailyPetals>0&&dailyCount!==next.dailyPetals){
      dailyCount=next.dailyPetals;if(mark('petals',dailyCount))showGift('petal');
    }
    if(typeof next.beadsUnlocked==='boolean'){
      if(lastGold===null)newGold=next.beadsUnlocked&&goldStorage('get');
      if(lastGold===false&&next.beadsUnlocked){
        newGold=true;goldStorage('set',true);goldPending=true;
      }
      lastGold=next.beadsUnlocked;
      if(started&&goldPending)announceGold();
    }
  }
  function announceGold(){
    const overlay=document.getElementById('overlay');
    if(!started||busy||shown||document.hidden||(overlay&&!overlay.hidden))return;
    goldPending=false;showGift('beads');rewardBlessing({slot:'neck',id:'gold'});
    if(active){
      queue.unshift(active.threshold);active=null;glow.visible=false;points.visible=false;blessing.hidden=true;
    }
    if(typeof Event==='function')document.dispatchEvent?.(new Event('temple-gold-beads-earned'));
    drawCollection();
  }
  const form=create('form','practice-rename'),renameHeading=create('h3'),renameHint=create('p'),renameLine=create('div','practice-rename-line'),renameInput=create('input'),renameButton=create('button','practice-rename-submit'),confirmLabel=create('label','practice-confirm'),confirm=create('input'),confirmText=create('span');renameInput.type='text';renameInput.id='practice-rename-input';renameInput.maxLength=4;renameInput.autocomplete='off';renameInput.spellcheck=false;renameInput.setAttribute('aria-describedby','practice-rename-hint');renameHint.id='practice-rename-hint';renameButton.type='submit';confirm.type='checkbox';confirmLabel.append(confirm,confirmText);renameLine.append(renameInput,renameButton);form.append(renameHeading,renameHint,renameLine,confirmLabel);summary.after(form);
  const message=create('p','practice-message');message.setAttribute('role','status');message.setAttribute('aria-live','polite');panel.append(message);host.append(dialog);
  const blessing=create('div','practice-blessing');blessing.hidden=true;blessing.setAttribute('role','status');blessing.setAttribute('aria-live','polite');const blessingTitle=create('span'),blessingDetail=create('strong');blessing.append(blessingTitle,blessingDetail);host.append(blessing);
  function setError(value){pending=null;message.textContent=typeof value==='string'&&value?value:tr('failed');render();}
  function command(kind,value,fn){if(!profile||pending||!started||(busy&&kind!=='beads')||typeof fn!=='function')return;pending={kind,value,age:0};message.textContent=tr('saving');render();try{const result=fn(value);if(result===false){setError();return;}if(result&&typeof result.then==='function')result.then(answer=>{if(answer===false)setError();else if(answer?.profile)update(answer.profile,answer.stats||stats,answer.appearance||appearance);}).catch(()=>setError());}catch(_){setError();}}
  function equip(id){if(!profile?.unlocked?.includes(id)||profile.equipped===id)return;command('equip',id,options.onEquip);}
  form.addEventListener('submit',event=>{event.preventDefault();const name=renameInput.value;if(!han(name)||!confirm.checked||!profile?.renameRemaining){message.textContent=tr('renameInvalid');return;}command('rename',name,options.onRename);});
  function render(){
   if(disposed)return;lastLocale=window.TempleI18n?.locale||'zh-CN';trigger.title=busy?tr('busy'):tr('open');trigger.setAttribute('aria-label',tr('open'));trigger.disabled=!started||busy||!profile;closeButton.setAttribute('aria-label',tr('close'));eyebrow.textContent=tr('gamePoints');title.textContent=tr('open');nameLabel.textContent=tr('name');dharma.textContent=profile?.dharmaName||appearance.name||'—';meritLabel.textContent=tr('merit');bowLabel.textContent=tr('bows');
   const merit=integer(profile?.merit??stats.merit),bows=integer(stats.count);meritValue.textContent=merit.toLocaleString();bowValue.textContent=bows.toLocaleString();const next=OUTFITS.find(o=>o.at>merit);progressLabel.textContent=next?tr('next')+' · '+tr(next.id):tr('all');progressValue.textContent=next?merit.toLocaleString()+' / '+next.at.toLocaleString():'';progress.value=next?Math.min(100,merit/next.at*100):100;progress.setAttribute('aria-label',next?tr('left',{n:Math.max(0,next.at-merit).toLocaleString()}):tr('all'));progressNote.textContent=next?tr('left',{n:Math.max(0,next.at-merit).toLocaleString()}):tr('all');wardrobeTitle.textContent=tr('wardrobe');wardrobeNote.textContent=tr('note');
   drawCatalog();
   updateMirror();drawCollection();
   const canRename=!!profile?.renameRemaining;renameHeading.textContent=tr('rename');renameHint.textContent=tr(canRename?'renameHint':'renameUsed');renameInput.setAttribute('aria-label',tr('name'));renameInput.disabled=!canRename||!!pending;renameButton.textContent=tr('renameSubmit');renameButton.disabled=!canRename||!!pending;confirm.disabled=!canRename||!!pending;confirmText.textContent=tr('renameConfirm');confirmLabel.hidden=!canRename;if(!profile)message.textContent=tr('waiting');if(active){blessingTitle.textContent=tr('blessing');blessingDetail.textContent=tr('unlocked',{robe:tr(OUTFITS.find(o=>o.at===active.threshold)?.id||'lotus')});}
  }
  function open(section,fromEarnedGift=false){if(!started||(busy&&!fromEarnedGift)||!profile||shown)return false;wardrobeOnly=section==='wardrobe';dialog.dataset.wardrobe=String(wardrobeOnly);category='robes';lastFocus=document.activeElement;shown=true;options.onOpenChange?.(true);render();if(typeof dialog.showModal==='function')dialog.showModal();else dialog.setAttribute('open','');if(wardrobeOnly)showMirror(ITEMS.find(o=>o.slot==='robes'&&o.id===worn().robes)||ITEMS[0],{focus:false});closeButton.focus();return true;}
  function close(){if(!shown)return;shown=false;wardrobeOnly=false;dialog.dataset.wardrobe='false';hideMirror();if(typeof dialog.close==='function')dialog.close();else dialog.removeAttribute('open');options.onOpenChange?.(false);if(lastFocus?.isConnected&&typeof lastFocus.focus==='function')lastFocus.focus();}
  trigger.addEventListener('click',open);closeButton.addEventListener('click',close);dialog.addEventListener('cancel',event=>{event.preventDefault();close();});dialog.addEventListener('click',event=>{if(event.target===dialog)close();});
  dialog.addEventListener('keydown',event=>{event.stopPropagation();if(event.key==='Escape'){event.preventDefault();close();}if(event.key==='Tab'){const focusable=[...dialog.querySelectorAll('button,input,a[href]')].filter(el=>!el.disabled&&!el.hidden&&el.getClientRects().length);const first=focusable[0],last=focusable[focusable.length-1];if(event.shiftKey&&document.activeElement===first){event.preventDefault();last?.focus();}else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first?.focus();}}});
  // A small original lotus and soft particles. No lights or flickering effects are added.
  const glow=new T.Group();glow.visible=false;scene.add(glow);const lotus=new T.Group();glow.add(lotus);const petalMat=new T.MeshBasicMaterial({color:0xf0cc81,transparent:true,opacity:0,depthWrite:false,side:T.DoubleSide});
  const petalGeometry=new T.CircleGeometry(.20,18),petals=[];for(let i=0;i<10;i++){const petal=new T.Mesh(petalGeometry,petalMat);const angle=i*Math.PI/5;petal.position.set(Math.sin(angle)*.34,.04,Math.cos(angle)*.34);petal.rotation.x=-Math.PI/2;petal.rotation.z=-angle;petal.scale.set(.55,1.5,1);lotus.add(petal);petals.push(petal);}
  const ringMat=new T.MeshBasicMaterial({color:0xf5d692,transparent:true,opacity:0,depthWrite:false,side:T.DoubleSide});const ring=new T.Mesh(new T.RingGeometry(.52,.55,48),ringMat);ring.rotation.x=-Math.PI/2;ring.position.y=.045;glow.add(ring);
  const pointCount=28,positions=new Float32Array(pointCount*3),pointGeometry=new T.BufferGeometry();pointGeometry.setAttribute('position',new T.BufferAttribute(positions,3));const pointMat=new T.PointsMaterial({color:0xf0ce85,size:.045,transparent:true,opacity:0,depthWrite:false});const points=new T.Points(pointGeometry,pointMat);scene.add(points);points.visible=false;
  const start=new T.Vector3(),end=new T.Vector3(),worldPos=new T.Vector3();
  function beginBlessing(threshold){const granted=OUTFITS.find(item=>item.at===threshold);if(granted&&!restoredThresholds.has(threshold))rewardBlessing({...granted,slot:'robes'});const reduce=window.matchMedia?.('(prefers-reduced-motion: reduce)').matches||false;active={threshold,time:0,reduce};blessing.hidden=false;glow.visible=!reduce;points.visible=!reduce;if(statue?.getWorldPosition)statue.getWorldPosition(start);else start.set(0,.7,-8);start.y+=2.5;render();}
  function acknowledge(){if(!ackPending.length||ackRetry>0||typeof options.onAcknowledge!=='function')return;const batch=[...new Set(ackPending)];ackPending=[];ackRetry=10;try{const result=options.onAcknowledge(batch);if(result===false){ackPending.push(...batch);return;}if(result&&typeof result.then==='function')result.then(value=>{if(value===false)ackPending.push(...batch);}).catch(()=>ackPending.push(...batch));}catch(_){ackPending.push(...batch);}}
  function update(nextProfile,nextStats={},nextAppearance={}){const wasWaiting=!profile,previousLook=JSON.stringify(worn());trackGifts(nextProfile);if(wasWaiting&&Array.isArray(nextProfile?.blessings))for(const at of nextProfile.blessings)restoredThresholds.add(at);profile=nextProfile&&typeof nextProfile==='object'?nextProfile:null;stats=nextStats||{};appearance=nextAppearance||{};if(selected&&viewer&&previousLook!==JSON.stringify(worn()))refreshViewer();if(wasWaiting&&profile&&!pending)message.textContent='';if(pending&&profile&&((pending.kind==='equip'&&profile.equipped===pending.value)||(pending.kind==='rename'&&profile.dharmaName===pending.value)||(pending.kind==='beads'&&profile.beadsEquipped===pending.value)||(Object.hasOwn(originalGear,pending.kind)&&profile.gear?.[pending.kind]===pending.value))){const {kind,value}=pending;
      if(kind==='rename'){
        message.textContent=tr('nameSaved',{name:profile.dharmaName});confirm.checked=false;renameInput.value='';
      }else{
        const item=ITEMS.find(entry=>entry.slot===(kind==='equip'?'robes':kind==='beads'?'neck':kind)&&entry.id===(kind==='beads'?(value?'gold':'none'):value));
        message.textContent=item?tr('outfitSaved',{item:tr(itemName(item))}):tr('equipped');
      }
      pending=null;}for(const {at} of OUTFITS){
      if(at>0&&profile?.blessings?.includes(at)&&!seen.has(at)){seen.add(at);queue.push(at);}
    }
    queue.sort((a,b)=>a-b);render();}
  function tick(dt){if(disposed)return;if(giftKind&&performance.now()>giftUntil){
    giftKind=null;gift.hidden=true;
    if(petalWaiting){petalWaiting=false;showGift('petal');drawCollection();}
   }const step=Math.max(0,Math.min(Number.isFinite(dt)?dt:0,.1));if(shown&&viewer){const state=viewer.tick(step);if(state&&state!==viewState){viewState=state;updateMirror();}}elapsed+=step;ackRetry=Math.max(0,ackRetry-step);if(lastLocale!==(window.TempleI18n?.locale||'zh-CN'))render();if(pending){pending.age+=step;if(pending.age>15)setError(tr('retry'));}if(!started||document.hidden)return;if(goldPending)announceGold();if(!active&&!busy&&!shown&&giftKind!=='beads'&&queue.length)beginBlessing(queue.shift());if(active){active.time+=step;const p=Math.min(1,active.time/3),fade=Math.sin(p*Math.PI);player.root.getWorldPosition(worldPos);glow.position.copy(worldPos);glow.position.y+=.03;const scale=.8+p*.35;lotus.scale.setScalar(scale);ring.scale.setScalar(1+p*.65);petalMat.opacity=fade*.35;ringMat.opacity=fade*.38;pointMat.opacity=fade*.7;end.copy(worldPos);end.y+=.8;for(let i=0;i<pointCount;i++){const travel=Math.min(1,Math.max(0,p*1.45-i*.012));const angle=i*2.39996;const spread=Math.sin(travel*Math.PI)*.35;positions[i*3]=start.x+(end.x-start.x)*travel+Math.cos(angle)*spread;positions[i*3+1]=start.y+(end.y-start.y)*travel+Math.sin(travel*Math.PI)*.65;positions[i*3+2]=start.z+(end.z-start.z)*travel+Math.sin(angle)*spread;}pointGeometry.attributes.position.needsUpdate=true;if(p>=1){ackPending.push(active.threshold);active=null;glow.visible=false;points.visible=false;blessing.hidden=true;acknowledge();}}else acknowledge();}
  const unsubscribe=window.TempleI18n?.onChange?.(render);render();
  return{update,tick,open,openWardrobe:()=>open('wardrobe'),wardrobeLabel:()=>tr('wardrobe'),close,setStarted(value){const next=!!value;if(started===next)return;started=next;if(!started)close();else if(goldPending)announceGold();render();},setBusy(value){const next=!!value;if(busy===next)return;busy=next;render();},setError,diagnostics(){return{open:shown,started,busy,name:profile?.dharmaName||null,equipped:profile?.equipped||null,unlocked:profile?.unlocked||[],pending:pending?.kind||null,blessing:active?{threshold:active.threshold,progress:active.time/3,reducedMotion:active.reduce}:null,queuedBlessings:[...queue],acknowledgementsPending:[...ackPending]};},dispose(){close();disposed=true;unsubscribe?.();trigger.remove();wardrobeShortcut.remove();dialog.remove();blessing.remove();gift.remove();scene.remove(glow,points);petalGeometry.dispose();petalMat.dispose();ring.geometry.dispose();ringMat.dispose();pointGeometry.dispose();pointMat.dispose();}};
 }};
})();
;
(function(){
 'use strict';
 function blessingRig(T,mesh,world,rig){
  const sourceGeometry=mesh.geometry,sourceMaterial=mesh.material,geometry=sourceGeometry.clone(),entries=rig.entries.map(e=>e.slice()),entryWeights=new Map(entries.map(e=>[e[0],e.slice(1)])),baseCount=rig.vertexCount+rig.vertices.length,base={};
  if(rig.vertexCount!==sourceGeometry.attributes.position.count)throw Error('Buddha blessing rig vertex mismatch');
  for(const name of ['position','normal','uv']){const source=sourceGeometry.attributes[name],array=new source.array.constructor(baseCount*source.itemSize);array.set(source.array);for(let i=0;i<rig.vertices.length;i++){const[a,b,t]=rig.vertices[i];for(let k=0;k<source.itemSize;k++)array[(rig.vertexCount+i)*source.itemSize+k]=array[a*source.itemSize+k]*(1-t)+array[b*source.itemSize+k]*t;}base[name]=array;}const sourceP=base.position;
  const repairEntries=(rig.bodyRepairs||[]).map(e=>e.slice()),repairMap=new Map(repairEntries.map(e=>[e[0],e.slice(1)]));
  const caps=[];for(const cap of rig.caps||[])for(const tri of cap.triangles){for(const side of [0,1]){const corners=(side?tri.slice().reverse():tri).map(i=>({source:cap.edges[i][side?2:0],weight:side?entryWeights.get(cap.edges[i][2]):null}));const points=corners.map(c=>new T.Vector3(...sourceP.slice(c.source*3,c.source*3+3))),n=new T.Vector3().subVectors(points[1],points[0]).cross(new T.Vector3().subVectors(points[2],points[0])).normalize();const kneeContact=!side&&points.every(p=>p.y>1&&p.y<1.5);corners.forEach((c,i)=>caps.push({...c,point:points[i].toArray(),normal:n.toArray(),uv:kneeContact?Array.from(base.uv.slice(c.source*2,c.source*2+2)):null}));}}
  const total=baseCount+caps.length;
  for(const name of ['position','normal','uv']){const source=sourceGeometry.attributes[name],array=new source.array.constructor(total*source.itemSize);array.set(base[name]);let dest=baseCount;
   for(const cap of caps){for(let k=0;k<source.itemSize;k++)array[dest*source.itemSize+k]=name==='position'?cap.point[k]:name==='normal'?Math.round(cap.normal[k]*127):cap.uv?cap.uv[k]:cap.weight?-10:-20;dest++;}
   geometry.setAttribute(name,new T.BufferAttribute(array,source.itemSize,source.normalized));
  }
  const dropped=new Set(rig.dropTriangles),indices=Array.from(sourceGeometry.index.array).filter((_,i)=>!dropped.has(Math.floor(i/3)));indices.push(...rig.extraIndices);let center=baseCount;
  for(const cap of caps){indices.push(center);if(cap.weight)entries.push([center,...cap.weight]);else if(repairMap.has(cap.source))repairEntries.push([center,...repairMap.get(cap.source)]);center++;}geometry.setIndex(indices);
  const handMorph=new Map(),bodyMorph=new Map(),bodyColors=new Map();
  if(rig.handReplacement){
   const replacement=rig.handReplacement,oldCount=geometry.attributes.position.count,cutCount=replacement.vertices.length,hand=replacement.hand,handCount=hand.position.length/3;
   if(replacement.baseCount!==oldCount)throw Error('Buddha wrist attachment vertex mismatch');
   for(const name of ['position','normal','uv']){const old=geometry.attributes[name],array=new old.array.constructor((oldCount+cutCount+handCount)*old.itemSize);array.set(old.array);for(let i=0;i<cutCount;i++){const[a,b,t]=replacement.vertices[i];for(let k=0;k<old.itemSize;k++)array[(oldCount+i)*old.itemSize+k]=array[a*old.itemSize+k]*(1-t)+array[b*old.itemSize+k]*t;}const source=name==='position'?hand.oldPosition:name==='normal'?hand.oldNormal:hand.uv;for(let i=0;i<source.length;i++)array[(oldCount+cutCount)*old.itemSize+i]=name==='normal'?Math.round(source[i]*127):source[i];geometry.setAttribute(name,new T.BufferAttribute(array,old.itemSize,old.normalized));}
   const droppedHand=new Set(replacement.dropTriangles),joinedIndices=Array.from(geometry.index.array).filter((_,i)=>!droppedHand.has(Math.floor(i/3)));joinedIndices.push(...replacement.extraIndices);geometry.setIndex(joinedIndices);
   for(const entry of replacement.cutWeights)entries.push(entry.slice());
   for(let i=0;i<handCount;i++){const index=oldCount+cutCount+i;entries.push([index,0,0,1]);handMorph.set(index,{position:new T.Vector3().fromArray(hand.position,i*3),normal:new T.Vector3().fromArray(hand.normal,i*3)});}
  }
  if(rig.bodyPatch){
   const patch=rig.bodyPatch,offset=geometry.attributes.position.count;
   for(const name of ['position','normal','uv']){const old=geometry.attributes[name],array=new old.array.constructor((offset+patch.vertices.length)*old.itemSize);array.set(old.array);for(let i=0;i<patch.vertices.length;i++){const vertex=patch.vertices[i],value=name==='position'?vertex.oldPosition:name==='normal'?vertex.oldNormal:vertex.uv;for(let k=0;k<old.itemSize;k++)array[(offset+i)*old.itemSize+k]=name==='normal'?Math.round(value[k]*127):value[k];}geometry.setAttribute(name,new T.BufferAttribute(array,old.itemSize,old.normalized));}
   const removed=new Set(patch.dropTriangles.map(t=>t.join(','))),old=geometry.index.array,joined=[];for(let i=0;i<old.length;i+=3){const tri=Array.from(old.slice(i,i+3));if(!removed.has(tri.join(',')))joined.push(...tri);}joined.push(...patch.indices.map(i=>i<0?offset-i-1:i));geometry.setIndex(joined);
   for(let i=0;i<patch.vertices.length;i++){const vertex=patch.vertices[i],index=offset+i;entries.push([index,0,0,0]);bodyMorph.set(index,{position:new T.Vector3(...vertex.position),normal:new T.Vector3(...vertex.normal)});bodyColors.set(index,vertex.color||[.42,.23,.05]);}
  }
  const handGold=new Float32Array(geometry.attributes.position.count);for(const index of handMorph.keys())handGold[index]=1;geometry.setAttribute('aBlessingHand',new T.BufferAttribute(handGold,1));
  const activeMaterial=sourceMaterial.clone();activeMaterial.onBeforeCompile=shader=>{if(shader.vertexShader)shader.vertexShader='attribute float aBlessingHand;varying float vBlessingHand;\n'+shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nvBlessingHand=aBlessingHand;');shader.fragmentShader='varying float vBlessingHand;\n'+shader.fragmentShader.replace('#include <map_fragment>','vec3 blessingBase=diffuseColor.rgb;\n#ifdef USE_MAP\n if(vMapUv.x < -15.0){diffuseColor *= vec4(.075,.035,.009,1.0);}else if(vMapUv.x < -5.0){diffuseColor *= vec4(.42,.23,.05,1.0);}else{\n#include <map_fragment>\n}\n#endif\ndiffuseColor.rgb=mix(diffuseColor.rgb,blessingBase*vec3(.42,.23,.05),smoothstep(0.,1.,vBlessingHand));').replace('#include <roughnessmap_fragment>','#include <roughnessmap_fragment>\n#ifdef USE_MAP\nif(vMapUv.x < -15.0)roughnessFactor=.82;\n#endif').replace('#include <metalnessmap_fragment>','#include <metalnessmap_fragment>\n#ifdef USE_MAP\nif(vMapUv.x < -15.0)metalnessFactor=.05;\n#endif').replace('#include <emissivemap_fragment>','#include <emissivemap_fragment>\n#ifdef USE_MAP\nif(vMapUv.x < -15.0)totalEmissiveRadiance=vec3(0.0);\n#endif');};activeMaterial.customProgramCacheKey=()=> 'buddha-contact-fill-v4';
  const repairColor=new Float32Array(geometry.attributes.position.count*4);for(const[index,color]of bodyColors)repairColor.set([...color,1],index*4);geometry.setAttribute('aBlessingRepairColor',new T.BufferAttribute(repairColor,4));
  const handBlend={value:0},compileHand=activeMaterial.onBeforeCompile;activeMaterial.onBeforeCompile=shader=>{compileHand(shader);shader.uniforms=shader.uniforms||{};shader.uniforms.uBlessingHandBlend=handBlend;if(shader.vertexShader)shader.vertexShader='attribute vec4 aBlessingRepairColor;varying vec4 vBlessingRepairColor;\n'+shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nvBlessingRepairColor=aBlessingRepairColor;');shader.fragmentShader='uniform float uBlessingHandBlend;varying vec4 vBlessingRepairColor;\n'+shader.fragmentShader.replace('smoothstep(0.,1.,vBlessingHand)','smoothstep(0.,1.,vBlessingHand)*uBlessingHandBlend').replace('#include <roughnessmap_fragment>','diffuseColor.rgb=mix(diffuseColor.rgb,blessingBase*vBlessingRepairColor.rgb/max(.00001,vBlessingRepairColor.a),max(0.,vBlessingRepairColor.a)*uBlessingHandBlend);\n#include <roughnessmap_fragment>');};activeMaterial.customProgramCacheKey=()=> 'buddha-contact-fill-v6';
  const position=geometry.attributes.position,normal=geometry.attributes.normal;position.setUsage(T.DynamicDrawUsage);normal.setUsage(T.DynamicDrawUsage);
  const restPositions=position.array.slice(),restNormals=normal.array.slice();
  const ranges=[];for(const index of [...new Set(entries.concat(repairEntries).map(e=>e[0]))].sort((a,b)=>a-b)){const last=ranges.at(-1);if(last&&index*3<=last.start+last.count+24)last.count=index*3+3-last.start;else ranges.push({start:index*3,count:3});}
  function dirty(){for(const attribute of [position,normal]){attribute.clearUpdateRanges();for(const range of ranges)attribute.addUpdateRange(range.start,range.count);attribute.needsUpdate=true;}}
  const joint=name=>new T.Vector3(...rig.joints[name]),shoulder=joint('shoulder'),elbow=joint('elbow'),wrist=joint('wrist'),palm=joint('palm'),newPalm=rig.handReplacement?.palmPoint?new T.Vector3(...rig.handReplacement.palmPoint):null,newPalmNormal=rig.handReplacement?.palmNormal?new T.Vector3(...rig.handReplacement.palmNormal):null;
  const upperMatrix=new T.Matrix4(),foreMatrix=new T.Matrix4(),handMatrix=new T.Matrix4(),pivotMatrix=new T.Matrix4(),rotation=new T.Matrix4(),translation=new T.Matrix4();
  const upperNormal=new T.Matrix3(),foreNormal=new T.Matrix3(),handNormal=new T.Matrix3(),p=new T.Vector3(),n=new T.Vector3(),v=new T.Vector3(),sum=new T.Vector3(),targetPoint=new T.Vector3(),palmWorld=new T.Vector3(),direction=new T.Vector3(),up=new T.Vector3(0,1,0);
  const smooth=x=>x*x*(3-2*x),clamp=x=>Math.max(0,Math.min(1,x));
  let target=null,progress=0,hold=0,lastPose=-1,phase='idle',disposed=false,lightTime=0;
  const fx=new T.Group();fx.name='Achievement blessing gold light';fx.visible=false;world.scene.add(fx);
  const canvas=document.createElement('canvas');canvas.width=canvas.height=128;const ctx=canvas.getContext('2d'),gradient=ctx.createRadialGradient(64,64,0,64,64,64);
  gradient.addColorStop(0,'rgba(255,235,150,1)');gradient.addColorStop(.25,'rgba(255,208,84,.65)');gradient.addColorStop(1,'rgba(255,195,55,0)');ctx.fillStyle=gradient;ctx.fillRect(0,0,128,128);
  const glowTexture=new T.CanvasTexture(canvas);glowTexture.colorSpace=T.SRGBColorSpace;
  const shaft=document.createElement('canvas');shaft.width=64;shaft.height=256;const sx=shaft.getContext('2d'),cross=sx.createLinearGradient(0,0,64,0);cross.addColorStop(0,'rgba(255,214,116,0)');cross.addColorStop(.5,'rgba(255,233,165,.62)');cross.addColorStop(1,'rgba(255,214,116,0)');sx.fillStyle=cross;sx.fillRect(0,0,64,256);sx.globalCompositeOperation='destination-in';const ends=sx.createLinearGradient(0,0,0,256);ends.addColorStop(0,'rgba(255,255,255,0)');ends.addColorStop(.16,'white');ends.addColorStop(.8,'white');ends.addColorStop(1,'rgba(255,255,255,0)');sx.fillStyle=ends;sx.fillRect(0,0,64,256);const shaftTexture=new T.CanvasTexture(shaft);shaftTexture.colorSpace=T.SRGBColorSpace;
  const beam=new T.Mesh(new T.PlaneGeometry(1.5,1),new T.MeshBasicMaterial({map:shaftTexture,color:0xffd36b,transparent:true,opacity:0,depthWrite:false,side:T.DoubleSide,blending:T.AdditiveBlending,toneMapped:false}));
  beam.name='Buddha palm blessing beam';beam.frustumCulled=false;fx.add(beam);
  const view=new T.Vector3(),side=new T.Vector3(),face=new T.Vector3(),beamBasis=new T.Matrix4();beam.onBeforeRender=(_renderer,_scene,camera)=>{camera.getWorldPosition(view);view.sub(beam.position).normalize();side.crossVectors(direction,view);if(side.lengthSq()<1e-6)side.set(1,0,0);else side.normalize();face.crossVectors(side,direction).normalize();beamBasis.makeBasis(side,direction,face);beam.quaternion.setFromRotationMatrix(beamBasis);beam.updateMatrixWorld();};
  const glow=new T.Mesh(new T.PlaneGeometry(3.2,3.2),new T.MeshBasicMaterial({map:glowTexture,color:0xffd879,transparent:true,opacity:0,depthWrite:false,blending:T.AdditiveBlending,toneMapped:false}));
  glow.name='Player blessing soft ground light';glow.rotation.x=-Math.PI/2;fx.add(glow);
  // A single static point buffer; only uniforms advance the flowing sparks.
  const seeds=new Float32Array(96*4);for(let i=0;i<96;i++){seeds[i*4]=(i*.61803398875)%1;seeds[i*4+1]=(i*.754877666)%1;seeds[i*4+2]=(i*.56984029)%1;seeds[i*4+3]=i%13===0?1:0;}
  const sparkGeometry=new T.BufferGeometry();sparkGeometry.setAttribute('position',new T.BufferAttribute(new Float32Array(96*3),3));sparkGeometry.setAttribute('aSeed',new T.BufferAttribute(seeds,4));
  const sparkMaterial=new T.ShaderMaterial({transparent:true,depthWrite:false,blending:T.AdditiveBlending,toneMapped:false,uniforms:{uStart:{value:new T.Vector3()},uEnd:{value:new T.Vector3()},uTime:{value:0},uStrength:{value:0}},vertexShader:`attribute vec4 aSeed;uniform vec3 uStart;uniform vec3 uEnd;uniform float uTime;uniform float uStrength;varying float vAlpha;varying float vStar;void main(){float t=fract(aSeed.x+uTime*(.22+.11*aSeed.y));vec3 axis=normalize(uEnd-uStart);vec3 right=normalize(cross(axis,abs(axis.y)>.96?vec3(1.,0.,0.):vec3(0.,1.,0.)));vec3 up=cross(right,axis);float angle=6.2831853*aSeed.y+uTime*(.25+aSeed.z*.18);float radius=(.06+.42*t)*sqrt(aSeed.z);vec3 p=mix(uStart,uEnd,t)+radius*(cos(angle)*right+sin(angle)*up);vec4 mv=viewMatrix*vec4(p,1.);gl_Position=projectionMatrix*mv;vStar=aSeed.w;float pulse=.35+.65*pow(.5+.5*sin(uTime*(3.+aSeed.z*3.)+aSeed.x*31.),3.);vAlpha=uStrength*pow(sin(3.14159265*t),.7)*pulse;gl_PointSize=clamp((aSeed.w>.5?17.:7.)*28./max(1.,-mv.z),2.,24.);}`,fragmentShader:`varying float vAlpha;varying float vStar;void main(){vec2 q=gl_PointCoord*2.-1.;float r=length(q);float core=exp(-r*r*6.);float rays=pow(max(0.,1.-abs(q.x*q.y)*24.),3.)*pow(max(0.,1.-r),1.6);float alpha=vAlpha*(core*.65+vStar*rays*.75);if(alpha<.008)discard;gl_FragColor=vec4(mix(vec3(1.,.63,.14),vec3(1.,.95,.68),core),alpha);
#include <colorspace_fragment>
}`});
  const sparks=new T.Points(sparkGeometry,sparkMaterial);sparks.name='Flowing golden blessing stars';sparks.frustumCulled=false;fx.add(sparks);
  // Bounds include the reach. The untouched pedestal/head keep their exact source vertices.
  geometry.boundingSphere.radius+=1.5;
  function pivot(out,point,angle){out.makeTranslation(point.x,point.y,point.z);rotation.makeRotationX(angle);out.multiply(rotation);translation.makeTranslation(-point.x,-point.y,-point.z);out.multiply(translation);}
  function applyPose(value){
   if(value===lastPose)return;lastPose=value;
   if(value===0){mesh.geometry=sourceGeometry;mesh.material=sourceMaterial;upperMatrix.identity();foreMatrix.identity();handMatrix.identity();return;}mesh.geometry=geometry;mesh.material=activeMaterial;
   const strength=smooth(value);handBlend.value=strength;pivot(upperMatrix,shoulder,-.55*strength);pivot(pivotMatrix,elbow,-.75*strength);foreMatrix.copy(upperMatrix).multiply(pivotMatrix);pivot(pivotMatrix,wrist,(rig.handReplacement?.wristAngle||0)*strength);handMatrix.copy(foreMatrix).multiply(pivotMatrix);
   upperNormal.setFromMatrix4(upperMatrix);foreNormal.setFromMatrix4(foreMatrix);handNormal.setFromMatrix4(handMatrix);
   for(const [index,a,b,c]of entries){
    const offset=index*3,base=1-a-b-c,morph=handMorph.get(index)||bodyMorph.get(index);p.fromArray(restPositions,offset);if(morph)p.lerp(morph.position,strength);sum.copy(p).multiplyScalar(base);sum.addScaledVector(v.copy(p).applyMatrix4(upperMatrix),a);sum.addScaledVector(v.copy(p).applyMatrix4(foreMatrix),b);sum.addScaledVector(v.copy(p).applyMatrix4(handMatrix),c);sum.toArray(position.array,offset);
    n.set(restNormals[offset]/127,restNormals[offset+1]/127,restNormals[offset+2]/127);if(morph)n.lerp(morph.normal,strength).normalize();sum.copy(n).multiplyScalar(base);sum.addScaledVector(v.copy(n).applyMatrix3(upperNormal),a);sum.addScaledVector(v.copy(n).applyMatrix3(foreNormal),b);sum.addScaledVector(v.copy(n).applyMatrix3(handNormal),c);sum.normalize();normal.array[offset]=Math.round(sum.x*127);normal.array[offset+1]=Math.round(sum.y*127);normal.array[offset+2]=Math.round(sum.z*127);
   }
   for(const[index,y,nx,ny,nz]of repairEntries){const offset=index*3;position.array[offset+1]=restPositions[offset+1]+(y-restPositions[offset+1])*strength;sum.set(restNormals[offset]/127,restNormals[offset+1]/127,restNormals[offset+2]/127).lerp(v.set(nx,ny,nz),strength).normalize();normal.array[offset]=Math.round(sum.x*127);normal.array[offset+1]=Math.round(sum.y*127);normal.array[offset+2]=Math.round(sum.z*127);}
   dirty();
  }
  function palmPosition(out=palmWorld){mesh.updateWorldMatrix(true,false);out.copy(palm);if(newPalm)out.lerp(newPalm,smooth(progress));return out.applyMatrix4(handMatrix).applyMatrix4(mesh.matrixWorld);}
  function palmNormal(out=new T.Vector3()){mesh.updateWorldMatrix(true,false);out.fromArray(rig.palmNormal);if(newPalmNormal)out.lerp(newPalmNormal,smooth(progress)).normalize();return out.transformDirection(handMatrix).transformDirection(mesh.matrixWorld);}
  function begin(object){if(disposed||!object?.getWorldPosition)return false;target=object;hold=2.2;phase='raise';return true;}
  function end(){hold=0;if(progress>0)phase='return';else{phase='idle';target=null;fx.visible=false;}}
  function update(dt){
   if(disposed||phase==='idle')return;
   dt=Math.max(0,Math.min(Number(dt)||0,.1));
   lightTime+=dt;
   if(phase==='raise'){progress=Math.min(1,progress+dt/1.4);if(progress===1)phase='hold';}
   else if(phase==='hold'){hold-=dt;if(hold<=0)phase='return';}
   else{progress=Math.max(0,progress-dt/1.4);if(progress===0){phase='idle';target=null;}}
   applyPose(progress);
   const strength=smooth(clamp((progress-.5)*2));fx.visible=strength>0&&!!target;
   if(!fx.visible)return;
   palmPosition();target.updateWorldMatrix(true,false);target.getWorldPosition(targetPoint);glow.position.copy(targetPoint);glow.position.y+=.018;targetPoint.y+=.86;
   direction.subVectors(palmWorld,targetPoint);const length=direction.length();if(length<.01||!Number.isFinite(length)){fx.visible=false;return;}
   beam.position.copy(palmWorld).add(targetPoint).multiplyScalar(.5);beam.scale.set(1,length,1);beam.quaternion.setFromUnitVectors(up,direction.divideScalar(length));beam.material.opacity=.16*strength;glow.material.opacity=.30*strength;sparkMaterial.uniforms.uStart.value.copy(palmWorld);sparkMaterial.uniforms.uEnd.value.copy(targetPoint);sparkMaterial.uniforms.uTime.value=lightTime;sparkMaterial.uniforms.uStrength.value=strength;
  }
  function dispose(){if(disposed)return;disposed=true;applyPose(0);geometry.dispose();activeMaterial.dispose();fx.removeFromParent();beam.geometry.dispose();beam.material.dispose();shaftTexture.dispose();glow.geometry.dispose();glow.material.dispose();glowTexture.dispose();sparkGeometry.dispose();sparkMaterial.dispose();target=null;}
  return{begin,update,end,dispose,palmPosition,palmNormal,get state(){return{phase,progress,hold,weightedVertices:entries.length,uploadRanges:ranges.length,uploadBytes:ranges.reduce((n,r)=>n+r.count*5,0),repairedContactLoops:rig.caps?.length||0,disposed};}};
 }
 window.TempleStatue={create(T,world){
  const state={ready:false,error:null,triangles:0,gold:true,guanyinReady:false,guanyinError:null,leftStatueReady:false,leftStatueError:null,placements:{}},original=[...world.statue.children];
  const layout=window.TempleNavigation.templeSceneLayout,approved=layout.design.altar.statues;
  const centre=approved.find(s=>s.asset==='buddha-statue'),left=approved.find(s=>s.asset==='left-altar-statue'),right=approved.find(s=>s.asset==='guanyin-statue');
  const altarY=centre.position[1],altarZ=centre.position[2],parent=world.interiorRoot||world.scene,floorY=world.floorY??0;
  world.statue.position.set(...centre.position);
  // A restrained studio reflection gives gold a readable surface without tinting the entire hall.
  const envFaces=[];
  for(let side=0;side<6;side++){
   const c=document.createElement('canvas');c.width=c.height=128;const ctx=c.getContext('2d'),g=ctx.createLinearGradient(0,0,0,128);
   g.addColorStop(0,side===2?'#fff4d9':'#a99b7c');g.addColorStop(.45,'#5e4834');g.addColorStop(.75,'#bca780');g.addColorStop(1,'#34291f');ctx.fillStyle=g;ctx.fillRect(0,0,128,128);ctx.fillStyle='rgba(255,241,205,.75)';ctx.fillRect(side%2?20:76,8,14,90);envFaces.push(c);
  }
  const reflection=new T.CubeTexture(envFaces);reflection.colorSpace=T.SRGBColorSpace;reflection.needsUpdate=true;
  async function load(file){
   const r=await TempleAssets.fetch('assets/'+file+'.json');if(!r.ok)throw Error('Statue manifest unavailable');const m=await r.json(),data=await TempleAssets.fetch('assets/'+m.file);if(!data.ok)throw Error('Statue geometry unavailable');const b=await data.arrayBuffer();if(b.byteLength!==m.byteLength)throw Error('Statue geometry length mismatch');
   const g=new T.BufferGeometry();for(const name of ['position','uv']){const a=m.attributes[name],size=name==='uv'?2:3,src=new Uint16Array(b,a.byteOffset,a.length),v=new Float32Array(a.length);for(let i=0;i<v.length;i++)v[i]=a.min[i%size]+src[i]/65535*a.scale[i%size];g.setAttribute(name,new T.BufferAttribute(v,size));}
   const n=m.attributes.normal;g.setAttribute('normal',new T.BufferAttribute(new Int8Array(b,n.byteOffset,n.length),3,true));const ix=m.attributes.index;g.setIndex(new T.BufferAttribute(new Uint32Array(b,ix.byteOffset,ix.length),1));g.computeBoundingSphere();g.computeBoundingBox();
   const texture=await TempleAssets.texture(T,'assets/'+m.texture);texture.colorSpace=T.SRGBColorSpace;texture.flipY=true;texture.anisotropy=4;
   return{g,texture,m};
  }
  function fit(mesh,x,y,z,key){
   const spec=key==='center'?centre:key==='left'?left:right,statueHeight=spec.height;
   const bounds=mesh.geometry.boundingBox,scale=statueHeight/(bounds.max.y-bounds.min.y),attachmentInset=.003;
   // The source has double-sided bottom faces. A 3mm contact inset places them
   // inside the opaque cap instead of sharing its visible top plane.
   mesh.scale.setScalar(scale);mesh.position.set(x,y-bounds.min.y*scale-attachmentInset,z);
   mesh.castShadow=mesh.receiveShadow=true;
   state.placements[key]={x:key==='center'?centre.position[0]:x,y:floorY+(key==='center'?altarY:y)-attachmentInset,supportY:floorY+(key==='center'?altarY:y),attachmentInset,z:key==='center'?altarZ:z,height:statueHeight,width:(bounds.max.x-bounds.min.x)*scale,depth:(bounds.max.z-bounds.min.z)*scale};
   return mesh;
  }
  function aura(){
   const c=document.createElement('canvas');c.width=c.height=256;const ctx=c.getContext('2d'),g=ctx.createRadialGradient(128,128,10,128,128,128);
   g.addColorStop(0,'rgba(255,221,124,.32)');g.addColorStop(.28,'rgba(255,207,103,.24)');g.addColorStop(.68,'rgba(235,174,71,.10)');g.addColorStop(1,'rgba(235,174,71,0)');ctx.fillStyle=g;ctx.fillRect(0,0,256,256);
   const texture=new T.CanvasTexture(c);texture.colorSpace=T.SRGBColorSpace;
   const glow=new T.Mesh(new T.PlaneGeometry(13,13),new T.MeshBasicMaterial({map:texture,transparent:true,depthWrite:false,blending:T.AdditiveBlending,side:T.DoubleSide,toneMapped:false}));
   glow.name='Soft golden Buddha radiance';glow.position.set(0,8.5,-3.7);world.statue.add(glow);
   const warm=new T.PointLight(0xffcf6b,30,25,2);warm.position.set(0,11,-5.5);parent.add(warm);
  }
  let blessing=null,blessingTarget=null,blessingDisposed=false;
  const ready=load('buddha-statue').then(async({g,texture,m})=>{
   const material=new T.MeshStandardMaterial({map:texture,color:0xffedbb,metalness:.72,roughness:.27,envMap:reflection,envMapIntensity:1.7,emissive:0xc18a24,emissiveIntensity:.14,side:T.DoubleSide});
   const mesh=fit(new T.Mesh(g,material),0,0,0,'center');mesh.name='Uploaded seated Buddha';world.statue.add(mesh);original.forEach(o=>o.visible=false);aura();state.triangles=m.triangleCount;state.ready=true;
   try{const response=await TempleAssets.fetch('assets/buddha-blessing-rig.json');if(!response.ok)throw Error('Buddha blessing rig unavailable');const rig=await response.json();if(!blessingDisposed){blessing=blessingRig(T,mesh,world,rig);state.blessingReady=true;if(blessingTarget)blessing.begin(blessingTarget);}}catch(error){state.blessingError=String(error.message||error);}
   return mesh;
  }).catch(e=>{state.error=String(e.message||e);console.error('Statue:',e);});
  const guanyinReady=ready.then(()=>TempleAssets.yieldFrame()).then(()=>load('guanyin-statue')).then(({g,texture,m})=>{
   const mesh=fit(new T.Mesh(g,new T.MeshStandardMaterial({map:texture,metalness:.15,roughness:.47,envMap:reflection,envMapIntensity:.45,side:T.DoubleSide})),...right.position,'guanyin');
   mesh.name='Uploaded Guanyin at right altar';parent.add(mesh);state.guanyinReady=true;state.guanyinTriangles=m.triangleCount;return mesh;
  }).catch(e=>{state.guanyinError=String(e.message||e);console.error('Guanyin:',e);});
  const leftStatueReady=ready.then(()=>TempleAssets.yieldFrame()).then(()=>load('left-altar-statue')).then(({g,texture,m})=>{
   const mesh=fit(new T.Mesh(g,new T.MeshStandardMaterial({map:texture,metalness:.15,roughness:.47,envMap:reflection,envMapIntensity:.45,side:T.DoubleSide})),...left.position,'left');
   mesh.name='Uploaded crowned statue at left altar';parent.add(mesh);state.leftStatueReady=true;state.leftStatueTriangles=m.triangleCount;return mesh;
  }).catch(e=>{state.leftStatueError=String(e.message||e);console.error('Left altar statue:',e);});
  return{state,ready,guanyinReady,leftStatueReady,beginBlessing(target){if(blessingDisposed||state.error||state.blessingError||!target?.getWorldPosition)return false;blessingTarget=target;return blessing?blessing.begin(target):true;},updateBlessing(dt){blessing?.update(dt);if(blessing)state.blessing=blessing.state;},endBlessing(){blessingTarget=null;blessing?.end();},getPalmWorldPosition(out){return blessing?.palmPosition(out)||null;},getPalmWorldNormal(out){return blessing?.palmNormal(out)||null;},disposeBlessing(){blessingDisposed=true;blessingTarget=null;blessing?.dispose();state.blessingReady=false;}};
 }};
})();
;
/* User-supplied models; originals remain untouched. Shared geometry for both oil lamps. */
(function(){
 'use strict';
 window.TempleUploadedProps={create(T,world,coreReady=Promise.resolve()){
  const nav=window.TempleNavigation,L=nav.templeSceneLayout,state={ready:false,assets:{},placements:{},errors:[]};
  async function load(name,metalness,roughness){
   const mr=await TempleAssets.fetch('assets/'+name+'.json');if(!mr.ok)throw Error(name+' manifest unavailable');const m=await mr.json();
   const response=await TempleAssets.fetch('assets/'+m.file);if(!response.ok)throw Error(name+' mesh unavailable');const bytes=await response.arrayBuffer();if(bytes.byteLength!==m.byteLength)throw Error(name+' mesh length mismatch');
   const geometry=new T.BufferGeometry();
   for(const key of['position','uv']){const a=m.attributes[key],size=key==='position'?3:2,packed=new Uint16Array(bytes,a.byteOffset,a.length),values=new Float32Array(a.length);for(let i=0;i<values.length;i++)values[i]=a.min[i%size]+packed[i]/65535*a.scale[i%size];geometry.setAttribute(key,new T.BufferAttribute(values,size));}
   const normal=m.attributes.normal,index=m.attributes.index;geometry.setAttribute('normal',new T.BufferAttribute(new Int8Array(bytes,normal.byteOffset,normal.length),3,true));geometry.setIndex(new T.BufferAttribute(new Uint32Array(bytes,index.byteOffset,index.length),1));geometry.computeBoundingBox();geometry.computeBoundingSphere();
   const texture=await TempleAssets.texture(T,'assets/'+m.texture);texture.colorSpace=T.SRGBColorSpace;texture.flipY=true;texture.anisotropy=4;
   const material=new T.MeshStandardMaterial({map:texture,metalness,roughness,side:T.DoubleSide});state.assets[name]={ready:true,triangles:m.triangleCount,bytes:m.compressedBytes,sourceSha256:m.sourceSha256};return{geometry,material};
  }
  function place(asset,name,position,height,exterior=false){
   const mesh=new T.Mesh(asset.geometry,asset.material),bounds=asset.sourceBounds||asset.geometry.boundingBox,scale=height/(bounds.max.y-bounds.min.y),supportY=position[1],inset=.004;
   mesh.name=name;mesh.scale.setScalar(scale);mesh.position.set(position[0],supportY-bounds.min.y*scale-inset,position[2]);mesh.castShadow=mesh.receiveShadow=true;
   (exterior?world.scene:world.interiorRoot).add(mesh);if(exterior)mesh.layers.set(1);
   state.placements[name]={position:mesh.position.toArray(),supportY,height,width:(bounds.max.x-bounds.min.x)*scale,depth:(bounds.max.z-bounds.min.z)*scale,contactInset:inset};return mesh;
  }
  let ashGeometry,ashMaterial;
  function fillIncenseAsh(mesh,anchor,target,site){
   // Measured against the original packed burner: the handles reach y=1.0,
   // but its open rim is y~.819. At y=.809 the inner wall radius is .2981-.3056.
   // This opaque fill overlaps the inner wall slightly, safely below the lip.
   const top=.809,radius=.3075,depth=.018;
   if(!ashGeometry){
    ashGeometry=new T.CylinderGeometry(radius,radius,depth,64);
    const pixels=new Uint8Array(64*64*4);let seed=731;
    for(let i=0;i<pixels.length;i+=4){seed=(Math.imul(seed,1664525)+1013904223)>>>0;const grain=222+(seed%28);pixels.set([grain,grain,grain,255],i);}
    const grain=new T.DataTexture(pixels,64,64);grain.colorSpace=T.SRGBColorSpace;grain.magFilter=grain.minFilter=T.LinearFilter;grain.needsUpdate=true;
    ashMaterial=new T.MeshStandardMaterial({color:0xb5afa0,map:grain,roughness:1});
   }
   const ash=new T.Mesh(ashGeometry,ashMaterial);ash.name='Filled incense ash '+site;ash.position.y=top-depth/2;ash.receiveShadow=true;mesh.add(ash);anchor.ash=ash;
   mesh.updateWorldMatrix(true,true);const centre=mesh.localToWorld(new T.Vector3(0,top,0));
   // Keep the authoritative ritual approach unchanged; only its visual surface
   // is updated. Existing incense follows this same mutable surface reference.
   target.ashY=centre.y;target.ashRadius=radius*mesh.scale.x;
   state.ash??={};state.ash[site]={sourceY:top,sourceRadius:radius,worldY:centre.y,worldRadius:target.ashRadius,triangles:ashGeometry.index.count/3};
  }
  function enlargeOilFlame(asset){
   const g=asset.geometry,p=g.attributes.position,n=g.attributes.normal,index=g.index,parents=Array.from({length:p.count},(_,i)=>i);
   function find(i){while(parents[i]!==i){parents[i]=parents[parents[i]];i=parents[i];}return i;}
   for(let i=0;i<index.count;i+=3){const a=find(index.getX(i));parents[find(index.getX(i+1))]=a;parents[find(index.getX(i+2))]=a;}
   // Only connected components reaching the source flame tip are enlarged.
   // The bowl, wick base, shaft and pedestal retain their original vertices.
   const tips=new Set();for(let i=0;i<p.count;i++)if(p.getY(i)>.95)tips.add(find(i));
   const bounds=new T.Box3(),point=new T.Vector3();let count=0;
   for(let i=0;i<p.count;i++)if(tips.has(find(i))){bounds.expandByPoint(point.fromBufferAttribute(p,i));count++;}
   if(!count)throw Error('Oil lamp flame tip missing');
   asset.sourceBounds=g.boundingBox.clone();const center=bounds.getCenter(new T.Vector3()),sx=2.4,sy=2;
   for(let i=0;i<p.count;i++)if(tips.has(find(i))){
    p.setXYZ(i,center.x+(p.getX(i)-center.x)*sx,bounds.min.y+(p.getY(i)-bounds.min.y)*sy,center.z+(p.getZ(i)-center.z)*sx);
    point.set(n.getX(i)/sx,n.getY(i)/sy,n.getZ(i)/sx).normalize();n.setXYZ(i,point.x,point.y,point.z);
   }
   p.needsUpdate=n.needsUpdate=true;g.computeBoundingBox();g.computeBoundingSphere();
   state.oilFlame={widthScale:sx,heightScale:sy,vertices:count,baseY:bounds.min.y,tipY:bounds.min.y+(bounds.max.y-bounds.min.y)*sy};return state.oilFlame;
  }
  const tasks=[
   coreReady.then(()=>TempleAssets.yieldFrame()).then(()=>load('caishen',.12,.56)).then(asset=>place(asset,'财神',L.props.caishen.position,L.props.caishen.height)),
   coreReady.then(()=>TempleAssets.yieldFrame()).then(()=>load('wishing-tree',0,.92)).then(asset=>{const spec=L.props.wishingTree,[x,,z]=spec.position;return place(asset,'祈愿树',[x,nav.templeStoneHeight(x,z)+.025,z],spec.height,true);}),
   coreReady.then(()=>load('incense-burner',.35,.52)).then(asset=>{const anchor=world.propAnchors.burner,main=place(asset,'上传的香炉',anchor.position,L.props.burner.height);fillIncenseAsh(main,anchor,world.rituals.incense.burner,'hall');anchor.fallback.visible=false;const wealth=world.propAnchors.wealthBurner,second=place(asset,'财神殿香炉',wealth.position,L.props.wealthBurner.height);fillIncenseAsh(second,wealth,world.rituals.wealthIncense.burner,'wealth');wealth.fallback.visible=false;}),
   coreReady.then(()=>load('oil-lamp',.25,.57)).then(asset=>{
    const flame=enlargeOilFlame(asset);
    asset.material.onBeforeCompile=shader=>{shader.vertexShader='varying float vOilLampHeight;\n'+shader.vertexShader;shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nvOilLampHeight=position.y;');shader.fragmentShader='varying float vOilLampHeight;\n'+shader.fragmentShader;shader.fragmentShader=shader.fragmentShader.replace('#include <emissivemap_fragment>','#include <emissivemap_fragment>\ntotalEmissiveRadiance+=vec3(1.4,.75,.18)*smoothstep(.85,.88,vOilLampHeight);');};asset.material.customProgramCacheKey=()=> 'uploaded-oil-flame-v2';
    world.propAnchors.oilLamps.forEach((anchor,i)=>{const mesh=place(asset,anchor.label??'佛前油灯'+(i+1),anchor.position,anchor.height??L.props.oilLamps.height);anchor.fallback.visible=false;const light=new T.PointLight(0xffcf7d,1.6,4,2);light.position.set(anchor.position[0],mesh.position.y+(flame.baseY+flame.tipY)*.5*mesh.scale.y,anchor.position[2]);world.interiorRoot.add(light);});
   })
  ];
  const ready=Promise.all(tasks.map(p=>p.catch(e=>{state.errors.push(String(e.message||e));console.error('Uploaded prop:',e);}))).then(()=>{state.ready=state.errors.length===0;});
  return{state,ready};
 }};
})();
;
(function(){
 'use strict';
 window.TempleIslandGarden={create(T,world,exterior,navigation){
  const data=navigation.templeGardenLayout;if(!data)throw Error('Shared garden layout unavailable');
  const group=new T.Group();group.name='Quiet island garden - approved A01 R2';group.layers.set(1);world.scene.add(group);
  const state={ready:false,error:null,seats:data.seats.length,westTrailPoints:0,oldWalkwayRetired:true,shorelinePreserved:true};
  const wood=new T.MeshStandardMaterial({color:0x584235,roughness:.85}),redwood=new T.MeshStandardMaterial({color:0x6b4035,roughness:.8}),linen=new T.MeshStandardMaterial({color:0xc3b28e,roughness:1}),stone=new T.MeshStandardMaterial({color:0xc8c0aa,roughness:.96});
  function mesh(geo,mat,x,y,z,parent=group){const m=new T.Mesh(geo,mat);m.position.set(x,y,z);m.layers.set(1);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;}
  const cube=new T.BoxGeometry(1,1,1);function box(w,h,d,mat,x,y,z,parent){const m=mesh(cube,mat,x,y,z,parent);m.scale.set(w,h,d);return m;}
  const surfaces=navigation.templeGetStructure(),padY=id=>{const s=surfaces.find(s=>s.id==='garden-pad-'+id);if(!s)throw Error('Garden support surface missing: '+id);return s.topY??s.vertices[0][1];};
  const soilY=(x,z)=>navigation.templeStoneHeight(x,z)+.025;
  world.interactables??=[];world.seats??=[];world.cameraObstacles??=[];world.seatProps??={};
  const seatSize=data.seatSize;
  for(const seat of data.seats){
   const padId=seat.id.startsWith('garden-east')?'east':seat.id.startsWith('garden-west')?'west':'sea',floor=padY(padId),chair=new T.Group();chair.name=seat.id+' timber chair';chair.position.set(seat.position[0],floor,seat.position[2]);chair.rotation.y=seat.yaw;group.add(chair);
   const cushion=box(seatSize.width,.10,seatSize.depth,linen,0,seatSize.height-.05,0,chair);cushion.name=seat.id+' clickable seat';cushion.userData.seatId=seat.id;world.interactables.push(cushion);
   for(const x of[-.29,.29])for(const z of[-.25,.25])box(.08,.32,.08,wood,x,.16,z,chair);
   box(.77,.06,.13,redwood,0,.15,.245,chair); // top .18 = articulated seated feet
   box(seatSize.backWidth,seatSize.backHeight,seatSize.backDepth,wood,0,seatSize.backY,seatSize.backZ,chair);for(const x of[-.37,.37])box(.07,.65,.07,redwood,x,.525,seatSize.backZ,chair);
   if(!world.seats.some(s=>s.id===seat.id))world.seats.push(seat);
   if(seat.action==='tea'){
    const cup=new T.Group();cup.name=seat.id+' resting cup';cup.userData.cupForSeat=seat.id;cup.rotation.y=seat.yaw;
    const c=Math.cos(seat.yaw),s=Math.sin(seat.yaw);cup.position.set(seat.position[0]+c*.185+s*.375,floor+seat.seatHeight+.28,seat.position[2]-s*.185+c*.375);group.add(cup);
    const ceramic=new T.MeshStandardMaterial({color:0x839a88,roughness:.45});mesh(new T.CylinderGeometry(.065,.047,.105,16),ceramic,0,.0525,0,cup);mesh(new T.CylinderGeometry(.058,.058,.003,16),new T.MeshStandardMaterial({color:0x896d3f}),0,.094,0,cup);
    mesh(new T.TorusGeometry(.032,.009,6,14),ceramic,.075,.055,0,cup);world.seatProps[seat.id]={cup};
   }
  }
  function teaTable(x,z,w,d,padId){const y=padY(padId);box(w,.06,d,wood,x,y+.67,z);for(const dx of[-w/2+.06,w/2-.06])for(const dz of[-d/2+.06,d/2-.06])box(.08,.64,.08,redwood,x+dx,y+.32,z+dz);
  }
  teaTable(99,135,1.4,.8,'east');teaTable(0,264.8,2.2,.9,'sea');
  // Sparse local planting leaves the walk and seated camera envelope clear.
  const leafMat=new T.MeshStandardMaterial({color:0x6e8161,roughness:1}),bloomMat=new T.MeshStandardMaterial({color:0xd6b4bd,roughness:.9}),treeGeo=new T.IcosahedronGeometry(1,1);
  for(const trunk of data.treeObstacles){const{x,z}=trunk,y=soilY(x,z);if(!Number.isFinite(y))continue;
   const stem=mesh(new T.CylinderGeometry(trunk.radius*2/3,trunk.radius,1,7),wood,x,y+trunk.height/2,z);stem.name=trunk.id;stem.scale.y=trunk.height;
   const canopy=mesh(treeGeo,trunk.padId==='west'?leafMat:bloomMat,x,y+2.0,z);canopy.scale.set(.85,.95,.8);
   world.cameraObstacles.push({x,y:y+1.3,z,hx:.9,hy:1.4,hz:.85,label:'静修点花木'});
  }
  for(const pad of data.pads){
   const x=pad.x-1.35,z=pad.z-1.60,y=padY(pad.id),c=document.createElement('canvas');c.width=256;c.height=64;const ctx=c.getContext('2d');ctx.fillStyle='#4d3b2c';ctx.fillRect(0,0,256,64);ctx.fillStyle='#dfd0ae';ctx.font='28px sans-serif';ctx.textAlign='center';ctx.fillText(pad.title,128,42);
   const tx=new T.CanvasTexture(c);tx.colorSpace=T.SRGBColorSpace;const sign=mesh(new T.PlaneGeometry(1.45,.36),new T.MeshBasicMaterial({map:tx,side:T.DoubleSide}),x,y+.93,z);sign.name=pad.title+' sign';box(.07,.75,.07,wood,x,y+.375,z);
  }
  state.ready=true;const ready=Promise.resolve();
  return{state,ready,group,update(){},cameraObstacles:world.cameraObstacles};
 }};
})();
;
/* Public-domain classical source text, checked 2026-11-04. No modern commentary or generated scripture. */
(function(){
 'use strict';
 const entries=[
  {id:'heart',title:'般若波羅蜜多心經',titleEn:'Heart Sutra',section:'玄奘譯本 · 經文',attribution:'唐 · 玄奘譯；大正藏 T0251',source:'https://zh.wikisource.org/wiki/般若波羅蜜多心經_(玄奘譯)',text:'觀自在菩薩，行深般若波羅蜜多時，照見五蘊皆空，度一切苦厄。\n\n舍利子！色不異空，空不異色，色即是空，空即是色；受、想、行、識，亦復如是。\n\n舍利子！是諸法空相，不生不滅，不垢不淨，不增不減。是故，空中無色，無受、想、行、識；無眼、耳、鼻、舌、身、意；無色、聲、香、味、觸、法；無眼界，乃至無意識界；無無明，亦無無明盡，乃至無老死，亦無老死盡；無苦、集、滅、道；無智，亦無得，以無所得故。\n\n菩提薩埵，依般若波羅蜜多故，心無罣礙；無罣礙故，無有恐怖，遠離顛倒夢想，究竟涅槃。三世諸佛，依般若波羅蜜多故，得阿耨多羅三藐三菩提。\n\n故知般若波羅蜜多，是大神咒，是大明咒，是無上咒，是無等等咒，能除一切苦，真實不虛。故說般若波羅蜜多咒，即說咒曰：揭諦，揭諦，波羅揭諦，波羅僧揭諦，菩提薩婆訶。'},
  {id:'diamond-non-abiding',title:'金剛般若波羅蜜經',titleEn:'Diamond Sutra',section:'莊嚴淨土分第十 · 節選',attribution:'姚秦 · 鳩摩羅什譯；大正藏 T0235',source:'https://zh.wikisource.org/wiki/金剛般若波羅蜜經_(鳩摩羅什)',text:'佛告須菩提：「於意云何？如來昔在燃燈佛所，於法有所得不？」\n\n「不也，世尊！如來在燃燈佛所，於法實無所得。」\n\n「須菩提！於意云何？菩薩莊嚴佛土不？」\n\n「不也，世尊！何以故？莊嚴佛土者，即非莊嚴，是名莊嚴。」\n\n「是故，須菩提！諸菩薩摩訶薩，應如是生清淨心，不應住色生心，不應住聲、香、味、觸、法生心，應無所住而生其心。」'},
  {id:'eight-awakenings',title:'佛說八大人覺經',titleEn:'Eight Awakenings Sutra',section:'八大人覺 · 節選',attribution:'東漢 · 安世高譯；大正藏 T0779',source:'https://zh.wikisource.org/wiki/佛說八大人覺經',text:'為佛弟子，常於晝夜，至心誦念八大人覺：\n\n第一覺悟：世間無常；國土危脆，四大苦空，五陰無我，生滅變異，虛偽無主，心是惡源，形為罪藪，如是觀察，漸離生死。\n\n第二覺知：多欲為苦；生死疲勞，從貪慾起，少欲無為，身心自在。\n\n第三覺知：心無厭足，唯得多求，增長罪惡；菩薩不爾，常念知足，安貧守道，唯慧是業。\n\n第四覺知：懈怠墜落；常行精進，破煩惱惡，摧伏四魔，出陰界獄。\n\n第五覺悟：愚癡生死；菩薩常念，廣學多聞，增長智慧，成就辯才，教化一切，悉以大樂。\n\n第六覺知：貧苦多怨，橫結惡緣；菩薩佈施，等念怨親，不念舊惡，不憎惡人。\n\n第七覺悟：五欲過患；雖為俗人，不染世樂，常念三衣，瓦缽法器，志願出家，守道清白，梵行高遠，慈悲一切。\n\n第八覺知：生死熾然，苦惱無量；發大乘心，普濟一切，願代眾生，受無量苦，令諸眾生，畢竟大樂。'},
  {id:'last-teaching-mind',title:'佛遺教經',titleEn:'Sutra of the Last Teaching',section:'攝心與飲食 · 節選',attribution:'姚秦 · 鳩摩羅什譯；大正藏 T0389',source:'https://zh.wikisource.org/wiki/佛遺教經',text:'此五根者，心為其主，是故汝等當好制心。心之可畏，甚於毒蛇、惡獸、怨賊、大火越逸，未足喻也。譬如有人，手執蜜器，動轉輕躁，但觀於蜜，不見深阬。譬如狂象無鉤，猿猴得樹，騰躍踔躑，難可禁制。當急挫之，無令放逸。縱此心者，喪人善事；制之一處，無事不辦。是故比丘，當勤精進，折伏汝心。\n\n汝等比丘，受諸飲食，當如服藥，於好於惡，勿生增減。趣得支身，以除饑渴。如蜂採華，但取其味，不損色香；比丘亦爾，受人供養，趣自除惱，無得多求，壞其善心。譬如智者，籌量牛力所堪多少，不令過分，以竭其力。'},
  {id:'amitabha-lotus',title:'佛說阿彌陀經',titleEn:'Amitabha Sutra',section:'七寶池與蓮華 · 節選',attribution:'姚秦 · 鳩摩羅什譯；大正藏 T0366',source:'https://zh.wikisource.org/wiki/佛說阿彌陀經',text:'又舍利弗！極樂國土有七寶池，八功德水充滿其中，池底純以金沙布地。四邊階道，金、銀、琉璃、玻瓈、合成；上有樓閣，亦以金、銀、琉璃、玻瓈、硨磲、赤珠、瑪瑙而嚴飾之。池中蓮華，大如車輪，青色青光，黃色黃光，赤色赤光，白色白光，微妙香潔。舍利弗！極樂國土成就如是功德莊嚴。\n\n又舍利弗！彼佛國土，常作天樂，黃金為地，晝夜六時，雨天曼陀羅華。其土眾生，常以清旦，各以衣裓盛眾妙華，供養他方十萬億佛；即以食時，還到本國，飯食經行。舍利弗！極樂國土成就如是功德莊嚴。'},
  {id:'diamond-seeing',title:'金剛般若波羅蜜經',titleEn:'Diamond Sutra',section:'如理實見分第五 · 節選',attribution:'姚秦 · 鳩摩羅什譯；大正藏 T0235',source:'https://zh.wikisource.org/wiki/金剛般若波羅蜜經_(鳩摩羅什)',text:'「須菩提。於意云何？可以身相見如來不？」\n\n「不也，世尊，不可以身相得見如來。何以故？如來所說身相，即非身相。」\n\n佛告須菩提：「凡所有相，皆是虛妄。若見諸相非相，即見如來。」'}
 ];
 for(const entry of entries)Object.freeze(entry);
 function paginate(text,limit=170){
  const sentences=String(text).match(/[^。！？\n]+[。！？]?|\n+/g)||[String(text)],pages=[];let page='';
  for(const sentence of sentences){
   if(page.trim()&&Array.from(page+sentence).length>limit){pages.push(page.trim());page='';}
   if(Array.from(sentence).length>limit){let chars=Array.from(sentence);while(chars.length>limit){if(page.trim()){pages.push(page.trim());page='';}pages.push(chars.splice(0,limit).join(''));}page+=chars.join('');}else page+=sentence;
  }
  if(page.trim())pages.push(page.trim());return pages.length?pages:[''];
 }
 function next(previousId,random=Math.random){const pool=entries.filter(e=>e.id!==previousId);const n=Number(random());return pool[Math.max(0,Math.min(pool.length-1,Math.floor((Number.isFinite(n)?n:0)*pool.length)))];}
 window.TempleScriptures=Object.freeze({entries:Object.freeze(entries),paginate,next,checkedAt:'2026-11-04',rights:'Classical Chinese source works are public domain; ancient wording retained. Modern commentary and translations excluded.'});
})();
;
/* Reading and tea use the shared seat contract. No rewards or client-owned progress. */
(function(){
 'use strict';
 const rows=[
  ['read','读经','讀經','Read scripture'],['sitRead','坐下读经','坐下讀經','Sit and read'],['sitTea','坐下喝茶','坐下喝茶','Sit for tea'],['stand','起身','起身','Stand up'],
  ['library','藏经室 · 读书与茶歇','藏經室 · 讀書與茶歇','Library · Reading and tea'],['teaRoom','暴富 · 财神礼拜','暴富 · 財神禮拜','Wealth hall · Prayer'],['garden','静修园 · 坐读与茶歇','靜修園 · 坐讀與茶歇','Quiet garden · Reading and tea'],
  ['claiming','正在确认空座位…','正在確認空座位…','Checking this seat…'],['walking','慢慢走向座位…','慢慢走向座位…','Walking to your seat…'],['sitting','缓缓坐下','緩緩坐下','Sitting down gently'],['reading','静心读经 · 合书后仍可坐着','靜心讀經 · 合書後仍可坐著','Reading quietly · Close the book to remain seated'],['drinking','端杯轻饮 · 歇一歇','端杯輕飲 · 歇一歇','A quiet cup of tea'],['placing','轻轻放回茶杯','輕輕放回茶杯','Putting the cup back gently'],['standing','收好书杯，缓缓起身','收好書杯，緩緩起身','Putting things away and rising'],['exiting','正在离开座位…','正在離開座位…','Leaving the seat…'],
  ['occupied','这个座位有人，请选旁边的空位。','這個座位有人，請選旁邊的空位。','This seat is occupied. Choose another.'],['noSeat','附近暂时没有合适的空座位。','附近暫時沒有合適的空座位。','There is no suitable free seat nearby.'],['noPath','暂时走不过去，请换个位置再试。','暫時走不過去，請換個位置再試。','The path is blocked. Move a little and try again.'],['walkBlocked','前方暂时有人或物件，请稍候再起身。','前方暫時有人或物件，請稍候再起身。','The exit is temporarily blocked. Please wait a moment.'],
  ['prev','上一页','上一頁','Previous'],['next','下一页','下一頁','Next'],['random','随机换一篇','隨機換一篇','Another scripture'],['close','合书','合書','Close book'],['source','原文出处','原文出處','Source text'],['pages','第 {a} / {b} 页','第 {a} / {b} 頁','Page {a} / {b}'],['note','古典经文保留底本文字；点数仅为游戏记录。','古典經文保留底本文字；點數僅為遊戲紀錄。','Classical Chinese source text is retained. Merit is an in-game record.'],['classical','古典经文阅读','古典經文閱讀','Classical scripture reading']
 ];
 const dict={'zh-CN':{},'zh-TW':{},en:{}};for(const[k,cn,tw,en]of rows){dict['zh-CN'][k]=cn;dict['zh-TW'][k]=tw;dict.en[k]=en;}
 Object.assign(dict,window.TempleLocaleBundles?.room);
 window.TempleRoomActivities={create(options){
  const {THREE:T,world,player,layout,navigation,groundHeight}=options;
  const host=document.getElementById('game')||document.body;
  const el=(tag,className,text)=>{const e=document.createElement(tag);if(className)e.className=className;if(text!==undefined)e.textContent=text;return e;};
  const tr=(key,args={})=>{const lang=window.TempleI18n?.locale||'zh-CN';return(dict[lang]?.[key]||dict.en[key]||key).replace(/\{(\w+)\}/g,(m,k)=>String(args[k]??m));};
  const notice=key=>options.onNotice?.(tr(key));
  let enabled=false,disposed=false,active=null,shown=false,lastFocus=null,lastLocale='',article=null,page=0,pages=[],generation=0,pageTurnUntil=0,lastClock=0,borrowedCup=null;
  const occupancy=new Map(),ray=new T.Raycaster(),pointer=new T.Vector2();
  const controls=el('section','room-actions');controls.id='room-actions';controls.hidden=true;controls.setAttribute('aria-label',tr('classical'));
  const status=el('p','room-action-title'),buttons=el('div','room-action-buttons');status.setAttribute('role','status');controls.append(status,buttons);
  const makeButton=(id,key,fn)=>{const b=el('button','',tr(key));b.id=id;b.type='button';b.addEventListener('click',fn);buttons.append(b);return b;};
  const readButton=makeButton('room-read','read',()=>openReading(true));
  const sitRead=makeButton('room-sit-read','sitRead',()=>startNearest('read'));
  const sitTea=makeButton('room-sit-tea','sitTea',()=>startNearest('tea'));
  const standButton=makeButton('room-stand','stand',()=>stop());host.append(controls);
  const dialog=el('section','scripture-reader');dialog.id='scripture-reader';dialog.hidden=true;dialog.setAttribute('role','dialog');dialog.setAttribute('aria-modal','true');dialog.setAttribute('aria-labelledby','scripture-title');
  const card=el('div','scripture-reader-card'),head=el('header','scripture-reader-header'),titles=el('div'),title=el('h2'),section=el('p','scripture-section'),counter=el('span','scripture-pages');title.id='scripture-title';titles.append(title,section);head.append(titles,counter);
  const body=el('article');body.id='scripture-body';body.tabIndex=0;body.setAttribute('aria-label',tr('classical'));
  const credit=el('p','scripture-credit'),attribution=el('span'),source=el('a');source.target='_blank';source.rel='noopener noreferrer';credit.append(attribution,document.createTextNode(' · '),source);
  const readerButtons=el('nav','scripture-buttons');readerButtons.setAttribute('aria-label',tr('classical'));
  const rb=(id,key,fn,cls='')=>{const b=el('button',cls,tr(key));b.type='button';b.id=id;b.addEventListener('click',fn);readerButtons.append(b);return b;};
  const prev=rb('scripture-prev','prev',()=>turnPage(-1)),next=rb('scripture-next','next',()=>turnPage(1)),random=rb('scripture-random','random',()=>selectArticle()),close=rb('scripture-close','close',()=>closeReading(),'scripture-close'),note=el('p','scripture-note');
  card.append(head,body,credit,readerButtons,note);dialog.append(card);host.append(dialog);
  function seats(){return world.seats||layout.seats||[];}
  function position(seat){const p=seat.position||[seat.x,0,seat.z];return{x:p[0],z:p[2]};}
  function area(){const p=player.root.position;return navigation?.templeIndoorArea(p.x,p.z);}
  function inRoom(seat){const room=area();if(room==='scripture'||room==='tea')return seat.room===room;const p=position(seat);return !room&&Math.hypot(p.x-player.root.position.x,p.z-player.root.position.z)<7;}
  function occupied(seat){return occupancy.has(seat.id)&&active?.seat?.id!==seat.id;}
  function available(kind){return seats().filter(s=>s.action===kind&&inRoom(s)&&!occupied(s));}
  function nearestSeat(kind){return available(kind).sort((a,b)=>{const p=player.root.position,aa=position(a),bb=position(b);return Math.hypot(p.x-aa.x,p.z-aa.z)-Math.hypot(p.x-bb.x,p.z-bb.z);})[0]||null;}
  function canBegin(){return enabled&&!disposed&&!active&&!shown&&(options.canStart?.()??true);}
  function writeReader(){
   const lang=window.TempleI18n?.locale||'zh-CN';
   if(article){title.textContent=window.TempleLocaleBundles?.scripture?.[lang]?.[article.id]||(lang==='en'?article.titleEn:article.title);section.textContent=article.section;attribution.textContent=article.attribution;source.href=article.source;body.textContent=pages[page]||'';counter.textContent=tr('pages',{a:page+1,b:pages.length});}
   source.textContent=tr('source');prev.textContent=tr('prev');next.textContent=tr('next');random.textContent=tr('random');close.textContent=tr('close');note.textContent=tr('note');prev.disabled=page<=0;next.disabled=page>=pages.length-1;body.scrollTop=0;
  }
  function selectArticle(){
   if(!window.TempleScriptures?.entries?.length)return false;
   article=window.TempleScriptures.next(article?.id);pages=window.TempleScriptures.paginate(article.text,170);page=0;pageTurnUntil=lastClock+.8;writeReader();return true;
  }
  function openReading(newArticle=false){
   if(disposed||!enabled)return false;
   if(active&&!(active.kind==='read'&&active.stage==='acting'))return false;
   if(!active&&(!(options.canStart?.()??true)||area()!=='scripture'))return false;
   if(newArticle||!article){if(!selectArticle())return false;}else writeReader();
   if(!shown){lastFocus=document.activeElement;shown=true;dialog.hidden=false;options.releaseLook?.();if(!active)options.onStart?.('read');close.focus();}
   render();return true;
  }
  function closeReading(restore=true){
   if(!shown)return false;shown=false;dialog.hidden=true;
   if(restore){if(lastFocus?.isConnected&&!lastFocus.hidden)lastFocus.focus?.();else if(!readButton.hidden)readButton.focus?.();}
   if(!active)options.onStop?.();render();return true;
  }
  function turnPage(delta){const value=Math.max(0,Math.min(pages.length-1,page+delta));if(value===page)return false;page=value;pageTurnUntil=lastClock+.8;writeReader();body.focus?.();return true;}
  function pathTo(destination,seat){
   const from={x:player.root.position.x,z:player.root.position.z};
   if(typeof options.findPath!=='function')return null;
   return options.findPath(from,destination,seat.id);
  }
  function clearLease(seat){try{const result=options.releaseSeat?.(seat?.id);result?.catch?.(()=>{});}catch(_){} }
  function restoreCup(){if(borrowedCup){borrowedCup.object.visible=borrowedCup.visible;borrowedCup=null;}}
  function syncCup(blend){
   const cup=active?.kind==='tea'?world.seatProps?.[active.seat.id]?.cup:null;
   const held=player.root.userData?.lounge?.cupInHand??blend>.7;
   if(!cup||!held){restoreCup();return;}
   if(borrowedCup?.object!==cup){restoreCup();borrowedCup={object:cup,visible:cup.visible};}cup.visible=false;
  }
  function finish(released=false){
   const seat=active?.seat;generation++;closeReading(false);active=null;restoreCup();player.hideProps?.();player.pose(lastClock,false);if(!released)clearLease(seat);options.onStop?.();render();
  }
  async function releaseAfterExit(){
   const a=active;if(!a||a.stage==='releasing')return;
   a.stage='releasing';player.hideProps?.();player.pose(lastClock,false);render();
   // The avatar has already walked clear of the furniture. Release the lease
   // in the background so a slow HTTP reply cannot trap a standing player.
   try{const pending=options.releaseSeat?.(a.seat.id);pending?.catch?.(()=>{});}catch(_){}
   if(active===a)finish(true);
  }
  async function begin(seat){
   if(!canBegin()||!seat||occupied(seat)){if(seat&&occupied(seat))notice('occupied');return false;}
   const token=++generation;active={seat,kind:seat.action,stage:'claiming',time:0,stageTime:0,path:[],index:0,blockedTime:0};options.releaseLook?.();options.onStart?.(seat.action);render();
   let claimed=false;
   try{claimed=await(options.claimSeat?.(seat.id)??true);}catch(_){claimed=false;}
   if(disposed||token!==generation||active?.seat?.id!==seat.id){if(claimed)clearLease(seat);return false;}
   if(!claimed){notice('occupied');finish();return false;}
   const target=position(seat),approach=seat.approach||[target.x,target.z],p=pathTo({x:approach[0],z:approach[1]},seat);
   if(!Array.isArray(p)){notice('noPath');finish();return false;}
   active.path=[...p,{x:approach[0],z:approach[1]},{x:target.x,z:target.z}];active.stage='walking';active.stageTime=0;render();return true;
  }
  function startNearest(kind){const seat=nearestSeat(kind);if(!seat){notice('noSeat');return false;}begin(seat);return true;}
  function standPath(){
   if(!active)return;const seat=active.seat,p=position(seat),exit=seat.exit||seat.approach||[p.x,p.z];
   const route=pathTo({x:exit[0],z:exit[1]},seat);
   if(!Array.isArray(route)){active.stage='exit-blocked';active.stageTime=0;notice('walkBlocked');return;}
   active.path=[...route,{x:exit[0],z:exit[1]}];active.index=0;active.stage='exiting';active.stageTime=0;active.blockedTime=0;
  }
  function stop(){
   if(shown)closeReading(false);
   if(!active)return true;
   if(active.stage==='claiming'){finish();return true;}
   const p=position(active.seat),distance=Math.hypot(player.root.position.x-p.x,player.root.position.z-p.z);
   if(active.stage==='walking'&&distance>1.1){finish();return true;}
   if(active.stage==='exit-blocked'){standPath();return true;}
   if(['placing','standing','exiting','releasing'].includes(active.stage))return true;
   if(active.kind==='tea'){
    active.exitPhase=.96;
    if(['sitting','acting'].includes(active.stage)&&player.root.userData?.lounge?.cupInHand){active.placeStart=player.root.userData.lounge.phase;active.stage='placing';active.stageTime=0;render();return true;}
   }
   active.stage='standing';active.stageTime=0;render();return true;
  }
  function reset({notifyStop=true}={}){
   generation++;const seat=active?.seat;shown=false;dialog.hidden=true;active=null;restoreCup();player.hideProps?.();player.pose(lastClock,false);if(seat)clearLease(seat);if(notifyStop)options.onStop?.();render();
  }
  function cancel(immediate=false){if(immediate){reset();return;}stop();}
  function lounge(blend=1,phaseOverride=null){
   if(!active)return;const seat=active.seat;player.root.rotation.y=seat.yaw??Math.PI;
   const progress=Number.isFinite(phaseOverride)?phaseOverride:(active.time%6)/6;
   player.loungePose?.(lastClock,active.kind,progress,{seatHeight:seat.seatHeight??seat.position?.[1]??0,blend,pageTurn:lastClock<pageTurnUntil?Math.max(0,1-(pageTurnUntil-lastClock)/.8):0});
   syncCup(blend);
  }
  function move(dt){
   const a=active,target=a.path[a.index];if(!target)return true;
   const p=player.root.position,dx=target.x-p.x,dz=target.z-p.z,d=Math.hypot(dx,dz);
   if(d<1e-9){a.index++;return a.index>=a.path.length;}
   const step=Math.min(d,dt*2.35),nx=step===d?target.x:p.x+dx/d*step,nz=step===d?target.z:p.z+dz/d*step;
   if(options.canMove&&!options.canMove(nx,nz)){a.awaitingMovementAck=options.isAwaitingMovementAck?.(nx,nz)===true;if(!a.awaitingMovementAck)a.blockedTime+=dt;if(a.blockedTime>1.5){if(a.stage==='walking'){notice('noPath');stop();}else{a.stage='exit-blocked';notice('walkBlocked');}}player.hideProps?.();player.pose(lastClock,false);return false;}
   a.awaitingMovementAck=false;a.blockedTime=0;p.x=nx;p.z=nz;p.y=groundHeight(nx,nz);const facing=Math.atan2(dx,dz);player.root.rotation.y+=Math.atan2(Math.sin(facing-player.root.rotation.y),Math.cos(facing-player.root.rotation.y))*Math.min(1,dt*12);
   player.hideProps?.();player.pose(lastClock,true);return false;
  }
  function update(dt,clock){
   if(disposed)return;lastClock=Number.isFinite(clock)?clock:lastClock;const step=Math.max(0,Math.min(.05,Number.isFinite(dt)?dt:0));
   if(active){const a=active;a.time+=step;a.stageTime+=step;player.root.position.y=groundHeight(player.root.position.x,player.root.position.z);
    if(a.stage==='walking'&&move(step)){const p=position(a.seat);player.root.position.x=p.x;player.root.position.z=p.z;a.stage='sitting';a.stageTime=0;a.time=0;}
    else if(a.stage==='sitting'){lounge(Math.min(1,a.stageTime/.9),0);if(a.stageTime>=.9){a.stage='acting';a.stageTime=0;a.time=0;if(a.kind==='read')openReading(true);}}
    else if(a.stage==='acting')lounge(1);
    else if(a.stage==='placing'){lounge(1,a.placeStart+(.96-a.placeStart)*Math.min(1,a.stageTime/.6));if(a.stageTime>=.6){a.stage='standing';a.stageTime=0;}}
    else if(a.stage==='standing'){lounge(Math.max(0,1-a.stageTime/.9),a.exitPhase??null);if(a.stageTime>=.9){player.hideProps?.();standPath();}}
    else if(a.stage==='exiting'&&move(step))releaseAfterExit();
    else if(a.stage==='exit-blocked'){player.hideProps?.();player.pose(lastClock,false);}
   }else if(shown){player.hideProps?.();player.pose(lastClock,false);}
   render();
  }
  function render(){
   if(disposed)return;const locale=window.TempleI18n?.locale||'zh-CN';if(lastLocale!==locale){lastLocale=locale;for(const node of [controls,body,readerButtons])node.setAttribute('aria-label',tr('classical'));readButton.textContent=tr('read');sitRead.textContent=tr('sitRead');sitTea.textContent=tr('sitTea');standButton.textContent=tr('stand');if(shown)writeReader();}
   const room=area(),r=nearestSeat('read'),t=nearestSeat('tea'),validRoom=room==='scripture'||room==='tea'||!!r||!!t;
   controls.hidden=!enabled&&!active&&!shown||(!active&&!shown&&!validRoom);
   host.classList.toggle('room-activities-visible',!controls.hidden);
   readButton.hidden=!(!active&&room==='scripture'||active?.kind==='read'&&active.stage==='acting');sitRead.hidden=!!active||!r;sitTea.hidden=!!active||!t;standButton.hidden=!active;
   const can=enabled&&!active&&!shown&&(options.canStart?.()??true);sitRead.disabled=!can;sitTea.disabled=!can;readButton.disabled=!enabled||shown||!!active&&!(active.kind==='read'&&active.stage==='acting');standButton.disabled=['placing','standing','exiting','releasing'].includes(active?.stage);
   const keys={claiming:'claiming',walking:'walking',sitting:'sitting',acting:active?.kind==='read'?'reading':'drinking',placing:'placing',standing:'standing',exiting:'exiting',releasing:'exiting','exit-blocked':'walkBlocked'};
   const message=active?tr(keys[active.stage]||'walking'):tr(room==='scripture'?'library':room==='tea'?'teaRoom':'garden');if(status.textContent!==message)status.textContent=message;
  }
  function interact(){
   if(shown){closeReading();return true;}
   if(active){if(active.kind==='read'&&active.stage==='acting')return openReading(false);stop();return true;}
   if(!canBegin())return false;const r=nearestSeat('read'),t=nearestSeat('tea'),p=player.root.position;
   const all=[r,t].filter(Boolean).sort((a,b)=>{const aa=position(a),bb=position(b);return Math.hypot(p.x-aa.x,p.z-aa.z)-Math.hypot(p.x-bb.x,p.z-bb.z);});
   if(all.length){begin(all[0]);return true;}if(area()==='scripture')return openReading(true);return false;
  }
  function handleSceneClick(event,camera=options.camera,canvas=options.canvas){
   if(!enabled||disposed||shown||active||!camera||!canvas||!(options.canStart?.()??true))return false;
   const rect=canvas.getBoundingClientRect(),cx=Number.isFinite(event.clientX)?event.clientX:rect.left+rect.width/2,cy=Number.isFinite(event.clientY)?event.clientY:rect.top+rect.height/2;
   pointer.set((cx-rect.left)/rect.width*2-1,-(cy-rect.top)/rect.height*2+1);ray.setFromCamera(pointer,camera);
   for(const hit of ray.intersectObjects(world.interactables||world.scene.children,true)){
    if(hit.distance>10||player.root.position.distanceTo(hit.point)>4.8)continue;
    let object=hit.object;while(object&&!object.userData?.bookReadable&&!object.userData?.seatId)object=object.parent;
    if(object?.userData.bookReadable&&area()==='scripture')return openReading(true);
    const seat=seats().find(s=>s.id===object?.userData.seatId);if(seat&&inRoom(seat)){if(occupied(seat)){notice('occupied');return true;}begin(seat);return true;}
   }
   return false;
  }
  function handleKey(event){
   if(shown){
    if(event.code==='Escape'){event.preventDefault?.();event.stopImmediatePropagation?.();closeReading();return true;}
    if(['ArrowLeft','ArrowRight','PageUp','PageDown'].includes(event.code)){event.preventDefault?.();event.stopImmediatePropagation?.();turnPage(['ArrowLeft','PageUp'].includes(event.code)?-1:1);return true;}
    if(event.code==='Tab'){
     const focusable=[body,source,prev,next,random,close].filter(e=>!e.disabled&&!e.hidden),index=focusable.indexOf(document.activeElement),n=(index+(event.shiftKey?-1:1)+focusable.length)%focusable.length;event.preventDefault?.();event.stopImmediatePropagation?.();focusable[n].focus?.();return true;
    }
    if(['KeyW','KeyA','KeyS','KeyD','KeyE','Space'].includes(event.code)){event.preventDefault?.();event.stopImmediatePropagation?.();return true;}
   }
   if(active&&event.code==='Escape'){event.preventDefault?.();event.stopImmediatePropagation?.();stop();return true;}
   return false;
  }
  const keyListener=event=>handleKey(event);document.addEventListener('keydown',keyListener,true);
  const unsubscribe=window.TempleI18n?.onChange?.(()=>{lastLocale='';render();});
  render();
  return{update,interact,handleSceneClick,handleKey,stop,cancel,reset,openReading,closeReading,
   setEnabled(value){enabled=!!value;render();},setOccupancy(value){occupancy.clear();for(const item of value||[]){const id=item.id||item.seatId||item.site?.replace(/^seat:/,'');if(id)occupancy.set(id,item.sessionId||item.session_id||true);}render();},
   get isBusy(){return!!active||shown;},get panelOpen(){return shown;},get active(){return active;},get action(){return active?(active.stage==='acting'?active.kind:['walking','exiting'].includes(active.stage)?'walk':'idle'):'idle';},get progress(){return active?.stage==='acting'?(active.time%6)/6:0;},
   diagnostics(){return{enabled,panelOpen:shown,scripture:article?.id||null,page:article?page+1:0,pages:pages.length,active:active?{seatId:active.seat.id,kind:active.kind,stage:active.stage,seatHeight:active.seat.seatHeight,time:active.time,awaitingMovementAck:!!active.awaitingMovementAck,blockedTime:active.blockedTime}:null,occupied:[...occupancy.keys()]};},
   dispose(){reset();disposed=true;controls.remove();dialog.remove();host.classList.remove('room-activities-visible');unsubscribe?.();document.removeEventListener('keydown',keyListener,true);}
  };
 }};
})();
;
(function(){
 'use strict';
 function applySupinePose(actor,time,blend=1){
  const b=Math.min(1,Math.max(0,blend));
  actor.freePose(time,'lie',b);
  actor.root.position.y+=(actor.root.userData.supineLift??.34)*b*b*(3-2*b);
 }
 window.TemplePlayerMotion={applySupinePose,create({player,navigation:nav,canStart,onRequest,notice,isMounted=()=>false}){
  const M=nav.PLAYER_MOTION;let rest=null,jumpTime=null,clock=0,lastRender='';
  const panel=document.createElement('div');panel.id='motion-controls';panel.setAttribute('aria-label','玩家动作');
  const kinds=['jump','sit','lie','greet'],buttons={};for(const kind of kinds){const b=document.createElement('button');b.type='button';b.dataset.motion=kind;buttons[kind]=b;panel.append(b);let lastTouch=-Infinity;b.addEventListener('pointerdown',e=>{if(e.pointerType==='touch'){e.preventDefault();lastTouch=performance.now();request(kind);}});b.addEventListener('click',()=>{if(performance.now()-lastTouch>600)request(kind);});}
  document.getElementById('game').append(panel);
  const labels={ 'zh-CN':['跑步','跳跃','坐下','仰躺','起身','这里太挤或坡度太陡，往旁边空地挪一点。','合十','放下','玩家动作'], 'zh-TW':['跑步','跳躍','坐下','仰躺','起身','這裡太擠或坡度太陡，往旁邊空地挪一點。','合十','放下','玩家動作'],en:['Run','Jump','Sit','Lie back','Stand up','Move to a clear, flatter spot to rest.','Greet','Lower hands','Player actions']};
  for(const lang of ['ja','ko']){const bundle=window.TempleLocaleBundles?.motion?.[lang];if(bundle)labels[lang]=['run','jump','sit','lie','stand','blocked','greet','lower','panel'].map(k=>bundle[k]);}
  function render(){
   const locale=window.TempleI18n?.locale,text=labels[locale]||labels['zh-CN'];
   const enabled=canStart();
   const key=[locale,enabled,rest?.kind,rest?.standing,jumpTime!==null].join('|');
   if(key===lastRender)return;
   lastRender=key;
   const game=document.getElementById('game');
   panel.hidden=!enabled;
   game.classList.toggle('ground-resting',!!rest);
   panel.setAttribute('aria-label',text[8]);
   kinds.forEach((k,i)=>{
    buttons[k].textContent=rest?.kind===k?(k==='greet'?text[7]:text[4]):k==='greet'?text[6]:text[i+1];
    buttons[k].setAttribute('aria-pressed',String(rest?.kind===k));
    buttons[k].disabled=!!rest?.standing||jumpTime!==null;
   });
  }
  function request(kind){if(!kinds.includes(kind)||!canStart(kind))return false;onRequest?.();
   if(rest){rest.standing=true;render();return true;}
   if(jumpTime!==null)return false;
   if(kind==='jump')jumpTime=0;
   else if(kind==='sit'||kind==='lie'||kind==='greet'){
    const p=player.root.position;if(kind!=='greet'&&!nav.templeRestFits(p.x,p.z,player.root.rotation.y,kind,nav)){notice((labels[window.TempleI18n?.locale]||labels['zh-CN'])[5]);return false;}
    rest={kind,blend:0,standing:false};
   }else return false;render();return true;
  }
  function update(dt,time,moving){clock=time;render();
   if(rest){if(moving)rest.standing=true;rest.blend=Math.max(0,Math.min(1,rest.blend+(rest.standing?-1:1)*dt/M.transitionSeconds));
    if(rest.standing&&rest.blend===0){rest=null;player.pose(clock,false);return false;}
    if(rest.kind==='lie')applySupinePose(player,clock,rest.blend);
    else player.freePose(clock,rest.kind,rest.blend);
    return true;
   }
   if(jumpTime!==null){jumpTime+=dt;if(jumpTime>=M.jumpSeconds)jumpTime=null;}
   return false;
  }
  function pose(running){if(jumpTime!==null){player.freePose(clock,'jump');player.root.position.y+=nav.templeJumpHeight(jumpTime/M.jumpSeconds);return true;}if(running){player.freePose(clock,'run');return true;}return false;}
  function reset(){rest=null;jumpTime=null;player.pose(clock,false);render();}
  return{request,update,pose,reset,render,stand(){if(rest)rest.standing=true;},get run(){return true;},get busy(){return!!rest||jumpTime!==null;},get action(){return rest?.kind||(jumpTime!==null?'jump':null);},get progress(){return jumpTime===null?0:jumpTime/M.jumpSeconds;},diagnostics:()=>({action:rest?.kind||(jumpTime!==null?'jump':'idle'),blend:rest?.blend??0,standing:!!rest?.standing,jumpProgress:jumpTime===null?0:jumpTime/M.jumpSeconds,run:true,speedMode:'run-only',faceUp:rest?.kind==='lie'&&rest.blend===1})};
 }};
})();
;
/* Authored animal walks and a single fire on the west beach. */
(function () {
  'use strict';
  const entries = [
    { id:'cat', file:'Cow_Cat', x:-2.5, z:16.9, scale:.78, yaw:Math.PI, route:[[-3.1,11,2],[-4.8,10.5,5],[-2.2,15.5,1],[-2.5,16.9,4]], pet:'Pet_Response', rest:3, radius:.26 },
    { id:'alpaca', kind:'alpaca', file:'Alpaca', x:-5.6, z:22.8, scale:1, yaw:2.5, step:[.5,.75], pet:'Eating', rest:13, radius:.56 },
    { id:'shiba', file:'Shiba_Inu', x:36.3, z:-12, scale:.18, yaw:-.65, step:[-1,2], pet:'Idle_2', rest:6, radius:.31 },
    { id:'husky', file:'Husky', x:51.5, z:-14, scale:.23, yaw:.8, step:[1.3,1.3], pet:'Idle_2_HeadLow', rest:10, radius:.39 },
    { id:'campfire', file:'Campfire', x:-163.64, z:125, scale:1, yaw:.75 },
    { id:'white-alpaca', kind:'alpaca', file:'Alpaca', x:12, z:43, scale:1, yaw:-2.55, step:[1.1,.6], pet:'Eating', rest:10, radius:.56 }
  ];
  // Ground projections of the four GLBs, in world metres along their local +Z.
  const bodyShapes={
    cat:{radius:.15,back:-.20,front:.16},alpaca:{radius:.20,back:-.34,front:.60},
    shiba:{radius:.10,back:-.16,front:.35},husky:{radius:.115,back:-.225,front:.44}
  };
  function spineAt(subject,x=subject.anchor.position.x,z=subject.anchor.position.z,yaw=subject.model.rotation.y){
    const {back,front}=bodyShapes[subject.spec.kind||subject.spec.id],sx=Math.sin(yaw),sz=Math.cos(yaw);
    return [x+sx*back,z+sz*back,x+sx*front,z+sz*front];
  }
  function distanceToSegment(x,z,ax,az,bx,bz){
    const dx=bx-ax,dz=bz-az;
    const t=Math.max(0,Math.min(1,((x-ax)*dx+(z-az)*dz)/(dx*dx+dz*dz||1)));
    return Math.hypot(x-ax-t*dx,z-az-t*dz);
  }
  function segmentGap(ax,az,bx,bz,cx,cz,dx,dz){
    const ux=bx-ax,uz=bz-az,vx=dx-cx,vz=dz-cz,cross=ux*vz-uz*vx;
    if(Math.abs(cross)>1e-10){
      const a=((cx-ax)*vz-(cz-az)*vx)/cross,b=((cx-ax)*uz-(cz-az)*ux)/cross;
      if(a>=0&&a<=1&&b>=0&&b<=1)return 0;
    }
    return Math.min(distanceToSegment(ax,az,cx,cz,dx,dz),distanceToSegment(bx,bz,cx,cz,dx,dz),
      distanceToSegment(cx,cz,ax,az,bx,bz),distanceToSegment(dx,dz,ax,az,bx,bz));
  }
  const strings = {
    'zh-CN':['抚摸','轻轻抚摸','奶牛猫','羊驼','柴犬','哈士奇'],
    'zh-TW':['撫摸','輕輕撫摸','乳牛貓','羊駝','柴犬','哈士奇'],
    en:['Pet','Gently pet the ','piebald cat','alpaca','Shiba Inu','husky'],
    ja:['なでる','なでる：','白黒猫','アルパカ','柴犬','ハスキー'],
    ko:['쓰다듬기','쓰다듬기 · ','얼룩 고양이','알파카','시바견','허스키']
  };
  const rideLabels = {
    'zh-CN':['骑乘','骑上羊驼','下坐骑','从羊驼背上下来','请把羊驼带到旁边有空地的位置。'],
    'zh-TW':['騎乘','騎上羊駝','下坐騎','從羊駝背上下來','請把羊駝帶到旁邊有空地的位置。'],
    en:['Ride','Mount the alpaca','Dismount','Dismount from the alpaca','Move to a spot with space beside the alpaca.'],
    ja:['乗る','アルパカに乗る','降りる','アルパカから降りる','横に空きのある場所まで移動してください。'],
    ko:['타기','알파카 타기','내리기','알파카에서 내리기','알파카 옆이 넓은 곳으로 이동하세요.']
  };
  const whiteRideTitles={
    'zh-CN':['骑上白羊驼','从白羊驼背上下来'],'zh-TW':['騎上白羊駝','從白羊駝背上下來'],
    en:['Mount the white alpaca','Dismount from the white alpaca'],ja:['白いアルパカに乗る','白いアルパカから降りる'],
    ko:['흰 알파카 타기','흰 알파카에서 내리기']
  };
  function nearbyText(subject, mounted) {
    const lang = window.TempleI18n?.locale || document.documentElement.lang;
    const labels = strings[lang] || strings[lang.split('-')[0]] || strings.en;
    if(subject.spec.kind==='alpaca'){
      const r=rideLabels[lang]||rideLabels[lang.split('-')[0]]||rideLabels.en;
      const white=whiteRideTitles[lang]||whiteRideTitles[lang.split('-')[0]]||whiteRideTitles.en;
      return {button:r[mounted?2:0],title:subject.spec.id==='white-alpaca'?white[mounted?1:0]:r[mounted?3:1],blocked:r[4]};
    }
    return {button:labels[0], title:labels[1]+labels[2+entries.indexOf(subject.spec)]};
  }
  function makeShadow(T) {
    const canvas=document.createElement('canvas'); canvas.width=canvas.height=48;
    const c=canvas.getContext('2d'), gradient=c.createRadialGradient(24,24,0,24,24,24);
    gradient.addColorStop(0,'rgba(32,23,16,.45)'); gradient.addColorStop(.42,'rgba(32,23,16,.22)'); gradient.addColorStop(1,'rgba(32,23,16,0)');
    c.fillStyle=gradient;c.fillRect(0,0,48,48);
    const texture=new T.CanvasTexture(canvas);texture.colorSpace=T.SRGBColorSpace;
    return new T.MeshBasicMaterial({map:texture,transparent:true,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-1});
  }
  function create(T,world,navigation) {
    const group=new T.Group();group.name='Island animals and beach campfire';world.scene.add(group);
    const residents=[], state={requested:0,loaded:0,errors:{},lastInteraction:null};
    let pending=false, nextAttempt=0, shadow, shadowGeometry, ride=null;
    const socketPosition=new T.Vector3();
    const remaining=entries.map(spec=>({spec, attempts:0}));
    function play(subject,name,once=false) {
      const action=subject.actions.get(name);
      if (!action || (subject.action===action && !once)) return;
      if (subject.action!==action) subject.action?.fadeOut(.16);
      action.reset();action.setLoop(once?T.LoopOnce:T.LoopRepeat,once?1:Infinity);
      action.clampWhenFinished=once; action.fadeIn(.16).play();subject.action=action;
    }
    let alpacaTemplate;
    async function loadResident(spec){
      const path='assets/companions/'+spec.file+'.glb.gz';
      if(spec.kind!=='alpaca')return window.TempleGLB.load(path);
      // Clone the complete skeleton, not just the visible meshes. Both animals
      // share immutable source geometry and clips but own their bones and mixers.
      alpacaTemplate??=window.TempleGLB.load(path).catch(error=>{alpacaTemplate=null;throw error;});
      const template=await alpacaTemplate,scene=window.TempleGLTFLoader.cloneScene(template.scene);
      if(spec.id==='white-alpaca'){
        const fleece={Main:0xeee9df,Main_Light:0xfbf8f0};
        scene.traverse(node=>{
          const tint=fleece[node.material?.name];
          if(tint===undefined)return;
          node.material=node.material.clone();node.material.color.setHex(tint);
        });
      }
      return {scene,animations:template.animations};
    }
    async function add(spec) {
      const model=await loadResident(spec);
      const anchor=new T.Group();anchor.name=spec.id==='white-alpaca'?'White Alpaca':spec.file;anchor.position.set(spec.x,navigation.templeGroundHeight(spec.x,spec.z),spec.z);
      if(spec.id==='campfire'){
        // Seat the stone ring on the same sand triangles the renderer uses.
        const h=navigation.islandHeight,x=spec.x,z=spec.z;
        const normal=new T.Vector3(h(x-.5,z)-h(x+.5,z),1,h(x,z-.5)-h(x,z+.5)).normalize();
        anchor.position.y=h(x,z);
        anchor.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),normal);
      }
      model.scene.scale.multiplyScalar(spec.scale);model.scene.rotation.y=spec.yaw;
      model.scene.traverse(node=>{node.layers.set(1);if(node.isMesh){node.receiveShadow=true;node.castShadow=false;}});
      anchor.add(model.scene);
      const fire=spec.id==='campfire',mixer=new T.AnimationMixer(model.scene);
      const subject={spec,anchor,model:model.scene,mixer,actions:new Map(model.animations.map(clip=>[clip.name,mixer.clipAction(clip)])),action:null,home:{x:spec.x,z:spec.z},socket:model.scene.getObjectByName('Ride_Seat'),wait:spec.rest||0,moving:false,away:false,waypoint:0,response:0};
      if(!fire) {
        shadow||=makeShadow(T);shadowGeometry||=new T.PlaneGeometry(2,2);
        const contact=new T.Mesh(shadowGeometry,shadow);contact.name='Soft contact shadow';contact.layers.set(1);
        contact.rotation.x=-Math.PI/2;contact.scale.set(spec.radius,spec.radius*1.34,1);contact.position.y=.008;anchor.add(contact);
      }
      play(subject,fire?'Campfire_Loop':'Idle');mixer.update(.001);
      residents.push(subject);group.add(anchor);state.loaded++;delete state.errors[spec.id];
    }
    function requestOne(time,position) {
      if (pending || !remaining.length || time<nextAttempt) return;
      const index=remaining.findIndex(({spec})=>Math.hypot(position.x-spec.x,position.z-spec.z)<72);
      if(index<0){nextAttempt=time+.35;return;}
      const [item]=remaining.splice(index,1);pending=true;item.attempts++;state.requested++;
      add(item.spec).catch(error=>{
        state.errors[item.spec.id]=String(error?.message||error);
        if (item.attempts<3) remaining.push(item);
      }).finally(()=>{pending=false;nextAttempt=time+.12;});
    }
    function update(dt,time,position) {
      // Stream by each resident’s own location, including a first visit at the shore.
      requestOne(time,position);
      for(const subject of residents) {
        const {spec,anchor,model}=subject,p=anchor.position,d2=(position.x-p.x)**2+(position.z-p.z)**2;
        anchor.visible=d2<72*72;if(!anchor.visible || d2>45*45)continue;
        if(ride?.subject===subject)continue;
        subject.mixer.update(dt);if(!spec.pet)continue;
        if(subject.response>0){
          subject.response=Math.max(0,subject.response-dt);if(!subject.response){play(subject,'Idle');subject.wait=spec.rest;}
          continue;
        }
        const waypoint=spec.route?.[subject.waypoint];
        const x=waypoint?waypoint[0]:subject.home.x+(subject.away?0:spec.step[0]);
        const z=waypoint?waypoint[1]:subject.home.z+(subject.away?0:spec.step[1]);
        if(!subject.moving){
          subject.wait-=dt;
          if(subject.wait>0)continue;
          if(!navigation.templeCanTravel(p.x,p.z,x,z)){subject.wait=spec.rest;continue;}
          subject.moving=true;play(subject,'Walk');
        }
        const dx=x-p.x,dz=z-p.z,dist=Math.hypot(dx,dz),step=dt*(spec.kind==='alpaca'?.48:spec.id==='cat'?.65:.45);
        const fraction=dist>step?step/dist:1, nx=p.x+dx*fraction, nz=p.z+dz*fraction;
        const turn=Math.atan2(dx,dz)-model.rotation.y;
        const yaw=model.rotation.y+Math.atan2(Math.sin(turn),Math.cos(turn))*Math.min(1,dt*7);
        if(!allowsAnimalStep(subject,nx,nz,yaw,position)){
          subject.moving=false;subject.wait=.55;play(subject,'Idle');continue;
        }
        const printKind=spec.kind??(spec.id==='cat'?'cat':'dog');
        world.landscape?.trackAnimal?.(anchor,printKind,p.x,p.z,nx,nz);
        p.set(nx,navigation.templeGroundHeight(nx,nz),nz);model.rotation.y=yaw;
        if(fraction===1){
          subject.moving=false;subject.wait=waypoint?waypoint[2]:spec.rest;
          if(waypoint)subject.waypoint=(subject.waypoint+1)%spec.route.length;
          else subject.away=!subject.away;
          if(spec.id==='cat' && subject.waypoint===0 && subject.actions.has('Yawn')){
            play(subject,'Yawn',true);subject.response=subject.actions.get('Yawn').getClip().duration;
          } else play(subject,'Idle');
        }
      }
    }
    const playerRadius=navigation.templeSceneLayout.character.radius;
    function canOccupy(x,z,ignoreSubject=ride?.subject){
      for(const subject of residents){
        const shape=bodyShapes[subject.spec.kind||subject.spec.id],p=subject.anchor.position;
        if(!shape||subject===ignoreSubject||Math.abs(p.x-x)>1.5||Math.abs(p.z-z)>1.5)continue;
        if(distanceToSegment(x,z,...spineAt(subject))<playerRadius+shape.radius)return false;
      }
      return true;
    }
    function canTravel(ax,az,bx,bz,ignoreSubject=ride?.subject){
      for(const subject of residents){
        const shape=bodyShapes[subject.spec.kind||subject.spec.id],p=subject.anchor.position;
        if(!shape||subject===ignoreSubject||p.x<Math.min(ax,bx)-1.5||p.x>Math.max(ax,bx)+1.5||
          p.z<Math.min(az,bz)-1.5||p.z>Math.max(az,bz)+1.5)continue;
        const spine=spineAt(subject),radius=playerRadius+shape.radius;
        const clearance=segmentGap(ax,az,bx,bz,...spine);
        if(clearance>=radius)continue;
        // A new resident can load around a standing player. Permit only a step out of overlap.
        const start=distanceToSegment(ax,az,...spine),end=distanceToSegment(bx,bz,...spine);
        if(!(start<radius&&clearance>=start-1e-7&&end>start+1e-8))return false;
      }
      return true;
    }
    function allowsAnimalStep(subject,x,z,yaw,playerPosition){
      const start=subject.anchor.position,shape=bodyShapes[subject.spec.kind||subject.spec.id];
      if(!shape)return true;
      const turn=yaw-subject.model.rotation.y,angle=Math.atan2(Math.sin(turn),Math.cos(turn));
      const sweep=Math.hypot(x-start.x,z-start.z)+Math.abs(angle)*Math.max(shape.front,-shape.back);
      const steps=Math.max(1,Math.ceil(sweep/.04));
      const obstacles=[];
      if(playerPosition&&Math.hypot(start.x-playerPosition.x,start.z-playerPosition.z)<2+sweep){
        const p=playerPosition;
        obstacles.push({spine:[p.x,p.z,p.x,p.z],radius:playerRadius+shape.radius});
      }
      for(const other of residents){
        const os=bodyShapes[other.spec.kind||other.spec.id],p=other.anchor.position;
        if(other!==subject&&os&&Math.hypot(start.x-p.x,start.z-p.z)<2+sweep){
          obstacles.push({spine:spineAt(other),radius:os.radius+shape.radius});
        }
      }
      if(!obstacles.length)return true;
      for(let i=0;i<=steps;i++){
        const f=i/steps,spine=spineAt(subject,start.x+(x-start.x)*f,start.z+(z-start.z)*f,subject.model.rotation.y+angle*f);
        for(const o of obstacles){
          const gap=segmentGap(...spine,...o.spine);
          if(i&&gap<o.radius&&gap<=o.previous+1e-8)return false;
          o.previous=gap;
        }
      }
      return true;
    }
    function nearest(position) {
      let result=null,best=2.15;
      for(const subject of residents){
        if(!subject.spec.pet)continue;
        const p=subject.anchor.position,distance=Math.hypot(position.x-p.x,position.z-p.z);
        if(Math.abs(position.y-p.y)<1.3&&distance<best){best=distance;result=subject;}
      }
      return result;
    }
    function pet(position) {
      const subject=nearest(position);if(!subject)return false;
      const {spec,anchor,model}=subject,p=anchor.position;subject.moving=false;
      const yaw=Math.atan2(position.x-p.x,position.z-p.z);
      if(allowsAnimalStep(subject,p.x,p.z,yaw,position))model.rotation.y=yaw;
      play(subject,spec.pet,true);subject.response=subject.actions.get(spec.pet).getClip().duration;
      state.lastInteraction=spec.id;return true;
    }
    // The server keeps ordinary grounded locomotion. The local rider's pelvis follows the animated socket.
    function clearForRide(x,z){
      // Every outdoor approach uses the actual walkable terrain and body footprint.
      return !navigation.templeIndoorArea(x,z) && navigation.templeCanStand(x,z);
    }
    function canRideTo(x,z,yaw,correcting=false) {
      if(!ride)return true;
      const {subject}=ride,p=subject.anchor.position;
      subject.socket.getWorldPosition(socketPosition);
      const delta=yaw-subject.model.rotation.y,cos=Math.cos(delta),sin=Math.sin(delta);
      const ox=socketPosition.x-p.x,oz=socketPosition.z-p.z;
      const ax=x-(ox*cos+oz*sin),az=z-(-ox*sin+oz*cos);
      if(!clearForRide(x,z))return false;
      const [bx,bz,fx,fz]=spineAt(subject,ax,az,yaw);
      if(correcting){
        // A server correction supplies a destination, not a swept movement.
        // Validate the final body against other residents and walkable terrain.
        if(!clearForRide(ax,az))return false;
        for(const other of residents){
          const shape=bodyShapes[other.spec.kind||other.spec.id];
          if(other!==subject&&shape&&segmentGap(bx,bz,fx,fz,...spineAt(other))<bodyShapes.alpaca.radius+shape.radius)return false;
        }
      }else if(!allowsAnimalStep(subject,ax,az,yaw,null))return false;
      if(!clearForRide(bx,bz)||!clearForRide(fx,fz))return false;
      const sideX=Math.cos(yaw)*.31,sideZ=-Math.sin(yaw)*.31;
      return clearForRide(x+sideX,z+sideZ)&&clearForRide(x-sideX,z-sideZ);
    }
    function transition(stage,subject,start,end){
      const distance=Math.hypot(end.x-start.x,end.z-start.z);
      return {stage,subject,start:start.clone(),end:end.clone(),elapsed:0,duration:Math.max(.42,distance/navigation.PLAYER_MOTION.walkSpeed)};
    }
    function mount(subject,player) {
      const p=player.root.position,a=subject.anchor.position;
      if(ride||subject.spec.kind!=='alpaca'||!subject.socket||Math.hypot(p.x-a.x,p.z-a.z)>2.15||Math.abs(p.y-a.y)>=1.3)return false;
      subject.socket.getWorldPosition(socketPosition);
      const x=socketPosition.x,z=socketPosition.z;
      if(!clearForRide(a.x,a.z)||!clearForRide(x,z)||!navigation.templeCanTravel(p.x,p.z,x,z)||!canTravel(p.x,p.z,x,z,subject))return false;
      subject.response=0;subject.moving=false;play(subject,'Idle');player.hideProps();player.root.rotation.y=subject.model.rotation.y;
      ride=transition('mounting',subject,p,socketPosition);
      state.lastInteraction=subject.spec.id;return true;
    }
    function dismount(player) {
      if(!ride||ride.stage!=='riding')return false;
      const p=player.root.position,yaw=player.root.rotation.y,subject=ride.subject;
      // Keep the usual side exits. On a shoreline, the dry contour can run
      // diagonally between them; try the remaining compass angles as well.
      for(const steps of [[4,-4,8,0,6,-6],[2,-2,1,-1,3,-3,5,-5,7,-7]])for(const radius of [1.15,1.55]){
        for(const step of steps){
          const angle=step*Math.PI/8;
          const x=p.x+Math.sin(yaw+angle)*radius,z=p.z+Math.cos(yaw+angle)*radius;
          if(!clearForRide(x,z)||!navigation.templeCanTravel(p.x,p.z,x,z)||!canTravel(p.x,p.z,x,z,subject)||!canOccupy(x,z,null))continue;
          const y=navigation.templeGroundHeight(x,z);
          if(Math.abs(y-p.y)>.29)continue;
          ride=transition('dismounting',subject,p,new T.Vector3(x,y,z));
          return true;
        }
      }
      return false;
    }
    function reconcileRide(player,preserve=true) {
      if(!ride)return false;
      const {subject,stage}=ride,{anchor,model,spec}=subject,p=player.root.position,yaw=player.root.rotation.y;
      if(preserve&&stage==='riding'&&canRideTo(p.x,p.z,yaw,true)){
        model.rotation.y=yaw;
        subject.socket.getWorldPosition(socketPosition);
        const oldX=anchor.position.x,oldZ=anchor.position.z;
        anchor.position.x+=p.x-socketPosition.x;
        anchor.position.z+=p.z-socketPosition.z;
        anchor.position.y=navigation.templeGroundHeight(anchor.position.x,anchor.position.z);
        if(walking)world.landscape?.trackAnimal?.(anchor,'alpaca',oldX,oldZ,anchor.position.x,anchor.position.z);
        ride.speed=0;anchor.visible=true;
        return true;
      }
      // Keep a released animal where the rider last left it. Its short idle
      // route must also start here rather than walking back across the island.
      subject.home={x:anchor.position.x,z:anchor.position.z};
      subject.away=false;subject.moving=false;subject.wait=spec.rest;
      play(subject,'Idle');ride=null;player.hideProps();player.pose(0,false);
      return false;
    }
    function rideSpeed(dt,running,moving) {
      if(!ride || ride.stage!=='riding')return 0;
      // Leave room below the server's 5 m/s movement budget at full gallop.
      const target=moving ? (running ? 4.8 : 3.4) : 0;
      const current=ride.speed||0;
      ride.speed=moving ? current+(target-current)*(1-Math.exp(-10*dt)) : 0;
      return ride.speed;
    }
    function updateRide(dt,time,player,moving,running,canAdvance) {
      if(!ride)return;
      const {subject,stage}=ride,{model,anchor,socket}=subject,p=player.root.position;
      const walking=stage==='riding'&&moving;
      play(subject,walking?(running?'Gallop':'Walk'):'Idle');subject.mixer.update(dt);
      model.rotation.y=player.root.rotation.y;
      socket.getWorldPosition(socketPosition);
      let blend=1;
      if(stage==='riding'){
        // Track the animated seat without changing the networked locomotion root.
        anchor.position.x+=p.x-socketPosition.x;
        anchor.position.z+=p.z-socketPosition.z;
        anchor.position.y=navigation.templeGroundHeight(anchor.position.x,anchor.position.z);
        socket.getWorldPosition(socketPosition);
      }else{
        // The animal stays planted as the rider steps on or off at ordinary walking speed.
        const elapsed=Math.min(ride.duration,ride.elapsed+dt);
        const fraction=elapsed/ride.duration;
        const x=T.MathUtils.lerp(ride.start.x,ride.end.x,fraction);
        const z=T.MathUtils.lerp(ride.start.z,ride.end.z,fraction);
        if(!canAdvance||canAdvance(x,z)){
          p.set(x,navigation.templeGroundHeight(x,z),z);ride.elapsed=elapsed;
        }
        const phase=T.MathUtils.smoothstep(ride.elapsed,0,ride.duration);
        blend=stage==='mounting'?phase:1-phase;
      }
      player.loungePose(time,'ride',0,{seatHeight:socketPosition.y-p.y,blend});
      if(stage==='riding'||ride.elapsed<ride.duration)return;
      if(stage==='mounting'){
        ride.stage='riding';
      }else{
        subject.home={x:anchor.position.x,z:anchor.position.z};subject.away=false;subject.wait=subject.spec.rest;
        ride=null;player.hideProps();player.pose(time,false);
      }
    }
    function diagnostics(){return {...state,ride:ride?{id:ride.subject.spec.id,stage:ride.stage,clip:ride.subject.action?.getClip().name,seat:ride.subject.socket.getWorldPosition(socketPosition).toArray()}:null,animals:residents.map(s=>({id:s.spec.id,clip:s.action?.getClip().name,position:s.anchor.position.toArray(),visible:s.anchor.visible}))};}
    return {update,nearest,pet,canOccupy,canTravel,allowsAnimalStep,canRideTo,rideSpeed,mount,dismount,reconcileRide,updateRide,nearbyText:subject=>nearbyText(subject,!!ride),diagnostics,get mountSubject(){return ride?.subject;},get transitioning(){return !!ride&&ride.stage!=='riding';}};
  }
  window.TempleIslandCompanions={create};
})();
;
/* Daily invitations and the hall novice's fortune sticks. */
(function () {
  const invitations = {
    'zh-CN': ['随我听一声木鱼，等余音散了再走。','今天去海边吧。看一道白浪，从出现到消散。','藏经阁里挑一句喜欢的话，坐一会儿再走。','岛上的猫醒了。走近些，让它先看看你。','去花田走一圈，找一朵朝着光的花。','进茶室坐坐，给自己留一盏茶的工夫。','抬头看看殿里的圆纹，从中心慢慢看到最外圈。'],
    'zh-TW': ['隨我聽一聲木魚，等餘音散了再走。','今天去海邊吧。看一道白浪，從出現到消散。','藏經閣裡挑一句喜歡的話，坐一會兒再走。','島上的貓醒了。走近些，讓牠先看看你。','去花田走一圈，找一朵朝著光的花。','進茶室坐坐，給自己留一盞茶的工夫。','抬頭看看殿裡的圓紋，從中心慢慢看到最外圈。'],
    en: ['Listen to the woodfish until the last note fades.','At the shore, follow one white wave until it disappears.','Choose a line in the scripture hall and sit with it awhile.','The cat is awake. Come close and let it look at you.','Walk the flower path and find a bloom facing the light.','Take a seat in the tea room. Stay for a cup.','Trace a circle on the temple wall, from its heart to its edge.'],
    ja: ['木魚の余韻が消えるまで、耳を澄ませましょう。','浜辺で、白い波が消えるまで見届けましょう。','経蔵で好きな一節を選んで、少し座ってみましょう。','猫が目を覚ましました。そっと近づいてみましょう。','花畑で、光のほうを向いた花を探してみましょう。','茶室で、お茶一杯ぶんの時間を過ごしましょう。','堂内の壁の円を、中心から外側へ目でたどってみましょう。'],
    ko: ['목탁 소리가 잦아들 때까지 귀를 기울여 보세요.','바닷가에서 흰 파도 하나가 사라질 때까지 바라보세요.','경전에서 마음에 드는 한 구절을 골라 잠시 앉아 보세요.','고양이가 깨어났어요. 살며시 다가가 눈을 맞춰 보세요.','꽃길에서 빛을 향해 핀 꽃 한 송이를 찾아보세요.','다실에 앉아 차 한 잔의 여유를 누려 보세요.','법당 벽의 원을 가운데부터 가장자리까지 눈으로 따라가 보세요.']
  };
  const fortunes={
    'zh-CN':{
      title:'求签 · 解签',hint:'从小和尚手中的签筒抽一支签，听他解签。',draw:'抽一支签',close:'合上签册',number:n=>'第 '+n+' 签',
      slips:[
        ['浮云暂遮月，稍候见清光','心里还乱时，给自己一点时间。先做一件小事，等心静下来再决定。'],
        ['春水绕山行，自有入海时','遇到难走的路，可以换个方向。今天先试一步，看看哪里走得通。'],
        ['一灯分千火，光色两相明','若有人与你同路，不妨分一点力气给他。若你累了，也可以开口请人帮忙。'],
        ['竹影疏窗动，茶香一盏长','留一盏茶的工夫给自己。听听窗外的声音，把今天走过的路想一想。']
      ]
    },
    'zh-TW':{
      title:'求籤 · 解籤',hint:'從小和尚手中的籤筒抽一支籤，聽他解籤。',draw:'抽一支籤',close:'闔上籤冊',number:n=>'第 '+n+' 籤',
      slips:[
        ['浮雲暫遮月，稍候見清光','心裡還亂時，給自己一點時間。先做一件小事，等心靜下來再決定。'],
        ['春水繞山行，自有入海時','遇到難走的路，可以換個方向。今天先試一步，看看哪裡走得通。'],
        ['一燈分千火，光色兩相明','若有人與你同路，不妨分一點力氣給他。若你累了，也可以開口請人幫忙。'],
        ['竹影疏窗動，茶香一盞長','留一盞茶的工夫給自己。聽聽窗外的聲音，把今天走過的路想一想。']
      ]
    },
    en:{
      title:'Fortune sticks',hint:'Draw a bamboo slip and hear the novice’s reading.',draw:'Draw a slip',close:'Close',number:n=>'Slip '+n,
      slips:[
        ['A passing cloud hides the moon. Wait for the clear light.','Give yourself a little time. Do one small thing, then decide when your mind settles.'],
        ['Spring water winds through the hills and finds the sea.','If the path gets difficult, try a different direction. Take one step and see where it leads.'],
        ['One lamp lights a thousand flames. Each burns just as bright.','If someone is walking beside you, share the work. If you are tired, ask for a hand.'],
        ['Bamboo shadows cross the lattice. The scent of tea lingers.','Set aside the time it takes to drink a cup of tea. Listen to the world outside and think back over your day.']
      ]
    },
    ja:{
      title:'おみくじ',hint:'小僧の筒から一本引いて、ことばに耳を傾けましょう。',draw:'おみくじを引く',close:'閉じる',number:n=>'第 '+n+' 番',
      slips:[
        ['流れる雲が月を隠す。やがて澄んだ光が差す。','気持ちが落ち着くまで、小さなことを一つだけ。決めるのはそのあとでも大丈夫です。'],
        ['春の水は山を巡り、やがて海にたどり着く。','道が険しければ、別の方角へ。まず一歩、歩いてみましょう。'],
        ['一つの灯から千の灯へ。光はどれも明るい。','道連れには手を貸しましょう。疲れたときは、あなたも手を借りていいのです。'],
        ['格子窓に竹の影。お茶の香りが残る。','お茶一杯の時間を自分に。外の音を聴いて、今日をゆっくり振り返りましょう。']
      ]
    },
    ko:{
      title:'운세 풀이',hint:'동자승의 통에서 대나무 제비를 뽑고 이야기를 들어보세요.',draw:'제비 뽑기',close:'닫기',number:n=>n+'번 제비',
      slips:[
        ['구름이 잠시 달을 가려도, 곧 맑은 빛이 비친다.','마음이 복잡할 때에는 작은 일 하나부터 해보세요. 마음이 가라앉으면 그때 결정하세요.'],
        ['봄물이 산을 돌아 마침내 바다에 이른다.','길이 험하면 방향을 바꿔 보세요. 한 걸음 내딛고 어디로 이어지는지 살펴보세요.'],
        ['등불 하나가 천 개의 불을 밝힌다. 빛은 저마다 환하다.','함께 걷는 사람에게 손을 내밀어 주세요. 지칠 때에는 도움을 청해도 좋습니다.'],
        ['창살에 대나무 그림자가 일렁이고, 차 향이 오래 남는다.','차 한 잔만큼의 시간을 스스로에게 주세요. 바깥 소리에 귀 기울이며 하루를 돌아보세요.']
      ]
    }
  };
  const wording=()=>fortunes[window.TempleI18n?.locale]??fortunes.en;

  function makeFortuneTube(T){
    const tube=new T.Group();
    tube.name='Bamboo fortune-stick tube';
    const lacquer=new T.MeshStandardMaterial({color:0x843b23,roughness:.52});
    const brass=new T.MeshStandardMaterial({color:0xd0a35a,roughness:.36,metalness:.4});
    const inner=new T.MeshStandardMaterial({color:0x3d2718,roughness:.8,side:T.DoubleSide});
    const bamboo=new T.MeshStandardMaterial({color:0xe0bf70,roughness:.75});
    const vermilion=new T.MeshStandardMaterial({color:0xa33926,roughness:.58});
    const place=(geometry,material,y,parent=tube)=>{
      const mesh=new T.Mesh(geometry,material);
      mesh.position.y=y;parent.add(mesh);return mesh;
    };
    place(new T.CylinderGeometry(.052,.047,.166,20,1,true),lacquer,0);
    place(new T.CylinderGeometry(.047,.044,.16,20,1,true),inner,0);
    place(new T.CylinderGeometry(.047,.047,.014,20),lacquer,-.078);
    const rim=new T.TorusGeometry(.048,.0044,7,24);
    for(const y of [-.069,.079])place(rim,brass,y).rotation.x=Math.PI/2;
    const stickShape=new T.BoxGeometry(.008,.133,.005);
    const tipShape=new T.BoxGeometry(.008,.032,.005);
    const sticks=Array.from({length:7},(_,index)=>{
      const stick=new T.Group(),angle=index*Math.PI*2/7;
      stick.position.set(Math.cos(angle)*.029,.065+index%3*.007,Math.sin(angle)*.029);
      stick.rotation.set(Math.sin(angle)*.14,angle,-Math.cos(angle)*.14);
      place(stickShape,bamboo,0,stick);place(tipShape,vermilion,.05,stick);
      tube.add(stick);return stick;
    });
    return {tube,sticks};
  }

  window.TempleGuide = {
    create(T, world, groundHeight, notice) {
      const x = -3.3, z = 10.6;
      let model, mixer, idle, bow, loading = false, nextAttempt = 0;
      let accumulated = 0, greeted = false, animationClock = 0, readyToBow = true;
      let hand, fortuneTube, dialog, drawn=-1, lifted=0;
      const guideEye = new T.Vector3(), palm = new T.Vector3();
      function near(position){return !!fortuneTube&&Math.hypot(position.x-x,position.z-z)<2.65;}
      function clearDraw(){
        if(drawn<0)return;
        fortuneTube.sticks[drawn].position.y-=lifted;
        drawn=-1;lifted=0;
      }
      function open(position){
        if(!near(position)||dialog?.open)return false;
        if(!dialog){
          dialog=document.createElement('dialog');
          dialog.id='fortune-dialog';
          dialog.setAttribute('aria-labelledby','fortune-title');
          dialog.innerHTML='<h2 id="fortune-title"></h2><p class="fortune-hint"></p><div class="fortune-slip" aria-live="polite"><span></span><strong></strong><p></p></div><div class="fortune-buttons"><button type="button" class="fortune-draw"></button><button type="button" class="fortune-close"></button></div>';
          const draw=dialog.querySelector('.fortune-draw'),close=dialog.querySelector('.fortune-close'),slip=dialog.querySelector('.fortune-slip');
          draw.addEventListener('click',()=>{
            const text=wording(),index=Math.floor(Math.random()*text.slips.length),[verse,reading]=text.slips[index];
            drawn=index;slip.children[0].textContent=text.number(index+1);
            slip.children[1].textContent=verse;slip.children[2].textContent=reading;
            close.focus();draw.hidden=true;
          });
          close.addEventListener('click',()=>dialog.close());
          dialog.addEventListener('close',clearDraw);
          document.body.appendChild(dialog);
        }
        clearDraw();
        const text=wording();
        dialog.querySelector('h2').textContent=text.title;
        dialog.querySelector('.fortune-hint').textContent=text.hint;
        for(const line of dialog.querySelector('.fortune-slip').children)line.textContent='';
        const draw=dialog.querySelector('.fortune-draw');
        draw.hidden=false;draw.textContent=text.draw;
        dialog.querySelector('.fortune-close').textContent=text.close;
        model.rotation.y=Math.atan2(position.x-x,position.z-z);
        document.dispatchEvent(new CustomEvent('temple-ui-open',{detail:'fortune'}));
        dialog.showModal();draw.focus();return true;
      }
      function placeTube(dt){
        if(!hand)return;
        hand.getWorldPosition(palm);
        model.worldToLocal(palm);
        fortuneTube.tube.position.copy(palm);
        fortuneTube.tube.position.x-=.021;
        fortuneTube.tube.position.z+=.058;
        if(drawn>=0){
          const rise=Math.min(.043-lifted,dt*.14);
          fortuneTube.sticks[drawn].position.y+=rise;lifted+=rise;
        }
      }
      async function load() {
        loading = true;
        try {
          const asset = await window.TempleGLB.load('assets/monk-guide.glb');
          model = asset.scene;
          model.name = 'Novice at the hall entrance';
          model.scale.setScalar(1.28);
          model.position.set(x, groundHeight(x,z), z);
          model.rotation.y = .65;
          world.scene.add(model);
          hand=model.getObjectByName('Hand_R');
          if(hand){
            fortuneTube=makeFortuneTube(T);
            model.add(fortuneTube.tube);
            placeTube(0);
          }
          mixer = new T.AnimationMixer(model);
          const clip = name => asset.animations.find(action => action.name === name);
          idle = mixer.clipAction(clip('Idle_Breathing_Loop'));
          const bowClip = clip('Respectful_Bow').clone();
          // The scan faces +Z. Its two spinal keys pitch backward, while the
          // head already nods forward. Reverse just the spine's sagittal pitch.
          for(const track of bowClip.tracks){
            if(track.name==='Spine_01.quaternion'||track.name==='Spine_02.quaternion'){
              for(let i=0;i<track.values.length;i+=4)track.values[i]*=-1;
            }
          }
          bow = mixer.clipAction(bowClip).setLoop(T.LoopRepeat,3);
          mixer.addEventListener('finished', e => { if(e.action === bow) idle.reset().play(); });
          idle.play();
        } catch (error) {
          if(model)world.scene.remove(model);
          model = null; hand=null; fortuneTube=null; nextAttempt = performance.now() + 30000;
          console.warn('Temple guide:', error.message);
        } finally { loading = false; }
      }
      return {near,open,label:()=>wording().title,get isOpen(){return !!dialog?.open;}, update(dt, position, clock, allowGreeting, camera) {
        const dx=position.x-x, dz=position.z-z, d2=dx*dx+dz*dz;
        if(!model) {
          if(clock>2 && d2<22*22 && !loading && performance.now()>=nextAttempt && window.TempleGLB)load();
          return;
        }
        if(d2>=12*12)readyToBow=true;
        model.visible=d2<50*50;
        if(!model.visible)return;
        if(readyToBow && d2<=7.5*7.5 && allowGreeting && !bow.isRunning()){
          guideEye.set(x,model.position.y+1.2,z);
          if(camera)guideEye.project(camera);
          if(!camera||(Math.abs(guideEye.x)<.95 && Math.abs(guideEye.y)<.95 && guideEye.z>=-1 && guideEye.z<=1)){
            readyToBow=false;
            if(d2>.04)model.rotation.y=Math.atan2(dx,dz);
            idle.stop();bow.reset().play();
          }
        }
        accumulated+=dt;
        if(accumulated>=(d2<100?1/30:1/12)){mixer.update(accumulated);placeTube(accumulated);accumulated=0;}
        if(d2<2.8*2.8 && allowGreeting && !greeted && clock>animationClock) {
          greeted=true; animationClock=clock+15;
          if(!bow.isRunning())model.rotation.y=Math.atan2(dx,dz);
          const messages=invitations[window.TempleI18n?.locale]||invitations.en;
          notice(messages[new Date().getDay()],5);
        }
        if(d2>6*6)greeted=false;
      }};
    }
  };
})();
;
(function () {
  'use strict';
  const copy = {
    'zh-CN':['祈福树','系愿带','读愿带','你想为谁做一件什么事？','系在树上','做到了，解下愿带','收起','愿带系好了，下次来还能读到。','愿带解开了，树下为你开了一朵花。','浏览器未能保存愿带，请稍后再试。','这条愿带保存在当前浏览器里。'],
    'zh-TW':['祈福樹','繫願帶','讀願帶','你想為誰做一件什麼事？','繫在樹上','做到了，解下願帶','收起','願帶繫好了，下次來還能讀到。','願帶解開了，樹下為你開了一朵花。','瀏覽器無法儲存願帶，請稍後再試。','這條願帶保存在目前的瀏覽器裡。'],
    en:['Wishing tree','Tie a ribbon','Read your ribbon','What would you like to do, and for whom?','Tie it to the tree','I did it · untie the ribbon','Close','Your wish will be here when you return.','A flower blooms where you untied your ribbon.','Your browser could not save this wish. Please try again.','This ribbon is saved in this browser.'],
    ja:['願いの木','リボンを結ぶ','願いを読む','誰のために、何をしたいですか？','木に結ぶ','できたので、ほどく','閉じる','また来たときに読み返せます。','木の下に花が一輪咲きました。','保存できませんでした。もう一度お試しください。','願いはこのブラウザに保存されます。'],
    ko:['소원 나무','리본 묶기','소원 읽기','누구를 위해 무엇을 하고 싶나요?','나무에 묶기','이뤘어요 · 리본 풀기','닫기','다음에 와서 다시 읽을 수 있어요.','나무 아래에 꽃 한 송이가 피었어요.','저장할 수 없어요. 다시 시도해 주세요.','이 리본은 현재 브라우저에 저장됩니다.']
  };
  const key='quiet-temple-wish-ribbon-v1';
  const empty=()=>({wish:'',flowers:0});
  function read(){
    const data=JSON.parse(localStorage.getItem(key)||'null');
    if(!data || typeof data.wish!=='string'||!Number.isSafeInteger(data.flowers)||data.flowers<0)return empty();
    return {wish:data.wish.slice(0,240),flowers:data.flowers};
  }
  function create(T,scene,navigation,notice){
    const tree=navigation.templeSceneLayout.props.wishingTree;
    const [x,,z]=tree.position;
    const ui=document.getElementById('wish-dialog'),form=ui.querySelector('form');
    const heading=ui.querySelector('h2'),label=ui.querySelector('label'),input=ui.querySelector('textarea');
    const written=ui.querySelector('blockquote'),submit=ui.querySelector('[type=submit]'),close=ui.querySelector('[type=button]'),hint=ui.querySelector('small');
    const words=()=>copy[window.TempleI18n?.locale]||copy[document.documentElement.lang]||copy[document.documentElement.lang.split('-')[0]]||copy.en;
    let data=empty(),openedWish='';
    try{data=read();}catch(_){}
    const mark=new T.Group();mark.name='Personal wish ribbon and flowers';scene.add(mark);
    const ground=(a,b)=>navigation.templeGroundHeight(a,b);
    const crimson=new T.MeshStandardMaterial({color:0xa63838,side:T.DoubleSide,roughness:.84});
    const ribbon=new T.Group();ribbon.name='Tied wish ribbon';mark.add(ribbon);
    const ribbonX=x+tree.collisionRadius-.45;
    ribbon.position.set(ribbonX,ground(ribbonX,z)+2.12,z);
    for(const side of [-1,1]){
      const tail=new T.Mesh(new T.PlaneGeometry(.13,.68),crimson);
      tail.position.set(side*.074,-.29,.025);tail.rotation.z=side*.18;tail.rotation.y=Math.PI/2-.25;ribbon.add(tail);
    }
    ribbon.add(new T.Mesh(new T.SphereGeometry(.11,8,5),crimson));
    const flowers=new T.Group();mark.add(flowers);
    const petals=new T.MeshStandardMaterial({color:0xf3b78c,roughness:.85});
    const gold=new T.MeshStandardMaterial({color:0xd99b43,roughness:.85});
    const stem=new T.MeshStandardMaterial({color:0x618453,roughness:.88});
    const flower=new T.Group();
    const stalk=new T.Mesh(new T.CylinderGeometry(.018,.025,.38,6),stem);stalk.position.y=.19;flower.add(stalk);
    const petalGeometry=new T.SphereGeometry(.115,8,5);
    for(let i=0;i<5;i++){
      const angle=i*2*Math.PI/5,petal=new T.Mesh(petalGeometry,petals);
      petal.position.set(.10*Math.cos(angle),.39,.10*Math.sin(angle));petal.scale.y=.43;flower.add(petal);
    }
    const centre=new T.Mesh(petalGeometry,gold);centre.scale.set(.65,.43,.65);centre.position.y=.415;flower.add(centre);
    function syncScene(){
      ribbon.visible=!!data.wish;
      const count=Math.min(12,data.flowers);
      while(flowers.children.length>count)flowers.remove(flowers.children[flowers.children.length-1]);
      while(flowers.children.length<count){
        const i=flowers.children.length,angle=(i%6-2.5)*.095,d=tree.collisionRadius+.15+.52*Math.floor(i/6);
        const a=x+Math.cos(angle)*d,b=z+Math.sin(angle)*d;
        const f=flower.clone();f.position.set(a,ground(a,b),b);flowers.add(f);
      }
    }
    function renderForm(){
      const w=words();
      heading.textContent=w[0];close.textContent=w[6];hint.textContent=w[10];
      label.textContent=w[3];input.hidden=label.hidden=!!data.wish;input.required=!data.wish;
      written.hidden=!data.wish;written.textContent=data.wish;submit.textContent=w[data.wish?5:4];
      openedWish=data.wish;
    }
    close.onclick=()=>ui.close();
    form.onsubmit=async e=>{
      e.preventDefault();const wish=input.value.trim().slice(0,240),expected=openedWish;
      if(!expected&&!wish){input.focus();return;}
      const commit=()=>{
        const current=read();
        if(current.wish!==expected){data=current;syncScene();renderForm();return;}
        const next=expected?{wish:'',flowers:current.flowers+1}:{wish,flowers:current.flowers};
        localStorage.setItem(key,JSON.stringify(next));data=next;syncScene();ui.close();notice(words()[expected?8:7]);
      };
      try{if(navigator.locks)await navigator.locks.request(key,commit);else commit();}
      catch(_){hint.textContent=words()[9];}
    };
    window.addEventListener('storage',e=>{if(e.key===key||e.key===null){try{data=read();syncScene();if(ui.open)renderForm();}catch(_){}}});
    syncScene();
    return {
      near(p){return Math.hypot(p.x-x,p.z-z)<=tree.collisionRadius+2.6;},
      label(){return words()[data.wish?2:1];},
      open(){
        if(ui.open)return;
        try{data=read();syncScene();}catch(_){}
        input.value='';renderForm();document.dispatchEvent(new Event('temple-ui-open'));ui.showModal();
        (data.wish?close:input).focus();
      },
      get isOpen(){return ui.open;}
    };
  }
  window.TempleWishRibbon={create};
})();
;
(() => {
  const duration = 2600;
  const smooth = (from, to, x) => {
    const v = Math.min(1, Math.max(0, (x - from) / (to - from)));
    return v * v * (3 - 2 * v);
  };

  function create(T, scene, player, camera) {
    let effect, beam, item, itemMaterials;
    let startedAt = null, still = false;
    function build() {
      effect = new T.Group();
      effect.name = 'First gold mala reward';
      const material = new T.ShaderMaterial({
        uniforms: { strength: {value: 0}, reach: {value: 0} },
        transparent: true, depthWrite: false, side: T.DoubleSide,
        blending: T.AdditiveBlending, toneMapped: false,
        vertexShader: 'varying vec2 vUv; void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}',
        fragmentShader: `
          uniform float strength, reach;
          varying vec2 vUv;
          void main() {
            float side = (vUv.x - 0.5) * (2.8 - 1.0 * vUv.y);
            float light = exp(-side * side * 8.0);
            float edge = smoothstep(0.0, 0.14, vUv.y) * (1.0-smoothstep(0.79,1.0,vUv.y));
            float entering = smoothstep(-0.08,0.08,vUv.y-1.0+reach*1.16);
            float alpha = light * edge * entering * strength;
            gl_FragColor = vec4(mix(vec3(1.0,0.52,0.12),vec3(1.0,0.90,0.57),light),alpha);
          }`
      });
      beam = new T.Mesh(new T.PlaneGeometry(1.75, 6.3), material);
      beam.position.y = 3.26;
      beam.renderOrder = 2;
      effect.add(beam);
      item = new T.Group();
      const necklace = window.TempleWardrobe.gearPreview(T, 'neck', 'gold');
      necklace.updateMatrixWorld(true);
      const box = new T.Box3().setFromObject(necklace);
      const center = box.getCenter(new T.Vector3());
      const size = box.getSize(new T.Vector3());
      const scale = 0.78 / Math.max(size.x, size.y, size.z);
      necklace.scale.multiplyScalar(scale);
      necklace.position.addScaledVector(center, -scale);
      const copies = new Map();
      necklace.traverse(child => {
        if (!child.isMesh) return;
        child.castShadow = false;
        child.receiveShadow = false;
        function forReward(source) {
          if (copies.has(source)) return copies.get(source);
          const copy = source.clone();
          copy.transparent = true;
          copy.depthWrite = false;
          if (copy.emissive) { copy.emissive.setHex(0xb16c25); copy.emissiveIntensity = 0.38; }
          copies.set(source, copy);
          return copy;
        }
        child.material = Array.isArray(child.material) ? child.material.map(forReward) : forReward(child.material);
        child.renderOrder = 3;
      });
      itemMaterials = [...copies.values()];
      item.add(necklace);
      effect.add(item);
      scene.add(effect);
    }
    function update(now) {
      if (startedAt === null) return;
      const elapsed = Math.max(0, now - startedAt);
      if (elapsed >= duration) {
        effect.visible = false;
        startedAt = null;
        return;
      }
      effect.position.copy(player.position);
      effect.rotation.y = Math.atan2(camera.position.x - player.position.x, camera.position.z - player.position.z);
      const fade = still ? 1 : 1 - smooth(2180, duration, elapsed);
      const entrance = still ? 1 : smooth(190, 570, elapsed);
      beam.material.uniforms.reach.value = still ? 1 : smooth(0, 430, elapsed);
      beam.material.uniforms.strength.value = (still ? 0.20 : 0.40 * smooth(0, 130, elapsed)) * fade;
      item.position.y = still ? 2.28 : 2.18 + 0.15 * entrance + 0.055 * Math.sin(elapsed * 0.0034);
      item.rotation.set(0.35, still ? 0 : 0.30 * Math.sin(elapsed * 0.0023), -0.08);
      item.visible = entrance > 0;
      for (const mat of itemMaterials) mat.opacity = entrance * fade;
    }
    function show(now) {
      if (!effect) build();
      still = !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
      startedAt = now;
      effect.visible = true;
      update(now);
    }
    return {show, update};
  }
  window.TempleBeadReward = {create};
})();
;
(function () {
  'use strict';
  const species = {
    cat: { file: 'Cow_Cat', scale: .78, distance: 1.35, side: -1 },
    dog: { file: 'Shiba_Inu', scale: .18, distance: 2.45, side: 1 }
  };
  const storageKey = 'quiet-temple-followers-v1';
  const labels = {
    'zh-CN': ['宠物', '奶牛猫', '柴犬', '放出', '收起', '正在加载', '跟随中', '已收起', '加载失败，请重试'],
    'zh-TW': ['寵物', '乳牛貓', '柴犬', '放出', '收起', '正在載入', '跟隨中', '已收起', '載入失敗，請重試'],
    en: ['Pets', 'Piebald cat', 'Shiba Inu', 'Summon', 'Recall', 'Loading', 'Following', 'Recalled', 'Could not load. Try again.'],
    ja: ['ペット', '白黒猫', '柴犬', '呼ぶ', '戻す', '読み込み中', '同行中', '待機中', '再試行してください'],
    ko: ['반려동물', '얼룩 고양이', '시바견', '부르기', '돌려보내기', '불러오는 중', '따라가는 중', '대기 중', '다시 시도하세요']
  };
  const distance = (a, b) => Math.hypot(a.x-b.x, a.z-b.z);

  function create(T, world, nav, canOccupy) {
    let saved = [];
    try { saved = JSON.parse(localStorage.getItem(storageKey) || '[]'); } catch {}
    const slots = Object.entries(species).map(([id, spec]) => ({
      id, spec, enabled: Array.isArray(saved) && saved.includes(id),
      actor: null, loading: null, error: false, waiting: 0, action: null
    }));
    const listeners = new Set();
    const trail = [];
    let disposed = false;
    const notify = () => listeners.forEach(fn => fn());
    function remember() {
      try { localStorage.setItem(storageKey, JSON.stringify(slots.filter(s => s.enabled).map(s => s.id))); } catch {}
    }
    function hide(slot) {
      if (!slot.actor) return;
      const wasFollowing = !!slot.actor.anchor.parent;
      slot.actor.anchor.removeFromParent();
      slot.actor.mixer.stopAllAction();
      slot.action = null;
      slot.waiting = 0;
      if (wasFollowing && !disposed) notify();
    }
    function load(slot) {
      if (slot.actor || slot.loading || disposed) return;
      slot.loading = Promise.resolve().then(() => window.TempleGLB.load('assets/companions/'+slot.spec.file+'.glb.gz'))
        .then(({scene: model, animations}) => {
          if (disposed) return;
          const anchor = new T.Group();
          anchor.name = 'Player pet: '+slot.id;
          model.scale.multiplyScalar(slot.spec.scale);
          model.traverse(node => {
            node.layers.set(1);
            if (node.isMesh) { node.castShadow = false; node.receiveShadow = true; }
          });
          anchor.add(model);
          const mixer = new T.AnimationMixer(model);
          const actions = new Map(animations.map(clip => [clip.name, mixer.clipAction(clip)]));
          slot.actor = {anchor, model, mixer, actions};
        }).catch(() => {
          if (disposed || !slot.enabled) return;
          slot.enabled = false;
          slot.error = true;
          remember();
        }).finally(() => { slot.loading = null; if (!disposed) notify(); });
      notify();
    }
    function setActive(id, enabled) {
      const slot = slots.find(item => item.id === id);
      if (!slot || disposed || slot.enabled === enabled) return;
      slot.enabled = enabled;
      slot.error = false;
      if (!enabled) hide(slot);
      else load(slot);
      remember();
      notify();
    }
    function play(slot, moving, speed = 0) {
      const action = slot.actor.actions.get(moving ? 'Walk' : 'Idle');
      if (!action) return;
      if (action !== slot.action) {
        slot.action?.fadeOut(.16);
        action.reset().fadeIn(.16).play();
        slot.action = action;
      }
      action.setEffectiveTimeScale(moving ? Math.max(.75, Math.min(2.8, speed/.9)) : 1);
    }
    function clear(slot, point) {
      if (!nav.templeCanStand(point.x, point.z) || !canOccupy(point.x, point.z)) return false;
      return slots.every(other => other === slot || !other.actor?.anchor.parent || distance(other.actor.anchor.position, point) >= .65);
    }
    function place(slot, player, preferred) {
      const {position: origin} = player;
      const yaw = player.rotation.y, c = Math.cos(yaw), s = Math.sin(yaw);
      const candidates = [];
      if (preferred) candidates.push(preferred);
      for (const [side, back] of [[slot.spec.side,1],[-slot.spec.side,1],[slot.spec.side,0],[-slot.spec.side,0],[slot.spec.side,-1]]) {
        candidates.push({x: origin.x+side*c-back*s, z: origin.z-side*s-back*c});
      }
      const point = candidates.find(p => distance(p, origin) >= .8 && distance(p, origin) <= 3.3
        && clear(slot, p) && nav.templeCanTravel(origin.x, origin.z, p.x, p.z));
      if (!point) return;
      const {anchor, model} = slot.actor;
      anchor.position.set(point.x, nav.templeGroundHeight(point.x, point.z), point.z);
      model.rotation.y = yaw;
      slot.waiting = 0;
      world.scene.add(anchor);
      play(slot, false);
      notify();
    }
    function update(dt, player) {
      if (disposed) return;
      if (!slots.some(slot => slot.enabled)) { trail.length = 0; return; }
      const origin = player.position;
      const last = trail.at(-1);
      if (last && distance(last, origin) > 9) {
        trail.length = 0;
        slots.forEach(hide);
      }
      if (!trail.length || distance(trail.at(-1), origin) >= .32) {
        trail.push({x: origin.x, z: origin.z});
        if (trail.length > 45) trail.shift();
      }
      for (const slot of slots) {
        if (!slot.enabled) continue;
        if (!slot.actor) { load(slot); continue; }
        const {anchor, model, mixer} = slot.actor, p = anchor.position;
        let goalIndex = -1, gap = 0, next = origin;
        for (let i = trail.length-1; i >= 0; i--) {
          gap += distance(next, trail[i]);
          if (gap >= slot.spec.distance) { goalIndex = i; break; }
          next = trail[i];
        }
        const target = trail[goalIndex];
        if (!anchor.parent || distance(p, origin) > 13 || slot.waiting > 3) {
          hide(slot);
          place(slot, player, target);
          continue;
        }
        // If a corner blocks the direct route, trace the player's prior steps around it.
        let waypoint = target;
        const reachable = point => point && nav.templeCanTravel(p.x, p.z, point.x, point.z);
        if (!reachable(waypoint)) {
          waypoint = null;
          for (let i = goalIndex-1; i >= 0; i--) {
            if (distance(p, trail[i]) > .3 && reachable(trail[i])) { waypoint = trail[i]; break; }
          }
        }
        let moved = false, speed = 0;
        if (waypoint) {
          const remaining = distance(p, waypoint);
          if (remaining > .20) {
            speed = Math.min(5.7, 1.6+Math.max(0, distance(p, origin)-1.4)*1.8);
            const ratio = Math.min(1, speed*dt/remaining);
            const step = {x: p.x+(waypoint.x-p.x)*ratio, z: p.z+(waypoint.z-p.z)*ratio};
            if (distance(step, origin) >= .68 && clear(slot, step)) {
              const yaw = Math.atan2(step.x-p.x, step.z-p.z);
              const turn = yaw-model.rotation.y;
              model.rotation.y += Math.atan2(Math.sin(turn), Math.cos(turn))*Math.min(1, dt*10);
              world.landscape?.trackAnimal?.(anchor,slot.id,p.x,p.z,step.x,step.z);
              p.set(step.x, nav.templeGroundHeight(step.x, step.z), step.z);
              moved = ratio > 0;
            }
          }
        }
        slot.waiting = !moved && distance(p, origin)>3.5 ? slot.waiting+dt : 0;
        play(slot, moved, speed);
        mixer.update(dt);
      }
    }
    function status() {
      return slots.map(slot => ({
        id: slot.id, enabled: slot.enabled, error: slot.error,
        loading: !!slot.loading, following: !!slot.actor?.anchor.parent,
        position: slot.actor?.anchor.parent ? slot.actor.anchor.position.toArray() : null
      }));
    }
    function dispose() {
      disposed = true;
      slots.forEach(hide);
      for (const slot of slots) if (slot.actor) slot.actor.mixer.uncacheRoot(slot.actor.model);
      listeners.clear();
    }
    return {setActive, update, status, dispose, subscribe(fn) { listeners.add(fn); return () => listeners.delete(fn); }};
  }

  function mountControls(pets, top) {
    const container = document.createElement('div');
    container.className = 'pet-controls';
    const toggle = document.createElement('button');
    toggle.id = 'pet-toggle';
    toggle.type = 'button';
    toggle.setAttribute('aria-controls', 'pet-panel');
    const panel = document.createElement('section');
    panel.id = 'pet-panel';
    const title = document.createElement('strong');
    panel.append(title);
    container.append(toggle, panel);
    top.append(container);
    const rows = ['cat', 'dog'].map(id => {
      const row = document.createElement('div');
      row.className = 'pet-row';
      const description = document.createElement('div');
      const name = document.createElement('span');
      const state = document.createElement('small');
      state.setAttribute('aria-live', 'polite');
      const button = document.createElement('button');
      button.type = 'button';
      button.addEventListener('click', () => pets.setActive(id, !pets.status().find(slot => slot.id === id).enabled));
      description.append(name, state);
      row.append(description, button);
      panel.append(row);
      return {name, state, button};
    });
    function setOpen(open) {
      panel.hidden = !open;
      toggle.setAttribute('aria-expanded', String(open));
      if (open) {
        document.exitPointerLock?.();
        document.dispatchEvent(new CustomEvent('temple-ui-open', {detail:'pets'}));
      }
    }
    toggle.addEventListener('click', () => setOpen(panel.hidden));
    container.addEventListener('keydown', event => {
      if (event.key === 'Escape' && !panel.hidden) { setOpen(false); toggle.focus(); event.preventDefault(); }
      event.stopPropagation();
    });
    document.addEventListener('pointerdown', event => { if (!container.contains(event.target)) setOpen(false); });
    document.addEventListener('temple-ui-open', event => { if (event.detail === 'weather') setOpen(false); });
    document.addEventListener('temple-hud-hidden', () => setOpen(false));
    function render() {
      const names = labels[window.TempleI18n?.locale] || labels['zh-CN'];
      toggle.textContent = names[0];
      panel.setAttribute('aria-label', names[0]);
      title.textContent = names[0];
      pets.status().forEach((slot, i) => {
        const row = rows[i], name = names[i+1];
        row.name.textContent = name;
        row.state.textContent = names[slot.error ? 8 : slot.enabled ? slot.loading || !slot.following ? 5 : 6 : 7];
        row.button.textContent = names[slot.enabled ? 4 : 3];
        row.button.setAttribute('aria-label', name+' · '+row.button.textContent);
        row.button.setAttribute('aria-pressed', String(slot.enabled));
      });
    }
    pets.subscribe(render);
    window.TempleI18n?.onChange(render);
    setOpen(false);
    render();
  }
  window.TemplePets = {create, mountControls};
})();

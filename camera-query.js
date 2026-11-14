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

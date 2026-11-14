/* Island Zen 4.0: real GLB scene + free-roam controls. The monk is a temporary procedural stand-in. */
(() => {
'use strict';
const $=id=>document.getElementById(id), canvas=$('view'), play=$('play'), load=$('loadStatus');
const keys=new Set(), seats=[], ground=[], waters=[], lights=[];
const state={started:false,sit:false,pray:false,season:0,day:0.4*5400,elapsed:0,stride:0,bowAt:-10,seatId:''};
let T,renderer,scene,camera,root,player,avatar,standing,seated,torso,armL,armR,legL,legR,ambient,sun,moon;
let yaw=Math.PI,pitch=.28,distance=8.5,drag=false,px=0,py=0,last=0,lastUI=0,lastWave=0;
const DAY=5400,SEASON=7200,names=['春','夏','秋','冬'];
const palettes=[0xaed7dc,0x91c9dc,0xd6b8a0,0xc7d8e1];
function updateProgress(percent,detail){
 const fill=$('progressFill'),label=$('progressPercent'),meta=$('progressDetail'),track=$('progressTrack');
 if(!fill)return;
 const value=Math.max(0,Math.min(100,percent));
 fill.style.width=value.toFixed(1)+'%';
 if(label)label.textContent=Math.round(value)+'%';
 if(meta&&detail)meta.textContent=detail;
 if(track)track.setAttribute('aria-valuenow',String(Math.round(value)));
}
function status(s,percent,detail){
 window.__ISLAND_ZEN_LAST_PROGRESS_AT__=Date.now();
 if(load)load.textContent=s;
 if(Number.isFinite(percent))updateProgress(percent,detail);
 else if(detail){const meta=$('progressDetail');if(meta)meta.textContent=detail;}
}
function fallbackStatus(s){
 if(load)load.textContent=s;
 const track=$('progressTrack'),meta=$('progressMeta');
 if(track)track.style.display='none';
 if(meta)meta.style.display='none';
}
function formatMB(value){return (value/1000000).toFixed(1)+' MB';}
function say(s){const e=$('toast');if(e){e.textContent=s;e.classList.add('on');setTimeout(()=>e.classList.remove('on'),2200);}}
function script(src,timeoutMs=8000){return new Promise((ok,no)=>{const el=document.createElement('script');let settled=false;const finish=(fn,v)=>{if(settled)return;settled=true;clearTimeout(timer);fn(v);};const timer=setTimeout(()=>{el.remove();finish(no,Error('脚本加载超时：'+src));},timeoutMs);el.src=src;el.crossOrigin='anonymous';el.onload=()=>finish(ok);el.onerror=()=>finish(no,Error('脚本加载失败：'+src));document.head.appendChild(el);});}
async function ensureThree(){
 const vendorBase=new URL('/fantasy3d-showcase/vendor/',location.origin).href;
 try{
  if(!window.THREE){status('正在加载本地 3D 引擎…',0.5,'加载 Three.js 引擎');await script(vendorBase+'three.min.js',20000);}
  T=window.THREE;
  if(!T)throw Error('Three.js 核心未注册');
  if(!T.GLTFLoader){status('正在加载本地模型解析器…',1,'加载 GLTFLoader');await script(vendorBase+'GLTFLoader.js',20000);}
  if(T.GLTFLoader)return T;
  throw Error('GLTFLoader 未注册');
 }catch(e){throw Error('本地 3D 引擎加载失败：'+(e&&e.message||e));}
}
async function gunzip(bytes){
 if('DecompressionStream'in window)return await new Response(new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip'))).arrayBuffer();
 const pakoUrl=new URL('/fantasy3d-showcase/vendor/pako.min.js',location.origin).href;
 await script(pakoUrl,15000);
 const a=window.pako.ungzip(bytes);
 return a.buffer.slice(a.byteOffset,a.byteOffset+a.byteLength);
}
async function fetchTextWithTimeout(url,timeoutMs=45000,cache='force-cache',onProgress=null){
 const controller=new AbortController();
 let timer=null;
 const armTimeout=()=>{if(timer)clearTimeout(timer);timer=setTimeout(()=>controller.abort(),timeoutMs);};
 armTimeout();
 try{
  const response=await fetch(url,{cache,signal:controller.signal});
  if(!response.ok)throw Error('HTTP '+response.status+'：'+url);
  const total=Number(response.headers.get('content-length'))||0;
  if(!response.body||!response.body.getReader){
   const text=await response.text();
   window.__ISLAND_ZEN_LAST_PROGRESS_AT__=Date.now();
   if(onProgress)onProgress(text.length,total||text.length);
   return text;
  }
  const reader=response.body.getReader(),decoder=new TextDecoder(),chunks=[];
  let received=0,lastReport=0;
  while(true){
   const part=await reader.read();
   if(part.done)break;
   chunks.push(decoder.decode(part.value,{stream:true}));
   received+=part.value.byteLength;
   const now=Date.now();
   window.__ISLAND_ZEN_LAST_PROGRESS_AT__=now;
   if(onProgress&&(now-lastReport>=800||(total&&received>=total))){
    onProgress(received,total);
    lastReport=now;
   }
   armTimeout();
  }
  chunks.push(decoder.decode());
  if(onProgress)onProgress(received,total||received);
  window.__ISLAND_ZEN_LAST_PROGRESS_AT__=Date.now();
  return chunks.join('');
 }catch(e){
  if(e&&e.name==='AbortError')throw Error('资源下载连续超时无数据：'+url);
  throw e;
 }finally{if(timer)clearTimeout(timer);}
}
async function getScene(){
 const assetBase=new URL('/fantasy3d-showcase/assets/scene/',location.origin).href;
 status('正在读取真实场景清单…',1,'读取场景清单');
 const manifestText=await fetchTextWithTimeout(assetBase+'manifest.json',15000,'no-store');
 const m=JSON.parse(manifestText);
 if(m.encoding!=='gzip+base64'||!m.chunks)throw Error('场景清单格式错误');
 const packCount=5,parts=new Array(packCount),packReceived=new Array(packCount).fill(0);
 const totalEncodedChars=Number(m.totalEncodedChars)||11181796;
 let loaded=0;
 const reportDownload=()=>{
  const downloaded=packReceived.reduce((sum,value)=>sum+value,0);
  const remaining=Math.max(0,totalEncodedChars-downloaded);
  const percent=2+78*Math.min(1,downloaded/totalEncodedChars);
  status('正在下载真实 3D 场景模型…',percent,
   '已下载 '+formatMB(downloaded)+' · 剩余 '+formatMB(remaining)+' · '+loaded+'/'+packCount+' 包完成');
 };
 reportDownload();
 await Promise.all(Array.from({length:packCount},async(_,i)=>{
  const name='scene_pack_'+String(i).padStart(2,'0')+'.txt';
  parts[i]=(await fetchTextWithTimeout(assetBase+name,180000,'force-cache',(received)=>{
   packReceived[i]=received;
   reportDownload();
  })).trim();
  packReceived[i]=parts[i].length;
  loaded++;
  reportDownload();
 }));
 status('模型资源下载完成，正在解码…',81,'资源包 '+packCount+'/'+packCount+' · '+formatMB(totalEncodedChars)+' 已下载');
 const b=atob(parts.join(''));
 const c=new Uint8Array(b.length);
 for(let i=0;i<b.length;i++)c[i]=b.charCodeAt(i);
 status('正在解压真实 3D 场景…',85,'解压 GLB 模型');
 const data=await gunzip(c);
 if(m.sourceBytes&&data.byteLength!==m.sourceBytes)throw Error('场景字节数校验失败');
 status('正在校验 3D 场景完整性…',90,'校验文件大小与 SHA-256');
 if(m.sha256&&crypto.subtle){
  const h=await crypto.subtle.digest('SHA-256',data);
  const hex=[...new Uint8Array(h)].map(x=>x.toString(16).padStart(2,'0')).join('');
  if(hex!==m.sha256.toLowerCase())throw Error('场景 SHA-256 校验失败');
 }
 status('3D 资源校验完成',93,'模型完整性校验通过');
 return data;
}
function mat(c,r=.9){return new T.MeshStandardMaterial({color:c,roughness:r});}
function capsule(r,h,m){return new T.Mesh(T.CapsuleGeometry?new T.CapsuleGeometry(r,h,4,8):new T.CylinderGeometry(r,r,h+2*r,10),m);}
function buildAvatar(){avatar=new T.Group();standing=new T.Group();torso=new T.Group();torso.position.y=1;standing.add(torso);const robe=mat(0xb7793f),light=mat(0xd09a56),skin=mat(0xe8c7a0),dark=mat(0x392d25);
const body=new T.Mesh(new T.CylinderGeometry(.29,.43,.96,14),robe);body.position.y=-.06;torso.add(body);const head=new T.Mesh(new T.SphereGeometry(.225,18,14),skin);head.position.set(0,.61,.02);torso.add(head);
for(const x of [-.075,.075]){const eye=new T.Mesh(new T.SphereGeometry(.018,8,6),dark);eye.position.set(x,.63,.22);torso.add(eye);}for(const x of [-.22,.22]){const ear=new T.Mesh(new T.SphereGeometry(.06,8,6),skin);ear.position.set(x,.6,.01);torso.add(ear);}
armL=new T.Group();armR=new T.Group();armL.position.set(-.31,.22,0);armR.position.set(.31,.22,0);for(const g of [armL,armR]){const a=capsule(.075,.34,light);a.position.y=-.22;const h=new T.Mesh(new T.SphereGeometry(.07,8,6),skin);h.position.set(0,-.45,.04);g.add(a,h);torso.add(g);}
legL=new T.Group();legR=new T.Group();for(const [g,x] of [[legL,-.15],[legR,.15]]){g.position.set(x,-.52,0);const a=capsule(.1,.34,robe);a.position.y=-.18;g.add(a);standing.add(g);}
seated=new T.Group();seated.position.y=.3;const sr=new T.Mesh(new T.CylinderGeometry(.38,.5,.72,16),robe);sr.position.y=.55;seated.add(sr);const sh=new T.Mesh(new T.SphereGeometry(.22,16,12),skin);sh.position.y=1.13;seated.add(sh);for(const x of [-.16,.16]){const leg=capsule(.1,.43,light);leg.rotation.z=Math.PI/2;leg.position.set(x,.18,.12);seated.add(leg);}const palms=new T.Mesh(new T.SphereGeometry(.08,8,6),skin);palms.position.set(0,.83,.36);seated.add(palms);seated.visible=false;avatar.add(standing,seated);
const shadow=new T.Mesh(new T.CircleGeometry(.52,20),new T.MeshBasicMaterial({color:0x233a35,transparent:true,opacity:.17,depthWrite:false}));shadow.rotation.x=-Math.PI/2;shadow.position.y=.02;avatar.add(shadow);scene.add(avatar);}
function buildHut(){const g=new T.Group();g.position.set(-28,0,-8);scene.add(g);const wood=mat(0x79553b),wall=mat(0xe6d6b6),roof=mat(0x405d55);const floor=new T.Mesh(new T.BoxGeometry(7,.22,6),mat(0x9c9b86));floor.position.y=.11;g.add(floor);const room=new T.Mesh(new T.BoxGeometry(5.3,2.3,4.6),wall);room.position.y=1.35;g.add(room);const door=new T.Mesh(new T.BoxGeometry(1,1.8,.1),wood);door.position.set(0,1,2.36);g.add(door);const top=new T.Mesh(new T.ConeGeometry(4.2,1.6,4),roof);top.rotation.y=Math.PI/4;top.position.y=3.3;g.add(top);const table=new T.Mesh(new T.BoxGeometry(1.1,.12,.7),wood);table.position.set(0,.75,3.6);g.add(table);const lamp=new T.PointLight(0xffd39b,.7,10);lamp.position.set(0,2,2.5);g.add(lamp);}
function buildSeats(){const xs=[-10.15,-6.95,-3.75,3.75,6.95,10.15];for(let r=0;r<11;r++)for(let c=0;c<6;c++)seats.push({id:'P'+String(r*6+c+1).padStart(2,'0'),x:xs[c],y:1.4625,z:-10.9+r*1.65});}
function prep(g){root=g.scene;scene.add(root);root.traverse(o=>{if(!o.isMesh)return;o.castShadow=true;o.receiveShadow=true;const n=o.name||'';if(/Env_01_|Env_02_|Env_13_|Hall_floor__wood|Hall_interior_floor__|Hall_steps__stone|Hall_base__stone/.test(n))ground.push(o);if(/Env_03_/.test(n)){const a=o.geometry.attributes.position;waters.push({g:o.geometry,a,base:Float32Array.from(a.array)});}});for(const x of [-7,7])for(const z of [-5,5]){const l=new T.PointLight(0xffd29a,.5,18);l.position.set(x,4.3,z);root.add(l);lights.push(l);}root.updateMatrixWorld(true);buildSeats();}
const ray=new T.Raycaster();function floorY(x,z){if(!ground.length)return null;ray.set(new T.Vector3(x,80,z),new T.Vector3(0,-1,0));const h=ray.intersectObjects(ground,false);return h.length?h[0].point.y:null;}
function sit(on,seat){state.sit=on;state.seatId=on&&seat?seat.id:'';if(on&&seat){player.position.set(seat.x,seat.y-.3,seat.z);seated.position.y=.3;}else{const fy=floorY(player.position.x,player.position.z);if(fy!==null)player.position.y=fy+.02;seated.position.y=0;}avatar.position.copy(player.position);standing.visible=!on;seated.visible=on;$('meditate').textContent=on?'☯ 起身':'☯ 静坐';$('meditate').classList.toggle('on',on);say(on?(state.seatId?'已在 '+state.seatId+' 入座':'开始静坐'):'已起身');}
function nearSeat(){let best=null,d=2.5;for(const s of seats){const q=Math.hypot(s.x-player.position.x,s.z-player.position.z);if(q<d){d=q;best=s;}}return best;}
function interact(){if(state.sit){sit(false);return;}const s=nearSeat();if(!s){say('走近大殿里的蒲团，再按 E 入座。');return;}sit(true,s);}
function teleport(x,z,msg,face=Math.PI){if(state.sit)sit(false);const fy=floorY(x,z);player.position.set(x,(fy===null?0:fy)+.02,z);yaw=face;player.rotation.y=yaw;avatar.position.copy(player.position);avatar.rotation.y=yaw;say(msg);}
function timeSeason(){const p=((state.day%DAY)+DAY)%DAY/DAY,season=Math.floor(state.season/SEASON)%4,day=p<.07?'黎明':p<.8?'晴昼':p<.89?'晚霞':p<.96?'月夜':'日出',light=p<.07?.28+.72*p/.07:p<.8?1:p<.89?1-.82*(p-.8)/.09:p<.96?.18:.18+.1*(p-.96)/.04;scene.background.setHex(palettes[season]);scene.fog.color.setHex(palettes[season]);const a=p*Math.PI*2-Math.PI/2;sun.position.set(Math.cos(a)*90,Math.max(-30,Math.sin(a)*90),Math.sin(a)*90);sun.intensity=.18+light*1.8;sun.color.setHex(p>.78&&p<.91?0xffbd86:0xffedcf);ambient.intensity=.45+light*.62;moon.intensity=.05+(1-light)*.62;lights.forEach(l=>l.intensity=.18+(1-light)*1.35);$('seasonLabel').textContent=names[season]+' · '+day;$('clockLabel').textContent='四季每2小时 · 昼夜90分钟';$('timefill').style.width=Math.round(p*100)+'%';}
function controls(){play.onclick=()=>{state.started=true;$('start').style.display='none';const panel=$('loadingPanel');if(panel)panel.style.display='none';say('欢迎来到海岛。靠近蒲团按 E 入座。');};$('goHall').onclick=()=>teleport(0,-21,'已抵达大殿 · 66席禅堂',0);$('goZen').onclick=()=>teleport(-28,-12,'已抵达禅居 · 喝茶听海',0);$('home').onclick=()=>teleport(0,-31,'回到海边',Math.PI);$('seasons').onclick=()=>{state.season=(state.season+SEASON)%(4*SEASON);timeSeason();say('四季轮转');};$('tod').onclick=()=>{const p=state.day%DAY/DAY;state.day=(p<.78?.845:p<.91?.945:.035)*DAY;timeSeason();say('时间流转');};$('meditate').onclick=()=>sit(!state.sit);$('prayer').onclick=()=>{state.pray=!state.pray;$('prayer').textContent=state.pray?'🙏 放下合掌':'🙏 合掌';say(state.pray?'双手合十，静心礼敬。':'恢复自然站姿。');};$('bow').onclick=()=>{state.bowAt=state.elapsed;say('合掌低首，礼佛一拜。');};
window.addEventListener('keydown',e=>{const k=e.key.toLowerCase();if(['w','a','s','d','arrowup','arrowdown','arrowleft','arrowright','shift',' ','e','p','b'].includes(k)){if(k===' '||k.startsWith('arrow'))e.preventDefault();if(!e.repeat){if(k===' ')sit(!state.sit);else if(k==='e')interact();else if(k==='p')$('prayer').click();else if(k==='b')$('bow').click();}keys.add(k);}});window.addEventListener('keyup',e=>keys.delete(e.key.toLowerCase()));window.addEventListener('blur',()=>keys.clear());document.querySelectorAll('[data-key]').forEach(e=>{const k=e.dataset.key;e.onpointerdown=x=>{x.preventDefault();keys.add(k);e.setPointerCapture(x.pointerId);};['pointerup','pointercancel','lostpointercapture'].forEach(n=>e.addEventListener(n,()=>keys.delete(k)));});canvas.onpointerdown=e=>{drag=true;px=e.clientX;py=e.clientY;canvas.setPointerCapture(e.pointerId);};canvas.onpointermove=e=>{if(!drag)return;const dx=e.clientX-px,dy=e.clientY-py;px=e.clientX;py=e.clientY;yaw-=dx*.005;pitch=T.MathUtils.clamp(pitch+dy*.0025,-.08,.62);};['pointerup','pointercancel','lostpointercapture'].forEach(n=>canvas.addEventListener(n,()=>drag=false));canvas.onwheel=e=>distance=T.MathUtils.clamp(distance+e.deltaY*.008,5,15);window.addEventListener('resize',resize);}
function resize(){if(!renderer)return;const w=canvas.clientWidth||innerWidth,h=canvas.clientHeight||innerHeight;renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.7));renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();}
function frame(t){requestAnimationFrame(frame);if(!renderer)return;const dt=Math.min(.05,Math.max(.001,(t-(last||t))/1000));last=t;state.elapsed+=dt;if(state.started){state.day+=dt;state.season+=dt;let f=(keys.has('w')||keys.has('arrowup')?1:0)-(keys.has('s')||keys.has('arrowdown')?1:0),s=(keys.has('d')||keys.has('arrowright')?1:0)-(keys.has('a')||keys.has('arrowleft')?1:0),l=Math.hypot(f,s);if(l>.001&&!state.sit){f/=l;s/=l;const fw=new T.Vector3(Math.sin(yaw),0,Math.cos(yaw)),rt=new T.Vector3(Math.cos(yaw),0,-Math.sin(yaw)),dir=fw.multiplyScalar(f).add(rt.multiplyScalar(s)).normalize(),speed=keys.has('shift')?6:3.1;const nx=T.MathUtils.clamp(player.position.x+dir.x*speed*dt,-150,150),nz=T.MathUtils.clamp(player.position.z+dir.z*speed*dt,-47,142),fy=floorY(nx,nz);if(fy!==null){player.position.set(nx,fy+.02,nz);player.rotation.y=Math.atan2(dir.x,dir.z);state.stride+=dt*speed*2;}}avatar.position.copy(player.position);avatar.rotation.y=player.rotation.y;if(!state.sit){const sw=(l>.001?Math.sin(state.stride)*.42:0);legL.rotation.x=sw;legR.rotation.x=-sw;armL.rotation.x=-sw*.5;armR.rotation.x=sw*.5;armL.rotation.z=state.pray ? .78 : 0;armR.rotation.z=state.pray ? -.78 : 0;const b=(state.elapsed-state.bowAt)/1.6;torso.rotation.x=b>=0&&b<=1?Math.sin(Math.PI*b)*.48:0;}if(t-lastUI>500){const q=nearSeat();$('tip').textContent=state.sit?(state.seatId?'正在蒲团 '+state.seatId+' 静坐 · 按 E 起身':'静坐片刻，听海风经过 · 按空格起身'):q?'蒲团 '+q.id+' · 按 E 入座静坐':'WASD 漫游 · E 靠近蒲团入座 · 空格静坐 · Shift 奔跑';timeSeason();lastUI=t;}const target=new T.Vector3(player.position.x,player.position.y+(state.sit ? .85 : 1.15),player.position.z),offset=new T.Vector3(-Math.sin(yaw)*distance,3.8+pitch*5,-Math.cos(yaw)*distance);camera.position.lerp(target.clone().add(offset),1-Math.pow(.001,dt));camera.lookAt(target.clone().add(new T.Vector3(Math.sin(yaw)*2,.2,Math.cos(yaw)*2)));}
if(t-lastWave>90){for(const w of waters){const a=w.a,b=w.base;for(let i=0;i<a.count;i++){const k=i*3,x=b[k],z=b[k+2];a.array[k+1]=b[k+1]+Math.sin(x*.035+state.elapsed*1.25)*.05+Math.cos(z*.026-state.elapsed*.9)*.035;}a.needsUpdate=true;w.g.computeVertexNormals();}lastWave=t;}renderer.render(scene,camera);}
async function boot(){try{status('正在准备真实 3D 场景…',0,'初始化 3D 引擎');T=await ensureThree();if(window.__ISLAND_ZEN_FORCE_FALLBACK__)return;renderer=new T.WebGLRenderer({canvas,antialias:true,powerPreference:'high-performance'});renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.7));renderer.setSize(innerWidth,innerHeight,false);renderer.outputEncoding=T.sRGBEncoding;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.12;renderer.shadowMap.enabled=true;scene=new T.Scene();scene.background=new T.Color(0xaed7dc);scene.fog=new T.Fog(0xc8ddda,150,850);camera=new T.PerspectiveCamera(58,innerWidth/innerHeight,.08,1800);camera.position.set(0,7.5,40);camera.lookAt(0,2,0);ambient=new T.HemisphereLight(0xd8edf4,0x76604a,1.05);scene.add(ambient);sun=new T.DirectionalLight(0xffedcf,1.8);sun.position.set(55,85,30);scene.add(sun);moon=new T.DirectionalLight(0x8ea8d8,.12);scene.add(moon);status('正在准备真实海岛资源…',2,'准备下载模型');const data=await getScene();if(window.__ISLAND_ZEN_FORCE_FALLBACK__)return;status('正在解析真实 3D 海岛模型…',95,'解析 GLB 场景与贴图');window.__ISLAND_ZEN_LAST_PROGRESS_AT__=Date.now();const gltf=await new Promise((ok,no)=>new T.GLTFLoader().parse(data,'',ok,no));status('正在构建岛屿场景与灯光…',98,'初始化场景对象');prep(gltf);window.__ISLAND_ZEN_LAST_PROGRESS_AT__=Date.now();player=new T.Group();const shoreY=floorY(0,-31);player.position.set(0,(shoreY===null?0:shoreY)+.02,-31);player.rotation.y=yaw;scene.add(player);buildAvatar();avatar.position.copy(player.position);buildHut();timeSeason();controls();resize();play.disabled=false;status('真实 3D 场景已就绪 · 144个网格 · 75张贴图',100,'加载完成，可以进入游戏');window.__ISLAND_ZEN_READY__='glb';window.__ISLAND_ZEN_VERSION__='4.0';requestAnimationFrame(frame);}catch(e){console.error('[Island Zen]',e);window.__ISLAND_ZEN_ERROR__=String(e&&e.message||e);if(window.__ISLAND_ZEN_FORCE_FALLBACK__)return;play.disabled=false;play.textContent='进入海岛（兼容画面）';fallbackStatus('真实 3D 场景未能加载，已切换兼容画面：'+String(e&&e.message||e));if(window.startIslandZen2D&&!window.__ISLAND_ZEN_FALLBACK_STARTED__)window.startIslandZen2D();else if(!window.startIslandZen2D)$('error').style.display='flex';}}
play.disabled=true;boot();
})();
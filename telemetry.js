(function(){'use strict';
 let disabled=navigator.globalPrivacyControl===true||navigator.doNotTrack==='1'||location.hostname==='127.0.0.1'||location.hostname==='localhost';
 function source(){
  const tagged=new URL(location.href).searchParams.get('utm_source')?.toLowerCase();
  if(tagged){
   const aliases={twitter:'x',itchio:'itch',red:'xiaohongshu'};
   const value=Object.hasOwn(aliases,tagged)?aliases[tagged]:tagged;
   return ['x','itch','tiktok','youtube','bilibili','douyin','xiaohongshu','direct'].includes(value)?value:'other';
  }
  if(!document.referrer)return 'direct';
  try{
   const host=new URL(document.referrer).hostname;
   if(['x.com','twitter.com','t.co'].includes(host))return 'x';
   if(host==='itch.io'||host.endsWith('.itch.io'))return 'itch';
   if(host==='tiktok.com'||host.endsWith('.tiktok.com'))return 'tiktok';
   if(host==='youtu.be'||host==='youtube.com'||host.endsWith('.youtube.com'))return 'youtube';
   return host===location.hostname?'direct':'other';
  }catch{return 'direct';}
 }
 // A visit to the share page does not start a game session. Carry just the
 // recognized channel into the game when the visitor follows either play link.
 if(document.currentScript?.hasAttribute('data-share-entry')){
  if(disabled)return;
  try{if(localStorage.getItem('qt_metrics_off')==='1')return;}catch{return;}
  const channel=source();
  if(channel!=='direct'&&channel!=='other'){
   for(const link of document.querySelectorAll('a.play[href="/"]'))link.href='/?utm_source='+channel;
  }
  return;
 }
 let visitor;try{disabled||=localStorage.getItem('qt_metrics_off')==='1';visitor=localStorage.getItem('qt_metrics_visitor');if(!visitor&&!disabled){visitor=crypto.randomUUID();localStorage.setItem('qt_metrics_visitor',visitor);}}catch{disabled=true;}
 const token=Array.from(crypto.getRandomValues(new Uint8Array(32)),n=>n.toString(16).padStart(2,'0')).join(''),id=crypto.randomUUID();
 let registered=false,active=0,last=performance.now(),entered=false,readyMs=null,interval,lastPulse=0,pulseSending=false;const reported=new Set(),pendingErrors=new Map(),sendingErrors=new Set(),errorTries=new Map();
 async function send(path,data){if(disabled)return false;const controller=new AbortController(),timeout=setTimeout(()=>controller.abort(),8000);try{const r=await fetch('/api/metrics/'+path,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({id,token,...data}),signal:controller.signal,keepalive:true});const result=await r.json();if(result.ignored){disabled=true;clearInterval(interval);}return r.ok&&!result.ignored;}catch{return false;}finally{clearTimeout(timeout);}}
 async function pulse(){if(!registered||disabled||pulseSending)return;pulseSending=true;lastPulse=performance.now();try{await send('pulse',{active:Math.floor(active),entered,readyMs});}finally{pulseSending=false;}}
 async function report(kind,code){const key=kind+code;if(reported.has(key)||reported.size>=5||sendingErrors.has(key)||(errorTries.get(key)||0)>=3)return;if(!registered){if(pendingErrors.size<5)pendingErrors.set(key,{kind,code});return;}sendingErrors.add(key);errorTries.set(key,(errorTries.get(key)||0)+1);if(await send('error',{kind,code}))reported.add(key);sendingErrors.delete(key);}
 addEventListener('error',e=>{const name=(e.filename||'').split('/').pop()?.split('?')[0]||'runtime';report('script',/^[\w.-]{1,60}$/.test(name)?name:'runtime');});
 function tick(){const now=performance.now(),d=window.templeDiagnostics?.();if(d){const before=entered,loaded=d.exterior?.ready&&d.statue?.ready&&d.uploadedProps?.ready;if(d.started&&d.network?.connected&&loaded)entered=true;if(entered&&!d.paused&&d.network?.connected&&!document.hidden)active+=Math.min(2,(now-last)/1000);if(readyMs===null&&loaded){readyMs=Math.round(now);pulse();}if(entered&&!before)pulse();if(d.exterior?.error)report('asset','exterior-load');if(d.uploadedProps?.errors?.length)report('asset','props-load');if(d.statue?.error)report('asset','statue-load');if(d.network?.error)report('network','connection');}else if(document.getElementById('fatal')?.hidden===false)report('script','startup-failed');last=now;if(now-lastPulse>30000)pulse();}
 async function register(attempt=0){const ok=await send('visit',{visitor,source:source(),device:/iPad|Tablet/i.test(navigator.userAgent)?'tablet':/Mobi|Android/i.test(navigator.userAgent)?'mobile':'desktop'});if(disabled)return;if(ok){registered=true;for(const e of pendingErrors.values())report(e.kind,e.code);pendingErrors.clear();pulse();}else if(attempt<2)setTimeout(()=>register(attempt+1),3000*(attempt+1));else clearInterval(interval);}
 if(!disabled){interval=setInterval(tick,1000);register();}
 addEventListener('pagehide',pulse);document.addEventListener('visibilitychange',()=>{if(document.hidden)pulse();last=performance.now();});
 function setupMenu(){
  let menu=document.getElementById('temple-menu');
  if(!menu){
   menu=document.createElement('details');menu.id='temple-menu';
   menu.innerHTML='<summary aria-label="游戏菜单">☰</summary><div><a href="/admin.html" target="_blank" rel="noopener">管理后台</a></div>';
   document.querySelector('.top-actions')?.append(menu);
  }
  if(menu.querySelector('#metrics-toggle'))return;
  const links=menu.querySelector(':scope > div');
  const privacy=document.createElement('a');privacy.href='/privacy.html';privacy.target='_blank';privacy.rel='noopener';privacy.textContent='访问统计说明';
  const toggle=document.createElement('button');toggle.type='button';toggle.id='metrics-toggle';links.append(privacy,toggle);
  const t=key=>window.TempleI18n?.t(key)||key;
  toggle.disabled=disabled;toggle.addEventListener('click',()=>{disabled=true;clearInterval(interval);try{localStorage.setItem('qt_metrics_off','1');localStorage.removeItem('qt_metrics_visitor');}catch{}renderLabels();toggle.disabled=true;});
  const banner=document.createElement('aside');banner.id='temple-announcement';banner.hidden=true;const message=document.createElement('span'),close=document.createElement('button');close.textContent='×';close.setAttribute('aria-label','关闭公告');banner.append(message,close);document.body.append(banner);let shown=0,dismissed=0;
  function renderLabels(){menu.querySelector('summary').setAttribute('aria-label',t('hud.menu'));menu.querySelector('a[href="/admin.html"]').textContent=t('hud.admin');menu.querySelector('a[href="/privacy.html"]').textContent=t('hud.privacy');toggle.textContent=t(disabled?'hud.metrics.off':'hud.metrics.disable');close.setAttribute('aria-label',t('hud.announcement.close'));}
  function connectLabels(){
   if(!window.TempleI18n)return;
   renderLabels();window.TempleI18n.onChange(renderLabels);
   window.removeEventListener('temple:client-ready',connectLabels);
   document.removeEventListener('DOMContentLoaded',connectLabels);
  }
  if(window.TempleI18n)connectLabels();
  else{
   toggle.textContent=disabled?'访问统计已关闭':'关闭访问统计';
   window.addEventListener('temple:client-ready',connectLabels);
   document.addEventListener('DOMContentLoaded',connectLabels,{once:true});
  }
  close.addEventListener('click',()=>{dismissed=shown;banner.hidden=true;});async function announcement(){try{const r=await fetch('/api/announcement',{cache:'no-store'});if(!r.ok)return;const a=await r.json();shown=a.updated||0;message.textContent=a.text||'';banner.hidden=!a.text||shown===dismissed;}catch{}}announcement();setInterval(announcement,60000);
 }
 if(document.readyState==='interactive'||document.readyState==='complete')setupMenu();
 else document.addEventListener('DOMContentLoaded',setupMenu,{once:true});
})();

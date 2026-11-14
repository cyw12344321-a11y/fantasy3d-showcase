import fs from 'node:fs/promises';
import { createHash } from 'node:crypto';
import path from 'node:path';

const dir = process.argv[2];
const read = file => fs.readFile(path.join(dir, file), 'utf8');
const write = (file, data) => fs.writeFile(path.join(dir, file), data);
const roomOrigin = 'https://yinian-temple-rooms.higgsfield.app';

function replace(source, original, replacement, count = 1) {
  if (source.split(original).length !== count + 1) throw Error('Unexpected source near ' + original.slice(0, 100));
  return source.split(original).join(replacement);
}

let client = await read('temple-client.js');
client = replace(client, "const SAVE_KEY = 'quiet-temple-v1';",
  "const SAVE_KEY = window.TEMPLE_CONFIG?.multiplayer ? 'quiet-temple-rooms-v1' : 'quiet-temple-v1';", 2);
client = replace(client, "await fetch(route, { method: 'POST', credentials: 'same-origin'",
  "await fetch(new URL(route, window.TEMPLE_CONFIG.roomOrigin), { method: 'POST', credentials: 'omit'");
client = replace(client, "if (previous && typeof navigator?.sendBeacon === 'function')", 'if (previous)');
client = replace(client, "try { navigator.sendBeacon('/api/leave', new Blob([JSON.stringify(previous)], { type: 'application/json' })); } catch (_) { /* Expiry is the fallback. */ }",
  "fetch(new URL('/api/leave', window.TEMPLE_CONFIG.roomOrigin), {method:'POST', credentials:'omit', keepalive:true, headers:{'Content-Type':'application/json'}, body:JSON.stringify(previous)}).catch(()=>{});");
client = replace(client, ";document.querySelector('.top-actions').append(menu);}", ";const switchMode=menu.querySelector('a');const welcomeMode=document.getElementById('temple-mode-link');switchMode.href=welcomeMode.href;switchMode.target='_top';switchMode.textContent=welcomeMode.textContent;document.querySelector('.top-actions').append(menu);}");
const version = createHash('sha256').update(client).digest('hex').slice(0, 20);

let play = await read('play.html');
play = replace(play, "temple-client.js?v=961117861156fea41a65", "temple-client.js?v=" + version);
play = replace(play, '<p class="welcome-footnote">单人漫游 · 功德保存在此浏览器</p><a class="game-about-link" href="https://yinian-quiet-temple.cyw12344321.chatgpt.site/">进入原站联机佛堂</a>',
  '<a class="game-about-link" id="temple-mode-link" href="./landscape.html?mode=solo">单人漫游</a>');
const setup = [
  '<script>',
  '  const roomParams = new URLSearchParams(location.search);',
  "  const multiplayer = roomParams.get('mode') !== 'solo';",
  '  window.TEMPLE_CONFIG = {multiplayer, roomOrigin:' + JSON.stringify(roomOrigin) + ", modeLabel: multiplayer ? '联网佛堂' : 'online.local'};",
  "  const alternateMode = new URL('landscape.html', location.href);",
  '  alternateMode.search = location.search;',
  "  if (multiplayer) alternateMode.searchParams.set('mode', 'solo');",
  "  else alternateMode.searchParams.delete('mode');",
  "  const modeLink = document.getElementById('temple-mode-link');",
  '  modeLink.href = alternateMode.href;',
  "  modeLink.target = '_top';",
  "  modeLink.textContent = multiplayer ? '单人漫游' : '进入联机佛堂';",
  '</script>',
].join('\n');
play = replace(play, '<script>window.TEMPLE_CONFIG={multiplayer:false,modeLabel:"online.local"};</script>',setup);
await write('play.html',play);
await write('temple-client.js',client);
console.log('Updated room client '+version);

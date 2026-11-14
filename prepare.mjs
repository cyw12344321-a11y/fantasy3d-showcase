// Adapt the pinned public v40 browser release to a GitHub Pages project directory.
import { createHash } from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';

if (!process.argv[2]) throw new Error('Usage: node prepare.mjs OUTPUT_DIRECTORY');
const root = path.resolve(process.argv[2]);
const original = 'https://yinian-quiet-temple.cyw12344321.chatgpt.site/';
const read = name => fs.readFile(path.join(root, name), 'utf8');
const write = (name, text) => fs.writeFile(path.join(root, name), text);
function replaceOne(source, before, after) {
  if (source.split(before).length !== 2) throw new Error('Unexpected temple release near ' + before.slice(0, 80));
  return source.replace(before, () => after);
}
function staticLinks(html) {
  return html.replace(/(href|src)="\/(?!\/)/g, '$1="./')
    .replace(/<script\b[^>]*\bsrc="(?:\.\/)?telemetry\.js[^"]*"[^>]*><\/script>/g, '');
}
const manifestPrefix = 'window.TEMPLE_ASSET_REVISIONS=';
const partPrefix = ';window.TEMPLE_ASSET_PARTS=';
let html = staticLinks(await read('index.html'));
let game = await read('temple-client.js');
const start = html.indexOf(manifestPrefix);
const middle = html.indexOf(partPrefix, start);
const end = html.indexOf(';</script>', middle);
if (start < 0 || middle < 0 || end < 0) throw new Error('Missing original model manifest');
const revisions = JSON.parse(html.slice(start + manifestPrefix.length, middle));
const parts = JSON.parse(html.slice(middle + partPrefix.length, end));
if (Object.keys(parts).length !== 20) throw new Error('Unexpected original partition manifest');
// Resolve the runtime base from the entry document so both the old Pages URL and local preview work.
const scopeManifest = `
const project = new URL('./', document.baseURI);
const assetPath = name => new URL(name.slice(1), project).pathname;
const inProject = values => Object.fromEntries(Object.entries(values).map(([name, value]) => [assetPath(name), value]));
window.TEMPLE_ASSET_REVISIONS = inProject(${JSON.stringify(revisions)});
window.TEMPLE_ASSET_PARTS = inProject(${JSON.stringify(parts)});
for (const model of Object.values(window.TEMPLE_ASSET_PARTS)) {
  for (const piece of model.pieces) piece.path = assetPath(piece.path);
}
`;
html = html.slice(0, start) + '(()=>{' + scopeManifest + '})()' + html.slice(end);
html = replaceOne(html, 'multiplayer:true,modeLabel:"联网佛堂"', 'multiplayer:false,modeLabel:"online.local"');
html = replaceOne(html, '<a class="game-about-link"', '<p class="welcome-footnote">单人漫游 · 功德保存在此浏览器</p><a class="game-about-link" href="' + original + '">进入原站联机佛堂</a> · <a class="game-about-link"');
game = replaceOne(game, "const cacheName='quiet-temple-models-v1';", "const assetBase=new URL('assets/',document.baseURI).pathname;const cacheName='quiet-temple-models-v1:'+assetBase;");
game = replaceOne(game, "u.pathname.startsWith('/assets/')", "u.pathname.startsWith(assetBase)");
const oldDetect = game.match(/ async function detect\(\)\{[^\n]+\}/)?.[0];
if (!oldDetect?.includes("fetch('/api/locale'")) throw new Error('Unexpected v40 locale detection');
game = replaceOne(game, '<a href="/admin.html" target="_blank" rel="noopener">管理后台</a>', '<a href="' + original + '">进入原站联机佛堂</a>');
game = replaceOne(game, oldDetect, " async function detect(){++requestVersion;locale=browserLocale();source='fallback';country=null;apply();return locale;}");
const revision = createHash('sha256').update(game).digest('hex').slice(0,20);
html = replaceOne(html, 'temple-client.js?v=31a0ebccbb846dfa2c8c', 'temple-client.js?v=' + revision);
await write('temple-client.js', game);
await write('index.html', html);
for (const name of ['about.html', 'privacy.html']) {
  let page = staticLinks(await read(name));
  if (name === 'about.html') page = replaceOne(page,'<h2>把佛堂分享给朋友</h2>','<h2>把联机佛堂分享给朋友</h2>');
  await write(name, page);
}
console.log('Prepared original temple assets and native local-play mode for Pages.');

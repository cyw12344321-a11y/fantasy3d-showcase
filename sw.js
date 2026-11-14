// Update the release ID with the HTML and its versioned scripts on each shell change.
const release = '20261115b';
const scope = self.registration.scope;
const cachePrefix = 'island-zen-shell:' + scope + ':';
const cacheName = cachePrefix + release;
const at = path => new URL(path, scope).href;
const entry = at('index.html?v=' + release);
const pako = at('vendor/pako.min.js');
const files = [
  entry,
  at('app.js?v=' + release),
  at('scene-loader.js?v=' + release),
  at('vendor/three.min.js'),
  at('vendor/GLTFLoader.js'),
  at('assets/scene/download-v3.json')
];
const allowed = new Set(files.concat(pako));
const installRequest = url => new Request(url, {cache: 'no-cache'});

self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(cacheName);
    // The browser commits this batch only when every required response succeeds.
    const required = typeof DecompressionStream === 'function' ? files : files.concat(pako);
    await cache.addAll(required.map(installRequest));
    const page = await cache.match(entry);
    if (!(await page.text()).includes('name="island-zen-version" content="' + release + '"')) {
      throw Error('Offline shell release mismatch');
    }
  })());
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    // Native lifecycle keeps existing tabs on their previous, complete shell until they close.
    for (const name of await caches.keys()) {
      if (name.startsWith(cachePrefix) && name !== cacheName) await caches.delete(name);
    }
    await self.clients.claim();
  })());
});

self.addEventListener('message', event => {
  // Window and worker support for native decompression can differ.
  if (!event.data || event.data.type !== 'island-zen-cache-pako') return;
  event.waitUntil((async () => {
    const cache = await caches.open(cacheName);
    if (!(await cache.match(pako))) await cache.add(installRequest(pako));
  })());
});

self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  const path = url.origin + url.pathname;
  const isEntry = request.mode === 'navigate' && (path === scope || path === at('index.html'));
  if (!isEntry && !allowed.has(url.href)) return;
  const key = isEntry ? entry : url.href;
  event.respondWith((async () => {
    try {
      const cache = await caches.open(cacheName);
      const hit = await cache.match(key);
      if (hit) return hit;
    } catch (_) { /* If local storage is unavailable keep the online path usable. */ }
    return fetch(request);
  })());
});

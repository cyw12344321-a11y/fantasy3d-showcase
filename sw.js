// Retire the former game on devices that installed its offline cache.
const scope = self.registration.scope;
const shellPrefix = 'island-zen-shell:' + scope + ':';
const modelCache = 'island-zen-blocks-v3';

self.addEventListener('install', event => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const names = await caches.keys();
    await Promise.all(names.filter(name => name.startsWith(shellPrefix))
      .map(name => caches.delete(name)));
    if (names.includes(modelCache)) {
      const models = await caches.open(modelCache);
      const keys = await models.keys();
      await Promise.all(keys.filter(key => key.url.startsWith(scope + 'assets/scene/'))
        .map(key => models.delete(key)));
      if (!(await models.keys()).length) await caches.delete(modelCache);
    }
    const clients = await self.clients.matchAll({type: 'window', includeUncontrolled: true});
    await self.registration.unregister();
    for (const client of clients) {
      const url = new URL(client.url);
      const path = url.origin + url.pathname;
      if (path === scope || path === scope + 'index.html') {
        await client.navigate(client.url).catch(() => {});
      }
    }
  })());
});

// Verified blocks are shared by retries and later visits on the same device.
(function () {
  'use strict';
  const base = new URL('./assets/scene/', document.baseURI);
  const cacheName = 'island-zen-blocks-v3';

  async function readBytes(url, options, expectedBytes, onBytes, signal) {
    const controller = new AbortController();
    const abort = () => controller.abort();
    if (signal && signal.aborted) throw Error('下载已停止');
    if (signal) signal.addEventListener('abort', abort);
    let timer;
    function heartbeat() {
      clearTimeout(timer);
      timer = setTimeout(abort, 90000);
    }
    heartbeat();
    try {
      const response = await fetch(url, {cache: options, signal: controller.signal});
      if (!response.ok) throw Error('HTTP ' + response.status);
      if (!response.body || !response.body.getReader) {
        const bytes = new Uint8Array(await response.arrayBuffer());
        if (expectedBytes && bytes.length !== expectedBytes) throw Error('资源包大小不符');
        onBytes(bytes.length);
        return bytes;
      }
      const reader = response.body.getReader();
      const fragments = [];
      let size = 0;
      while (true) {
        const part = await reader.read();
        if (part.done) break;
        size += part.value.length;
        if (expectedBytes && size > expectedBytes) {
          await reader.cancel();
          throw Error('资源包大小不符');
        }
        fragments.push(part.value);
        onBytes(size);
        heartbeat();
      }
      if (expectedBytes && size !== expectedBytes) throw Error('资源包下载不完整');
      const joined = new Uint8Array(size);
      let offset = 0;
      for (const part of fragments) { joined.set(part, offset); offset += part.length; }
      return joined;
    } catch (error) {
      if (controller.signal.aborted) throw Error('下载中断或长时间未收到数据');
      throw error;
    } finally {
      clearTimeout(timer);
      if (signal) signal.removeEventListener('abort', abort);
    }
  }

  async function verify(bytes, size, sha) {
    if (size !== bytes.byteLength) throw Error('资源大小不符');
    if (!window.crypto || !window.crypto.subtle) return;
    const hash = new Uint8Array(await window.crypto.subtle.digest('SHA-256', bytes));
    const hex = Array.from(hash, value => value.toString(16).padStart(2, '0')).join('');
    if (hex !== sha) throw Error('资源完整性校验失败');
  }

  async function load({onProgress, signal, unpack}) {
    const report = onProgress || function () {};
    const manifestURL = new URL('download-v3.json', base).href;
    const raw = await readBytes(manifestURL, 'default', 0, () => {}, signal);
    const manifest = JSON.parse(new TextDecoder().decode(raw));
    const {chunks, totalBytes} = manifest;
    if (manifest.version !== 3 || manifest.encoding !== 'gzip+base64-blocks' || !Array.isArray(chunks) ||
        !chunks.length || !chunks.every((p, i) => Number.isSafeInteger(p.bytes) && p.bytes > 0 && p.bytes % 4 === 0 &&
          /^[0-9a-f]{64}$/.test(p.sha256) && p.file === 'scene_' + String(i).padStart(2, '0') + '.txt') ||
        chunks.reduce((n, p) => n + p.bytes, 0) !== totalBytes) throw Error('场景清单格式错误');
    let cache;
    try { cache = await window.caches.open(cacheName); } catch (_) { /* Storage is optional. */ }
    const compressed = new Uint8Array(totalBytes / 4 * 3);
    const offsets = [];
    let offset = 0;
    for (const part of chunks) { offsets.push(offset); offset += part.bytes / 4 * 3; }
    const received = new Array(chunks.length).fill(0);
    let complete = 0, reused = 0, next = 0, lastReport = 0, stopped = false;
    function progress(force) {
      if (stopped || (signal && signal.aborted)) return;
      const now = Date.now();
      if (!force && now - lastReport < 180) return;
      lastReport = now;
      report({phase:'download', bytes:received.reduce((n, v) => n + v, 0),
        totalBytes, complete, count:chunks.length, cachedBytes:reused});
    }
    async function block(index) {
      const part = chunks[index], url = new URL(part.file, base).href;
      const cacheKey = url + '?sha=' + part.sha256;
      if (cache) {
        try {
          const hit = await cache.match(cacheKey);
          if (hit) {
            const bytes = new Uint8Array(await hit.arrayBuffer());
            await verify(bytes, part.bytes, part.sha256);
            reused += bytes.length;
            return bytes;
          }
        } catch (_) {
          try { await cache.delete(cacheKey); } catch (_) { /* Fall through to network. */ }
        }
      }
      for (let attempt = 0; attempt < 3; ++attempt) {
        if (stopped || (signal && signal.aborted)) throw Error('下载已停止');
        try {
          const bytes = await readBytes(url, attempt ? 'reload' : 'default', part.bytes,
            size => { received[index] = size; progress(false); }, signal);
          await verify(bytes, part.bytes, part.sha256);
          if (cache) {
            try { await cache.put(cacheKey, new Response(bytes)); } catch (_) { /* Quota or private mode. */ }
          }
          return bytes;
        } catch (error) {
          received[index] = 0;
          if (attempt === 2 || (signal && signal.aborted)) throw Error('第 ' + (index+1) + ' 个资源包：' + error.message);
          report({phase:'retry', index:index+1, count:chunks.length});
          await new Promise(resolve => setTimeout(resolve, 700 * (attempt + 1)));
        }
      }
    }
    let compressedSize = 0;
    const decoder = new TextDecoder();
    async function worker() {
      while (!stopped && next < chunks.length) {
        if (signal && signal.aborted) throw Error('下载已停止');
        const i = next++;
        const bytes = await block(i);
        const binary = atob(decoder.decode(bytes));
        for (let j = 0; j < binary.length; j++) compressed[offsets[i] + j] = binary.charCodeAt(j);
        compressedSize += binary.length;
        received[i] = bytes.length;
        ++complete;
        progress(true);
      }
    }
    progress(true);
    try { await Promise.all([worker(), worker()]); }
    finally { stopped = true; }
    report({phase:'unpack'});
    const input = compressed.subarray(0, compressedSize);
    const data = unpack ? await unpack(input) :
      await new Response(new Blob([input]).stream().pipeThrough(new DecompressionStream('gzip'))).arrayBuffer();
    report({phase:'verify'});
    await verify(data, manifest.sourceBytes, manifest.sha256);
    return data;
  }
  window.IslandZenAssets = {load};
})();

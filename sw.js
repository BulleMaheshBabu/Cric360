/* Cric360 Service Worker – bump CACHE on every release */
const CACHE = 'cric360-v2';
const APP_SHELL = [
  './',
  './index.html',
  './cric360live.html',
  './auctiontracker360.html',
  './manifest.webmanifest',
  './icon-192.png',
  './icon-512.png',
  './apple-touch-icon.png'
];

self.addEventListener('install', function (event) {
  event.waitUntil(
    caches.open(CACHE).then(function (cache) {
      return cache.addAll(APP_SHELL).catch(function () {});
    }).then(function () {
      return self.skipWaiting();
    })
  );
});

self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(
        keys.filter(function (k) { return k !== CACHE; })
            .map(function (k) { return caches.delete(k); })
      );
    }).then(function () {
      return self.clients.claim();
    })
  );
});

self.addEventListener('fetch', function (event) {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  if (url.origin !== self.location.origin) {
    event.respondWith(fetch(req).catch(function () {
      return caches.match(req);
    }));
    return;
  }

  // HTML always try network first so updates show quickly
  if (url.pathname.endsWith('.html') || url.pathname === '/' || url.pathname.endsWith('/')) {
    event.respondWith(
      fetch(req).then(function (res) {
        const clone = res.clone();
        caches.open(CACHE).then(function (c) { c.put(req, clone); });
        return res;
      }).catch(function () {
        return caches.match(req).then(function (c) {
          return c || caches.match('./index.html');
        });
      })
    );
    return;
  }

  event.respondWith(
    caches.match(req).then(function (cached) {
      const net = fetch(req).then(function (res) {
        if (res && res.ok) {
          const clone = res.clone();
          caches.open(CACHE).then(function (c) { c.put(req, clone); });
        }
        return res;
      }).catch(function () { return cached; });
      return cached || net;
    })
  );
});

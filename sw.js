/* Cric360 Service Worker – offline app shell + install support */
const CACHE = 'cric360-v1';
const APP_SHELL = [
  './index.html',
  './cric360live.html',
  './auctiontracker360.html',
  './manifest.webmanifest',
  './icons/icon-192.png',
  './icons/icon-512.png'
];

self.addEventListener('install', function (event) {
  event.waitUntil(
    caches.open(CACHE).then(function (cache) {
      return cache.addAll(APP_SHELL).catch(function () {});
    }).then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.filter(function (k) { return k !== CACHE; })
        .map(function (k) { return caches.delete(k); }));
    }).then(function () { return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function (event) {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  // Never cache cross-origin authentication / API calls, google fonts optional cache
  if (url.origin !== location.origin) {
    // For cross-origin stable assets (fonts/icons) try cache-first with network fallback
    event.respondWith(
      caches.match(req).then(function (cached) {
        return cached || fetch(req).then(function (res) {
          if (res && res.ok && req.url.indexOf('firebase') < 0) {
            const clone = res.clone();
            caches.open(CACHE).then(function (c) { c.put(req, clone); });
          }
          return res;
        }).catch(function () { return cached; });
      })
    );
    return;
  }
  // Same-origin: network-first for HTML, cache-first for assets
  if (url.pathname.match(/\.(html?|json)$/)) {
    event.respondWith(
      fetch(req).then(function (res) {
        const clone = res.clone();
        caches.open(CACHE).then(function (c) { c.put(req, clone); });
        return res;
      }).catch(function () {
        return caches.match(req).then(function (c) { return c || caches.match('./index.html'); });
      })
    );
  } else {
    event.respondWith(
      caches.match(req).then(function (cached) {
        return cached || fetch(req).then(function (res) {
          const clone = res.clone();
          caches.open(CACHE).then(function (c) { c.put(req, clone); });
          return res;
        });
      })
    );
  }
});

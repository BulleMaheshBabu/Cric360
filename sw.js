/* Cric360 Service Worker – includes FCM push. Bump CACHE on every release */
const CACHE = 'cric360-v40-round1';
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

/* ===== Firebase Cloud Messaging (same SW as PWA) ===== */
try {
  importScripts('https://www.gstatic.com/firebasejs/10.14.1/firebase-app-compat.js');
  importScripts('https://www.gstatic.com/firebasejs/10.14.1/firebase-messaging-compat.js');
  firebase.initializeApp({
    apiKey: 'AIzaSyBGaYN7aDiO10yOUOr2deRamH5ed1Jon30',
    authDomain: 'auctiontracker360.firebaseapp.com',
    projectId: 'auctiontracker360',
    storageBucket: 'auctiontracker360.firebasestorage.app',
    messagingSenderId: '1035286573847',
    appId: '1:1035286573847:web:3cc9d7df3617f6fb787d52'
  });
  const messaging = firebase.messaging();
  messaging.onBackgroundMessage(function (payload) {
    const n = (payload && payload.notification) || {};
    const d = (payload && payload.data) || {};
    const title = n.title || d.title || 'Cric360';
    const body = n.body || d.body || d.message || 'New update';
    const options = {
      body: body,
      data: Object.assign({}, d, { title: title, body: body }),
      icon: '/icon-192.png',
      badge: '/icon-192.png',
      tag: (d.type || 'cric360') + '-' + String(Date.now()),
      renotify: true,
      requireInteraction: false
    };
    // Always show — do not rely on browser auto-display of notification payload
    return self.registration.showNotification(title, options);
  });
} catch (e) {
  console.warn('FCM SW init', e);
}

self.addEventListener('notificationclick', function (event) {
  event.notification.close();
  const d = (event.notification && event.notification.data) || {};
  const link = d.link || '/';
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (list) {
      for (var i = 0; i < list.length; i++) {
        var c = list[i];
        if (c.url && 'focus' in c) {
          try { if (c.navigate) c.navigate(link); } catch (e) {}
          return c.focus();
        }
      }
      if (clients.openWindow) return clients.openWindow(link);
    })
  );
});

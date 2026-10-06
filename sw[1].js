/* Auction Tracker 360 — must be hosted at site ROOT: /sw.js */
/* global importScripts, firebase, self, clients */

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

function notifFromPayload(payload) {
  const n = (payload && payload.notification) || {};
  const d = (payload && payload.data) || {};
  const title = n.title || d.title || 'Cric360';
  const body = n.body || d.body || d.message || 'New update';
  const tag = (d.type || 'cric360') + '-' + (d.formId || d.auctionId || d.matchId || Date.now());
  return {
    title: title,
    options: {
      body: body,
      icon: '/icon-192.png',
      badge: '/icon-192.png',
      tag: tag,
      renotify: true,
      requireInteraction: false,
      data: d
    }
  };
}

messaging.onBackgroundMessage(function(payload) {
  const x = notifFromPayload(payload);
  return self.registration.showNotification(x.title, x.options);
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  const d = (event.notification && event.notification.data) || {};
  let url = d.link || '/';
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(list) {
      for (let i = 0; i < list.length; i++) {
        const c = list[i];
        if (c.url && 'focus' in c) {
          c.postMessage({ type: 'NOTIFICATION_CLICK', data: d });
          return c.focus();
        }
      }
      if (clients.openWindow) return clients.openWindow(url);
    })
  );
});

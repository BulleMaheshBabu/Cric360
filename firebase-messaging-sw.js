/* Firebase Messaging service worker — must be at site root */
importScripts("https://www.gstatic.com/firebasejs/10.14.1/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.14.1/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "AIzaSyBGaYN7aDiO10yOUOr2deRamH5ed1Jon30",
  authDomain: "auctiontracker360.firebaseapp.com",
  projectId: "auctiontracker360",
  storageBucket: "auctiontracker360.firebasestorage.app",
  messagingSenderId: "1035286573847",
  appId: "1:1035286573847:web:3cc9d7df3617f6fb787d52"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage(function(payload) {
  const n = (payload && payload.notification) || {};
  const d = (payload && payload.data) || {};
  const title = n.title || d.title || "Cric360";
  const options = {
    body: n.body || d.body || "",
    data: d,
    icon: "/icons/icon-192.png",
    badge: "/icons/icon-192.png"
  };
  return self.registration.showNotification(title, options);
});

self.addEventListener("notificationclick", function(event) {
  event.notification.close();
  const d = (event.notification && event.notification.data) || {};
  const link = d.link || "/";
  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then(function(list) {
      for (var i = 0; i < list.length; i++) {
        var c = list[i];
        if (c.url && "focus" in c) {
          c.navigate(link);
          return c.focus();
        }
      }
      if (clients.openWindow) return clients.openWindow(link);
    })
  );
});

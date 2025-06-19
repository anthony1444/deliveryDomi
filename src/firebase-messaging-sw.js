importScripts("https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/9.22.0/firebase-messaging-compat.js");

self.addEventListener('install', () => {
  self.skipWaiting();
  console.log('✅ Service Worker instalado');
});

self.addEventListener('activate', event => {
  event.waitUntil(clients.claim());
  console.log('✅ Service Worker activado');
});

const firebaseConfig = {
  apiKey: "AIzaSyCIVYLJIapxu5b7QHU1MXDjrRn47ssk-H0",
  authDomain: "delivery-fffde.firebaseapp.com",
  projectId: "delivery-fffde",
  storageBucket: "delivery-fffde.appspot.com",
  messagingSenderId: "244577228746",
  appId: "1:244577228746:web:b828118e21a2df1b596133",
  measurementId: "G-2QLPE6BHRE"
};

firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

messaging.onBackgroundMessage(payload => {
  console.log('✅ Mensaje en segundo plano:', payload);
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: payload.notification.icon || '/assets/icons/icon-96x96.png',
    badge: '/assets/icons/icon-72x72.png',
    vibrate: [200, 100, 200],
    requireInteraction: true,
    data: { url: payload.notification?.click_action || '/' }
  };

  return self.registration.showNotification(notificationTitle, notificationOptions);
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  const urlToOpen = event.notification.data.url || '/';
  event.waitUntil(
    clients.openWindow(urlToOpen)
  );
});

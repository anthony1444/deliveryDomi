// // Importar Firebase aqu2
// import { initializeApp } from "firebase/app";
// import { getMessaging, onBackgroundMessage } from "firebase/messaging";

// // Configuración de Firebase
// const firebaseConfig = {
//   apiKey: "AIzaSyCIVYLJIapxu5b7QHU1MXDjrRn47ssk-H0",
//   authDomain: "delivery-fffde.firebaseapp.com",
//   projectId: "delivery-fffde",
//   storageBucket: "delivery-fffde.firebasestorage.app",
//   messagingSenderId: "244577228746",
//   appId: "1:244577228746:web:b828118e21a2df1b596133",
//   measurementId: "G-2QLPE6BHRE"
// };

// // ✅ Primero inicializar Firebase
// const app = initializeApp(firebaseConfig);
// const messaging = getMessaging(app);

// // ✅ Manejar notificaciones cuando la app está en segundo plano
// onBackgroundMessage(messaging, (payload) => {
//   console.log("📩 Notificación en segundo plano:", payload);

//   self.registration.showNotifi cation(payload.data.title, {
//     body: payload.data.body,
//     icon: "/assets/icon.png"
//   });
// });

import { initializeApp } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-app.js";
import { getMessaging, onBackgroundMessage } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-messaging-sw.js";

// 🔥 Configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyCIVYLJIapxu5b7QHU1MXDjrRn47ssk-H0",
  authDomain: "delivery-fffde.firebaseapp.com",
  projectId: "delivery-fffde",
  storageBucket: "delivery-fffde.firebasestorage.app",
  messagingSenderId: "244577228746",
  appId: "1:244577228746:web:b828118e21a2df1b596133",
  measurementId: "G-2QLPE6BHRE"
};

// 🔥 Inicializar Firebase
const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

// 🔥 Manejo de notificaciones en segundo plano
onBackgroundMessage(messaging, (payload) => {
  console.log('[firebase-messaging-sw.js] Notificación recibida:', payload);

  const notificationTitle = payload.notification?.title || 'Nueva Notificación';
  const notificationOptions = {
    body: payload.notification?.body || 'Toca para abrir la app',
    icon: '/assets/logo.png',
    badge: '/assets/logo.png',
    image: payload.notification?.image || '/assets/logo.png',
    vibrate: [200, 100, 200],
    requireInteraction: true, // 🔹 Mantiene la notificación hasta que el usuario interactúe
    data: { url: payload.notification?.click_action || '/' } // 🔹 Asegura que haya un destino
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// 🔥 Hacer que toda la notificación abra la app
self.addEventListener('notificationclick', (event) => {
  console.log('[firebase-messaging-sw.js] Notificación clickeada:', event);

  event.notification.close(); // 🔹 Cierra la notificación al hacer clic

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      let urlDestino = event.notification.data.url || '/'; // 🔹 URL destino

      // 🔍 Si la PWA ya está abierta, enfocarla
      for (const client of clientList) {
        if ('focus' in client) {
          console.log("✅ Enfocando ventana existente...");
          return client.focus();
        }
      }

      // 🟢 Si la PWA no está abierta, abrir una nueva ventana
      console.log("🚀 Abriendo la PWA...");
      return clients.openWindow(urlDestino);
    })
  );
});


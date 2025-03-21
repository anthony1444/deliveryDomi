import { initializeApp } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-app.js";
import { getMessaging, onBackgroundMessage } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-messaging-sw.js";

// Configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyCIVYLJIapxu5b7QHU1MXDjrRn47ssk-H0",
  authDomain: "delivery-fffde.firebaseapp.com",
  projectId: "delivery-fffde",
  storageBucket: "delivery-fffde.firebasestorage.app",
  messagingSenderId: "244577228746",
  appId: "1:244577228746:web:b828118e21a2df1b596133",
  measurementId: "G-2QLPE6BHRE"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

onBackgroundMessage(messaging, (payload) => {
  console.log('[firebase-messaging-sw.js] Received background message', payload);

  const notificationTitle = payload.notification?.title || 'Nueva Notificación';
  const notificationOptions = {
    body: payload.notification?.body || 'Tienes un nuevo mensaje',
    icon: '/firebase-logo.png',
    badge: '/badge-icon.png', // Ícono pequeño en la barra de estado
    image: payload.notification?.image || '/default-image.png', // Imagen destacada en la notificación
    vibrate: [200, 100, 200], // Patrón de vibración
    actions: [
      { action: 'open_app', title: 'Abrir Aplicación' }
    ],
    data: {
      url: payload.notification?.click_action || '/' // URL a la que debe dirigirse
    }
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Manejo del clic en la notificación
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url === event.notification.data.url && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(event.notification.data.url);
      }
    })
  );
});

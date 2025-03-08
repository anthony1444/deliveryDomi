// Importar Firebase
import { initializeApp } from "firebase/app";
import { getMessaging, onBackgroundMessage } from "firebase/messaging";

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

// ✅ Primero inicializar Firebase
const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

// ✅ Manejar notificaciones cuando la app está en segundo plano
onBackgroundMessage(messaging, (payload) => {
  console.log("📩 Notificación en segundo plano:", payload);

  self.registration.showNotification(payload.data.title, {
    body: payload.data.body,
    icon: "/assets/icon.png"
  });
});

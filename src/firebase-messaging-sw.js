import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import { getMessaging } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-messaging/sw.js";


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

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

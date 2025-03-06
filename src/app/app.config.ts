import { ApplicationConfig, isDevMode } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { provideMessaging, getMessaging } from '@angular/fire/messaging';
import { provideDatabase, getDatabase } from '@angular/fire/database';


import { routes } from './app.routes';
import { provideServiceWorker } from '@angular/service-worker';
import { FIREBASE_OPTIONS } from '@angular/fire/compat';
import { provideAuth,getAuth } from '@angular/fire/auth';
import { provideHttpClient } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';



export const environment = {
  production: false,
  firebaseConfig: {
    apiKey: "AIzaSyCIVYLJIapxu5b7QHU1MXDjrRn47ssk-H0",
    authDomain: "delivery-fffde.firebaseapp.com",
    projectId: "delivery-fffde",
    storageBucket: "delivery-fffde.firebasestorage.app",
    messagingSenderId: "244577228746",
    appId: "1:244577228746:web:b828118e21a2df1b596133",
    measurementId: "G-2QLPE6BHRE"
  },
};

export const appConfig: ApplicationConfig = {
  providers: [
    { provide: FIREBASE_OPTIONS, useValue: environment.firebaseConfig },
    provideRouter(routes),
    
    provideFirebaseApp(() => initializeApp(environment.firebaseConfig)),
    provideRouter(routes), provideAnimationsAsync(),provideHttpClient(),
    provideDatabase(() => getDatabase()),  // 🔥 Agregar Firebase Realtime Database
    provideMessaging(() => getMessaging()),
    provideFirestore(()=> getFirestore()),
    provideAuth(()=>getAuth()),
    provideServiceWorker('ngsw-worker.js', {
      enabled: !isDevMode(),
      registrationStrategy: 'registerWhenStable:30000'
    })
  ]
};



import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig, environment } from './app/app.config';
import { AppComponent } from './app/app.component';
import { enableProdMode } from '@angular/core';

if (environment.production) {
  enableProdMode();
}

bootstrapApplication(AppComponent, appConfig).then(()=>{
  if (environment.production && 'serviceWorker' in navigator) {
    navigator.serviceWorker
      .register('firebase-messaging-sw.js')
      .then((registration) => {
        console.log('Service Worker registrado con éxito:', registration);
      })
      .catch((error) => {
        console.error('Error al registrar el Service Worker:', error);
      });
  }
})
  .catch((err) => console.error(err));

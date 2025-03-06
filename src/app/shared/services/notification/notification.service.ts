// import { Injectable } from '@angular/core';
// import { SwPush } from '@angular/service-worker';
// import { HttpClient } from '@angular/common/http';
// import { environment } from '../../../../environments/environment';

// @Injectable({
//   providedIn: 'root',
// })
// export class NotificationService {
//   private readonly VAPID_PUBLIC_KEY = environment.apiNotificationHub; // Clave pública VAPID desde el archivo de entorno
//   private readonly BACKEND_URL = ''; // URL del backend

//   constructor(private swPush: SwPush, private http: HttpClient) {
//     console.log('Clave VAPID:', this.VAPID_PUBLIC_KEY);
//     console.log('Backend URL:', this.BACKEND_URL);
//   }

//   /**
//    * Solicita permisos para notificaciones al usuario.
//    * @returns Una promesa con el estado del permiso.
//    */
//   async requestPermission(): Promise<NotificationPermission> {
//     if (Notification.permission === 'default') {
//       const result = await Notification.requestPermission();
//       console.log('Estado del permiso:', result);
//       return result;
//     }
//     console.log('Permiso ya otorgado o denegado:', Notification.permission);
//     return Notification.permission;
//   }

//   /**
//    * Suscribe al usuario a notificaciones push.
//    */
//   async subscribeToNotifications(): Promise<void> {
//     if (!this.swPush.isEnabled) {
//       console.error('Las notificaciones push no están habilitadas en este navegador.');
//       throw new Error('Push notifications are not enabled in this browser.');
//     }

//     try {
//       // Solicitar suscripción
//       const subscription = await this.swPush.requestSubscription({
//         serverPublicKey: this.cleanVapidKey('BEU74zD465T2WQHt6P50AUmi_o4oaMRHTZ8GYsyo-Y6vSEPOLtlXRG8i_4-4IVXrKRbGqZDVixt5FFv50ao8XLQ'),
//       });

//       console.log('Suscripción a notificaciones creada:', subscription);

//       // Enviar la suscripción al backend
//       await this.sendSubscriptionToBackend(subscription);

//       // Escuchar mensajes entrantes
//       this.swPush.messages.subscribe((message) => {
//         console.log('Mensaje push recibido:', message);
//       });

//       // Manejar clics en notificaciones
//       this.swPush.notificationClicks.subscribe((event) => {
//         console.log('Notificación clicada:', event);
//       });
//     } catch (err:any) {
//       console.error('Error al suscribir al usuario a notificaciones:', err.message || err);
//       if (err instanceof DOMException) {
//         console.error('Posible causa: el usuario bloqueó las notificaciones o el navegador no las soporta.');
//       }
//       throw err;
//     }
//   }

//   /**
//    * Envía la suscripción al backend para integrarse con Azure Notification Hubs.
//    * @param subscription La suscripción generada por el navegador.
//    */
//   private async sendSubscriptionToBackend(subscription: PushSubscription): Promise<void> {
//     try {
//       const response = await this.http
//         .post(`${this.BACKEND_URL}/subscribe`, subscription)
//         .toPromise();
//       console.log('Suscripción enviada al backend exitosamente:', response);
//     } catch (error:any) {
//       console.error('Error al enviar la suscripción al backend:', error.message || error);
//       throw error;
//     }
//   }

//   /**
//    * Convierte una clave pública en formato Base64 a un array de bytes.
//    * @param base64String La clave pública en formato Base64.
//    * @returns Un Uint8Array representando la clave pública.
//    */
//   private urlBase64ToUint8Array(base64String: string): Uint8Array {
//     const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
//     const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
//     const rawData = window.atob(base64);
//     const outputArray = new Uint8Array(rawData.length);
//     for (let i = 0; i < rawData.length; ++i) {
//       outputArray[i] = rawData.charCodeAt(i);
//     }
//     return outputArray;
//   }

//   /**
//    * Limpia una clave pública eliminando espacios innecesarios.
//    * @param key La clave pública original.
//    * @returns La clave pública limpia.
//    */
//   private cleanVapidKey(key: string): string {
//     return key.replace(/[\s]/g, ''); // Elimina espacios
//   }
// }

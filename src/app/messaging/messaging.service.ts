import { Injectable } from '@angular/core';
import { deleteToken, getToken, Messaging, onMessage } from '@angular/fire/messaging';
import { addDoc, collection, Firestore } from '@angular/fire/firestore';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { AuthService } from '../auth/services/auth.service';

@Injectable({
    providedIn: 'root',
})
export class MessagingService {
    private currentMessage = new BehaviorSubject<any>(null);
    message$ = new Observable((sub) => onMessage(this.msg, (msg) =>     
        sub.next(msg))).pipe(
          tap((msg: any) => {
            console.log("My Firebase Cloud Message", msg);
          })
      );

    constructor(private msg: Messaging,private firestore: Firestore, public authService:AuthService) {
        Notification.requestPermission().then(
            (notificationPermissions: NotificationPermission) => {
                if (notificationPermissions === "granted") {
                    console.log("Granted");
                }
                if (notificationPermissions === "denied") {
                    console.log("Denied");
                }
            });
        navigator.serviceWorker
            .register("firebase-messaging-sw.js", {
                type: "module",
            })
            .then((serviceWorkerRegistration) => {
                getToken(this.msg, {
                    vapidKey: `BNQprvrTFTKgkkFiFiOg_H9P4Ry6RxEPvl2EB1hyawKuVwlZ010gNqj2SLWidZGtyeuXD90GlZC0EwdrERPA1UM`,
                    serviceWorkerRegistration: serviceWorkerRegistration,
                }).then((x) => {
                    localStorage.setItem('tokenpush',x)
                
            
                    // This is a good place to then store it on your database for each user
                });
            });
    }
     /**
   * Solicita permisos para recibir notificaciones push.
   */
     async requestNotificationPermission(): Promise<boolean> {
        const permission = Notification.permission;
      
        if (permission === 'granted') {
          console.log('🔔 Notificaciones permitidas');
          await this.getFCMToken();
          return true;
        } else if (permission === 'denied') {
          console.warn('🚫 Notificaciones bloqueadas. El usuario debe habilitarlas manualmente.');
          return false;
        } else {
          const newPermission = await Notification.requestPermission();
          return newPermission === 'granted';
        }
      }

    private async getFCMToken() {
        const token = await getToken(this.msg, {
            vapidKey: `BNQprvrTFTKgkkFiFiOg_H9P4Ry6RxEPvl2EB1hyawKuVwlZ010gNqj2SLWidZGtyeuXD90GlZC0EwdrERPA1UM`,
        });
        if (token) {
          console.log('✅ Token FCM obtenido:', token);
          localStorage.setItem('tokenpush', token);
        } else {
          console.warn('⚠️ No se obtuvo el token FCM.');
        }
      }


    async deleteToken() {
        // We can also delete fcm tokens, make sure to also update this on your firestore db if you are storing them as well
        await deleteToken(this.msg);
    }

    async sendNotificationToFirestore(token: string, title: string, body: string) {
        const notificationsRef = collection(this.firestore, 'notifications');
        await addDoc(notificationsRef, { token, title, body, timestamp: Date.now() });
    }
}

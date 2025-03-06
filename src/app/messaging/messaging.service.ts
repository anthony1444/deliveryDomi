import { Injectable } from '@angular/core';
import { deleteToken, getToken, Messaging, onMessage } from '@angular/fire/messaging';
import { BehaviorSubject, Observable, tap } from 'rxjs';

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

    constructor(private msg: Messaging) {
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
                    console.log('my fcm token', x);
                    // This is a good place to then store it on your database for each user
                });
            });
    }


    async deleteToken() {
        // We can also delete fcm tokens, make sure to also update this on your firestore db if you are storing them as well
        await deleteToken(this.msg);
    }
}

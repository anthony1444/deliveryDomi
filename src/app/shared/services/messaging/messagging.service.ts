import { Injectable } from "@angular/core";
import { Messaging, getToken, onMessage, deleteToken } from "@angular/fire/messaging";
import { Observable, tap } from "rxjs";

@Injectable({
    providedIn: "root",
})
export class FcmService {

    message$ = new Observable((sub) => onMessage(this.msg, (msg) =>     
        sub.next(msg))).pipe(
          tap((msg) => {
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
                    vapidKey: `an optional key generated on Firebase for your fcm tokens`,
                    serviceWorkerRegistration: serviceWorkerRegistration,
                }).then((x) => {
                    console.log('my fcm token', x);
                    // This is a good place to then store it on your database for each user
                });
            });
    }

 

}


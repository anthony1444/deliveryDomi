import { Injectable } from '@angular/core';
import { Firestore, collection, addDoc } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class FirebaseNotificationService {
  constructor(private firestore: Firestore) {}

  async sendNotificationToFirestore(token: string, title: string, body: string) {
    const notificationsRef = collection(this.firestore, 'notifications');
    await addDoc(notificationsRef, { token, title, body, timestamp: Date.now() });
  }
}

import { Component } from '@angular/core';
import { getMessaging, getToken, onMessage } from '@angular/fire/messaging';
import { RouterOutlet } from '@angular/router';
import { MessagingService } from './messaging/messaging.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { PushNotificationComponent } from './core/components/push-notification.component';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { NotificationDialogComponent } from './core/components/notification-dialog.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule, FormsModule, PushNotificationComponent, MatDialogModule],
  providers:[MessagingService],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'firebasetest';

  message: any;

  constructor(private messagingService: MessagingService,private dialog: MatDialog) {

  }

  ngOnInit() {

    if ('serviceWorker' in navigator) {
      console.log('✅ Service Worker soportado');
      navigator.serviceWorker.addEventListener('message', (event) => {
        console.log('📩 Mensaje recibido del Service Worker:', event.data);
          const audio = new Audio('/assets/notification-sound.mp3');
          audio.play().then((val)=>{
            console.log('🔊 Sonido reproducido correctamente 1');
          }).catch(e => {
            console.warn('No se pudo reproducir el sonido:', e);
          });
            const audio2 = new Audio('assets/notification-sound.mp3');
          audio2.play().then((val)=>{
            console.log('🔊 Sonido reproducido correctamente2');
          }).catch(e => {
            console.warn('No se pudo reproducir el sonido:', e);
          });
        if (event.data && event.data.playSound) {
          console.log('🔊 Intentando reproducir sonido...');
          const audio = new Audio('/assets/notification-sound.mp3');
          audio.play().then((val)=>{
            console.log('🔊 Sonido reproducido correctamente3');
          }).catch(e => {
            console.warn('No se pudo reproducir el sonido:', e);
          });
        }
      });
    } else {
      console.warn('❌ Service Worker NO soportado');
    }
    this.checkNotificationPermission();
  }

  checkNotificationPermission() {

    if (Notification.permission !== 'granted') {
      this.dialog.open(NotificationDialogComponent, {
        disableClose: true, // Evita que el usuario cierre el modal sin aceptar
      });
    }
  }





 
}

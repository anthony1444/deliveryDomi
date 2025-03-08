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

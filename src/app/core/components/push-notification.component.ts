import { Component } from '@angular/core';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
  selector: 'app-push-notification',
  imports:[
    MatSnackBarModule
  ],
  standalone:true,
  template: `
    <button mat-button (click)="sendPushNotification()">
      Enviar Notificación
    </button>
  `,
  styles: [`
    button {
      margin: 10px;
    }
  `]
})
export class PushNotificationComponent {
  constructor(private snackBar: MatSnackBar) {}

  sendPushNotification() {
    // Aquí iría la lógica para enviar la notificación a Firebase
    this.snackBar.open('Notificación enviada', 'Cerrar', {
      duration: 3000,
      verticalPosition: 'top',
      horizontalPosition: 'center',
    });
  }
}

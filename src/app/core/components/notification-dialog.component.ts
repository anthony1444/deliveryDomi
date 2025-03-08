import { Component } from '@angular/core';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MessagingService } from '../../messaging/messaging.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-notification-dialog',
  imports:[MatDialogModule, CommonModule],
  standalone:true,
  template: `
      <h2 mat-dialog-title>Permitir Notificaciones</h2>
    <mat-dialog-content>
      <p *ngIf="permissionsBlocked">
        Has bloqueado las notificaciones. Para habilitarlas, sigue estos pasos:
      </p>
      <ol *ngIf="permissionsBlocked">
        <li>Abre la configuración del navegador.</li>
        <li>Busca la sección de permisos o privacidad.</li>
        <li>Encuentra "Notificaciones" y permite este sitio.</li>
        <li>Recarga la página.</li>
      </ol>
      <p *ngIf="!permissionsBlocked">
        Para continuar, necesitamos tu permiso para enviarte notificaciones.
      </p>
    </mat-dialog-content>
    <mat-dialog-actions>
      <button mat-button (click)="requestPermission()" *ngIf="!permissionsBlocked">Aceptar</button>
      <button mat-button (click)="dialogRef.close()" *ngIf="permissionsBlocked">Entendido</button>
    </mat-dialog-actions>
  `,
})
export class NotificationDialogComponent {
permissionsBlocked = false;

  constructor(
    public dialogRef: MatDialogRef<NotificationDialogComponent>,
    private messagingService: MessagingService
  ) {}

  requestPermission() {
    this.messagingService.requestNotificationPermission().then((granted) => {
      if (granted) {
        this.dialogRef.close();
      }
    });
  }
}

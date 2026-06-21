import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AlertDialogComponent } from '../components/alert-dialog/alert-dialog.component';

@Injectable({
  providedIn: 'root'
})
export class AlertService {
  constructor(private dialog: MatDialog) {}

  showAlert(title: string, message: string, confirmText: string = 'Aceptar', cancelText?: string, timeout?: number) {
    return this.dialog.open(AlertDialogComponent, {
      width: '400px',
      disableClose: !!timeout, // evita cerrar con click fuera mientras corre el timer
      data: { title, message, confirmText, cancelText, timeout }
    }).afterClosed();
  }
}

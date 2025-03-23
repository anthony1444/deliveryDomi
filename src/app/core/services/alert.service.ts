import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AlertDialogComponent } from '../components/alert-dialog/alert-dialog.component';

@Injectable({
  providedIn: 'root'
})
export class AlertService {
  constructor(private dialog: MatDialog) {}

  showAlert(title: string, message: string, confirmText: string = 'Aceptar', cancelText?: string) {
    return this.dialog.open(AlertDialogComponent, {
      width: '400px',
      data: { title, message, confirmText, cancelText }
    }).afterClosed();
  }
}

import { Component, Inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { Order } from '../../interfaces/Order';

export interface OrderConfirmData {
  order: Order;
  timeout: number;
}

@Component({
  selector: 'app-order-confirm-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule, MatProgressBarModule, CurrencyPipe],
  templateUrl: './order-confirm-dialog.component.html',
  styleUrl: './order-confirm-dialog.component.scss'
})
export class OrderConfirmDialogComponent implements OnInit, OnDestroy {
  countdown: number = 0;
  private countdownInterval: any;

  constructor(
    public dialogRef: MatDialogRef<OrderConfirmDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: OrderConfirmData
  ) {
    this.dialogRef.disableClose = true;
  }

  ngOnInit(): void {
    this.countdown = this.data.timeout;
    this.countdownInterval = setInterval(() => {
      this.countdown--;
      if (this.countdown <= 0) {
        clearInterval(this.countdownInterval);
        this.dialogRef.close(false);
      }
    }, 1000);
  }

  ngOnDestroy(): void {
    clearInterval(this.countdownInterval);
  }

  get progressValue(): number {
    return (this.countdown / this.data.timeout) * 100;
  }

  confirm(): void {
    clearInterval(this.countdownInterval);
    this.dialogRef.close(true);
  }

  cancel(): void {
    clearInterval(this.countdownInterval);
    this.dialogRef.close(false);
  }
}

import { CommonModule } from '@angular/common';
import { Component, Inject, OnInit, OnDestroy } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatProgressBarModule } from '@angular/material/progress-bar';

@Component({
  selector: 'app-alert-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatProgressBarModule,
  ],
  templateUrl: './alert-dialog.component.html',
  styleUrls: ['./alert-dialog.component.scss']
})
export class AlertDialogComponent implements OnInit, OnDestroy {
  countdown: number = 0;
  private countdownInterval: any;

  constructor(
    public dialogRef: MatDialogRef<AlertDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: {
      title: string;
      message: string;
      confirmText: string;
      cancelText?: string;
      timeout?: number;
    }
  ) {}

  ngOnInit(): void {
    if (this.data.timeout && this.data.timeout > 0) {
      this.countdown = this.data.timeout;
      this.countdownInterval = setInterval(() => {
        this.countdown--;
        if (this.countdown <= 0) {
          this.close(false);
        }
      }, 1000);
    }
  }

  ngOnDestroy(): void {
    clearInterval(this.countdownInterval);
  }

  get progressValue(): number {
    return this.data.timeout ? (this.countdown / this.data.timeout) * 100 : 100;
  }

  close(result: boolean): void {
    this.dialogRef.close(result);
  }
}

import { Component, Inject, Input } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MatListModule } from '@angular/material/list';
import { MatButtonModule } from '@angular/material/button';

@Component({
    selector: 'app-modal',
    imports: [CommonModule, MatListModule, MatButtonModule],
    standalone:true,
    template: `
   <div class="modal">
    <h1 mat-dialog-title class="modalTitle">Select an Item</h1>
    <div mat-dialog-content>
      <mat-list>
        <mat-list-item class="modalItem" *ngFor="let item of data.items" (click)="selectItem(item)">
          {{ item.name }}
        </mat-list-item>
      </mat-list>
    </div>
    <div mat-dialog-actions>
      <button mat-button (click)="onNoClick()">Close</button>
    </div>
    </div>
  `,
    styles: [`
      .modal{
        padding: 1rem;  
        border-radius: 0.5rem;
        box-shadow: 0 0 1rem black; 
      }
      .modalTitle{
       text-align: center;
      font-size: 1.2rem;
      font-weight:600;
      color: rgb(66, 65, 65);
      border-bottom: 1px solid rgb(167, 167, 167);
      }
      .modalItem{
        color: rgb(66, 65, 65);
      }
      .modalItem:hover{
        background-color: rgb(221, 219, 219);
      }
    `]
})
export class ModalComponent {
  constructor(
    public dialogRef: MatDialogRef<ModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { items: any[] }
  ) {}

  onNoClick(): void {
    this.dialogRef.close();
  }

  selectItem(item: any): void {
    this.dialogRef.close(item); // Devolver el item seleccionado
  }
}

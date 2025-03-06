import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatButtonModule} from '@angular/material/button';
@Component({
    selector: 'app-modal-form-neiborhood',
    templateUrl: './modal-form-neiborhood.component.html',
    styleUrl: './modal-form-neiborhood.component.css',
    standalone:true,
    imports: [MatFormFieldModule, CommonModule, MatDialogModule, FormsModule, MatInputModule, MatButtonModule]
})
export class ModalFormNeiborhoodComponent {
  constructor(
    public dialogRef: MatDialogRef<ModalFormNeiborhoodComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    console.log(data)
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  saveChanges(): void {
    // Cierra el modal y pasa los datos modificados
    this.dialogRef.close(this.data);
  }
}

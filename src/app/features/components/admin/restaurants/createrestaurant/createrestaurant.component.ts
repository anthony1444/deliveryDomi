import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../../../auth/services/auth.service';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { collection, Firestore, getDocs } from '@angular/fire/firestore';
import { MatSelectModule } from '@angular/material/select';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ConfirmDialogComponent } from '../../../../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    MatCardModule,
    MatIconModule,
    MatSelectModule,
    MatDialogModule,
    MatSnackBarModule
  ],
  standalone: true,
  providers: [AuthService],
  selector: 'app-createrestaurant',
  templateUrl: './createrestaurant.component.html',
  styleUrls: ['./createrestaurant.component.scss']
})
export class CreaterestaurantComponent {
  restaurantForm: FormGroup;
  tabuladores?: any[];
  private firestore: Firestore = inject(Firestore);
  tabuladorSeleccionado: any;
  tabulatoridSelected: number = 0;

  constructor(
    private authService: AuthService, 
    private router: Router, 
    private fb: FormBuilder,
    public dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {
    this.restaurantForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.minLength(7)]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      tabulatorid: ['', Validators.required]
    });

    this.loadTabuladores();
  }

  private loadTabuladores() {
    const snapshot = getDocs(collection(this.firestore, 'tabuladores'));
    snapshot.then(data => {
      const tabuladores = data.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      this.tabuladores = tabuladores;
      console.log('Tabuladores:', tabuladores);
    });
  }

  async registerUser() {
    if (!this.restaurantForm.valid) {
      this.snackBar.open('Por favor, completa todos los campos requeridos.', 'Cerrar', { 
        duration: 3000, 
        panelClass: 'snackbar-error' 
      });
      return;
    }

    // Diálogo de confirmación
    const confirm = await this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Confirmar creación',
        message: '¿Estás seguro de que deseas crear este restaurante?'
      }
    }).afterClosed().toPromise();

    if (!confirm) return;

    try {
      const formValue = this.restaurantForm.value;
      const typeUser = 2; // Tipo de usuario para restaurante

      await this.authService.registerUserTypeRestaurant(
        formValue.email, 
        formValue.password, 
        formValue.name, 
        formValue.phone, 
        typeUser, 
        this.tabulatoridSelected
      );

      this.snackBar.open('¡Restaurante creado con éxito!', 'Cerrar', { 
        duration: 3000, 
        panelClass: 'snackbar-success' 
      });
      
      this.restaurantForm.reset();
      this.goToLogin();
    } catch (error) {
      console.error('❌ Error en la creación del restaurante:', error);
      this.snackBar.open('Error al crear el restaurante. Intenta nuevamente.', 'Cerrar', { 
        duration: 3000, 
        panelClass: 'snackbar-error' 
      });
    }
  }

  goToLogin() {
    this.router.navigate(['login']);
  }

  seleccionarTabulador(idtabulador: number) {
    this.tabuladorSeleccionado = this.tabuladores?.find(e => e.id == idtabulador);
    this.tabulatoridSelected = this.tabuladorSeleccionado.id;
  }
}

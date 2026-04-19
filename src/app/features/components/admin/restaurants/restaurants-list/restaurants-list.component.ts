import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';
import { Firestore, collection, query, where, getDocs, deleteDoc, doc, collectionData } from '@angular/fire/firestore';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../../../../../shared/components/confirm-dialog/confirm-dialog.component';

interface Restaurant {
  uid: string;
  name: string;
  email: string;
  phone: string;
  tabulatorid?: string | number;
  typeUser?: string | number;
  createdAt?: any;
}

@Component({
  selector: 'app-restaurants-list',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatDialogModule
  ],
  templateUrl: './restaurants-list.component.html',
  styleUrl: './restaurants-list.component.scss'
})
export class RestaurantsListComponent implements OnInit {
  private firestore = inject(Firestore);
  private snackBar = inject(MatSnackBar);
  private dialog = inject(MatDialog);
  
  restaurants$: Observable<Restaurant[]>;
  dataSource = new MatTableDataSource<Restaurant>();
  displayedColumns: string[] = ['name', 'email', 'phone', 'tabulator', 'actions'];
  loading = true;

  constructor() {
    const usersRef = collection(this.firestore, 'users');
    // Traemos todos para filtrar en memoria y evitar problemas de índices o tipos (string vs number)
    this.restaurants$ = collectionData(usersRef, { idField: 'uid' }) as Observable<any[]>;
  }

  ngOnInit(): void {
    this.restaurants$.subscribe({
      next: (data) => {
        console.log('Total usuarios en DB:', data.length);
        // Filtramos por tipo 2 (Restaurante) aceptando tanto string como número
        const filtered = data.filter(u => u.typeUser == 2 || u.typeUser == "2");
        console.log('Restaurantes filtrados:', filtered.length);
        this.dataSource.data = filtered;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error cargando usuarios:', err);
        this.loading = false;
        this.snackBar.open('Error al cargar la lista. Verifica los permisos.', 'Cerrar', { duration: 5000 });
      }
    });
  }

  // loadRestaurants ya no es necesario con el observable
  loadRestaurants() {}

  async deleteRestaurant(restaurant: Restaurant) {
    const confirm = await this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Confirmar eliminación',
        message: `¿Estás seguro de que deseas eliminar el restaurante "${restaurant.name}"? Esto solo lo borrará de la base de datos, no de la autenticación.`
      }
    }).afterClosed().toPromise();

    if (!confirm) return;

    try {
      await deleteDoc(doc(this.firestore, `users/${restaurant.uid}`));
      this.snackBar.open('Restaurante eliminado con éxito', 'Cerrar', { duration: 3000 });
      this.loadRestaurants();
    } catch (error) {
      console.error('Error deleting restaurant:', error);
      this.snackBar.open('Error al eliminar el restaurante', 'Cerrar', { duration: 3000 });
    }
  }
}

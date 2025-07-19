import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { collection, Firestore, getDocs, deleteDoc, doc, addDoc } from '@angular/fire/firestore';
import { ConfirmDialogComponent } from '../../../../../shared/components/confirm-dialog/confirm-dialog.component';

interface Tabulador {
  id: string;
  docId:string;
  Name: string;
  Zones: any[];
  createdAt?: any;
}

@Component({
  selector: 'app-tabulators-list',
  templateUrl: './tabulators-list.component.html',
  styleUrls: ['./tabulators-list.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatSnackBarModule,
    MatDialogModule
  ]
})
export class TabulatorsListComponent implements OnInit, AfterViewInit {
  displayedColumns: string[] = ['docId', 'Name', 'Zones', 'Barrios', 'actions'];
  dataSource: MatTableDataSource<Tabulador> = new MatTableDataSource();
  loading = true;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private firestore: Firestore,
    private router: Router,
    private snackBar: MatSnackBar,
    public dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadTabulators();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  async loadTabulators(): Promise<void> {
    try {
      this.loading = true;
      const tabuladoresRef = collection(this.firestore, 'tabuladores');
      const snapshot = await getDocs(tabuladoresRef);
      console.log(snapshot.docs);
      
      
      const tabuladores = snapshot.docs.map(doc => ({
        
        docId: doc.ref.id, // ID de documento real
        docName:doc.ref.id,
        ...doc.data()
      })) as any[];

      console.log(tabuladores);
      
      this.dataSource.data = tabuladores;
    } catch (error) {
      console.error('Error loading tabuladores:', error);
      this.snackBar.open('Error al cargar los tabuladores', 'Cerrar', { 
        duration: 3000, 
        panelClass: 'snackbar-error' 
      });
    } finally {
      this.loading = false;
    }
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  getTotalBarrios(tabulador: Tabulador): number {
    if (!tabulador.Zones) return 0;
    return tabulador.Zones.reduce((total, zone) => {
      return total + (zone.Neiborhood ? zone.Neiborhood.length : 0);
    }, 0);
  }

  editTabulador(tabulador: any): void {
    console.log(tabulador);
    
    this.router.navigate(['/createtabulators'], { 
      queryParams: { id: tabulador.docName } 
    });
  }

  async deleteTabulador(tabulador: any): Promise<void> {
    const confirm = await this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Confirmar eliminación',
        message: `¿Estás seguro de que deseas eliminar el tabulador "${tabulador.Name}"?`
      }
    }).afterClosed().toPromise();

    if (!confirm) return;

    try {
      console.log('Eliminando tabulador con docId:', tabulador.docId, typeof tabulador.docId);
      const tabuladorRef = doc(this.firestore, 'tabuladores', String(tabulador.docId));
      await deleteDoc(tabuladorRef);
      this.snackBar.open('Tabulador eliminado con éxito', 'Cerrar', { 
        duration: 3000, 
        panelClass: 'snackbar-success' 
      });
      this.loadTabulators();
    } catch (error) {
      console.error('Error deleting tabulador:', error);
      this.snackBar.open('Error al eliminar el tabulador', 'Cerrar', { 
        duration: 3000, 
        panelClass: 'snackbar-error' 
      });
    }
  }

  async duplicateTabulador(tabulador: Tabulador): Promise<void> {
    try {
      // Clonar el objeto sin el id
      const { id, ...tabuladorData } = tabulador;
      // Opcional: puedes modificar el nombre para indicar que es una copia
      tabuladorData.Name = tabuladorData.Name + ' (Copia)';
      await addDoc(collection(this.firestore, 'tabuladores'), tabuladorData);
      this.snackBar.open('Tabulador duplicado con éxito', 'Cerrar', { duration: 3000, panelClass: 'snackbar-success' });
      this.loadTabulators();
    } catch (error) {
      console.error('Error duplicando tabulador:', error);
      this.snackBar.open('Error al duplicar el tabulador', 'Cerrar', { duration: 3000, panelClass: 'snackbar-error' });
    }
  }

  createNewTabulador(): void {
    this.router.navigate(['/createtabulators']);
  }
} 
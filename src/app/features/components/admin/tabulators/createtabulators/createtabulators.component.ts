import { CommonModule } from '@angular/common';
import { Component, inject, ChangeDetectorRef } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterOutlet } from '@angular/router';
import { MatSelectChange, MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatListModule } from '@angular/material/list';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatGridListModule } from '@angular/material/grid-list';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { catchError, Observable, throwError } from 'rxjs';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ModalFormNeiborhoodComponent } from '../../../../../modal-form-neiborhood/modal-form-neiborhood.component';
import { SelectCustomComponent } from '../../../../../shared/components/select-custom/select-custom.component';
import { addDoc, collection, Firestore, doc, getDoc, updateDoc, query, where, getDocs } from '@angular/fire/firestore';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ConfirmDialogComponent } from '../../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { ActivatedRoute } from '@angular/router';
import { MatExpansionModule } from '@angular/material/expansion';
import { Router } from '@angular/router';

// barrio.interface.ts
export interface Barrio {
  Id: number;
  Name: string;
  Price: string | number;
  Idzone: number;
}

// zona.interface.ts
export interface Zona {
  Id: number;
  Name: string;
  Idtabulador: number;
  Neiborhood: Barrio[];
}

// tabulador.interface.ts
export interface Tabulador {
  Id: number;
  Name: string;
  Zones: Zona[];
}

@Component({
    selector: 'app-createtabulators',
    imports: [
        FormsModule, CommonModule,
        MatGridListModule, MatFormFieldModule,
        MatProgressSpinnerModule,
        SelectCustomComponent,
        MatButtonModule,
        ReactiveFormsModule,
        MatInputModule,
        MatSelectModule, MatIconModule,
        MatListModule,
        MatCardModule,
        MatDialogModule,
        MatSnackBarModule,
        MatTooltipModule,
        MatExpansionModule
    ],
    standalone: true,
    templateUrl: './createtabulators.component.html',
    styleUrls: ['./createtabulators.component.scss']
})
export class CreateTabulatorsComponent {
  private firestore = inject(Firestore);
  tabuladors: Tabulador[] = [];
  zonasDisponibles: Zona[] = [];
  barriosDisponibles: Barrio[] = [];
  selectedBarrio?: Barrio;
  loading: boolean = true;
  jsonInput: string = '';
  tabuladorId: string | null = null;
  formReady = false;

  tabuladorForm: FormGroup;
  
  constructor(
    private fb: FormBuilder,
    public dialog: MatDialog,
    private snackBar: MatSnackBar,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef,
    private router: Router
  ) {
    this.tabuladorForm = this.fb.group({
      id: [0, Validators.required],
      Name: ['', Validators.required],
      Zones: this.fb.array([])
    });

    // Detectar si hay id en la ruta
    this.route.queryParams.subscribe(async params => {
      if (params['id'] && typeof params['id'] === 'string') {
        this.tabuladorId = params['id'];
        await this.loadTabulador(this.tabuladorId);
      }
    });
  }

  get zones(): FormArray {
    return this.tabuladorForm.get('Zones') as FormArray;
  }

  addZone() {
    this.zones.push(this.fb.group({
      id: [0, Validators.required],
      Name: ['', Validators.required],
      Neiborhood: this.fb.array([])
    }));
  }

  removeZone(index: number) {
    this.zones.removeAt(index);
  }

  getNeiborhoods(zoneIndex: number): FormArray {
    return this.zones.at(zoneIndex).get('Neiborhood') as FormArray;
  }

  addNeiborhood(zoneIndex: number) {
    this.getNeiborhoods(zoneIndex).push(this.fb.group({
      id: [0, Validators.required],
      Name: ['', Validators.required],
      Price: [0, Validators.required]
    }));
  }

  removeNeiborhood(zoneIndex: number, barrioIndex: number) {
    this.getNeiborhoods(zoneIndex).removeAt(barrioIndex);
  }

  async loadTabulador(docId: string) {
    // Obtener el documento directamente por su ID real
    const tabuladorRef = doc(this.firestore, 'tabuladores', docId);
    
    const tabuladorSnap = await getDoc(tabuladorRef);
    console.log(tabuladorSnap.exists());
    if (tabuladorSnap.exists()) {
      const tabulador: any = tabuladorSnap.data();
      // Cargar los datos en el formulario
      this.tabuladorForm.patchValue({
        id: tabulador['id'] || 0,
        Name: tabulador['Name'] || tabulador['name'] || '',
      });
      // Crear un nuevo FormArray de zonas
      const zonesArray = this.fb.array([]) as FormArray<any>;
      (tabulador['Zones'] || []).forEach((zone: any) => {
        // Crear el FormArray de barrios
        const neiborhoodArray = this.fb.array([]) as FormArray<any>;
        if (Array.isArray(zone['Neiborhood'])) {
          zone['Neiborhood'].forEach((barrio: any) => {
            neiborhoodArray.push(this.fb.group({
              id: [barrio['id'], Validators.required],
              Name: [barrio['Name'], Validators.required],
              Price: [barrio['Price'], Validators.required]
            }));
          });
        }
        const zoneGroup = this.fb.group({
          id: [zone['id'], Validators.required],
          Name: [zone['Name'], Validators.required],
          Neiborhood: neiborhoodArray,
        });
        zonesArray.push(zoneGroup);
      });
      this.tabuladorForm.setControl('Zones', zonesArray);
      this.formReady = true;
      this.snackBar.open('Tabulador cargado para edición', 'Cerrar', { duration: 2000 });
      this.tabuladorId = docId;
      this.cdr.detectChanges();
    } else {
      this.formReady = false;
      this.snackBar.open('No se encontró tabulador con ese id', 'Cerrar', { duration: 3000, panelClass: 'snackbar-error' });
    }
  }

  async loadTabuladorPorCampo(campo: string, valor: any) {
    try {
      const tabuladoresRef = collection(this.firestore, 'tabuladores');
      const snapshot = await getDocs(tabuladoresRef);
      const tabuladores = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as unknown as Tabulador[];

      console.log(tabuladores);
      const q = query(tabuladoresRef, where(campo, '==', valor));
      const querySnapshot = await getDocs(q);
      console.log(querySnapshot.empty);
      if (!querySnapshot.empty) {
        const docSnap = querySnapshot.docs[0];
        const data = docSnap.data();
        console.log(`Tabulador encontrado por ${campo}:`, data, 'ID de documento:', docSnap.id);
        this.tabuladorForm.patchValue({
          id: data['id'] || 0,
          Name: data['Name'] || data['name'] || '',
        });
        // Limpiar y llenar zonas
        this.zones.clear();
        (data['Zones'] || []).forEach((zone: any) => {
          const zoneGroup = this.fb.group({
            id: [zone['id'], Validators.required],
            Name: [zone['Name'], Validators.required],
            Neiborhood: this.fb.array([]),
          });
          if (Array.isArray(zone['Neiborhood'])) {
            const neiborhoodArray = zoneGroup.get('Neiborhood') as FormArray;
            zone['Neiborhood'].forEach((barrio: any) => {
              neiborhoodArray.push(this.fb.group({
                id: [barrio['id'], Validators.required],
                Name: [barrio['Name'], Validators.required],
                Price: [barrio['Price'], Validators.required]
              }));
            });
          }
          this.zones.push(zoneGroup);
        });
        this.snackBar.open(`Tabulador cargado por ${campo}`, 'Cerrar', { duration: 2000 });
        return true;
      } else {
        this.snackBar.open(`No se encontró tabulador con ese ${campo}`, 'Cerrar', { duration: 3000, panelClass: 'snackbar-error' });
        return false;
      }
    } catch (error) {
      this.snackBar.open(`Error al buscar por ${campo}`, 'Cerrar', { duration: 3000, panelClass: 'snackbar-error' });
      return false;
    }
  }

  async saveTabulador() {
    if (this.tabuladorForm.invalid) {
      this.snackBar.open('Por favor, completa todos los campos requeridos.', 'Cerrar', { 
        duration: 3000, 
        panelClass: 'snackbar-error' 
      });
      return;
    }

    // Diálogo de confirmación
    const confirm = await this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: this.tabuladorId ? 'Confirmar edición' : 'Confirmar creación',
        message: this.tabuladorId ? '¿Estás seguro de que deseas editar este tabulador?' : '¿Estás seguro de que deseas crear este tabulador?'
      }
    }).afterClosed().toPromise();

    if (!confirm) return;

    const tabuladoresRef = collection(this.firestore, 'tabuladores');
    try {
      if (this.tabuladorId) {
        // Actualizar
        const tabuladorRef = doc(this.firestore, 'tabuladores', this.tabuladorId);
        await updateDoc(tabuladorRef, this.tabuladorForm.value);
        this.snackBar.open('¡Tabulador y zonas/barrios actualizados con éxito!', 'Cerrar', { duration: 3000, panelClass: 'snackbar-success' });
        this.router.navigate(['/tabulators']);
      } else {
        // Crear
        await addDoc(tabuladoresRef, this.tabuladorForm.value);
        this.snackBar.open('¡Tabulador creado con éxito!', 'Cerrar', { duration: 3000, panelClass: 'snackbar-success' });
        this.router.navigate(['/tabulators']);
      }
      this.tabuladorForm.reset();
      this.zones.clear();
    } catch (error) {
      console.error('Error al guardar el tabulador:', error);
      this.snackBar.open('Error al guardar el tabulador. Intenta nuevamente.', 'Cerrar', { duration: 3000, panelClass: 'snackbar-error' });
    }
  }

  loadFromJson() {
    try {
      const parsedData = JSON.parse(this.jsonInput);
  
      if (!parsedData || !Array.isArray(parsedData.Zones)) {
        this.snackBar.open('El formato del JSON no es válido', 'Cerrar', { 
          duration: 3000, 
          panelClass: 'snackbar-error' 
        });
        return;
      }
  
      this.tabuladorForm.patchValue({
        id: parsedData.id || 0,
        Name: parsedData.Name || '',
      });
  
      // Limpiar y llenar zonas
      this.zones.clear();
      parsedData.Zones.forEach((zone: any) => {
        const zoneGroup = this.fb.group({
          id: [zone.id, Validators.required],
          Name: [zone.Name, Validators.required],
          Neiborhood: this.fb.array([]),
        });
  
        // Llenar barrios de la zona
        if (Array.isArray(zone.Neiborhood)) {
          const neiborhoodArray = zoneGroup.get('Neiborhood') as FormArray;
          zone.Neiborhood.forEach((barrio: any) => {
            neiborhoodArray.push(this.fb.group({
              id: [barrio.id, Validators.required],
              Name: [barrio.Name, Validators.required],
              Price: [barrio.Price, Validators.required]
            }));
          });
        }
  
        this.zones.push(zoneGroup);
      });
  
      this.snackBar.open('Datos cargados desde el JSON exitosamente', 'Cerrar', { 
        duration: 3000, 
        panelClass: 'snackbar-success' 
      });
    } catch (error) {
      this.snackBar.open('Error al procesar el JSON', 'Cerrar', { 
        duration: 3000, 
        panelClass: 'snackbar-error' 
      });
    }
  }
} 
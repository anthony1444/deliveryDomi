import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
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
import { MatDialog } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ModalFormNeiborhoodComponent } from '../../../../modal-form-neiborhood/modal-form-neiborhood.component';
import { SelectCustomComponent } from '../../../../shared/components/select-custom/select-custom.component';
import { addDoc, collection, Firestore } from '@angular/fire/firestore';
import { MatInputModule } from '@angular/material/input';
;

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
    selector: 'app-root',
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
        MatCardModule,],
        standalone:true,
    templateUrl: './tabulators.component.html',
    styleUrls: ['./tabulators.component.scss']
})
export class TabulatorsComponent {
  private firestore = inject(Firestore);
  tabuladors: Tabulador[] = [];
  zonasDisponibles: Zona[] = [];
  barriosDisponibles: Barrio[] = [];
  selectedBarrio?: Barrio;
  loading: boolean = true;  // Variable para mostrar el spinner
  jsonInput: string = '';



  // private tabuladoresUrl = `${environment.apiUrl}tabulators`;
  // private apiKey = environment.apiKey;  // Reemplaza 'TU_CLAVE_AQUI' por tu clave real


  // 
  tabuladorForm: FormGroup;
  
  constructor( private fb: FormBuilder) {
    console.log("asdas");
    
    this.tabuladorForm = this.fb.group({
      id:[0,Validators.required],
      Name: ['', Validators.required],
      Zones: this.fb.array([])
    });
  }

  get zones(): FormArray {
    return this.tabuladorForm.get('Zones') as FormArray;
  }

  addZone() {
    this.zones.push(this.fb.group({
      id:[0,Validators.required],
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
      id:[0,Validators.required],
      Name: ['', Validators.required],
      Price: [0, Validators.required]
    }));
  }

  removeNeiborhood(zoneIndex: number, barrioIndex: number) {
    this.getNeiborhoods(zoneIndex).removeAt(barrioIndex);
  }

  async saveTabulador() {
    if (this.tabuladorForm.invalid) return;

    const tabuladoresRef = collection(this.firestore, 'tabuladores');
    try {
      await addDoc(tabuladoresRef, this.tabuladorForm.value);
      alert('Tabulador creado con éxito');
      this.tabuladorForm.reset();
      this.zones.clear();
    } catch (error) {
      alert('Error al guardar el tabulado');

     
    }
  }

  loadFromJson() {
    try {
      const parsedData = JSON.parse(this.jsonInput);
  
      if (!parsedData || !Array.isArray(parsedData.Zones)) {
        alert('El formato del JSON no es válido');
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
  
      alert('Datos cargados desde el JSON');
    } catch (error) {
      alert('Error al procesar el JSON');
    }
  }
}

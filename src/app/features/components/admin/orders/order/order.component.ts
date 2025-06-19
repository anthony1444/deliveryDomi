import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { ModalComponent } from './modal/modal.component'; // Importar el modal
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Order } from '../interfaces/Order';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
// import { Barrio, Tabulador, Zona } from '../../tabulators/tabulators.component';
import { Observable } from 'rxjs';
import { HttpClient, HttpClientModule, HttpHeaders } from '@angular/common/http';
import { SelectCustomComponent } from '../../../../../shared/components/select-custom/select-custom.component';
import { OrderService } from '../../../../../orders/services/order.service';
import { collection, DocumentData, Firestore, getDocs, query } from '@angular/fire/firestore';
import { collectionData } from '@angular/fire/firestore';


interface Barrio {
  id?:number;
  Name: string;
  Price: number;
}

interface Zona {
  id:number;
  Name: string;
  Neiborhood: Barrio[];
}

interface Tabulador {
  id:number;
  Name: string;
  Zones: Zona[];
}


@Component({
    selector: 'app-order',
    templateUrl: './order.component.html',
    imports: [
        MatButtonModule,
        MatIconModule,
        CommonModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatSelectModule,
        FormsModule,
        MatInputModule,
        MatCardModule,
        MatButtonModule,
        SelectCustomComponent,
        CurrencyPipe
    ],
    standalone:true,
    styleUrl: './order.component.scss'
})
export class OrderComponent {
    title = 'firebasetest';
  
    message: any;
    orders: Order[] = [];

  
  orderForm: FormGroup = new FormGroup({
    totalAmount: new FormControl(),
    shippingAddress: new FormControl(),
    idNeiborhood: new FormControl(),
    customerName:new FormControl(),
    tabulatorid:new FormControl(),
    zoneid:new FormControl(),
  });

  tabuladors: Tabulador[] = [];
  zonasDisponibles: Zona[] = [];
  barriosDisponibles: Barrio[] = [];
  selectedBarrio?: Barrio;
  loading: boolean = true;  // Variable para mostrar el spinner
  private firestore: Firestore = inject(Firestore);

  tabuladorSeleccionado?: Tabulador;
  zonaSeleccionada?: Zona;
  barrioSeleccionado?: Barrio;
  // tabuladores$: Observable<any[]>;
  tabuladores?:any[] 



  constructor(private fb: FormBuilder, private orderService: OrderService, public http: HttpClient) {
    const snapshot =  getDocs(collection(this.firestore, 'tabuladores'));
    snapshot.then(data=>{
      const tabuladores = data.docs.map(doc => ({
        id: doc.id, 
        ...doc.data()
      }));
      this.tabuladores = tabuladores 
      console.log('Tabuladores:', tabuladores);

    })
  
  
    




   // Referencia a la colección "tabuladores"
  //  const tabuladoresRef = collection(this.firestore, 'tabuladores');
  //  const tabuladoresQuery = query(tabuladoresRef); // Convertimos a Query

  //  // Obtenemos los datos de Firestore
  //  this.tabuladores$ = collectionData(tabuladoresQuery, { idField: 'id' });

  //  // Suscribirse para ver los datos en la consola
  //  this.tabuladores$.subscribe(data => {
  //    console.log("🔥 Datos obtenidos desde Firestore:", JSON.stringify(data, null, 2));

  //    // Verificamos si los datos tienen el formato esperado
  //    data.forEach(tabulador => {
  //      console.log("📌 Nombre del Tabulador:", tabulador.Name);
  //      console.log("📌 Zonas:", tabulador.Zones);

  //      tabulador.Zones?.forEach((zona: any) => {
  //        console.log("➡️ Zona:", zona.Name);
  //        console.log("➡️ Barrios:", zona.Neiborhood);
  //      });
  //    });
  //  });
 }
  

  ngOnInit(): void {


   
  }

  // getTabuladores(): Observable<Tabulador[]> {
  //   return this.http.get<Tabulador[]>(this.tabuladoresUrl, { headers: this.getHeaders() });
  // }

  // private getHeaders(): HttpHeaders {
  //   return new HttpHeaders({
  //     'x-functions-key': this.apiKey
  //   });
  // }

  submitOrder() {
  
    
    if (this.orderForm.valid) {
      const dateString = new Date();
      console.log(dateString.getTime());

      const order: Order = {
        orderDate:  dateString.toISOString(),
        shippedDate:   dateString.toISOString(),
        totalAmount: this.orderForm.get('totalAmount')?.value,
        status: 1,
        shippingAddress: this.orderForm.value.shippingAddress,
        createdAt:  dateString.toISOString(),
        updatedAt:  dateString.toISOString(),
        customerName: 'test',
        delivererId: '',
        iduser:1,
        idNeiborhood:this.orderForm.get('idNeiborhood')?.value,
        zoneid:this.orderForm.get('zoneid')?.value,
        tabulatorid:this.orderForm.get('tabulatorid')?.value,

      };
      this.orderService.createOrder(order);


      
    } else {
      alert('Por favor, completa los campos requeridos.');
    }
  }
  // onTabuladorChange(event: any) {
  //   const tabuladorId = event.Id;
  //   this.zonasDisponibles = this.tabuladors.find(t => t.Id === tabuladorId)?.Zones || [];
  //   this.barriosDisponibles = []; // Limpiar los barrios cuando cambie el tabulador
  // }

  // onZonaChange(event: any) {
  //   const zonaId = event.Id;
  //   const selectedZona = this.zonasDisponibles.find(z => z.Id === zonaId);
  //   this.barriosDisponibles = selectedZona ? selectedZona.Neiborhood : [];
  // }


  // onBarrioChange(event: any) {
  //   const barrioId = event.Id;
  //   const selectedBarrio = this.barriosDisponibles.find(z => z.Id === barrioId);
  //   this.orderForm.get('idNeiborhood')?.setValue(selectedBarrio?.Id);
  //   this.orderForm.get('totalAmount')?.setValue(selectedBarrio?.Price);
    

  // }

  seleccionarBarrio(idBarrio: number) {
    console.log("asd");
    
    this.selectedBarrio = this.zonaSeleccionada?.Neiborhood.find(e=> e.id == idBarrio);
    this.orderForm.get('totalAmount')?.setValue(this.selectedBarrio?.Price);
  }


  seleccionarTabulador(idtabulador: number) {
    
    this.tabuladorSeleccionado = this.tabuladores?.find(e=> e.id == idtabulador);
    this.zonaSeleccionada = undefined;
    this.barrioSeleccionado = undefined;
  }

  seleccionarZona(idzona: number) {
    this.zonaSeleccionada = this.tabuladorSeleccionado?.Zones.find(e=> e.id == idzona);
    this.barrioSeleccionado = undefined;
  }

 
  

}

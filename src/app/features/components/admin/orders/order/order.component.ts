import { Component, inject, AfterViewInit } from '@angular/core';
import * as L from 'leaflet';
import '@geoman-io/leaflet-geoman-free';
import 'leaflet-control-geocoder';

import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
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
import { collectionData, onSnapshot } from '@angular/fire/firestore';
import { ConfirmDialogComponent } from './../../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { MatAutocompleteModule, MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { debounceTime, distinctUntilChanged, switchMap, catchError, map } from 'rxjs/operators';
import { of } from 'rxjs';
import booleanPointInPolygon from '@turf/boolean-point-in-polygon';
import { point } from '@turf/helpers';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';


interface Barrio {
  id?:number;
  Name: string;
  Price: number;
  MapAreaId?: string;
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
        CurrencyPipe,
        MatDialogModule,
        MatSnackBarModule,
        MatAutocompleteModule,
        MatProgressSpinnerModule
    ],
    standalone:true,
    styleUrl: './order.component.scss'
})
export class OrderComponent implements AfterViewInit {

    title = 'firebasetest';
  
    message: any;
    orders: Order[] = [];

  
  orderForm: FormGroup = new FormGroup({
    totalAmount: new FormControl(),
    shippingAddress: new FormControl(),
    idNeiborhood: new FormControl(),
    customerName:new FormControl(),
    phone: new FormControl(),
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
  tabuladores?:any[];
  
  // Autocompletado y Detección de Áreas
  filteredAddresses: any[] = [];
  isSearchingAddress: boolean = false;
  mapAreas: any[] = [];

  // Mapa
  map!: L.Map;
  addressMarker: L.Marker | null = null;
  drawnLayers: L.Layer[] = [];



  constructor(private fb: FormBuilder, private orderService: OrderService, public http: HttpClient, public dialog: MatDialog, private snackBar: MatSnackBar) {
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
    this.checkUserTabulator();
    this.loadMapAreas();
    this.setupAddressAutocomplete();
  }

  ngAfterViewInit(): void {
    this.initMap();
  }

  private initMap(): void {
    this.map = L.map('order-map').setView([6.2442, -75.5812], 12);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(this.map);
    
    // Configurar icono por defecto para evitar errores de assets perdidos
    const DefaultIcon = L.icon({
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41]
    });
    L.Marker.prototype.options.icon = DefaultIcon;
    
    // A) Añadir Buscador Interno del mapa
    const geocoderControl = (L.Control as any).geocoder({
      defaultMarkGeocode: false,
      placeholder: "Buscar en el mapa...",
      errorMessage: "No encontrado."
    })
    .on('markgeocode', (e: any) => {
      const latlng = e.geocode.center;
      const address = e.geocode.name;
      this.handleMapLocationSelection(latlng.lat, latlng.lng, address);
    })
    .addTo(this.map);

    // B) Añadir Reverse Geocoding al hacer clic en el mapa
    this.map.on('click', (e: any) => {
      const lat = e.latlng.lat;
      const lon = e.latlng.lng;
      
      this.snackBar.open('Buscando dirección...', '', { duration: 1500 });
      
      // Llamada a ArcGIS para Reverse Geocoding
      const url = `https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer/reverseGeocode?location=${lon},${lat}&f=json`;
      this.http.get<any>(url).subscribe({
        next: (response) => {
          if (response && response.address && response.address.Match_addr) {
            this.handleMapLocationSelection(lat, lon, response.address.Match_addr);
          } else {
            this.handleMapLocationSelection(lat, lon, 'Dirección manual en mapa');
          }
        },
        error: () => {
          this.handleMapLocationSelection(lat, lon, 'Dirección manual en mapa');
        }
      });
    });

    setTimeout(() => {
      this.map.invalidateSize();
      if (this.tabuladorSeleccionado) {
        this.renderTabuladorAreas();
      }
    }, 500);
  }

  private renderTabuladorAreas(): void {
    if (!this.map || !this.tabuladorSeleccionado) return;
    
    this.map.invalidateSize();

    // Limpiar
    this.drawnLayers.forEach(layer => this.map.removeLayer(layer));
    this.drawnLayers = [];

    const selectedAreaIds = new Set<string>();
    const zones = this.tabuladorSeleccionado.Zones || [];
    zones.forEach((zone: any) => {
      const neiborhoods = zone.Neiborhood || [];
      neiborhoods.forEach((barrio: any) => {
        if (barrio.MapAreaId) {
          selectedAreaIds.add(barrio.MapAreaId);
        }
      });
    });

    const bounds = L.latLngBounds([]);
    
    this.mapAreas.forEach(area => {
      if (selectedAreaIds.has(area.id) && area.geoJson) {
        let geoData = typeof area.geoJson === 'string' ? JSON.parse(area.geoJson) : area.geoJson;
        try {
          const layerGroup = L.geoJSON(geoData, {
            style: { color: area.color || '#3f51b5', fillOpacity: 0.2 } // Opacidad menor para pedidos
          });
          layerGroup.eachLayer((l: any) => {
            l.addTo(this.map);
            this.drawnLayers.push(l);
            if (l.getBounds) {
              bounds.extend(l.getBounds());
            }
          });
        } catch (e) {
          console.error('Error renderizando polígono en orden', e);
        }
      }
    });

    if (bounds.isValid() && this.drawnLayers.length > 0) {
      this.map.fitBounds(bounds, { padding: [20, 20], maxZoom: 14 });
    }
  }

  private loadMapAreas() {
    const areasCollection = collection(this.firestore, 'zones');
    onSnapshot(areasCollection, (snapshot) => {
      this.mapAreas = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      // Si el mapa ya cargó y hay un tabulador seleccionado, dibujamos las áreas
      if (this.map && this.tabuladorSeleccionado) {
        this.renderTabuladorAreas();
      }
    });
  }

  private setupAddressAutocomplete() {
    this.orderForm.get('shippingAddress')?.valueChanges.pipe(
      debounceTime(500),
      distinctUntilChanged(),
      switchMap(value => {
        if (!value || typeof value !== 'string' || value.length < 5) {
          this.filteredAddresses = [];
          return of([]);
        }
        this.isSearchingAddress = true;
        
        // Usamos ArcGIS World Geocoding Service. Es el mejor servicio gratuito para direcciones en Latinoamérica.
        // Entiende perfectamente formatos como "Calle 45 # 23-14" y nombres de barrios sin tener que limpiar los textos.
        const queryStr = encodeURIComponent(value);
        const url = `https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer/findAddressCandidates?singleLine=${queryStr}&city=Medellin&region=Antioquia&countryCode=COL&maxLocations=7&f=json`;
        
        return this.http.get<any>(url).pipe(
          map(response => response.candidates || []),
          catchError(() => of([]))
        );
      })
    ).subscribe(results => {
      this.isSearchingAddress = false;
      this.filteredAddresses = results;
    });
  }

  onAddressSelected(event: MatAutocompleteSelectedEvent) {
    const selected = event.option.value; // Este es el candidato de ArcGIS
    
    const displayName = this.displayAddress(selected);
    this.orderForm.get('shippingAddress')?.setValue(displayName, { emitEvent: false });
    
    // ArcGIS devuelve location: { x: lon, y: lat }
    if (selected.location && selected.location.x && selected.location.y) {
      const lon = selected.location.x;
      const lat = selected.location.y;
      
      this.handleMapLocationSelection(lat, lon, displayName);
    }
  }

  private handleMapLocationSelection(lat: number, lon: number, addressText: string) {
    // 1. Poner Pin
    if (this.map) {
      if (this.addressMarker) {
        this.map.removeLayer(this.addressMarker);
      }
      this.addressMarker = L.marker([lat, lon]).addTo(this.map);
      this.addressMarker.bindPopup(`<b>${addressText}</b>`).openPopup();
      this.map.setView([lat, lon], 16, { animate: true });
    }

    // 2. Actualizar texto de dirección en el formulario (sin disparar de nuevo la búsqueda)
    this.orderForm.get('shippingAddress')?.setValue(addressText, { emitEvent: false });

    // 3. Detectar Área de Mapa y autocompletar barrio
    this.detectMapAreaFromCoordinates(lat, lon);
  }

  displayAddress(candidate: any): string {
    if (!candidate) return '';
    // ArcGIS devuelve la dirección formateada en 'address'
    return candidate.address || 'Dirección desconocida';
  }

  private detectMapAreaFromCoordinates(lat: number, lon: number) {
    const pt = point([lon, lat]); // Turf usa [longitud, latitud]
    let detectedAreaId: string | null = null;
    
    // Recopilar los MapAreaId que realmente pertenecen al tabulador seleccionado
    const tabulatorAreaIds = new Set<string>();
    if (this.tabuladorSeleccionado && this.tabuladorSeleccionado.Zones) {
      this.tabuladorSeleccionado.Zones.forEach((zone: any) => {
        const neiborhoods = zone.Neiborhood || [];
        neiborhoods.forEach((barrio: any) => {
          if (barrio.MapAreaId) {
            tabulatorAreaIds.add(barrio.MapAreaId);
          }
        });
      });
    }

    for (const area of this.mapAreas) {
      // Ignorar las áreas que no están configuradas en el tabulador actual
      if (!tabulatorAreaIds.has(area.id)) continue;

      if (!area.geoJson) continue;
      try {
        let geoData = typeof area.geoJson === 'string' ? JSON.parse(area.geoJson) : area.geoJson;
        
        // Función auxiliar para revisar si el punto está en el feature
        const checkFeature = (feature: any) => {
          if (feature && feature.geometry && (feature.geometry.type === 'Polygon' || feature.geometry.type === 'MultiPolygon')) {
            return booleanPointInPolygon(pt, feature);
          }
          return false;
        };

        // Si es un FeatureCollection (tiene un array de features)
        if (geoData.type === 'FeatureCollection' && Array.isArray(geoData.features)) {
          for (const feature of geoData.features) {
            if (checkFeature(feature)) {
              detectedAreaId = area.id;
              break;
            }
          }
        } 
        // Si es un Feature individual (Geoman a veces exporta así una sola capa)
        else if (geoData.type === 'Feature') {
          if (checkFeature(geoData)) {
            detectedAreaId = area.id;
          }
        }
        
      } catch (e) {
        console.error('Error procesando polígono', e);
      }
      if (detectedAreaId) break;
    }

    if (detectedAreaId) {
      this.snackBar.open('¡Área de mapa detectada automáticamente!', 'Cerrar', { duration: 3000, panelClass: 'snackbar-success' });
      this.autoSelectBarrioByMapArea(detectedAreaId);
    } else {
      this.snackBar.open('La dirección no coincide con ninguna zona de entrega mapeada.', 'Cerrar', { duration: 4000, panelClass: 'snackbar-warning' });
    }
  }

  private autoSelectBarrioByMapArea(mapAreaId: string) {
    if (!this.tabuladorSeleccionado) {
      this.snackBar.open('Selecciona primero un tabulador.', 'Cerrar', { duration: 3000 });
      return;
    }

    // Buscamos en el tabulador actual si hay algún barrio asignado a esta área de mapa
    for (const zona of this.tabuladorSeleccionado.Zones) {
      if (!zona.Neiborhood) continue;
      const barrioEncontrado = zona.Neiborhood.find(b => b.MapAreaId === mapAreaId);
      
      if (barrioEncontrado) {
        // Encontramos el barrio. Autocompletamos el formulario.
        this.seleccionarZona(zona.id);
        this.orderForm.get('zoneid')?.setValue(zona.id);
        
        // Timeout ligero para permitir que Angular actualice la lista dependiente
        setTimeout(() => {
          this.seleccionarBarrio(barrioEncontrado.id);
          this.orderForm.get('idNeiborhood')?.setValue(barrioEncontrado.id);
          this.snackBar.open(`Barrio autoseleccionado: ${barrioEncontrado.Name}`, 'Cerrar', { duration: 3000, panelClass: 'snackbar-success' });
        });
        return;
      }
    }
    
    this.snackBar.open('El área detectada no está asignada a ningún barrio de tu tabulador.', 'Cerrar', { duration: 4000, panelClass: 'snackbar-warning' });
  }

  isRestaurant(): boolean {
    const userStr = localStorage.getItem('user');
    if (!userStr) return false;
    try {
      const user = JSON.parse(userStr);
      return user.typeUser == 2 || user.typeUser == "2";
    } catch {
      return false;
    }
  }

  private async checkUserTabulator() {
    const userStr = localStorage.getItem('user');
    if (!userStr) return;

    try {
      const user = JSON.parse(userStr);
      // typeUser 2 es Restaurante
      if ((user.typeUser == 2 || user.typeUser == "2") && user.tabulatorid) {
        // Esperamos a que los tabuladores carguen si es necesario
        if (!this.tabuladores) {
          const snapshot = await getDocs(collection(this.firestore, 'tabuladores'));
          this.tabuladores = snapshot.docs.map(doc => ({
            id: doc.id, 
            ...doc.data()
          }));
        }

        const tabId = user.tabulatorid;
        this.orderForm.get('tabulatorid')?.setValue(tabId);
        
        // Si es restaurante, bloqueamos el campo para que no elija otro
        this.orderForm.get('tabulatorid')?.disable();
        
        this.seleccionarTabulador(tabId);
      }
    } catch (e) {
      console.error('Error checking user tabulator:', e);
    }
  }

  // getTabuladores(): Observable<Tabulador[]> {
  //   return this.http.get<Tabulador[]>(this.tabuladoresUrl, { headers: this.getHeaders() });
  // }

  // private getHeaders(): HttpHeaders {
  //   return new HttpHeaders({
  //     'x-functions-key': this.apiKey
  //   });
  // }

  async submitOrder() {
    if (!this.orderForm.valid) {
      alert('Por favor, completa los campos requeridos.');
      return;
    }

    // Diálogo de confirmación
    const confirm = await this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Confirmar creación',
        message: '¿Estás seguro de que deseas crear esta orden?'
      }
    }).afterClosed().toPromise();

    if (!confirm) return;

    try {
      const dateString = new Date();
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      let totalAmount = this.orderForm.get('totalAmount')?.value;

      if (user && user.typeUser === '3') {
        totalAmount -= 1000;
      }

      const order: Order = {
        orderDate:  dateString.toISOString(),
        shippedDate:   dateString.toISOString(),
        totalAmount: totalAmount,
        status: 1,
        shippingAddress: this.orderForm.value.shippingAddress,
        phone: this.orderForm.value.phone,
        createdAt:  dateString.toISOString(),
        updatedAt:  dateString.toISOString(),
        customerName: this.orderForm.value.customerName,
        createdByUserName: user.name || user.firstName || 'Usuario',
        delivererId: '',
        iduser:1,
        idNeiborhood:this.orderForm.get('idNeiborhood')?.value,
        zoneid:this.orderForm.get('zoneid')?.value,
        tabulatorid:this.orderForm.getRawValue().tabulatorid, // Usamos getRawValue() porque el campo puede estar deshabilitado
      };
      await this.orderService.createOrder(order);
      this.snackBar.open('¡Orden creada con éxito!', 'Cerrar', { duration: 3000, panelClass: 'snackbar-success' });
      this.orderForm.reset();
    } catch (error) {
      this.snackBar.open('Error al crear la orden. Intenta nuevamente.', 'Cerrar', { duration: 3000, panelClass: 'snackbar-error' });
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

  seleccionarBarrio(idBarrio: any) {
    console.log("asd");
    
    this.selectedBarrio = this.zonaSeleccionada?.Neiborhood.find(e=> e.id == idBarrio);
    this.orderForm.get('totalAmount')?.setValue(this.selectedBarrio?.Price);
  }


  seleccionarTabulador(idtabulador: any) {
    
    this.tabuladorSeleccionado = this.tabuladores?.find(e=> e.id == idtabulador);
    this.zonaSeleccionada = undefined;
    this.barrioSeleccionado = undefined;
    
    if (this.map && this.tabuladorSeleccionado) {
      this.renderTabuladorAreas();
    }
  }

  seleccionarZona(idzona: any) {
    this.zonaSeleccionada = this.tabuladorSeleccionado?.Zones.find(e=> e.id == idzona);
    this.barrioSeleccionado = undefined;
  }

 
  

}

import { Component, OnInit, AfterViewInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Firestore, collection, addDoc, collectionData, query, deleteDoc, doc, updateDoc, onSnapshot } from '@angular/fire/firestore';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import * as L from 'leaflet';
import '@geoman-io/leaflet-geoman-free';
import { Observable } from 'rxjs';

interface MapArea {
  id?: string;
  name: string;
  color: string;
  geoJson: any;
  price?: number;
}

@Component({
  selector: 'app-zones',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatCardModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatDividerModule
  ],
  templateUrl: './zones.component.html',
  styleUrl: './zones.component.scss'
})
export class ZonesComponent implements OnInit, AfterViewInit {
  private firestore = inject(Firestore);
  private snackBar = inject(MatSnackBar);
  
  map!: L.Map;
  mapAreas: MapArea[] = [];
  
  selectedLayer: any = null;
  newAreaName: string = '';
  newAreaPrice: number = 0;
  isSaving: boolean = false;
  
  constructor() {
    // onSnapshot se inicializará en ngOnInit para mayor control
  }

  ngOnInit(): void {
    const areasCollection = collection(this.firestore, 'zones');
    
    // Usamos onSnapshot directamente para mayor fiabilidad con los tipos de Firebase
    onSnapshot(areasCollection, {
      next: (snapshot) => {
        const data = snapshot.docs.map(d => ({
          id: d.id,
          ...d.data()
        })) as MapArea[];
        
        console.log('Áreas de mapa recibidas:', data.length, data);
        this.mapAreas = data;
        this.renderAreasOnMap();
      },
      error: (err) => {
        console.error('Error en onSnapshot de áreas de mapa:', err);
        this.snackBar.open('Error al cargar áreas de mapa. Verifica permisos.', 'Cerrar', { duration: 5000 });
      }
    });
  }

  ngAfterViewInit(): void {
    this.initMap();
  }

  private initMap(): void {
    // Coordenadas aproximadas de Medellín
    this.map = L.map('map').setView([6.2442, -75.5812], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(this.map);

    // Configurar Geoman
    this.map.pm.addControls({
      position: 'topleft',
      drawCircleMarker: false,
      drawPolyline: false,
      drawRectangle: true,
      drawPolygon: true,
      drawCircle: false,
      drawMarker: false,
      editMode: true,
      dragMode: true,
      cutPolygon: false,
      removalMode: true,
    });

    this.map.on('pm:create', (e: any) => {
      this.selectedLayer = e.layer;
      this.newAreaName = '';
      this.newAreaPrice = 0;
      
      this.snackBar.open('Nueva área de mapa detectada. Ponle un nombre en el panel lateral.', 'OK', { duration: 3000 });
    });

    this.map.on('pm:remove', (e: any) => {
      if (e.layer.options.id) {
        this.deleteZone(e.layer.options.id);
      }
    });
  }

  private renderAreasOnMap(): void {
    if (!this.map) return;

    this.map.eachLayer((layer: any) => {
      if (layer.options && layer.options.id) {
        this.map.removeLayer(layer);
      }
    });

    this.mapAreas.forEach(area => {
      if (!area.geoJson) {
        console.warn('Área sin geoJson detectada:', area.name);
        return;
      }

      let geoData = area.geoJson;
      // Si se guardó como string para evitar errores de Firebase, lo parseamos
      if (typeof geoData === 'string') {
        try {
          geoData = JSON.parse(geoData);
        } catch (e) {
          console.error('Error parsing geoJson string para área:', area.name, e);
          return;
        }
      }

      try {
        const layer = L.geoJSON(geoData, {
          style: { color: area.color || '#3388ff', fillOpacity: 0.4 }
        });
        
        layer.eachLayer((l: any) => {
          l.options.id = area.id;
          l.bindPopup(`<b>${area.name}</b><br>Precio: $${area.price || 0}`);
          l.addTo(this.map);
        });
      } catch (e) {
        console.error('Error al renderizar GeoJSON en el mapa para área:', area.name, e);
      }
    });
  }

  async saveNewZone() {
    if (!this.selectedLayer) {
      this.snackBar.open('No hay ninguna área seleccionada para guardar.', 'Cerrar', { duration: 3000 });
      return;
    }

    if (!this.newAreaName) {
      this.snackBar.open('Debes asignar un nombre al área.', 'Cerrar', { duration: 3000 });
      return;
    }

    this.isSaving = true;
    try {
      const geoJson = this.selectedLayer.toGeoJSON();
      const areasCollection = collection(this.firestore, 'zones');
      
      // Convertimos a string para evitar el error de Firebase con arrays anidados
      const geoJsonString = JSON.stringify(geoJson);

      await addDoc(areasCollection, {
        name: this.newAreaName,
        price: this.newAreaPrice,
        color: this.getRandomColor(),
        geoJson: geoJsonString
      });

      this.map.removeLayer(this.selectedLayer);
      this.selectedLayer = null;
      this.newAreaName = '';
      this.newAreaPrice = 0;
      
      this.snackBar.open('Área de mapa guardada exitosamente.', 'Cerrar', { duration: 3000 });
    } catch (error) {
      console.error('Error saving map area:', error);
      this.snackBar.open('Error al guardar el área de mapa.', 'Cerrar', { duration: 3000 });
    } finally {
      this.isSaving = false;
    }
  }

  async deleteZone(id: string) {
    try {
      const zoneDoc = doc(this.firestore, `zones/${id}`);
      await deleteDoc(zoneDoc);
      this.snackBar.open('Zona eliminada.', 'Cerrar', { duration: 2000 });
    } catch (error) {
      console.error('Error deleting zone:', error);
      this.snackBar.open('Error al eliminar la zona.', 'Cerrar', { duration: 3000 });
    }
  }

  private getRandomColor(): string {
    const colors = ['#f44336', '#e91e63', '#9c27b0', '#673ab7', '#3f51b5', '#2196f3', '#03a9f4', '#00bcd4', '#009688', '#4caf50', '#8bc34a', '#cddc39', '#ffeb3b', '#ffc107', '#ff9800', '#ff5722'];
    return colors[Math.floor(Math.random() * colors.length)];
  }
}

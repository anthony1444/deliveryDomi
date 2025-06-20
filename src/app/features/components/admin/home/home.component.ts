import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { User } from '../../../interfaces/authresponse.interface';

@Component({
    selector: 'app-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.scss'],
    standalone: true,
    imports: [CommonModule, MatCardModule, MatIconModule, RouterLink, MatButtonModule]
})
export class HomeComponent {
  user:User =  JSON.parse(localStorage.getItem('user') ?? '') as User;

  features = [
    {
      title: 'Crear Pedido',
      description: 'Inicia un nuevo pedido para un cliente.',
      icon: 'add_shopping_cart',
      route: '/order',
      data: [1, 2],
    },
    {
      title: 'Ver Pedidos',
      description: 'Revisa y gestiona los pedidos existentes.',
      icon: 'shopping_cart',
      route: '/orders',
      data: [1, 3],
    },
    {
      title: 'Mis Pedidos',
      description: 'Consulta el historial de tus pedidos.',
      icon: 'view_list',
      route: '/myorders',
      data: [1, 3],
    },
    {
      title: 'Tabuladores',
      description: 'Gestiona los tabuladores del sistema.',
      icon: 'table_chart',
      route: '/tabulators',
      data: [1],
    },
    {
      title: 'Crear Tabuladores',
      description: 'Crea nuevos tabuladores con zonas y barrios.',
      icon: 'add_chart',
      route: '/createtabulators',
      data: [1],
    },
    {
      title: 'Crear Restaurante',
      description: 'Añade un nuevo restaurante al sistema.',
      icon: 'restaurant_menu',
      route: '/createrestaurant',
      data: [1],
    },
  ];

  constructor(private router: Router) {}

  navigateTo(route: string): void {
    this.router.navigate([route]);
  }

  validatePermisions(feature:any){
    if (feature === undefined) {
      return false
    }

    const roles:Array<number> = feature.data;
    const result = roles.find(r => r == Number(this.user.typeUser))
    if (typeof result == 'undefined') {
      return false
    }
    return true;
    
  }
}

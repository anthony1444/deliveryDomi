import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';

@Component({
    selector: 'app-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.scss'],
    standalone: true,
    imports: [CommonModule, MatCardModule, MatIconModule, RouterLink, MatButtonModule]
})
export class HomeComponent {
  features = [
    {
      title: 'Crear Pedido',
      description: 'Inicia un nuevo pedido para un cliente.',
      icon: 'add_shopping_cart',
      route: '/order',
    },
    {
      title: 'Ver Pedidos',
      description: 'Revisa y gestiona los pedidos existentes.',
      icon: 'shopping_cart',
      route: '/orders',
    },
    {
      title: 'Mis Pedidos',
      description: 'Consulta el historial de tus pedidos.',
      icon: 'view_list',
      route: '/myorders',
    }
  ];

  constructor(private router: Router) {}

  navigateTo(route: string): void {
    this.router.navigate([route]);
  }
}

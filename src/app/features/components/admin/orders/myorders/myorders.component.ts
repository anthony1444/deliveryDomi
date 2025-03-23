import { Component } from '@angular/core';
import { OrderService } from '../../../../../orders/services/order.service';
import { Order } from '../interfaces/Order';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../../../../auth/services/auth.service';
import { User } from '../../../../interfaces/authresponse.interface';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-myorders',
  templateUrl: './myorders.component.html',
  standalone: true,
  styleUrls: ['./myorders.component.scss'],
  imports: [CommonModule, MatCardModule, MatIconModule, MatButtonModule]
})
export class MyOrdersComponent {
  orders: Order[] = [];
  userId: string | null = null; // ID del usuario logueado
  userCurrent!: User ;

  constructor(public orderService: OrderService, private authService: AuthService) {
    this.loadUserOrders(); // Cargar órdenes del usuario logueado
  }

  loadUserOrders(): void {
    const userData = localStorage.getItem('user');
    
    if (userData) {
      const user: User = JSON.parse(userData) as User;
      this.userCurrent =  user as User;
      if (user?.uid) {
        this.userId = user.uid;
        this.loadOrdersByField('delivererId', this.userId);
      } else {
        console.error('El usuario no tiene UID válido.');
      }
    } else {
      console.error('No se encontró información del usuario en localStorage.');
    }
  }

  loadOrdersByField<T>(field: keyof Order, value: T) {
    this.orderService.getOrdersByField(field, value).subscribe(data => {
      this.orders = data;
      console.log(`Órdenes filtradas por ${field}:`, this.orders);
    });
  }

  getStatusLabel(status: number): string {
    const statusMap = {
      0: 'Pendiente',
      1: 'En camino',
      2: 'Asignado',
      3: 'Entregado'
    } as any;
    return statusMap[status] || 'Desconocido';
  }


  completeOrder(order: Order): void {
    if (!this.userId) {
      console.error('Usuario no autenticado.');
      return;
    }

    const updatedOrder:Order = { 
      ...order, 
      delivererId: this.userId, 
      status: 3 // Estado "En camino"
    };
    console.log(updatedOrder);
    
    this.orderService.updateOrder(String(order.id), updatedOrder).then(() => {
      console.log('Orden aceptada:', updatedOrder);
      this.loadOrdersByField('status', 3); // Recargar órdenes pendientes
    });
  }
}

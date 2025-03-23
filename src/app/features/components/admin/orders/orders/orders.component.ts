import { Component } from '@angular/core';
import { OrderService } from '../../../../../orders/services/order.service';
import { Order } from '../interfaces/Order';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../../../../auth/services/auth.service';
import { User } from '../../../../interfaces/authresponse.interface';
import { AlertService } from '../../../../../core/services/alert.service';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-orders',
  templateUrl: './orders.component.html',
  standalone: true,
  styleUrls: ['./orders.component.scss'],
  imports: [CommonModule, MatCardModule, MatIconModule, MatButtonModule]
})
export class OrdersComponent {
  orders: Order[] = [];
  userId: string | null = null; // ID del usuario logueado

  constructor(public orderService: OrderService, private authService: AuthService, private alertService: AlertService) {
    const user: User = JSON.parse(localStorage.getItem('user') ?? '') as User;
    console.log(user.uid);

    this.userId = String(user.uid)

    // this.authService.getCurrentUser().subscribe(user => {
    //   this.userId = user?.uid || null; // Obtener ID del usuario logueado
    // });
    // this.loadOrders(); // Cargar órdenes con estado 'Pendiente'
    this.loadOrdersByField('status', 1); // Cargar órdenes con estado 'Pendiente'

  }


  loadOrdersByField<T>(field: keyof Order, value: T) {
    this.orderService.getOrdersByField(field, value).subscribe(data => {
      this.orders = data;
      console.log(`Órdenes filtradas por ${field}:`, this.orders);
    });
  }
  // Cargar pedidos
  loadOrders(): void {
    this.orderService.getOrders().subscribe(data => {
      this.orders = data;
    });
  }

  // Eliminar pedido
  deleteOrder(order: any): void {
    console.log(order);

    this.orderService.deleteOrder(order);
  }

  getStatusText(status: number | undefined): string {
    switch (status) {
      case 1: return 'Pendiente';
      case 2: return 'Enviado';
      case 3: return 'Cancelado';
      default: return 'Desconocido';
    }
  }

  getStatusLabel(status: number): string {
    const statusMap = {
      0: 'Pendiente',
      1: 'En camino',
      2: 'Entregado',
      3: 'Cancelado'
    } as any;
    return statusMap[status] || 'Desconocido';
  }

  acceptOrder(order: Order): void {
    this.alertService.showAlert('Confirmación', '¿Deseas marcar este pedido como entregado?', 'Sí', 'Cancelar')
      .subscribe(confirmed => {
        if (confirmed) {
          if (!this.userId) {
            console.error('Usuario no autenticado.');
            return;
          }


          const updatedOrder: Order = {
            ...order,
            delivererId: this.userId,
            status: 2 // Estado "En camino"
          };
          console.log(updatedOrder);

          this.orderService.updateOrder(String(order.id), updatedOrder).then(() => {
            console.log('Orden aceptada:', updatedOrder);
            this.loadOrdersByField('status', 1); // Recargar órdenes pendientes
          });
        }

      })
  }

}



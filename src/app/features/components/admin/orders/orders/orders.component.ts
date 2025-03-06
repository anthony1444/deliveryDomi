import { Component } from '@angular/core';
import { OrderService } from '../../../../../orders/services/order.service';
import { Order } from '../interfaces/Order';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-orders',
  templateUrl: './orders.component.html',
  standalone:true,
  styleUrls:['./orders.component.scss'],
  imports:[CommonModule, MatCardModule, MatIconModule]
})
export class OrdersComponent {
   orders: Order[] = [];

    constructor(public orderService:OrderService){
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
  

}

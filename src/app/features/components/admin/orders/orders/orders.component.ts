import { Component } from '@angular/core';
import { OrderService } from '../../../../../orders/services/order.service';
import { Order, OrderStatus } from '../interfaces/Order';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../../../../auth/services/auth.service';
import { User } from '../../../../interfaces/authresponse.interface';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { OrderConfirmDialogComponent } from './order-confirm-dialog/order-confirm-dialog.component';

@Component({
  selector: 'app-orders',
  templateUrl: './orders.component.html',
  standalone: true,
  styleUrls: ['./orders.component.scss'],
  imports: [CommonModule, CurrencyPipe, MatCardModule, MatIconModule, MatButtonModule, MatDialogModule]
})
export class OrdersComponent {
  orders: Order[] = [];
  user: User | null = null;
  userId: string | null = null;
  reservedOrder: Order | null = null;

  get displayOrders(): Order[] {
    if (!this.reservedOrder) return this.orders;
    const alreadyIn = this.orders.some(o => o.id === this.reservedOrder!.id);
    return alreadyIn ? this.orders : [this.reservedOrder, ...this.orders];
  }

  constructor(public orderService: OrderService, private authService: AuthService, private dialog: MatDialog) {
    const userJson = localStorage.getItem('user');
    if (userJson) {
      this.user = JSON.parse(userJson) as User;
      this.userId = this.user.uid;
    }

    this.loadOrdersByField('status', OrderStatus.Pendiente);
  }

  loadOrdersByField<T>(field: keyof Order, value: T) {
    this.orderService.getOrdersByField(field, value).subscribe({
      next: (data: any) => {
        this.orders = data;
        console.log(`Órdenes filtradas por ${field}:`, this.orders);
      },
      error: (err: any) => {
        console.error(`Error al filtrar órdenes por ${field}:`, err);
      }
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

  readonly OrderStatus = OrderStatus;

  getStatusLabel(status: OrderStatus): string {
    const statusMap: Record<OrderStatus, string> = {
      [OrderStatus.Pendiente]: 'Pendiente',
      [OrderStatus.EnCamino]:  'En camino',
      [OrderStatus.Entregado]: 'Entregado',
      [OrderStatus.Cancelado]: 'Cancelado',
      [OrderStatus.Ocupada]:   'Ocupada',
    };
    return statusMap[status] ?? 'Desconocido';
  }

  acceptOrder(order: Order): void {
    if (!this.userId) {
      console.error('Usuario no autenticado.');
      return;
    }

    const ocupadaOrder: Order = { ...order, status: OrderStatus.Ocupada, delivererId: this.userId };

    // Reservar: marca como Ocupada y registra reset automático si el cliente se desconecta
    this.orderService.reserveOrder(String(order.id), ocupadaOrder).then(() => {
      this.reservedOrder = ocupadaOrder;

      const dialogRef = this.dialog.open(OrderConfirmDialogComponent, {
        data: { order: ocupadaOrder, timeout: 15 },
        width: '360px',
        panelClass: 'order-confirm-panel'
      });

      dialogRef.afterClosed().subscribe(confirmed => {
        this.reservedOrder = null;
        if (confirmed) {
          // Confirma: cancela el reset por desconexión y pasa a En camino
          this.orderService.cancelDisconnectReset(String(order.id)).then(() => {
            const enCaminoOrder: Order = { ...ocupadaOrder, status: OrderStatus.EnCamino };
            this.orderService.updateOrder(String(order.id), enCaminoOrder)
              .catch(err => console.error('Error al confirmar la orden:', err));
          });
        } else {
          // Cancela manualmente: cancela el reset y libera la orden
          this.orderService.cancelDisconnectReset(String(order.id)).then(() => {
            const liberadaOrder: Order = { ...order, status: OrderStatus.Pendiente, delivererId: '' };
            this.orderService.updateOrder(String(order.id), liberadaOrder)
              .catch(err => console.error('Error al liberar la orden:', err));
          });
        }
      });

    }).catch(err => console.error('Error al reservar la orden:', err));
  }
}



import { Injectable } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/compat/database';
import { first, map, Observable } from 'rxjs';
import { Order } from '../../features/components/admin/orders/interfaces/Order';
import { equalTo, orderByChild, query, ref } from 'firebase/database';
import { HttpClient } from '@angular/common/http';



@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private ordersPath = '/orders';

  constructor(private db: AngularFireDatabase, public http:HttpClient) {}


  
  // 📌 Crear Pedido
  createOrder(order: Order): void {
    console.log("ddddas");
    
    const newOrderRef = this.db.list(this.ordersPath).push(order); // Genera un ID único
    if (newOrderRef.key) {
      console.log("ddddas");
      this.db.object(`${this.ordersPath}/${newOrderRef.key}`).update({ id: newOrderRef.key }); // Agregar el ID al objeto
      const msgOrderNew = {
        titulo:'Nuevo Pedido',
        mensaje:'Se ha agregado un nuevo pedido'
      }
      this.http.post('https://vercel-nodejs-umber.vercel.app/api/enviarNotificacionMasiva',msgOrderNew).subscribe({
        next:(data)=>{
          console.log(data);
          
        }
      })
    }
  }

  // 📌 Obtener Todos los Pedidos
  getOrders(): Observable<any[]> {
    
    return this.db.list<any>(this.ordersPath).valueChanges();
  }


    getOrdersByField<T>(field: keyof Order, value: T): Observable<Order[]> {
      return this.db.list<Order>(this.ordersPath, ref => 
        ref.orderByChild(field as string).equalTo(value as any)
      ).snapshotChanges().pipe(
        map((changes:any) => changes.map((c:any) => ({
          id: c.payload.key, // Asigna el ID de Firebase a la orden
          ...c.payload.val() as Order
        })))
      );
    }

  // 📌 Obtener Pedido por ID
  getOrder(id: string): Observable<Order | null> {
    return this.db.object<Order>(`${this.ordersPath}/${id}`).valueChanges();
  }

  // 📌 Actualizar Pedido
  updateOrder(id: string, order: Order): Promise<void> {
    return this.db.object(`${this.ordersPath}/${id}`).update(order);
  }

  // 📌 Eliminar Pedido
  deleteOrder(id: string): Promise<void> {
    return this.db.object(`${this.ordersPath}/${id}`).remove();
  }
}

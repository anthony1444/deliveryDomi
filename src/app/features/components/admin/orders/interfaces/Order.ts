export enum OrderStatus {
  Pendiente = 1,
  EnCamino  = 2,
  Entregado = 3,
  Cancelado = 4,
  Ocupada   = 5,
}

export interface Order {
    id?: number;
    orderDate?: string;
    shippedDate?: string;
    totalAmount?: number;
    status: OrderStatus;
    shippingAddress?: string;
    createdAt?: string;
    updatedAt?: string;
    delivererId?: string;
    customerName?:string;
    idNeiborhood?:number
    iduser?:number
    zoneid:number;
    tabulatorid:number;
    phone?:string;
    createdByUserName?:string;
}
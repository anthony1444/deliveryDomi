export interface Order {
    id?: number;
    orderDate?: string;
    shippedDate?: string;
    totalAmount?: number;
    status: number;
    shippingAddress?: string;
    createdAt?: string;
    updatedAt?: string;
    delivererId?: number;
    customerName?:string;
    idNeiborhood?:number
    iduser?:number
    zoneid:number;
    tabulatorid:number;
}
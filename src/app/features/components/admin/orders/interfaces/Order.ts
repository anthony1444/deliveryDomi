export interface Order {
    id?: number;
    orderDate?: string;
    shippedDate?: string;
    totalAmount?: number;
    status: number;
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
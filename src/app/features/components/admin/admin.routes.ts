import { Routes } from '@angular/router';
import { AdminComponent } from './admin.component';
import { permisionsGuard } from '../../../core/services/permisions.guard';

export const routes: Routes = [ 
    { path: '', component:AdminComponent, children:[
        { path: 'order', loadComponent: ()=> import('./orders/order/order.component').then(c => c.OrderComponent), data:[1,2],canActivate:[permisionsGuard]},
        { path: 'createrestaurant', loadComponent: ()=> import('./restaurants/createrestaurant/createrestaurant.component').then(c => c.CreaterestaurantComponent), data:[1],canActivate:[permisionsGuard]},
        { path: 'orders', loadComponent: ()=> import('./orders/orders/orders.component').then(c => c.OrdersComponent),data:[1,2,3]  ,canActivate:[permisionsGuard]},
        { path: 'myorders', loadComponent: ()=> import('./orders/myorders/myorders.component').then(c => c.MyOrdersComponent),data:[1,2,3]  ,canActivate:[permisionsGuard]},
        { path: 'tabulators',loadComponent: ()=> import('./tabulators/tabulators.component').then(c=>c.TabulatorsComponent),data:[1,2,3]  ,canActivate:[permisionsGuard]},
        { path: '',loadComponent: ()=> import('./home/home.component').then(c=>c.HomeComponent) ,data:[1,2,3] ,canActivate:[permisionsGuard]},
       

    ]}
];

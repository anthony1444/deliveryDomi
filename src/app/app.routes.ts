import { Routes } from '@angular/router';
import { LoginComponent } from './features/components/login/login/login.component';
import { routes as adminRoutes } from './features/components/admin/admin.routes';
import { CreateComponent } from './features/components/login/create/create.component';
import { authGuard } from './core/services/auth.guard';
import { loginGuard } from './core/services/login.guard';

export const routes: Routes = [
    { path:'', children: adminRoutes,canActivate:[authGuard]},
    { path:'login', component: LoginComponent,canActivate:[loginGuard]},
    { path:'create', component: CreateComponent,canActivate:[loginGuard]}
];


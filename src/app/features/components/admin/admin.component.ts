import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatSidenav, MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { Router, RouterModule, RouterOutlet } from '@angular/router';
import { routes } from './admin.routes';
import { AuthService } from '../../../auth/services/auth.service';
import { User } from '../../interfaces/authresponse.interface';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  imports: [
    MatSidenavModule,
    MatToolbarModule,
    MatIconModule,
    MatListModule,
    MatButtonModule,
    CommonModule,
    RouterOutlet,
    ReactiveFormsModule
  ],
  standalone: true
})
export class AdminComponent {

  opened = false;
  navLinks = [
    { path: '/', label: 'Home', data:[1,2,3],  },
    { path: '/order', label: 'Crear Pedido',data:[1,2] },
    { path: '/orders', label: 'Pedidos', data:[1,3] },
    { path: '/tabulators', label: 'Tabuladores', data:[1] },
  ];
  user: User;
  constructor(public router: Router, public authService:AuthService) {
      this.user =  JSON.parse(localStorage.getItem('user') ?? '') as User;
  }

  onNavItemClick(sidenav: MatSidenav, path: string): void {
    sidenav.close();
    this.router.navigate([path]);

  }

  validatePermisions(data:any){
    const permisions = data.data as Array<number>
    const hasPermision = permisions.find(e=>e==Number(this.user.typeUser))

    if (!hasPermision) {
      return false
    }
    return true
    
  }  
  logOut() {
    this.authService.logout()
  

    
    this.router.navigate(['login'])
  }
}

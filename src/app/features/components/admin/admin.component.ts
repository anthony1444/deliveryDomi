import { CommonModule } from '@angular/common';
import { Component, HostListener, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatSidenav, MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { Router, RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../auth/services/auth.service';
import { User } from '../../interfaces/authresponse.interface';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss'],
  imports: [
    MatSidenavModule,
    MatToolbarModule,
    MatIconModule,
    MatListModule,
    MatButtonModule,
    CommonModule,
    RouterOutlet,
    ReactiveFormsModule,
    RouterLink,
    RouterLinkActive
  ],
  standalone: true
})
export class AdminComponent implements OnInit {
  opened = false;
  isMobile = false;
  user: User | null = null;


  navLinks = [
    { path: '/', label: 'Home', icon: 'home', data: [1, 2, 3] },
    { path: '/order', label: 'Crear Pedido', icon: 'add_shopping_cart', data: [1, 2] },
    { path: '/orders', label: 'Pedidos', icon: 'shopping_cart', data: [1, 3] },
    { path: '/myorders', label: 'Mis Pedidos', icon: 'view_list', data: [1, 3] },
    { path: '/tabulators', label: 'Tabuladores', icon: 'table_chart', data: [1] },
    { path: '/createrestaurant', label: 'Crear Restaurantes', icon: 'restaurant_menu', data: [1] },
  ];

  constructor(public router: Router, public authService: AuthService) {}

  ngOnInit(): void {
    this.loadUser();
    this.checkScreenSize();
  }

  private loadUser(): void {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        this.user = JSON.parse(storedUser) as User;
      } catch (error) {
        console.error('Error parsing user data:', error);
        this.user = null;
      }
    }
  }

  @HostListener('window:resize', [])
  checkScreenSize(): void {
    this.isMobile = window.innerWidth < 768;
  }

  validatePermisions(data: any): boolean {
    if (!this.user) return false;
    return data.data.includes(Number(this.user.typeUser));
  }

  async logOut(): Promise<void> {
    await this.authService.logout();
    this.router.navigate(['login']);
  }
}

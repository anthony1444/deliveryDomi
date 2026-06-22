import { Component, ChangeDetectorRef } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatLabel } from '@angular/material/form-field';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatSidenavModule } from '@angular/material/sidenav';
import { RouterModule } from '@angular/router';
import { FormControl } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../../auth/services/auth.service';
import { MessagingService } from '../../../../messaging/messaging.service';

@Component({
  selector: 'app-login',
  imports: [
    RouterModule,
    CommonModule,
    MatButtonModule,
    MatInputModule,
    MatGridListModule,
    MatFormFieldModule,
    MatLabel,
    MatCardModule,
    MatIconModule,
    MatSidenavModule,
    ReactiveFormsModule,
  ],
  standalone: true,
  providers: [AuthService],
  templateUrl: './login.component.html',
  styleUrl: 'login.component.scss'
})
export class LoginComponent {

  email: FormControl = new FormControl('');
  password: FormControl = new FormControl('');
  showPassword = false;
  loginError = '';

  constructor(
    private authService: AuthService,
    public route: Router,
    public messagingService: MessagingService,
    private cdr: ChangeDetectorRef
  ) {}

  login() {
    this.loginError = '';
    this.authService.login(this.email.value, this.password.value)
      .then(() => {
        const userData = this.authService.getUserData();
        if (userData) {
          userData.subscribe(async data => {
            if (data) {
              try {
                const tokenGenerated = await this.messagingService.obtenerTokenPush();
                const dataUser = data as any;
                const tokenpush = localStorage.getItem('tokenpush') ?? (tokenGenerated ?? '');
                dataUser.tokenpush = tokenpush;
                localStorage.setItem('user', JSON.stringify(dataUser));

                await this.authService.updateUser(dataUser.uid, { tokenpush });
                this.route.navigate(['']);
              } catch (error) {
                console.error('❌ Error updating user or getting token:', error);
              }
            }
          });
        }
      })
      .catch((error: any) => {
        const code: string = error?.code ?? '';
        if (code === 'auth/invalid-credential' || code === 'auth/wrong-password' || code === 'auth/user-not-found') {
          this.loginError = 'Correo o contraseña incorrectos.';
        } else if (code === 'auth/invalid-email') {
          this.loginError = 'El correo ingresado no es válido.';
        } else if (code === 'auth/too-many-requests') {
          this.loginError = 'Demasiados intentos fallidos. Intenta más tarde.';
        } else if (code === 'auth/network-request-failed') {
          this.loginError = 'Sin conexión a internet. Verifica tu red.';
        } else {
          this.loginError = 'Ocurrió un error al iniciar sesión. Intenta de nuevo.';
        }
        this.cdr.detectChanges();
      });
  }

  goToCreate() {
    this.route.navigate(['create']);
  }
}

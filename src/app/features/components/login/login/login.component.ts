import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatLabel } from '@angular/material/form-field';
import { MatCardModule } from '@angular/material/card';
import { MatSidenavModule } from '@angular/material/sidenav';
import { Route, RouterModule } from '@angular/router';
import { FormControl } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { AuthResponse } from '../../../interfaces/authresponse.interface';
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
        MatSidenavModule,
        ReactiveFormsModule,
    ],
    standalone:true,
    providers: [AuthService],
    templateUrl: './login.component.html',
    styleUrl: 'login.component.scss'
})
export class LoginComponent {

  email: FormControl = new FormControl('');
  password: FormControl = new FormControl('');

  constructor(private authService: AuthService, public route:Router, public messagingService: MessagingService) {
    const userData = this.authService.getUserData();
   
    
  }

  login() {
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
                
                await this.authService.updateUser(dataUser.uid, {
                  tokenpush: tokenpush,
                });

                this.route.navigate(['']);
              } catch (error) {
                console.error('❌ Error updating user or getting token:', error);
              }
            }
          });
        } else {
            console.error('❌ User data not available after login.');
        }
      })
      .catch(error => console.error('❌ Error en login:', error));
  }

  

  // register() {
  //   this.authService.register(this.email.value, this.password.value)
  //     .then(() => console.log('✅ Registro exitoso'))
  //     .catch(error => console.error('❌ Error en registro:', error));
  // }

  goToCreate() {
    this.route.navigate(['create'])
  }
    
}

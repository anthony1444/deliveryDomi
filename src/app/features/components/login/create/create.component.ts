import { Component } from '@angular/core';
import { MatButtonModule, MatIconButton } from '@angular/material/button';
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
import { MatIconModule } from '@angular/material/icon';


@Component({
    selector: 'app-create',
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
        MatIconModule
    ],
    standalone:true,
    providers: [AuthService],
    templateUrl: './create.component.html',
    styleUrl: '/create.component.scss'
})
export class CreateComponent {

  name = new FormControl('');
  email = new FormControl('');
  phone = new FormControl('');
  password = new FormControl('');

  constructor(private authService: AuthService, public route:Router) {}

  register() {
    const name = this.name.value!;
    const email = this.email.value!;
    const phone = this.phone.value!;
    const password = this.password.value!;

    this.authService.register(email, password, name, phone,3)
      .then(() =>{ console.log('✅ Registro exitoso')
      this.goToLogin()
      this.name = new FormControl('');
      this.email = new FormControl('');
      this.phone = new FormControl('');
      this.password = new FormControl('');
      }
    
     
    )
      .catch(error => console.error('❌ Error en registro:', error));
  }
  goToLogin() {
    this.route.navigate(['login'])
  }
}

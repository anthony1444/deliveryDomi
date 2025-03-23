import { Component, inject } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../../../auth/services/auth.service';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { collection, Firestore, getDocs } from '@angular/fire/firestore';
import { MatSelectModule } from '@angular/material/select';

@Component({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    MatCardModule,
    MatIconModule,
    MatSelectModule
],
standalone:true,
providers: [AuthService],
  selector: 'app-createrestaurant',
  templateUrl: './createrestaurant.component.html',
  // styles: [':host{display:contents}'], // Makes component host as if it was not there, can offer less css headaches. Use @HostBinding class approach for easier overrides.
  // host: { class: 'contents' },
})
export class CreaterestaurantComponent {
  name = new FormControl('');
  email = new FormControl('');
  phone = new FormControl('');
  password = new FormControl('');
  tabulatorid = new FormControl('');
  tabuladores?:any[] 
  private firestore: Firestore = inject(Firestore);
  tabuladorSeleccionado: any;
  tabulatoridSelected: number = 0;


  constructor(private authService: AuthService, private router: Router) {

    const snapshot =  getDocs(collection(this.firestore, 'tabuladores'));
    snapshot.then(data=>{
      const tabuladores = data.docs.map(doc => ({
        id: doc.id, 
        ...doc.data()
      }));
      this.tabuladores = tabuladores 
      console.log('Tabuladores:', tabuladores);

    })
  }

  registerUser() {
    const name = this.name.value!;
    const email = this.email.value!;
    const phone = this.phone.value!;
    const password = this.password.value!;
    
    const typeUser = 2;

    this.authService.registerUserTypeRestaurant(email, password, name, phone, typeUser,this.tabulatoridSelected)
      .then(() => {
        console.log('✅ Usuario creado con éxito');
        this.goToLogin();
        this.clearForm();
      })
      .catch((error:any) => console.error('❌ Error en la creación de usuario:', error));
  }

  goToLogin() {
    this.router.navigate(['login']);
  }

  clearForm() {
    this.name.reset();
    this.email.reset();
    this.phone.reset();
    this.password.reset();
  }

  seleccionarTabulador(idtabulador: number) {
    
    this.tabuladorSeleccionado = this.tabuladores?.find(e=> e.id == idtabulador);
    this.tabulatoridSelected = this.tabuladorSeleccionado.id;
  }
}

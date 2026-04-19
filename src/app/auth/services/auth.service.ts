import { Injectable } from '@angular/core';
import { Auth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, updateProfile, User, authState, onAuthStateChanged } from '@angular/fire/auth';
import { Firestore, collection, doc, docData, getDoc, getDocs, query, setDoc, updateDoc, where } from '@angular/fire/firestore';
import { Observable, of, switchMap } from 'rxjs';
import { User as AppUser } from '../../features/interfaces/authresponse.interface';


export interface UserInfo {
    uid: string;
    email: string;
    name: string;
    role: string;
  }

@Injectable({
  providedIn: 'root'
})
export class AuthService {
private user: User | null = null; // Guarda la sesión del usuario
private usersPath = 'users'; // Ruta en Firebase

  constructor(private auth: Auth, private firestore: Firestore) {

    onAuthStateChanged(this.auth, (user: User | null) => {
        console.log('🔥 Usuario detectado:', user?.providerData);
        this.user =  user
      });
  }

  // 📌 Registrar usuario
//   register(email: string, password: string) {
//     return createUserWithEmailAndPassword(this.auth, email, password);
//   }

  async register(email: string, password: string, name: string, phone: string, typeUser:number) {
    const userCredential = await createUserWithEmailAndPassword(this.auth, email, password);
    const user = userCredential.user;

    // ✅ Actualizar nombre en Firebase Auth
    await updateProfile(user, { displayName: name });

    // ✅ Guardar perfil con más datos en Firestore
    return setDoc(doc(this.firestore, `users/${user.uid}`), {
      uid: user.uid,
      email: user.email,
      name: name,
      phone: phone,
      typeUser: typeUser, 
      address:'',
      createdAt: new Date(),
      tokenpush:localStorage.getItem('tokenpush')
    });
  }

  async registerUserTypeRestaurant(email: string, password: string, name: string, phone: string, typeUser:number, tabulatorid: string | number) {
    const userCredential = await createUserWithEmailAndPassword(this.auth, email, password);
    const user = userCredential.user;

    // ✅ Actualizar nombre en Firebase Auth
    await updateProfile(user, { displayName: name });

    // ✅ Guardar perfil con más datos en Firestore
    return setDoc(doc(this.firestore, `users/${user.uid}`), {
      uid: user.uid,
      email: user.email,
      name: name,
      phone: phone,
      typeUser: typeUser, 
      address:'',
      tabulatorid:tabulatorid,
      createdAt: new Date(),
      tokenpush:localStorage.getItem('tokenpush')
    });
  }

  async updateUser(uid: string, data: Partial<{ name: string; phone: string; typeUser: number; address: string; tokenpush:string }>) {
    try {
      // Referencia al documento del usuario en Firestore
      const userRef = doc(this.firestore, `users/${uid}`);
  
      // Actualizar solo los campos proporcionados
      await updateDoc(userRef, data);
  
      console.log("✅ Usuario actualizado correctamente");
    } catch (error) {
      console.error("❌ Error al actualizar usuario:", error);
    }
  }

  getUserData() {
    return authState(this.auth).pipe(
      switchMap(async user => {  
        console.log(user);
        
        if (user) {
          const userDocRef = doc(this.firestore, `users/${user.uid}`);
          const docSnap = await getDoc(userDocRef);
          console.log(docSnap.data());
          
          return  docSnap.data();
        }
        return of(null);
      })
    );
  }

    // 📌 Obtener datos del usuario logueado en tiempo real

  // 📌 Iniciar sesión
  login(email: string, password: string) {
    return signInWithEmailAndPassword(this.auth, email, password);
  }

  // 📌 Verifica si el usuario está autenticado
  isLoggedIn(): boolean {
    const user = localStorage.getItem('user');
    console.log(user);
    
    // Check if the user data is valid before parsing it
    if (user) {
      try {
        return (JSON.parse(user) == null) ? false : true;
      } catch (e) {
        console.error('Error parsing JSON:', e);
        return false;
      }
    }
    
    return false; // Return false if no user data exists
  }
  

  // 📌 Cerrar sesión
  logout() {
    localStorage.removeItem('user')
    return this.auth.signOut();
  }

  getCurrentUser(): AppUser | null {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        return JSON.parse(storedUser) as AppUser;
      } catch (error) {
        console.error('Error parsing user data from localStorage:', error);
        return null;
      }
    }
    return null;
  }

  validatePermisions(item: { data: number[] }): boolean {
    const user = this.getCurrentUser();
    if (!user || !user.typeUser) {
      return false;
    }
    return item.data.includes(Number(user.typeUser));
  }
}

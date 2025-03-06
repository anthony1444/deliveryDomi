import { inject, Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, CanActivateFn, Router } from '@angular/router';
import { Auth } from '@angular/fire/auth';
import { AuthService } from '../../auth/services/auth.service';
import { User } from '../../features/interfaces/authresponse.interface';

export const permisionsGuard:CanActivateFn  = (route, state) => {
    console.log("aa");
    const router = inject(Router);

    const user:User =  JSON.parse(localStorage.getItem('user') ?? '') as User;
    console.log(route.data);
    
    const permisions = Object.values(route.data);
    console.log(user);
    
    const hasPermision = permisions.find(e=>e==user.typeUser)
    console.log(hasPermision);
    
    if (!hasPermision) {
        return false;
    }
    
    
    return  true;
  };

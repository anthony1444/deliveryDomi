import { inject, Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { Auth } from '@angular/fire/auth';
import { AuthService } from '../../auth/services/auth.service';

export const authGuard = () => {
    const authService = inject(AuthService);
    const router = inject(Router);

    const isLoggedIn = authService.isLoggedIn()
    console.log(isLoggedIn);
    
    if (!isLoggedIn) {
        router.navigate(['login'])
    }
    return  true;
  };

import { inject } from '@angular/core';
import { Router } from '@angular/router';

export const authGuard = () => {
  const router = inject(Router);

  const raw = localStorage.getItem('user');
  if (!raw) {
    router.navigate(['/login']);
    return false;
  }

  try {
    const user = JSON.parse(raw);
    // Si el objeto guardado no tiene uid o typeUser, la sesión está corrupta → limpiar
    if (!user || !user.uid || !user.typeUser) {
      localStorage.clear();
      router.navigate(['/login']);
      return false;
    }
    return true;
  } catch {
    localStorage.clear();
    router.navigate(['/login']);
    return false;
  }
};

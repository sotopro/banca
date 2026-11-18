import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Sesion } from './sesion';

export const authGuard: CanActivateFn = (route, state) => {
 const sesion = inject(Sesion);
 return sesion.token() ? true : inject(Router).createUrlTree(['/auth/login']);
};

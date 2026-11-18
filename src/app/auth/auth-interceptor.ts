import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { Sesion } from './sesion';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { inject } from '@angular/core';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const sesion = inject(Sesion);
  const router = inject(Router);
  const token = sesion.token();
  
  const peticion = token
  ? req.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`
    }
  })
  : req;
  
  return next(peticion).pipe(
    catchError((err: HttpErrorResponse) => {
      if(err.status === 401) {
        sesion.cerrar();
        router.navigate(['/auth/login']);
      }
      return throwError(() => err);
    })
  )
};

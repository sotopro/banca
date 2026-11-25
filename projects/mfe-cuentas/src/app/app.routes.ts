import { Routes } from '@angular/router';
import { CUENTAS_ROUTES } from './cuentas/cuentas.routes';

/** Rutas del modo aislado (`ng serve mfe-cuentas`). Imitan cómo las monta el shell. */
export const routes: Routes = [
  { path: 'cuentas', children: CUENTAS_ROUTES },
  { path: '', redirectTo: '/cuentas', pathMatch: 'full' },
];

import { Routes } from '@angular/router';
import { TRANSFERENCIAS_ROUTES } from './transferencias/transferencias.routes';

/** Rutas del modo aislado (`ng serve mfe-transferencias`). Imitan cómo las monta el shell. */
export const routes: Routes = [
  { path: 'transferencias', children: TRANSFERENCIAS_ROUTES },
  { path: '', redirectTo: '/transferencias', pathMatch: 'full' },
];

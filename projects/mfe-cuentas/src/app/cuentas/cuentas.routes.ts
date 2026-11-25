import { Routes } from '@angular/router';
import { ListarCuentas } from './listar-cuentas/listar-cuentas';
import { Detalle } from './detalle/detalle';

/** Expuesto como `./Routes`. El shell lo monta bajo `/cuentas`. */
export const CUENTAS_ROUTES: Routes = [
  { path: '', component: ListarCuentas },
  { path: ':id', component: Detalle },
];

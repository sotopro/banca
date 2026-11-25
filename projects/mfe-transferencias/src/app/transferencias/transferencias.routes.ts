import { Routes } from '@angular/router';
import { NuevaTransferencia } from './nueva-transferencia/nueva-transferencia';

/** Expuesto como `./Routes`. El shell lo monta bajo `/transferencias`. */
export const TRANSFERENCIAS_ROUTES: Routes = [{ path: '', component: NuevaTransferencia }];

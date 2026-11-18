import { Routes } from '@angular/router';
import { ListarCuentas } from './cuentas/listar-cuentas/listar-cuentas';
import { Login } from './auth/login/login';
import { authGuard } from './auth/auth-guard';

export const routes: Routes = [
    { path: 'auth/login', component: Login },
    { path: 'cuentas', component: ListarCuentas, canActivate: [authGuard] },
    { path: '', redirectTo: '/cuentas', pathMatch: 'full' },
];

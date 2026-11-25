import { Routes } from '@angular/router';
import type { NativeFederationResult } from '@angular-architects/native-federation';
import { authGuard } from '@banca/core';
import { Login } from './auth/login/login';
import { ModuloNoDisponible } from './modulo-no-disponible/modulo-no-disponible';

export type CargarModuloRemoto = NativeFederationResult['loadRemoteModule'];

/** Nombre del remoto en el manifiesto y nombre del export de rutas que expone en `./Routes`. */
export const REMOTOS = {
  cuentas: { remoto: 'mfe-cuentas', exportacion: 'CUENTAS_ROUTES', titulo: 'Cuentas' },
  transferencias: {
    remoto: 'mfe-transferencias',
    exportacion: 'TRANSFERENCIAS_ROUTES',
    titulo: 'Transferencias',
  },
} as const;

type Remoto = (typeof REMOTOS)[keyof typeof REMOTOS];

/**
 * Carga las rutas que expone un remoto. Si el remoto no responde o no exporta
 * lo esperado, devuelve una ruta que muestra "módulo no disponible" en vez de
 * romper la navegación.
 */
export async function cargarRutasRemotas(
  cargar: CargarModuloRemoto,
  remoto: Remoto,
): Promise<Routes> {
  try {
    const modulo = await cargar<Record<string, unknown>>(remoto.remoto, './Routes');
    const rutas = modulo?.[remoto.exportacion];
    if (!Array.isArray(rutas)) {
      throw new Error(`${remoto.remoto} no exporta ${remoto.exportacion} en ./Routes`);
    }
    return rutas as Routes;
  } catch (error) {
    console.error(`No se pudo cargar ${remoto.remoto}`, error);
    return [{ path: '**', component: ModuloNoDisponible, data: { modulo: remoto.titulo } }];
  }
}

export const crearRutas = (cargar: CargarModuloRemoto): Routes => [
  { path: 'auth/login', component: Login, title: 'Ingresar · Banca' },
  {
    path: 'cuentas',
    canActivate: [authGuard],
    title: 'Cuentas · Banca',
    loadChildren: () => cargarRutasRemotas(cargar, REMOTOS.cuentas),
  },
  {
    path: 'transferencias',
    canActivate: [authGuard],
    title: 'Transferencias · Banca',
    loadChildren: () => cargarRutasRemotas(cargar, REMOTOS.transferencias),
  },
  { path: '', redirectTo: '/cuentas', pathMatch: 'full' },
  { path: '**', redirectTo: '/cuentas' },
];

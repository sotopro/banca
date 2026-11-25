import {
  ApplicationConfig,
  InjectionToken,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import type { NativeFederationResult } from '@angular-architects/native-federation';
import { authInterceptor, ENTORNO, Entorno, provideLocaleBanca } from '@banca/core';
import { CargarModuloRemoto, crearRutas } from './app.routes';

/** Resultado de initFederation. Es null si el manifiesto no se pudo cargar. */
export const FEDERACION = new InjectionToken<NativeFederationResult | null>('FEDERACION');

export function cargadorDe(federacion: NativeFederationResult | null): CargarModuloRemoto {
  if (federacion) {
    return federacion.loadRemoteModule;
  }
  return (remoto: string) =>
    Promise.reject(
      new Error(`Native Federation no está inicializado; no se puede cargar ${remoto}`),
    );
}

export function crearAppConfig(
  federacion: NativeFederationResult | null,
  entorno: Entorno,
): ApplicationConfig {
  return {
    providers: [
      provideBrowserGlobalErrorListeners(),
      provideRouter(crearRutas(cargadorDe(federacion)), withComponentInputBinding()),
      provideHttpClient(withInterceptors([authInterceptor])),
      provideLocaleBanca(),
      { provide: ENTORNO, useValue: entorno },
      { provide: FEDERACION, useValue: federacion },
    ],
  };
}

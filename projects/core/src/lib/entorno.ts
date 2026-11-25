import { InjectionToken } from '@angular/core';

export type NombreEntorno = 'local' | 'dev' | 'qas' | 'prod';
/** Mismos niveles que acepta el orchestrator de Native Federation. */
export type NivelLog = 'debug' | 'warn' | 'error';

/** Configuración que cambia por entorno. Se lee de `env.config.json` al arrancar. */
export interface Entorno {
  entorno: NombreEntorno;
  apiUrl: string;
  logLevel: NivelLog;
}

export const ENTORNO_LOCAL: Entorno = { entorno: 'local', apiUrl: '/api', logLevel: 'debug' };

/**
 * El shell lo provee con el valor leído de `env.config.json`.
 * Un remoto que corre aislado (`ng serve mfe-*`) usa el valor local.
 */
export const ENTORNO = new InjectionToken<Entorno>('ENTORNO', {
  providedIn: 'root',
  factory: () => ENTORNO_LOCAL,
});

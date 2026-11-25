// Se ejecuta antes de initFederation: solo puede importar tipos, nunca código
// compartido (@angular/*, @banca/core), porque el import map todavía no existe.
import type { Entorno, NivelLog, NombreEntorno } from '@banca/core';

const ENTORNOS: readonly NombreEntorno[] = ['local', 'dev', 'qas', 'prod'];
const NIVELES: readonly NivelLog[] = ['debug', 'warn', 'error'];

export const ENTORNO_POR_DEFECTO: Entorno = { entorno: 'local', apiUrl: '/api', logLevel: 'debug' };

export function validarEntorno(valor: unknown): Entorno {
  if (typeof valor !== 'object' || valor === null) {
    throw new Error('env.config.json debe ser un objeto');
  }
  const { entorno, apiUrl, logLevel } = valor as Record<string, unknown>;
  if (!ENTORNOS.includes(entorno as NombreEntorno)) {
    throw new Error(`entorno inválido: ${String(entorno)}. Usa ${ENTORNOS.join(', ')}`);
  }
  if (typeof apiUrl !== 'string' || apiUrl.trim() === '') {
    throw new Error('apiUrl es obligatorio');
  }
  if (!NIVELES.includes(logLevel as NivelLog)) {
    throw new Error(`logLevel inválido: ${String(logLevel)}. Usa ${NIVELES.join(', ')}`);
  }
  return {
    entorno: entorno as NombreEntorno,
    apiUrl: apiUrl.replace(/\/+$/, ''),
    logLevel: logLevel as NivelLog,
  };
}

/**
 * Lee la configuración del entorno desplegado. Si el archivo falta o es inválido,
 * avisa en consola y usa la configuración local para que el shell igual arranque.
 */
export async function cargarEntorno(
  url = 'env.config.json',
  fetchFn: typeof fetch = (...args) => fetch(...args),
): Promise<Entorno> {
  try {
    const respuesta = await fetchFn(url, { cache: 'no-store' });
    if (!respuesta.ok) {
      throw new Error(`HTTP ${respuesta.status} al leer ${url}`);
    }
    return validarEntorno(await respuesta.json());
  } catch (error) {
    console.warn('Se usará la configuración local.', error);
    return ENTORNO_POR_DEFECTO;
  }
}

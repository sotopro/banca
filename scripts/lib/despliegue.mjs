// Lógica pura del paso de despliegue. La usa scripts/preparar-despliegue.mjs y
// se prueba en scripts/lib/despliegue.spec.mjs.
import { createHash } from 'node:crypto';

export const ENTORNOS = ['dev', 'qas', 'prod'];
export const NIVELES_LOG = ['debug', 'warn', 'error'];

/** Hash SRI (sha384, base64) de los bytes exactos que servirá el remoto. */
export function calcularIntegridad(bytes) {
  return `sha384-${createHash('sha384').update(bytes).digest('base64')}`;
}

export function validarEntornoDespliegue(entorno, config) {
  if (!ENTORNOS.includes(entorno)) {
    throw new Error(`Entorno desconocido "${entorno}". Usa: ${ENTORNOS.join(', ')}`);
  }
  if (config?.entorno !== entorno) {
    throw new Error(`deploy/env/${entorno}.json declara entorno "${config?.entorno}"`);
  }
  if (typeof config.apiUrl !== 'string' || config.apiUrl.trim() === '') {
    throw new Error(`deploy/env/${entorno}.json: apiUrl es obligatorio`);
  }
  if (!NIVELES_LOG.includes(config.logLevel)) {
    throw new Error(`deploy/env/${entorno}.json: logLevel debe ser ${NIVELES_LOG.join(', ')}`);
  }
  return config;
}

/**
 * Normaliza el manifiesto del entorno y, si `sri` está activo, agrega `integrity`
 * a cada remoto con el hash de su remoteEntry.json compilado.
 *
 * @param {Record<string, string | {url: string, integrity?: string}>} manifiesto
 * @param {{ remotosEsperados: string[], sri: boolean, leerRemoteEntry: (remoto: string) => Buffer }} opciones
 */
export function construirManifiesto(manifiesto, { remotosEsperados, sri, leerRemoteEntry }) {
  const nombres = Object.keys(manifiesto ?? {});
  const faltantes = remotosEsperados.filter((r) => !nombres.includes(r));
  if (faltantes.length) {
    throw new Error(`Faltan remotos en el manifiesto: ${faltantes.join(', ')}`);
  }
  const desconocidos = nombres.filter((r) => !remotosEsperados.includes(r));
  if (desconocidos.length) {
    throw new Error(`Remotos desconocidos en el manifiesto: ${desconocidos.join(', ')}`);
  }

  const resultado = {};
  for (const remoto of nombres) {
    const entrada = manifiesto[remoto];
    const url = typeof entrada === 'string' ? entrada : entrada?.url;
    if (
      typeof url !== 'string' ||
      !/^https?:\/\/|^\//.test(url) ||
      !url.endsWith('/remoteEntry.json')
    ) {
      throw new Error(`URL inválida para ${remoto}: ${url}. Debe terminar en /remoteEntry.json`);
    }
    resultado[remoto] = sri ? { url, integrity: calcularIntegridad(leerRemoteEntry(remoto)) } : url;
  }
  return resultado;
}

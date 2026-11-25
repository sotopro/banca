#!/usr/bin/env node
// Prepara el shell compilado para un entorno, sin recompilar (build once, deploy many).
//
//   node scripts/preparar-despliegue.mjs <dev|qas|prod> [--dist dist]
//
// 1. Valida deploy/env/<entorno>.json y lo copia como env.config.json.
// 2. Valida deploy/manifests/<entorno>.json y lo copia como federation.manifest.json.
//    En prod agrega el hash SRI de cada remoteEntry.json (dist/<remoto>/browser).
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { construirManifiesto, validarEntornoDespliegue } from './lib/despliegue.mjs';

const REMOTOS = ['mfe-cuentas', 'mfe-transferencias'];

const args = process.argv.slice(2);
const entorno = args[0];
const indiceDist = args.indexOf('--dist');
const dist = indiceDist >= 0 ? args[indiceDist + 1] : 'dist';

const leerJson = (ruta) => {
  if (!existsSync(ruta)) throw new Error(`No existe ${ruta}`);
  return JSON.parse(readFileSync(ruta, 'utf8'));
};

try {
  const config = validarEntornoDespliegue(entorno, leerJson(`deploy/env/${entorno}.json`));
  const salidaShell = join(dist, 'banca', 'browser');
  if (!existsSync(join(salidaShell, 'index.html'))) {
    throw new Error(
      `No encontré el shell compilado en ${salidaShell}. Ejecuta "npm run build" primero.`,
    );
  }

  const manifiesto = construirManifiesto(leerJson(`deploy/manifests/${entorno}.json`), {
    remotosEsperados: REMOTOS,
    sri: entorno === 'prod',
    leerRemoteEntry: (remoto) => readFileSync(join(dist, remoto, 'browser', 'remoteEntry.json')),
  });

  writeFileSync(join(salidaShell, 'env.config.json'), JSON.stringify(config, null, 2) + '\n');
  writeFileSync(
    join(salidaShell, 'federation.manifest.json'),
    JSON.stringify(manifiesto, null, 2) + '\n',
  );

  console.log(`Shell listo para ${entorno} en ${salidaShell}`);
  for (const [remoto, entrada] of Object.entries(manifiesto)) {
    const { url, integrity } = typeof entrada === 'string' ? { url: entrada } : entrada;
    console.log(`  ${remoto} → ${url}${integrity ? `  (${integrity.slice(0, 20)}…)` : ''}`);
  }
} catch (error) {
  console.error(`Error: ${error.message}`);
  process.exit(1);
}

#!/usr/bin/env node
// json-server escribe en el archivo que sirve. Para no ensuciar el repositorio,
// la API mock trabaja sobre tmp/db.json (ignorado por git), copiado de db.json.
//   node scripts/preparar-api.mjs           crea tmp/db.json si no existe
//   node scripts/preparar-api.mjs --reset   lo vuelve a copiar desde db.json
import { copyFileSync, existsSync, mkdirSync } from 'node:fs';

const destino = 'tmp/db.json';
const reset = process.argv.includes('--reset');

mkdirSync('tmp', { recursive: true });
if (reset || !existsSync(destino)) {
  copyFileSync('db.json', destino);
  console.log(`API mock: ${destino} creado desde db.json`);
} else {
  console.log(`API mock: usando ${destino} (npm run api:reset para reiniciar los datos)`);
}

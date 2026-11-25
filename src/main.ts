import { initFederation, type NativeFederationResult } from '@angular-architects/native-federation';
import { cargarEntorno } from './arranque/cargar-entorno';

async function iniciar() {
  const entorno = await cargarEntorno('env.config.json');

  let federacion: NativeFederationResult | null = null;
  try {
    federacion = await initFederation('federation.manifest.json', {
      hostRemoteEntry: { url: './remoteEntry.json' },
      logLevel: entorno.logLevel,
    });
  } catch (error) {
    // Sin manifiesto el shell igual arranca: login funciona y cada módulo
    // remoto muestra la pantalla de "módulo no disponible".
    console.error('No se pudo inicializar Native Federation', error);
  }

  const { bootstrap } = await import('./bootstrap');
  await bootstrap(federacion, entorno);
}

iniciar().catch((err) => console.error('No se pudo iniciar la aplicación', err));

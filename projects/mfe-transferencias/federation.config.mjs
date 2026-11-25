// @ts-check
import {
  withNativeFederation,
  fromPackageJson,
  shareAngularLocales,
} from '@angular-architects/native-federation/config';

export default withNativeFederation({
  name: 'mfe-transferencias',
  exposes: {
    './Routes': './projects/mfe-transferencias/src/app/transferencias/transferencias.routes.ts',
  },

  shared: fromPackageJson({
    singleton: true,
    strictVersion: true,
    requiredVersion: 'auto',
    build: 'package',
  })
    .patch(['@angular/*'], { includeSecondaries: { keepAll: true } })
    // Los locales no son subpath exports de @angular/common: se declaran aparte y
    // van en su mismo bundle. Lo importa @banca/core (provideLocaleBanca).
    .override(shareAngularLocales(['es-PE'], { build: 'package' })),

  // Librería interna del workspace (ruta de tsconfig). Singleton: una sola Sesion.
  sharedMappings: ['@banca/core'],

  skip: ['rxjs/ajax', 'rxjs/fetch', 'rxjs/testing', 'rxjs/webSocket'],

  // https://native-federation.com/docs/v4/angular-adapter/configuration/
  features: {
    denseChunking: true,
    denseExternals: true,
    strictImports: false,
  },
});

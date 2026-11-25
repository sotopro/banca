import { bootstrapApplication } from '@angular/platform-browser';
import type { NativeFederationResult } from '@angular-architects/native-federation';
import type { Entorno } from '@banca/core';
import { crearAppConfig } from './app/app.config';
import { App } from './app/app';

export const bootstrap = (federacion: NativeFederationResult | null, entorno: Entorno) =>
  bootstrapApplication(App, crearAppConfig(federacion, entorno));

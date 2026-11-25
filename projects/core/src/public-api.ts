/*
 * API pública de @banca/core. Shell y remotos la consumen por la ruta de tsconfig
 * y Native Federation la comparte como singleton (sharedMappings).
 */
export * from './lib/auth-guard';
export * from './lib/auth-interceptor';
export * from './lib/entorno';
export * from './lib/locale';
export * from './lib/modelos';
export * from './lib/sesion';

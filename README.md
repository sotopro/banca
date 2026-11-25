# Banca

Banca digital con micro frontends sobre **Angular 22.2** y **Native Federation v4** (Propuesta A: monorepo).

| Proyecto             | Ruta                          | Puerto | Rol                                                                                                                    |
| -------------------- | ----------------------------- | ------ | ---------------------------------------------------------------------------------------------------------------------- |
| `banca`              | `src/`                        | 4200   | Shell (dynamic host): login, sesión, layout, carga de remotos                                                          |
| `mfe-cuentas`        | `projects/mfe-cuentas`        | 4201   | Remoto: listado y detalle de cuentas. Expone `./Routes` → `CUENTAS_ROUTES`                                             |
| `mfe-transferencias` | `projects/mfe-transferencias` | 4202   | Remoto: nueva transferencia. Expone `./Routes` → `TRANSFERENCIAS_ROUTES`                                               |
| `@banca/core`        | `projects/core`               | —      | Librería compartida como singleton: `Sesion`, `authGuard`, `authInterceptor`, `ENTORNO`, `provideLocaleBanca`, modelos |
| API mock             | `db.json`                     | 3000   | `json-server`, servido por el proxy `/api`                                                                             |

## Requisitos

- Node `^22.22.3`, `^24.15.0` o `>=26` (los que soporta Angular CLI 22.2).
- `npm install`

## Desarrollo

```bash
npm start              # API mock + los dos remotos + shell
```

Abre http://localhost:4200. El botón "Ingresar (demo)" crea una sesión de prueba.

Cada pieza también se puede levantar sola:

```bash
npm run api                    # API mock en :3000 (sobre tmp/db.json)
npm run start:cuentas          # http://localhost:4201 en modo aislado
npm run start:transferencias   # http://localhost:4202 en modo aislado
npm run start:shell            # shell en :4200 (necesita los remotos para cargarlos)
npm run api:reset              # vuelve a copiar db.json en tmp/db.json
```

La API mock trabaja sobre `tmp/db.json` (ignorado por git) para que las transferencias de prueba no modifiquen `db.json`.

Si un remoto no está levantado, el shell igual arranca y esa sección muestra "no está disponible" con un botón para reintentar.

## Tests

```bash
npm test               # todos, en secuencia: core, shell, remotos y scripts de despliegue
npm run test:core      # o test:shell, test:cuentas, test:transferencias (modo watch)
npm run test:scripts
```

Cubren el flujo crítico:

- **Sesión y seguridad** (`core`): token en memoria y localStorage, guard, interceptor (Bearer, 401 → logout y login).
- **Arranque del shell**: lectura y validación de `env.config.json`, interceptor registrado en el `HttpClient` del shell, rutas protegidas, carga de remotos y pantalla de "módulo no disponible" si un remoto falla.
- **Cuentas**: listado, total, detalle por `:id`, errores, enlace a transferir.
- **Transferencias**: preselección de origen, validaciones (formato de cuenta/CCI, saldo, misma cuenta), envío, confirmación, error de API.
- **Despliegue**: manifiestos por entorno, hashes SRI, validación de `env.config.json`.

## Build

```bash
npm run build          # mfe-cuentas, mfe-transferencias y banca → dist/<app>/browser
```

Se compila **una vez** y el mismo artefacto se promueve a dev, qas y prod. Lo único que cambia por entorno son dos archivos que lee el shell al arrancar:

| Archivo en el shell        | Fuente                            | Contenido                                                   |
| -------------------------- | --------------------------------- | ----------------------------------------------------------- |
| `federation.manifest.json` | `deploy/manifests/<entorno>.json` | URL del `remoteEntry.json` de cada remoto                   |
| `env.config.json`          | `deploy/env/<entorno>.json`       | `entorno`, `apiUrl`, `logLevel` (`debug`, `warn` o `error`) |

En local se usan `public/federation.manifest.json` y `public/env.config.json`.

## Despliegue

```bash
npm run build
npm run desplegar:qas          # o desplegar:dev, desplegar:prod
```

`scripts/preparar-despliegue.mjs` valida y copia los dos archivos en `dist/banca/browser`. En **prod** agrega a cada remoto el hash SRI (`sha384`) de su `remoteEntry.json` compilado; el orchestrator rechaza el remoto si los bytes servidos no coinciden.

Estructura publicada en cada entorno (la arma el CI en el directorio `sitio/`):

```
/                       ← dist/banca/browser
/mfe/cuentas/           ← dist/mfe-cuentas/browser
/mfe/transferencias/    ← dist/mfe-transferencias/browser
```

`deploy/nginx/banca.conf.template` sirve esa estructura con:

- `no-cache` para `index.html`, `federation.manifest.json`, `env.config.json` y `remoteEntry.json`.
- Caché inmutable para los `.js` y `.css` con hash.
- Proxy `/api/` hacia `API_UPSTREAM`.
- CSP de Trusted Types (`nfo`, `angular`, `angular#bundler`) en modo **report-only**. Cuando `/csp-reports` quede sin violaciones, cambia la cabecera a `Content-Security-Policy` en `deploy/nginx/seguridad.conf`.

### CI (`.github/workflows`)

- `ci.yml`: en cada PR y push corre `npm test` y compila las tres apps en paralelo. En `main` promueve el commit: **dev → qas → prod**.
- `desplegar.yml`: descarga los artefactos del commit, ejecuta `preparar-despliegue` para el entorno y publica el artefacto `banca-<entorno>-<sha>` con el sitio armado.

Para que qas y prod esperen aprobación, crea los environments `dev`, `qas` y `prod` en GitHub (Settings → Environments) y exige revisores en qas y prod.

### Antes del primer despliegue real

- Reemplaza los dominios de ejemplo `*.banca.example.com` en `deploy/manifests/*.json`.
- Ajusta `apiUrl` en `deploy/env/*.json` si la API no está en `/api` del mismo dominio.
- Agrega en `desplegar.yml` el paso que sube `sitio/` a tu hosting (el workflow marca dónde).

## Cómo está armada la federación

- Cada `federation.config.mjs` comparte las dependencias de `package.json` como `singleton` + `strictVersion`, más `@banca/core` (`sharedMappings`) y el locale `es-PE` (`shareAngularLocales`).
- `@banca/core` tiene su propio `package.json` con versión (`1.0.0`). Súbela con semver cuando cambie su API pública.
- El shell lee `env.config.json`, llama a `initFederation('federation.manifest.json')` y pasa el resultado al bootstrap. `loadRemoteModule` llega a las rutas por parámetro y se provee por DI con el token `FEDERACION`.
- `main.ts` del shell no puede importar código compartido (`@angular/*`, `@banca/core`) antes de `initFederation`; solo tipos.
- Los remotos se cargan con `loadChildren`, así que usan el injector del shell: el mismo `HttpClient` con interceptor, la misma `Sesion` y el mismo `ENTORNO`.
- Los remotos se comunican solo por URL (por ejemplo `/transferencias?origen=2`), nunca importando código del otro.

### Agregar un remoto

1. `ng g application mfe-<nombre> --style scss --routing --ssr false`
2. `ng g @angular-architects/native-federation:init --project mfe-<nombre> --port <puerto> --type remote`
3. Copia el `federation.config.mjs` de un remoto existente y expone `./Routes`.
4. Agrega el remoto a `REMOTOS` y a `crearRutas` en `src/app/app.routes.ts`, a los manifiestos (`public/` y `deploy/manifests/`), a `REMOTOS` en `scripts/preparar-despliegue.mjs` y a la matriz de `ci.yml`.

### Actualizar Angular

Angular y `@angular-architects/native-federation` se actualizan juntos, y solo cuando exista un adaptador para la nueva minor (hoy 22.2.x; Angular 22.3 todavía no tiene adaptador):

```bash
ng update @angular/core @angular/cli @angular-architects/native-federation
```

Shell y remotos comparten Angular como singleton estricto, así que se redespliegan los tres. TypeScript se queda en 6.0.x, que es lo que acepta Angular 22.

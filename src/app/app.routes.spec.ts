import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router, Routes, withComponentInputBinding } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { Sesion } from '@banca/core';
import { CargarModuloRemoto, cargarRutasRemotas, crearRutas, REMOTOS } from './app.routes';
import { ModuloNoDisponible } from './modulo-no-disponible/modulo-no-disponible';

@Component({ template: '<h1>Mis Cuentas (remoto)</h1>' })
class CuentasRemoto {}

const RUTAS_CUENTAS: Routes = [{ path: '', component: CuentasRemoto }];

/** Simula el loadRemoteModule de Native Federation. */
function cargadorFalso(modulos: Record<string, unknown>): CargarModuloRemoto {
  return vi.fn(async (remoto: string, expuesto: string) => {
    if (!(remoto in modulos)) {
      throw new Error(`remoteEntry de ${remoto} no responde`);
    }
    expect(expuesto).toBe('./Routes');
    return modulos[remoto];
  }) as unknown as CargarModuloRemoto;
}

describe('cargarRutasRemotas', () => {
  beforeEach(() => vi.spyOn(console, 'error').mockImplementation(() => undefined));

  it('devuelve las rutas que expone el remoto en ./Routes', async () => {
    const cargar = cargadorFalso({ 'mfe-cuentas': { CUENTAS_ROUTES: RUTAS_CUENTAS } });
    await expect(cargarRutasRemotas(cargar, REMOTOS.cuentas)).resolves.toBe(RUTAS_CUENTAS);
    expect(cargar).toHaveBeenCalledWith('mfe-cuentas', './Routes');
  });

  it('devuelve la pantalla de módulo no disponible si el remoto no responde', async () => {
    const rutas = await cargarRutasRemotas(cargadorFalso({}), REMOTOS.transferencias);
    expect(rutas).toEqual([
      { path: '**', component: ModuloNoDisponible, data: { modulo: 'Transferencias' } },
    ]);
  });

  it('devuelve la pantalla de módulo no disponible si el remoto no exporta las rutas esperadas', async () => {
    const cargar = cargadorFalso({ 'mfe-cuentas': { OTRAS_RUTAS: [] } });
    const rutas = await cargarRutasRemotas(cargar, REMOTOS.cuentas);
    expect(rutas[0].component).toBe(ModuloNoDisponible);
  });
});

describe('rutas del shell', () => {
  async function iniciar(modulos: Record<string, unknown>) {
    localStorage.clear();
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    TestBed.configureTestingModule({
      providers: [provideRouter(crearRutas(cargadorFalso(modulos)), withComponentInputBinding())],
    });
    return RouterTestingHarness.create();
  }

  it('sin sesión, /cuentas redirige al login', async () => {
    const harness = await iniciar({ 'mfe-cuentas': { CUENTAS_ROUTES: RUTAS_CUENTAS } });
    await harness.navigateByUrl('/cuentas');
    expect(TestBed.inject(Router).url).toBe('/auth/login');
  });

  it('con sesión, la raíz lleva a /cuentas y monta el remoto', async () => {
    const harness = await iniciar({ 'mfe-cuentas': { CUENTAS_ROUTES: RUTAS_CUENTAS } });
    TestBed.inject(Sesion).iniciar('abc');
    await harness.navigateByUrl('/');
    expect(TestBed.inject(Router).url).toBe('/cuentas');
    expect(harness.routeNativeElement?.textContent).toContain('Mis Cuentas (remoto)');
  });

  it('con sesión, si el remoto de transferencias está caído muestra el aviso y la navegación sigue', async () => {
    const harness = await iniciar({ 'mfe-cuentas': { CUENTAS_ROUTES: RUTAS_CUENTAS } });
    TestBed.inject(Sesion).iniciar('abc');

    await harness.navigateByUrl('/transferencias');
    expect(harness.routeNativeElement?.textContent).toContain('Transferencias no está disponible');

    await harness.navigateByUrl('/cuentas');
    expect(harness.routeNativeElement?.textContent).toContain('Mis Cuentas (remoto)');
  });

  it('una URL desconocida vuelve a /cuentas', async () => {
    const harness = await iniciar({ 'mfe-cuentas': { CUENTAS_ROUTES: RUTAS_CUENTAS } });
    TestBed.inject(Sesion).iniciar('abc');
    await harness.navigateByUrl('/no-existe');
    expect(TestBed.inject(Router).url).toBe('/cuentas');
  });
});

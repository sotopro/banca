import { TestBed } from '@angular/core/testing';
import { HttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { LOCALE_ID } from '@angular/core';
import type { NativeFederationResult } from '@angular-architects/native-federation';
import { ENTORNO, Entorno, Sesion } from '@banca/core';
import { cargadorDe, crearAppConfig, FEDERACION } from './app.config';

const ENTORNO_QAS: Entorno = { entorno: 'qas', apiUrl: '/api', logLevel: 'warn' };

describe('crearAppConfig', () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [...crearAppConfig(null, ENTORNO_QAS).providers, provideHttpClientTesting()],
    });
  });

  it('registra el interceptor de autenticación en el HttpClient del shell', () => {
    TestBed.inject(Sesion).iniciar('abc');
    TestBed.inject(HttpClient).get('/api/cuentas').subscribe();

    const req = TestBed.inject(HttpTestingController).expectOne('/api/cuentas');
    expect(req.request.headers.get('Authorization')).toBe('Bearer abc');
    req.flush([]);
  });

  it('provee el entorno leído al arrancar, el locale es-PE y el resultado de la federación', () => {
    expect(TestBed.inject(ENTORNO)).toEqual(ENTORNO_QAS);
    expect(TestBed.inject(LOCALE_ID)).toBe('es-PE');
    expect(TestBed.inject(FEDERACION)).toBeNull();
  });
});

describe('cargadorDe', () => {
  it('usa el loadRemoteModule de la federación cuando existe', () => {
    const loadRemoteModule = vi.fn();
    const federacion = { loadRemoteModule } as unknown as NativeFederationResult;
    expect(cargadorDe(federacion)).toBe(loadRemoteModule);
  });

  it('sin federación rechaza la carga para que la ruta muestre el aviso', async () => {
    await expect(cargadorDe(null)('mfe-cuentas', './Routes')).rejects.toThrow(/mfe-cuentas/);
  });
});

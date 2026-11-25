import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ENTORNO } from '@banca/core';
import { CuentasApi } from './cuentas-api';

describe('CuentasApi', () => {
  let backend: HttpTestingController;

  function iniciar(apiUrl?: string) {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        ...(apiUrl
          ? [{ provide: ENTORNO, useValue: { entorno: 'qas', apiUrl, logLevel: 'warn' } }]
          : []),
      ],
    });
    backend = TestBed.inject(HttpTestingController);
    return TestBed.inject(CuentasApi);
  }

  afterEach(() => backend.verify());

  it('sin entorno del shell usa /api (modo aislado)', () => {
    iniciar().listar().subscribe();
    backend.expectOne({ method: 'GET', url: '/api/cuentas' }).flush([]);
  });

  it('usa el apiUrl del entorno para listar y obtener', () => {
    const api = iniciar('https://api.qas.banca.example.com');
    api.listar().subscribe();
    api.obtener('2').subscribe();
    backend.expectOne('https://api.qas.banca.example.com/cuentas').flush([]);
    backend.expectOne('https://api.qas.banca.example.com/cuentas/2').flush({});
  });
});

import { TestBed } from '@angular/core/testing';
import { LOCALE_ID } from '@angular/core';
import { registerLocaleData } from '@angular/common';
import localeEsPe from '@angular/common/locales/es-PE';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { CUENTAS_ROUTES } from '../cuentas.routes';

registerLocaleData(localeEsPe);

describe('Detalle de cuenta (montado como lo hace el shell)', () => {
  let backend: HttpTestingController;
  let harness: RouterTestingHarness;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([{ path: 'cuentas', children: CUENTAS_ROUTES }], withComponentInputBinding()),
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: LOCALE_ID, useValue: 'es-PE' },
      ],
    });
    backend = TestBed.inject(HttpTestingController);
    harness = await RouterTestingHarness.create();
  });

  afterEach(() => backend.verify());

  it('carga la cuenta del :id y ofrece transferir desde ella', async () => {
    await harness.navigateByUrl('/cuentas/2');
    backend
      .expectOne('/api/cuentas/2')
      .flush({ id: '2', numero: '191123456578902', tipo: 'Corriente', saldo: 5000 });
    await harness.fixture.whenStable();
    const el = harness.routeNativeElement!;

    expect(el.querySelector('h1')?.textContent).toContain('Corriente');
    expect(el.textContent).toContain('191123456578902');
    expect(el.querySelector('.saldo')?.textContent).toContain('5,000.00');
    expect(el.querySelector('a.accion')?.getAttribute('href')).toBe('/transferencias?origen=2');
  });

  it('muestra un aviso si la cuenta no existe', async () => {
    await harness.navigateByUrl('/cuentas/99');
    backend.expectOne('/api/cuentas/99').flush(null, { status: 404, statusText: 'Not Found' });
    await harness.fixture.whenStable();
    expect(harness.routeNativeElement!.querySelector('[role="alert"]')?.textContent).toContain(
      'No encontramos esta cuenta',
    );
  });
});

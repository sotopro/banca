import { TestBed } from '@angular/core/testing';
import { LOCALE_ID } from '@angular/core';
import { registerLocaleData } from '@angular/common';
import localeEsPe from '@angular/common/locales/es-PE';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { Cuenta } from '@banca/core';
import { ListarCuentas } from './listar-cuentas';

registerLocaleData(localeEsPe);

const CUENTAS: Cuenta[] = [
  { id: '1', numero: '191123456578901', tipo: 'Ahorro', saldo: 2500.5 },
  { id: '2', numero: '191123456578902', tipo: 'Corriente', saldo: 5000 },
  { id: '3', numero: '191123456578903', tipo: 'CTS', saldo: 1000 },
];

describe('ListarCuentas', () => {
  let backend: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ListarCuentas],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: LOCALE_ID, useValue: 'es-PE' },
      ],
    });
    backend = TestBed.inject(HttpTestingController);
  });

  async function render() {
    const fixture = TestBed.createComponent(ListarCuentas);
    await fixture.whenStable();
    return fixture;
  }

  it('muestra "Cargando..." mientras espera la API', async () => {
    const fixture = await render();
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('Cargando...');
    backend.expectOne('/api/cuentas').flush([]);
  });

  it('lista las cuentas con enlace al detalle y el saldo total', async () => {
    const fixture = await render();
    backend.expectOne('/api/cuentas').flush(CUENTAS);
    await fixture.whenStable();
    const el = fixture.nativeElement as HTMLElement;

    const enlaces = el.querySelectorAll('li a');
    expect(enlaces).toHaveLength(3);
    expect(enlaces[0].getAttribute('href')).toBe('/cuentas/1');
    expect(enlaces[0].textContent).toContain('191123456578901');
    expect(el.querySelector('.total')?.textContent).toContain('8,500.50');
  });

  it('indica cuando no hay cuentas', async () => {
    const fixture = await render();
    backend.expectOne('/api/cuentas').flush([]);
    await fixture.whenStable();
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('No tienes cuentas.');
  });

  it('muestra un error si la API falla', async () => {
    const fixture = await render();
    backend.expectOne('/api/cuentas').flush(null, { status: 500, statusText: 'Error' });
    await fixture.whenStable();
    expect(
      (fixture.nativeElement as HTMLElement).querySelector('[role="alert"]')?.textContent,
    ).toContain('Error al cargar las cuentas');
  });
});

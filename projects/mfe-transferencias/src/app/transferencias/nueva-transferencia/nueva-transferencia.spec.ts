import { TestBed } from '@angular/core/testing';
import { LOCALE_ID } from '@angular/core';
import { registerLocaleData } from '@angular/common';
import localeEsPe from '@angular/common/locales/es-PE';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { Cuenta } from '@banca/core';
import { TRANSFERENCIAS_ROUTES } from '../transferencias.routes';

registerLocaleData(localeEsPe);

const CUENTAS: Cuenta[] = [
  { id: '1', numero: '191123456578901', tipo: 'Ahorro', saldo: 2500.5 },
  { id: '2', numero: '191123456578902', tipo: 'Corriente', saldo: 5000 },
];

describe('Nueva transferencia (flujo crítico)', () => {
  let backend: HttpTestingController;
  let harness: RouterTestingHarness;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter(
          [
            { path: 'transferencias', children: TRANSFERENCIAS_ROUTES },
            { path: 'cuentas', children: [] },
          ],
          withComponentInputBinding(),
        ),
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: LOCALE_ID, useValue: 'es-PE' },
      ],
    });
    backend = TestBed.inject(HttpTestingController);
    harness = await RouterTestingHarness.create();
  });

  afterEach(() => backend.verify());

  const el = () => harness.routeNativeElement!;
  const estable = () => harness.fixture.whenStable();

  async function abrir(url = '/transferencias') {
    await harness.navigateByUrl(url);
    backend.expectOne({ method: 'GET', url: '/api/cuentas' }).flush(CUENTAS);
    await estable();
  }

  async function escribir(selector: string, valor: string) {
    const campo = el().querySelector<HTMLInputElement | HTMLSelectElement>(selector)!;
    campo.value = valor;
    campo.dispatchEvent(new Event(campo instanceof HTMLSelectElement ? 'change' : 'input'));
    campo.dispatchEvent(new Event('blur'));
    await estable();
  }

  async function enviar() {
    el().querySelector<HTMLButtonElement>('button[type="submit"]')!.click();
    await estable();
  }

  it('lista las cuentas de origen con su saldo', async () => {
    await abrir();
    const opciones = [...el().querySelectorAll('#origenId option')].map((o) => o.textContent);
    expect(opciones).toHaveLength(3);
    expect(opciones[2]).toContain('191123456578902');
    expect(opciones[2]).toContain('5,000.00');
  });

  it('preselecciona la cuenta que viene del detalle (?origen=2)', async () => {
    await abrir('/transferencias?origen=2');
    expect(el().querySelector<HTMLSelectElement>('#origenId')!.value).toBe('2');
  });

  it('registra la transferencia y muestra el código de operación', async () => {
    await abrir('/transferencias?origen=2');
    await escribir('#destino', '191123456578901');
    await escribir('#monto', '150.25');
    await enviar();

    const req = backend.expectOne({ method: 'POST', url: '/api/transferencias' });
    expect(req.request.body).toEqual({ origenId: '2', destino: '191123456578901', monto: 150.25 });
    expect(el().querySelector('button[type="submit"]')?.textContent).toContain('Enviando...');

    req.flush({ id: 'op-77', origenId: '2', destino: '191123456578901', monto: 150.25 });
    await estable();

    const confirmacion = el().querySelector('[role="status"]')!;
    expect(confirmacion.textContent).toContain('op-77');
    expect(confirmacion.textContent).toContain('150.25');
    expect(el().querySelector('form')).toBeNull();
  });

  it('no envía si el monto supera el saldo y explica el motivo', async () => {
    await abrir();
    await escribir('#origenId', '1');
    await escribir('#destino', '191123456578902');
    await escribir('#monto', '3000');
    await enviar();

    backend.expectNone('/api/transferencias');
    expect(el().textContent).toContain('El monto supera el saldo disponible');
    expect(el().textContent).toContain('2,500.50');
  });

  it('no envía a la misma cuenta de origen', async () => {
    await abrir('/transferencias?origen=1');
    await escribir('#destino', '191123456578901');
    await escribir('#monto', '10');
    await enviar();

    backend.expectNone('/api/transferencias');
    expect(el().textContent).toContain('no puede ser la misma que la de origen');
  });

  it('no envía un formulario incompleto y marca los campos', async () => {
    await abrir();
    await enviar();

    backend.expectNone('/api/transferencias');
    expect(el().textContent).toContain('Elige la cuenta de origen.');
    expect(el().textContent).toContain('Ingresa un número de cuenta');
    expect(el().textContent).toContain('Ingresa un monto mayor a S/ 0.00.');
  });

  it('si la API falla mantiene el formulario y avisa que el dinero no se movió', async () => {
    await abrir('/transferencias?origen=2');
    await escribir('#destino', '191123456578901');
    await escribir('#monto', '100');
    await enviar();

    backend.expectOne('/api/transferencias').flush(null, { status: 500, statusText: 'Error' });
    await estable();

    expect(el().querySelector('[role="alert"]')?.textContent).toContain('Tu dinero no se movió');
    expect(el().querySelector('form')).not.toBeNull();
    expect(el().querySelector<HTMLButtonElement>('button[type="submit"]')!.disabled).toBe(false);
  });

  it('después de registrar permite hacer otra transferencia desde la misma cuenta', async () => {
    await abrir('/transferencias?origen=2');
    await escribir('#destino', '191123456578901');
    await escribir('#monto', '50');
    await enviar();
    backend
      .expectOne('/api/transferencias')
      .flush({ id: 'op-1', origenId: '2', destino: '191123456578901', monto: 50 });
    await estable();

    el().querySelector<HTMLButtonElement>('[role="status"] button')!.click();
    await estable();

    expect(el().querySelector<HTMLSelectElement>('#origenId')!.value).toBe('2');
    expect(el().querySelector<HTMLInputElement>('#destino')!.value).toBe('');
  });

  it('muestra un error si no puede cargar las cuentas', async () => {
    await harness.navigateByUrl('/transferencias');
    backend.expectOne('/api/cuentas').flush(null, { status: 500, statusText: 'Error' });
    await estable();
    expect(el().querySelector('[role="alert"]')?.textContent).toContain(
      'No pudimos cargar tus cuentas',
    );
  });
});

import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TransferenciasApi } from './transferencias-api';

describe('TransferenciasApi', () => {
  let backend: HttpTestingController;
  let api: TransferenciasApi;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    backend = TestBed.inject(HttpTestingController);
    api = TestBed.inject(TransferenciasApi);
  });

  afterEach(() => backend.verify());

  it('lee las cuentas de origen desde la API de cuentas', () => {
    api.cuentasOrigen().subscribe();
    backend.expectOne({ method: 'GET', url: '/api/cuentas' }).flush([]);
  });

  it('registra la transferencia con POST /transferencias', () => {
    const registrada = vi.fn();
    api.transferir({ origenId: '1', destino: '191123456578902', monto: 150 }).subscribe(registrada);

    const req = backend.expectOne({ method: 'POST', url: '/api/transferencias' });
    expect(req.request.body).toEqual({ origenId: '1', destino: '191123456578902', monto: 150 });
    req.flush({ id: 'op-1', origenId: '1', destino: '191123456578902', monto: 150 });

    expect(registrada).toHaveBeenCalledWith(expect.objectContaining({ id: 'op-1' }));
  });
});

import { TestBed } from '@angular/core/testing';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter, Router } from '@angular/router';
import { authInterceptor } from './auth-interceptor';
import { Sesion } from './sesion';

describe('authInterceptor', () => {
  let http: HttpClient;
  let backend: HttpTestingController;
  let sesion: Sesion;
  let navegar: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
      ],
    });
    http = TestBed.inject(HttpClient);
    backend = TestBed.inject(HttpTestingController);
    sesion = TestBed.inject(Sesion);
    navegar = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
  });

  afterEach(() => backend.verify());

  it('agrega el token Bearer cuando hay sesión', () => {
    sesion.iniciar('abc');
    http.get('/api/cuentas').subscribe();
    const req = backend.expectOne('/api/cuentas');
    expect(req.request.headers.get('Authorization')).toBe('Bearer abc');
    req.flush([]);
  });

  it('no agrega Authorization sin sesión', () => {
    http.get('/api/cuentas').subscribe();
    const req = backend.expectOne('/api/cuentas');
    expect(req.request.headers.has('Authorization')).toBe(false);
    req.flush([]);
  });

  it('ante un 401 cierra la sesión, envía al login y propaga el error', () => {
    sesion.iniciar('vencido');
    const error = vi.fn();
    http.get('/api/cuentas').subscribe({ error });

    backend.expectOne('/api/cuentas').flush(null, { status: 401, statusText: 'Unauthorized' });

    expect(sesion.token()).toBeNull();
    expect(navegar).toHaveBeenCalledWith(['/auth/login']);
    expect(error).toHaveBeenCalledWith(expect.objectContaining({ status: 401 }));
  });

  it('ante otros errores mantiene la sesión', () => {
    sesion.iniciar('abc');
    http.get('/api/cuentas').subscribe({ error: () => undefined });

    backend.expectOne('/api/cuentas').flush(null, { status: 500, statusText: 'Server Error' });

    expect(sesion.token()).toBe('abc');
    expect(navegar).not.toHaveBeenCalled();
  });
});

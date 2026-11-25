import { TestBed } from '@angular/core/testing';
import {
  ActivatedRouteSnapshot,
  provideRouter,
  Router,
  RouterStateSnapshot,
  UrlTree,
} from '@angular/router';
import { authGuard } from './auth-guard';
import { Sesion } from './sesion';

describe('authGuard', () => {
  const ejecutar = () =>
    TestBed.runInInjectionContext(() =>
      authGuard({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot),
    );

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
  });

  it('deja pasar cuando hay sesión', () => {
    TestBed.inject(Sesion).iniciar('abc');
    expect(ejecutar()).toBe(true);
  });

  it('redirige a /auth/login cuando no hay sesión', () => {
    const resultado = ejecutar();
    expect(resultado).toBeInstanceOf(UrlTree);
    expect(TestBed.inject(Router).serializeUrl(resultado as UrlTree)).toBe('/auth/login');
  });
});

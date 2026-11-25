import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { Sesion } from '@banca/core';
import { Login } from './login';

describe('Login', () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({ imports: [Login], providers: [provideRouter([])] });
  });

  it('al ingresar inicia la sesión y lleva a /cuentas', async () => {
    const navegar = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    const fixture = TestBed.createComponent(Login);
    await fixture.whenStable();

    (fixture.nativeElement as HTMLElement).querySelector('button')!.click();

    expect(TestBed.inject(Sesion).token()).toBe('token-de-prueba');
    expect(navegar).toHaveBeenCalledWith(['/cuentas']);
  });
});

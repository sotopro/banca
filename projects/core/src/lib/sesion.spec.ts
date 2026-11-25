import { TestBed } from '@angular/core/testing';
import { CLAVE_TOKEN, Sesion } from './sesion';

describe('Sesion', () => {
  beforeEach(() => localStorage.clear());

  it('arranca sin token cuando no hay sesión guardada', () => {
    expect(TestBed.inject(Sesion).token()).toBeNull();
  });

  it('recupera el token guardado al recargar la página', () => {
    localStorage.setItem(CLAVE_TOKEN, 'token-guardado');
    expect(TestBed.inject(Sesion).token()).toBe('token-guardado');
  });

  it('iniciar guarda el token en memoria y en localStorage', () => {
    const sesion = TestBed.inject(Sesion);
    sesion.iniciar('abc');
    expect(sesion.token()).toBe('abc');
    expect(localStorage.getItem(CLAVE_TOKEN)).toBe('abc');
  });

  it('cerrar borra el token de memoria y de localStorage', () => {
    const sesion = TestBed.inject(Sesion);
    sesion.iniciar('abc');
    sesion.cerrar();
    expect(sesion.token()).toBeNull();
    expect(localStorage.getItem(CLAVE_TOKEN)).toBeNull();
  });

  it('es una sola instancia en el injector raíz (shell y remotos la comparten)', () => {
    expect(TestBed.inject(Sesion)).toBe(TestBed.inject(Sesion));
  });
});

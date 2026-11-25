import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { Sesion } from '@banca/core';
import { App } from './app';

describe('App (layout del shell)', () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({ imports: [App], providers: [provideRouter([])] });
  });

  it('no muestra la navegación sin sesión', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    expect((fixture.nativeElement as HTMLElement).querySelector('nav')).toBeNull();
  });

  it('con sesión muestra Cuentas y Transferencias, y cerrar sesión vuelve al login', async () => {
    const sesion = TestBed.inject(Sesion);
    sesion.iniciar('abc');
    const navegar = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const el = fixture.nativeElement as HTMLElement;

    expect(el.querySelector('nav')?.textContent).toContain('Cuentas');
    expect(el.querySelector('nav')?.textContent).toContain('Transferencias');

    el.querySelector<HTMLButtonElement>('button.salir')!.click();
    await fixture.whenStable();

    expect(sesion.token()).toBeNull();
    expect(navegar).toHaveBeenCalledWith(['/auth/login']);
    expect(el.querySelector('nav')).toBeNull();
  });
});

import { TestBed } from '@angular/core/testing';
import { LOCALE_ID } from '@angular/core';
import { formatCurrency, getLocaleId } from '@angular/common';
import { LOCALE_BANCA, provideLocaleBanca } from './locale';

describe('provideLocaleBanca', () => {
  it('fija LOCALE_ID en es-PE y registra sus datos para formatear soles', () => {
    TestBed.configureTestingModule({ providers: [provideLocaleBanca()] });
    expect(TestBed.inject(LOCALE_ID)).toBe(LOCALE_BANCA);
    expect(getLocaleId('es-PE')).toBe('es-PE');
    // es-PE separa el símbolo con un espacio no separable.
    expect(formatCurrency(8500.5, 'es-PE', 'S/', 'PEN')).toMatch(/^S\/\s8,500\.50$/);
  });
});

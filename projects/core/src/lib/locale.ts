import { EnvironmentProviders, LOCALE_ID, makeEnvironmentProviders } from '@angular/core';
import { registerLocaleData } from '@angular/common';
import localeEsPe from '@angular/common/locales/es-PE';

export const LOCALE_BANCA = 'es-PE';

/**
 * Registra los datos de es-PE y fija LOCALE_ID. Vive en @banca/core para que el
 * escaneo de dependencias de Native Federation vea el import del locale desde
 * los módulos expuestos y lo publique como compartido.
 */
export function provideLocaleBanca(): EnvironmentProviders {
  registerLocaleData(localeEsPe);
  return makeEnvironmentProviders([{ provide: LOCALE_ID, useValue: LOCALE_BANCA }]);
}

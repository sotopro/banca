import { FormControl, FormGroup } from '@angular/forms';
import { Cuenta } from '@banca/core';
import { PATRON_CUENTA_DESTINO, validarContraOrigen } from './validaciones';

const CUENTAS: Cuenta[] = [{ id: '1', numero: '191123456578901', tipo: 'Ahorro', saldo: 2500.5 }];

const grupo = (origenId: string, destino: string, monto: number) =>
  new FormGroup(
    {
      origenId: new FormControl(origenId),
      destino: new FormControl(destino),
      monto: new FormControl(monto),
    },
    { validators: validarContraOrigen(() => CUENTAS) },
  );

describe('PATRON_CUENTA_DESTINO', () => {
  it.each(['1911234567890', '191123456578902', '00219100123456789012'])('acepta %s', (valor) => {
    expect(PATRON_CUENTA_DESTINO.test(valor)).toBe(true);
  });

  it.each(['', '123', '1911234567890123', '191-123456578902', 'abcdefghijklmno'])(
    'rechaza "%s"',
    (valor) => {
      expect(PATRON_CUENTA_DESTINO.test(valor)).toBe(false);
    },
  );
});

describe('validarContraOrigen', () => {
  it('acepta un monto igual al saldo disponible', () => {
    expect(grupo('1', '191123456578902', 2500.5).errors).toBeNull();
  });

  it('rechaza un monto mayor al saldo', () => {
    expect(grupo('1', '191123456578902', 2500.51).errors).toEqual({
      saldoInsuficiente: { saldo: 2500.5 },
    });
  });

  it('rechaza transferir a la misma cuenta de origen', () => {
    expect(grupo('1', '191123456578901', 10).errors).toEqual({ mismaCuenta: true });
  });

  it('no valida contra el saldo mientras no haya cuenta de origen', () => {
    expect(grupo('', '191123456578902', 999999).errors).toBeNull();
  });
});

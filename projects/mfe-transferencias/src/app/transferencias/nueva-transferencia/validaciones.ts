import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { Cuenta } from '@banca/core';

/** Número de cuenta (13 a 15 dígitos) o CCI (20 dígitos). */
export const PATRON_CUENTA_DESTINO = /^(\d{13,15}|\d{20})$/;

/**
 * Validador de grupo: el monto no puede superar el saldo de la cuenta de origen
 * y el destino no puede ser la misma cuenta de origen.
 */
export function validarContraOrigen(cuentas: () => Cuenta[]): ValidatorFn {
  return (grupo: AbstractControl): ValidationErrors | null => {
    const origenId = grupo.get('origenId')?.value as string;
    const destino = grupo.get('destino')?.value as string;
    const monto = Number(grupo.get('monto')?.value);
    const origen = cuentas().find((c) => c.id === origenId);
    if (!origen) {
      return null;
    }
    const errores: ValidationErrors = {};
    if (monto > origen.saldo) {
      errores['saldoInsuficiente'] = { saldo: origen.saldo };
    }
    if (destino && destino === origen.numero) {
      errores['mismaCuenta'] = true;
    }
    return Object.keys(errores).length ? errores : null;
  };
}

export interface Cuenta {
  id: string;
  numero: string;
  tipo: string;
  saldo: number;
}

export interface Transferencia {
  origenId: string;
  destino: string;
  monto: number;
}

export interface TransferenciaRegistrada extends Transferencia {
  id: string;
}

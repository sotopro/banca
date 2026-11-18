export interface Cuenta {
    id: number;
    numero: string;
    tipo: string;
    saldo: number;
}

export interface Transferencia {
    origenId: string;
    destino: string;
    monto: number;
}

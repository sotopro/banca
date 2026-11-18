import { inject, Service } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Cuenta, Transferencia } from './cuenta';

@Service()
export class CuentasApi {
    private http = inject(HttpClient);
    private url = '/api/cuentas';

    listar() {
        return this.http.get<Cuenta[]>(this.url);
    }

    obtener(id: string) {
        return this.http.get<Cuenta>(`${this.url}/${id}`);
    }

    transferir(datos: Transferencia) {
        return this.http.post<Transferencia & { id: string }>('/api/transferencias', datos);
    }

}

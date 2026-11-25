import { inject, Service } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Cuenta, ENTORNO, Transferencia, TransferenciaRegistrada } from '@banca/core';

/** Lee cuentas por API. No importa código de mfe-cuentas. */
@Service()
export class TransferenciasApi {
  private http = inject(HttpClient);
  private apiUrl = inject(ENTORNO).apiUrl;

  cuentasOrigen() {
    return this.http.get<Cuenta[]>(`${this.apiUrl}/cuentas`);
  }

  transferir(datos: Transferencia) {
    return this.http.post<TransferenciaRegistrada>(`${this.apiUrl}/transferencias`, datos);
  }
}

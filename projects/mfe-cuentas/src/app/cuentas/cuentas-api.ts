import { inject, Service } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Cuenta, ENTORNO } from '@banca/core';

@Service()
export class CuentasApi {
  private http = inject(HttpClient);
  private url = `${inject(ENTORNO).apiUrl}/cuentas`;

  listar() {
    return this.http.get<Cuenta[]>(this.url);
  }

  obtener(id: string) {
    return this.http.get<Cuenta>(`${this.url}/${encodeURIComponent(id)}`);
  }
}

import { Component, inject, input } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { rxResource } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { CuentasApi } from '../cuentas-api';

@Component({
  imports: [RouterLink, CurrencyPipe],
  selector: 'app-detalle',
  styleUrl: './detalle.scss',
  templateUrl: './detalle.html',
})
export class Detalle {
  private api = inject(CuentasApi);

  /** Parámetro `:id` de la ruta (withComponentInputBinding). */
  readonly id = input.required<string>();

  readonly cuenta = rxResource({
    params: () => this.id(),
    stream: ({ params }) => this.api.obtener(params),
  });
}

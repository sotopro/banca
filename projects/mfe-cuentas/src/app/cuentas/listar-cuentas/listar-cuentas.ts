import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Cuenta } from '@banca/core';
import { CuentasApi } from '../cuentas-api';

@Component({
  imports: [RouterLink, CurrencyPipe],
  selector: 'app-listar-cuentas',
  styleUrl: './listar-cuentas.scss',
  templateUrl: './listar-cuentas.html',
})
export class ListarCuentas implements OnInit {
  private api = inject(CuentasApi);

  cuentas = signal<Cuenta[]>([]);
  cargando = signal<boolean>(true);
  error = signal<string | null>(null);

  total = computed(() => this.cuentas().reduce((acc, cuenta) => acc + cuenta.saldo, 0));

  ngOnInit() {
    this.api.listar().subscribe({
      next: (cuentas) => {
        this.cuentas.set(cuentas);
        this.cargando.set(false);
      },
      error: () => {
        this.error.set('Error al cargar las cuentas. Intenta de nuevo.');
        this.cargando.set(false);
      },
    });
  }
}

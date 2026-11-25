import { Component, effect, inject, input, OnInit, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Cuenta, TransferenciaRegistrada } from '@banca/core';
import { TransferenciasApi } from '../transferencias-api';
import { PATRON_CUENTA_DESTINO, validarContraOrigen } from './validaciones';

@Component({
  imports: [ReactiveFormsModule, CurrencyPipe, RouterLink],
  selector: 'app-nueva-transferencia',
  styleUrl: './nueva-transferencia.scss',
  templateUrl: './nueva-transferencia.html',
})
export class NuevaTransferencia implements OnInit {
  private api = inject(TransferenciasApi);
  private fb = inject(NonNullableFormBuilder);

  /** Query param `?origen=<id>` (withComponentInputBinding). Lo usa el detalle de cuenta. */
  readonly origen = input<string | undefined>();

  readonly cuentas = signal<Cuenta[]>([]);
  readonly cargando = signal(true);
  readonly errorCarga = signal<string | null>(null);
  readonly enviando = signal(false);
  readonly errorEnvio = signal<string | null>(null);
  readonly registrada = signal<TransferenciaRegistrada | null>(null);

  readonly formulario = this.fb.group(
    {
      origenId: ['', Validators.required],
      destino: ['', [Validators.required, Validators.pattern(PATRON_CUENTA_DESTINO)]],
      monto: [0, [Validators.required, Validators.min(0.01)]],
    },
    { validators: validarContraOrigen(() => this.cuentas()) },
  );

  constructor() {
    effect(() => {
      const origen = this.origen();
      if (origen && this.cuentas().some((c) => c.id === origen)) {
        this.formulario.controls.origenId.setValue(origen);
      }
    });
  }

  ngOnInit() {
    this.api.cuentasOrigen().subscribe({
      next: (cuentas) => {
        this.cuentas.set(cuentas);
        this.cargando.set(false);
        this.formulario.updateValueAndValidity();
      },
      error: () => {
        this.errorCarga.set('No pudimos cargar tus cuentas. Intenta de nuevo.');
        this.cargando.set(false);
      },
    });
  }

  saldoDe(id: string) {
    return this.cuentas().find((c) => c.id === id)?.saldo ?? 0;
  }

  enviar() {
    if (this.formulario.invalid || this.enviando()) {
      this.formulario.markAllAsTouched();
      return;
    }
    const { origenId, destino, monto } = this.formulario.getRawValue();
    this.enviando.set(true);
    this.errorEnvio.set(null);
    this.api.transferir({ origenId, destino, monto: Number(monto) }).subscribe({
      next: (registrada) => {
        this.registrada.set(registrada);
        this.enviando.set(false);
      },
      error: () => {
        this.errorEnvio.set(
          'No se pudo registrar la transferencia. Tu dinero no se movió; intenta de nuevo.',
        );
        this.enviando.set(false);
      },
    });
  }

  nuevaTransferencia() {
    this.registrada.set(null);
    this.formulario.reset({
      origenId: this.formulario.controls.origenId.value,
      destino: '',
      monto: 0,
    });
  }
}

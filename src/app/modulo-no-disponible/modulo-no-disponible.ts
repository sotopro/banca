import { Component, DOCUMENT, inject, input } from '@angular/core';

@Component({
  selector: 'app-modulo-no-disponible',
  template: `
    <section class="aviso" role="alert">
      <h2>{{ modulo() }} no está disponible</h2>
      <p>No pudimos cargar este módulo. Revisa tu conexión e inténtalo de nuevo en unos minutos.</p>
      <button type="button" (click)="reintentar()">Reintentar</button>
    </section>
  `,
  styles: `
    .aviso {
      border: 1px solid #e0b4b4;
      background: #fff6f6;
      padding: 1rem 1.25rem;
      border-radius: 8px;
    }
    h2 {
      margin-top: 0;
    }
  `,
})
export class ModuloNoDisponible {
  private documento = inject(DOCUMENT);

  /** Viene de `data.modulo` de la ruta (withComponentInputBinding). */
  readonly modulo = input('Este módulo');

  reintentar() {
    // loadChildren guarda el resultado; recargar es la forma de volver a pedir el remoto.
    this.documento.defaultView?.location.reload();
  }
}

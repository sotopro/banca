import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { Sesion } from '@banca/core';

@Component({
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  selector: 'app-root',
  styleUrl: './app.scss',
  templateUrl: './app.html',
})
export class App {
  protected readonly sesion = inject(Sesion);
  private router = inject(Router);

  cerrarSesion() {
    this.sesion.cerrar();
    this.router.navigate(['/auth/login']);
  }
}

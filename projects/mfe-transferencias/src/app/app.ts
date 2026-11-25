import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

/** Contenedor del modo aislado. El shell no lo usa: monta TRANSFERENCIAS_ROUTES directamente. */
@Component({
  imports: [RouterOutlet],
  selector: 'app-root',
  styleUrl: './app.scss',
  templateUrl: './app.html',
})
export class App {}

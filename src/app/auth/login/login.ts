import { Component, inject } from '@angular/core';
import { Sesion } from '../sesion';
import { Router } from '@angular/router';

@Component({
  imports: [],
  selector: 'app-login',
  styleUrl: './login.scss',
  templateUrl: './login.html',
})
export class Login {
  private sesion = inject(Sesion);
  private router = inject(Router);

  ingresar() {
    this.sesion.iniciar('token-de-prueba');
    this.router.navigate(['/cuentas']);
  }
}

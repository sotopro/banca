import { Service, signal } from '@angular/core';

export const CLAVE_TOKEN = 'token';

/**
 * Sesión del usuario. `@banca/core` se comparte como singleton, así que shell y
 * remotos ven la misma instancia y el mismo token.
 */
@Service()
export class Sesion {
  readonly token = signal<string | null>(localStorage.getItem(CLAVE_TOKEN));

  iniciar(token: string) {
    localStorage.setItem(CLAVE_TOKEN, token);
    this.token.set(token);
  }

  cerrar() {
    localStorage.removeItem(CLAVE_TOKEN);
    this.token.set(null);
  }
}

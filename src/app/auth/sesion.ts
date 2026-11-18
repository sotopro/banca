import { Service, signal } from '@angular/core';

@Service()
export class Sesion {
    token = signal<string | null>(localStorage.getItem('token'));

    iniciar(token: string) {
        localStorage.setItem('token', token);
        this.token.set(token);
    }

    cerrar() {
        localStorage.removeItem('token');
        this.token.set(null);
    }
}

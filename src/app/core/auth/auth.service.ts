import { Injectable, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Api } from '../api/api';
import { login, readCurrentUser, register } from '../api/functions';
import { UsuarioCreate } from '../api/models/usuario-create';
import { UsuarioOut } from '../api/models/usuario-out';
import { Rol } from '../navegacion';

const CLAVE_TOKEN = 'peludos.token';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly api = inject(Api);
  private readonly router = inject(Router);

  private readonly _usuario = signal<UsuarioOut | null>(null);
  readonly usuario = this._usuario.asReadonly();
  readonly autenticado = computed(() => this._usuario() !== null);
  readonly rol = computed(() => (this._usuario()?.rol ?? 'cliente') as Rol);

  token(): string | null {
    return localStorage.getItem(CLAVE_TOKEN);
  }

  /** Al abrir la app: si hay token guardado, recupera el usuario. */
  async restaurarSesion(): Promise<void> {
    if (!this.token()) {
      return;
    }
    try {
      this._usuario.set(await this.api.invoke(readCurrentUser));
    } catch {
      // Token vencido o back caído: se entra como invitado. El interceptor limpia si fue 401.
      this._usuario.set(null);
    }
  }

  async iniciarSesion(correo: string, contrasena: string): Promise<void> {
    const { access_token } = await this.api.invoke(login, {
      body: { username: correo, password: contrasena },
    });
    localStorage.setItem(CLAVE_TOKEN, access_token);
    this._usuario.set(await this.api.invoke(readCurrentUser));
  }

  async registrar(datos: UsuarioCreate): Promise<void> {
    await this.api.invoke(register, { body: datos });
    await this.iniciarSesion(datos.correo_electronico, datos.contrasena);
  }

  cerrarSesion(): void {
    this.limpiar();
    this.router.navigateByUrl('/login');
  }

  /** El back rechazó el token. */
  sesionExpirada(): void {
    this.limpiar();
    this.router.navigate(['/login'], { queryParams: { expirada: 1 } });
  }

  private limpiar(): void {
    localStorage.removeItem(CLAVE_TOKEN);
    this._usuario.set(null);
  }
}

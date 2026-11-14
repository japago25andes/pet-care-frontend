import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, input, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';
import { mensajeDeCampo, mensajeDeError } from '../../../core/errores';
import { MarcoAuth } from '../../../layout/marco-auth/marco-auth';

@Component({
  selector: 'app-login',
  imports: [
    MarcoAuth,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    ReactiveFormsModule,
    RouterLink,
  ],
  templateUrl: './login.html',
})
export class Login {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  /** Parámetros de la URL */
  readonly volver = input<string>();
  readonly expirada = input<string>();

  protected readonly form = new FormGroup({
    correo: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.email] }),
    contrasena: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
  });
  protected readonly enviando = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly verContrasena = signal(false);
  protected readonly mensajeDeCampo = mensajeDeCampo;

  protected async enviar(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.enviando.set(true);
    this.error.set(null);
    const { correo, contrasena } = this.form.getRawValue();
    try {
      await this.auth.iniciarSesion(correo.trim(), contrasena);
      await this.router.navigateByUrl(this.volver() ?? '/panel');
    } catch (error) {
      this.error.set(
        error instanceof HttpErrorResponse && error.status === 401
          ? 'Correo o contraseña incorrectos'
          : mensajeDeError(error),
      );
    } finally {
      this.enviando.set(false);
    }
  }
}

import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, inject, input, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';
import { aplicarErroresDeCampo, mensajeDeCampo, mensajeDeError } from '../../../core/errores';
import { MarcoAuth } from '../../../layout/marco-auth/marco-auth';

type RolRegistro = 'cliente' | 'veterinaria';

@Component({
  selector: 'app-registro',
  imports: [
    MarcoAuth,
    MatButtonModule,
    MatButtonToggleModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    ReactiveFormsModule,
    RouterLink,
  ],
  templateUrl: './registro.html',
})
export class Registro implements OnInit {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  /** Parámetro de la URL: /registro?rol=veterinaria */
  readonly rol = input<string>();

  protected readonly form = new FormGroup({
    rol: new FormControl<RolRegistro>('cliente', { nonNullable: true }),
    nombre_completo: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(100)],
    }),
    correo_electronico: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.email, Validators.maxLength(100)],
    }),
    contrasena: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(8), Validators.maxLength(72)],
    }),
    telefono: new FormControl('', { nonNullable: true, validators: [Validators.maxLength(20)] }),
    direccion: new FormControl('', { nonNullable: true }),
  });
  protected readonly enviando = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly verContrasena = signal(false);
  protected readonly mensajeDeCampo = mensajeDeCampo;

  ngOnInit(): void {
    if (this.rol() === 'veterinaria') {
      this.form.controls.rol.setValue('veterinaria');
    }
  }

  protected async enviar(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.enviando.set(true);
    this.error.set(null);
    const datos = this.form.getRawValue();
    try {
      await this.auth.registrar({
        ...datos,
        correo_electronico: datos.correo_electronico.trim(),
        telefono: datos.telefono.trim() || null,
        direccion: datos.direccion.trim() || null,
      });
      await this.router.navigateByUrl('/panel');
    } catch (error) {
      if (error instanceof HttpErrorResponse && error.status === 409) {
        this.form.controls.correo_electronico.setErrors({ servidor: mensajeDeError(error) });
      } else if (!aplicarErroresDeCampo(this.form, error)) {
        this.error.set(mensajeDeError(error));
      }
    } finally {
      this.enviando.set(false);
    }
  }
}

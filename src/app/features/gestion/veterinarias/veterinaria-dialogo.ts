import { Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { Api } from '../../../core/api/api';
import { actualizarVeterinaria, crearVeterinaria } from '../../../core/api/functions';
import { VeterinariaOut } from '../../../core/api/models/veterinaria-out';
import { Avisos } from '../../../core/avisos';
import { aplicarErroresDeCampo, mensajeDeCampo, mensajeDeError } from '../../../core/errores';
import { sinVacios } from '../../../core/formularios';

@Component({
  selector: 'app-veterinaria-dialogo',
  imports: [MatButtonModule, MatDialogModule, MatFormFieldModule, MatIconModule, MatInputModule, ReactiveFormsModule],
  templateUrl: './veterinaria-dialogo.html',
})
export class VeterinariaDialogo {
  private readonly api = inject(Api);
  private readonly avisos = inject(Avisos);
  private readonly referencia = inject(MatDialogRef<VeterinariaDialogo>);
  protected readonly veterinaria = inject<VeterinariaOut | null>(MAT_DIALOG_DATA);

  protected readonly form = new FormGroup({
    nombre_comercial: new FormControl(this.veterinaria?.nombre_comercial ?? '', {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(100)],
    }),
    direccion: new FormControl(this.veterinaria?.direccion ?? '', {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(5000)],
    }),
    telefono: new FormControl(this.veterinaria?.telefono ?? '', {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(20)],
    }),
    correo_electronico: new FormControl(this.veterinaria?.correo_electronico ?? '', {
      nonNullable: true,
      validators: [Validators.email, Validators.maxLength(100)],
    }),
    horario_atencion: new FormControl(this.veterinaria?.horario_atencion ?? '', {
      nonNullable: true,
      validators: [Validators.maxLength(100)],
    }),
    latitud: new FormControl<number | null>(this.veterinaria?.latitud ?? null, [Validators.min(-90), Validators.max(90)]),
    longitud: new FormControl<number | null>(this.veterinaria?.longitud ?? null, [
      Validators.min(-180),
      Validators.max(180),
    ]),
  });

  protected readonly ubicando = signal(false);
  protected readonly enviando = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly mensajeDeCampo = mensajeDeCampo;

  protected usarMiUbicacion(): void {
    this.ubicando.set(true);
    this.error.set(null);
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        this.form.patchValue({ latitud: Number(coords.latitude.toFixed(8)), longitud: Number(coords.longitude.toFixed(8)) });
        this.ubicando.set(false);
      },
      () => {
        this.error.set('No pudimos obtener tu ubicación. Revisa el permiso del navegador.');
        this.ubicando.set(false);
      },
    );
  }

  /** Sin las dos coordenadas la veterinaria no puede aparecer en el mapa. */
  private coordenadasCompletas(): boolean {
    const { latitud, longitud } = this.form.controls;
    if ((latitud.value === null) === (longitud.value === null)) {
      return true;
    }
    (latitud.value === null ? latitud : longitud).setErrors({ servidor: 'Escribe las dos coordenadas o ninguna' });
    this.form.markAllAsTouched();
    return false;
  }

  protected async guardar(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    if (!this.coordenadasCompletas()) {
      return;
    }
    this.enviando.set(true);
    this.error.set(null);
    const body = sinVacios(this.form.getRawValue());
    try {
      if (this.veterinaria) {
        await this.api.invoke(actualizarVeterinaria, { id_veterinaria: this.veterinaria.id_veterinaria, body });
      } else {
        await this.api.invoke(crearVeterinaria, { body });
      }
      this.avisos.exito('Veterinaria guardada');
      this.referencia.close(true);
    } catch (error) {
      if (!aplicarErroresDeCampo(this.form, error)) {
        this.error.set(mensajeDeError(error));
      }
    } finally {
      this.enviando.set(false);
    }
  }
}

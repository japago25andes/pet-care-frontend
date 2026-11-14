import { Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { Api } from '../../../../core/api/api';
import { actualizarVacuna, crearVacuna } from '../../../../core/api/functions';
import { VacunaOut } from '../../../../core/api/models/vacuna-out';
import { Avisos } from '../../../../core/avisos';
import { aplicarErroresDeCampo, mensajeDeCampo, mensajeDeError } from '../../../../core/errores';
import { hoyISO } from '../../../../core/fechas';
import { fechaNoFutura, fechaPosterior, sinVacios } from '../../../../core/formularios';

@Component({
  selector: 'app-vacuna-dialogo',
  imports: [MatButtonModule, MatDialogModule, MatFormFieldModule, MatInputModule, ReactiveFormsModule],
  templateUrl: './vacuna-dialogo.html',
})
export class VacunaDialogo {
  private readonly api = inject(Api);
  private readonly avisos = inject(Avisos);
  private readonly referencia = inject(MatDialogRef<VacunaDialogo>);
  protected readonly datos = inject<{ idMascota: number; vacuna?: VacunaOut }>(MAT_DIALOG_DATA);

  private readonly vacuna = this.datos.vacuna;

  protected readonly form = new FormGroup({
    nombre_vacuna: new FormControl(this.vacuna?.nombre_vacuna ?? '', {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(100)],
    }),
    fecha_aplicacion: new FormControl(this.vacuna?.fecha_aplicacion ?? hoyISO(), {
      nonNullable: true,
      validators: [Validators.required, fechaNoFutura('La fecha de aplicación no puede ser futura')],
    }),
    fecha_proxima_dosis: new FormControl(this.vacuna?.fecha_proxima_dosis ?? '', {
      nonNullable: true,
      validators: [fechaPosterior('fecha_aplicacion', 'Debe ser posterior a la fecha de aplicación', true)],
    }),
    numero_dosis: new FormControl(this.vacuna?.numero_dosis ?? 1, {
      nonNullable: true,
      validators: [Validators.required, Validators.min(1)],
    }),
    lote: new FormControl(this.vacuna?.lote ?? '', { nonNullable: true, validators: [Validators.maxLength(50)] }),
    veterinario_nombre: new FormControl(this.vacuna?.veterinario_nombre ?? '', {
      nonNullable: true,
      validators: [Validators.maxLength(100)],
    }),
  });

  protected readonly hoy = hoyISO();
  protected readonly enviando = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly mensajeDeCampo = mensajeDeCampo;

  constructor() {
    this.form.controls.fecha_aplicacion.valueChanges.subscribe(() =>
      this.form.controls.fecha_proxima_dosis.updateValueAndValidity(),
    );
  }

  protected async guardar(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.enviando.set(true);
    this.error.set(null);
    const body = sinVacios(this.form.getRawValue());
    try {
      if (this.vacuna) {
        await this.api.invoke(actualizarVacuna, { id_vacuna: this.vacuna.id_vacuna, body });
      } else {
        await this.api.invoke(crearVacuna, { id_mascota: this.datos.idMascota, body });
      }
      this.avisos.exito('Vacuna guardada');
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

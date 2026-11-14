import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, resource, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { RouterLink } from '@angular/router';
import { Api } from '../../core/api/api';
import { crearCita, listarMascotas } from '../../core/api/functions';
import { ProfesionalOut } from '../../core/api/models/profesional-out';
import { Avisos } from '../../core/avisos';
import { aplicarErroresDeCampo, mensajeDeCampo, mensajeDeError } from '../../core/errores';
import { aFechaHoraLocal, desdeFechaHoraLocal } from '../../core/fechas';
import { momentoFuturo } from '../../core/formularios';
import { Carga } from '../../shared/carga/carga';

@Component({
  selector: 'app-agendar-dialogo',
  imports: [
    Carga,
    MatButtonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    ReactiveFormsModule,
    RouterLink,
  ],
  templateUrl: './agendar-dialogo.html',
})
export class AgendarDialogo {
  private readonly api = inject(Api);
  private readonly avisos = inject(Avisos);
  private readonly referencia = inject(MatDialogRef<AgendarDialogo>);
  protected readonly datos = inject<{ profesional: ProfesionalOut; nombreVeterinaria: string }>(MAT_DIALOG_DATA);

  protected readonly mascotas = resource({ loader: () => this.api.invoke(listarMascotas) });

  protected readonly form = new FormGroup({
    id_mascota: new FormControl<number | null>(null, [Validators.required]),
    fecha_cita: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, momentoFuturo('Elige una fecha y hora futuras')],
    }),
    motivo: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.maxLength(200)] }),
  });

  protected readonly minimo = aFechaHoraLocal(new Date().toISOString());
  protected readonly enviando = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly mensajeDeCampo = mensajeDeCampo;

  protected cerrar(): void {
    this.referencia.close(false);
  }

  protected async guardar(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.enviando.set(true);
    this.error.set(null);
    const { id_mascota, fecha_cita, motivo } = this.form.getRawValue();
    try {
      await this.api.invoke(crearCita, {
        body: {
          id_mascota: id_mascota!,
          id_profesional: this.datos.profesional.id_profesional,
          fecha_cita: desdeFechaHoraLocal(fecha_cita),
          motivo: motivo.trim(),
        },
      });
      this.avisos.exito('Cita agendada');
      this.referencia.close(true);
    } catch (error) {
      if (error instanceof HttpErrorResponse && (error.status === 409 || error.status === 400)) {
        this.form.controls.fecha_cita.setErrors({ servidor: mensajeDeError(error) });
      } else if (!aplicarErroresDeCampo(this.form, error)) {
        this.error.set(mensajeDeError(error));
      }
    } finally {
      this.enviando.set(false);
    }
  }
}

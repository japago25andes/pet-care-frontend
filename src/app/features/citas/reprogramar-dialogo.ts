import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { Api } from '../../core/api/api';
import { actualizarCita } from '../../core/api/functions';
import { CitaOut } from '../../core/api/models/cita-out';
import { CitaUpdate } from '../../core/api/models/cita-update';
import { Avisos } from '../../core/avisos';
import { aplicarErroresDeCampo, mensajeDeCampo, mensajeDeError } from '../../core/errores';
import { aFechaHoraLocal, desdeFechaHoraLocal } from '../../core/fechas';
import { momentoFuturo } from '../../core/formularios';

@Component({
  selector: 'app-reprogramar-dialogo',
  imports: [MatButtonModule, MatDialogModule, MatFormFieldModule, MatInputModule, ReactiveFormsModule],
  templateUrl: './reprogramar-dialogo.html',
})
export class ReprogramarDialogo {
  private readonly api = inject(Api);
  private readonly avisos = inject(Avisos);
  private readonly referencia = inject(MatDialogRef<ReprogramarDialogo>);
  protected readonly cita = inject<CitaOut>(MAT_DIALOG_DATA);

  private readonly fechaOriginal = aFechaHoraLocal(this.cita.fecha_cita);

  protected readonly form = new FormGroup({
    fecha_cita: new FormControl(this.fechaOriginal, {
      nonNullable: true,
      validators: [Validators.required, momentoFuturo('Elige una fecha y hora futuras')],
    }),
    motivo: new FormControl(this.cita.motivo, {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(200)],
    }),
  });

  protected readonly minimo = aFechaHoraLocal(new Date().toISOString());
  protected readonly enviando = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly mensajeDeCampo = mensajeDeCampo;

  protected async guardar(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.enviando.set(true);
    this.error.set(null);
    const { fecha_cita, motivo } = this.form.getRawValue();
    const body: CitaUpdate = { motivo: motivo.trim() };
    if (fecha_cita !== this.fechaOriginal) {
      body.fecha_cita = desdeFechaHoraLocal(fecha_cita);
    }
    try {
      await this.api.invoke(actualizarCita, { id_cita: this.cita.id_cita, body });
      this.avisos.exito('Cita actualizada');
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

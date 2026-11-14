import { Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { Api } from '../../../../core/api/api';
import { actualizarRecordatorio, crearRecordatorio } from '../../../../core/api/functions';
import { RecordatorioCreate } from '../../../../core/api/models/recordatorio-create';
import { RecordatorioOut } from '../../../../core/api/models/recordatorio-out';
import { Avisos } from '../../../../core/avisos';
import { aplicarErroresDeCampo, mensajeDeCampo, mensajeDeError } from '../../../../core/errores';
import { aFechaHoraLocal, desdeFechaHoraLocal } from '../../../../core/fechas';
import { sinVacios } from '../../../../core/formularios';
import { FRECUENCIAS, TIPOS_RECORDATORIO } from '../../etiquetas';

@Component({
  selector: 'app-recordatorio-dialogo',
  imports: [
    MatButtonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    ReactiveFormsModule,
  ],
  templateUrl: './recordatorio-dialogo.html',
})
export class RecordatorioDialogo {
  private readonly api = inject(Api);
  private readonly avisos = inject(Avisos);
  private readonly referencia = inject(MatDialogRef<RecordatorioDialogo>);
  protected readonly datos = inject<{ idMascota: number; recordatorio?: RecordatorioOut }>(MAT_DIALOG_DATA);

  private readonly recordatorio = this.datos.recordatorio;
  private readonly fechaOriginal = this.recordatorio ? aFechaHoraLocal(this.recordatorio.fecha_programada) : '';

  protected readonly form = new FormGroup({
    titulo: new FormControl(this.recordatorio?.titulo ?? '', {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(100)],
    }),
    tipo: new FormControl((this.recordatorio?.tipo ?? 'otro') as RecordatorioCreate['tipo'], {
      nonNullable: true,
      validators: [Validators.required],
    }),
    fecha_programada: new FormControl(this.fechaOriginal, {
      nonNullable: true,
      validators: [Validators.required],
    }),
    frecuencia: new FormControl((this.recordatorio?.frecuencia ?? 'unica') as NonNullable<RecordatorioCreate['frecuencia']>, {
      nonNullable: true,
    }),
    descripcion: new FormControl(this.recordatorio?.descripcion ?? '', {
      nonNullable: true,
      validators: [Validators.maxLength(5000)],
    }),
  });

  protected readonly tipos = TIPOS_RECORDATORIO;
  protected readonly frecuencias = FRECUENCIAS;
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
    const { fecha_programada, ...resto } = sinVacios(this.form.getRawValue());
    const fecha = desdeFechaHoraLocal(fecha_programada);
    try {
      if (this.recordatorio) {
        // Si se envía la fecha el back lo deja pendiente otra vez, así que solo va cuando cambió.
        const cambioFecha = fecha_programada !== this.fechaOriginal;
        await this.api.invoke(actualizarRecordatorio, {
          id_recordatorio: this.recordatorio.id_recordatorio,
          body: cambioFecha ? { ...resto, fecha_programada: fecha } : resto,
        });
      } else {
        await this.api.invoke(crearRecordatorio, {
          id_mascota: this.datos.idMascota,
          body: { ...resto, fecha_programada: fecha },
        });
      }
      this.avisos.exito('Recordatorio guardado');
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

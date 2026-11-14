import { Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { Api } from '../../../../core/api/api';
import { actualizarMedicamento, crearMedicamento } from '../../../../core/api/functions';
import { MedicamentoOut } from '../../../../core/api/models/medicamento-out';
import { Avisos } from '../../../../core/avisos';
import { aplicarErroresDeCampo, mensajeDeCampo, mensajeDeError } from '../../../../core/errores';
import { hoyISO } from '../../../../core/fechas';
import { fechaPosterior, sinVacios } from '../../../../core/formularios';

function opcional(valor: string | null | undefined, maximo: number) {
  return new FormControl(valor ?? '', { nonNullable: true, validators: [Validators.maxLength(maximo)] });
}

@Component({
  selector: 'app-medicamento-dialogo',
  imports: [MatButtonModule, MatDialogModule, MatFormFieldModule, MatInputModule, ReactiveFormsModule],
  templateUrl: './medicamento-dialogo.html',
})
export class MedicamentoDialogo {
  private readonly api = inject(Api);
  private readonly avisos = inject(Avisos);
  private readonly referencia = inject(MatDialogRef<MedicamentoDialogo>);
  protected readonly datos = inject<{ idMascota: number; medicamento?: MedicamentoOut }>(MAT_DIALOG_DATA);

  private readonly medicamento = this.datos.medicamento;

  protected readonly form = new FormGroup({
    nombre_medicamento: new FormControl(this.medicamento?.nombre_medicamento ?? '', {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(100)],
    }),
    dosis: opcional(this.medicamento?.dosis, 50),
    unidad_medida: opcional(this.medicamento?.unidad_medida, 20),
    frecuencia_administracion: opcional(this.medicamento?.frecuencia_administracion, 50),
    fecha_inicio: new FormControl(this.medicamento?.fecha_inicio ?? hoyISO(), {
      nonNullable: true,
      validators: [Validators.required],
    }),
    fecha_fin: new FormControl(this.medicamento?.fecha_fin ?? '', {
      nonNullable: true,
      validators: [fechaPosterior('fecha_inicio', 'No puede ser anterior al inicio')],
    }),
    observaciones: opcional(this.medicamento?.observaciones, 5000),
  });

  protected readonly enviando = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly mensajeDeCampo = mensajeDeCampo;

  constructor() {
    this.form.controls.fecha_inicio.valueChanges.subscribe(() => this.form.controls.fecha_fin.updateValueAndValidity());
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
      if (this.medicamento) {
        await this.api.invoke(actualizarMedicamento, { id_medicamento: this.medicamento.id_medicamento, body });
      } else {
        await this.api.invoke(crearMedicamento, { id_mascota: this.datos.idMascota, body });
      }
      this.avisos.exito('Medicamento guardado');
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

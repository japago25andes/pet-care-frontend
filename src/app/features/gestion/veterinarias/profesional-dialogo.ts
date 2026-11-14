import { Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { Api } from '../../../core/api/api';
import { actualizarProfesional, crearProfesional } from '../../../core/api/functions';
import { ProfesionalOut } from '../../../core/api/models/profesional-out';
import { Avisos } from '../../../core/avisos';
import { aplicarErroresDeCampo, mensajeDeCampo, mensajeDeError } from '../../../core/errores';
import { sinVacios } from '../../../core/formularios';

function opcional(valor: string | null | undefined, maximo: number, ...extra: ReturnType<typeof Validators.maxLength>[]) {
  return new FormControl(valor ?? '', { nonNullable: true, validators: [Validators.maxLength(maximo), ...extra] });
}

@Component({
  selector: 'app-profesional-dialogo',
  imports: [MatButtonModule, MatDialogModule, MatFormFieldModule, MatInputModule, ReactiveFormsModule],
  templateUrl: './profesional-dialogo.html',
})
export class ProfesionalDialogo {
  private readonly api = inject(Api);
  private readonly avisos = inject(Avisos);
  private readonly referencia = inject(MatDialogRef<ProfesionalDialogo>);
  protected readonly datos = inject<{ idVeterinaria: number; profesional?: ProfesionalOut }>(MAT_DIALOG_DATA);

  private readonly profesional = this.datos.profesional;

  protected readonly form = new FormGroup({
    nombre_completo: new FormControl(this.profesional?.nombre_completo ?? '', {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(100)],
    }),
    especialidad: opcional(this.profesional?.especialidad, 50),
    numero_registro_profesional: opcional(this.profesional?.numero_registro_profesional, 30),
    telefono: opcional(this.profesional?.telefono, 20),
    correo_electronico: opcional(this.profesional?.correo_electronico, 100, Validators.email),
  });

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
    const body = sinVacios(this.form.getRawValue());
    try {
      if (this.profesional) {
        await this.api.invoke(actualizarProfesional, { id_profesional: this.profesional.id_profesional, body });
      } else {
        await this.api.invoke(crearProfesional, { id_veterinaria: this.datos.idVeterinaria, body });
      }
      this.avisos.exito('Profesional guardado');
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

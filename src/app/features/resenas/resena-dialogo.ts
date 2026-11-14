import { Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { Api } from '../../core/api/api';
import { actualizarResena, crearResena } from '../../core/api/functions';
import { ResenaOut } from '../../core/api/models/resena-out';
import { Avisos } from '../../core/avisos';
import { mensajeDeCampo, mensajeDeError } from '../../core/errores';
import { sinVacios } from '../../core/formularios';

export interface DatosResena {
  idVeterinaria: number;
  nombreVeterinaria: string;
  idPedido?: number;
  resena?: ResenaOut;
}

@Component({
  selector: 'app-resena-dialogo',
  imports: [MatButtonModule, MatDialogModule, MatFormFieldModule, MatIconModule, MatInputModule, ReactiveFormsModule],
  templateUrl: './resena-dialogo.html',
  styles: `
    .estrellas {
      display: flex;
      gap: 2px;
      justify-content: center;
      margin: 0;
      padding: 0;
      border: 0;
    }
    .estrellas button {
      padding: 2px;
      border: 0;
      background: none;
      color: var(--pel-borde);
      cursor: pointer;
    }
    .estrellas button.llena {
      color: var(--pel-azul);
    }
    .estrellas mat-icon {
      width: 40px;
      height: 40px;
      font-size: 40px;
      font-variation-settings: 'FILL' 1;
    }
    .falta {
      color: var(--pel-error);
      font-size: 13px;
      text-align: center;
    }
  `,
})
export class ResenaDialogo {
  private readonly api = inject(Api);
  private readonly avisos = inject(Avisos);
  private readonly referencia = inject(MatDialogRef<ResenaDialogo>);
  protected readonly datos = inject<DatosResena>(MAT_DIALOG_DATA);

  protected readonly form = new FormGroup({
    calificacion: new FormControl<number | null>(this.datos.resena?.calificacion ?? null, [Validators.required]),
    comentario: new FormControl(this.datos.resena?.comentario ?? '', {
      nonNullable: true,
      validators: [Validators.maxLength(5000)],
    }),
  });

  protected readonly valores = [1, 2, 3, 4, 5];
  protected readonly seleccion = signal(this.datos.resena?.calificacion ?? 0);
  protected readonly faltaCalificacion = signal(false);
  protected readonly enviando = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly mensajeDeCampo = mensajeDeCampo;

  protected elegir(valor: number): void {
    this.seleccion.set(valor);
    this.form.controls.calificacion.setValue(valor);
    this.faltaCalificacion.set(false);
  }

  protected async guardar(): Promise<void> {
    if (this.form.invalid) {
      this.faltaCalificacion.set(this.form.controls.calificacion.invalid);
      this.form.markAllAsTouched();
      return;
    }
    this.enviando.set(true);
    this.error.set(null);
    const { calificacion, comentario } = sinVacios(this.form.getRawValue());
    try {
      if (this.datos.resena) {
        await this.api.invoke(actualizarResena, {
          id_resena: this.datos.resena.id_resena,
          body: { calificacion, comentario },
        });
      } else {
        await this.api.invoke(crearResena, {
          id_veterinaria: this.datos.idVeterinaria,
          body: { calificacion: calificacion!, comentario, id_pedido: this.datos.idPedido ?? null },
        });
      }
      this.avisos.exito('¡Gracias por tu reseña!');
      this.referencia.close(true);
    } catch (error) {
      this.error.set(mensajeDeError(error));
    } finally {
      this.enviando.set(false);
    }
  }
}

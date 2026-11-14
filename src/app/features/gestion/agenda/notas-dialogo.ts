import { Component, inject, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { Api } from '../../../core/api/api';
import { actualizarCita } from '../../../core/api/functions';
import { CitaOut } from '../../../core/api/models/cita-out';
import { Avisos } from '../../../core/avisos';
import { mensajeDeCampo, mensajeDeError } from '../../../core/errores';

@Component({
  selector: 'app-notas-dialogo',
  imports: [MatButtonModule, MatDialogModule, MatFormFieldModule, MatInputModule, ReactiveFormsModule],
  template: `
    <h2 mat-dialog-title>Notas de la cita</h2>
    <mat-dialog-content class="formulario">
      <p class="pagina-subtitulo" style="margin: 0">
        {{ cita.nombre_mascota }} · {{ cita.motivo }}. El dueño puede leerlas.
      </p>
      @if (error(); as mensaje) {
        <p class="aviso aviso--error" role="alert">{{ mensaje }}</p>
      }
      <mat-form-field>
        <mat-label>Notas</mat-label>
        <textarea matInput rows="4" [formControl]="notas"></textarea>
        <mat-error>{{ mensajeDeCampo(notas) }}</mat-error>
      </mat-form-field>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button matButton type="button" mat-dialog-close>Cancelar</button>
      <button matButton="filled" type="button" [disabled]="enviando()" (click)="guardar()">Guardar</button>
    </mat-dialog-actions>
  `,
})
export class NotasDialogo {
  private readonly api = inject(Api);
  private readonly avisos = inject(Avisos);
  private readonly referencia = inject(MatDialogRef<NotasDialogo>);
  protected readonly cita = inject<CitaOut>(MAT_DIALOG_DATA);

  protected readonly notas = new FormControl(this.cita.notas ?? '', {
    nonNullable: true,
    validators: [Validators.maxLength(5000)],
  });
  protected readonly enviando = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly mensajeDeCampo = mensajeDeCampo;

  protected async guardar(): Promise<void> {
    if (this.notas.invalid) {
      this.notas.markAsTouched();
      return;
    }
    this.enviando.set(true);
    this.error.set(null);
    try {
      await this.api.invoke(actualizarCita, {
        id_cita: this.cita.id_cita,
        body: { notas: this.notas.value.trim() || null },
      });
      this.avisos.exito('Notas guardadas');
      this.referencia.close(true);
    } catch (error) {
      this.error.set(mensajeDeError(error));
    } finally {
      this.enviando.set(false);
    }
  }
}

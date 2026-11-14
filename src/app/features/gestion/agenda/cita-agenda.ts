import { DatePipe } from '@angular/common';
import { Component, computed, inject, input, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { Api } from '../../../core/api/api';
import { cambiarEstadoCita } from '../../../core/api/functions';
import { CitaEstadoUpdate } from '../../../core/api/models/cita-estado-update';
import { CitaOut } from '../../../core/api/models/cita-out';
import { Avisos } from '../../../core/avisos';
import { Confirmacion } from '../../../shared/confirmacion/confirmacion';
import { Etiqueta } from '../../../shared/etiqueta/etiqueta';
import { citaActiva, estadoCita } from '../../citas/etiquetas';
import { NotasDialogo } from './notas-dialogo';

/** Fila de una cita vista por la veterinaria, con las acciones que permite su estado. */
@Component({
  selector: 'app-cita-agenda',
  imports: [DatePipe, Etiqueta, MatButtonModule, MatIconModule, MatMenuModule, RouterLink],
  templateUrl: './cita-agenda.html',
  styleUrl: './cita-agenda.scss',
})
export class CitaAgenda {
  private readonly api = inject(Api);
  private readonly avisos = inject(Avisos);
  private readonly confirmacion = inject(Confirmacion);
  private readonly dialog = inject(MatDialog);

  readonly cita = input.required<CitaOut>();
  readonly actualizada = output<void>();

  protected readonly estado = computed(() => estadoCita(this.cita().estado));
  protected readonly activa = computed(() => citaActiva(this.cita()));

  protected async cambiar(estado: CitaEstadoUpdate['estado'], mensaje: string): Promise<void> {
    try {
      await this.api.invoke(cambiarEstadoCita, { id_cita: this.cita().id_cita, body: { estado } });
      this.avisos.exito(mensaje);
      this.actualizada.emit();
    } catch (error) {
      this.avisos.error(error);
    }
  }

  protected async cancelar(): Promise<void> {
    const confirmado = await this.confirmacion.pedir({
      titulo: '¿Cancelar esta cita?',
      mensaje: `La cita de ${this.cita().nombre_mascota} (${this.cita().nombre_dueno}) quedará cancelada.`,
      accion: 'Cancelar cita',
    });
    if (confirmado) {
      await this.cambiar('cancelada', 'Cita cancelada');
    }
  }

  protected async notas(): Promise<void> {
    const referencia = this.dialog.open(NotasDialogo, { data: this.cita(), width: '480px', maxWidth: '95vw' });
    if (await firstValueFrom(referencia.afterClosed())) {
      this.actualizada.emit();
    }
  }
}

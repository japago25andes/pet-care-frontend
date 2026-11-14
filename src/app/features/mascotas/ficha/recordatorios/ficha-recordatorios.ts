import { DatePipe } from '@angular/common';
import { Component, inject, input, resource } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { firstValueFrom } from 'rxjs';
import { Api } from '../../../../core/api/api';
import {
  eliminarRecordatorio,
  listarRecordatoriosMascota,
  marcarRecordatorioNotificado,
} from '../../../../core/api/functions';
import { RecordatorioOut } from '../../../../core/api/models/recordatorio-out';
import { Avisos } from '../../../../core/avisos';
import { Carga } from '../../../../shared/carga/carga';
import { Confirmacion } from '../../../../shared/confirmacion/confirmacion';
import { Etiqueta } from '../../../../shared/etiqueta/etiqueta';
import { Vacio } from '../../../../shared/vacio/vacio';
import { estaVencido, estadoRecordatorio, iconoRecordatorio, textoFrecuencia } from '../../etiquetas';
import { RecordatorioDialogo } from './recordatorio-dialogo';

@Component({
  selector: 'app-ficha-recordatorios',
  imports: [Carga, DatePipe, Etiqueta, MatButtonModule, MatIconModule, MatMenuModule, Vacio],
  templateUrl: './ficha-recordatorios.html',
})
export class FichaRecordatorios {
  private readonly api = inject(Api);
  private readonly dialog = inject(MatDialog);
  private readonly avisos = inject(Avisos);
  private readonly confirmacion = inject(Confirmacion);

  readonly idMascota = input.required<number>();

  protected readonly recordatorios = resource({
    params: () => ({ id_mascota: this.idMascota() }),
    loader: ({ params }) => this.api.invoke(listarRecordatoriosMascota, params),
  });
  protected readonly estado = estadoRecordatorio;
  protected readonly vencido = estaVencido;
  protected readonly icono = iconoRecordatorio;
  protected readonly frecuencia = textoFrecuencia;

  protected async abrir(recordatorio?: RecordatorioOut): Promise<void> {
    const referencia = this.dialog.open(RecordatorioDialogo, {
      data: { idMascota: this.idMascota(), recordatorio },
      width: '520px',
      maxWidth: '95vw',
    });
    if (await firstValueFrom(referencia.afterClosed())) {
      this.recordatorios.reload();
    }
  }

  protected async marcarHecho(recordatorio: RecordatorioOut): Promise<void> {
    try {
      await this.api.invoke(marcarRecordatorioNotificado, { id_recordatorio: recordatorio.id_recordatorio });
      this.avisos.exito('Recordatorio marcado como hecho');
      this.recordatorios.reload();
    } catch (error) {
      this.avisos.error(error);
    }
  }

  protected async eliminar(recordatorio: RecordatorioOut): Promise<void> {
    const confirmado = await this.confirmacion.pedir({
      titulo: '¿Eliminar este recordatorio?',
      mensaje: `"${recordatorio.titulo}" dejará de avisarte.`,
      accion: 'Eliminar',
    });
    if (!confirmado) {
      return;
    }
    try {
      await this.api.invoke(eliminarRecordatorio, { id_recordatorio: recordatorio.id_recordatorio });
      this.avisos.exito('Recordatorio eliminado');
      this.recordatorios.reload();
    } catch (error) {
      this.avisos.error(error);
    }
  }
}

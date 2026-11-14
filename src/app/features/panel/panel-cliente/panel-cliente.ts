import { DatePipe } from '@angular/common';
import { Component, computed, inject, resource } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { Api } from '../../../core/api/api';
import {
  contarNoLeidos,
  listarCitas,
  listarMascotas,
  listarMisRecordatorios,
  marcarRecordatorioNotificado,
} from '../../../core/api/functions';
import { RecordatorioOut } from '../../../core/api/models/recordatorio-out';
import { AuthService } from '../../../core/auth/auth.service';
import { Avisos } from '../../../core/avisos';
import { edad } from '../../../core/fechas';
import { AvatarMascota } from '../../../shared/avatar-mascota/avatar-mascota';
import { Carga } from '../../../shared/carga/carga';
import { Etiqueta } from '../../../shared/etiqueta/etiqueta';
import { Vacio } from '../../../shared/vacio/vacio';
import { citaActiva, estadoCita } from '../../citas/etiquetas';
import { iconoRecordatorio } from '../../mascotas/etiquetas';

const CITAS_VISIBLES = 3;

@Component({
  selector: 'app-panel-cliente',
  imports: [AvatarMascota, Carga, DatePipe, Etiqueta, MatButtonModule, MatIconModule, RouterLink, Vacio],
  templateUrl: './panel-cliente.html',
  styleUrl: './panel-cliente.scss',
})
export class PanelCliente {
  private readonly api = inject(Api);
  private readonly auth = inject(AuthService);
  private readonly avisos = inject(Avisos);

  protected readonly nombre = computed(() => this.auth.usuario()?.nombre_completo.split(' ')[0] ?? '');

  protected readonly mascotas = resource({ loader: () => this.api.invoke(listarMascotas) });
  protected readonly recordatorios = resource({
    loader: () => this.api.invoke(listarMisRecordatorios, { pendientes: true }),
  });
  protected readonly citas = resource({
    loader: async () => {
      const citas = await this.api.invoke(listarCitas, { desde: new Date().toISOString() });
      return citas.filter(citaActiva).slice(0, CITAS_VISIBLES);
    },
  });
  protected readonly noLeidos = resource({ loader: () => this.api.invoke(contarNoLeidos) });

  protected readonly estado = estadoCita;
  protected readonly icono = iconoRecordatorio;
  protected readonly edad = edad;

  protected nombreMascota(idMascota: number): string {
    return this.mascotas.hasValue()
      ? (this.mascotas.value().find((mascota) => mascota.id_mascota === idMascota)?.nombre ?? '')
      : '';
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
}

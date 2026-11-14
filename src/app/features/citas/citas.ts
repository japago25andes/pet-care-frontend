import { DatePipe, NgTemplateOutlet } from '@angular/common';
import { Component, computed, inject, resource } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatTabsModule } from '@angular/material/tabs';
import { RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { Api } from '../../core/api/api';
import { cambiarEstadoCita, listarCitas } from '../../core/api/functions';
import { CitaOut } from '../../core/api/models/cita-out';
import { Avisos } from '../../core/avisos';
import { Carga } from '../../shared/carga/carga';
import { Confirmacion } from '../../shared/confirmacion/confirmacion';
import { Etiqueta } from '../../shared/etiqueta/etiqueta';
import { Vacio } from '../../shared/vacio/vacio';
import { citaActiva, estadoCita } from './etiquetas';
import { ReprogramarDialogo } from './reprogramar-dialogo';

const LIMITE = 100;

@Component({
  selector: 'app-citas',
  imports: [
    Carga,
    DatePipe,
    Etiqueta,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatTabsModule,
    NgTemplateOutlet,
    RouterLink,
    Vacio,
  ],
  templateUrl: './citas.html',
})
export class Citas {
  private readonly api = inject(Api);
  private readonly dialog = inject(MatDialog);
  private readonly avisos = inject(Avisos);
  private readonly confirmacion = inject(Confirmacion);

  protected readonly citas = resource({ loader: () => this.api.invoke(listarCitas, { limit: LIMITE }) });
  protected readonly estado = estadoCita;

  protected readonly proximas = computed(() =>
    this.citas.hasValue() ? this.citas.value().filter((cita) => this.esProxima(cita)) : [],
  );
  protected readonly historial = computed(() =>
    this.citas.hasValue()
      ? this.citas
          .value()
          .filter((cita) => !this.esProxima(cita))
          .reverse()
      : [],
  );

  private esProxima(cita: CitaOut): boolean {
    return citaActiva(cita) && new Date(cita.fecha_cita) > new Date();
  }

  protected async reprogramar(cita: CitaOut): Promise<void> {
    const referencia = this.dialog.open(ReprogramarDialogo, { data: cita, width: '480px', maxWidth: '95vw' });
    if (await firstValueFrom(referencia.afterClosed())) {
      this.citas.reload();
    }
  }

  protected async cancelar(cita: CitaOut): Promise<void> {
    const confirmado = await this.confirmacion.pedir({
      titulo: '¿Cancelar esta cita?',
      mensaje: `"${cita.motivo}" de ${cita.nombre_mascota} quedará cancelada. Para volver a ir tendrás que agendar otra.`,
      accion: 'Cancelar cita',
    });
    if (!confirmado) {
      return;
    }
    try {
      await this.api.invoke(cambiarEstadoCita, { id_cita: cita.id_cita, body: { estado: 'cancelada' } });
      this.avisos.exito('Cita cancelada');
      this.citas.reload();
    } catch (error) {
      this.avisos.error(error);
    }
  }
}

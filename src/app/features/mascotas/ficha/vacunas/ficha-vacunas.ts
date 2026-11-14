import { DatePipe } from '@angular/common';
import { Component, inject, input, resource } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { firstValueFrom } from 'rxjs';
import { Api } from '../../../../core/api/api';
import { eliminarVacuna, listarVacunas } from '../../../../core/api/functions';
import { VacunaOut } from '../../../../core/api/models/vacuna-out';
import { Avisos } from '../../../../core/avisos';
import { Carga } from '../../../../shared/carga/carga';
import { Confirmacion } from '../../../../shared/confirmacion/confirmacion';
import { Etiqueta } from '../../../../shared/etiqueta/etiqueta';
import { Vacio } from '../../../../shared/vacio/vacio';
import { estadoVacuna } from '../../etiquetas';
import { VacunaDialogo } from './vacuna-dialogo';

@Component({
  selector: 'app-ficha-vacunas',
  imports: [Carga, DatePipe, Etiqueta, MatButtonModule, MatIconModule, MatMenuModule, Vacio],
  templateUrl: './ficha-vacunas.html',
})
export class FichaVacunas {
  private readonly api = inject(Api);
  private readonly dialog = inject(MatDialog);
  private readonly avisos = inject(Avisos);
  private readonly confirmacion = inject(Confirmacion);

  readonly idMascota = input.required<number>();

  protected readonly vacunas = resource({
    params: () => ({ id_mascota: this.idMascota() }),
    loader: ({ params }) => this.api.invoke(listarVacunas, params),
  });
  protected readonly estado = estadoVacuna;

  protected aplicadoPor(vacuna: VacunaOut): string {
    return [vacuna.veterinario_nombre, vacuna.lote ? `Lote ${vacuna.lote}` : null].filter(Boolean).join(' · ');
  }

  protected async abrir(vacuna?: VacunaOut): Promise<void> {
    const referencia = this.dialog.open(VacunaDialogo, {
      data: { idMascota: this.idMascota(), vacuna },
      width: '520px',
      maxWidth: '95vw',
    });
    if (await firstValueFrom(referencia.afterClosed())) {
      this.vacunas.reload();
    }
  }

  protected async eliminar(vacuna: VacunaOut): Promise<void> {
    const confirmado = await this.confirmacion.pedir({
      titulo: '¿Eliminar esta vacuna?',
      mensaje: `Se borrará "${vacuna.nombre_vacuna}" del carné de forma definitiva.`,
      accion: 'Eliminar',
    });
    if (!confirmado) {
      return;
    }
    try {
      await this.api.invoke(eliminarVacuna, { id_vacuna: vacuna.id_vacuna });
      this.avisos.exito('Vacuna eliminada');
      this.vacunas.reload();
    } catch (error) {
      this.avisos.error(error);
    }
  }
}

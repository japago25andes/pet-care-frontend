import { DatePipe } from '@angular/common';
import { Component, inject, input, resource } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { firstValueFrom } from 'rxjs';
import { Api } from '../../../../core/api/api';
import { eliminarMedicamento, listarMedicamentos } from '../../../../core/api/functions';
import { MedicamentoOut } from '../../../../core/api/models/medicamento-out';
import { Avisos } from '../../../../core/avisos';
import { Carga } from '../../../../shared/carga/carga';
import { Confirmacion } from '../../../../shared/confirmacion/confirmacion';
import { Etiqueta } from '../../../../shared/etiqueta/etiqueta';
import { Vacio } from '../../../../shared/vacio/vacio';
import { estadoMedicamento } from '../../etiquetas';
import { MedicamentoDialogo } from './medicamento-dialogo';

@Component({
  selector: 'app-ficha-medicamentos',
  imports: [Carga, DatePipe, Etiqueta, MatButtonModule, MatIconModule, MatMenuModule, Vacio],
  templateUrl: './ficha-medicamentos.html',
})
export class FichaMedicamentos {
  private readonly api = inject(Api);
  private readonly dialog = inject(MatDialog);
  private readonly avisos = inject(Avisos);
  private readonly confirmacion = inject(Confirmacion);

  readonly idMascota = input.required<number>();

  protected readonly medicamentos = resource({
    params: () => ({ id_mascota: this.idMascota() }),
    loader: ({ params }) => this.api.invoke(listarMedicamentos, params),
  });
  protected readonly estado = estadoMedicamento;

  protected async abrir(medicamento?: MedicamentoOut): Promise<void> {
    const referencia = this.dialog.open(MedicamentoDialogo, {
      data: { idMascota: this.idMascota(), medicamento },
      width: '520px',
      maxWidth: '95vw',
    });
    if (await firstValueFrom(referencia.afterClosed())) {
      this.medicamentos.reload();
    }
  }

  protected async eliminar(medicamento: MedicamentoOut): Promise<void> {
    const confirmado = await this.confirmacion.pedir({
      titulo: '¿Eliminar este medicamento?',
      mensaje: `"${medicamento.nombre_medicamento}" dejará de aparecer en la ficha.`,
      accion: 'Eliminar',
    });
    if (!confirmado) {
      return;
    }
    try {
      await this.api.invoke(eliminarMedicamento, { id_medicamento: medicamento.id_medicamento });
      this.avisos.exito('Medicamento eliminado');
      this.medicamentos.reload();
    } catch (error) {
      this.avisos.error(error);
    }
  }
}

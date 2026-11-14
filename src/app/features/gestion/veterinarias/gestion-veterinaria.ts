import { Component, inject, input, numberAttribute, resource } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { Router, RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { Api } from '../../../core/api/api';
import {
  eliminarProfesional,
  eliminarVeterinaria,
  listarProfesionales,
  obtenerVeterinaria,
} from '../../../core/api/functions';
import { ProfesionalOut } from '../../../core/api/models/profesional-out';
import { VeterinariaOut } from '../../../core/api/models/veterinaria-out';
import { Avisos } from '../../../core/avisos';
import { Calificacion } from '../../../shared/calificacion/calificacion';
import { Carga } from '../../../shared/carga/carga';
import { Confirmacion } from '../../../shared/confirmacion/confirmacion';
import { Vacio } from '../../../shared/vacio/vacio';
import { ProfesionalDialogo } from './profesional-dialogo';
import { VeterinariaDialogo } from './veterinaria-dialogo';

@Component({
  selector: 'app-gestion-veterinaria',
  imports: [Calificacion, Carga, MatButtonModule, MatIconModule, MatMenuModule, RouterLink, Vacio],
  templateUrl: './gestion-veterinaria.html',
  styleUrl: './gestion-veterinaria.scss',
})
export class GestionVeterinaria {
  private readonly api = inject(Api);
  private readonly avisos = inject(Avisos);
  private readonly confirmacion = inject(Confirmacion);
  private readonly dialog = inject(MatDialog);
  private readonly router = inject(Router);

  /** Parámetro de la ruta */
  readonly id = input.required({ transform: numberAttribute });

  private readonly parametros = () => ({ id_veterinaria: this.id() });
  protected readonly veterinaria = resource({
    params: this.parametros,
    loader: ({ params }) => this.api.invoke(obtenerVeterinaria, params),
  });
  protected readonly profesionales = resource({
    params: this.parametros,
    loader: ({ params }) => this.api.invoke(listarProfesionales, params),
  });

  protected async editar(veterinaria: VeterinariaOut): Promise<void> {
    const referencia = this.dialog.open(VeterinariaDialogo, { data: veterinaria, width: '560px', maxWidth: '95vw' });
    if (await firstValueFrom(referencia.afterClosed())) {
      this.veterinaria.reload();
    }
  }

  protected async desactivar(veterinaria: VeterinariaOut): Promise<void> {
    const confirmado = await this.confirmacion.pedir({
      titulo: `¿Desactivar ${veterinaria.nombre_comercial}?`,
      mensaje: 'Dejará de aparecer en la búsqueda y en la tienda. Solo un administrador puede reactivarla.',
      accion: 'Desactivar',
    });
    if (!confirmado) {
      return;
    }
    try {
      await this.api.invoke(eliminarVeterinaria, { id_veterinaria: veterinaria.id_veterinaria });
      this.avisos.exito('Veterinaria desactivada');
      await this.router.navigateByUrl('/mis-veterinarias');
    } catch (error) {
      this.avisos.error(error);
    }
  }

  protected async abrirProfesional(profesional?: ProfesionalOut): Promise<void> {
    const referencia = this.dialog.open(ProfesionalDialogo, {
      data: { idVeterinaria: this.id(), profesional },
      width: '560px',
      maxWidth: '95vw',
    });
    if (await firstValueFrom(referencia.afterClosed())) {
      this.profesionales.reload();
    }
  }

  protected async desactivarProfesional(profesional: ProfesionalOut): Promise<void> {
    const confirmado = await this.confirmacion.pedir({
      titulo: `¿Desactivar a ${profesional.nombre_completo}?`,
      mensaje: 'Ya no se le podrán agendar citas. Las citas que tiene se conservan.',
      accion: 'Desactivar',
    });
    if (!confirmado) {
      return;
    }
    try {
      await this.api.invoke(eliminarProfesional, { id_profesional: profesional.id_profesional });
      this.avisos.exito('Profesional desactivado');
      this.profesionales.reload();
    } catch (error) {
      this.avisos.error(error);
    }
  }
}

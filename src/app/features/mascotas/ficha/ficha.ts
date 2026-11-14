import { DecimalPipe } from '@angular/common';
import { Component, computed, inject, input, numberAttribute, resource } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { Router, RouterLink } from '@angular/router';
import { Api } from '../../../core/api/api';
import { eliminarMascota, obtenerMascota } from '../../../core/api/functions';
import { Avisos } from '../../../core/avisos';
import { edad } from '../../../core/fechas';
import { AvatarMascota } from '../../../shared/avatar-mascota/avatar-mascota';
import { Carga } from '../../../shared/carga/carga';
import { Confirmacion } from '../../../shared/confirmacion/confirmacion';
import { FichaMedicamentos } from './medicamentos/ficha-medicamentos';
import { FichaRecordatorios } from './recordatorios/ficha-recordatorios';
import { FichaVacunas } from './vacunas/ficha-vacunas';

@Component({
  selector: 'app-ficha',
  imports: [
    AvatarMascota,
    Carga,
    DecimalPipe,
    FichaMedicamentos,
    FichaRecordatorios,
    FichaVacunas,
    MatButtonModule,
    MatIconModule,
    MatTabsModule,
    RouterLink,
  ],
  templateUrl: './ficha.html',
  styleUrl: './ficha.scss',
})
export class Ficha {
  private readonly api = inject(Api);
  private readonly router = inject(Router);
  private readonly avisos = inject(Avisos);
  private readonly confirmacion = inject(Confirmacion);

  /** Parámetro de la ruta */
  readonly id = input.required({ transform: numberAttribute });

  protected readonly mascota = resource({
    params: () => ({ id_mascota: this.id() }),
    loader: ({ params }) => this.api.invoke(obtenerMascota, params),
  });

  protected readonly descripcion = computed(() => {
    if (!this.mascota.hasValue()) {
      return '';
    }
    const { especie, raza, sexo, fecha_nacimiento } = this.mascota.value();
    return [raza ?? especie, sexo, fecha_nacimiento ? edad(fecha_nacimiento) : null].filter(Boolean).join(' · ');
  });

  protected async eliminar(): Promise<void> {
    if (!this.mascota.hasValue()) {
      return;
    }
    const { nombre } = this.mascota.value();
    const confirmado = await this.confirmacion.pedir({
      titulo: `¿Eliminar a ${nombre}?`,
      mensaje: 'Se cancelarán sus citas futuras y se desactivarán sus recordatorios. Esta acción no se puede deshacer.',
      accion: 'Eliminar',
    });
    if (!confirmado) {
      return;
    }
    try {
      await this.api.invoke(eliminarMascota, { id_mascota: this.id() });
      this.avisos.exito(`Se eliminó a ${nombre} de tus mascotas`);
      await this.router.navigateByUrl('/mascotas');
    } catch (error) {
      this.avisos.error(error);
    }
  }
}

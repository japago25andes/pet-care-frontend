import { DatePipe } from '@angular/common';
import { Component, computed, inject, input, numberAttribute, resource } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { Router, RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { Api } from '../../../core/api/api';
import { eliminarResena, listarProfesionales, listarResenas, obtenerVeterinaria } from '../../../core/api/functions';
import { ProfesionalOut } from '../../../core/api/models/profesional-out';
import { ResenaOut } from '../../../core/api/models/resena-out';
import { AuthService } from '../../../core/auth/auth.service';
import { Avisos } from '../../../core/avisos';
import { Calificacion } from '../../../shared/calificacion/calificacion';
import { Carga } from '../../../shared/carga/carga';
import { Confirmacion } from '../../../shared/confirmacion/confirmacion';
import { Mapa, PuntoMapa } from '../../../shared/mapa/mapa';
import { Vacio } from '../../../shared/vacio/vacio';
import { AgendarDialogo } from '../../citas/agendar-dialogo';
import { ResenaDialogo } from '../../resenas/resena-dialogo';

@Component({
  selector: 'app-detalle',
  imports: [Calificacion, Carga, DatePipe, Mapa, MatButtonModule, MatIconModule, RouterLink, Vacio],
  templateUrl: './detalle.html',
  styleUrl: './detalle.scss',
})
export class Detalle {
  private readonly api = inject(Api);
  private readonly auth = inject(AuthService);
  private readonly dialog = inject(MatDialog);
  private readonly router = inject(Router);
  private readonly avisos = inject(Avisos);
  private readonly confirmacion = inject(Confirmacion);

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
  protected readonly resenas = resource({
    params: this.parametros,
    loader: ({ params }) => this.api.invoke(listarResenas, params),
  });

  /** Solo los clientes agendan; quien no ha entrado va al login al intentarlo. */
  protected readonly puedeAgendar = computed(() => !this.auth.autenticado() || this.auth.rol() === 'cliente');

  protected readonly punto = computed<PuntoMapa[]>(() => {
    if (!this.veterinaria.hasValue()) {
      return [];
    }
    const { latitud, longitud, nombre_comercial, direccion } = this.veterinaria.value();
    return latitud !== null && longitud !== null
      ? [{ lat: latitud, lng: longitud, titulo: nombre_comercial, detalle: direccion }]
      : [];
  });

  protected readonly miResena = computed(() => {
    const id = this.auth.usuario()?.id_usuario;
    return this.resenas.hasValue() ? this.resenas.value().find((resena) => resena.id_usuario === id) : undefined;
  });

  private irAlLogin(): Promise<boolean> {
    return this.router.navigate(['/login'], { queryParams: { volver: this.router.url } });
  }

  private recargarResenas(): void {
    this.resenas.reload();
    this.veterinaria.reload();
  }

  protected async abrirResena(resena?: ResenaOut): Promise<void> {
    if (!this.auth.autenticado()) {
      await this.irAlLogin();
      return;
    }
    const referencia = this.dialog.open(ResenaDialogo, {
      data: {
        idVeterinaria: this.id(),
        nombreVeterinaria: this.veterinaria.hasValue() ? this.veterinaria.value().nombre_comercial : '',
        resena,
      },
      width: '480px',
      maxWidth: '95vw',
    });
    if (await firstValueFrom(referencia.afterClosed())) {
      this.recargarResenas();
    }
  }

  protected async eliminarResena(resena: ResenaOut): Promise<void> {
    const confirmado = await this.confirmacion.pedir({
      titulo: '¿Eliminar tu reseña?',
      mensaje: 'Dejará de contar en la calificación de la veterinaria.',
      accion: 'Eliminar',
    });
    if (!confirmado) {
      return;
    }
    try {
      await this.api.invoke(eliminarResena, { id_resena: resena.id_resena });
      this.avisos.exito('Reseña eliminada');
      this.recargarResenas();
    } catch (error) {
      this.avisos.error(error);
    }
  }

  protected async agendar(profesional: ProfesionalOut): Promise<void> {
    if (!this.auth.autenticado()) {
      await this.irAlLogin();
      return;
    }
    const referencia = this.dialog.open(AgendarDialogo, {
      data: {
        profesional,
        nombreVeterinaria: this.veterinaria.hasValue() ? this.veterinaria.value().nombre_comercial : '',
      },
      width: '520px',
      maxWidth: '95vw',
    });
    if (await firstValueFrom(referencia.afterClosed())) {
      await this.router.navigateByUrl('/citas');
    }
  }
}

import { Component, inject, resource } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { Api } from '../../../core/api/api';
import { listarMascotas } from '../../../core/api/functions';
import { edad } from '../../../core/fechas';
import { AvatarMascota } from '../../../shared/avatar-mascota/avatar-mascota';
import { Carga } from '../../../shared/carga/carga';
import { Vacio } from '../../../shared/vacio/vacio';

@Component({
  selector: 'app-lista-mascotas',
  imports: [AvatarMascota, Carga, MatButtonModule, MatIconModule, RouterLink, Vacio],
  templateUrl: './lista.html',
  styleUrl: './lista.scss',
})
export class ListaMascotas {
  private readonly api = inject(Api);

  protected readonly mascotas = resource({ loader: () => this.api.invoke(listarMascotas) });
  protected readonly edad = edad;
}

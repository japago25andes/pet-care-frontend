import { Component, inject, resource } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { Api } from '../../../core/api/api';
import { listarMisVeterinarias } from '../../../core/api/functions';
import { Calificacion } from '../../../shared/calificacion/calificacion';
import { Carga } from '../../../shared/carga/carga';
import { Etiqueta } from '../../../shared/etiqueta/etiqueta';
import { Vacio } from '../../../shared/vacio/vacio';
import { VeterinariaDialogo } from './veterinaria-dialogo';

@Component({
  selector: 'app-mis-veterinarias',
  imports: [Calificacion, Carga, Etiqueta, MatButtonModule, MatIconModule, RouterLink, Vacio],
  templateUrl: './mis-veterinarias.html',
  styleUrl: './mis-veterinarias.scss',
})
export class MisVeterinarias {
  private readonly api = inject(Api);
  private readonly dialog = inject(MatDialog);

  protected readonly veterinarias = resource({ loader: () => this.api.invoke(listarMisVeterinarias) });

  protected async registrar(): Promise<void> {
    const referencia = this.dialog.open(VeterinariaDialogo, { data: null, width: '560px', maxWidth: '95vw' });
    if (await firstValueFrom(referencia.afterClosed())) {
      this.veterinarias.reload();
    }
  }
}

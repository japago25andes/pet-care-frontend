import { Component, computed, inject, resource, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { RouterLink } from '@angular/router';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { Api } from '../../core/api/api';
import { actualizarVeterinaria, listarVeterinariasAdmin } from '../../core/api/functions';
import { VeterinariaAdminOut } from '../../core/api/models/veterinaria-admin-out';
import { Avisos } from '../../core/avisos';
import { ultimoValor } from '../../core/recursos';
import { Calificacion } from '../../shared/calificacion/calificacion';
import { Carga } from '../../shared/carga/carga';
import { Confirmacion } from '../../shared/confirmacion/confirmacion';
import { Etiqueta } from '../../shared/etiqueta/etiqueta';
import { Vacio } from '../../shared/vacio/vacio';

const POR_PAGINA = 25;

@Component({
  selector: 'app-veterinarias-admin',
  imports: [
    Calificacion,
    Carga,
    Etiqueta,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatProgressBarModule,
    ReactiveFormsModule,
    RouterLink,
    Vacio,
  ],
  templateUrl: './veterinarias-admin.html',
  styleUrl: './admin.scss',
})
export class VeterinariasAdmin {
  private readonly api = inject(Api);
  private readonly avisos = inject(Avisos);
  private readonly confirmacion = inject(Confirmacion);

  protected readonly busqueda = new FormControl('', { nonNullable: true });
  private readonly texto = toSignal(this.busqueda.valueChanges.pipe(debounceTime(300), distinctUntilChanged()), {
    initialValue: '',
  });
  protected readonly pagina = signal(0);

  protected readonly resultado = resource({
    params: () => ({
      q: this.texto().trim() || undefined,
      limit: POR_PAGINA,
      offset: this.pagina() * POR_PAGINA,
    }),
    loader: ({ params }) => this.api.invoke(listarVeterinariasAdmin, params),
  });
  protected readonly veterinarias = ultimoValor(this.resultado);
  protected readonly hayMas = computed(() => this.veterinarias()?.length === POR_PAGINA);

  constructor() {
    this.busqueda.valueChanges.subscribe(() => this.pagina.set(0));
  }

  protected async cambiarEstado(veterinaria: VeterinariaAdminOut): Promise<void> {
    if (veterinaria.activo) {
      const confirmado = await this.confirmacion.pedir({
        titulo: `¿Desactivar ${veterinaria.nombre_comercial}?`,
        mensaje: 'Dejará de aparecer en la búsqueda y en la tienda, y no recibirá citas nuevas.',
        accion: 'Desactivar',
      });
      if (!confirmado) {
        return;
      }
    }
    try {
      await this.api.invoke(actualizarVeterinaria, {
        id_veterinaria: veterinaria.id_veterinaria,
        body: { activo: !veterinaria.activo },
      });
      this.avisos.exito(veterinaria.activo ? 'Veterinaria desactivada' : 'Veterinaria reactivada');
      this.resultado.reload();
    } catch (error) {
      this.avisos.error(error);
    }
  }
}

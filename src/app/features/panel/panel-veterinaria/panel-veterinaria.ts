import { Component, computed, inject, resource } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { Api } from '../../../core/api/api';
import { listarCitas, listarMisVeterinarias, listarPedidos } from '../../../core/api/functions';
import { AuthService } from '../../../core/auth/auth.service';
import { Carga } from '../../../shared/carga/carga';
import { Vacio } from '../../../shared/vacio/vacio';
import { citaActiva } from '../../citas/etiquetas';
import { CitaAgenda } from '../../gestion/agenda/cita-agenda';

function rangoDeHoy(): { desde: string; hasta: string } {
  const inicio = new Date();
  inicio.setHours(0, 0, 0, 0);
  const fin = new Date(inicio);
  fin.setDate(fin.getDate() + 1);
  return { desde: inicio.toISOString(), hasta: fin.toISOString() };
}

@Component({
  selector: 'app-panel-veterinaria',
  imports: [Carga, CitaAgenda, MatButtonModule, MatIconModule, RouterLink, Vacio],
  templateUrl: './panel-veterinaria.html',
  styleUrl: './panel-veterinaria.scss',
})
export class PanelVeterinaria {
  private readonly api = inject(Api);
  private readonly auth = inject(AuthService);

  protected readonly nombre = computed(() => this.auth.usuario()?.nombre_completo.split(' ')[0] ?? '');

  protected readonly veterinarias = resource({ loader: () => this.api.invoke(listarMisVeterinarias) });
  protected readonly citas = resource({ loader: () => this.api.invoke(listarCitas, rangoDeHoy()) });
  protected readonly pedidos = resource({ loader: () => this.api.invoke(listarPedidos, { estado: 'pendiente', limit: 100 }) });

  private readonly mias = computed(
    () => new Set((this.veterinarias.hasValue() ? this.veterinarias.value() : []).map((v) => v.id_veterinaria)),
  );
  protected readonly citasHoy = computed(() =>
    this.citas.hasValue() ? this.citas.value().filter((c) => citaActiva(c) && this.mias().has(c.id_veterinaria)) : [],
  );
  protected readonly pedidosPendientes = computed(() =>
    this.pedidos.hasValue() ? this.pedidos.value().filter((p) => this.mias().has(p.id_veterinaria)).length : 0,
  );

  protected readonly accesos = [
    { etiqueta: 'Mis veterinarias', icono: 'local_hospital', ruta: '/mis-veterinarias' },
    { etiqueta: 'Agenda completa', icono: 'calendar_month', ruta: '/agenda' },
    { etiqueta: 'Inventario', icono: 'inventory_2', ruta: '/inventario' },
  ];
}

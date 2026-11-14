import { DatePipe, NgTemplateOutlet } from '@angular/common';
import { Component, computed, inject, resource, signal } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatTabsModule } from '@angular/material/tabs';
import { Api } from '../../../core/api/api';
import { listarCitas, listarMisVeterinarias } from '../../../core/api/functions';
import { CitaOut } from '../../../core/api/models/cita-out';
import { Carga } from '../../../shared/carga/carga';
import { Vacio } from '../../../shared/vacio/vacio';
import { citaActiva } from '../../citas/etiquetas';
import { CitaAgenda } from './cita-agenda';

const LIMITE = 100;

function inicioDeHoy(): string {
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  return hoy.toISOString();
}

interface GrupoDia {
  dia: string;
  citas: CitaOut[];
}

function agruparPorDia(citas: CitaOut[]): GrupoDia[] {
  const grupos = new Map<string, CitaOut[]>();
  for (const cita of citas) {
    const dia = new Date(cita.fecha_cita).toDateString();
    grupos.set(dia, [...(grupos.get(dia) ?? []), cita]);
  }
  return [...grupos].map(([dia, lista]) => ({ dia: new Date(dia).toISOString(), citas: lista }));
}

@Component({
  selector: 'app-agenda',
  imports: [Carga, CitaAgenda, DatePipe, MatFormFieldModule, MatSelectModule, MatTabsModule, NgTemplateOutlet, Vacio],
  templateUrl: './agenda.html',
  styleUrl: './agenda.scss',
})
export class Agenda {
  private readonly api = inject(Api);

  protected readonly filtro = signal<number | null>(null);
  protected readonly veterinarias = resource({ loader: () => this.api.invoke(listarMisVeterinarias) });
  protected readonly desdeHoy = resource({
    loader: () => this.api.invoke(listarCitas, { desde: inicioDeHoy(), limit: LIMITE }),
  });
  protected readonly anteriores = resource({
    loader: () => this.api.invoke(listarCitas, { hasta: inicioDeHoy(), limit: LIMITE }),
  });

  /** El rol veterinaria también recibe citas de mascotas propias; aquí solo cuentan las de sus veterinarias. */
  private readonly misCitas = computed(() => {
    if (!this.veterinarias.hasValue() || !this.desdeHoy.hasValue() || !this.anteriores.hasValue()) {
      return { desdeHoy: [], anteriores: [] };
    }
    const mias = new Set(this.veterinarias.value().map((v) => v.id_veterinaria));
    const filtro = this.filtro();
    const incluir = (cita: CitaOut) => mias.has(cita.id_veterinaria) && (filtro === null || cita.id_veterinaria === filtro);
    return { desdeHoy: this.desdeHoy.value().filter(incluir), anteriores: this.anteriores.value().filter(incluir) };
  });

  protected readonly proximas = computed(() => agruparPorDia(this.misCitas().desdeHoy.filter(citaActiva)));
  protected readonly historial = computed(() => {
    const { desdeHoy, anteriores } = this.misCitas();
    return agruparPorDia([...anteriores, ...desdeHoy.filter((cita) => !citaActiva(cita))].reverse());
  });

  protected recargar(): void {
    this.desdeHoy.reload();
    this.anteriores.reload();
  }
}

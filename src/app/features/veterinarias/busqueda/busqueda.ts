import { DecimalPipe } from '@angular/common';
import { Component, computed, inject, resource, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { RouterLink } from '@angular/router';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { Api } from '../../../core/api/api';
import { listarVeterinarias } from '../../../core/api/functions';
import { ultimoValor } from '../../../core/recursos';
import { Calificacion } from '../../../shared/calificacion/calificacion';
import { Carga } from '../../../shared/carga/carga';
import { Mapa, PuntoMapa } from '../../../shared/mapa/mapa';
import { Vacio } from '../../../shared/vacio/vacio';

const POR_PAGINA = 20;
const LIMITE_API = 100;

@Component({
  selector: 'app-busqueda',
  imports: [
    Calificacion,
    Carga,
    DecimalPipe,
    Mapa,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatProgressBarModule,
    MatSelectModule,
    ReactiveFormsModule,
    RouterLink,
    Vacio,
  ],
  templateUrl: './busqueda.html',
  styleUrl: './busqueda.scss',
})
export class Busqueda {
  private readonly api = inject(Api);

  protected readonly busqueda = new FormControl('', { nonNullable: true });
  protected readonly radios = [2, 5, 10, 20, 50];
  protected readonly radio = signal(10);
  protected readonly ubicacion = signal<{ lat: number; lng: number } | null>(null);
  protected readonly ubicando = signal(false);
  protected readonly errorUbicacion = signal<string | null>(null);
  private readonly limite = signal(POR_PAGINA);

  private readonly texto = toSignal(this.busqueda.valueChanges.pipe(debounceTime(300), distinctUntilChanged()), {
    initialValue: '',
  });

  protected readonly resultado = resource({
    params: () => ({
      q: this.texto().trim() || undefined,
      lat: this.ubicacion()?.lat,
      lng: this.ubicacion()?.lng,
      radio_km: this.ubicacion() ? this.radio() : undefined,
      limit: this.limite(),
    }),
    loader: ({ params }) => this.api.invoke(listarVeterinarias, params),
  });

  protected readonly veterinarias = ultimoValor(this.resultado);

  protected readonly puntos = computed<PuntoMapa[]>(() =>
    (this.veterinarias() ?? [])
      .filter((veterinaria) => veterinaria.latitud !== null && veterinaria.longitud !== null)
      .map((veterinaria) => ({
        lat: veterinaria.latitud!,
        lng: veterinaria.longitud!,
        titulo: veterinaria.nombre_comercial,
        detalle: veterinaria.direccion,
        ruta: `/veterinarias/${veterinaria.id_veterinaria}`,
      })),
  );

  protected readonly hayMas = computed(() => {
    const total = this.veterinarias()?.length ?? 0;
    return total === this.limite() && this.limite() < LIMITE_API;
  });

  protected cargarMas(): void {
    this.limite.update((limite) => Math.min(limite + POR_PAGINA, LIMITE_API));
  }

  protected cambiarRadio(radio: number): void {
    this.radio.set(radio);
    this.limite.set(POR_PAGINA);
  }

  protected usarMiUbicacion(): void {
    if (!navigator.geolocation) {
      this.errorUbicacion.set('Tu navegador no permite obtener la ubicación.');
      return;
    }
    this.ubicando.set(true);
    this.errorUbicacion.set(null);
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        this.ubicacion.set({ lat: coords.latitude, lng: coords.longitude });
        this.limite.set(POR_PAGINA);
        this.ubicando.set(false);
      },
      () => {
        this.errorUbicacion.set('No pudimos obtener tu ubicación. Revisa el permiso del navegador.');
        this.ubicando.set(false);
      },
    );
  }

  protected quitarUbicacion(): void {
    this.ubicacion.set(null);
    this.limite.set(POR_PAGINA);
  }
}

import { Component, DestroyRef, ElementRef, afterNextRender, effect, inject, input, signal, viewChild } from '@angular/core';
import { Router } from '@angular/router';
import * as L from 'leaflet';

export interface PuntoMapa {
  lat: number;
  lng: number;
  titulo: string;
  detalle?: string;
  ruta?: string;
}

const CENTRO_POR_DEFECTO: L.LatLngTuple = [4.65, -74.09];

function pin(color: string): L.DivIcon {
  return L.divIcon({
    className: '',
    iconSize: [32, 40],
    iconAnchor: [16, 40],
    popupAnchor: [0, -38],
    html: `<svg viewBox="0 0 32 40" width="32" height="40" aria-hidden="true">
      <path fill="${color}" stroke="#fff" stroke-width="2" d="M16 1C7.7 1 1 7.7 1 16c0 11 15 23 15 23s15-12 15-23C31 7.7 24.3 1 16 1z"/>
      <circle cx="16" cy="16" r="5.5" fill="#fff"/>
    </svg>`,
  });
}

const PIN_VETERINARIA = pin('#1d5fbf');
const PIN_USUARIO = pin('#0f2a4a');

@Component({
  selector: 'app-mapa',
  template: '<div #lienzo class="lienzo"></div>',
  styles: `
    :host {
      display: block;
    }
    .lienzo {
      /* Contiene los z-index de Leaflet para que no tape la barra ni el menú */
      position: relative;
      z-index: 0;
      height: var(--alto-mapa, 360px);
      border-radius: 16px;
    }
  `,
})
export class Mapa {
  private readonly router = inject(Router);
  private readonly lienzo = viewChild.required<ElementRef<HTMLElement>>('lienzo');

  readonly puntos = input.required<PuntoMapa[]>();
  readonly ubicacion = input<{ lat: number; lng: number } | null>(null);

  private readonly mapa = signal<L.Map | null>(null);
  private readonly capa = L.layerGroup();

  constructor() {
    afterNextRender(() => {
      const mapa = L.map(this.lienzo().nativeElement).setView(CENTRO_POR_DEFECTO, 11);
      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      }).addTo(mapa);
      this.capa.addTo(mapa);
      this.mapa.set(mapa);
    });

    effect(() => {
      const mapa = this.mapa();
      if (mapa) {
        this.pintar(mapa, this.puntos(), this.ubicacion());
      }
    });

    inject(DestroyRef).onDestroy(() => this.mapa()?.remove());
  }

  private pintar(mapa: L.Map, puntos: PuntoMapa[], ubicacion: { lat: number; lng: number } | null): void {
    this.capa.clearLayers();
    const posiciones: L.LatLngTuple[] = puntos.map((punto) => [punto.lat, punto.lng]);

    for (const punto of puntos) {
      L.marker([punto.lat, punto.lng], { icon: PIN_VETERINARIA, title: punto.titulo, alt: punto.titulo })
        .bindPopup(this.contenidoPopup(punto))
        .addTo(this.capa);
    }
    if (ubicacion) {
      posiciones.push([ubicacion.lat, ubicacion.lng]);
      L.marker([ubicacion.lat, ubicacion.lng], { icon: PIN_USUARIO, title: 'Tu ubicación', alt: 'Tu ubicación' })
        .bindPopup('Tu ubicación')
        .addTo(this.capa);
    }

    if (posiciones.length > 0) {
      mapa.fitBounds(L.latLngBounds(posiciones), { padding: [40, 40], maxZoom: 15 });
    }
  }

  /** Se arma con nodos y textContent porque los nombres los escriben los usuarios. */
  private contenidoPopup(punto: PuntoMapa): HTMLElement {
    const contenedor = document.createElement('div');
    if (punto.ruta) {
      const ruta = punto.ruta;
      const enlace = document.createElement('a');
      enlace.href = ruta;
      enlace.textContent = punto.titulo;
      enlace.style.fontWeight = '700';
      enlace.addEventListener('click', (evento) => {
        evento.preventDefault();
        this.router.navigateByUrl(ruta);
      });
      contenedor.append(enlace);
    } else {
      const titulo = document.createElement('strong');
      titulo.textContent = punto.titulo;
      contenedor.append(titulo);
    }
    if (punto.detalle) {
      const detalle = document.createElement('div');
      detalle.textContent = punto.detalle;
      contenedor.append(detalle);
    }
    return contenedor;
  }
}

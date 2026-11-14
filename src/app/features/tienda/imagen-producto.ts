import { Component, computed, input, linkedSignal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { iconoCategoria } from './etiquetas';

/** Imagen del producto, o el ícono de su categoría si no tiene o el enlace falla. */
@Component({
  selector: 'app-imagen-producto',
  imports: [MatIconModule],
  template: `
    @if (imagenValida(); as url) {
      <img [src]="url" alt="" (error)="imagenValida.set(null)" />
    } @else {
      <mat-icon>{{ icono() }}</mat-icon>
    }
  `,
  styles: `
    :host {
      display: grid;
      overflow: hidden;
      place-items: center;
      background: var(--pel-celeste-suave);
      color: var(--pel-azul);
    }
    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  `,
})
export class ImagenProducto {
  readonly imagen = input<string | null>();
  readonly categoria = input<string | null>(null);
  protected readonly imagenValida = linkedSignal(() => this.imagen() ?? null);
  protected readonly icono = computed(() => iconoCategoria(this.categoria()));
}

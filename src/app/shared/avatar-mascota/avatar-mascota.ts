import { Component, input, linkedSignal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

/** Foto de la mascota, o una huella si no tiene o el enlace falla. */
@Component({
  selector: 'app-avatar-mascota',
  imports: [MatIconModule],
  host: { '[style.--tamano.px]': 'tamano()' },
  template: `
    @if (fotoValida(); as url) {
      <img [src]="url" alt="" (error)="fotoValida.set(null)" />
    } @else {
      <mat-icon>pets</mat-icon>
    }
  `,
  styles: `
    :host {
      display: grid;
      flex: none;
      overflow: hidden;
      width: var(--tamano);
      height: var(--tamano);
      place-items: center;
      border-radius: 50%;
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
export class AvatarMascota {
  readonly foto = input<string | null>();
  readonly tamano = input(48);
  protected readonly fotoValida = linkedSignal(() => this.foto() ?? null);
}

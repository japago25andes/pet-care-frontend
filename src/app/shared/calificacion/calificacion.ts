import { DecimalPipe } from '@angular/common';
import { Component, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-calificacion',
  imports: [DecimalPipe, MatIconModule],
  template: `
    @if (valor() > 0) {
      <mat-icon inline aria-hidden="true">star</mat-icon>
      <span>{{ valor() | number: '1.1-1' }}</span>
    } @else {
      <span class="sin-resenas">Sin reseñas</span>
    }
  `,
  styles: `
    :host {
      display: inline-flex;
      gap: 3px;
      align-items: center;
      color: var(--pel-marino);
      font-weight: 700;
    }
    mat-icon {
      color: var(--pel-azul);
      font-variation-settings: 'FILL' 1;
    }
    .sin-resenas {
      color: var(--pel-texto-suave);
      font-weight: 400;
    }
  `,
})
export class Calificacion {
  readonly valor = input.required<number>();
}

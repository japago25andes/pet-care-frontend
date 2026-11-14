import { Component, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

/** Estado vacío de una lista, con espacio para una acción. */
@Component({
  selector: 'app-vacio',
  imports: [MatIconModule],
  template: `
    <mat-icon>{{ icono() }}</mat-icon>
    <strong>{{ titulo() }}</strong>
    @if (texto()) {
      <p>{{ texto() }}</p>
    }
    <ng-content />
  `,
  styles: `
    :host {
      display: grid;
      justify-items: center;
      gap: 6px;
      padding: 32px 16px;
      color: var(--pel-texto-suave);
      text-align: center;
    }
    mat-icon {
      color: var(--pel-celeste);
    }
    strong {
      color: var(--pel-marino);
    }
    p {
      margin-bottom: 8px;
    }
  `,
})
export class Vacio {
  readonly icono = input.required<string>();
  readonly titulo = input.required<string>();
  readonly texto = input<string>();
}

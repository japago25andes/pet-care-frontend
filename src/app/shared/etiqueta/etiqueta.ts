import { Component, input } from '@angular/core';

export type Tono = 'exito' | 'alerta' | 'error' | 'info' | 'neutro';

export interface Estado {
  texto: string;
  tono: Tono;
}

/** Etiqueta pequeña de estado. Verde, ámbar y rojo se usan solo aquí. */
@Component({
  selector: 'app-etiqueta',
  host: { '[class]': 'tono()' },
  template: '<ng-content />',
  styles: `
    :host {
      display: inline-block;
      padding: 2px 10px;
      border-radius: 999px;
      font-size: 12.5px;
      font-weight: 700;
      line-height: 1.5;
      white-space: nowrap;
    }
    :host(.exito) {
      background: #dff3ea;
      color: var(--pel-exito);
    }
    :host(.alerta) {
      background: #fbefd9;
      color: var(--pel-alerta);
    }
    :host(.error) {
      background: #fbe9e7;
      color: var(--pel-error);
    }
    :host(.info) {
      background: var(--pel-celeste-suave);
      color: var(--pel-azul-oscuro);
    }
    :host(.neutro) {
      background: #e9eef4;
      color: var(--pel-texto-suave);
    }
  `,
})
export class Etiqueta {
  readonly tono = input<Tono>('neutro');
}

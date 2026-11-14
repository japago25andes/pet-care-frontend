import { Component, input } from '@angular/core';

@Component({
  selector: 'app-logo',
  host: { '[class.claro]': 'claro()' },
  template: `
    <svg viewBox="0 0 32 32" aria-hidden="true">
      <rect width="32" height="32" rx="9" class="fondo" />
      <g class="huella">
        <ellipse cx="9.2" cy="14" rx="2.5" ry="3.3" />
        <ellipse cx="14" cy="9.6" rx="2.5" ry="3.4" />
        <ellipse cx="19.4" cy="9.6" rx="2.5" ry="3.4" />
        <ellipse cx="23.6" cy="14" rx="2.5" ry="3.3" />
        <path
          d="M16.4 14.8c-3.6 0-7 4-7 7.2 0 2.2 1.7 3.4 3.7 3.4 1.5 0 2.2-.8 3.3-.8s1.8.8 3.3.8c2 0 3.7-1.2 3.7-3.4 0-3.2-3.4-7.2-7-7.2z"
        />
      </g>
    </svg>
    <span>Pelud<b>OS</b></span>
  `,
  styles: `
    :host {
      display: inline-flex;
      align-items: center;
      gap: 10px;
      color: var(--pel-marino);
      font-size: 22px;
      font-weight: 800;
      letter-spacing: -0.3px;
    }
    :host(.claro) {
      color: #fff;
    }
    svg {
      width: 34px;
      height: 34px;
    }
    .fondo {
      fill: var(--pel-azul);
    }
    :host(.claro) .fondo {
      fill: var(--pel-celeste);
    }
    .huella {
      fill: #fff;
    }
    :host(.claro) .huella {
      fill: var(--pel-marino);
    }
    b {
      color: var(--pel-azul);
    }
    :host(.claro) b {
      color: var(--pel-celeste);
    }
  `,
})
export class Logo {
  readonly claro = input(false, { transform: (valor: boolean | string) => valor !== false });
}

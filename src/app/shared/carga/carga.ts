import { Component, computed, input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { mensajeDeError } from '../../core/errores';

interface RecursoCargable {
  error(): unknown;
  hasValue(): boolean;
  reload(): boolean;
}

/** Muestra el spinner de la primera carga o el error con opción de reintentar. */
@Component({
  selector: 'app-carga',
  imports: [MatButtonModule, MatProgressSpinnerModule],
  template: `
    @if (recurso().error()) {
      <div class="estado" role="alert">
        <p>{{ mensaje() }}</p>
        <button matButton="outlined" type="button" (click)="recurso().reload()">Reintentar</button>
      </div>
    } @else if (!recurso().hasValue()) {
      <div class="estado" role="status" aria-label="Cargando">
        <mat-spinner diameter="32" />
      </div>
    }
  `,
  styles: `
    .estado {
      display: grid;
      justify-items: center;
      gap: 12px;
      padding: 32px 16px;
      color: var(--pel-texto-suave);
      text-align: center;
    }
  `,
})
export class Carga {
  readonly recurso = input.required<RecursoCargable>();
  protected readonly mensaje = computed(() => mensajeDeError(this.recurso().error()));
}

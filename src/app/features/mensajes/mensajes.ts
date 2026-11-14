import { DatePipe } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatIconModule } from '@angular/material/icon';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { filter, map } from 'rxjs';
import { MensajesService } from '../../core/mensajes.service';
import { Carga } from '../../shared/carga/carga';
import { Vacio } from '../../shared/vacio/vacio';

@Component({
  selector: 'app-mensajes',
  imports: [Carga, DatePipe, MatIconModule, RouterLink, RouterLinkActive, RouterOutlet, Vacio],
  templateUrl: './mensajes.html',
  styleUrl: './mensajes.scss',
})
export class Mensajes {
  private readonly router = inject(Router);
  protected readonly conversaciones = inject(MensajesService).conversaciones;

  private readonly url = toSignal(
    this.router.events.pipe(
      filter((evento) => evento instanceof NavigationEnd),
      map(() => this.router.url),
    ),
    { initialValue: this.router.url },
  );
  /** En celular se ve la lista o la conversación, no ambas. */
  protected readonly abierta = computed(() => /^\/mensajes\/\d+/.test(this.url()));

  protected inicial(nombre: string): string {
    return nombre.charAt(0).toUpperCase();
  }
}

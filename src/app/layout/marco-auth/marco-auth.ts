import { Component, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { Logo } from '../../shared/logo/logo';

/** Diseño compartido por las pantallas de entrar y crear cuenta. */
@Component({
  selector: 'app-marco-auth',
  imports: [Logo, MatIconModule, RouterLink],
  templateUrl: './marco-auth.html',
  styleUrl: './marco-auth.scss',
})
export class MarcoAuth {
  readonly titulo = input.required<string>();
  readonly subtitulo = input.required<string>();

  protected readonly beneficios = [
    { icono: 'vaccines', texto: 'Vacunas y medicamentos de cada mascota, siempre a mano' },
    { icono: 'event', texto: 'Citas con veterinarias cerca de ti' },
    { icono: 'storefront', texto: 'Alimento y accesorios sin salir de casa' },
  ];
}

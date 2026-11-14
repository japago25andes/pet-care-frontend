import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { Logo } from '../../../shared/logo/logo';

@Component({
  selector: 'app-portada',
  imports: [Logo, MatButtonModule, MatIconModule, RouterLink],
  templateUrl: './portada.html',
  styleUrl: './portada.scss',
})
export class Portada {
  protected readonly funciones = [
    {
      icono: 'vaccines',
      titulo: 'Su historial, ordenado',
      texto: 'Vacunas, medicamentos, alergias y recordatorios de cada mascota en una sola ficha.',
    },
    {
      icono: 'event',
      titulo: 'Citas sin llamadas',
      texto: 'Busca veterinarias cerca de ti, elige un profesional y agenda desde el celular.',
    },
    {
      icono: 'storefront',
      titulo: 'Tienda de tu veterinaria',
      texto: 'Compra alimento y accesorios y sigue tu pedido hasta que llegue.',
    },
  ];
}

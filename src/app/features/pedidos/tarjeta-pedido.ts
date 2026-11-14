import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, booleanAttribute, computed, input } from '@angular/core';
import { PedidoOut } from '../../core/api/models/pedido-out';
import { Etiqueta } from '../../shared/etiqueta/etiqueta';
import { estadoPedido, textoMetodoPago } from './etiquetas';

/** Resumen de un pedido. Las acciones se proyectan según quién lo está viendo. */
@Component({
  selector: 'app-tarjeta-pedido',
  imports: [CurrencyPipe, DatePipe, Etiqueta],
  templateUrl: './tarjeta-pedido.html',
  styleUrl: './tarjeta-pedido.scss',
})
export class TarjetaPedido {
  readonly pedido = input.required<PedidoOut>();
  /** La veterinaria ve quién compró; el comprador ve a quién le compró. */
  readonly vistaVeterinaria = input(false, { transform: booleanAttribute });

  protected readonly estado = computed(() => estadoPedido(this.pedido().estado_pedido));
  protected readonly metodoPago = textoMetodoPago;
}

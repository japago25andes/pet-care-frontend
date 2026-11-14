import { Component, computed, inject, resource, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { Api } from '../../../core/api/api';
import { cambiarEstadoPedido, listarMisVeterinarias, listarPedidos } from '../../../core/api/functions';
import { PedidoOut } from '../../../core/api/models/pedido-out';
import { Avisos } from '../../../core/avisos';
import { ultimoValor } from '../../../core/recursos';
import { Carga } from '../../../shared/carga/carga';
import { Confirmacion } from '../../../shared/confirmacion/confirmacion';
import { Vacio } from '../../../shared/vacio/vacio';
import { ESTADOS_PEDIDO, EstadoPedido } from '../../pedidos/etiquetas';
import { TarjetaPedido } from '../../pedidos/tarjeta-pedido';

@Component({
  selector: 'app-pedidos-recibidos',
  imports: [Carga, MatButtonModule, MatFormFieldModule, MatSelectModule, TarjetaPedido, Vacio],
  templateUrl: './pedidos-recibidos.html',
  styles: `
    .filtro {
      width: 180px;
      --mat-form-field-outlined-container-color: #fff;
    }
  `,
})
export class PedidosRecibidos {
  private readonly api = inject(Api);
  private readonly avisos = inject(Avisos);
  private readonly confirmacion = inject(Confirmacion);

  protected readonly estados = ESTADOS_PEDIDO;
  protected readonly filtro = signal<EstadoPedido | null>(null);

  protected readonly veterinarias = resource({ loader: () => this.api.invoke(listarMisVeterinarias) });
  protected readonly resultado = resource({
    params: () => ({ estado: this.filtro() ?? undefined, limit: 100 }),
    loader: ({ params }) => this.api.invoke(listarPedidos, params),
  });
  private readonly ultimos = ultimoValor(this.resultado);

  /** La API también devuelve lo que el usuario compró; aquí solo van los pedidos de sus veterinarias. */
  protected readonly pedidos = computed(() => {
    const lista = this.ultimos();
    if (!lista || !this.veterinarias.hasValue()) {
      return undefined;
    }
    const mias = new Set(this.veterinarias.value().map((v) => v.id_veterinaria));
    return lista.filter((pedido) => mias.has(pedido.id_veterinaria));
  });

  protected async cambiar(pedido: PedidoOut, estado: EstadoPedido, mensaje: string): Promise<void> {
    try {
      await this.api.invoke(cambiarEstadoPedido, { id_pedido: pedido.id_pedido, body: { estado } });
      this.avisos.exito(mensaje);
      this.resultado.reload();
    } catch (error) {
      this.avisos.error(error);
    }
  }

  protected async cancelar(pedido: PedidoOut): Promise<void> {
    const confirmado = await this.confirmacion.pedir({
      titulo: `¿Cancelar el pedido #${pedido.id_pedido}?`,
      mensaje: `Se le cancelará a ${pedido.nombre_comprador} y el stock volverá al inventario.`,
      accion: 'Cancelar pedido',
    });
    if (confirmado) {
      await this.cambiar(pedido, 'cancelado', 'Pedido cancelado');
    }
  }
}

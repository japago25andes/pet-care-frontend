import { Component, inject, resource, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { RouterLink } from '@angular/router';
import { Api } from '../../core/api/api';
import { cambiarEstadoPedido, listarPedidos } from '../../core/api/functions';
import { PedidoOut } from '../../core/api/models/pedido-out';
import { Avisos } from '../../core/avisos';
import { ultimoValor } from '../../core/recursos';
import { Carga } from '../../shared/carga/carga';
import { Confirmacion } from '../../shared/confirmacion/confirmacion';
import { Vacio } from '../../shared/vacio/vacio';
import { ResenaDialogo } from '../resenas/resena-dialogo';
import { ESTADOS_PEDIDO, EstadoPedido } from './etiquetas';
import { TarjetaPedido } from './tarjeta-pedido';

@Component({
  selector: 'app-pedidos',
  imports: [Carga, MatButtonModule, MatFormFieldModule, MatSelectModule, RouterLink, TarjetaPedido, Vacio],
  templateUrl: './pedidos.html',
  styleUrl: './pedidos.scss',
})
export class Pedidos {
  private readonly api = inject(Api);
  private readonly avisos = inject(Avisos);
  private readonly confirmacion = inject(Confirmacion);
  private readonly dialog = inject(MatDialog);

  protected readonly estados = ESTADOS_PEDIDO;
  protected readonly filtro = signal<EstadoPedido | null>(null);

  protected readonly resultado = resource({
    params: () => ({ estado: this.filtro() ?? undefined, limit: 100 }),
    loader: ({ params }) => this.api.invoke(listarPedidos, params),
  });
  protected readonly pedidos = ultimoValor(this.resultado);

  protected async cancelar(pedido: PedidoOut): Promise<void> {
    const confirmado = await this.confirmacion.pedir({
      titulo: `¿Cancelar el pedido #${pedido.id_pedido}?`,
      mensaje: 'Los productos volverán a estar disponibles en la tienda.',
      accion: 'Cancelar pedido',
    });
    if (!confirmado) {
      return;
    }
    try {
      await this.api.invoke(cambiarEstadoPedido, { id_pedido: pedido.id_pedido, body: { estado: 'cancelado' } });
      this.avisos.exito('Pedido cancelado');
      this.resultado.reload();
    } catch (error) {
      this.avisos.error(error);
    }
  }

  protected calificar(pedido: PedidoOut): void {
    this.dialog.open(ResenaDialogo, {
      data: {
        idVeterinaria: pedido.id_veterinaria,
        nombreVeterinaria: pedido.nombre_veterinaria,
        idPedido: pedido.id_pedido,
      },
      width: '480px',
      maxWidth: '95vw',
    });
  }
}

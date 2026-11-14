import { CurrencyPipe } from '@angular/common';
import { Component, computed, inject, linkedSignal, resource, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatSelectModule } from '@angular/material/select';
import { RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { Api } from '../../../core/api/api';
import { eliminarProducto, listarInventario, listarMisVeterinarias } from '../../../core/api/functions';
import { ProductoOut } from '../../../core/api/models/producto-out';
import { Avisos } from '../../../core/avisos';
import { Carga } from '../../../shared/carga/carga';
import { Confirmacion } from '../../../shared/confirmacion/confirmacion';
import { Etiqueta } from '../../../shared/etiqueta/etiqueta';
import { Vacio } from '../../../shared/vacio/vacio';
import { ImagenProducto } from '../../tienda/imagen-producto';
import { ProductoDialogo } from './producto-dialogo';

const STOCK_BAJO = 3;

@Component({
  selector: 'app-inventario',
  imports: [
    Carga,
    CurrencyPipe,
    Etiqueta,
    ImagenProducto,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatMenuModule,
    MatSelectModule,
    RouterLink,
    Vacio,
  ],
  templateUrl: './inventario.html',
  styleUrl: './inventario.scss',
})
export class Inventario {
  private readonly api = inject(Api);
  private readonly avisos = inject(Avisos);
  private readonly confirmacion = inject(Confirmacion);
  private readonly dialog = inject(MatDialog);

  protected readonly misVeterinarias = resource({ loader: () => this.api.invoke(listarMisVeterinarias) });
  protected readonly activas = computed(() =>
    this.misVeterinarias.hasValue() ? this.misVeterinarias.value().filter((veterinaria) => veterinaria.activo) : [],
  );
  protected readonly idVeterinaria = linkedSignal<number | null>(() => this.activas()[0]?.id_veterinaria ?? null);

  protected readonly inventario = resource({
    params: () => {
      const id = this.idVeterinaria();
      return id === null ? undefined : { id_veterinaria: id, limit: 100 };
    },
    loader: ({ params }) => this.api.invoke(listarInventario, params),
  });

  protected readonly busqueda = signal('');
  protected readonly productos = computed(() => {
    const texto = this.busqueda().trim().toLowerCase();
    return this.inventario.hasValue()
      ? this.inventario.value().filter((producto) => producto.nombre_producto.toLowerCase().includes(texto))
      : [];
  });

  protected stockBajo(producto: ProductoOut): boolean {
    return producto.activo && producto.stock <= STOCK_BAJO;
  }

  protected async abrir(producto?: ProductoOut): Promise<void> {
    const referencia = this.dialog.open(ProductoDialogo, {
      data: { idVeterinaria: this.idVeterinaria(), producto },
      width: '560px',
      maxWidth: '95vw',
    });
    if (await firstValueFrom(referencia.afterClosed())) {
      this.inventario.reload();
    }
  }

  protected async desactivar(producto: ProductoOut): Promise<void> {
    const confirmado = await this.confirmacion.pedir({
      titulo: `¿Desactivar ${producto.nombre_producto}?`,
      mensaje: 'Saldrá del catálogo y ya no se podrá comprar. Esta acción no se puede deshacer.',
      accion: 'Desactivar',
    });
    if (!confirmado) {
      return;
    }
    try {
      await this.api.invoke(eliminarProducto, { id_producto: producto.id_producto });
      this.avisos.exito('Producto desactivado');
      this.inventario.reload();
    } catch (error) {
      this.avisos.error(error);
    }
  }
}

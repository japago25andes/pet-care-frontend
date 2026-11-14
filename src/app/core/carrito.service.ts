import { Injectable, computed, inject, resource } from '@angular/core';
import { Api } from './api/api';
import { actualizarItem, agregarItem, obtenerCarrito, quitarItem, vaciarCarrito } from './api/functions';
import { AuthService } from './auth/auth.service';

/** Carrito del cliente. Es compartido para que el contador de la barra se actualice desde cualquier pantalla. */
@Injectable({ providedIn: 'root' })
export class CarritoService {
  private readonly api = inject(Api);
  private readonly auth = inject(AuthService);

  readonly carrito = resource({
    params: () => {
      const usuario = this.auth.usuario();
      return usuario?.rol === 'cliente' ? { id_usuario: usuario.id_usuario } : undefined;
    },
    loader: () => this.api.invoke(obtenerCarrito),
  });

  readonly unidades = computed(() =>
    this.carrito.hasValue() ? this.carrito.value().detalles.reduce((total, item) => total + item.cantidad, 0) : 0,
  );

  async agregar(id_producto: number, cantidad = 1): Promise<void> {
    this.carrito.set(await this.api.invoke(agregarItem, { body: { id_producto, cantidad } }));
  }

  async cambiarCantidad(id_detalle_carrito: number, cantidad: number): Promise<void> {
    this.carrito.set(await this.api.invoke(actualizarItem, { id_detalle_carrito, body: { cantidad } }));
  }

  async quitar(id_detalle_carrito: number): Promise<void> {
    this.carrito.set(await this.api.invoke(quitarItem, { id_detalle_carrito }));
  }

  async vaciar(): Promise<void> {
    this.carrito.set(await this.api.invoke(vaciarCarrito));
  }
}

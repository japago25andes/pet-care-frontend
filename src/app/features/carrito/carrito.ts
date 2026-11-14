import { HttpErrorResponse } from '@angular/common/http';
import { CurrencyPipe } from '@angular/common';
import { Component, computed, inject, resource, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { Router, RouterLink } from '@angular/router';
import { Api } from '../../core/api/api';
import { crearPedido, obtenerVeterinaria } from '../../core/api/functions';
import { DetalleCarritoOut } from '../../core/api/models/detalle-carrito-out';
import { PedidoCreate } from '../../core/api/models/pedido-create';
import { AuthService } from '../../core/auth/auth.service';
import { Avisos } from '../../core/avisos';
import { CarritoService } from '../../core/carrito.service';
import { mensajeDeCampo, mensajeDeError } from '../../core/errores';
import { sinVacios } from '../../core/formularios';
import { Carga } from '../../shared/carga/carga';
import { Confirmacion } from '../../shared/confirmacion/confirmacion';
import { Etiqueta } from '../../shared/etiqueta/etiqueta';
import { Vacio } from '../../shared/vacio/vacio';

@Component({
  selector: 'app-carrito',
  imports: [
    Carga,
    CurrencyPipe,
    Etiqueta,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
    ReactiveFormsModule,
    RouterLink,
    Vacio,
  ],
  templateUrl: './carrito.html',
  styleUrl: './carrito.scss',
})
export class Carrito {
  private readonly api = inject(Api);
  private readonly auth = inject(AuthService);
  private readonly avisos = inject(Avisos);
  private readonly confirmacion = inject(Confirmacion);
  private readonly router = inject(Router);
  protected readonly servicio = inject(CarritoService);

  protected readonly carrito = this.servicio.carrito;

  protected readonly form = new FormGroup({
    metodo_pago: new FormControl<PedidoCreate['metodo_pago'] | null>(null, [Validators.required]),
    direccion_entrega: new FormControl(this.auth.usuario()?.direccion ?? '', {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(5000)],
    }),
    notas: new FormControl('', { nonNullable: true, validators: [Validators.maxLength(5000)] }),
  });
  protected readonly ocupado = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly mensajeDeCampo = mensajeDeCampo;

  protected readonly veterinaria = resource({
    params: () => {
      const id = this.carrito.hasValue() ? this.carrito.value().id_veterinaria : null;
      return id ? { id_veterinaria: id } : undefined;
    },
    loader: ({ params }) => this.api.invoke(obtenerVeterinaria, params),
  });

  protected readonly todoDisponible = computed(
    () => this.carrito.hasValue() && this.carrito.value().detalles.every((item) => item.disponible),
  );

  private async ejecutar(accion: () => Promise<void>): Promise<void> {
    this.ocupado.set(true);
    try {
      await accion();
    } catch (error) {
      this.avisos.error(error);
    } finally {
      this.ocupado.set(false);
    }
  }

  protected cambiar(item: DetalleCarritoOut, cantidad: number): Promise<void> {
    return this.ejecutar(() => this.servicio.cambiarCantidad(item.id_detalle_carrito, cantidad));
  }

  protected quitar(item: DetalleCarritoOut): Promise<void> {
    return this.ejecutar(() => this.servicio.quitar(item.id_detalle_carrito));
  }

  protected async vaciar(): Promise<void> {
    const confirmado = await this.confirmacion.pedir({
      titulo: '¿Vaciar el carrito?',
      mensaje: 'Se quitarán todos los productos.',
      accion: 'Vaciar',
    });
    if (confirmado) {
      await this.ejecutar(() => this.servicio.vaciar());
    }
  }

  protected async confirmarPedido(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.ocupado.set(true);
    this.error.set(null);
    const { metodo_pago, ...resto } = sinVacios(this.form.getRawValue());
    try {
      await this.api.invoke(crearPedido, { body: { ...resto, metodo_pago: metodo_pago! } });
      this.carrito.reload();
      this.avisos.exito('¡Pedido creado!');
      await this.router.navigateByUrl('/pedidos');
    } catch (error) {
      this.error.set(mensajeDeError(error));
      // El stock o los precios pudieron cambiar: se muestra el carrito actualizado.
      if (error instanceof HttpErrorResponse && error.status === 409) {
        this.carrito.reload();
      }
    } finally {
      this.ocupado.set(false);
    }
  }
}

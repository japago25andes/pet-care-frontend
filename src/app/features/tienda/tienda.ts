import { CurrencyPipe } from '@angular/common';
import { Component, computed, inject, input, linkedSignal, resource, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { Router, RouterLink } from '@angular/router';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { Api } from '../../core/api/api';
import { listarProductos, listarVeterinarias } from '../../core/api/functions';
import { ProductoPublicoOut } from '../../core/api/models/producto-publico-out';
import { AuthService } from '../../core/auth/auth.service';
import { Avisos } from '../../core/avisos';
import { CarritoService } from '../../core/carrito.service';
import { ultimoValor } from '../../core/recursos';
import { Carga } from '../../shared/carga/carga';
import { Etiqueta } from '../../shared/etiqueta/etiqueta';
import { Vacio } from '../../shared/vacio/vacio';
import { CATEGORIAS, CategoriaProducto } from './etiquetas';
import { ImagenProducto } from './imagen-producto';

const POR_PAGINA = 24;
const LIMITE_API = 100;
const STOCK_BAJO = 3;

@Component({
  selector: 'app-tienda',
  imports: [
    Carga,
    CurrencyPipe,
    Etiqueta,
    ImagenProducto,
    MatButtonModule,
    MatCheckboxModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatProgressBarModule,
    MatSelectModule,
    ReactiveFormsModule,
    RouterLink,
    Vacio,
  ],
  templateUrl: './tienda.html',
  styleUrl: './tienda.scss',
})
export class Tienda {
  private readonly api = inject(Api);
  private readonly auth = inject(AuthService);
  private readonly avisos = inject(Avisos);
  private readonly router = inject(Router);
  protected readonly carrito = inject(CarritoService);

  /** Parámetro de la URL: /tienda?veterinaria=3 */
  readonly veterinaria = input<string>();

  protected readonly busqueda = new FormControl('', { nonNullable: true });
  private readonly texto = toSignal(this.busqueda.valueChanges.pipe(debounceTime(300), distinctUntilChanged()), {
    initialValue: '',
  });
  protected readonly categorias = CATEGORIAS;
  protected readonly categoria = signal<CategoriaProducto | null>(null);
  protected readonly idVeterinaria = linkedSignal<number | null>(() => Number(this.veterinaria()) || null);
  protected readonly conStock = signal(false);
  private readonly limite = signal(POR_PAGINA);
  protected readonly agregando = signal<number | null>(null);

  protected readonly resultado = resource({
    params: () => ({
      q: this.texto().trim() || undefined,
      categoria: this.categoria() ?? undefined,
      id_veterinaria: this.idVeterinaria() ?? undefined,
      con_stock: this.conStock(),
      limit: this.limite(),
    }),
    loader: ({ params }) => this.api.invoke(listarProductos, params),
  });
  protected readonly productos = ultimoValor(this.resultado);

  protected readonly veterinarias = resource({
    loader: () => this.api.invoke(listarVeterinarias, { limit: LIMITE_API }),
  });
  private readonly nombres = computed(
    () =>
      new Map(
        (this.veterinarias.hasValue() ? this.veterinarias.value() : []).map((v) => [v.id_veterinaria, v.nombre_comercial]),
      ),
  );

  /** Las cuentas de veterinaria o admin ven el catálogo, pero solo los clientes compran. */
  protected readonly puedeComprar = computed(() => !this.auth.autenticado() || this.auth.rol() === 'cliente');
  protected readonly hayMas = computed(() => {
    return (this.productos()?.length ?? 0) === this.limite() && this.limite() < LIMITE_API;
  });

  protected nombreVeterinaria(id: number): string {
    return this.nombres().get(id) ?? '';
  }

  protected stockBajo(producto: ProductoPublicoOut): boolean {
    return producto.stock > 0 && producto.stock <= STOCK_BAJO;
  }

  protected cambiarCategoria(categoria: CategoriaProducto | null): void {
    this.categoria.set(categoria);
    this.limite.set(POR_PAGINA);
  }

  protected cambiarVeterinaria(id: number | null): void {
    this.idVeterinaria.set(id);
    this.limite.set(POR_PAGINA);
  }

  protected cargarMas(): void {
    this.limite.update((limite) => Math.min(limite + POR_PAGINA, LIMITE_API));
  }

  protected async agregar(producto: ProductoPublicoOut): Promise<void> {
    if (!this.auth.autenticado()) {
      await this.router.navigate(['/login'], { queryParams: { volver: this.router.url } });
      return;
    }
    this.agregando.set(producto.id_producto);
    try {
      await this.carrito.agregar(producto.id_producto);
      this.avisos.exito(`${producto.nombre_producto} agregado al carrito`);
    } catch (error) {
      this.avisos.error(error);
    } finally {
      this.agregando.set(null);
    }
  }
}

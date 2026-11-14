import { Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { Api } from '../../../core/api/api';
import { actualizarProducto, crearProducto } from '../../../core/api/functions';
import { ProductoOut } from '../../../core/api/models/producto-out';
import { Avisos } from '../../../core/avisos';
import { aplicarErroresDeCampo, mensajeDeCampo, mensajeDeError } from '../../../core/errores';
import { sinVacios } from '../../../core/formularios';
import { CATEGORIAS, CategoriaProducto } from '../../tienda/etiquetas';

const VALIDADORES_PRECIO = [
  Validators.required,
  Validators.min(0),
  Validators.max(99999999.99),
  Validators.pattern(/^\d+(\.\d{1,2})?$/),
];

@Component({
  selector: 'app-producto-dialogo',
  imports: [
    MatButtonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    ReactiveFormsModule,
  ],
  templateUrl: './producto-dialogo.html',
})
export class ProductoDialogo {
  private readonly api = inject(Api);
  private readonly avisos = inject(Avisos);
  private readonly referencia = inject(MatDialogRef<ProductoDialogo>);
  protected readonly datos = inject<{ idVeterinaria: number; producto?: ProductoOut }>(MAT_DIALOG_DATA);

  private readonly producto = this.datos.producto;

  protected readonly form = new FormGroup({
    nombre_producto: new FormControl(this.producto?.nombre_producto ?? '', {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(100)],
    }),
    categoria: new FormControl<CategoriaProducto | null>((this.producto?.categoria as CategoriaProducto) ?? null),
    precio_compra: new FormControl<number | null>(this.producto?.precio_compra ?? null, VALIDADORES_PRECIO),
    precio_venta: new FormControl<number | null>(this.producto?.precio_venta ?? null, VALIDADORES_PRECIO),
    stock: new FormControl(this.producto?.stock ?? 0, {
      nonNullable: true,
      validators: [Validators.required, Validators.min(0)],
    }),
    unidad_medida: new FormControl(this.producto?.unidad_medida ?? '', {
      nonNullable: true,
      validators: [Validators.maxLength(20)],
    }),
    imagen_url: new FormControl(this.producto?.imagen_url ?? '', {
      nonNullable: true,
      validators: [Validators.maxLength(2048)],
    }),
    descripcion: new FormControl(this.producto?.descripcion ?? '', {
      nonNullable: true,
      validators: [Validators.maxLength(5000)],
    }),
  });

  protected readonly categorias = CATEGORIAS;
  protected readonly enviando = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly mensajeDeCampo = mensajeDeCampo;

  protected async guardar(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.enviando.set(true);
    this.error.set(null);
    const valores = sinVacios(this.form.getRawValue());
    const body = { ...valores, precio_compra: valores.precio_compra!, precio_venta: valores.precio_venta! };
    try {
      if (this.producto) {
        await this.api.invoke(actualizarProducto, { id_producto: this.producto.id_producto, body });
      } else {
        await this.api.invoke(crearProducto, { id_veterinaria: this.datos.idVeterinaria, body });
      }
      this.avisos.exito('Producto guardado');
      this.referencia.close(true);
    } catch (error) {
      if (!aplicarErroresDeCampo(this.form, error)) {
        this.error.set(mensajeDeError(error));
      }
    } finally {
      this.enviando.set(false);
    }
  }
}

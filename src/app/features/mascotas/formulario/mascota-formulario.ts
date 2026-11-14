import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, computed, inject, input, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { Router, RouterLink } from '@angular/router';
import { Api } from '../../../core/api/api';
import { actualizarMascota, crearMascota, obtenerMascota } from '../../../core/api/functions';
import { Avisos } from '../../../core/avisos';
import { aplicarErroresDeCampo, mensajeDeCampo, mensajeDeError } from '../../../core/errores';
import { fechaNoFutura, sinVacios } from '../../../core/formularios';
import { hoyISO } from '../../../core/fechas';

function texto(maximo: number, obligatorio = false) {
  return new FormControl('', {
    nonNullable: true,
    validators: [Validators.maxLength(maximo), ...(obligatorio ? [Validators.required] : [])],
  });
}

@Component({
  selector: 'app-mascota-formulario',
  imports: [
    MatAutocompleteModule,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    ReactiveFormsModule,
    RouterLink,
  ],
  templateUrl: './mascota-formulario.html',
})
export class MascotaFormulario implements OnInit {
  private readonly api = inject(Api);
  private readonly router = inject(Router);
  private readonly avisos = inject(Avisos);

  /** Parámetro de la ruta; solo existe al editar. */
  readonly id = input<string>();

  protected readonly editando = computed(() => this.id() !== undefined);
  protected readonly volverA = computed(() => (this.editando() ? ['/mascotas', this.id()] : ['/mascotas']));

  protected readonly form = new FormGroup({
    nombre: texto(50, true),
    especie: texto(30, true),
    raza: texto(50),
    sexo: new FormControl<'macho' | 'hembra' | null>(null),
    fecha_nacimiento: new FormControl('', {
      nonNullable: true,
      validators: [fechaNoFutura('La fecha de nacimiento no puede ser futura')],
    }),
    peso_kg: new FormControl<number | null>(null, [Validators.min(0.01), Validators.max(999.99)]),
    color_mascota: texto(30),
    numero_chip: texto(50),
    foto_url: texto(2048),
    alergias: texto(5000),
    condiciones_medicas: texto(5000),
  });

  protected readonly especies = ['perro', 'gato', 'ave', 'conejo', 'hámster', 'reptil'];
  protected readonly hoy = hoyISO();
  protected readonly cargando = signal(false);
  protected readonly enviando = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly mensajeDeCampo = mensajeDeCampo;

  async ngOnInit(): Promise<void> {
    const id = this.id();
    if (id === undefined) {
      return;
    }
    this.cargando.set(true);
    try {
      const mascota = await this.api.invoke(obtenerMascota, { id_mascota: Number(id) });
      this.form.patchValue({
        ...mascota,
        raza: mascota.raza ?? '',
        sexo: mascota.sexo as 'macho' | 'hembra' | null,
        fecha_nacimiento: mascota.fecha_nacimiento ?? '',
        color_mascota: mascota.color_mascota ?? '',
        numero_chip: mascota.numero_chip ?? '',
        foto_url: mascota.foto_url ?? '',
        alergias: mascota.alergias ?? '',
        condiciones_medicas: mascota.condiciones_medicas ?? '',
      });
    } catch (error) {
      this.error.set(mensajeDeError(error));
    } finally {
      this.cargando.set(false);
    }
  }

  protected async guardar(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.enviando.set(true);
    this.error.set(null);
    const body = sinVacios(this.form.getRawValue());
    try {
      const id = this.id();
      const mascota =
        id === undefined
          ? await this.api.invoke(crearMascota, { body })
          : await this.api.invoke(actualizarMascota, { id_mascota: Number(id), body });
      this.avisos.exito(id === undefined ? `${mascota.nombre} ya está en PeludOS` : 'Cambios guardados');
      await this.router.navigate(['/mascotas', mascota.id_mascota]);
    } catch (error) {
      if (error instanceof HttpErrorResponse && error.status === 409) {
        this.form.controls.numero_chip.setErrors({ servidor: mensajeDeError(error) });
      } else if (!aplicarErroresDeCampo(this.form, error)) {
        this.error.set(mensajeDeError(error));
      }
    } finally {
      this.enviando.set(false);
    }
  }
}

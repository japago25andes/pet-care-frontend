import { DatePipe } from '@angular/common';
import {
  Component,
  ElementRef,
  Injector,
  afterNextRender,
  computed,
  effect,
  inject,
  input,
  numberAttribute,
  resource,
  signal,
  untracked,
  viewChild,
} from '@angular/core';
import { CdkTextareaAutosize } from '@angular/cdk/text-field';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { RouterLink } from '@angular/router';
import { interval } from 'rxjs';
import { Api } from '../../core/api/api';
import { enviarMensaje, marcarConversacionLeida, verConversacion } from '../../core/api/functions';
import { AuthService } from '../../core/auth/auth.service';
import { Avisos } from '../../core/avisos';
import { mensajeDeCampo } from '../../core/errores';
import { MensajesService } from '../../core/mensajes.service';
import { Carga } from '../../shared/carga/carga';
import { Vacio } from '../../shared/vacio/vacio';

const CADA_MS = 8_000;

@Component({
  selector: 'app-conversacion',
  imports: [
    Carga,
    CdkTextareaAutosize,
    DatePipe,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    ReactiveFormsModule,
    RouterLink,
    Vacio,
  ],
  templateUrl: './conversacion.html',
  styleUrl: './conversacion.scss',
})
export class Conversacion {
  private readonly api = inject(Api);
  private readonly auth = inject(AuthService);
  private readonly avisos = inject(Avisos);
  private readonly servicio = inject(MensajesService);
  private readonly injector = inject(Injector);
  private readonly lienzo = viewChild<ElementRef<HTMLElement>>('lienzo');

  /** Parámetro de la ruta: el otro usuario. */
  readonly id = input.required({ transform: numberAttribute });
  /** Parámetros de la URL cuando se llega desde una veterinaria o una cita. */
  readonly nombre = input<string>();
  readonly veterinaria = input<string>();
  readonly cita = input<string>();

  protected readonly hilo = resource({
    params: () => ({ id_usuario: this.id(), limit: 100 }),
    loader: ({ params }) => this.api.invoke(verConversacion, params),
  });

  protected readonly texto = new FormControl('', { nonNullable: true, validators: [Validators.maxLength(5000)] });
  protected readonly enviando = signal(false);
  protected readonly mensajeDeCampo = mensajeDeCampo;
  protected readonly miId = computed(() => this.auth.usuario()?.id_usuario);

  protected readonly titulo = computed(() => {
    const conversaciones = this.servicio.conversaciones;
    const existente = conversaciones.hasValue()
      ? conversaciones.value().find((conversacion) => conversacion.id_usuario === this.id())
      : undefined;
    return this.nombre() ?? existente?.nombre_usuario ?? 'Conversación';
  });

  private readonly cantidad = computed(() => (this.hilo.hasValue() ? this.hilo.value().length : 0));

  constructor() {
    effect(() => {
      if (!this.hilo.hasValue()) {
        return;
      }
      const otro = untracked(this.id);
      if (this.hilo.value().some((mensaje) => !mensaje.leido && mensaje.id_usuario_remitente === otro)) {
        untracked(() => this.marcarLeida(otro));
      }
    });

    // Baja al último mensaje solo cuando llega uno nuevo, para no mover a quien está leyendo arriba.
    effect(() => {
      this.cantidad();
      const elemento = this.lienzo()?.nativeElement;
      if (elemento) {
        afterNextRender(() => (elemento.scrollTop = elemento.scrollHeight), { injector: this.injector });
      }
    });

    interval(CADA_MS)
      .pipe(takeUntilDestroyed())
      .subscribe(() => {
        if (document.visibilityState === 'visible') {
          this.hilo.reload();
        }
      });
  }

  private async marcarLeida(otro: number): Promise<void> {
    try {
      await this.api.invoke(marcarConversacionLeida, { id_usuario: otro });
      this.servicio.refrescar();
    } catch {
      // Se reintenta en la próxima consulta del hilo.
    }
  }

  protected alPresionarEnter(evento: Event): void {
    if (!(evento as KeyboardEvent).shiftKey) {
      evento.preventDefault();
      this.enviar();
    }
  }

  protected async enviar(): Promise<void> {
    const contenido = this.texto.value.trim();
    if (!contenido || this.texto.invalid || this.enviando()) {
      this.texto.markAsTouched();
      return;
    }
    this.enviando.set(true);
    try {
      await this.api.invoke(enviarMensaje, {
        body: {
          id_usuario_destinatario: this.id(),
          contenido,
          id_veterinaria: Number(this.veterinaria()) || null,
          id_cita: Number(this.cita()) || null,
        },
      });
      this.texto.reset();
      this.hilo.reload();
      this.servicio.refrescar();
    } catch (error) {
      this.avisos.error(error);
    } finally {
      this.enviando.set(false);
    }
  }
}

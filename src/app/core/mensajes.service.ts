import { Injectable, computed, inject, resource } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { interval } from 'rxjs';
import { Api } from './api/api';
import { contarNoLeidos, listarConversaciones } from './api/functions';
import { AuthService } from './auth/auth.service';

const CADA_MS = 15_000;

/** Conversaciones y no leídos. El back no tiene tiempo real, así que se consultan cada cierto tiempo. */
@Injectable({ providedIn: 'root' })
export class MensajesService {
  private readonly api = inject(Api);
  private readonly auth = inject(AuthService);

  private readonly usuario = () => {
    const usuario = this.auth.usuario();
    return usuario && usuario.rol !== 'admin' ? { id_usuario: usuario.id_usuario } : undefined;
  };

  private readonly noLeidos = resource({
    params: this.usuario,
    loader: () => this.api.invoke(contarNoLeidos),
  });
  readonly conversaciones = resource({
    params: this.usuario,
    loader: () => this.api.invoke(listarConversaciones, { limit: 100 }),
  });

  readonly totalNoLeidos = computed(() => (this.noLeidos.hasValue() ? this.noLeidos.value().total : 0));

  constructor() {
    interval(CADA_MS)
      .pipe(takeUntilDestroyed())
      .subscribe(() => {
        if (document.visibilityState === 'visible') {
          this.refrescar();
        }
      });
  }

  refrescar(): void {
    if (this.usuario()) {
      this.noLeidos.reload();
      this.conversaciones.reload();
    }
  }
}

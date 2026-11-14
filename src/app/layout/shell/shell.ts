import { BreakpointObserver } from '@angular/cdk/layout';
import { Component, computed, inject, viewChild } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatBadgeModule } from '@angular/material/badge';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatSidenav, MatSidenavModule } from '@angular/material/sidenav';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { map } from 'rxjs';
import { AuthService } from '../../core/auth/auth.service';
import { CarritoService } from '../../core/carrito.service';
import { MensajesService } from '../../core/mensajes.service';
import { MENU_INVITADO, NOMBRE_ROL, menuDe } from '../../core/navegacion';
import { Logo } from '../../shared/logo/logo';

@Component({
  selector: 'app-shell',
  imports: [
    Logo,
    MatBadgeModule,
    MatButtonModule,
    MatDividerModule,
    MatIconModule,
    MatMenuModule,
    MatSidenavModule,
    RouterLink,
    RouterLinkActive,
    RouterOutlet,
  ],
  templateUrl: './shell.html',
  styleUrl: './shell.scss',
})
export class Shell {
  protected readonly auth = inject(AuthService);
  protected readonly carrito = inject(CarritoService);
  protected readonly mensajes = inject(MensajesService);
  private readonly menuLateral = viewChild.required(MatSidenav);

  protected readonly esMovil = toSignal(
    inject(BreakpointObserver)
      .observe('(max-width: 860px)')
      .pipe(map((estado) => estado.matches)),
    { initialValue: false },
  );
  protected readonly items = computed(() => (this.auth.autenticado() ? menuDe(this.auth.rol()) : MENU_INVITADO));
  protected readonly inicio = computed(() => (this.auth.autenticado() ? '/panel' : '/'));
  protected readonly nombreRol = computed(() => NOMBRE_ROL[this.auth.rol()]);
  protected readonly iniciales = computed(() =>
    (this.auth.usuario()?.nombre_completo ?? '')
      .split(' ')
      .slice(0, 2)
      .map((parte) => parte.charAt(0).toUpperCase())
      .join(''),
  );

  protected cerrarEnMovil(): void {
    if (this.esMovil()) {
      this.menuLateral().close();
    }
  }
}

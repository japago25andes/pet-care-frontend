import { Component, computed, inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { menuDe } from '../../core/navegacion';
import { PanelCliente } from './panel-cliente/panel-cliente';
import { PanelVeterinaria } from './panel-veterinaria/panel-veterinaria';

@Component({
  selector: 'app-panel',
  imports: [MatIconModule, PanelCliente, PanelVeterinaria, RouterLink],
  templateUrl: './panel.html',
  styleUrl: './panel.scss',
})
export class Panel {
  protected readonly auth = inject(AuthService);

  protected readonly nombre = computed(() => this.auth.usuario()?.nombre_completo.split(' ')[0] ?? '');
  protected readonly accesos = computed(() => menuDe(this.auth.rol()).filter((item) => item.ruta !== '/panel'));
}

import { Component, computed, inject, resource, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { Api } from '../../core/api/api';
import { adminUpdateUsuario, listUsuarios } from '../../core/api/functions';
import { UsuarioOut } from '../../core/api/models/usuario-out';
import { AuthService } from '../../core/auth/auth.service';
import { Avisos } from '../../core/avisos';
import { NOMBRE_ROL, Rol } from '../../core/navegacion';
import { ultimoValor } from '../../core/recursos';
import { Carga } from '../../shared/carga/carga';
import { Confirmacion } from '../../shared/confirmacion/confirmacion';
import { Etiqueta } from '../../shared/etiqueta/etiqueta';
import { Vacio } from '../../shared/vacio/vacio';

const POR_PAGINA = 25;

@Component({
  selector: 'app-usuarios',
  imports: [
    Carga,
    Etiqueta,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatProgressBarModule,
    MatSelectModule,
    ReactiveFormsModule,
    Vacio,
  ],
  templateUrl: './usuarios.html',
  styleUrl: './admin.scss',
})
export class Usuarios {
  private readonly api = inject(Api);
  private readonly auth = inject(AuthService);
  private readonly avisos = inject(Avisos);
  private readonly confirmacion = inject(Confirmacion);

  protected readonly roles = Object.entries(NOMBRE_ROL) as [Rol, string][];
  protected readonly miId = computed(() => this.auth.usuario()?.id_usuario);

  protected readonly busqueda = new FormControl('', { nonNullable: true });
  private readonly texto = toSignal(this.busqueda.valueChanges.pipe(debounceTime(300), distinctUntilChanged()), {
    initialValue: '',
  });
  protected readonly rol = signal<Rol | null>(null);
  protected readonly pagina = signal(0);

  protected readonly resultado = resource({
    params: () => ({
      q: this.texto().trim() || undefined,
      rol: this.rol() ?? undefined,
      limit: POR_PAGINA,
      offset: this.pagina() * POR_PAGINA,
    }),
    loader: ({ params }) => this.api.invoke(listUsuarios, params),
  });
  protected readonly usuarios = ultimoValor(this.resultado);
  protected readonly hayMas = computed(() => this.usuarios()?.length === POR_PAGINA);

  constructor() {
    this.busqueda.valueChanges.subscribe(() => this.pagina.set(0));
  }

  protected filtrarRol(rol: Rol | null): void {
    this.rol.set(rol);
    this.pagina.set(0);
  }

  private async actualizar(usuario: UsuarioOut, cambios: { rol?: Rol; activo?: boolean }, mensaje: string): Promise<void> {
    try {
      await this.api.invoke(adminUpdateUsuario, { id_usuario: usuario.id_usuario, body: cambios });
      this.avisos.exito(mensaje);
    } catch (error) {
      this.avisos.error(error);
    }
    this.resultado.reload();
  }

  protected cambiarRol(usuario: UsuarioOut, rol: Rol): Promise<void> {
    return this.actualizar(usuario, { rol }, 'Rol actualizado');
  }

  protected async cambiarEstado(usuario: UsuarioOut): Promise<void> {
    if (usuario.activo) {
      const confirmado = await this.confirmacion.pedir({
        titulo: `¿Desactivar a ${usuario.nombre_completo}?`,
        mensaje: 'No podrá iniciar sesión y su sesión actual se cerrará.',
        accion: 'Desactivar',
      });
      if (!confirmado) {
        return;
      }
    }
    await this.actualizar(usuario, { activo: !usuario.activo }, usuario.activo ? 'Usuario desactivado' : 'Usuario activado');
  }
}

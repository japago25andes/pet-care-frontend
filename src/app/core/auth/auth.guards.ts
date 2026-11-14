import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Rol } from '../navegacion';
import { AuthService } from './auth.service';

export const autenticado: CanActivateFn = (_ruta, estado) => {
  if (inject(AuthService).autenticado()) {
    return true;
  }
  return inject(Router).createUrlTree(['/login'], { queryParams: { volver: estado.url } });
};

export const soloInvitados: CanActivateFn = () =>
  inject(AuthService).autenticado() ? inject(Router).parseUrl('/panel') : true;

export function conRol(...roles: Rol[]): CanActivateFn {
  return (_ruta, estado) => {
    const auth = inject(AuthService);
    const router = inject(Router);
    if (!auth.autenticado()) {
      return router.createUrlTree(['/login'], { queryParams: { volver: estado.url } });
    }
    return roles.includes(auth.rol()) ? true : router.parseUrl('/panel');
  };
}

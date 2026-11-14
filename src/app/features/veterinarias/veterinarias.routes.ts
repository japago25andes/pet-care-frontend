import { Routes } from '@angular/router';

export const VETERINARIAS_ROUTES: Routes = [
  {
    path: '',
    title: 'Veterinarias · PeludOS',
    loadComponent: () => import('./busqueda/busqueda').then((m) => m.Busqueda),
  },
  {
    path: ':id',
    title: 'Veterinaria · PeludOS',
    loadComponent: () => import('./detalle/detalle').then((m) => m.Detalle),
  },
];

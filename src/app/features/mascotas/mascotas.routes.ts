import { Routes } from '@angular/router';

export const MASCOTAS_ROUTES: Routes = [
  {
    path: '',
    title: 'Mis mascotas · PeludOS',
    loadComponent: () => import('./lista/lista').then((m) => m.ListaMascotas),
  },
  {
    path: 'nueva',
    title: 'Nueva mascota · PeludOS',
    loadComponent: () => import('./formulario/mascota-formulario').then((m) => m.MascotaFormulario),
  },
  {
    path: ':id',
    title: 'Ficha · PeludOS',
    loadComponent: () => import('./ficha/ficha').then((m) => m.Ficha),
  },
  {
    path: ':id/editar',
    title: 'Editar mascota · PeludOS',
    loadComponent: () => import('./formulario/mascota-formulario').then((m) => m.MascotaFormulario),
  },
];

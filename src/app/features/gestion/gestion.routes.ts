import { Routes } from '@angular/router';

export const MIS_VETERINARIAS_ROUTES: Routes = [
  {
    path: '',
    title: 'Mis veterinarias · PeludOS',
    loadComponent: () => import('./veterinarias/mis-veterinarias').then((m) => m.MisVeterinarias),
  },
  {
    path: ':id',
    title: 'Gestionar veterinaria · PeludOS',
    loadComponent: () => import('./veterinarias/gestion-veterinaria').then((m) => m.GestionVeterinaria),
  },
];

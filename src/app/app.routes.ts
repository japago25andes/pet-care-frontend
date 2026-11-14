import { Routes } from '@angular/router';
import { autenticado, conRol, soloInvitados } from './core/auth/auth.guards';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    title: 'PeludOS',
    canActivate: [soloInvitados],
    loadComponent: () => import('./features/publico/portada/portada').then((m) => m.Portada),
  },
  {
    path: 'login',
    canActivate: [soloInvitados],
    title: 'Entrar · PeludOS',
    loadComponent: () => import('./features/auth/login/login').then((m) => m.Login),
  },
  {
    path: 'registro',
    canActivate: [soloInvitados],
    title: 'Crear cuenta · PeludOS',
    loadComponent: () => import('./features/auth/registro/registro').then((m) => m.Registro),
  },
  {
    path: '',
    loadComponent: () => import('./layout/shell/shell').then((m) => m.Shell),
    children: [
      {
        path: 'tienda',
        title: 'Tienda · PeludOS',
        loadComponent: () => import('./features/tienda/tienda').then((m) => m.Tienda),
      },
      {
        path: 'veterinarias',
        loadChildren: () => import('./features/veterinarias/veterinarias.routes').then((m) => m.VETERINARIAS_ROUTES),
      },
      {
        path: 'panel',
        canActivate: [autenticado],
        title: 'Inicio · PeludOS',
        loadComponent: () => import('./features/panel/panel').then((m) => m.Panel),
      },
      {
        path: 'mascotas',
        canActivate: [conRol('cliente')],
        loadChildren: () => import('./features/mascotas/mascotas.routes').then((m) => m.MASCOTAS_ROUTES),
      },
      {
        path: 'citas',
        canActivate: [conRol('cliente')],
        title: 'Citas · PeludOS',
        loadComponent: () => import('./features/citas/citas').then((m) => m.Citas),
      },
      {
        path: 'carrito',
        canActivate: [conRol('cliente')],
        title: 'Carrito · PeludOS',
        loadComponent: () => import('./features/carrito/carrito').then((m) => m.Carrito),
      },
      {
        path: 'pedidos',
        canActivate: [conRol('cliente')],
        title: 'Mis pedidos · PeludOS',
        loadComponent: () => import('./features/pedidos/pedidos').then((m) => m.Pedidos),
      },
      {
        path: 'mis-veterinarias',
        canActivate: [conRol('veterinaria')],
        loadChildren: () => import('./features/gestion/gestion.routes').then((m) => m.MIS_VETERINARIAS_ROUTES),
      },
      {
        path: 'agenda',
        canActivate: [conRol('veterinaria')],
        title: 'Agenda · PeludOS',
        loadComponent: () => import('./features/gestion/agenda/agenda').then((m) => m.Agenda),
      },
      {
        path: 'inventario',
        canActivate: [conRol('veterinaria')],
        title: 'Inventario · PeludOS',
        loadComponent: () => import('./features/gestion/inventario/inventario').then((m) => m.Inventario),
      },
      {
        path: 'pedidos-recibidos',
        canActivate: [conRol('veterinaria')],
        title: 'Pedidos recibidos · PeludOS',
        loadComponent: () => import('./features/gestion/pedidos/pedidos-recibidos').then((m) => m.PedidosRecibidos),
      },
      {
        path: 'mensajes',
        canActivate: [conRol('cliente', 'veterinaria')],
        title: 'Mensajes · PeludOS',
        loadComponent: () => import('./features/mensajes/mensajes').then((m) => m.Mensajes),
        children: [
          {
            path: ':id',
            loadComponent: () => import('./features/mensajes/conversacion').then((m) => m.Conversacion),
          },
        ],
      },
      {
        path: 'usuarios',
        canActivate: [conRol('admin')],
        title: 'Usuarios · PeludOS',
        loadComponent: () => import('./features/admin/usuarios').then((m) => m.Usuarios),
      },
      {
        path: 'gestion-veterinarias',
        canActivate: [conRol('admin')],
        title: 'Veterinarias · PeludOS',
        loadComponent: () => import('./features/admin/veterinarias-admin').then((m) => m.VeterinariasAdmin),
      },
    ],
  },
  { path: '**', redirectTo: '' },
];

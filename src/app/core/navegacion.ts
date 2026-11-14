export type Rol = 'cliente' | 'veterinaria' | 'admin';

export interface ItemMenu {
  etiqueta: string;
  icono: string;
  ruta: string;
}

const INICIO: ItemMenu = { etiqueta: 'Inicio', icono: 'home', ruta: '/panel' };

const MENU: Record<Rol, ItemMenu[]> = {
  cliente: [
    INICIO,
    { etiqueta: 'Mis mascotas', icono: 'pets', ruta: '/mascotas' },
    { etiqueta: 'Veterinarias', icono: 'location_on', ruta: '/veterinarias' },
    { etiqueta: 'Citas', icono: 'event', ruta: '/citas' },
    { etiqueta: 'Tienda', icono: 'storefront', ruta: '/tienda' },
    { etiqueta: 'Mis pedidos', icono: 'receipt_long', ruta: '/pedidos' },
    { etiqueta: 'Mensajes', icono: 'chat', ruta: '/mensajes' },
  ],
  veterinaria: [
    INICIO,
    { etiqueta: 'Mis veterinarias', icono: 'local_hospital', ruta: '/mis-veterinarias' },
    { etiqueta: 'Agenda', icono: 'calendar_month', ruta: '/agenda' },
    { etiqueta: 'Inventario', icono: 'inventory_2', ruta: '/inventario' },
    { etiqueta: 'Pedidos recibidos', icono: 'receipt_long', ruta: '/pedidos-recibidos' },
    { etiqueta: 'Mensajes', icono: 'chat', ruta: '/mensajes' },
  ],
  admin: [
    INICIO,
    { etiqueta: 'Usuarios', icono: 'group', ruta: '/usuarios' },
    { etiqueta: 'Veterinarias', icono: 'local_hospital', ruta: '/gestion-veterinarias' },
  ],
};

/** Menú de quien navega sin iniciar sesión. */
export const MENU_INVITADO: ItemMenu[] = [
  { etiqueta: 'Inicio', icono: 'home', ruta: '/' },
  { etiqueta: 'Veterinarias', icono: 'location_on', ruta: '/veterinarias' },
  { etiqueta: 'Tienda', icono: 'storefront', ruta: '/tienda' },
];

export const NOMBRE_ROL: Record<Rol, string> = {
  cliente: 'Cliente',
  veterinaria: 'Veterinaria',
  admin: 'Administrador',
};

export function menuDe(rol: Rol): ItemMenu[] {
  return MENU[rol];
}

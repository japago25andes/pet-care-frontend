import { Estado } from '../../shared/etiqueta/etiqueta';

export const ESTADOS_PEDIDO = [
  { valor: 'pendiente', texto: 'Pendiente', tono: 'alerta' },
  { valor: 'confirmado', texto: 'Confirmado', tono: 'info' },
  { valor: 'enviado', texto: 'Enviado', tono: 'info' },
  { valor: 'entregado', texto: 'Entregado', tono: 'exito' },
  { valor: 'cancelado', texto: 'Cancelado', tono: 'error' },
] as const;

export type EstadoPedido = (typeof ESTADOS_PEDIDO)[number]['valor'];

export function estadoPedido(estado: string): Estado {
  return ESTADOS_PEDIDO.find((e) => e.valor === estado) ?? { texto: estado, tono: 'neutro' };
}

const METODOS_PAGO: Record<string, string> = {
  efectivo: 'Efectivo contra entrega',
  tarjeta: 'Tarjeta',
  transferencia: 'Transferencia',
};

export function textoMetodoPago(metodo: string | null): string {
  return (metodo && METODOS_PAGO[metodo]) || 'Sin indicar';
}

import { ValidatorFn } from '@angular/forms';
import { hoyISO } from './fechas';

/** Quita espacios y convierte los textos vacíos en null, que es lo que espera la API. */
export function sinVacios<T extends object>(valores: T): T {
  const resultado: Record<string, unknown> = {};
  for (const [campo, valor] of Object.entries(valores)) {
    const limpio = typeof valor === 'string' ? valor.trim() : valor;
    resultado[campo] = limpio === '' ? null : limpio;
  }
  return resultado as T;
}

export function fechaNoFutura(mensaje: string): ValidatorFn {
  return (control) => (control.value && control.value > hoyISO() ? { fecha: mensaje } : null);
}

/** Para <input type="datetime-local">: el momento debe ser futuro. */
export function momentoFuturo(mensaje: string): ValidatorFn {
  return (control) => (control.value && new Date(control.value) <= new Date() ? { fecha: mensaje } : null);
}

/** La fecha debe ser igual o posterior a la del campo `otro` (estrictamente posterior si `estricta`). */
export function fechaPosterior(otro: string, mensaje: string, estricta = false): ValidatorFn {
  return (control) => {
    const base = control.parent?.get(otro)?.value;
    if (!control.value || !base) {
      return null;
    }
    const valida = estricta ? control.value > base : control.value >= base;
    return valida ? null : { fecha: mensaje };
  };
}

import { HttpErrorResponse } from '@angular/common/http';
import { AbstractControl, FormGroup } from '@angular/forms';

const SIN_CONEXION = 'No pudimos conectar con el servidor. Revisa que el back esté corriendo.';
const INESPERADO = 'Ocurrió un error inesperado. Intenta de nuevo.';

interface ErrorDeCampo {
  loc: (string | number)[];
  msg: string;
}

function limpiar(mensaje: string): string {
  if (mensaje.startsWith('value is not a valid email')) {
    return 'Escribe un correo válido';
  }
  return mensaje.replace(/^Value error, /, '');
}

/** Texto para mostrarle al usuario a partir de un error de la API. */
export function mensajeDeError(error: unknown): string {
  // resource() envuelve los errores que no son Error en uno con `cause`
  const original = (error as { cause?: unknown } | null)?.cause ?? error;
  if (!(original instanceof HttpErrorResponse)) {
    return INESPERADO;
  }
  return mensajeDeErrorHttp(original);
}

function mensajeDeErrorHttp(error: HttpErrorResponse): string {
  const detail = error.error?.detail;
  if (typeof detail === 'string') {
    return detail;
  }
  if (Array.isArray(detail) && detail.length > 0) {
    return limpiar(detail[0].msg);
  }
  return error.status === 0 || error.status >= 500 ? SIN_CONEXION : INESPERADO;
}

/** Pone los errores 422 en sus campos. Devuelve false si ninguno correspondía al formulario. */
export function aplicarErroresDeCampo(form: FormGroup, error: unknown): boolean {
  if (!(error instanceof HttpErrorResponse) || error.status !== 422 || !Array.isArray(error.error?.detail)) {
    return false;
  }
  let aplicado = false;
  for (const { loc, msg } of error.error.detail as ErrorDeCampo[]) {
    const control = form.get(String(loc[loc.length - 1]));
    if (control) {
      control.setErrors({ servidor: limpiar(msg) });
      aplicado = true;
    }
  }
  return aplicado;
}

/** Primer mensaje de validación de un campo, para mostrarlo en <mat-error>. */
export function mensajeDeCampo(control: AbstractControl): string {
  const errores = control.errors;
  if (!errores) {
    return '';
  }
  if (errores['required']) {
    return 'Este campo es obligatorio';
  }
  if (errores['email']) {
    return 'Escribe un correo válido';
  }
  if (errores['minlength']) {
    return `Mínimo ${errores['minlength'].requiredLength} caracteres`;
  }
  if (errores['maxlength']) {
    return `Máximo ${errores['maxlength'].requiredLength} caracteres`;
  }
  if (errores['min']) {
    return `El valor mínimo es ${errores['min'].min}`;
  }
  if (errores['pattern']) {
    return 'Usa máximo 2 decimales';
  }
  if (errores['max']) {
    return `Máximo ${errores['max'].max}`;
  }
  return errores['fecha'] ?? errores['servidor'] ?? 'Revisa este campo';
}

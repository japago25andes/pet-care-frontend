import { HttpErrorResponse } from '@angular/common/http';
import { FormControl, FormGroup } from '@angular/forms';
import { aplicarErroresDeCampo, mensajeDeCampo, mensajeDeError } from './errores';

function errorHttp(status: number, detail?: unknown) {
  return new HttpErrorResponse({ status, error: detail === undefined ? null : { detail } });
}

describe('mensajeDeError', () => {
  it('usa el detail de la API', () => {
    expect(mensajeDeError(errorHttp(409, 'Ya existe'))).toBe('Ya existe');
  });

  it('quita el prefijo de pydantic en los 422', () => {
    expect(mensajeDeError(errorHttp(422, [{ loc: ['body', 'x'], msg: 'Value error, Mal' }]))).toBe('Mal');
  });

  it('avisa cuando el back no responde', () => {
    expect(mensajeDeError(errorHttp(0))).toContain('No pudimos conectar');
    expect(mensajeDeError(errorHttp(504))).toContain('No pudimos conectar');
  });
});

describe('aplicarErroresDeCampo', () => {
  const crear = () => new FormGroup({ nombre: new FormControl('') });

  it('marca el campo con el mensaje del servidor', () => {
    const form = crear();
    const error = errorHttp(422, [{ loc: ['body', 'nombre'], msg: 'Muy largo' }]);
    expect(aplicarErroresDeCampo(form, error)).toBe(true);
    expect(mensajeDeCampo(form.controls.nombre)).toBe('Muy largo');
  });

  it('devuelve false si el campo no está en el formulario o no es 422', () => {
    expect(aplicarErroresDeCampo(crear(), errorHttp(422, [{ loc: ['body', 'otro'], msg: 'x' }]))).toBe(false);
    expect(aplicarErroresDeCampo(crear(), errorHttp(409, 'Ya existe'))).toBe(false);
  });
});

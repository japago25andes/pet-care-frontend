import { FormControl, FormGroup } from '@angular/forms';
import { aFechaHoraLocal, desdeFechaHoraLocal, edad } from './fechas';
import { fechaPosterior, sinVacios } from './formularios';

describe('edad', () => {
  const hoy = new Date(2026, 10, 8);

  it('cuenta años y meses cumplidos', () => {
    expect(edad('2021-05-10', hoy)).toBe('5 años');
    expect(edad('2025-11-08', hoy)).toBe('1 año');
    expect(edad('2026-03-20', hoy)).toBe('7 meses');
    expect(edad('2026-10-08', hoy)).toBe('1 mes');
    expect(edad('2026-11-01', hoy)).toBe('Menos de 1 mes');
  });
});

describe('fecha y hora local', () => {
  it('ida y vuelta conserva el instante', () => {
    const iso = '2026-11-08T15:30:00.000Z';
    expect(desdeFechaHoraLocal(aFechaHoraLocal(iso))).toBe(iso);
  });
});

describe('sinVacios', () => {
  it('limpia textos y deja lo demás', () => {
    expect(sinVacios({ a: '  hola ', b: '   ', c: 3, d: null })).toEqual({ a: 'hola', b: null, c: 3, d: null });
  });
});

describe('fechaPosterior', () => {
  const crear = (estricta: boolean) => {
    const form = new FormGroup({
      inicio: new FormControl('2026-01-10'),
      fin: new FormControl('', { validators: fechaPosterior('inicio', 'Mal', estricta) }),
    });
    return form.controls.fin;
  };

  it('acepta igual si no es estricta y rechaza anterior', () => {
    const fin = crear(false);
    fin.setValue('2026-01-10');
    expect(fin.valid).toBe(true);
    fin.setValue('2026-01-09');
    expect(fin.errors).toEqual({ fecha: 'Mal' });
  });

  it('rechaza igual si es estricta', () => {
    const fin = crear(true);
    fin.setValue('2026-01-10');
    expect(fin.errors).toEqual({ fecha: 'Mal' });
  });
});

import { hoyISO } from '../../core/fechas';
import { MedicamentoOut } from '../../core/api/models/medicamento-out';
import { RecordatorioOut } from '../../core/api/models/recordatorio-out';
import { VacunaOut } from '../../core/api/models/vacuna-out';
import { Estado } from '../../shared/etiqueta/etiqueta';

export const TIPOS_RECORDATORIO = [
  { valor: 'vacuna', texto: 'Vacuna', icono: 'vaccines' },
  { valor: 'medicamento', texto: 'Medicamento', icono: 'medication' },
  { valor: 'desparasitacion', texto: 'Desparasitación', icono: 'bug_report' },
  { valor: 'cita', texto: 'Cita', icono: 'event' },
  { valor: 'higiene', texto: 'Higiene', icono: 'shower' },
  { valor: 'alimentacion', texto: 'Alimentación', icono: 'restaurant' },
  { valor: 'otro', texto: 'Otro', icono: 'notifications' },
] as const;

export const FRECUENCIAS = [
  { valor: 'unica', texto: 'Una sola vez' },
  { valor: 'diaria', texto: 'Cada día' },
  { valor: 'semanal', texto: 'Cada semana' },
  { valor: 'mensual', texto: 'Cada mes' },
  { valor: 'anual', texto: 'Cada año' },
] as const;

export function iconoRecordatorio(tipo: string): string {
  return TIPOS_RECORDATORIO.find((t) => t.valor === tipo)?.icono ?? 'notifications';
}

export function textoFrecuencia(frecuencia: string | null): string {
  return FRECUENCIAS.find((f) => f.valor === frecuencia)?.texto ?? 'Una sola vez';
}

/** El recordatorio ya llegó a su fecha y nadie lo ha marcado. */
export function estaVencido(recordatorio: RecordatorioOut): boolean {
  return !recordatorio.notificado && new Date(recordatorio.fecha_programada) <= new Date();
}

export function estadoRecordatorio(recordatorio: RecordatorioOut): Estado {
  if (recordatorio.notificado) {
    return { texto: 'Hecho', tono: 'exito' };
  }
  return estaVencido(recordatorio) ? { texto: 'Vencido', tono: 'alerta' } : { texto: 'Programado', tono: 'info' };
}

export function estadoVacuna(vacuna: VacunaOut): Estado | null {
  if (!vacuna.fecha_proxima_dosis) {
    return null;
  }
  const hoy = hoyISO();
  if (vacuna.fecha_proxima_dosis < hoy) {
    return { texto: 'Refuerzo vencido', tono: 'error' };
  }
  const limite = new Date();
  limite.setDate(limite.getDate() + 30);
  return new Date(`${vacuna.fecha_proxima_dosis}T00:00:00`) <= limite
    ? { texto: 'Refuerzo próximo', tono: 'alerta' }
    : { texto: 'Al día', tono: 'exito' };
}

export function estadoMedicamento(medicamento: MedicamentoOut): Estado {
  const hoy = hoyISO();
  if (medicamento.fecha_inicio > hoy) {
    return { texto: 'Por iniciar', tono: 'info' };
  }
  return medicamento.fecha_fin && medicamento.fecha_fin < hoy
    ? { texto: 'Terminado', tono: 'neutro' }
    : { texto: 'En curso', tono: 'exito' };
}

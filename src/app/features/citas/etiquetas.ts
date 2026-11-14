import { CitaOut } from '../../core/api/models/cita-out';
import { Estado } from '../../shared/etiqueta/etiqueta';

const ESTADOS: Record<string, Estado> = {
  programada: { texto: 'Programada', tono: 'info' },
  confirmada: { texto: 'Confirmada', tono: 'exito' },
  completada: { texto: 'Completada', tono: 'neutro' },
  cancelada: { texto: 'Cancelada', tono: 'error' },
  no_asistio: { texto: 'No asistió', tono: 'alerta' },
};

export function estadoCita(estado: string): Estado {
  return ESTADOS[estado] ?? { texto: estado, tono: 'neutro' };
}

export function citaActiva(cita: CitaOut): boolean {
  return cita.estado === 'programada' || cita.estado === 'confirmada';
}

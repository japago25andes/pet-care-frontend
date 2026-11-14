function dosDigitos(valor: number): string {
  return String(valor).padStart(2, '0');
}

/** Hoy en formato YYYY-MM-DD, en la hora local. */
export function hoyISO(): string {
  const hoy = new Date();
  return `${hoy.getFullYear()}-${dosDigitos(hoy.getMonth() + 1)}-${dosDigitos(hoy.getDate())}`;
}

/** Fecha ISO del back al formato de <input type="datetime-local">. */
export function aFechaHoraLocal(iso: string): string {
  const fecha = new Date(iso);
  return (
    `${fecha.getFullYear()}-${dosDigitos(fecha.getMonth() + 1)}-${dosDigitos(fecha.getDate())}` +
    `T${dosDigitos(fecha.getHours())}:${dosDigitos(fecha.getMinutes())}`
  );
}

/** Valor de <input type="datetime-local"> a ISO con zona horaria. */
export function desdeFechaHoraLocal(valor: string): string {
  return new Date(valor).toISOString();
}

/** Edad legible a partir de una fecha de nacimiento YYYY-MM-DD. */
export function edad(fechaNacimiento: string, hoy = new Date()): string {
  const nacimiento = new Date(`${fechaNacimiento}T00:00:00`);
  let meses = (hoy.getFullYear() - nacimiento.getFullYear()) * 12 + hoy.getMonth() - nacimiento.getMonth();
  if (hoy.getDate() < nacimiento.getDate()) {
    meses--;
  }
  if (meses < 1) {
    return 'Menos de 1 mes';
  }
  if (meses < 12) {
    return `${meses} ${meses === 1 ? 'mes' : 'meses'}`;
  }
  const anios = Math.floor(meses / 12);
  return `${anios} ${anios === 1 ? 'año' : 'años'}`;
}

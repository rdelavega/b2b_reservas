/** Utilidades puras de horario en formato "HH:MM", usadas por sucursales y reservas. */

export function minutosDesde(hora: string): number {
  const [h, m] = hora.split(":").map(Number);
  return h * 60 + m;
}

export function horaDesdeMinutos(minutos: number): string {
  const h = Math.floor(minutos / 60).toString().padStart(2, "0");
  const m = (minutos % 60).toString().padStart(2, "0");
  return `${h}:${m}`;
}

export function sumarMinutos(hora: string, minutos: number): string {
  return horaDesdeMinutos(minutosDesde(hora) + minutos);
}

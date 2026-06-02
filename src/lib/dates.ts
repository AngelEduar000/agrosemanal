/** Utilidades de fechas en zona horaria UTC para evitar desfases de zona horaria local. */

export function startOfDay(d: Date): Date {
  const x = new Date(d);
  x.setUTCHours(0, 0, 0, 0);
  return x;
}

export function formatDateISO(d: Date): string {
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function parseDateISO(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

/** Devuelve la fecha actual (hoy) en UTC medianoche respetando el huso horario local */
export function getTodayUTC(): Date {
  const now = new Date();
  return new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
}

/** Lunes de la semana que contiene la fecha (en UTC) */
export function getWeekStart(d: Date): Date {
  const date = new Date(d);
  date.setUTCHours(0, 0, 0, 0);
  const day = date.getUTCDay();
  const diff = day === 0 ? -6 : 1 - day;
  date.setUTCDate(date.getUTCDate() + diff);
  return date;
}

export function getWeekEnd(weekStart: Date): Date {
  const end = new Date(weekStart);
  end.setUTCDate(end.getUTCDate() + 6);
  end.setUTCHours(23, 59, 59, 999);
  return end;
}

/** Identificador de semana: 2025-W22 (calculado en UTC) */
export function getWeekKey(d: Date): string {
  const start = getWeekStart(d);
  const year = start.getUTCFullYear();
  const jan1 = new Date(Date.UTC(year, 0, 1));
  const weekNum = Math.ceil(
    ((start.getTime() - getWeekStart(jan1).getTime()) / 86400000 + 1) / 7
  );
  return `${year}-W${String(weekNum).padStart(2, "0")}`;
}

export function getWeekDays(weekStart: Date): Date[] {
  return Array.from({ length: 7 }, (_, i) => {
    const day = new Date(weekStart);
    day.setUTCDate(day.getUTCDate() + i);
    day.setUTCHours(0, 0, 0, 0);
    return day;
  });
}

const DAY_NAMES = [
  "Domingo",
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",
];

const MONTH_NAMES = [
  "enero",
  "febrero",
  "marzo",
  "abril",
  "mayo",
  "junio",
  "julio",
  "agosto",
  "septiembre",
  "octubre",
  "noviembre",
  "diciembre",
];

export function formatDateLong(d: Date): string {
  return `${DAY_NAMES[d.getUTCDay()]}, ${d.getUTCDate()} de ${MONTH_NAMES[d.getUTCMonth()]} de ${d.getUTCFullYear()}`;
}

export function formatDateShort(d: Date): string {
  return `${d.getUTCDate()}/${d.getUTCMonth() + 1}/${d.getUTCFullYear()}`;
}

export function formatWeekRange(weekStart: Date): string {
  const end = getWeekEnd(weekStart);
  return `${formatDateShort(weekStart)} — ${formatDateShort(end)}`;
}

/** Inicio de semana (lunes) para un identificador weekKey (en UTC). */
export function getWeekStartForKey(weekKey: string, reference = getTodayUTC()): Date {
  const currentStart = getWeekStart(reference);
  if (weekKey === getWeekKey(reference)) return currentStart;

  const prev = new Date(currentStart);
  prev.setUTCDate(prev.getUTCDate() - 7);
  if (weekKey === getWeekKey(prev)) return prev;

  return currentStart;
}

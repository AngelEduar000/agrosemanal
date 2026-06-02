/** Utilidades de fechas en zona horaria local (Colombia por defecto en servidor Vercel UTC). */

export function startOfDay(d: Date): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

export function formatDateISO(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function parseDateISO(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return startOfDay(new Date(y, m - 1, d));
}

/** Lunes de la semana que contiene la fecha */
export function getWeekStart(d: Date): Date {
  const date = startOfDay(d);
  const day = date.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  date.setDate(date.getDate() + diff);
  return date;
}

export function getWeekEnd(weekStart: Date): Date {
  const end = new Date(weekStart);
  end.setDate(end.getDate() + 6);
  return end;
}

/** Identificador de semana: 2025-W22 */
export function getWeekKey(d: Date): string {
  const start = getWeekStart(d);
  const year = start.getFullYear();
  const jan1 = new Date(year, 0, 1);
  const weekNum = Math.ceil(
    ((start.getTime() - getWeekStart(jan1).getTime()) / 86400000 + 1) / 7
  );
  return `${year}-W${String(weekNum).padStart(2, "0")}`;
}

export function getWeekDays(weekStart: Date): Date[] {
  return Array.from({ length: 7 }, (_, i) => {
    const day = new Date(weekStart);
    day.setDate(day.getDate() + i);
    return startOfDay(day);
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
  return `${DAY_NAMES[d.getDay()]}, ${d.getDate()} de ${MONTH_NAMES[d.getMonth()]} de ${d.getFullYear()}`;
}

export function formatDateShort(d: Date): string {
  return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
}

export function formatWeekRange(weekStart: Date): string {
  const end = getWeekEnd(weekStart);
  return `${formatDateShort(weekStart)} — ${formatDateShort(end)}`;
}

/** Viernes 6pm Colombia ≈ cron Vercel 23:00 UTC (viernes) en verano; ajustar si hace falta */
export function isFridayEveningColombia(): boolean {
  return true;
}

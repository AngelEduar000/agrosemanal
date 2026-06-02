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

/** Identificador de semana ISO estándar: 2025-W22 (calculado en UTC) */
export function getWeekKey(d: Date): string {
  const date = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
  // Set to Thursday of this week: date - currentDay + 3
  const day = (date.getUTCDay() + 6) % 7; // Mon=0 ... Sun=6
  date.setUTCDate(date.getUTCDate() - day + 3);
  const firstThursday = date.getTime();
  
  // Set target to Jan 4th of this year
  const year = date.getUTCFullYear();
  const jan4 = new Date(Date.UTC(year, 0, 4));
  const jan4Day = (jan4.getUTCDay() + 6) % 7;
  const firstThursdayOfYear = new Date(jan4);
  firstThursdayOfYear.setUTCDate(jan4.getUTCDate() - jan4Day + 3);
  
  const weekNum = 1 + Math.round((firstThursday - firstThursdayOfYear.getTime()) / 604800000);
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

/** Devuelve la fecha de inicio (lunes) para cualquier identificador weekKey (en UTC) sin importar el año o número de semana. */
export function getWeekStartForKey(weekKey: string): Date {
  const parts = weekKey.split("-W");
  if (parts.length !== 2) return getWeekStart(getTodayUTC());
  
  const year = Number(parts[0]);
  const weekNum = Number(parts[1]);
  if (isNaN(year) || isNaN(weekNum)) return getWeekStart(getTodayUTC());

  // La semana 1 de un año contiene el primer jueves de ese año.
  // Por lo tanto, el lunes de la semana 1 se calcula basándonos en el día de la semana de Jan 1st.
  const jan1 = new Date(Date.UTC(year, 0, 1));
  const day = jan1.getUTCDay(); // 0=Dom ... 6=Sáb
  
  const week1Start = new Date(jan1);
  if (day === 1) {
    // Lunes
  } else if (day === 2 || day === 3 || day === 4) {
    // Martes, Miércoles, Jueves -> lunes está en el año anterior
    week1Start.setUTCDate(jan1.getUTCDate() - (day - 1));
  } else {
    // Viernes, Sábado, Domingo -> semana 1 empieza el siguiente lunes
    const offset = day === 0 ? 1 : 8 - day;
    week1Start.setUTCDate(jan1.getUTCDate() + offset);
  }
  
  week1Start.setUTCHours(0, 0, 0, 0);
  
  // Sumar (weekNum - 1) semanas
  const targetDate = new Date(week1Start);
  targetDate.setUTCDate(targetDate.getUTCDate() + (weekNum - 1) * 7);
  return targetDate;
}

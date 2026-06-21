// Local calendar-day helpers. Mirrors lib/services/date_service.dart.
//
// Everything operates on local 'yyyy-MM-dd' strings and local-midnight Dates,
// exactly like the Flutter app (which uses DateTime.now() in device-local time
// and compares date-only). All comparison helpers accept an optional `now` so
// callers/tests can pin "today" deterministically.

const pad = (n: number) => String(n).padStart(2, '0');

/** Format a Date as a local 'yyyy-MM-dd' string. */
export function toDateStr(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/** Parse a 'yyyy-MM-dd' string into a local-midnight Date. */
export function parseDateStr(s: string): Date {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d);
}

/** Today as a local 'yyyy-MM-dd' string. */
export function todayStr(now: Date = new Date()): string {
  return toDateStr(now);
}

/** Add `days` (may be negative) to a 'yyyy-MM-dd' string, returning a new string. */
export function addDaysStr(s: string, days: number): string {
  const d = parseDateStr(s);
  d.setDate(d.getDate() + days);
  return toDateStr(d);
}

/**
 * ISO weekday: Monday=1 ... Sunday=7 (matches Dart's DateTime.weekday).
 * JS Date.getDay() is Sunday=0..Saturday=6, so we remap.
 */
export function isoWeekday(s: string): number {
  const jsDay = parseDateStr(s).getDay();
  return ((jsDay + 6) % 7) + 1;
}

/** Monday=1..Friday=5. Mirrors DateTime.isWeekday(). */
export function isWeekday(s: string): boolean {
  const wd = isoWeekday(s);
  return wd >= 1 && wd <= 5;
}

/** target date is strictly before today (date-only). Mirrors isEarlierThanToday(). */
export function isEarlierThanToday(s: string, now: Date = new Date()): boolean {
  return s < todayStr(now);
}

/** target date is strictly after today (date-only). Mirrors isLaterThanToday(). */
export function isLaterThanToday(s: string, now: Date = new Date()): boolean {
  return s > todayStr(now);
}

export function isToday(s: string, now: Date = new Date()): boolean {
  return s === todayStr(now);
}

/**
 * The Monday (as 'yyyy-MM-dd') of the week containing `s`.
 * Uses ISO weeks: Monday is the first day.
 */
export function mondayOf(s: string): string {
  return addDaysStr(s, -(isoWeekday(s) - 1));
}

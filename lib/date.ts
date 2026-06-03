/** Small date helpers shared across stores + components. Local-time based. */

const DAY_MS = 24 * 60 * 60 * 1000;

/** Midnight-anchored day key, e.g. "2026-05-25". */
export function dayKey(d: Date = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function atMidnight(d: Date): number {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
}

/** Whole days from `from` to `to` (to - from). Negative if `to` is past. */
export function daysBetween(from: Date | string, to: Date | string = new Date()): number {
  const a = atMidnight(new Date(from));
  const b = atMidnight(new Date(to));
  return Math.round((b - a) / DAY_MS);
}

/** Whole days from today until `target`. Negative once overdue. */
export function daysUntil(target: Date | string): number {
  return daysBetween(new Date(), target);
}

/** Days elapsed since `since` (>= 0 for past dates). */
export function daysSince(since: Date | string): number {
  return Math.max(0, daysBetween(since, new Date()));
}

export function addDays(d: Date | string, n: number): Date {
  const base = new Date(d);
  return new Date(base.getTime() + n * DAY_MS);
}

export function isToday(d: Date | string): boolean {
  return dayKey(new Date(d)) === dayKey();
}

const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function weekdayName(day: number): string {
  return WEEKDAYS[((day % 7) + 7) % 7];
}

/** "Sunday, May 25" */
export function longDate(d: Date = new Date()): string {
  return `${WEEKDAYS[d.getDay()]}, ${MONTHS[d.getMonth()]} ${d.getDate()}`;
}

/** "May 25" */
export function shortDate(d: Date | string = new Date()): string {
  const date = new Date(d);
  return `${MONTHS[date.getMonth()]} ${date.getDate()}`;
}

/** Human relative timing, e.g. "today", "tomorrow", "in 3 days", "2 days ago". */
export function relativeDays(n: number): string {
  if (n === 0) return 'today';
  if (n === 1) return 'tomorrow';
  if (n === -1) return 'yesterday';
  if (n > 1) return `in ${n} days`;
  return `${Math.abs(n)} days ago`;
}

/** mm:ss from a millisecond duration (clamped at 0). */
export function formatCountdown(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

// Recurring-task expansion. Mirrors the expansion branch of
// lib/repositories/TaskItemRepository.dart getTasksForDate().
//
// Only two rules exist in the app: 'daily' and 'workDays' (Mon–Fri). This is NOT
// a general RRULE engine — keep it to these two cases to stay in sync with mobile.
import type { RecurrenceRule } from './types';
import { isWeekday, isLaterThanToday } from './dates';

export interface RecurringSpec {
  id: string;
  name: string;
  recurrenceRule: RecurrenceRule;
  winBreaker: boolean;
  isDeleted?: boolean;
  /** Dates the user removed this recurring task from — never re-materialized. */
  skipDates?: string[];
}

/** A recurring instance that should be materialized for a given date. */
export interface RecurringInstance {
  recurringId: string;
  name: string;
  winBreaker: boolean;
}

/**
 * Returns the recurring instances that should be created for `dateStr`.
 *
 * Parity notes with the Flutter app:
 * - Instances are only generated for dates strictly later than today
 *   (isLaterThanToday); today and past days are not auto-expanded here.
 * - A 'workDays' rule only applies on Mon–Fri.
 * - Deleted recurring tasks are skipped.
 * - An instance is skipped if one already exists for that recurringId on the day
 *   (caller passes the set of recurringIds already present).
 */
export function recurringInstancesForDate(
  recurring: RecurringSpec[],
  dateStr: string,
  existingRecurringIds: ReadonlySet<string>,
  now: Date = new Date(),
): RecurringInstance[] {
  if (!isLaterThanToday(dateStr, now)) return [];

  const out: RecurringInstance[] = [];
  for (const r of recurring) {
    if (r.isDeleted) continue;
    if (r.skipDates?.includes(dateStr)) continue;
    const applies =
      r.recurrenceRule === 'daily' ||
      (r.recurrenceRule === 'workDays' && isWeekday(dateStr));
    if (!applies) continue;
    if (existingRecurringIds.has(r.id)) continue;
    out.push({ recurringId: r.id, name: r.name, winBreaker: r.winBreaker });
  }
  return out;
}

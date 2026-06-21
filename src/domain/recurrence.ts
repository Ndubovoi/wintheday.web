// Recurring-task expansion. Mirrors the expansion branch of
// lib/repositories/TaskItemRepository.dart getTasksForDate().
//
// Only two rules exist in the app: 'daily' and 'workDays' (Mon–Fri). This is NOT
// a general RRULE engine — keep it to these two cases to stay in sync with mobile.
import type { RecurrenceRule, TaskItem } from './types';
import { isWeekday, isLaterThanToday, todayStr } from './dates';

/** Whether a recurrence rule applies on a given date (daily, or workDays on Mon–Fri). */
export function ruleAppliesOn(rule: RecurrenceRule, dateStr: string): boolean {
  return rule === 'daily' || (rule === 'workDays' && isWeekday(dateStr));
}

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
    if (!ruleAppliesOn(r.recurrenceRule, dateStr)) continue;
    if (existingRecurringIds.has(r.id)) continue;
    out.push({ recurringId: r.id, name: r.name, winBreaker: r.winBreaker });
  }
  return out;
}

/**
 * The full task list to DISPLAY for a day: the real (stored) tasks plus virtual
 * occurrences for every recurring template that applies to the day but has no
 * stored task yet. Virtual occurrences are flagged `virtual: true` and are
 * materialized into real docs only when the user interacts with them.
 *
 * Recurrence is shown from today onward — past days show only their stored tasks
 * (a recurring task you added today was never "due" on a past day).
 */
export function displayTasksForDate(
  realTasks: TaskItem[],
  recurring: RecurringSpec[],
  dateStr: string,
  now: Date = new Date(),
): TaskItem[] {
  if (dateStr < todayStr(now)) return realTasks;

  const present = new Set(
    realTasks.map((t) => t.recurringId).filter(Boolean) as string[],
  );

  const virtuals: TaskItem[] = [];
  for (const r of recurring) {
    if (r.isDeleted) continue;
    if (r.skipDates?.includes(dateStr)) continue;
    if (!ruleAppliesOn(r.recurrenceRule, dateStr)) continue;
    if (present.has(r.id)) continue;
    virtuals.push({
      id: `virtual:${r.id}:${dateStr}`,
      name: r.name,
      completed: false,
      date: dateStr,
      createdOn: dateStr,
      isRecurring: true,
      recurringId: r.id,
      winBreaker: r.winBreaker,
      x: 0,
      y: 0,
      virtual: true,
    });
  }
  return [...realTasks, ...virtuals];
}

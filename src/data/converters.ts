// The Firestore <-> domain boundary. All quirks of how the Flutter app encodes
// documents are normalized here, ONCE, so the rest of the app sees clean domain
// types (src/domain/types.ts).
//
// Encoding facts verified against the Flutter sources:
// - tasklist (TaskItem.toFirestore): completed/isRecurring/winBreaker are real
//   booleans; `date` and `createdOn` are 'yyyy-MM-dd' strings; recurringId is
//   string|null; x/y are numbers.
// - results (Result.toMap, written via database_sync.dart): doc id IS the date;
//   `won` is an INTEGER 1/0 (read back as `doc['won'] == 1`); `answeredOn` is an
//   ISO-8601 string. We coerce won from 1/0 OR true/false defensively, and write
//   it back as 1/0 to stay readable by mobile.
// - recurring_tasklist (RecurringTaskItem.toFirestore): recurrenceRule is the
//   display string 'Daily' | 'Work Days'; createdOn is a Firestore Timestamp.
// - customizations/{uid} (Customization.toMap): daysToWinWeek/weeksToWinYear ints,
//   modifiedOn ISO string.
import { Timestamp } from 'firebase/firestore';
import type {
  TaskItem,
  Result,
  RecurringTaskItem,
  Customization,
  RecurrenceRule,
} from '../domain/types';
import { toDateStr } from '../domain/dates';

type Raw = Record<string, unknown>;

const asBool = (v: unknown): boolean => v === true || v === 1;
const asNum = (v: unknown, fallback = 0): number =>
  typeof v === 'number' && Number.isFinite(v) ? v : fallback;
const asStr = (v: unknown, fallback = ''): string =>
  typeof v === 'string' ? v : fallback;

/** Normalize a Timestamp | ISO string | 'yyyy-MM-dd' into a 'yyyy-MM-dd' string. */
function toDayString(v: unknown): string {
  if (v instanceof Timestamp) return toDateStr(v.toDate());
  if (typeof v === 'string') return v.slice(0, 10);
  return toDateStr(new Date());
}

// ---- TaskItem ----
export function fromTaskDoc(id: string, data: Raw): TaskItem {
  return {
    id,
    name: asStr(data.name),
    completed: asBool(data.completed),
    date: toDayString(data.date),
    createdOn: toDayString(data.createdOn),
    isRecurring: asBool(data.isRecurring),
    recurringId: (data.recurringId as string | null) ?? null,
    winBreaker: asBool(data.winBreaker),
    x: asNum(data.x),
    y: asNum(data.y),
  };
}

export function toTaskDoc(task: Omit<TaskItem, 'id'>): Raw {
  return {
    name: task.name,
    completed: task.completed,
    date: task.date,
    createdOn: task.createdOn,
    isRecurring: task.isRecurring,
    recurringId: task.recurringId ?? null,
    winBreaker: task.winBreaker,
    x: task.x,
    y: task.y,
  };
}

// ---- Result ---- (doc id is the date)
export function fromResultDoc(id: string, data: Raw): Result {
  return {
    date: id,
    won: asBool(data.won),
    answeredOn: asStr(data.answeredOn),
  };
}

/** Matches mobile's encoding: won as 1/0, answeredOn as ISO string. */
export function toResultDoc(result: Result): Raw {
  return {
    won: result.won ? 1 : 0,
    answeredOn: result.answeredOn,
  };
}

// ---- RecurringTaskItem ----
const RULE_FROM_STRING: Record<string, RecurrenceRule> = {
  Daily: 'daily',
  'Work Days': 'workDays',
};
const RULE_TO_STRING: Record<RecurrenceRule, string> = {
  daily: 'Daily',
  workDays: 'Work Days',
};

export function fromRecurringDoc(id: string, data: Raw): RecurringTaskItem {
  return {
    id,
    name: asStr(data.name),
    recurrenceRule: RULE_FROM_STRING[asStr(data.recurrenceRule)] ?? 'daily',
    recurrenceDetails: (data.recurrenceDetails as string | null) ?? null,
    createdOn: toDayString(data.createdOn),
    isDeleted: asBool(data.isDeleted),
    winBreaker: asBool(data.winBreaker),
  };
}

/** createdOn is stamped here (Timestamp), so callers omit it. */
export function toRecurringDoc(item: Omit<RecurringTaskItem, 'id' | 'createdOn'>): Raw {
  return {
    name: item.name,
    recurrenceRule: RULE_TO_STRING[item.recurrenceRule],
    recurrenceDetails: item.recurrenceDetails ?? null,
    createdOn: Timestamp.fromDate(new Date()),
    isDeleted: item.isDeleted,
    winBreaker: item.winBreaker,
  };
}

// ---- Customization ----
export function fromCustomizationDoc(data: Raw): Customization {
  return {
    daysToWinWeek: asNum(data.daysToWinWeek, 6),
    weeksToWinYear: asNum(data.weeksToWinYear, 41),
  };
}

export function toCustomizationDoc(c: Customization): Raw {
  return {
    daysToWinWeek: c.daysToWinWeek,
    weeksToWinYear: c.weeksToWinYear,
    modifiedOn: new Date().toISOString(),
  };
}

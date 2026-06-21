// Pure domain types for Win The Day.
// These are plain TS shapes — NOT Firestore documents. The data layer converts
// raw Firestore docs into these at the boundary (see src/data/converters.ts).
//
// Dates are local calendar-day strings 'yyyy-MM-dd' to match the Flutter app,
// which keys everything on local dates (see lib/models/*.dart).

export type RecurrenceRule = 'daily' | 'workDays';

export interface TaskItem {
  id: string;
  name: string;
  completed: boolean;
  /** Local calendar day, 'yyyy-MM-dd'. */
  date: string;
  /** Local calendar day the task was created, 'yyyy-MM-dd'. */
  createdOn: string;
  isRecurring: boolean;
  recurringId?: string | null;
  winBreaker: boolean;
  /** Canvas coordinates for the bubble board (mobile parity). */
  x: number;
  y: number;
}

export interface RecurringTaskItem {
  id: string;
  name: string;
  recurrenceRule: RecurrenceRule;
  recurrenceDetails?: string | null;
  createdOn: string;
  isDeleted: boolean;
  winBreaker: boolean;
}

export interface Result {
  /** Local calendar day, 'yyyy-MM-dd'. */
  date: string;
  won: boolean;
  /** ISO timestamp or 'yyyy-MM-dd' depending on writer; opaque to domain logic. */
  answeredOn: string;
}

export interface Customization {
  daysToWinWeek: number;
  weeksToWinYear: number;
}

/** Mobile defaults, from lib/services/customization_serivce.dart getCustomization(). */
export const DEFAULT_CUSTOMIZATION: Customization = {
  daysToWinWeek: 6,
  weeksToWinYear: 41,
};

import { describe, it, expect } from 'vitest';
import { recurringInstancesForDate, type RecurringSpec } from '../recurrence';

const daily: RecurringSpec = { id: 'd1', name: 'Meditate', recurrenceRule: 'daily', winBreaker: false };
const work: RecurringSpec = { id: 'w1', name: 'Standup', recurrenceRule: 'workDays', winBreaker: true };
const now = new Date(2026, 5, 17); // Wed 2026-06-17
const NONE: ReadonlySet<string> = new Set();

describe('recurringInstancesForDate', () => {
  it('returns nothing for today (only strictly-future dates expand)', () => {
    expect(recurringInstancesForDate([daily, work], '2026-06-17', NONE, now)).toEqual([]);
  });

  it('returns nothing for a past date', () => {
    expect(recurringInstancesForDate([daily, work], '2026-06-10', NONE, now)).toEqual([]);
  });

  it('expands daily + workDays on a future weekday', () => {
    const out = recurringInstancesForDate([daily, work], '2026-06-18', NONE, now); // Thu
    expect(out.map((i) => i.recurringId).sort()).toEqual(['d1', 'w1']);
  });

  it('skips workDays on a future weekend, keeps daily', () => {
    const out = recurringInstancesForDate([daily, work], '2026-06-20', NONE, now); // Sat
    expect(out.map((i) => i.recurringId)).toEqual(['d1']);
  });

  it('skips a recurring task already present that day', () => {
    const out = recurringInstancesForDate([daily, work], '2026-06-18', new Set(['d1']), now);
    expect(out.map((i) => i.recurringId)).toEqual(['w1']);
  });

  it('skips deleted recurring tasks', () => {
    const deleted = { ...daily, isDeleted: true };
    expect(recurringInstancesForDate([deleted], '2026-06-18', NONE, now)).toEqual([]);
  });

  it('carries name and winBreaker into the instance', () => {
    const [inst] = recurringInstancesForDate([work], '2026-06-18', NONE, now);
    expect(inst).toEqual({ recurringId: 'w1', name: 'Standup', winBreaker: true });
  });
});

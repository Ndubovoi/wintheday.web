import { describe, it, expect } from 'vitest';
import { recurringInstancesForDate, displayTasksForDate, type RecurringSpec } from '../recurrence';
import type { TaskItem } from '../types';

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

  it('skips dates listed in skipDates (removed-from-this-day)', () => {
    const withSkip = { ...daily, skipDates: ['2026-06-18'] };
    expect(recurringInstancesForDate([withSkip], '2026-06-18', NONE, now)).toEqual([]);
    // but still applies on other days
    expect(recurringInstancesForDate([withSkip], '2026-06-19', NONE, now).map((i) => i.recurringId)).toEqual(['d1']);
  });

  it('carries name and winBreaker into the instance', () => {
    const [inst] = recurringInstancesForDate([work], '2026-06-18', NONE, now);
    expect(inst).toEqual({ recurringId: 'w1', name: 'Standup', winBreaker: true });
  });
});

const realTask = (over: Partial<TaskItem>): TaskItem => ({
  id: 'r', name: 'Real', completed: false, date: '2026-06-18', createdOn: '2026-06-18',
  isRecurring: false, recurringId: null, winBreaker: false, x: 0, y: 0, ...over,
});

describe('displayTasksForDate — recurring shows on every applicable day', () => {
  it('shows a daily recurring task on another (future) day with no stored task', () => {
    const out = displayTasksForDate([], [daily], '2026-06-19', now); // Fri, no real docs
    expect(out).toHaveLength(1);
    expect(out[0]).toMatchObject({ recurringId: 'd1', name: 'Meditate', completed: false, virtual: true });
  });

  it('shows the recurring task on today too', () => {
    const out = displayTasksForDate([], [daily], '2026-06-17', now); // today
    expect(out.map((t) => t.recurringId)).toEqual(['d1']);
  });

  it('does NOT show recurring tasks on past days (history is stored-only)', () => {
    const out = displayTasksForDate([], [daily], '2026-06-10', now);
    expect(out).toEqual([]);
  });

  it('workDays appears on a future weekday but not a weekend', () => {
    expect(displayTasksForDate([], [work], '2026-06-18', now)).toHaveLength(1); // Thu
    expect(displayTasksForDate([], [work], '2026-06-20', now)).toHaveLength(0); // Sat
  });

  it('excludes skipped and deleted templates', () => {
    expect(displayTasksForDate([], [{ ...daily, skipDates: ['2026-06-19'] }], '2026-06-19', now)).toEqual([]);
    expect(displayTasksForDate([], [{ ...daily, isDeleted: true }], '2026-06-19', now)).toEqual([]);
  });

  it('does not duplicate when a stored task already exists for that recurringId', () => {
    const stored = realTask({ id: 't1', recurringId: 'd1', isRecurring: true, completed: true, date: '2026-06-19' });
    const out = displayTasksForDate([stored], [daily], '2026-06-19', now);
    expect(out).toHaveLength(1);
    expect(out[0].id).toBe('t1');
    expect(out[0].completed).toBe(true);
    expect(out[0].virtual).toBeFalsy();
  });

  it('returns stored tasks plus virtual recurring ones together', () => {
    const stored = realTask({ id: 't1', name: 'One-off', date: '2026-06-19' });
    const out = displayTasksForDate([stored], [daily], '2026-06-19', now);
    expect(out.map((t) => t.name).sort()).toEqual(['Meditate', 'One-off']);
  });
});

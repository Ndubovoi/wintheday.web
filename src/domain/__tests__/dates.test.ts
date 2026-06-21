import { describe, it, expect } from 'vitest';
import {
  toDateStr,
  addDaysStr,
  isoWeekday,
  isWeekday,
  mondayOf,
  isEarlierThanToday,
  isLaterThanToday,
  isToday,
} from '../dates';

describe('dates', () => {
  it('formats local dates as yyyy-MM-dd', () => {
    expect(toDateStr(new Date(2026, 5, 7))).toBe('2026-06-07');
  });

  it('adds days across a month boundary', () => {
    expect(addDaysStr('2026-06-30', 1)).toBe('2026-07-01');
    expect(addDaysStr('2026-07-01', -1)).toBe('2026-06-30');
  });

  it('computes ISO weekday (Mon=1..Sun=7)', () => {
    expect(isoWeekday('2026-06-15')).toBe(1); // Monday
    expect(isoWeekday('2026-06-17')).toBe(3); // Wednesday
    expect(isoWeekday('2026-06-20')).toBe(6); // Saturday
    expect(isoWeekday('2026-06-21')).toBe(7); // Sunday
  });

  it('identifies weekdays', () => {
    expect(isWeekday('2026-06-17')).toBe(true); // Wed
    expect(isWeekday('2026-06-20')).toBe(false); // Sat
    expect(isWeekday('2026-06-21')).toBe(false); // Sun
  });

  it('finds the Monday of a week', () => {
    expect(mondayOf('2026-06-17')).toBe('2026-06-15');
    expect(mondayOf('2026-06-21')).toBe('2026-06-15');
    expect(mondayOf('2026-06-15')).toBe('2026-06-15');
  });

  it('compares against today', () => {
    const now = new Date(2026, 5, 17);
    expect(isEarlierThanToday('2026-06-16', now)).toBe(true);
    expect(isEarlierThanToday('2026-06-17', now)).toBe(false);
    expect(isLaterThanToday('2026-06-18', now)).toBe(true);
    expect(isLaterThanToday('2026-06-17', now)).toBe(false);
    expect(isToday('2026-06-17', now)).toBe(true);
  });
});

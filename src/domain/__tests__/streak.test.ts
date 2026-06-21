import { describe, it, expect } from 'vitest';
import { currentDayStreak, currentWeekStreak, type ResultMap } from '../streak';

describe('currentDayStreak', () => {
  const now = new Date(2026, 5, 17); // Wed 2026-06-17

  it('counts consecutive wins ending yesterday', () => {
    const r: ResultMap = { '2026-06-16': true, '2026-06-15': true, '2026-06-14': true };
    expect(currentDayStreak(r, now)).toBe(3);
  });

  it('adds today when today is a win', () => {
    const r: ResultMap = { '2026-06-17': true, '2026-06-16': true, '2026-06-15': true };
    expect(currentDayStreak(r, now)).toBe(3);
  });

  it("resets to 0 when today is a recorded loss", () => {
    const r: ResultMap = { '2026-06-17': false, '2026-06-16': true, '2026-06-15': true };
    expect(currentDayStreak(r, now)).toBe(0);
  });

  it('stops at a gap (missing day)', () => {
    const r: ResultMap = { '2026-06-16': true, '2026-06-14': true };
    expect(currentDayStreak(r, now)).toBe(1);
  });

  it('stops immediately at a loss yesterday', () => {
    const r: ResultMap = { '2026-06-16': false, '2026-06-15': true };
    expect(currentDayStreak(r, now)).toBe(0);
  });

  it('is 0 with no results', () => {
    expect(currentDayStreak({}, now)).toBe(0);
  });
});

// Helper: mark all 7 days of a week (Mon..Sun) won up to `wins` days.
function week(monday: string, wins: number): ResultMap {
  const out: ResultMap = {};
  const [y, m, d] = monday.split('-').map(Number);
  for (let i = 0; i < 7; i++) {
    const dt = new Date(y, m - 1, d + i);
    const key = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}`;
    out[key] = i < wins;
  }
  return out;
}

describe('currentWeekStreak', () => {
  it('counts elapsed past weeks (midweek, no current-week adjustment)', () => {
    const now = new Date(2026, 5, 17); // Wed 2026-06-17 -> starts at Mon 2026-06-08
    const r: ResultMap = {
      ...week('2026-06-08', 5), // won
      ...week('2026-06-01', 5), // won
      ...week('2026-05-25', 4), // not won -> stop
    };
    expect(currentWeekStreak(r, 5, now)).toBe(2);
  });

  it('on Sunday, extends with the current week when it is won', () => {
    const now = new Date(2026, 5, 21); // Sun 2026-06-21
    const r: ResultMap = {
      ...week('2026-06-08', 5), // past week won -> streak 1
      ...week('2026-06-01', 4), // not won -> stop past walk
      ...week('2026-06-15', 5), // current week won
      '2026-06-21': true, // today has a result (precondition for Sunday adjustment)
    };
    expect(currentWeekStreak(r, 5, now)).toBe(2);
  });

  it('on Sunday, resets to 0 when the current week is not won', () => {
    const now = new Date(2026, 5, 21); // Sun 2026-06-21
    const r: ResultMap = {
      ...week('2026-06-08', 5), // would-be past streak
      ...week('2026-06-15', 3), // current week NOT won
      '2026-06-21': false, // today recorded
    };
    expect(currentWeekStreak(r, 5, now)).toBe(0);
  });

  it('on Sunday with no result today, only past weeks count', () => {
    const now = new Date(2026, 5, 21); // Sun 2026-06-21
    const r: ResultMap = {
      ...week('2026-06-08', 5), // won
      ...week('2026-06-01', 5), // won
      ...week('2026-05-25', 2), // not won
      ...week('2026-06-15', 7), // current week fully won, but today absent -> ignored
    };
    // 2026-06-21 (today) intentionally absent from results
    delete r['2026-06-21'];
    expect(currentWeekStreak(r, 5, now)).toBe(2);
  });
});

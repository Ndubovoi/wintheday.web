import { describe, it, expect } from 'vitest';
import { isDayWon, shouldPersistResult } from '../winDay';

const t = (completed: boolean, winBreaker = false) => ({ completed, winBreaker });

describe('isDayWon', () => {
  it('is false for an empty day (0/0 = NaN parity)', () => {
    expect(isDayWon([])).toBe(false);
  });

  it('wins at exactly 80% completion with no open win-breaker', () => {
    expect(isDayWon([t(true), t(true), t(true), t(true), t(false)])).toBe(true);
  });

  it('loses below 80% completion', () => {
    expect(isDayWon([t(true), t(true), t(true), t(false), t(false)])).toBe(false);
  });

  it('loses when an incomplete win-breaker remains, even at 80%', () => {
    // 4/5 complete, but the incomplete one is a win-breaker
    expect(isDayWon([t(true), t(true), t(true), t(true), t(false, true)])).toBe(false);
  });

  it('wins when the only incomplete task is NOT a win-breaker', () => {
    expect(isDayWon([t(true), t(true), t(true), t(true, true), t(false)])).toBe(true);
  });

  it('wins with a single completed task (1/1)', () => {
    expect(isDayWon([t(true)])).toBe(true);
  });

  it('loses with a single incomplete task (0/1)', () => {
    expect(isDayWon([t(false)])).toBe(false);
  });

  it('wins at 100% including a completed win-breaker', () => {
    expect(isDayWon([t(true, true), t(true)])).toBe(true);
  });
});

describe('shouldPersistResult', () => {
  const now = new Date(2026, 5, 17); // Wed 2026-06-17

  it('persists a win on any day', () => {
    expect(shouldPersistResult(true, '2026-06-17', now)).toBe(true); // today
    expect(shouldPersistResult(true, '2026-06-20', now)).toBe(true); // future
  });

  it('persists a past day even when lost', () => {
    expect(shouldPersistResult(false, '2026-06-10', now)).toBe(true);
  });

  it('does NOT persist a non-win for today or the future', () => {
    expect(shouldPersistResult(false, '2026-06-17', now)).toBe(false); // today
    expect(shouldPersistResult(false, '2026-06-20', now)).toBe(false); // future
  });
});

// Win-day rule. Mirrors lib/repositories/TaskItemRepository.dart updateWinStatusForDate().
import { isEarlierThanToday } from './dates';

export interface DayTask {
  completed: boolean;
  winBreaker: boolean;
}

/**
 * A day is "won" if at least 80% of its tasks are completed AND no incomplete
 * win-breaker task remains.
 *
 * Edge case parity with Dart: with zero tasks, percent = 0/0 = NaN and
 * `NaN >= 0.8` is false, so an empty day is never auto-won.
 */
export function isDayWon(tasks: DayTask[]): boolean {
  if (tasks.length === 0) return false;
  const hasOpenWinBreaker = tasks.some((t) => !t.completed && t.winBreaker);
  const percentCompleted = tasks.filter((t) => t.completed).length / tasks.length;
  return !hasOpenWinBreaker && percentCompleted >= 0.8;
}

/**
 * Whether a Result should be persisted for `dateStr`.
 *
 * Mirrors the persistence guard in updateWinStatusForDate: a result is saved when
 * the day is won OR the day is already in the past; otherwise the result is
 * deleted (so adding a task to an empty future/today day doesn't create a "loss").
 */
export function shouldPersistResult(
  isWon: boolean,
  dateStr: string,
  now: Date = new Date(),
): boolean {
  return isWon || isEarlierThanToday(dateStr, now);
}

// Win-status orchestration — composes the pure win-day rule (src/domain/winDay)
// with result persistence. Mirrors TaskItemRepository.dart updateWinStatusForDate():
// recompute whether a day is won, then persist the Result when it should be kept
// (won, or already past) and delete it otherwise.
import { isDayWon, shouldPersistResult } from '../domain/winDay';
import type { TaskItem } from '../domain/types';
import { saveResult, deleteResult } from './results.repo';

export async function updateWinStatusForDate(
  uid: string,
  dateStr: string,
  tasks: TaskItem[],
  now: Date = new Date(),
): Promise<void> {
  const won = isDayWon(tasks);
  if (shouldPersistResult(won, dateStr, now)) {
    await saveResult(uid, { date: dateStr, won, answeredOn: now.toISOString() });
  } else {
    await deleteResult(uid, dateStr);
  }
}

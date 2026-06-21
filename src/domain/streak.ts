// Streak calculations. Mirrors lib/database/database_helper.dart
// getCurrentWinningStreak() (day) and getCurrentWeekWinningStreak() (week).
import { todayStr, addDaysStr, mondayOf, isoWeekday } from './dates';

/** Map of 'yyyy-MM-dd' -> won. Absent key means "no result for that day". */
export type ResultMap = Record<string, boolean>;

/**
 * Current daily winning streak.
 *
 * Walks backwards from yesterday while each day has a result and it's a win.
 * Then applies today's adjustment: if today is a win, +1; if today is a
 * recorded loss, the streak resets to 0.
 */
export function currentDayStreak(results: ResultMap, now: Date = new Date()): number {
  const today = todayStr(now);
  let streak = 0;
  let checkDate = addDaysStr(today, -1); // start from yesterday

  while (results[checkDate] === true) {
    streak++;
    checkDate = addDaysStr(checkDate, -1);
  }

  if (results[today] === true) {
    streak++;
  } else if (results[today] === false) {
    streak = 0;
  }

  return streak;
}

/** Won-day count within the Mon–Sun week beginning at `mondayStr`. */
function weekWinCount(results: ResultMap, mondayStr: string): number {
  let count = 0;
  for (let i = 0; i < 7; i++) {
    if (results[addDaysStr(mondayStr, i)] === true) count++;
  }
  return count;
}

function isWeekWon(results: ResultMap, mondayStr: string, daysToWinWeek: number): boolean {
  return weekWinCount(results, mondayStr) >= daysToWinWeek;
}

/**
 * Current weekly winning streak.
 *
 * Counts fully-elapsed past weeks that were "won" (>= daysToWinWeek wins),
 * walking back week by week from the previous week's Monday. On Sundays — the
 * last day of an ISO week — if today already has a result, the current week is
 * also evaluated: a win extends the streak, a loss resets it to 0.
 */
export function currentWeekStreak(
  results: ResultMap,
  daysToWinWeek: number,
  now: Date = new Date(),
): number {
  const today = todayStr(now);
  let streak = 0;

  // lastMonday = Monday of the *previous* week (today - (isoWeekday + 6) days),
  // matching the Dart offset.
  let lastMonday = addDaysStr(today, -(isoWeekday(today) + 6));

  while (isWeekWon(results, lastMonday, daysToWinWeek)) {
    streak++;
    lastMonday = addDaysStr(lastMonday, -7);
  }

  if (isoWeekday(today) === 7 && results[today] !== undefined) {
    const thisMonday = mondayOf(today);
    if (isWeekWon(results, thisMonday, daysToWinWeek)) {
      streak++;
    } else {
      streak = 0;
    }
  }

  return streak;
}

# `domain/` — pure business logic (mobile parity)

This folder is a **faithful TypeScript mirror** of business logic that also lives in
the Flutter app. It is the web's single, contained copy of that logic — there is no
shared backend that owns it (mobile is offline-first and computes locally), so this
duplication is intentional and kept honest by the golden-vector tests in `__tests__/`.

## Hard rules

- **Pure only.** No imports from `firebase`, `../data`, React, or anything with I/O.
  Functions take plain values and return plain values. Time enters only via an
  optional `now: Date` argument so tests can pin "today".
- **Local calendar days.** Everything keys on local `'yyyy-MM-dd'` strings, matching
  the Flutter app's device-local date semantics.

## Source of truth (keep in sync)

When the rule changes, change the spec **here first**, update the golden vectors, then
mirror into mobile (or vice-versa). The Dart sources mirrored:

| TS file          | Dart source |
|------------------|-------------|
| `winDay.ts`      | `lib/repositories/TaskItemRepository.dart` → `updateWinStatusForDate` |
| `streak.ts`      | `lib/database/database_helper.dart` → `getCurrentWinningStreak`, `getCurrentWeekWinningStreak` |
| `recurrence.ts`  | `lib/repositories/TaskItemRepository.dart` → `getTasksForDate` (expansion branch) |
| `dates.ts`       | `lib/services/date_service.dart` |

(Paths are in the sibling `wintheday` Flutter repo.)

## Known parity subtleties (covered by tests)

- Empty day → `isDayWon` is `false` (Dart computes `0/0 = NaN`, `NaN >= 0.8` is false).
- A future/today day with no win is **not** persisted as a loss (`shouldPersistResult`).
- Day streak counts back from *yesterday*, then adjusts for today (win = +1, loss = reset).
- Week streak counts elapsed past weeks; on Sunday the current week is also evaluated.
- Recurring instances are only generated for dates **strictly later than today**.

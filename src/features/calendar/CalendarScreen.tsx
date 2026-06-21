import { useState } from 'react';
import {
  addMonths,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  format,
  getDay,
  isAfter,
} from 'date-fns';
import { useStreaks } from '../streaks/useStreaks';
import StreakBadges from '../streaks/StreakBadges';
import { toDateStr, parseDateStr, todayStr } from '../../domain/dates';

const WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

export default function CalendarScreen() {
  const { results, dayStreak, weekStreak } = useStreaks();
  const [month, setMonth] = useState(() => startOfMonth(parseDateStr(todayStr())));

  const days = eachDayOfInterval({ start: startOfMonth(month), end: endOfMonth(month) });
  const leading = getDay(startOfMonth(month)); // blank cells before day 1
  const today = parseDateStr(todayStr());

  const winsThisMonth = days.filter((d) => results[toDateStr(d)] === true).length;

  return (
    <div className="mx-auto max-w-2xl">
      <header className="mb-5 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-wtd-text">History</h1>
        <StreakBadges dayStreak={dayStreak} weekStreak={weekStreak} />
      </header>

      <div className="rounded-2xl border border-wtd-border bg-wtd-surface p-4">
        <div className="mb-4 flex items-center justify-between">
          <button
            onClick={() => setMonth((m) => addMonths(m, -1))}
            className="rounded-lg px-3 py-1 text-wtd-muted hover:text-wtd-text"
            aria-label="Previous month"
          >
            ‹
          </button>
          <span className="font-medium text-wtd-text">{format(month, 'MMMM yyyy')}</span>
          <button
            onClick={() => setMonth((m) => addMonths(m, 1))}
            className="rounded-lg px-3 py-1 text-wtd-muted hover:text-wtd-text"
            aria-label="Next month"
          >
            ›
          </button>
        </div>

        <div className="mb-2 grid grid-cols-7 gap-1 text-center text-xs text-wtd-muted">
          {WEEKDAYS.map((w, i) => (
            <span key={i}>{w}</span>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: leading }).map((_, i) => (
            <span key={`b${i}`} />
          ))}
          {days.map((d) => {
            const key = toDateStr(d);
            const won = results[key];
            const isToday = key === todayStr();
            const isFuture = isAfter(d, today);
            return (
              <div
                key={key}
                className={`flex aspect-square items-center justify-center rounded-lg text-sm ${
                  isToday ? 'ring-1 ring-wtd-teal-accent' : ''
                } ${
                  won === true
                    ? 'bg-wtd-win/20 text-wtd-win'
                    : won === false
                      ? 'bg-wtd-loss/20 text-wtd-loss'
                      : `bg-wtd-surface-2 ${isFuture ? 'text-wtd-muted/40' : 'text-wtd-muted'}`
                }`}
              >
                {d.getDate()}
              </div>
            );
          })}
        </div>
      </div>

      <p className="mt-4 text-center text-sm text-wtd-muted">
        <span className="font-semibold text-wtd-win">{winsThisMonth}</span> day
        {winsThisMonth === 1 ? '' : 's'} won in {format(month, 'MMMM')}
      </p>
    </div>
  );
}

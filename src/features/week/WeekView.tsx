import { useState } from 'react';
import { format } from 'date-fns';
import { addDaysStr, mondayOf, todayStr, parseDateStr } from '../../domain/dates';
import { useStreaks } from '../streaks/useStreaks';
import StreakBadges from '../streaks/StreakBadges';
import DayPanel from './DayPanel';

export default function WeekView() {
  const [weekStart, setWeekStart] = useState(() => mondayOf(todayStr()));
  const [expanded, setExpanded] = useState<Set<string>>(() => new Set([todayStr()]));
  const { dayStreak, weekStreak } = useStreaks();

  const days = Array.from({ length: 7 }, (_, i) => addDaysStr(weekStart, i));
  const weekEnd = days[6];
  const isCurrentWeek = weekStart === mondayOf(todayStr());

  const toggle = (date: string) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(date)) next.delete(date);
      else next.add(date);
      return next;
    });

  const rangeLabel = `${format(parseDateStr(weekStart), 'MMM d')} – ${format(
    parseDateStr(weekEnd),
    weekStart.slice(5, 7) === weekEnd.slice(5, 7) ? 'd' : 'MMM d',
  )}`;

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <button
              onClick={() => setWeekStart((w) => addDaysStr(w, -7))}
              className="rounded-lg px-2 py-1 text-wtd-muted hover:bg-wtd-surface-2 hover:text-wtd-text"
              aria-label="Previous week"
            >
              ‹
            </button>
            <button
              onClick={() => setWeekStart((w) => addDaysStr(w, 7))}
              className="rounded-lg px-2 py-1 text-wtd-muted hover:bg-wtd-surface-2 hover:text-wtd-text"
              aria-label="Next week"
            >
              ›
            </button>
          </div>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-wtd-text">
              {isCurrentWeek ? 'This week' : 'Week'}
            </h1>
            <p className="text-xs font-medium uppercase tracking-widest text-wtd-muted">
              {rangeLabel}
            </p>
          </div>
          {!isCurrentWeek && (
            <button
              onClick={() => setWeekStart(mondayOf(todayStr()))}
              className="rounded-lg border border-wtd-border px-3 py-1.5 text-xs text-wtd-muted hover:border-wtd-teal-accent/40 hover:text-wtd-text"
            >
              This week
            </button>
          )}
        </div>
        <StreakBadges dayStreak={dayStreak} weekStreak={weekStreak} />
      </header>

      <div className="flex flex-col gap-3">
        {days.map((date) => (
          <DayPanel
            key={date}
            date={date}
            expanded={expanded.has(date)}
            onToggle={() => toggle(date)}
          />
        ))}
      </div>
    </div>
  );
}

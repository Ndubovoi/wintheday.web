import { useState } from 'react';
import { format } from 'date-fns';
import { addDaysStr, mondayOf, todayStr, parseDateStr } from '../../domain/dates';
import { useStreaks } from '../streaks/useStreaks';
import StreakBadges from '../streaks/StreakBadges';
import SelectedDayHero from './SelectedDayHero';
import DayCard from './DayCard';

export default function WeekView() {
  const [weekStart, setWeekStart] = useState(() => mondayOf(todayStr()));
  const [selected, setSelected] = useState(() => todayStr());
  const { dayStreak, weekStreak } = useStreaks();

  const days = Array.from({ length: 7 }, (_, i) => addDaysStr(weekStart, i));
  const weekEnd = days[6];
  const isCurrentWeek = weekStart === mondayOf(todayStr());

  function goToWeek(newStart: string) {
    setWeekStart(newStart);
    const thisWeek = mondayOf(todayStr());
    setSelected(newStart === thisWeek ? todayStr() : newStart);
  }

  const rangeLabel = `${format(parseDateStr(weekStart), 'MMM d')} – ${format(
    parseDateStr(weekEnd),
    weekStart.slice(5, 7) === weekEnd.slice(5, 7) ? 'd' : 'MMM d',
  )}`;

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <button
              onClick={() => goToWeek(addDaysStr(weekStart, -7))}
              className="rounded-lg px-2 py-1 text-wtd-muted hover:bg-wtd-surface-2 hover:text-wtd-text"
              aria-label="Previous week"
            >
              ‹
            </button>
            <button
              onClick={() => goToWeek(addDaysStr(weekStart, 7))}
              className="rounded-lg px-2 py-1 text-wtd-muted hover:bg-wtd-surface-2 hover:text-wtd-text"
              aria-label="Next week"
            >
              ›
            </button>
          </div>
          <div>
            <h2 className="text-lg font-semibold tracking-tight text-wtd-text">
              {isCurrentWeek ? 'This week' : 'Week'}
            </h2>
            <p className="text-xs font-medium uppercase tracking-widest text-wtd-muted">
              {rangeLabel}
            </p>
          </div>
          {!isCurrentWeek && (
            <button
              onClick={() => goToWeek(mondayOf(todayStr()))}
              className="rounded-lg border border-wtd-border px-3 py-1.5 text-xs text-wtd-muted hover:border-wtd-teal-accent/40 hover:text-wtd-text"
            >
              This week
            </button>
          )}
        </div>
        <StreakBadges dayStreak={dayStreak} weekStreak={weekStreak} />
      </header>

      {/* Hero: the selected day's circle + task management */}
      <SelectedDayHero date={selected} />

      {/* Week strip: faded day cards at the bottom; hover to preview, click to select */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7 lg:items-start">
        {days.map((date) => (
          <DayCard
            key={date}
            date={date}
            selected={date === selected}
            onSelect={() => setSelected(date)}
          />
        ))}
      </div>
    </div>
  );
}

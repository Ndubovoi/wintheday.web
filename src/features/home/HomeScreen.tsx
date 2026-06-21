import { useEffect, useRef, useState } from 'react';
import { format } from 'date-fns';
import { todayStr, parseDateStr } from '../../domain/dates';
import { useDay } from './useDay';
import { useStreaks } from '../streaks/useStreaks';
import StreakBadges from '../streaks/StreakBadges';
import ProgressCircle from './components/ProgressCircle';
import CalendarStrip from './components/CalendarStrip';
import TaskComposer from './components/TaskComposer';
import TaskRow from './components/TaskRow';
import { celebrate } from '../../shared/confetti';

export default function HomeScreen() {
  const [selected, setSelected] = useState(() => todayStr());
  const day = useDay(selected);
  const { results, dayStreak, weekStreak } = useStreaks();

  // Confetti when the selected day flips from not-won to won.
  const prevWon = useRef(day.won);
  useEffect(() => {
    if (day.won && !prevWon.current) celebrate();
    prevWon.current = day.won;
  }, [day.won]);

  const heading = day.isToday ? 'Today' : format(parseDateStr(selected), 'EEEE, MMM d');

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-widest text-wtd-muted">
            {format(parseDateStr(selected), 'MMMM yyyy')}
          </p>
          <h1 className="text-3xl font-semibold tracking-tight text-wtd-text">{heading}</h1>
        </div>
        <StreakBadges dayStreak={dayStreak} weekStreak={weekStreak} />
      </header>

      <CalendarStrip selected={selected} results={results} onSelect={setSelected} />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,380px)_1fr] lg:items-start">
        {/* Hero */}
        <section className="flex flex-col items-center gap-5 rounded-2xl border border-wtd-border bg-wtd-surface p-8">
          <ProgressCircle
            completed={day.completed}
            total={day.tasks.length}
            openWinBreakers={day.openWinBreakers}
            size={300}
          />
          {day.tasks.length > 0 && (
            <p className="text-sm text-wtd-muted">
              {day.completed} of {day.tasks.length} done
            </p>
          )}
        </section>

        {/* Tasks */}
        <section className="flex flex-col gap-5 rounded-2xl border border-wtd-border bg-wtd-surface p-6">
          <TaskComposer onAdd={day.add} onAddRecurring={day.addRecurringTask} />

          {day.error && <p className="text-sm text-wtd-loss">{day.error}</p>}

          {day.loading ? (
            <p className="py-8 text-center text-wtd-muted">Loading…</p>
          ) : day.tasks.length === 0 ? (
            <p className="py-8 text-center text-wtd-muted">
              No tasks yet — add one above to start winning.
            </p>
          ) : (
            <ul className="flex flex-col gap-2">
              {day.tasks.map((task) => (
                <TaskRow
                  key={task.id}
                  task={task}
                  onToggle={() => day.toggle(task)}
                  onRemove={() => day.remove(task)}
                  onMoveToTomorrow={() => day.moveToTomorrow(task)}
                />
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}

import { useEffect, useRef } from 'react';
import { format } from 'date-fns';
import { parseDateStr, todayStr } from '../../domain/dates';
import { useDay } from '../home/useDay';
import ProgressCircle from '../home/components/ProgressCircle';
import TaskComposer from '../home/components/TaskComposer';
import TaskRow from '../home/components/TaskRow';
import { celebrate } from '../../shared/confetti';

export default function SelectedDayHero({ date }: { date: string }) {
  const day = useDay(date);
  const isToday = date === todayStr();
  const heading = isToday ? 'Today' : format(parseDateStr(date), 'EEEE');

  // Celebrate whenever the displayed day flips to won — from a tap here OR a
  // completion synced from another device. The baseline is keyed to the day's
  // loaded data, so selecting an already-won day never fires confetti.
  const baseline = useRef<{ date: string; won: boolean } | null>(null);
  useEffect(() => {
    if (day.loadedDate !== date) return; // data isn't for this day yet
    const b = baseline.current;
    if (!b || b.date !== date) {
      baseline.current = { date, won: day.won }; // first settled value: set, don't celebrate
      return;
    }
    if (!b.won && day.won) celebrate();
    baseline.current = { date, won: day.won };
  }, [day.won, day.loadedDate, date]);

  return (
    <section className="rounded-3xl border border-wtd-border bg-wtd-surface p-6 md:p-8">
      <div className="flex flex-col items-center gap-8 md:flex-row md:items-start md:gap-10">
        {/* Circle */}
        <div className="flex shrink-0 flex-col items-center gap-3 md:w-[300px]">
          <div className="text-center">
            <p className="text-xs font-medium uppercase tracking-widest text-wtd-muted">
              {format(parseDateStr(date), 'EEEE, MMMM d')}
            </p>
            <h1 className="text-2xl font-semibold tracking-tight text-wtd-text">{heading}</h1>
          </div>
          <ProgressCircle
            completed={day.completed}
            total={day.tasks.length}
            openWinBreakers={day.openWinBreakers}
            size={280}
          />
        </div>

        {/* Task management */}
        <div className="flex w-full min-w-0 flex-1 flex-col gap-4">
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
                  onRemoveSeries={() => day.removeSeries(task)}
                  onMoveToTomorrow={() => day.moveToTomorrow(task)}
                />
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}

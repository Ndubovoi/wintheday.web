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

  // Celebrate only on a real win transition (not when switching to an already-won day).
  const prevWon = useRef(day.won);
  const settled = useRef(false);
  const key = useRef(date);
  useEffect(() => {
    if (key.current !== date) {
      key.current = date;
      settled.current = false;
    }
    if (day.loading) return;
    if (!settled.current) {
      settled.current = true;
      prevWon.current = day.won;
      return;
    }
    if (day.won && !prevWon.current) celebrate();
    prevWon.current = day.won;
  }, [day.won, day.loading, date]);

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

import { useEffect, useRef } from 'react';
import { format } from 'date-fns';
import { parseDateStr, todayStr } from '../../domain/dates';
import { useDay } from '../home/useDay';
import ProgressCircle from '../home/components/ProgressCircle';
import TaskComposer from '../home/components/TaskComposer';
import TaskRow from '../home/components/TaskRow';
import { celebrate } from '../../shared/confetti';

export default function DayPanel({
  date,
  expanded,
  onToggle,
}: {
  date: string;
  expanded: boolean;
  onToggle: () => void;
}) {
  const day = useDay(date);
  const dt = parseDateStr(date);
  const today = todayStr();
  const isToday = date === today;
  const isPast = date < today;

  // Celebrate only on a real win transition — not when opening an already-won day.
  const prevWon = useRef(day.won);
  const settled = useRef(false);
  useEffect(() => {
    if (day.loading) return;
    if (!settled.current) {
      settled.current = true;
      prevWon.current = day.won;
      return;
    }
    if (day.won && !prevWon.current && expanded) celebrate();
    prevWon.current = day.won;
  }, [day.won, day.loading, expanded]);

  const total = day.tasks.length;
  const status: 'won' | 'lost' | 'progress' | 'empty' = day.won
    ? 'won'
    : isPast && total > 0
      ? 'lost'
      : total === 0
        ? 'empty'
        : 'progress';

  return (
    <div
      className={`overflow-hidden rounded-2xl border transition-colors ${
        isToday
          ? 'border-wtd-teal-accent/60 bg-wtd-surface'
          : status === 'won'
            ? 'border-wtd-win/30 bg-wtd-surface'
            : status === 'lost'
              ? 'border-wtd-loss/25 bg-wtd-surface'
              : 'border-wtd-border bg-wtd-surface'
      }`}
    >
      {/* Header */}
      <button
        onClick={onToggle}
        className="flex w-full items-center gap-4 px-4 py-3 text-left hover:bg-wtd-surface-2/50"
        aria-expanded={expanded}
      >
        <ProgressCircle
          completed={day.completed}
          total={total}
          openWinBreakers={day.openWinBreakers}
          size={46}
          showText={false}
        />

        <div className="flex min-w-0 flex-col">
          <span className="flex items-baseline gap-2">
            <span className={`font-semibold ${isToday ? 'text-wtd-teal-accent' : 'text-wtd-text'}`}>
              {format(dt, 'EEEE')}
            </span>
            {isToday && (
              <span className="rounded-full bg-wtd-teal-accent/15 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-wtd-teal-accent">
                Today
              </span>
            )}
          </span>
          <span className="text-xs text-wtd-muted">{format(dt, 'MMM d')}</span>
        </div>

        <div className="ml-auto flex items-center gap-3">
          <StatusChip status={status} completed={day.completed} total={total} />
          <span
            className={`text-wtd-muted transition-transform duration-300 ${expanded ? 'rotate-90' : ''}`}
          >
            ›
          </span>
        </div>
      </button>

      {/* Body (animated collapse) */}
      <div
        className={`grid transition-all duration-300 ease-out ${
          expanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
        }`}
      >
        <div className="overflow-hidden" inert={!expanded}>
          <div className="flex flex-col gap-6 border-t border-wtd-border px-4 py-6 md:flex-row md:items-start md:gap-8">
            <div className="flex shrink-0 justify-center md:w-[260px]">
              <ProgressCircle
                completed={day.completed}
                total={total}
                openWinBreakers={day.openWinBreakers}
                size={220}
              />
            </div>

            <div className="flex min-w-0 flex-1 flex-col gap-4">
              <TaskComposer onAdd={day.add} onAddRecurring={day.addRecurringTask} />
              {day.error && <p className="text-sm text-wtd-loss">{day.error}</p>}
              {day.tasks.length === 0 ? (
                <p className="py-4 text-center text-sm text-wtd-muted">No tasks for this day.</p>
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
        </div>
      </div>
    </div>
  );
}

function StatusChip({
  status,
  completed,
  total,
}: {
  status: 'won' | 'lost' | 'progress' | 'empty';
  completed: number;
  total: number;
}) {
  if (status === 'won')
    return (
      <span className="rounded-full bg-wtd-win/15 px-2.5 py-1 text-xs font-semibold text-wtd-win">
        Won
      </span>
    );
  if (status === 'lost')
    return (
      <span className="rounded-full bg-wtd-loss/15 px-2.5 py-1 text-xs font-semibold text-wtd-loss">
        Lost
      </span>
    );
  if (status === 'empty')
    return <span className="text-xs text-wtd-muted">No tasks</span>;
  return (
    <span className="text-xs font-medium text-wtd-muted">
      {completed}/{total} done
    </span>
  );
}

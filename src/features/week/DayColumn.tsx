import { useEffect, useRef } from 'react';
import { format } from 'date-fns';
import { parseDateStr, todayStr } from '../../domain/dates';
import { useDay } from '../home/useDay';
import ProgressCircle from '../home/components/ProgressCircle';
import TaskComposer from '../home/components/TaskComposer';
import type { TaskItem } from '../../domain/types';
import { celebrate } from '../../shared/confetti';

type Status = 'won' | 'lost' | 'progress' | 'empty';

export default function DayColumn({
  date,
  selected,
  onSelect,
}: {
  date: string;
  selected: boolean;
  onSelect: () => void;
}) {
  const day = useDay(date);
  const dt = parseDateStr(date);
  const today = todayStr();
  const isToday = date === today;
  const isPast = date < today;
  const total = day.tasks.length;
  const pct = total === 0 ? 0 : day.completed / total;

  const status: Status = day.won
    ? 'won'
    : isPast && total > 0
      ? 'lost'
      : total === 0
        ? 'empty'
        : 'progress';

  // Celebrate only on a real win transition on the focused (selected) day.
  const prevWon = useRef(day.won);
  const settled = useRef(false);
  useEffect(() => {
    if (day.loading) return;
    if (!settled.current) {
      settled.current = true;
      prevWon.current = day.won;
      return;
    }
    if (day.won && !prevWon.current && selected) celebrate();
    prevWon.current = day.won;
  }, [day.won, day.loading, selected]);

  return (
    <div
      className={`flex min-h-[460px] flex-col rounded-2xl border transition-colors ${
        selected
          ? 'border-wtd-teal-accent/70 bg-wtd-surface'
          : status === 'won'
            ? 'border-wtd-win/30 bg-wtd-surface/70'
            : status === 'lost'
              ? 'border-wtd-loss/25 bg-wtd-surface/70'
              : 'border-wtd-border bg-wtd-surface/70 hover:border-wtd-teal-accent/40'
      }`}
    >
      {/* Header */}
      <button
        onClick={onSelect}
        className="flex items-center justify-between gap-2 rounded-t-2xl px-3 py-2.5 text-left"
        aria-pressed={selected}
      >
        <div className="flex flex-col">
          <span className={`text-sm font-semibold ${isToday ? 'text-wtd-teal-accent' : 'text-wtd-text'}`}>
            {format(dt, 'EEE')}
          </span>
          <span className="text-xs text-wtd-muted">{format(dt, 'MMM d')}</span>
        </div>
        <StatusDot status={status} />
      </button>

      {/* Focus area: circle (selected) or slim progress bar */}
      {selected ? (
        <div className="flex flex-col items-center gap-3 px-3 pb-3">
          <ProgressCircle
            completed={day.completed}
            total={total}
            openWinBreakers={day.openWinBreakers}
            size={150}
          />
          <div className="w-full">
            <TaskComposer onAdd={day.add} onAddRecurring={day.addRecurringTask} compact />
          </div>
        </div>
      ) : (
        <div className="px-3 pb-2">
          <ProgressBar pct={pct} status={status} />
          <p className="mt-1 text-[11px] text-wtd-muted">
            {total === 0 ? 'No tasks' : `${day.completed}/${total} done`}
          </p>
        </div>
      )}

      {/* Task list */}
      <ul className="flex flex-1 flex-col gap-1.5 overflow-y-auto px-3 pb-3">
        {day.tasks.map((task) => (
          <CompactTaskRow
            key={task.id}
            task={task}
            onToggle={() => day.toggle(task)}
            onRemove={() => day.remove(task)}
          />
        ))}
      </ul>
    </div>
  );
}

function CompactTaskRow({
  task,
  onToggle,
  onRemove,
}: {
  task: TaskItem;
  onToggle: () => void;
  onRemove: () => void;
}) {
  return (
    <li className="group flex items-center gap-2 rounded-lg border border-wtd-border/60 bg-wtd-surface-2/60 px-2 py-1.5">
      <input
        type="checkbox"
        checked={task.completed}
        onChange={onToggle}
        className="size-4 shrink-0 accent-wtd-teal"
        aria-label={task.completed ? `Mark ${task.name} incomplete` : `Complete ${task.name}`}
      />
      <span
        className={`min-w-0 flex-1 truncate text-sm ${
          task.completed ? 'text-wtd-muted line-through' : 'text-wtd-text'
        }`}
        title={task.name}
      >
        {task.winBreaker && <span className="mr-1 text-wtd-cyan" title="Win-breaker">★</span>}
        {task.isRecurring && <span className="mr-1 text-wtd-teal-accent" title="Recurring">↻</span>}
        {task.name}
      </span>
      <button
        onClick={onRemove}
        className="shrink-0 text-wtd-muted opacity-0 transition-opacity hover:text-wtd-loss group-hover:opacity-100"
        aria-label={`Delete ${task.name}`}
      >
        ✕
      </button>
    </li>
  );
}

function ProgressBar({ pct, status }: { pct: number; status: Status }) {
  const color =
    status === 'won' ? 'bg-wtd-win' : status === 'lost' ? 'bg-wtd-loss' : 'bg-wtd-teal';
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-wtd-surface-2">
      <div
        className={`h-full rounded-full transition-all duration-500 ${color}`}
        style={{ width: `${Math.round(pct * 100)}%` }}
      />
    </div>
  );
}

function StatusDot({ status }: { status: Status }) {
  if (status === 'won')
    return <span className="rounded-full bg-wtd-win/15 px-2 py-0.5 text-[10px] font-semibold text-wtd-win">Won</span>;
  if (status === 'lost')
    return <span className="rounded-full bg-wtd-loss/15 px-2 py-0.5 text-[10px] font-semibold text-wtd-loss">Lost</span>;
  return <span className={`size-2 rounded-full ${status === 'progress' ? 'bg-wtd-teal/60' : 'bg-wtd-border'}`} />;
}

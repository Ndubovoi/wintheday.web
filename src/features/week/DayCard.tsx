import { format } from 'date-fns';
import { parseDateStr, todayStr } from '../../domain/dates';
import { useDay } from '../home/useDay';

type Status = 'won' | 'lost' | 'progress' | 'empty';

export default function DayCard({
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

  const barColor =
    status === 'won' ? 'bg-wtd-win' : status === 'lost' ? 'bg-wtd-loss' : 'bg-wtd-teal';

  return (
    <button
      onClick={onSelect}
      aria-pressed={selected}
      className={`group flex flex-col gap-2 rounded-2xl border p-3 text-left transition-all duration-200 hover:-translate-y-1 hover:scale-[1.03] hover:shadow-xl hover:shadow-black/40 ${
        selected
          ? 'border-wtd-teal-accent/70 bg-wtd-surface opacity-100'
          : 'border-wtd-border bg-wtd-surface/50 opacity-60 hover:opacity-100 hover:border-wtd-teal-accent/40'
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-col">
          <span className={`text-sm font-semibold ${isToday ? 'text-wtd-teal-accent' : 'text-wtd-text'}`}>
            {format(dt, 'EEE')}
          </span>
          <span className="text-xs text-wtd-muted">{format(dt, 'MMM d')}</span>
        </div>
        <StatusDot status={status} />
      </div>

      <div className="h-1.5 w-full overflow-hidden rounded-full bg-wtd-surface-2">
        <div
          className={`h-full rounded-full transition-all duration-500 ${barColor}`}
          style={{ width: `${Math.round(pct * 100)}%` }}
        />
      </div>
      <span className="text-[11px] text-wtd-muted">
        {total === 0 ? 'No tasks' : `${day.completed}/${total} done`}
      </span>

      {/* Task preview — revealed on hover (read-only; manage in the hero above). */}
      <div className="grid grid-rows-[0fr] transition-all duration-300 ease-out group-hover:grid-rows-[1fr] group-focus-visible:grid-rows-[1fr]">
        <ul className="flex min-h-0 flex-col gap-1 overflow-hidden">
          {day.tasks.map((task) => (
            <li key={task.id} className="flex items-center gap-1.5 pt-1 text-xs">
              <span
                className={`size-1.5 shrink-0 rounded-full ${
                  task.completed ? 'bg-wtd-teal' : task.winBreaker ? 'bg-wtd-cyan' : 'bg-wtd-muted/50'
                }`}
              />
              <span className={`truncate ${task.completed ? 'text-wtd-muted line-through' : 'text-wtd-text'}`}>
                {task.name}
              </span>
            </li>
          ))}
          {total === 0 && <li className="pt-1 text-xs text-wtd-muted">Nothing planned</li>}
        </ul>
      </div>
    </button>
  );
}

function StatusDot({ status }: { status: Status }) {
  if (status === 'won')
    return <span className="rounded-full bg-wtd-win/15 px-2 py-0.5 text-[10px] font-semibold text-wtd-win">Won</span>;
  if (status === 'lost')
    return <span className="rounded-full bg-wtd-loss/15 px-2 py-0.5 text-[10px] font-semibold text-wtd-loss">Lost</span>;
  return <span className={`mt-1 size-2 rounded-full ${status === 'progress' ? 'bg-wtd-teal/60' : 'bg-wtd-border'}`} />;
}

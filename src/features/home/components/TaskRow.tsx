import type { TaskItem } from '../../../domain/types';

export default function TaskRow({
  task,
  onToggle,
  onRemove,
  onRemoveSeries,
  onMoveToTomorrow,
}: {
  task: TaskItem;
  onToggle: () => void;
  /** Remove from this day only. For a recurring task this also skips that day. */
  onRemove: () => void;
  /** Remove the whole recurring series (stop repeating). Recurring tasks only. */
  onRemoveSeries?: () => void;
  onMoveToTomorrow: () => void;
}) {
  return (
    <li className="group flex items-center gap-3 rounded-xl border border-wtd-border bg-wtd-surface px-3 py-2.5 transition-colors hover:border-wtd-border/80">
      <input
        type="checkbox"
        checked={task.completed}
        onChange={onToggle}
        className="size-5 shrink-0 accent-wtd-teal"
        aria-label={task.completed ? `Mark ${task.name} incomplete` : `Complete ${task.name}`}
      />
      <span className="flex flex-1 items-center gap-2">
        <span className={task.completed ? 'text-wtd-muted line-through' : 'text-wtd-text'}>
          {task.name}
        </span>
        {task.winBreaker && (
          <span className="rounded bg-wtd-cyan/20 px-1.5 py-0.5 text-xs text-wtd-cyan">
            win-breaker
          </span>
        )}
        {task.isRecurring && (
          <span className="rounded bg-wtd-teal-accent/15 px-1.5 py-0.5 text-xs text-wtd-teal-accent">
            ↻ recurring
          </span>
        )}
      </span>
      <div className="flex items-center gap-1">
        {!task.isRecurring && (
          <button
            onClick={onMoveToTomorrow}
            title="Move to tomorrow"
            aria-label={`Move ${task.name} to tomorrow`}
            className="rounded px-1.5 py-0.5 text-wtd-muted hover:text-wtd-teal-accent"
          >
            →
          </button>
        )}
        <button
          onClick={onRemove}
          title={task.isRecurring ? 'Remove from this day' : 'Delete'}
          aria-label={task.isRecurring ? `Remove ${task.name} from this day` : `Delete ${task.name}`}
          className="rounded px-1.5 py-0.5 text-wtd-muted hover:text-wtd-loss"
        >
          ✕
        </button>
        {task.isRecurring && onRemoveSeries && (
          <button
            onClick={onRemoveSeries}
            title="Stop repeating — remove from all days"
            aria-label={`Stop repeating ${task.name} and remove from all days`}
            className="flex items-center gap-0.5 rounded px-2 py-0.5 text-xs font-medium text-wtd-muted hover:bg-wtd-loss/15 hover:text-wtd-loss"
          >
            <span className="line-through">↻</span> stop
          </button>
        )}
      </div>
    </li>
  );
}

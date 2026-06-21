import type { TaskItem } from '../../../domain/types';

export default function TaskRow({
  task,
  onToggle,
  onRemove,
  onMoveToTomorrow,
}: {
  task: TaskItem;
  onToggle: () => void;
  onRemove: () => void;
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
      <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
        <button
          onClick={onMoveToTomorrow}
          title="Move to tomorrow"
          aria-label={`Move ${task.name} to tomorrow`}
          className="rounded px-1.5 py-0.5 text-wtd-muted hover:text-wtd-teal-accent"
        >
          →
        </button>
        <button
          onClick={onRemove}
          title="Delete"
          aria-label={`Delete ${task.name}`}
          className="rounded px-1.5 py-0.5 text-wtd-muted hover:text-wtd-loss"
        >
          ✕
        </button>
      </div>
    </li>
  );
}

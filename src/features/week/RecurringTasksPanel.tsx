import type { RecurringTaskItem } from '../../domain/types';

/**
 * Side panel listing the user's recurring tasks with a "stop repeating" control.
 * Renders nothing when there are no recurring tasks.
 */
export default function RecurringTasksPanel({
  items,
  onRemove,
}: {
  items: RecurringTaskItem[];
  onRemove: (id: string) => void;
}) {
  if (items.length === 0) return null;

  return (
    <aside className="h-fit rounded-2xl border border-wtd-border bg-wtd-surface p-5">
      <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-wtd-muted">
        Recurring tasks
      </h2>
      <ul className="flex flex-col gap-2">
        {items.map((r) => (
          <li
            key={r.id}
            className="flex items-center justify-between gap-2 rounded-lg border border-wtd-border bg-wtd-surface-2 px-3 py-2"
          >
            <span className="min-w-0">
              <span className="flex items-center gap-1.5 truncate text-sm text-wtd-text">
                {r.winBreaker && (
                  <span className="text-wtd-cyan" title="Win-breaker">
                    ★
                  </span>
                )}
                {r.name}
              </span>
              <span className="text-xs text-wtd-muted">
                {r.recurrenceRule === 'daily' ? 'Daily' : 'Work days'}
              </span>
            </span>
            <button
              onClick={() => onRemove(r.id)}
              title="Stop repeating — remove from all days"
              aria-label={`Stop repeating ${r.name}`}
              className="flex shrink-0 items-center gap-0.5 rounded px-2 py-1 text-xs font-medium text-wtd-muted hover:bg-wtd-loss/15 hover:text-wtd-loss"
            >
              <span className="line-through">↻</span> stop
            </button>
          </li>
        ))}
      </ul>
    </aside>
  );
}

import { useState } from 'react';
import { useToday } from './useToday';
import type { TaskItem } from '../../domain/types';

export default function HomeScreen() {
  const { date, tasks, loading, error, won, add, toggle, remove } = useToday();
  const [name, setName] = useState('');
  const [winBreaker, setWinBreaker] = useState(false);

  const completed = tasks.filter((t) => t.completed).length;

  async function onAdd(e: React.FormEvent) {
    e.preventDefault();
    await add(name, winBreaker);
    setName('');
    setWinBreaker(false);
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <header className="mb-6">
        <p className="text-sm text-wtd-muted">{date}</p>
        <h1 className="text-2xl font-semibold text-wtd-text">Today</h1>
      </header>

      <div
        className={`mb-6 rounded-xl border px-4 py-3 ${
          won
            ? 'border-wtd-teal/40 bg-wtd-teal/10 text-wtd-teal'
            : 'border-wtd-border bg-wtd-surface text-wtd-muted'
        }`}
      >
        {tasks.length === 0
          ? 'Add your tasks for today to start winning.'
          : won
            ? `Day won — ${completed}/${tasks.length} done 🎉`
            : `${completed}/${tasks.length} done — keep going (80% to win).`}
      </div>

      <form onSubmit={onAdd} className="mb-6 flex flex-col gap-3">
        <div className="flex gap-2">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Add a task…"
            className="flex-1 rounded-lg border border-wtd-border bg-wtd-surface px-3 py-2 text-wtd-text placeholder:text-wtd-muted focus:border-wtd-cyan focus:outline-none"
          />
          <button
            type="submit"
            disabled={!name.trim()}
            className="rounded-lg bg-wtd-teal px-4 py-2 font-medium text-wtd-bg disabled:opacity-40"
          >
            Add
          </button>
        </div>
        <label className="flex items-center gap-2 text-sm text-wtd-muted">
          <input
            type="checkbox"
            checked={winBreaker}
            onChange={(e) => setWinBreaker(e.target.checked)}
            className="accent-wtd-cyan"
          />
          Win-breaker (must be done to win the day)
        </label>
      </form>

      {error && <p className="mb-4 text-sm text-red-400">{error}</p>}
      {loading ? (
        <p className="text-wtd-muted">Loading…</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {tasks.map((task) => (
            <TaskRow key={task.id} task={task} onToggle={() => toggle(task)} onRemove={() => remove(task)} />
          ))}
        </ul>
      )}
    </div>
  );
}

function TaskRow({
  task,
  onToggle,
  onRemove,
}: {
  task: TaskItem;
  onToggle: () => void;
  onRemove: () => void;
}) {
  return (
    <li className="flex items-center gap-3 rounded-lg border border-wtd-border bg-wtd-surface px-3 py-2">
      <input
        type="checkbox"
        checked={task.completed}
        onChange={onToggle}
        className="size-5 accent-wtd-teal"
      />
      <span
        className={`flex-1 ${task.completed ? 'text-wtd-muted line-through' : 'text-wtd-text'}`}
      >
        {task.name}
        {task.winBreaker && (
          <span className="ml-2 rounded bg-wtd-cyan/20 px-1.5 py-0.5 text-xs text-wtd-cyan">
            win-breaker
          </span>
        )}
      </span>
      <button
        onClick={onRemove}
        className="text-wtd-muted hover:text-red-400"
        aria-label={`Delete ${task.name}`}
      >
        ✕
      </button>
    </li>
  );
}

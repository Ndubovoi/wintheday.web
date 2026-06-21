import { useState } from 'react';

export interface TaskComposerProps {
  onAdd: (name: string, winBreaker: boolean) => Promise<void> | void;
  onAddRecurring: (name: string, rule: 'daily' | 'workDays', winBreaker: boolean) => Promise<void> | void;
  /** Stack the input above the button for narrow columns. */
  compact?: boolean;
}

export default function TaskComposer({ onAdd, onAddRecurring, compact = false }: TaskComposerProps) {
  const [name, setName] = useState('');
  const [winBreaker, setWinBreaker] = useState(false);
  const [recurring, setRecurring] = useState(false);
  const [rule, setRule] = useState<'daily' | 'workDays'>('daily');

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    if (recurring) await onAddRecurring(name, rule, winBreaker);
    else await onAdd(name, winBreaker);
    setName('');
    setWinBreaker(false);
    setRecurring(false);
    setRule('daily');
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-3">
      <div className={compact ? 'flex flex-col gap-2' : 'flex gap-2'}>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Add a task…"
          className="min-w-0 flex-1 rounded-lg border border-wtd-border bg-wtd-surface px-3 py-2.5 text-wtd-text placeholder:text-wtd-muted focus:border-wtd-teal-accent focus:outline-none"
        />
        <button
          type="submit"
          disabled={!name.trim()}
          className={`rounded-lg bg-wtd-teal py-2.5 font-semibold text-wtd-bg transition-opacity disabled:opacity-40 ${
            compact ? 'px-3' : 'px-5'
          }`}
        >
          Add
        </button>
      </div>
      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-wtd-muted">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={winBreaker}
            onChange={(e) => setWinBreaker(e.target.checked)}
            className="accent-wtd-cyan"
          />
          Win-breaker
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={recurring}
            onChange={(e) => setRecurring(e.target.checked)}
            className="accent-wtd-teal-accent"
          />
          Recurring
        </label>
        {recurring && (
          <select
            value={rule}
            onChange={(e) => setRule(e.target.value as 'daily' | 'workDays')}
            className="rounded-md border border-wtd-border bg-wtd-surface px-2 py-1 text-wtd-text focus:border-wtd-teal-accent focus:outline-none"
          >
            <option value="daily">Daily</option>
            <option value="workDays">Work days</option>
          </select>
        )}
      </div>
    </form>
  );
}

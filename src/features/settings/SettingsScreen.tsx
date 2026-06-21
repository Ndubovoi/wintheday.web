import { useEffect, useState } from 'react';
import { useAuth } from '../../auth/useAuth';
import { getCustomization, saveCustomization } from '../../data/customization.repo';
import { DEFAULT_CUSTOMIZATION } from '../../domain/types';

export default function SettingsScreen() {
  const { user } = useAuth();
  const uid = user?.uid;

  const [daysToWinWeek, setDaysToWinWeek] = useState(DEFAULT_CUSTOMIZATION.daysToWinWeek);
  const [weeksToWinYear, setWeeksToWinYear] = useState(DEFAULT_CUSTOMIZATION.weeksToWinYear);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!uid) return;
    getCustomization(uid).then((c) => {
      setDaysToWinWeek(c.daysToWinWeek);
      setWeeksToWinYear(c.weeksToWinYear);
    });
  }, [uid]);

  async function save() {
    if (!uid) return;
    setSaving(true);
    await saveCustomization(uid, { daysToWinWeek, weeksToWinYear });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-6 text-2xl font-semibold text-wtd-text">Settings</h1>

      <Section title="Winning goals">
        <Field label="Days to win a week">
          <select
            value={daysToWinWeek}
            onChange={(e) => setDaysToWinWeek(Number(e.target.value))}
            className="rounded-md border border-wtd-border bg-wtd-surface-2 px-2 py-1.5 text-wtd-text focus:border-wtd-teal-accent focus:outline-none"
          >
            {[1, 2, 3, 4, 5, 6, 7].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Weeks to win a year">
          <input
            type="number"
            min={1}
            max={52}
            value={weeksToWinYear}
            onChange={(e) => setWeeksToWinYear(Number(e.target.value))}
            className="w-20 rounded-md border border-wtd-border bg-wtd-surface-2 px-2 py-1.5 text-wtd-text focus:border-wtd-teal-accent focus:outline-none"
          />
        </Field>
        <div className="mt-2 flex items-center gap-3">
          <button
            onClick={save}
            disabled={saving}
            className="rounded-lg bg-wtd-teal px-4 py-2 font-semibold text-wtd-bg disabled:opacity-40"
          >
            Save
          </button>
          {saved && <span className="text-sm text-wtd-win">Saved ✓</span>}
        </div>
      </Section>

      <Section title="Reminders">
        <p className="text-sm text-wtd-muted">
          Push reminders &amp; motivation are coming next (wired to the notification service).
        </p>
      </Section>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-6 rounded-2xl border border-wtd-border bg-wtd-surface p-5">
      <h2 className="mb-4 text-lg font-semibold text-wtd-text">{title}</h2>
      <div className="flex flex-col gap-3">{children}</div>
    </section>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <label className="text-wtd-muted">{label}</label>
      {children}
    </div>
  );
}

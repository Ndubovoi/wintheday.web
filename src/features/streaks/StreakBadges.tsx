// Day + week winning-streak badges (flame), mirroring the app's top nav widgets.
export default function StreakBadges({
  dayStreak,
  weekStreak,
}: {
  dayStreak: number;
  weekStreak: number;
}) {
  return (
    <div className="flex items-center gap-3">
      <Badge icon="🔥" value={dayStreak} label="day streak" active={dayStreak > 0} />
      <Badge icon="🏆" value={weekStreak} label="week streak" active={weekStreak > 0} />
    </div>
  );
}

function Badge({
  icon,
  value,
  label,
  active,
}: {
  icon: string;
  value: number;
  label: string;
  active: boolean;
}) {
  return (
    <div
      title={label}
      className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-bold transition-colors ${
        active
          ? 'border-wtd-flame/40 bg-wtd-flame/10 text-wtd-flame'
          : 'border-wtd-border bg-wtd-surface text-wtd-muted'
      }`}
    >
      <span className={active ? '' : 'grayscale'}>{icon}</span>
      <span>{value}</span>
    </div>
  );
}

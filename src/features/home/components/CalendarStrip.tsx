// Horizontal day strip (mirrors lib/widgets/calendar/calendar_bar.dart): recent
// days with a win/loss dot, selectable. Shows today-6 … today+1.
import { addDaysStr, todayStr, parseDateStr } from '../../../domain/dates';
import type { ResultMap } from '../../../domain/streak';

const WEEKDAY = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function CalendarStrip({
  selected,
  results,
  onSelect,
}: {
  selected: string;
  results: ResultMap;
  onSelect: (date: string) => void;
}) {
  const today = todayStr();
  const days = Array.from({ length: 8 }, (_, i) => addDaysStr(today, i - 6));

  return (
    <div className="flex gap-2 overflow-x-auto pb-1">
      {days.map((d) => {
        const isSelected = d === selected;
        const isToday = d === today;
        const dt = parseDateStr(d);
        const won = results[d];
        return (
          <button
            key={d}
            onClick={() => onSelect(d)}
            className={`flex min-w-12 flex-col items-center gap-1 rounded-xl border px-2 py-2 transition-colors ${
              isSelected
                ? 'border-wtd-teal-accent bg-wtd-surface-2'
                : 'border-wtd-border bg-wtd-surface hover:border-wtd-teal-accent/40'
            }`}
          >
            <span className="text-[11px] text-wtd-muted">{WEEKDAY[dt.getDay()]}</span>
            <span
              className={`text-sm font-semibold ${isToday ? 'text-wtd-teal-accent' : 'text-wtd-text'}`}
            >
              {dt.getDate()}
            </span>
            <span
              className={`size-1.5 rounded-full ${
                won === true ? 'bg-wtd-win' : won === false ? 'bg-wtd-loss' : 'bg-transparent'
              }`}
            />
          </button>
        );
      })}
    </div>
  );
}

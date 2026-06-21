import { useEffect, useRef, useState } from 'react';
import { format } from 'date-fns';
import { todayStr, parseDateStr } from '../../domain/dates';
import { useDay } from './useDay';
import { useStreaks } from '../streaks/useStreaks';
import StreakBadges from '../streaks/StreakBadges';
import ProgressCircle from './components/ProgressCircle';
import CalendarStrip from './components/CalendarStrip';
import TaskComposer from './components/TaskComposer';
import TaskRow from './components/TaskRow';
import { celebrate } from '../../shared/confetti';

export default function HomeScreen() {
  const [selected, setSelected] = useState(() => todayStr());
  const day = useDay(selected);
  const { results, dayStreak, weekStreak } = useStreaks();

  // Confetti when the selected day flips from not-won to won.
  const prevWon = useRef(day.won);
  useEffect(() => {
    if (day.won && !prevWon.current) celebrate();
    prevWon.current = day.won;
  }, [day.won]);

  const heading = day.isToday ? 'Today' : format(parseDateStr(selected), 'EEEE, MMM d');

  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      <header className="mb-5 flex items-center justify-between">
        <div>
          <p className="text-sm text-wtd-muted">{format(parseDateStr(selected), 'MMMM yyyy')}</p>
          <h1 className="text-2xl font-semibold text-wtd-text">{heading}</h1>
        </div>
        <StreakBadges dayStreak={dayStreak} weekStreak={weekStreak} />
      </header>

      <div className="mb-6">
        <CalendarStrip selected={selected} results={results} onSelect={setSelected} />
      </div>

      <div className="mb-8 flex justify-center">
        <ProgressCircle
          completed={day.completed}
          total={day.tasks.length}
          openWinBreakers={day.openWinBreakers}
        />
      </div>

      <div className="mb-6">
        <TaskComposer onAdd={day.add} onAddRecurring={day.addRecurringTask} />
      </div>

      {day.error && <p className="mb-4 text-sm text-wtd-loss">{day.error}</p>}

      {day.loading ? (
        <p className="text-center text-wtd-muted">Loading…</p>
      ) : day.tasks.length === 0 ? (
        <p className="text-center text-wtd-muted">No tasks yet — add one above to start winning.</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {day.tasks.map((task) => (
            <TaskRow
              key={task.id}
              task={task}
              onToggle={() => day.toggle(task)}
              onRemove={() => day.remove(task)}
              onMoveToTomorrow={() => day.moveToTomorrow(task)}
            />
          ))}
        </ul>
      )}
    </div>
  );
}

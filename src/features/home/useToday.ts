// Home-screen state for "today": a live subscription to today's tasks plus the
// mutating actions. Each mutation recomputes and persists the day's win status,
// mirroring TaskItemRepository.dart (insert/update/delete all call
// updateWinStatusForDate afterwards).
import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../auth/useAuth';
import { todayStr } from '../../domain/dates';
import { isDayWon } from '../../domain/winDay';
import type { TaskItem } from '../../domain/types';
import {
  subscribeTasksForDate,
  getTasksForDate,
  addTask,
  setTaskCompleted,
  deleteTask,
} from '../../data/tasks.repo';
import { updateWinStatusForDate } from '../../data/winStatus';

export function useToday() {
  const { user } = useAuth();
  const uid = user?.uid;
  const [date] = useState(() => todayStr());
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!uid) return;
    setLoading(true);
    const unsub = subscribeTasksForDate(
      uid,
      date,
      (t) => {
        setTasks(t.sort((a, b) => a.createdOn.localeCompare(b.createdOn)));
        setLoading(false);
      },
      (e) => {
        setError(e.message);
        setLoading(false);
      },
    );
    return unsub;
  }, [uid, date]);

  // Live, instant win/loss feedback computed from the subscribed tasks.
  const won = useMemo(() => isDayWon(tasks), [tasks]);

  async function recomputeWin() {
    if (!uid) return;
    const latest = await getTasksForDate(uid, date);
    await updateWinStatusForDate(uid, date, latest);
  }

  async function add(name: string, winBreaker = false) {
    if (!uid || !name.trim()) return;
    await addTask(uid, {
      name: name.trim(),
      completed: false,
      date,
      createdOn: date,
      isRecurring: false,
      recurringId: null,
      winBreaker,
      x: 0,
      y: 0,
    });
    await recomputeWin();
  }

  async function toggle(task: TaskItem) {
    if (!uid) return;
    await setTaskCompleted(uid, task.id, !task.completed);
    await recomputeWin();
  }

  async function remove(task: TaskItem) {
    if (!uid) return;
    await deleteTask(uid, task.id);
    await recomputeWin();
  }

  return { date, tasks, loading, error, won, add, toggle, remove };
}

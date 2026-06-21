// State + actions for a single selected day. Live subscription to that day's
// tasks, lazy materialization of recurring instances for future days (mirrors
// TaskItemRepository.getTasksForDate), and mutations that recompute win status.
import { useEffect, useMemo, useRef, useState } from 'react';
import { useAuth } from '../../auth/useAuth';
import { addDaysStr, todayStr } from '../../domain/dates';
import { isDayWon } from '../../domain/winDay';
import { recurringInstancesForDate } from '../../domain/recurrence';
import type { TaskItem } from '../../domain/types';
import {
  subscribeTasksForDate,
  getTasksForDate,
  addTask,
  setTaskCompleted,
  deleteTask,
  saveTask,
} from '../../data/tasks.repo';
import { getRecurring, addRecurring } from '../../data/recurring.repo';
import { updateWinStatusForDate } from '../../data/winStatus';

export function useDay(date: string, materialize = true) {
  const { user } = useAuth();
  const uid = user?.uid;
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const materializedFor = useRef<string>('');

  useEffect(() => {
    if (!uid) return;
    setLoading(true);
    const unsub = subscribeTasksForDate(
      uid,
      date,
      (t) => {
        setTasks(t.sort((a, b) => a.createdOn.localeCompare(b.createdOn) || a.name.localeCompare(b.name)));
        setLoading(false);
      },
      (e) => {
        setError(e.message);
        setLoading(false);
      },
    );
    return unsub;
  }, [uid, date]);

  // Lazily materialize recurring instances for strictly-future days (once per day).
  useEffect(() => {
    if (!uid || !materialize || materializedFor.current === `${uid}:${date}`) return;
    materializedFor.current = `${uid}:${date}`;
    (async () => {
      const recurring = await getRecurring(uid);
      if (recurring.length === 0) return;
      const existing = await getTasksForDate(uid, date);
      const existingIds = new Set(existing.map((t) => t.recurringId).filter(Boolean) as string[]);
      const instances = recurringInstancesForDate(recurring, date, existingIds);
      for (const inst of instances) {
        await addTask(uid, {
          name: inst.name,
          completed: false,
          date,
          createdOn: date,
          isRecurring: true,
          recurringId: inst.recurringId,
          winBreaker: inst.winBreaker,
          x: 0,
          y: 0,
        });
      }
      if (instances.length > 0) await recompute();
    })().catch((e) => setError(e instanceof Error ? e.message : String(e)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uid, date]);

  const completed = useMemo(() => tasks.filter((t) => t.completed).length, [tasks]);
  const openWinBreakers = useMemo(
    () => tasks.filter((t) => !t.completed && t.winBreaker).length,
    [tasks],
  );
  const won = useMemo(() => isDayWon(tasks), [tasks]);

  async function recompute() {
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
    await recompute();
  }

  /** Create a recurring template and materialize an instance for today if it applies. */
  async function addRecurringTask(
    name: string,
    rule: 'daily' | 'workDays',
    winBreaker = false,
  ) {
    if (!uid || !name.trim()) return;
    const recurringId = await addRecurring(uid, {
      name: name.trim(),
      recurrenceRule: rule,
      recurrenceDetails: null,
      isDeleted: false,
      winBreaker,
    });
    await addTask(uid, {
      name: name.trim(),
      completed: false,
      date,
      createdOn: date,
      isRecurring: true,
      recurringId,
      winBreaker,
      x: 0,
      y: 0,
    });
    await recompute();
  }

  async function toggle(task: TaskItem) {
    if (!uid) return;
    await setTaskCompleted(uid, task.id, !task.completed);
    await recompute();
  }

  async function remove(task: TaskItem) {
    if (!uid) return;
    await deleteTask(uid, task.id);
    await recompute();
  }

  async function moveToTomorrow(task: TaskItem) {
    if (!uid) return;
    const tomorrow = addDaysStr(date, 1);
    await saveTask(uid, { ...task, date: tomorrow, completed: false });
    await recompute(); // recompute the day it left; tomorrow recomputes on visit
  }

  return {
    date,
    tasks,
    loading,
    error,
    completed,
    openWinBreakers,
    won,
    isToday: date === todayStr(),
    add,
    addRecurringTask,
    toggle,
    remove,
    moveToTomorrow,
  };
}

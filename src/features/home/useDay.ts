// State + actions for a single selected day. Subscribes to that day's stored
// tasks AND the recurring templates, then merges them for display: a recurring
// task shows on every day it applies to (today onward) as a "virtual" occurrence
// that is written to Firestore only when the user interacts with it.
import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../auth/useAuth';
import { addDaysStr, todayStr } from '../../domain/dates';
import { isDayWon } from '../../domain/winDay';
import { displayTasksForDate } from '../../domain/recurrence';
import type { TaskItem, RecurringTaskItem } from '../../domain/types';
import {
  subscribeTasksForDate,
  getTasksForDate,
  addTask,
  setTaskCompleted,
  deleteTask,
  saveTask,
} from '../../data/tasks.repo';
import {
  subscribeRecurring,
  getRecurring,
  addRecurring,
  addSkipDate,
  softDeleteRecurring,
  deleteSeriesInstancesFrom,
} from '../../data/recurring.repo';
import { updateWinStatusForDate } from '../../data/winStatus';

export function useDay(date: string) {
  const { user } = useAuth();
  const uid = user?.uid;
  const [realTasks, setRealTasks] = useState<TaskItem[]>([]);
  const [recurring, setRecurring] = useState<RecurringTaskItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!uid) return;
    setLoading(true);
    const unsub = subscribeTasksForDate(
      uid,
      date,
      (t) => {
        setRealTasks(t);
        setLoading(false);
      },
      (e) => {
        setError(e.message);
        setLoading(false);
      },
    );
    return unsub;
  }, [uid, date]);

  useEffect(() => {
    if (!uid) return;
    return subscribeRecurring(uid, setRecurring);
  }, [uid]);

  // Stored tasks + virtual recurring occurrences, sorted stably.
  const tasks = useMemo(
    () =>
      displayTasksForDate(realTasks, recurring, date).sort(
        (a, b) => a.createdOn.localeCompare(b.createdOn) || a.name.localeCompare(b.name),
      ),
    [realTasks, recurring, date],
  );

  const completed = useMemo(() => tasks.filter((t) => t.completed).length, [tasks]);
  const total = tasks.length;
  const openWinBreakers = useMemo(
    () => tasks.filter((t) => !t.completed && t.winBreaker).length,
    [tasks],
  );
  const won = useMemo(() => isDayWon(tasks), [tasks]);

  // Recompute win status over the merged list (so virtual occurrences count too).
  async function recompute() {
    if (!uid) return;
    const [real, recs] = await Promise.all([getTasksForDate(uid, date), getRecurring(uid)]);
    await updateWinStatusForDate(uid, date, displayTasksForDate(real, recs, date));
  }

  /** Write a virtual recurring occurrence to Firestore so it can hold state. */
  async function materialize(task: TaskItem, completedState: boolean): Promise<void> {
    if (!uid) return;
    await addTask(uid, {
      name: task.name,
      completed: completedState,
      date,
      createdOn: date,
      isRecurring: true,
      recurringId: task.recurringId ?? null,
      winBreaker: task.winBreaker,
      x: 0,
      y: 0,
    });
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

  /** Create a recurring template (it then shows on every applicable day automatically). */
  async function addRecurringTask(name: string, rule: 'daily' | 'workDays', winBreaker = false) {
    if (!uid || !name.trim()) return;
    await addRecurring(uid, {
      name: name.trim(),
      recurrenceRule: rule,
      recurrenceDetails: null,
      isDeleted: false,
      winBreaker,
    });
    await recompute();
  }

  async function toggle(task: TaskItem) {
    if (!uid) return;
    if (task.virtual) await materialize(task, !task.completed);
    else await setTaskCompleted(uid, task.id, !task.completed);
    await recompute();
  }

  /** Remove from this day only. For a recurring task, record a skip date. */
  async function remove(task: TaskItem) {
    if (!uid) return;
    if (task.recurringId) {
      await addSkipDate(uid, task.recurringId, date);
      if (!task.virtual) await deleteTask(uid, task.id);
    } else {
      await deleteTask(uid, task.id);
    }
    await recompute();
  }

  /** Remove the whole recurring series: stop repeating + delete today/future instances. */
  async function removeSeries(task: TaskItem) {
    if (!uid || !task.recurringId) return;
    await softDeleteRecurring(uid, task.recurringId);
    await deleteSeriesInstancesFrom(uid, task.recurringId, todayStr());
    if (!task.virtual) await deleteTask(uid, task.id);
    await recompute();
  }

  /** Move a one-off task to tomorrow (recurring tasks don't expose this). */
  async function moveToTomorrow(task: TaskItem) {
    if (!uid || task.recurringId) return;
    await saveTask(uid, { ...task, date: addDaysStr(date, 1), completed: false });
    await recompute();
  }

  return {
    date,
    tasks,
    loading,
    error,
    completed,
    openWinBreakers,
    won,
    total,
    isToday: date === todayStr(),
    add,
    addRecurringTask,
    toggle,
    remove,
    removeSeries,
    moveToTomorrow,
  };
}

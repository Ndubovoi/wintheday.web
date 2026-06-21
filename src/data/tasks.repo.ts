// Task data access: users/{uid}/tasklist/{taskId}. Only this layer touches Firestore.
import {
  collection,
  doc,
  query,
  where,
  onSnapshot,
  setDoc,
  updateDoc,
  deleteDoc,
  getDocs,
} from 'firebase/firestore';
import { db } from './firebase';
import { fromTaskDoc, toTaskDoc } from './converters';
import type { TaskItem } from '../domain/types';

const tasksCol = (uid: string) => collection(db, 'users', uid, 'tasklist');
const taskDoc = (uid: string, id: string) => doc(db, 'users', uid, 'tasklist', id);

/** Live subscription to a single day's tasks. Returns an unsubscribe fn. */
export function subscribeTasksForDate(
  uid: string,
  dateStr: string,
  cb: (tasks: TaskItem[]) => void,
  onError?: (e: Error) => void,
): () => void {
  const q = query(tasksCol(uid), where('date', '==', dateStr));
  return onSnapshot(
    q,
    (snap) => cb(snap.docs.map((d) => fromTaskDoc(d.id, d.data()))),
    (e) => onError?.(e),
  );
}

/** One-shot read of a day's tasks. */
export async function getTasksForDate(uid: string, dateStr: string): Promise<TaskItem[]> {
  const snap = await getDocs(query(tasksCol(uid), where('date', '==', dateStr)));
  return snap.docs.map((d) => fromTaskDoc(d.id, d.data()));
}

/** Create a task; generates a Firestore id if none supplied. Returns the id. */
export async function addTask(uid: string, task: Omit<TaskItem, 'id'>): Promise<string> {
  const ref = doc(tasksCol(uid));
  await setDoc(ref, toTaskDoc(task));
  return ref.id;
}

export async function saveTask(uid: string, task: TaskItem): Promise<void> {
  await setDoc(taskDoc(uid, task.id), toTaskDoc(task));
}

export async function setTaskCompleted(
  uid: string,
  id: string,
  completed: boolean,
): Promise<void> {
  await updateDoc(taskDoc(uid, id), { completed });
}

export async function deleteTask(uid: string, id: string): Promise<void> {
  await deleteDoc(taskDoc(uid, id));
}

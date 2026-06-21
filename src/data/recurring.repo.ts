// Recurring-task templates: users/{uid}/recurring_tasklist/{recurringId}.
import {
  collection,
  doc,
  onSnapshot,
  setDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  arrayUnion,
} from 'firebase/firestore';
import { db } from './firebase';
import { fromRecurringDoc, toRecurringDoc } from './converters';
import type { RecurringTaskItem } from '../domain/types';

const col = (uid: string) => collection(db, 'users', uid, 'recurring_tasklist');
const recDoc = (uid: string, id: string) => doc(db, 'users', uid, 'recurring_tasklist', id);
const tasksCol = (uid: string) => collection(db, 'users', uid, 'tasklist');

/** Live, non-deleted recurring templates. */
export function subscribeRecurring(
  uid: string,
  cb: (items: RecurringTaskItem[]) => void,
): () => void {
  return onSnapshot(col(uid), (snap) =>
    cb(snap.docs.map((d) => fromRecurringDoc(d.id, d.data())).filter((r) => !r.isDeleted)),
  );
}

export async function getRecurring(uid: string): Promise<RecurringTaskItem[]> {
  const snap = await getDocs(col(uid));
  return snap.docs.map((d) => fromRecurringDoc(d.id, d.data())).filter((r) => !r.isDeleted);
}

export async function addRecurring(
  uid: string,
  item: Omit<RecurringTaskItem, 'id' | 'createdOn'>,
): Promise<string> {
  const ref = doc(col(uid));
  await setDoc(ref, toRecurringDoc(item));
  return ref.id;
}

/** Record that the recurring task was removed from a single day (won't re-materialize). */
export async function addSkipDate(uid: string, recurringId: string, date: string): Promise<void> {
  await updateDoc(recDoc(uid, recurringId), { skipDates: arrayUnion(date) });
}

/** Soft delete the template — mirrors the Flutter app's isDeleted flag. */
export async function softDeleteRecurring(uid: string, id: string): Promise<void> {
  await updateDoc(recDoc(uid, id), { isDeleted: true });
}

/**
 * Delete all materialized instances of a recurring series on or after `fromDate`
 * (past instances are kept for history). Uses a single-field query + client-side
 * date filter to avoid needing a composite index.
 */
export async function deleteSeriesInstancesFrom(
  uid: string,
  recurringId: string,
  fromDate: string,
): Promise<void> {
  const snap = await getDocs(query(tasksCol(uid), where('recurringId', '==', recurringId)));
  await Promise.all(
    snap.docs
      .filter((d) => (d.data().date as string) >= fromDate)
      .map((d) => deleteDoc(d.ref)),
  );
}

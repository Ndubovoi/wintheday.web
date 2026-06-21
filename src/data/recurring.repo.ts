// Recurring-task templates: users/{uid}/recurring_tasklist/{recurringId}.
import { collection, doc, onSnapshot, setDoc, getDocs, updateDoc } from 'firebase/firestore';
import { db } from './firebase';
import { fromRecurringDoc, toRecurringDoc } from './converters';
import type { RecurringTaskItem } from '../domain/types';

const col = (uid: string) => collection(db, 'users', uid, 'recurring_tasklist');
const recDoc = (uid: string, id: string) => doc(db, 'users', uid, 'recurring_tasklist', id);

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

/** Soft delete — mirrors the Flutter app's isDeleted flag. */
export async function softDeleteRecurring(uid: string, id: string): Promise<void> {
  await updateDoc(recDoc(uid, id), { isDeleted: true });
}

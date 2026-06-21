// Result data access: users/{uid}/results/{date}. Doc id IS the 'yyyy-MM-dd' date.
import { collection, doc, onSnapshot, setDoc, deleteDoc, getDocs } from 'firebase/firestore';
import { db } from './firebase';
import { fromResultDoc, toResultDoc } from './converters';
import type { Result } from '../domain/types';
import type { ResultMap } from '../domain/streak';

const resultsCol = (uid: string) => collection(db, 'users', uid, 'results');
const resultDoc = (uid: string, date: string) => doc(db, 'users', uid, 'results', date);

function toResultMap(results: Result[]): ResultMap {
  const map: ResultMap = {};
  for (const r of results) map[r.date] = r.won;
  return map;
}

/** Live subscription to all results as a { date -> won } map (for streaks). */
export function subscribeResultMap(
  uid: string,
  cb: (results: ResultMap) => void,
  onError?: (e: Error) => void,
): () => void {
  return onSnapshot(
    resultsCol(uid),
    (snap) => cb(toResultMap(snap.docs.map((d) => fromResultDoc(d.id, d.data())))),
    (e) => onError?.(e),
  );
}

export async function getAllResults(uid: string): Promise<Result[]> {
  const snap = await getDocs(resultsCol(uid));
  return snap.docs.map((d) => fromResultDoc(d.id, d.data()));
}

export async function saveResult(uid: string, result: Result): Promise<void> {
  await setDoc(resultDoc(uid, result.date), toResultDoc(result));
}

export async function deleteResult(uid: string, date: string): Promise<void> {
  await deleteDoc(resultDoc(uid, date));
}

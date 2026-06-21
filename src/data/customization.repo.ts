// Customization data access: TOP-LEVEL customizations/{uid} collection.
// NOTE: this is NOT under users/{uid} — verified in the Flutter app's
// lib/services/customization_serivce.dart.
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { db } from './firebase';
import { fromCustomizationDoc, toCustomizationDoc } from './converters';
import { DEFAULT_CUSTOMIZATION, type Customization } from '../domain/types';

const customizationDoc = (uid: string) => doc(db, 'customizations', uid);

export async function getCustomization(uid: string): Promise<Customization> {
  const snap = await getDoc(customizationDoc(uid));
  return snap.exists() ? fromCustomizationDoc(snap.data()) : { ...DEFAULT_CUSTOMIZATION };
}

export function subscribeCustomization(
  uid: string,
  cb: (c: Customization) => void,
): () => void {
  return onSnapshot(customizationDoc(uid), (snap) =>
    cb(snap.exists() ? fromCustomizationDoc(snap.data()) : { ...DEFAULT_CUSTOMIZATION }),
  );
}

export async function saveCustomization(uid: string, c: Customization): Promise<void> {
  await setDoc(customizationDoc(uid), toCustomizationDoc(c));
}

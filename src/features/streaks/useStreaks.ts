// Live day/week streaks + the full result map, computed with the pure domain
// functions over a Firestore subscription. Reused by Home and the Calendar page.
import { useEffect, useState } from 'react';
import { useAuth } from '../../auth/useAuth';
import { currentDayStreak, currentWeekStreak, type ResultMap } from '../../domain/streak';
import { DEFAULT_CUSTOMIZATION, type Customization } from '../../domain/types';
import { subscribeResultMap } from '../../data/results.repo';
import { subscribeCustomization } from '../../data/customization.repo';

export function useStreaks() {
  const { user } = useAuth();
  const uid = user?.uid;
  const [results, setResults] = useState<ResultMap>({});
  const [customization, setCustomization] = useState<Customization>(DEFAULT_CUSTOMIZATION);

  useEffect(() => {
    if (!uid) return;
    const unsubResults = subscribeResultMap(uid, setResults);
    const unsubCustom = subscribeCustomization(uid, setCustomization);
    return () => {
      unsubResults();
      unsubCustom();
    };
  }, [uid]);

  return {
    results,
    customization,
    dayStreak: currentDayStreak(results),
    weekStreak: currentWeekStreak(results, customization.daysToWinWeek),
  };
}

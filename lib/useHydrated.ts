import { useEffect, useState } from 'react';
import { useUserStore } from '@/stores/userStore';

/**
 * True once a persisted store has finished rehydrating from AsyncStorage.
 * Used to gate the onboarding redirect so we don't flash the wrong screen.
 */
export function useUserHydrated(): boolean {
  const [hydrated, setHydrated] = useState(useUserStore.persist.hasHydrated());

  useEffect(() => {
    const unsub = useUserStore.persist.onFinishHydration(() => setHydrated(true));
    // Catch the case where hydration completed between render + effect.
    if (useUserStore.persist.hasHydrated()) setHydrated(true);
    return unsub;
  }, []);

  return hydrated;
}

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { asyncPersist } from '@/lib/persist';

export type DietTag =
  | 'vegetarian'
  | 'vegan'
  | 'no eggs'
  | 'halal'
  | 'kosher'
  | 'no restrictions';

export type CookingEffort = 'minimal' | 'some' | 'love cooking';
export type FitnessGoal = 'strength' | 'cardio' | 'flexibility' | 'general';

export type DeliveryTime = {
  /** 0 = Sunday … 6 = Saturday */
  day: number;
  hour: number;
  minute: number;
};

/** A cached nearest-store choice from Instacart, so we don't refetch each cart build. */
export type InstacartRetailerRef = {
  key: string;
  name: string;
  /** When we fetched this — invalidate if older than a few weeks. */
  fetchedAt: string;
};

type UserState = {
  onboarded: boolean;
  name: string;
  campus: string;
  /** US postal code, used by Instacart to find nearby retailers. */
  zip: string;
  diet: DietTag[];
  store: string;
  /** Cached nearest Instacart retailer (or fallback) for the user's zip. */
  instacartRetailer: InstacartRetailerRef | null;
  deliveryTime: DeliveryTime;
  laundryDay: number;
  budgetPerWeek: number;
  cookingEffort: CookingEffort;
  cuisinePrefs: string[];
  diningHallsEnabled: boolean;
  isReader: boolean;
  fitnessGoal: FitnessGoal | null;

  setName: (name: string) => void;
  setCampus: (campus: string) => void;
  setZip: (zip: string) => void;
  toggleDiet: (tag: DietTag) => void;
  setStore: (store: string) => void;
  setInstacartRetailer: (r: InstacartRetailerRef | null) => void;
  setDeliveryTime: (t: DeliveryTime) => void;
  setLaundryDay: (day: number) => void;
  update: (patch: Partial<UserState>) => void;
  completeOnboarding: () => void;
  reset: () => void;
};

const initial = {
  onboarded: false,
  name: '',
  campus: '',
  zip: '',
  diet: [] as DietTag[],
  store: 'Target',
  instacartRetailer: null as InstacartRetailerRef | null,
  deliveryTime: { day: 0, hour: 18, minute: 0 } as DeliveryTime,
  laundryDay: 0,
  budgetPerWeek: 75,
  cookingEffort: 'minimal' as CookingEffort,
  cuisinePrefs: [] as string[],
  diningHallsEnabled: true,
  isReader: false,
  fitnessGoal: null as FitnessGoal | null,
};

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      ...initial,

      setName: (name) => set({ name: name.trim() }),
      setCampus: (campus) => set({ campus }),
      setZip: (zip) => set({ zip: zip.trim(), instacartRetailer: null }),
      setInstacartRetailer: (instacartRetailer) => set({ instacartRetailer }),
      toggleDiet: (tag) => {
        const cur = get().diet;
        if (tag === 'no restrictions') {
          set({ diet: cur.includes(tag) ? [] : ['no restrictions'] });
          return;
        }
        const without = cur.filter((t) => t !== 'no restrictions');
        set({
          diet: without.includes(tag)
            ? without.filter((t) => t !== tag)
            : [...without, tag],
        });
      },
      setStore: (store) => set({ store }),
      setDeliveryTime: (deliveryTime) => set({ deliveryTime }),
      setLaundryDay: (laundryDay) => set({ laundryDay }),
      update: (patch) => set(patch),
      completeOnboarding: () => set({ onboarded: true }),
      reset: () => set({ ...initial }),
    }),
    asyncPersist<UserState>('user'),
  ),
);

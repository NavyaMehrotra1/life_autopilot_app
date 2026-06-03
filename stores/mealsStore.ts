import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { asyncPersist, uid } from '@/lib/persist';

export type MealSlotName = 'morning' | 'afternoon' | 'evening';
export type MealSource = 'dining' | 'restaurant' | 'home';

export type Meal = {
  id: string;
  day: number; // 0 = Sunday
  slot: MealSlotName;
  name: string;
  location: string;
  distance?: string;
  source: MealSource;
  /** Rough macro hint used for the gentle "nutrition looks complete" line. */
  protein?: boolean;
};

/** A recorded swap, so future plans can learn preferences. */
export type SwapRecord = {
  from: string;
  to: string;
  slot: MealSlotName;
  at: string;
};

type MealsState = {
  plan: Meal[];
  swaps: SwapRecord[];
  plannedFor: string | null; // ISO date the current week-plan was built

  setPlan: (meals: Omit<Meal, 'id'>[]) => void;
  swapMeal: (id: string, next: Omit<Meal, 'id' | 'day' | 'slot'>) => void;
  clear: () => void;
};

export const useMealsStore = create<MealsState>()(
  persist(
    (set, get) => ({
      plan: [],
      swaps: [],
      plannedFor: null,

      setPlan: (meals) =>
        set({
          plan: meals.map((m) => ({ ...m, id: uid('meal') })),
          plannedFor: new Date().toISOString(),
        }),

      swapMeal: (id, next) => {
        const current = get().plan.find((m) => m.id === id);
        if (!current) return;
        set({
          plan: get().plan.map((m) =>
            m.id === id ? { ...m, ...next } : m,
          ),
          swaps: [
            {
              from: current.name,
              to: next.name,
              slot: current.slot,
              at: new Date().toISOString(),
            },
            ...get().swaps,
          ].slice(0, 50),
        });
      },

      clear: () => set({ plan: [], plannedFor: null }),
    }),
    asyncPersist<MealsState>('meals'),
  ),
);

export const mealsForDay = (plan: Meal[], day: number): Record<MealSlotName, Meal | undefined> => ({
  morning: plan.find((m) => m.day === day && m.slot === 'morning'),
  afternoon: plan.find((m) => m.day === day && m.slot === 'afternoon'),
  evening: plan.find((m) => m.day === day && m.slot === 'evening'),
});

/** Gentle, non-obsessive nutrition read for a day's three meals. */
export function nutritionNote(meals: (Meal | undefined)[]): string {
  const planned = meals.filter(Boolean) as Meal[];
  if (planned.length === 0) return 'nothing planned yet today';
  const proteinMeals = planned.filter((m) => m.protein).length;
  if (planned.length < 3) return 'a couple slots still open';
  if (proteinMeals === 0) return 'low protein today';
  return 'nutrition looks complete';
}

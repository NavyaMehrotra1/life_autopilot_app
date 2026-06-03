import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { asyncPersist } from '@/lib/persist';
import { dayKey } from '@/lib/date';

/** The five small daily acts that fill the matcha cup. */
export type DailyTask =
  | 'meal_logged'
  | 'laundry_touched'
  | 'read_today'
  | 'fridge_checked'
  | 'supplies_checked';

export const DAILY_TASKS: { id: DailyTask; label: string }[] = [
  { id: 'meal_logged', label: 'logged a meal' },
  { id: 'laundry_touched', label: 'laundry started' },
  { id: 'read_today', label: "read today's pages" },
  { id: 'fridge_checked', label: 'fridge checked' },
  { id: 'supplies_checked', label: 'supplies checked' },
];

type DailyState = {
  /** taskId -> day key it was last completed on. */
  done: Partial<Record<DailyTask, string>>;
  complete: (task: DailyTask) => void;
  toggle: (task: DailyTask) => void;
  isDone: (task: DailyTask) => boolean;
};

export const useDailyStore = create<DailyState>()(
  persist(
    (set, get) => ({
      done: {},
      complete: (task) =>
        set((s) => ({ done: { ...s.done, [task]: dayKey() } })),
      toggle: (task) =>
        set((s) => {
          const next = { ...s.done };
          if (next[task] === dayKey()) delete next[task];
          else next[task] = dayKey();
          return { done: next };
        }),
      isDone: (task) => get().done[task] === dayKey(),
    }),
    asyncPersist<DailyState>('daily'),
  ),
);

/** How many of today's tasks are complete (0..5). */
export function dailyCompletedCount(done: DailyState['done']): number {
  const today = dayKey();
  return DAILY_TASKS.filter((t) => done[t.id] === today).length;
}

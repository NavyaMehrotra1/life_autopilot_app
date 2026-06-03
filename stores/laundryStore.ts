import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { asyncPersist } from '@/lib/persist';
import { daysSince } from '@/lib/date';

export type LaundryStage = 'idle' | 'wash' | 'dry' | 'fold';

export const WASH_MINUTES = 60;
export const DRY_MINUTES = 60;

export type LaundryEntry = { completedAt: string };

type LaundryState = {
  stage: LaundryStage;
  /** Epoch ms when the active timed stage ends (wash/dry only). */
  stageEndsAt: number | null;
  lastCompleted: string | null;
  history: LaundryEntry[];

  startWash: () => void;
  startDry: () => void;
  startFold: () => void;
  finishFold: () => void;
  cancel: () => void;
};

export const useLaundryStore = create<LaundryState>()(
  persist(
    (set, get) => ({
      stage: 'idle',
      stageEndsAt: null,
      lastCompleted: null,
      history: [],

      startWash: () =>
        set({ stage: 'wash', stageEndsAt: Date.now() + WASH_MINUTES * 60_000 }),
      startDry: () =>
        set({ stage: 'dry', stageEndsAt: Date.now() + DRY_MINUTES * 60_000 }),
      startFold: () => set({ stage: 'fold', stageEndsAt: null }),
      finishFold: () => {
        const now = new Date().toISOString();
        set({
          stage: 'idle',
          stageEndsAt: null,
          lastCompleted: now,
          history: [{ completedAt: now }, ...get().history].slice(0, 60),
        });
      },
      cancel: () => set({ stage: 'idle', stageEndsAt: null }),
    }),
    asyncPersist<LaundryState>('laundry'),
  ),
);

export function daysSinceLaundry(lastCompleted: string | null): number | null {
  if (!lastCompleted) return null;
  return daysSince(lastCompleted);
}

export function doneThisWeek(history: LaundryEntry[]): boolean {
  return history.some((e) => daysSince(e.completedAt) <= 7);
}

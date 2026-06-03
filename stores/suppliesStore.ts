import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { asyncPersist, uid } from '@/lib/persist';
import { daysSince } from '@/lib/date';

export type SupplyCategory = 'bathroom' | 'household' | 'health';
export type DepletionRate = 'daily' | 'weekly' | 'monthly';

/** How many days a fresh unit of each cadence is expected to last. */
const RATE_DAYS: Record<DepletionRate, number> = {
  daily: 14,
  weekly: 35,
  monthly: 90,
};

export type SupplyItem = {
  id: string;
  name: string;
  category: SupplyCategory;
  quantity: number;
  depletionRate: DepletionRate;
  /** Notify when this many days of supply remain. */
  thresholdDays: number;
  restockedAt: string; // ISO
  onRestockList: boolean;
  addedAt: string;
};

export type NewSupplyItem = {
  name: string;
  category: SupplyCategory;
  quantity: number;
  depletionRate: DepletionRate;
  thresholdDays?: number;
};

/** Estimated days of supply left, from quantity × cadence minus elapsed time. */
export function supplyDaysLeft(item: SupplyItem): number {
  const fullLife = item.quantity * RATE_DAYS[item.depletionRate];
  return Math.round(fullLife - daysSince(item.restockedAt));
}

export function isLow(item: SupplyItem): boolean {
  return supplyDaysLeft(item) <= item.thresholdDays;
}

type SuppliesState = {
  items: SupplyItem[];

  addItem: (item: NewSupplyItem) => string;
  updateItem: (id: string, patch: Partial<SupplyItem>) => void;
  restock: (id: string) => void;
  removeItem: (id: string) => void;
  toggleRestockList: (id: string) => void;
  /** Move every low item onto the Amazon restock list (idempotent). */
  syncRestockList: () => void;
};

export const useSuppliesStore = create<SuppliesState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (item) => {
        const created: SupplyItem = {
          ...item,
          id: uid('supply'),
          thresholdDays: item.thresholdDays ?? 7,
          restockedAt: new Date().toISOString(),
          onRestockList: false,
          addedAt: new Date().toISOString(),
        };
        set({ items: [created, ...get().items] });
        return created.id;
      },
      updateItem: (id, patch) =>
        set({
          items: get().items.map((it) =>
            it.id === id ? { ...it, ...patch } : it,
          ),
        }),
      restock: (id) =>
        set({
          items: get().items.map((it) =>
            it.id === id
              ? { ...it, restockedAt: new Date().toISOString(), onRestockList: false }
              : it,
          ),
        }),
      removeItem: (id) =>
        set({ items: get().items.filter((it) => it.id !== id) }),
      toggleRestockList: (id) =>
        set({
          items: get().items.map((it) =>
            it.id === id ? { ...it, onRestockList: !it.onRestockList } : it,
          ),
        }),
      syncRestockList: () =>
        set({
          items: get().items.map((it) =>
            isLow(it) ? { ...it, onRestockList: true } : it,
          ),
        }),
    }),
    asyncPersist<SuppliesState>('supplies'),
  ),
);

export const selectLow = (s: SuppliesState) => s.items.filter(isLow);
export const selectRestockList = (s: SuppliesState) =>
  s.items.filter((it) => it.onRestockList);

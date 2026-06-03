import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { asyncPersist, uid } from '@/lib/persist';
import { addDays, daysUntil } from '@/lib/date';

export type StorageMethod = 'fridge' | 'pantry' | 'freezer';
export type FridgeCategory =
  | 'produce'
  | 'dairy'
  | 'protein'
  | 'grains'
  | 'condiments'
  | 'leftovers'
  | 'other';
export type ItemStatus = 'active' | 'consumed' | 'expired';

export type FridgeItem = {
  id: string;
  name: string;
  category: FridgeCategory;
  quantity: string;
  storage: StorageMethod;
  opened: boolean;
  purchaseDate: string; // ISO
  /** Filled by the Claude expiry prediction (falls back to a heuristic). */
  shelfLifeDays: number;
  openedShelfLifeDays?: number;
  expiryTips?: string;
  status: ItemStatus;
  addedAt: string;
};

/** Effective expiry date factoring in whether the item is opened. */
export function expiryDate(item: FridgeItem): Date {
  const life =
    item.opened && item.openedShelfLifeDays != null
      ? item.openedShelfLifeDays
      : item.shelfLifeDays;
  return addDays(item.purchaseDate, life);
}

/** Days until this item expires (negative once expired). */
export function itemDaysRemaining(item: FridgeItem): number {
  return daysUntil(expiryDate(item));
}

export type Freshness = 'fresh' | 'soon' | 'urgent' | 'expired';

export function freshnessOf(item: FridgeItem): Freshness {
  const d = itemDaysRemaining(item);
  if (d < 0) return 'expired';
  if (d <= 2) return 'urgent';
  if (d <= 5) return 'soon';
  return 'fresh';
}

export type NewFridgeItem = Omit<FridgeItem, 'id' | 'status' | 'addedAt'>;

type FridgeState = {
  items: FridgeItem[];
  lastCheckedAt: string | null;

  addItem: (item: NewFridgeItem) => string;
  addMany: (items: NewFridgeItem[]) => void;
  updateItem: (id: string, patch: Partial<FridgeItem>) => void;
  setPrediction: (
    id: string,
    p: { shelf_life_days: number; opened_shelf_life_days: number; expiry_tips: string },
  ) => void;
  markConsumed: (id: string) => void;
  removeItem: (id: string) => void;
  flagExpired: () => void;
  markChecked: () => void;
};

const makeItem = (item: NewFridgeItem): FridgeItem => ({
  ...item,
  id: uid('fridge'),
  status: 'active',
  addedAt: new Date().toISOString(),
});

export const useFridgeStore = create<FridgeState>()(
  persist(
    (set, get) => ({
      items: [],
      lastCheckedAt: null,

      addItem: (item) => {
        const created = makeItem(item);
        set({ items: [created, ...get().items] });
        return created.id;
      },
      addMany: (items) =>
        set({ items: [...items.map(makeItem), ...get().items] }),
      updateItem: (id, patch) =>
        set({
          items: get().items.map((it) =>
            it.id === id ? { ...it, ...patch } : it,
          ),
        }),
      setPrediction: (id, p) =>
        set({
          items: get().items.map((it) =>
            it.id === id
              ? {
                  ...it,
                  shelfLifeDays: p.shelf_life_days,
                  openedShelfLifeDays: p.opened_shelf_life_days,
                  expiryTips: p.expiry_tips,
                }
              : it,
          ),
        }),
      markConsumed: (id) =>
        set({
          items: get().items.map((it) =>
            it.id === id ? { ...it, status: 'consumed' } : it,
          ),
        }),
      removeItem: (id) =>
        set({ items: get().items.filter((it) => it.id !== id) }),
      flagExpired: () =>
        set({
          items: get().items.map((it) =>
            it.status === 'active' && itemDaysRemaining(it) < 0
              ? { ...it, status: 'expired' }
              : it,
          ),
        }),
      markChecked: () => set({ lastCheckedAt: new Date().toISOString() }),
    }),
    asyncPersist<FridgeState>('fridge'),
  ),
);

/** Items still in the fridge (not consumed/expired). */
export const selectActive = (s: FridgeState) =>
  s.items.filter((it) => it.status === 'active' && itemDaysRemaining(it) >= 0);

export const selectExpiringSoon = (s: FridgeState) =>
  selectActive(s)
    .filter((it) => itemDaysRemaining(it) <= 2)
    .sort((a, b) => itemDaysRemaining(a) - itemDaysRemaining(b));

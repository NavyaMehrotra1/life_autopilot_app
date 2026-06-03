import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { asyncPersist, uid } from '@/lib/persist';
import { daysSince } from '@/lib/date';

export type BillingCycle = 'weekly' | 'monthly' | 'yearly';

export type Subscription = {
  id: string;
  name: string;
  cost: number;
  cycle: BillingCycle;
  lastUsed: string; // ISO
  addedAt: string;
};

export type NewSubscription = {
  name: string;
  cost: number;
  cycle: BillingCycle;
  lastUsed?: string;
};

/** Normalize any cycle to a monthly cost. */
export function monthlyCost(sub: Subscription): number {
  if (sub.cycle === 'yearly') return sub.cost / 12;
  if (sub.cycle === 'weekly') return (sub.cost * 52) / 12;
  return sub.cost;
}

export function isUnused(sub: Subscription): boolean {
  return daysSince(sub.lastUsed) >= 30;
}

type SubscriptionState = {
  subs: Subscription[];

  addSub: (s: NewSubscription) => string;
  updateSub: (id: string, patch: Partial<Subscription>) => void;
  markUsed: (id: string) => void;
  removeSub: (id: string) => void;
};

export const useSubscriptionStore = create<SubscriptionState>()(
  persist(
    (set, get) => ({
      subs: [],

      addSub: (s) => {
        const created: Subscription = {
          id: uid('sub'),
          name: s.name.trim(),
          cost: s.cost,
          cycle: s.cycle,
          lastUsed: s.lastUsed ?? new Date().toISOString(),
          addedAt: new Date().toISOString(),
        };
        set({ subs: [...get().subs, created] });
        return created.id;
      },
      updateSub: (id, patch) =>
        set({
          subs: get().subs.map((s) => (s.id === id ? { ...s, ...patch } : s)),
        }),
      markUsed: (id) =>
        set({
          subs: get().subs.map((s) =>
            s.id === id ? { ...s, lastUsed: new Date().toISOString() } : s,
          ),
        }),
      removeSub: (id) =>
        set({ subs: get().subs.filter((s) => s.id !== id) }),
    }),
    asyncPersist<SubscriptionState>('subscriptions'),
  ),
);

export const monthlyTotal = (subs: Subscription[]) =>
  subs.reduce((sum, s) => sum + monthlyCost(s), 0);

export const annualTotal = (subs: Subscription[]) => monthlyTotal(subs) * 12;

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { asyncPersist } from '@/lib/persist';
import type { CartLineItem, DraftCart } from '@/lib/cart';

type Phase = 'idle' | 'building' | 'review' | 'submitting' | 'placed' | 'error';

type CartState = {
  phase: Phase;
  cart: DraftCart | null;
  removed: string[];
  /** Items the user-flagged build step couldn't reasonably map to a product. */
  unmatched: string[];
  /** Instacart shoppable URL returned from the API on approve. */
  instacartUrl: string | null;
  /** Last error string for the error state. */
  errorMessage: string | null;

  setPhase: (p: Phase) => void;
  setCart: (c: DraftCart | null) => void;
  removeLine: (itemName: string) => void;
  setSubmissionResult: (r: { url: string; unmatched: string[] }) => void;
  setError: (msg: string) => void;
  reset: () => void;
};

/**
 * Persists the in-flight grocery cart so navigating away (or opening
 * Instacart in another tab) doesn't blow away your review state.
 */
export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      phase: 'idle',
      cart: null,
      removed: [],
      unmatched: [],
      instacartUrl: null,
      errorMessage: null,

      setPhase: (phase) => set({ phase }),
      setCart: (cart) =>
        set({ cart, unmatched: [], instacartUrl: null, errorMessage: null }),
      removeLine: (itemName) => {
        const cart = get().cart;
        if (!cart) return;
        const next: CartLineItem[] = cart.items.filter((it) => it.item !== itemName);
        const subtotal = Math.round(next.reduce((s, it) => s + it.price, 0) * 100) / 100;
        set({
          cart: { ...cart, items: next, subtotal },
          removed: [...get().removed, itemName],
        });
      },
      setSubmissionResult: ({ url, unmatched }) =>
        set({
          phase: 'placed',
          instacartUrl: url,
          unmatched,
          errorMessage: null,
        }),
      setError: (errorMessage) => set({ phase: 'error', errorMessage }),
      reset: () =>
        set({
          phase: 'idle',
          cart: null,
          removed: [],
          unmatched: [],
          instacartUrl: null,
          errorMessage: null,
        }),
    }),
    asyncPersist<CartState>('cart', 2),
  ),
);

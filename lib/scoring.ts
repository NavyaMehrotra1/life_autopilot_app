/**
 * Life health score — the single number that drives the tree + buddy.
 * Four equal quarters: fridge, laundry, reading, supplies (25% each).
 */
import {
  doneThisWeek,
  daysSinceLaundry,
  useLaundryStore,
} from '@/stores/laundryStore';
import {
  selectActive,
  useFridgeStore,
} from '@/stores/fridgeStore';
import {
  isLow,
  useSuppliesStore,
} from '@/stores/suppliesStore';
import {
  readToday,
  readingStreak,
  useReadingStore,
  Book,
} from '@/stores/readingStore';
import { useUserStore } from '@/stores/userStore';

export type TreeState = 'needs water' | 'growing' | 'healthy' | 'thriving';

export type ScoreKey = 'fridge' | 'laundry' | 'reading' | 'supplies';

export type ScoreBreakdown = Record<ScoreKey, number>; // each 0..1

export type LifeScore = {
  score: number; // 0..100
  breakdown: ScoreBreakdown;
  state: TreeState;
  /** The lowest-scoring area + a warm nudge, or null when all is well. */
  weakest: { key: ScoreKey; nudge: string } | null;
};

/** A stocked fridge tops out around 8 fresh items. */
const FRIDGE_TARGET = 8;

export type ScoreInputs = {
  freshItemCount: number;
  laundryDoneThisWeek: boolean;
  daysSinceLaundry: number | null;
  isReader: boolean;
  hasActiveBook: boolean;
  readToday: boolean;
  readingStreak: number;
  supplyCount: number;
  lowSupplyCount: number;
};

function fridgeScore(i: ScoreInputs): number {
  return Math.min(1, i.freshItemCount / FRIDGE_TARGET);
}

function laundryScore(i: ScoreInputs): number {
  if (i.laundryDoneThisWeek) return 1;
  if (i.daysSinceLaundry == null) return 0.2;
  if (i.daysSinceLaundry <= 9) return 0.5;
  return 0;
}

function readingScore(i: ScoreInputs): number {
  // If the user isn't a reader, this quarter shouldn't drag them down.
  if (!i.isReader || !i.hasActiveBook) return 1;
  if (i.readToday) return 1;
  if (i.readingStreak > 0) return 0.55;
  return 0.25;
}

function suppliesScore(i: ScoreInputs): number {
  if (i.supplyCount === 0) return 0.5; // unknown — neither great nor bad
  return 1 - i.lowSupplyCount / i.supplyCount;
}

export function treeStateFor(score: number): TreeState {
  if (score <= 25) return 'needs water';
  if (score <= 50) return 'growing';
  if (score <= 75) return 'healthy';
  return 'thriving';
}

const NUDGES: Record<ScoreKey, string> = {
  fridge: 'your fridge is running low — a restock would help',
  laundry: "laundry's been a while — a load would lift things",
  reading: "you haven't read today",
  supplies: "you're running low on a few supplies",
};

export function computeLifeScore(i: ScoreInputs): LifeScore {
  const breakdown: ScoreBreakdown = {
    fridge: fridgeScore(i),
    laundry: laundryScore(i),
    reading: readingScore(i),
    supplies: suppliesScore(i),
  };

  const score = Math.round(
    ((breakdown.fridge + breakdown.laundry + breakdown.reading + breakdown.supplies) /
      4) *
      100,
  );

  // The weakest quarter, only flagged if it's actually below "fine".
  const entries = (Object.keys(breakdown) as ScoreKey[]).map((k) => ({
    key: k,
    val: breakdown[k],
  }));
  entries.sort((a, b) => a.val - b.val);
  const lowest = entries[0];
  const weakest =
    lowest.val < 0.75 ? { key: lowest.key, nudge: NUDGES[lowest.key] } : null;

  return { score, breakdown, state: treeStateFor(score), weakest };
}

/** Reactive hook: recomputes whenever any contributing store changes. */
export function useLifeScore(): LifeScore {
  const fridgeItems = useFridgeStore((s) => s.items);
  const history = useLaundryStore((s) => s.history);
  const lastCompleted = useLaundryStore((s) => s.lastCompleted);
  const supplies = useSuppliesStore((s) => s.items);
  const books = useReadingStore((s) => s.books);
  const readDates = useReadingStore((s) => s.readDates);
  const isReader = useUserStore((s) => s.isReader);

  const freshItemCount = selectActive({ items: fridgeItems } as any).length;
  const hasActiveBook = books.some((b: Book) => b.status === 'reading');
  const lowSupplyCount = supplies.filter(isLow).length;

  return computeLifeScore({
    freshItemCount,
    laundryDoneThisWeek: doneThisWeek(history),
    daysSinceLaundry: daysSinceLaundry(lastCompleted),
    isReader,
    hasActiveBook,
    readToday: readToday(readDates),
    readingStreak: readingStreak(readDates),
    supplyCount: supplies.length,
    lowSupplyCount,
  });
}

/** Buddy accessories driven by neglect. */
export function useBuddyFlags() {
  const lastCompleted = useLaundryStore((s) => s.lastCompleted);
  const fridgeItems = useFridgeStore((s) => s.items);
  const since = daysSinceLaundry(lastCompleted);
  const freshItemCount = selectActive({ items: fridgeItems } as any).length;
  return {
    dirtyClothes: since != null && since >= 10,
    emptyBowl: freshItemCount <= 1,
    disheveled: since != null && since >= 4, // "by Wednesday" — a few days in
  };
}

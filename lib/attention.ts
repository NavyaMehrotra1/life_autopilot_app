/**
 * "Immediate attention" triage. The app surfaces what needs you — not
 * everything. This collects candidate nudges across modules, ranks them by
 * urgency, and hands back at most four. One source of truth for the sticky
 * note + the "N things need you" meta line.
 */
import { useFridgeStore, selectActive, itemDaysRemaining } from '@/stores/fridgeStore';
import { useLaundryStore, doneThisWeek, daysSinceLaundry } from '@/stores/laundryStore';
import { useSuppliesStore, isLow, supplyDaysLeft } from '@/stores/suppliesStore';
import { useReadingStore, dailyGoal, readToday } from '@/stores/readingStore';
import { useSubscriptionStore, isUnused } from '@/stores/subscriptionStore';
import { useUserStore } from '@/stores/userStore';
import { relativeDays, daysSince } from '@/lib/date';

export type AttentionTone = 'red' | 'amber' | 'sage' | 'muted';

export type AttentionItem = {
  id: string;
  label: string;
  timing: string;
  tone: AttentionTone;
  /** Tab route to jump to when tapped. */
  route?: string;
};

export const MAX_ATTENTION = 4;

export function useAttentionItems(): AttentionItem[] {
  const fridge = useFridgeStore((s) => s.items);
  const history = useLaundryStore((s) => s.history);
  const lastCompleted = useLaundryStore((s) => s.lastCompleted);
  const supplies = useSuppliesStore((s) => s.items);
  const books = useReadingStore((s) => s.books);
  const readDates = useReadingStore((s) => s.readDates);
  const subs = useSubscriptionStore((s) => s.subs);
  const isReader = useUserStore((s) => s.isReader);
  const deliveryDay = useUserStore((s) => s.deliveryTime.day);

  const items: AttentionItem[] = [];

  // 1. Fridge — expiring or expired (most urgent first).
  selectActive({ items: fridge } as any)
    .map((it) => ({ it, d: itemDaysRemaining(it) }))
    .filter(({ d }) => d <= 2)
    .sort((a, b) => a.d - b.d)
    .forEach(({ it, d }) => {
      items.push({
        id: `fridge-${it.id}`,
        label: `${it.name.toLowerCase()} ${d < 0 ? 'has gone off' : 'expires'}`,
        timing: d < 0 ? 'expired' : relativeDays(d),
        tone: d <= 1 ? 'red' : 'amber',
        route: '/(tabs)/fridge',
      });
    });

  // 2. Laundry overdue.
  const since = daysSinceLaundry(lastCompleted);
  if (!doneThisWeek(history) && since != null && since >= 7) {
    items.push({
      id: 'laundry',
      label: "laundry's piling up",
      timing: `${since}d`,
      tone: since >= 10 ? 'red' : 'amber',
      route: '/(tabs)',
    });
  }

  // 3. Supplies running low.
  supplies
    .filter(isLow)
    .map((it) => ({ it, d: supplyDaysLeft(it) }))
    .sort((a, b) => a.d - b.d)
    .forEach(({ it, d }) => {
      items.push({
        id: `supply-${it.id}`,
        label: `${it.name.toLowerCase()} running low`,
        timing: `~${Math.max(0, d)}d left`,
        tone: d <= 2 ? 'red' : 'amber',
        route: '/(tabs)/profile',
      });
    });

  // 4. Reading — gentle nudge if behind today.
  if (isReader) {
    const active = books.find((b) => b.status === 'reading');
    if (active && !readToday(readDates)) {
      const goal = dailyGoal(active);
      items.push({
        id: 'reading',
        label: goal > 0 ? `read ${goal} pages of ${active.title.toLowerCase()}` : `pick up ${active.title.toLowerCase()}`,
        timing: 'today',
        tone: 'sage',
        route: '/reading',
      });
    }
  }

  // 5. Grocery review (on the smart review day).
  if (new Date().getDay() === deliveryDay) {
    items.push({
      id: 'grocery',
      label: 'grocery order ready to review',
      timing: 'now',
      tone: 'amber',
      route: '/(tabs)/meals',
    });
  }

  // 6. Subscriptions unused for a month.
  subs
    .filter(isUnused)
    .forEach((s) => {
      items.push({
        id: `sub-${s.id}`,
        label: `you haven't used ${s.name}`,
        timing: `${daysSince(s.lastUsed)}d`,
        tone: 'muted',
        route: '/(tabs)/profile',
      });
    });

  // Order by tone severity, keep the calm cap.
  const weight: Record<AttentionTone, number> = { red: 0, amber: 1, sage: 2, muted: 3 };
  return items.sort((a, b) => weight[a.tone] - weight[b.tone]).slice(0, MAX_ATTENTION);
}

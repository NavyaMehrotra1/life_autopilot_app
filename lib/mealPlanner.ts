/**
 * Builds a 7-day × 3-slot meal plan. Asks Claude first (warm, varied, learns
 * from swaps + fridge), and falls back to the offline dining-hall + fridge
 * heuristic when no API key is set or the call fails.
 */
import { HOPKINS_HALLS, fetchDiningMenu, MenuItem } from '@/lib/nutrislice';
import { hasApiKey, planWeekWithAI } from '@/lib/claude';
import type { Meal, MealSlotName } from '@/stores/mealsStore';

const SLOTS: { slot: MealSlotName; meal: 'breakfast' | 'lunch' | 'dinner' }[] = [
  { slot: 'morning', meal: 'breakfast' },
  { slot: 'afternoon', meal: 'lunch' },
  { slot: 'evening', meal: 'dinner' },
];

type PlanOptions = {
  diningEnabled: boolean;
  diet: string[];
  fridgeItems: string[];
  recentSwaps?: { from: string; to: string }[];
};

function dietOk(item: MenuItem, diet: string[]): boolean {
  const vegOnly = diet.includes('vegetarian') || diet.includes('vegan');
  if (vegOnly && item.vegetarian === false) return false;
  return true;
}

const VALID_SLOTS: MealSlotName[] = ['morning', 'afternoon', 'evening'];

export async function generateWeekPlan(opts: PlanOptions): Promise<Omit<Meal, 'id'>[]> {
  if (hasApiKey()) {
    try {
      const ai = await planWeekWithAI({
        diningEnabled: opts.diningEnabled,
        diet: opts.diet,
        fridgeItems: opts.fridgeItems,
        diningOptions: opts.diningEnabled
          ? HOPKINS_HALLS.map((h) => ({ name: h.name, distance: h.distance }))
          : [],
        recentSwaps: opts.recentSwaps,
      });
      const cleaned = ai
        .filter(
          (m) =>
            typeof m.day === 'number' &&
            m.day >= 0 &&
            m.day < 7 &&
            VALID_SLOTS.includes(m.slot as MealSlotName) &&
            typeof m.name === 'string',
        )
        .map((m) => ({
          day: m.day,
          slot: m.slot as MealSlotName,
          name: m.name,
          location: m.location || (m.source === 'home' ? 'home' : ''),
          distance: m.distance,
          source: (m.source as Meal['source']) ?? 'home',
          protein: !!m.protein,
        }));
      if (cleaned.length >= 21) return cleaned;
    } catch {
      // fall through to offline planner
    }
  }

  const out: Omit<Meal, 'id'>[] = [];

  for (let day = 0; day < 7; day++) {
    for (let s = 0; s < SLOTS.length; s++) {
      const { slot, meal } = SLOTS[s];
      // Rotate halls across the week so it isn't the same place daily.
      const hall = HOPKINS_HALLS[(day + s) % HOPKINS_HALLS.length];

      if (opts.diningEnabled) {
        const menu = await fetchDiningMenu(hall, meal);
        const pick =
          menu.items.find((i) => dietOk(i, opts.diet)) ?? menu.items[0];
        out.push({
          day,
          slot,
          name: pick?.name ?? 'dining hall',
          location: hall.name,
          distance: hall.distance,
          source: 'dining',
          protein: !!pick?.hasProtein,
        });
      } else {
        // No dining halls — lean on home cooking + the occasional outing.
        const home = opts.fridgeItems.length
          ? `cook with ${opts.fridgeItems[(day + s) % opts.fridgeItems.length]}`
          : 'cook something simple';
        out.push({
          day,
          slot,
          name: slot === 'evening' ? home : 'quick home meal',
          location: 'home',
          source: 'home',
          protein: slot !== 'morning',
        });
      }
    }
  }

  return out;
}

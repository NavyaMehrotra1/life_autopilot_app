/**
 * Nutrislice — Hopkins dining hall menus.
 *
 * Nutrislice exposes public weekly menu JSON at:
 *   https://{site}.api.nutrislice.com/menu/api/weeks/school/{school}
 *     /menu-type/{type}/{yyyy}/{mm}/{dd}/
 *
 * Slugs vary by campus, so they're configurable. When the network or slugs
 * aren't available we fall back to representative mock menus so meal planning
 * works offline.
 */
import { dayKey } from '@/lib/date';

const SITE = process.env.EXPO_PUBLIC_NUTRISLICE_SITE || 'hopkins';

export type DiningHall = {
  slug: string;
  name: string;
  distance: string;
};

/** Hopkins dining halls. Swap slugs to match your Nutrislice site. */
export const HOPKINS_HALLS: DiningHall[] = [
  { slug: 'ffc', name: 'Fresh Food Cafe', distance: '4 min' },
  { slug: 'nolans', name: "Nolan's on 33rd", distance: '6 min' },
  { slug: 'levering', name: 'Levering Kitchens', distance: '3 min' },
];

export type MenuItem = {
  name: string;
  station?: string;
  vegetarian?: boolean;
  hasProtein?: boolean;
};

export type DiningMenu = {
  hall: DiningHall;
  meal: 'breakfast' | 'lunch' | 'dinner';
  items: MenuItem[];
};

function buildUrl(school: string, type: string, d: Date): string {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `https://${SITE}.api.nutrislice.com/menu/api/weeks/school/${school}/menu-type/${type}/${yyyy}/${mm}/${dd}/`;
}

export async function fetchDiningMenu(
  hall: DiningHall,
  meal: DiningMenu['meal'],
  date: Date = new Date(),
): Promise<DiningMenu> {
  try {
    const url = buildUrl(hall.slug, meal, date);
    const res = await fetch(url);
    if (res.ok) {
      const data = await res.json();
      const items = parseNutrislice(data, dayKey(date));
      if (items.length) return { hall, meal, items };
    }
  } catch {
    /* fall through to mock */
  }
  return { hall, meal, items: mockMenu(hall, meal) };
}

/** Defensive parse of the Nutrislice week payload into flat items for a day. */
function parseNutrislice(data: any, targetDay: string): MenuItem[] {
  const days: any[] = data?.days ?? [];
  const day = days.find((d) => d?.date === targetDay) ?? days[0];
  const out: MenuItem[] = [];
  for (const mi of day?.menu_items ?? []) {
    const food = mi?.food;
    if (!food?.name) continue;
    out.push({
      name: food.name,
      station: mi?.station_id ? String(mi.station_id) : undefined,
      vegetarian: !!food?.icons?.food_icons?.some?.((i: any) =>
        /veg/i.test(i?.synced_name || ''),
      ),
    });
  }
  return out;
}

const MOCK: Record<DiningMenu['meal'], MenuItem[]> = {
  breakfast: [
    { name: 'scrambled eggs', station: 'grill', hasProtein: true },
    { name: 'oatmeal bar', station: 'hot line', vegetarian: true },
    { name: 'fresh fruit + yogurt', station: 'cold', vegetarian: true, hasProtein: true },
  ],
  lunch: [
    { name: 'grilled chicken bowl', station: 'grill', hasProtein: true },
    { name: 'roasted veg pasta', station: 'pasta', vegetarian: true },
    { name: 'build-your-own salad', station: 'greens', vegetarian: true },
  ],
  dinner: [
    { name: 'tofu stir fry', station: 'wok', vegetarian: true, hasProtein: true },
    { name: 'roast salmon', station: 'entrée', hasProtein: true },
    { name: 'margherita flatbread', station: 'pizza', vegetarian: true },
  ],
};

function mockMenu(hall: DiningHall, meal: DiningMenu['meal']): MenuItem[] {
  return MOCK[meal];
}

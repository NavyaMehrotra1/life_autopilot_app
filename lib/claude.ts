/**
 * Claude API client + typed calls.
 *
 * Every call has a heuristic fallback so the app keeps working offline or
 * without an API key. Warm loading copy lives in LOADING_COPY.
 *
 * SECURITY: calling Anthropic directly from a client exposes the key. For
 * production, proxy through your own backend. This MVP reads the key from
 * EXPO_PUBLIC_ANTHROPIC_API_KEY for local development only.
 */

const API_URL = 'https://api.anthropic.com/v1/messages';
const MODEL = process.env.EXPO_PUBLIC_CLAUDE_MODEL || 'claude-sonnet-4-20250514';
const API_KEY = process.env.EXPO_PUBLIC_ANTHROPIC_API_KEY || '';

export const hasApiKey = () => API_KEY.length > 0;

/** Warm, cheerful loading lines — never "Loading…". */
export const LOADING_COPY = {
  expiry: 'figuring out how long this keeps…',
  recipes: 'rifling through your fridge for ideas…',
  grocery: 'picking out lovely things for the week…',
  meals: 'cooking up your week…',
} as const;

type ClaudeCallOptions = {
  system: string;
  user: string;
  maxTokens?: number;
};

async function callClaude({ system, user, maxTokens = 1024 }: ClaudeCallOptions): Promise<string> {
  if (!hasApiKey()) throw new Error('no-api-key');

  const res = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': API_KEY,
      'anthropic-version': '2023-06-01',
      // Required when the request originates from a browser context (web).
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: maxTokens,
      system,
      messages: [{ role: 'user', content: user }],
    }),
  });

  if (!res.ok) {
    throw new Error(`claude-http-${res.status}`);
  }
  const data = await res.json();
  const text: string | undefined = data?.content?.[0]?.text;
  if (!text) throw new Error('claude-empty');
  return text;
}

/**
 * Translate a diet tag list into explicit hard constraints the model can't
 * "soft-interpret". Single source of truth so meals + groceries stay aligned.
 */
export function dietConstraints(diet: string[]): string {
  if (!diet.length || diet.includes('no restrictions')) return '';
  const rules: string[] = [];
  if (diet.includes('vegan')) {
    rules.push(
      'VEGAN: absolutely no animal products — no meat, poultry, fish, dairy, eggs, honey, gelatin, or whey',
    );
  } else if (diet.includes('vegetarian')) {
    rules.push('VEGETARIAN: no meat, poultry, fish, or seafood of any kind');
  }
  if (diet.includes('no eggs')) {
    rules.push(
      'NO EGGS: absolutely zero eggs in any form. This means NO scrambled eggs, NO omelets, NO frittatas, NO quiche, NO french toast, NO egg sandwiches, NO breakfast burritos with egg, NO shakshuka, NO eggs benedict. Also avoid baked goods that prominently feature eggs (skip if uncertain).',
    );
  }
  if (diet.includes('halal')) rules.push('HALAL only: no pork, no alcohol, halal-certified meat only');
  if (diet.includes('kosher'))
    rules.push('KOSHER only: no pork, no shellfish, no meat + dairy in the same meal');
  return rules.join(' | ');
}

/** Pull a JSON value out of model text, tolerating ```json fences and prose. */
function parseJson<T>(text: string): T {
  let t = text.trim();
  const fence = t.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fence) t = fence[1].trim();
  // Otherwise grab the first {...} or [...] block.
  if (t[0] !== '{' && t[0] !== '[') {
    const obj = t.indexOf('{');
    const arr = t.indexOf('[');
    const start = [obj, arr].filter((n) => n >= 0).sort((a, b) => a - b)[0];
    if (start != null) t = t.slice(start);
  }
  return JSON.parse(t) as T;
}

// ─────────────────────────────────────────────────────────────────────────
// 1. Expiry prediction
// ─────────────────────────────────────────────────────────────────────────

export type ExpiryPrediction = {
  shelf_life_days: number;
  opened_shelf_life_days: number;
  expiry_tips: string;
};

export type ExpiryInput = {
  name: string;
  storage: 'fridge' | 'pantry' | 'freezer';
  opened: boolean;
  purchaseDate: string;
};

export async function predictExpiry(item: ExpiryInput): Promise<ExpiryPrediction> {
  try {
    const text = await callClaude({
      system:
        'You are a food science expert. Return ONLY a JSON object, no other text.',
      user: `Item: ${item.name}, Storage: ${item.storage}, Opened: ${
        item.opened ? 'yes' : 'no'
      }, Purchase date: ${item.purchaseDate}\nReturn: {"shelf_life_days": number, "opened_shelf_life_days": number, "expiry_tips": string}`,
      maxTokens: 300,
    });
    const p = parseJson<ExpiryPrediction>(text);
    if (typeof p.shelf_life_days === 'number') return p;
    throw new Error('bad-shape');
  } catch {
    return heuristicExpiry(item);
  }
}

/** Rough shelf-life table used when the API is unavailable. */
function heuristicExpiry(item: ExpiryInput): ExpiryPrediction {
  const n = item.name.toLowerCase();
  const table: { match: RegExp; fridge: number; pantry: number; freezer: number }[] = [
    { match: /spinach|lettuce|greens|herb|berr|strawber/, fridge: 5, pantry: 2, freezer: 240 },
    { match: /milk|cream|yogurt/, fridge: 7, pantry: 1, freezer: 90 },
    { match: /chicken|fish|beef|pork|meat|turkey/, fridge: 3, pantry: 0, freezer: 180 },
    { match: /egg/, fridge: 28, pantry: 7, freezer: 0 },
    { match: /cheese/, fridge: 21, pantry: 2, freezer: 180 },
    { match: /bread|bagel|tortilla/, fridge: 14, pantry: 5, freezer: 90 },
    { match: /apple|orange|carrot|potato|onion/, fridge: 21, pantry: 14, freezer: 240 },
    { match: /banana|avocado|tomato|peach/, fridge: 6, pantry: 4, freezer: 120 },
    { match: /rice|pasta|bean|flour|cereal|oat/, fridge: 180, pantry: 365, freezer: 365 },
    { match: /leftover|cooked/, fridge: 4, pantry: 0, freezer: 60 },
  ];
  const row = table.find((r) => r.match.test(n));
  const base = row ? row[item.storage] : item.storage === 'freezer' ? 120 : item.storage === 'pantry' ? 30 : 10;
  const shelf = Math.max(1, base);
  return {
    shelf_life_days: shelf,
    opened_shelf_life_days: Math.max(1, Math.round(shelf * 0.5)),
    expiry_tips: row
      ? 'keep it sealed and cool for the longest life.'
      : 'estimated — log the storage method for a sharper guess.',
  };
}

// ─────────────────────────────────────────────────────────────────────────
// 2. Recipe suggestions
// ─────────────────────────────────────────────────────────────────────────

export type Recipe = {
  name: string;
  time_mins: number;
  ingredients_used: string[];
  instructions: string;
};

export type InventoryLine = { name: string; daysLeft: number };

export async function suggestRecipes(
  inventory: InventoryLine[],
  preferences: string[],
): Promise<Recipe[]> {
  try {
    const inv = inventory
      .map((i) => `${i.name} (expires in ${i.daysLeft}d)`)
      .join(', ');
    const text = await callClaude({
      system:
        "You are a college student's personal chef. Suggest quick recipes (under 30 min, minimal cooking skill) using available ingredients, prioritizing items expiring soon. Return ONLY a JSON array of 3 recipes.",
      user: `Available: ${inv || 'not much'}. Preferences: ${
        preferences.join(', ') || 'none'
      }.\nReturn: [{"name": string, "time_mins": number, "ingredients_used": string[], "instructions": string}]`,
      maxTokens: 900,
    });
    const r = parseJson<Recipe[]>(text);
    if (Array.isArray(r) && r.length) return r.slice(0, 3);
    throw new Error('bad-shape');
  } catch {
    return heuristicRecipes(inventory);
  }
}

function heuristicRecipes(inventory: InventoryLine[]): Recipe[] {
  const names = inventory.slice(0, 4).map((i) => i.name);
  const used = names.length ? names : ['whatever you have'];
  return [
    {
      name: 'big skillet scramble',
      time_mins: 12,
      ingredients_used: used.slice(0, 3),
      instructions: 'Sauté everything in a hot pan with a little oil and salt. Eat from the pan, honestly.',
    },
    {
      name: 'fridge-clearing fried rice',
      time_mins: 18,
      ingredients_used: used,
      instructions: 'Cook rice, toss in chopped veg + protein, splash of soy sauce, crack an egg if you have one.',
    },
    {
      name: 'no-effort grain bowl',
      time_mins: 10,
      ingredients_used: used.slice(0, 3),
      instructions: 'Warm grains, pile on whatever needs eating, finish with a sauce you like.',
    },
  ];
}

// ─────────────────────────────────────────────────────────────────────────
// 3. Grocery list generation
// ─────────────────────────────────────────────────────────────────────────

export type GroceryItem = {
  /** Generic name, e.g. "baby spinach". */
  item: string;
  /** Specific product pick with brand + size, e.g. "Earthbound Farm Organic Baby Spinach, 5oz". */
  product: string;
  category: string;
  quantity: string;
  reason: string;
};

export type GroceryContext = {
  preferences: string[];
  cookingEffort: string;
  budget: number;
  fridge: string[];
  store: string;
  /** Names of the planned meals this week, so the cart actually supports them. */
  plannedMeals?: string[];
};

export async function generateGroceryList(ctx: GroceryContext): Promise<GroceryItem[]> {
  const constraints = dietConstraints(ctx.preferences);
  try {
    const text = await callClaude({
      system: [
        'You are building a weekly Instacart grocery list for a college student. The list will be sent to Instacart\'s Platform API, which matches each item to a product at the user\'s nearest supported retailer.',
        '',
        'HARD RULES:',
        '1. Dietary restrictions are absolute — never include a forbidden item.',
        '2. Pick SPECIFIC, real products with brand name and size as they appear on Instacart (e.g. "Eggland\'s Best Large White Eggs, 12 ct", "Chobani Greek Yogurt Plain Nonfat, 32 oz", "Barilla Penne Pasta, 16 oz"). Not generic ("eggs", "yogurt"). The more precise the name, the better Instacart\'s matcher will hit the right product.',
        '3. The cart must SUPPORT the planned meals: every ingredient those meals need (that isn\'t already in the fridge) should appear here.',
        '4. Include 7–10 portable snacks suitable for a college student\'s backpack. Snacks must be SPECIFIC packaged items that travel well unrefrigerated for a few hours: e.g. "KIND Dark Chocolate Nuts & Sea Salt Bars, 12 ct", "RXBAR Chocolate Sea Salt Protein Bars, 12 ct", "Chomps Original Grass Fed Beef Sticks, 10 ct", "Sabra Classic Hummus Singles, 6 ct", "GoGo squeeZ Applesauce Pouches, 12 ct", "Annie\'s Cheddar Bunnies, 8 snack packs", "Justin\'s Classic Almond Butter Squeeze Packs, 10 ct", "Trader Joe\'s Trek Mix singles", clementine bag, individual cheese sticks. Use category "snacks" for these.',
        '5. Skip anything already in their fridge.',
        '6. 14–22 items total (meal ingredients + snacks). Stay near the weekly budget.',
        '',
        'Return ONLY a JSON array. No prose. No code fences.',
      ].join('\n'),
      user: [
        constraints
          ? `DIETARY RESTRICTIONS (MUST FOLLOW): ${constraints}`
          : 'DIETARY RESTRICTIONS: none',
        `Cooking effort: ${ctx.cookingEffort}`,
        `Weekly budget: $${ctx.budget}`,
        `Already in fridge (skip these): ${ctx.fridge.join(', ') || 'empty'}`,
        `Store: ${ctx.store} (specify products commonly stocked there)`,
        ctx.plannedMeals && ctx.plannedMeals.length
          ? `Planned meals this week (build the cart to support these):\n${ctx.plannedMeals
              .map((m, i) => `  ${i + 1}. ${m}`)
              .join('\n')}`
          : 'No meal plan yet — pick versatile staples that cover ~14 meals.',
        '',
        'Return: [{"item": "generic name", "product": "brand + size string", "category": "produce"|"protein"|"dairy"|"grains"|"condiments"|"snacks"|"other", "quantity": "1 bag"|"12 ct"|..., "reason": "ties to which meals or how many days of snacks"}]',
      ].join('\n'),
      maxTokens: 2000,
    });
    const raw = parseJson<Partial<GroceryItem>[]>(text);
    if (!Array.isArray(raw) || !raw.length) throw new Error('bad-shape');
    return raw
      .filter((r) => r.item && r.product)
      .map((r) => ({
        item: r.item!,
        product: r.product!,
        category: r.category ?? 'other',
        quantity: r.quantity ?? '1',
        reason: r.reason ?? '',
      }));
  } catch {
    return heuristicGrocery(ctx);
  }
}

// ─────────────────────────────────────────────────────────────────────────
// 4. Weekly meal plan
// ─────────────────────────────────────────────────────────────────────────

export type AIMealSlot = 'morning' | 'afternoon' | 'evening';
export type AIMealSource = 'dining' | 'restaurant' | 'home';

export type AIMeal = {
  day: number;
  slot: AIMealSlot;
  name: string;
  location: string;
  distance?: string;
  source: AIMealSource;
  protein?: boolean;
};

export type WeekPlanContext = {
  diningEnabled: boolean;
  diet: string[];
  fridgeItems: string[];
  diningOptions: { name: string; distance?: string }[];
  recentSwaps?: { from: string; to: string }[];
};

export async function planWeekWithAI(ctx: WeekPlanContext): Promise<AIMeal[]> {
  const constraints = dietConstraints(ctx.diet);
  const text = await callClaude({
    system: [
      'You are a calm, warm meal planner for a college student.',
      'Plan 7 days × 3 slots (morning/afternoon/evening) = exactly 21 meals.',
      '',
      'HARD RULES (non-negotiable — violating these is a failure):',
      '1. DIETARY RESTRICTIONS ARE ABSOLUTE. Read the restrictions and never violate them, not even once.',
      '2. VARIETY: across all 7 breakfasts, no meal name may appear more than once. Same for the 7 lunches and the 7 dinners. The whole week should feel different day-to-day.',
      '3. Use a wide rotation of cuisines and cooking styles. For breakfasts especially, rotate among: oatmeal, overnight oats, greek yogurt parfait, smoothie bowl, avocado toast, bagel with cream cheese, granola + fruit, chia pudding, breakfast tacos, congee, fruit + nut butter, pancakes, waffles, muffin + latte, etc.',
      '4. Evening meals should be the most substantial of the day.',
      '5. Lean on fridge items so food doesn\'t waste, but never let that override rules 1–3.',
      '',
      'Style: lowercase, short concrete meal names ("oats with peanut butter and banana", not "delicious nutritious breakfast bowl").',
      'Return ONLY a JSON array. No prose. No code fences.',
    ].join('\n'),
    user: [
      constraints
        ? `DIETARY RESTRICTIONS (MUST FOLLOW): ${constraints}`
        : 'DIETARY RESTRICTIONS: none',
      `Dining halls enabled: ${ctx.diningEnabled ? 'yes' : 'no'}`,
      ctx.diningEnabled
        ? `Available dining halls: ${ctx.diningOptions
            .map((h) => `${h.name}${h.distance ? ` (${h.distance})` : ''}`)
            .join('; ') || 'none provided'}`
        : 'No dining halls — use home cooking with the fridge items, plus occasional easy outings.',
      `Fridge: ${ctx.fridgeItems.join(', ') || 'mostly empty'}`,
      ctx.recentSwaps?.length
        ? `Recent swaps (avoid the "from" items, lean into the "to" items): ${ctx.recentSwaps
            .map((s) => `${s.from} → ${s.to}`)
            .join('; ')}`
        : '',
      '',
      'Before returning, verify: (a) every meal respects every dietary restriction, (b) no breakfast name repeats across the week, (c) no lunch name repeats, (d) no dinner name repeats.',
      '',
      'Return: [{"day": 0-6 (0=Sunday), "slot": "morning"|"afternoon"|"evening", "name": string, "location": string, "distance": string?, "source": "dining"|"restaurant"|"home", "protein": boolean}]',
      'Exactly 21 entries, one per (day, slot).',
    ]
      .filter(Boolean)
      .join('\n'),
    maxTokens: 2200,
  });
  const plan = parseJson<AIMeal[]>(text);
  if (!Array.isArray(plan) || plan.length < 21) throw new Error('bad-shape');
  return plan.slice(0, 21);
}

function heuristicGrocery(ctx: GroceryContext): GroceryItem[] {
  const veg = ctx.preferences.includes('vegetarian') || ctx.preferences.includes('vegan');
  const vegan = ctx.preferences.includes('vegan');
  const noEggs = ctx.preferences.includes('no eggs') || vegan;
  type Seed = Omit<GroceryItem, 'product'> & { product: string };
  const base: Seed[] = [
    { item: 'baby spinach', product: 'Earthbound Farm Organic Baby Spinach, 5 oz', category: 'produce', quantity: '1 bag', reason: 'easy greens for any meal' },
    { item: 'eggs', product: "Eggland's Best Large White Eggs, 12 ct", category: 'protein', quantity: '1 dozen', reason: 'fast protein' },
    { item: 'rolled oats', product: 'Quaker Old Fashioned Rolled Oats, 42 oz', category: 'grains', quantity: '1 tub', reason: 'cheap breakfasts' },
    { item: 'bananas', product: 'Fresh Bananas, bunch of 6', category: 'produce', quantity: '6', reason: 'grab-and-go snack' },
    { item: 'greek yogurt', product: 'Chobani Greek Yogurt Plain Nonfat, 32 oz', category: 'dairy', quantity: '1 large', reason: 'protein + breakfast' },
    { item: 'frozen veg mix', product: 'Birds Eye Steamfresh Mixed Vegetables, 10 oz', category: 'produce', quantity: '2 bags', reason: 'never goes bad, fills gaps' },
    { item: 'tofu', product: 'House Foods Premium Tofu Firm, 14 oz', category: 'protein', quantity: '2 blocks', reason: 'low-effort protein' },
    { item: 'pasta', product: 'Barilla Penne Pasta, 16 oz', category: 'grains', quantity: '2 boxes', reason: 'pantry staple' },
    { item: 'almond butter', product: 'Justin\'s Classic Almond Butter, 16 oz', category: 'other', quantity: '1 jar', reason: 'protein + healthy fats, pairs with everything' },
    { item: 'avocados', product: 'Fresh Hass Avocados, 4 ct', category: 'produce', quantity: '4', reason: 'toast, bowls, salads' },
    { item: 'protein bars', product: 'KIND Dark Chocolate Nuts & Sea Salt Bars, 12 ct', category: 'snacks', quantity: '1 box', reason: '~2 bag-friendly snacks/day' },
    { item: 'beef sticks', product: 'Chomps Original Grass Fed Beef Sticks, 10 ct', category: 'snacks', quantity: '1 box', reason: 'portable protein for between classes' },
    { item: 'hummus singles', product: 'Sabra Classic Hummus Singles, 6 ct', category: 'snacks', quantity: '1 pack', reason: 'pair with crackers or carrots' },
    { item: 'applesauce pouches', product: 'GoGo squeeZ Applesauce Pouches, 12 ct', category: 'snacks', quantity: '1 box', reason: 'no fridge needed, easy snack' },
    { item: 'clementines', product: 'Cuties Mandarin Clementines, 3 lb bag', category: 'produce', quantity: '1 bag', reason: 'whole-fruit snack that travels' },
  ];
  let list = base;
  if (noEggs) list = list.filter((i) => i.item !== 'eggs');
  if (veg) list = list.filter((i) => i.category !== 'protein' || ['tofu', 'eggs'].includes(i.item));
  if (vegan) list = list.filter((i) => i.category !== 'dairy' && i.item !== 'eggs');
  const have = new Set(ctx.fridge.map((f) => f.toLowerCase()));
  return list.filter((i) => !have.has(i.item.toLowerCase()));
}

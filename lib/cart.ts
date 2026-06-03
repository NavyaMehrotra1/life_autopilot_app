/**
 * Cart assembly + submission.
 *
 * Builds the local draft cart (specific products with prices) and submits
 * it to Instacart's Platform API to receive a shoppable URL. The user
 * opens that URL, confirms items into their real Instacart cart on
 * Instacart's side, and checks out there.
 */
import { GroceryItem } from '@/lib/claude';
import {
  createShoppableLink,
  fallbackSearchUrl,
  findPreferredRetailer,
  hasInstacartKey,
  InstacartRetailer,
} from '@/lib/instacart';
import type { InstacartRetailerRef } from '@/stores/userStore';

export type CartLineItem = GroceryItem & {
  price: number;
};

export type DraftCart = {
  store: string;
  items: CartLineItem[];
  subtotal: number;
  estimatedDeliveryMins: number;
  /** Human delivery-window string, e.g. "5:45–6:10 PM". */
  deliveryWindow: string;
  /** Cart is a draft only — the user must confirm on Instacart. Always false here. */
  placed: false;
};

export type BuildCartInput = {
  store: string;
  items: GroceryItem[];
  dietary: string[];
  budget: number;
};

/** Estimated retail prices for the local draft, by category. */
const PRICE_BY_CATEGORY: Record<string, number> = {
  produce: 3.49,
  protein: 6.99,
  dairy: 4.29,
  grains: 2.99,
  condiments: 3.79,
  snacks: 7.49,
  other: 3.99,
};

const round2 = (n: number) => Math.round(n * 100) / 100;

/** Build the local draft cart that's shown to the user for review. */
export function buildDraftCart(input: BuildCartInput): DraftCart {
  const items: CartLineItem[] = input.items.map((it) => ({
    ...it,
    price: PRICE_BY_CATEGORY[it.category] ?? 3.99,
  }));
  const subtotal = round2(items.reduce((s, it) => s + it.price, 0));
  return {
    store: input.store,
    items,
    subtotal,
    estimatedDeliveryMins: 60,
    deliveryWindow: '5:45–6:10 PM',
    placed: false,
  };
}

export type InstacartSubmission = {
  url: string;
  unmatched: string[];
  retailer: InstacartRetailerRef | null;
};

/**
 * Find (or reuse) the nearest preferred retailer for this zip, then
 * submit the cart's items to Instacart for a shoppable URL.
 *
 * Throws on hard failures so the UI can show an error + retry. Falls back
 * to an Instacart search URL only when there's no API key — that way real
 * API errors are surfaced instead of swallowed.
 */
export async function submitCartToInstacart(args: {
  cart: DraftCart;
  zip: string;
  preferredStore: string;
  cachedRetailer: InstacartRetailerRef | null;
}): Promise<InstacartSubmission> {
  const lineItems = args.cart.items.map((it) => ({
    name: it.product,
    quantity: 1,
    unit: 'each',
    display_text: it.product,
  }));

  if (!hasInstacartKey()) {
    return {
      url: fallbackSearchUrl(lineItems),
      unmatched: [],
      retailer: null,
    };
  }

  let retailer: InstacartRetailerRef | null = args.cachedRetailer;
  if (!retailer) {
    const found: InstacartRetailer | null = await findPreferredRetailer(
      args.zip,
      args.preferredStore,
    );
    if (found) {
      retailer = {
        key: found.retailer_key,
        name: found.name,
        fetchedAt: new Date().toISOString(),
      };
    }
  }

  const link = await createShoppableLink({
    items: lineItems,
    retailerKey: retailer?.key,
    title: 'this week\'s groceries',
  });

  return { url: link.url, unmatched: link.unmatched, retailer };
}

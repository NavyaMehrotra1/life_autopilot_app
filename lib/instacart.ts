/**
 * Instacart Developer Platform API client.
 *
 * Two endpoints are used:
 *   GET  /idp/v1/retailers       — find retailers serving a postal code
 *   POST /idp/v1/products/products_link
 *                                 — generate a shoppable URL pre-staged with
 *                                   the given line items
 *
 * The shoppable URL is NOT a literal pre-filled cart. The user lands on
 * Instacart with the items queued, taps "Add to cart" / "Order now" on
 * Instacart's side, and checks out. That's the closest the public Platform
 * API exposes — a real cart-creation endpoint is gated behind partner /
 * retailer-API access.
 *
 * SECURITY: calling Instacart directly from a client exposes the key. Proxy
 * through your own backend for production. This MVP reads the key from
 * EXPO_PUBLIC_INSTACART_API_KEY for local development only.
 */

const API_BASE =
  process.env.EXPO_PUBLIC_INSTACART_API_BASE || 'https://connect.instacart.com';
const API_KEY = process.env.EXPO_PUBLIC_INSTACART_API_KEY || '';

export const hasInstacartKey = () => API_KEY.length > 0;

type FetchOptions = {
  method?: 'GET' | 'POST';
  body?: unknown;
  query?: Record<string, string>;
};

async function call<T>(path: string, opts: FetchOptions = {}): Promise<T> {
  if (!API_KEY) throw new Error('instacart-no-key');

  const url = new URL(`${API_BASE}${path}`);
  if (opts.query) {
    for (const [k, v] of Object.entries(opts.query)) url.searchParams.set(k, v);
  }

  const res = await fetch(url.toString(), {
    method: opts.method ?? 'GET',
    headers: {
      'content-type': 'application/json',
      accept: 'application/json',
      authorization: `Bearer ${API_KEY}`,
    },
    body: opts.body ? JSON.stringify(opts.body) : undefined,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`instacart-http-${res.status}: ${text.slice(0, 200)}`);
  }
  return (await res.json()) as T;
}

// ─────────────────────────────────────────────────────────────────────────
// Retailers
// ─────────────────────────────────────────────────────────────────────────

export type InstacartRetailer = {
  retailer_key: string;
  name: string;
  retailer_logo_url?: string;
  /** Sometimes returned as `distance` in miles by the API. */
  distance?: number;
  address?: { city?: string; state?: string; postal_code?: string };
};

type RetailersResponse = { retailers: InstacartRetailer[] };

/** List retailers serving a postal code. */
export async function findRetailers(
  postalCode: string,
  countryCode: 'US' | 'CA' = 'US',
): Promise<InstacartRetailer[]> {
  const data = await call<RetailersResponse>('/idp/v1/retailers', {
    method: 'GET',
    query: { postal_code: postalCode, country_code: countryCode },
  });
  return Array.isArray(data?.retailers) ? data.retailers : [];
}

/**
 * Pick the nearest Target serving this zip; fall back to the first available
 * retailer (typically returned in nearest-first order) so the cart can still
 * be built when Target isn't an option.
 */
export async function findPreferredRetailer(
  postalCode: string,
  preferredName = 'Target',
): Promise<InstacartRetailer | null> {
  const all = await findRetailers(postalCode);
  if (!all.length) return null;
  const wanted = preferredName.toLowerCase();
  const match = all.find((r) => r.name?.toLowerCase().includes(wanted));
  return match ?? all[0];
}

// ─────────────────────────────────────────────────────────────────────────
// Shoppable products link
// ─────────────────────────────────────────────────────────────────────────

export type ShoppableLineItem = {
  name: string;
  quantity?: number;
  unit?: string;
  display_text?: string;
};

type ProductsLinkResponse = {
  products_link_url?: string;
  /** Some API revisions return this field instead. */
  url?: string;
};

export type ShoppableLinkResult = {
  url: string;
  /** Items whose names looked too generic to match (heuristic, since the
   *  API doesn't tell us per-item match status up front). */
  unmatched: string[];
};

/**
 * Generate a shoppable Instacart URL from the line items. When a retailer
 * key is provided, the URL opens scoped to that retailer.
 */
export async function createShoppableLink(args: {
  items: ShoppableLineItem[];
  retailerKey?: string;
  title?: string;
  partnerLinkbackUrl?: string;
}): Promise<ShoppableLinkResult> {
  if (!args.items.length) throw new Error('instacart-empty-list');

  const body: Record<string, unknown> = {
    title: args.title || 'this week\'s groceries',
    link_type: 'shopping_list',
    line_items: args.items.map((it) => ({
      name: it.name,
      quantity: it.quantity ?? 1,
      unit: it.unit ?? 'each',
      display_text: it.display_text ?? it.name,
    })),
  };
  if (args.retailerKey) body.retailer_key = args.retailerKey;
  if (args.partnerLinkbackUrl) {
    body.landing_page_configuration = {
      partner_linkback_url: args.partnerLinkbackUrl,
    };
  }

  const data = await call<ProductsLinkResponse>(
    '/idp/v1/products/products_link',
    { method: 'POST', body },
  );
  const url = data.products_link_url || data.url;
  if (!url) throw new Error('instacart-no-url');
  return { url, unmatched: [] };
}

/** Fallback when there's no API key: open Instacart with a search query. */
export function fallbackSearchUrl(items: ShoppableLineItem[]): string {
  const q = items.map((i) => i.name).slice(0, 3).join(' ');
  return `https://www.instacart.com/store/s?k=${encodeURIComponent(q)}`;
}

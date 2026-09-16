import { RUDRAKSHA_MUKHI_LIST } from '../data/rudrakshaData';
import { RudrakshaMukhi } from '../types/ecommerce';

/**
 * Normalized shape every card in the "Explore Rudraksha by Mukhi" grid
 * (RudrakshaShopByMukhi.tsx, rendered on /rudraksha right after the Quick
 * Finder) is built from. Whether a tile came from local demo data or a
 * real Shopify product, it always looks like this by the time it reaches
 * the UI — so the component never needs to know where the data came from.
 */
export interface RudrakshaMukhiTile {
  id: string;
  slug: string; // e.g. "5-mukhi-rudraksha" — maps to /products/:slug today, a real Shopify product/collection handle later
  mukhiNumber: number; // 1–14, used for sorting + the on-card "5 Mukhi" badge
  name: string; // e.g. "5 Mukhi Rudraksha"
  shortDescription: string;
  image: string;
  startingPrice: number;
  compareAtPrice: number; // MRP shown struck-through on the card — Shopify's native compareAtPrice
  discountPercent: number; // derived from price vs compareAtPrice, shown as the "X% OFF" badge
  rating: number; // 3.7–5.0 demo rating — swap for Shopify product/reviews-app rating later
  reviewCount: number;
  inStock: boolean;
  rulingGod: string;
  rulingPlanet: string;
}

function hashHandle(text: string): number {
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    hash = (hash << 5) - hash + text.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function slugify(text: string): string {
  return text.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

/**
 * Demo-only starting price, deterministic per Mukhi so it never reshuffles on re-render.
 * Roughly trends upward with rarity (higher Mukhi = higher base) with a little jitter, purely
 * to look like a believable catalog. Once Shopify is connected this is replaced entirely by
 * each product's real price (see fetchRudrakshaMukhiTilesFromSource below) — nothing here
 * needs to be reused.
 */
function buildDemoStartingPrice(mukhiNumber: number, slug: string): number {
  const h = hashHandle(slug);
  const base = 650 + mukhiNumber * 480; // gentle upward curve from 1 Mukhi to 14 Mukhi
  const jitter = h % 400; // +/- up to ~400
  const price = base + jitter;
  return Math.round(price / 10) * 10;
}

/** Only the numbered 1–14 Mukhi entries — Gauri Shankar / Ganesha Rudraksha etc. belong to the
 *  "Rare & Special Rudraksha" section (spec section 10, see getRudrakshaSpecialTiles below). */
function getNumberedMukhiEntries(): { mukhi: RudrakshaMukhi; mukhiNumber: number }[] {
  return RUDRAKSHA_MUKHI_LIST.map((mukhi) => {
    const match = mukhi.mukhi.match(/^(\d+)\s*Mukhi$/i);
    return match ? { mukhi, mukhiNumber: parseInt(match[1], 10) } : null;
  })
    .filter((entry): entry is { mukhi: RudrakshaMukhi; mukhiNumber: number } => entry !== null)
    .sort((a, b) => a.mukhiNumber - b.mukhiNumber);
}

/** The non-numbered entries — Ganesh Rudraksha, Gauri Shankar Rudraksha today, and whatever an
 *  admin adds later (Garbh Gauri, Nag Rudraksha, etc.) picked up automatically since this just
 *  filters out anything that parses as a plain "N Mukhi" entry. */
function getSpecialMukhiEntries(): RudrakshaMukhi[] {
  return RUDRAKSHA_MUKHI_LIST.filter((mukhi) => !/^\d+\s*Mukhi$/i.test(mukhi.mukhi));
}

/**
 * Demo-only rating, review count, and MRP/discount — deterministic per Mukhi (same hash-based
 * approach as gemstoneCatalogService's buildVarietyProduct) so nothing reshuffles on re-render.
 * Once Shopify is connected these come straight from the product record / reviews app instead —
 * see the swap-in note on fetchRudrakshaMukhiTilesFromSource below.
 */
function buildDemoMerchandising(slug: string, startingPrice: number) {
  const h = hashHandle(`${slug}-merch`);
  const discountPercent = 8 + (h % 18); // 8% - 25%
  const compareAtPrice = Math.round(startingPrice / (1 - discountPercent / 100) / 10) * 10;
  const rating = Math.min(5, Math.round((3.9 + (h % 11) / 10) * 10) / 10); // 3.9 - 5.0
  const reviewCount = 60 + (h % 480);
  const inStock = h % 23 !== 0; // the rare listing shows as sold out, same as a real catalog would
  return { discountPercent, compareAtPrice, rating, reviewCount, inStock };
}

function mapMukhiToTile(mukhi: RudrakshaMukhi, mukhiNumber: number): RudrakshaMukhiTile {
  const slug = `${mukhiNumber}-mukhi-rudraksha`;
  const startingPrice = buildDemoStartingPrice(mukhiNumber, slug);
  const { discountPercent, compareAtPrice, rating, reviewCount, inStock } = buildDemoMerchandising(
    slug,
    startingPrice
  );
  return {
    id: slug,
    slug,
    mukhiNumber,
    name: `${mukhiNumber} Mukhi Rudraksha`,
    shortDescription: mukhi.description,
    image: mukhi.imageUrl,
    startingPrice,
    compareAtPrice,
    discountPercent,
    rating,
    reviewCount,
    inStock,
    rulingGod: mukhi.rulingGod,
    rulingPlanet: mukhi.rulingPlanet
  };
}

/**
 * ---------------------------------------------------------------------
 * DATA SOURCE — this is the ONLY function that needs to change when
 * Shopify is connected. Replace the body with a real Storefront API call,
 * e.g. fetching the "rudraksha-by-mukhi" collection (or 14 individual
 * products tagged with their Mukhi metafield):
 *
 *   const products = await shopifyClient.collection.fetchByHandle('rudraksha-by-mukhi');
 *   return products.map(mapShopifyProductToMukhiTile);
 *
 * Each Shopify product should carry (see spec section 30 metafields):
 *   mukhi_number, rudraksha_name, traditional_significance, associated_planet,
 *   associated_deity, price + compareAtPrice (native), inventory quantity, featured image,
 *   plus rating/reviewCount from your reviews app (Judge.me / Loox / Shopify's own reviews).
 * As long as whatever you return matches the RudrakshaMukhiTile shape above,
 * RudrakshaShopByMukhi.tsx keeps working exactly as it does today with demo
 * data — no component changes needed. If the admin hasn't published a
 * product for a given Mukhi yet, just omit it from the returned array; the
 * grid only ever renders what's actually returned.
 * ---------------------------------------------------------------------
 */
async function fetchRudrakshaMukhiTilesFromSource(): Promise<RudrakshaMukhiTile[]> {
  // Demo/local data for now (RUDRAKSHA_MUKHI_LIST in src/data/rudrakshaData.ts).
  return getNumberedMukhiEntries().map(({ mukhi, mukhiNumber }) => mapMukhiToTile(mukhi, mukhiNumber));
}

/** Public entry point used by the "Explore Rudraksha by Mukhi" grid. */
export async function getRudrakshaMukhiTiles(): Promise<RudrakshaMukhiTile[]> {
  try {
    return await fetchRudrakshaMukhiTilesFromSource();
  } catch {
    // Graceful degradation: any Shopify hiccup shows an empty grid (handled by the
    // component's own empty state), never a visible error — same pattern used across
    // the rest of the catalog (see gemstoneCatalogService.ts).
    return [];
  }
}

/** Helper for slugify export, kept here for anything that needs to resolve a Mukhi name to
 *  the same slug format this service uses (kept local/self-contained, not shared across
 *  catalogs — mirrors how gemstoneCatalogService.ts keeps its own slugify). */
export { slugify as slugifyMukhiName };

/**
 * Normalized shape every card in the "Rare & Special Rudraksha" grid
 * (RudrakshaSpecialRudraksha.tsx, rendered on /rudraksha, spec section 10) is built from —
 * deliberately lighter than RudrakshaMukhiTile (no rating/review count) since the spec calls
 * for a simpler Image → Name → Short info → View card for this section.
 */
export interface RudrakshaSpecialTile {
  id: string;
  slug: string; // e.g. "gauri-shankar-rudraksha" — maps to /products/:slug today, a real Shopify product handle later
  name: string; // e.g. "Gauri Shankar Rudraksha"
  shortDescription: string;
  image: string;
  startingPrice: number;
  rulingGod: string;
}

/** Demo-only starting price for special/rare Rudraksha — higher base than the numbered grid
 *  (rarity commands a premium), deterministic per slug so it never reshuffles on re-render.
 *  Replaced entirely by the real product price once Shopify is connected. */
function buildDemoSpecialPrice(slug: string): number {
  const h = hashHandle(`${slug}-special`);
  const price = 3200 + (h % 4800); // a believable ₹3,200 – ₹8,000 rare-item range
  return Math.round(price / 10) * 10;
}

function mapSpecialToTile(mukhi: RudrakshaMukhi): RudrakshaSpecialTile {
  const slug = slugify(mukhi.mukhi);
  return {
    id: slug,
    slug,
    name: mukhi.mukhi,
    shortDescription: mukhi.description,
    image: mukhi.imageUrl,
    startingPrice: buildDemoSpecialPrice(slug),
    rulingGod: mukhi.rulingGod
  };
}

/**
 * ---------------------------------------------------------------------
 * DATA SOURCE — this is the ONLY function that needs to change when Shopify is connected.
 * Replace the body with a real Storefront API call, e.g. fetching a "rare-special-rudraksha"
 * collection (or products tagged accordingly):
 *
 *   const products = await shopifyClient.collection.fetchByHandle('rare-special-rudraksha');
 *   return products.map(mapShopifyProductToSpecialTile);
 *
 * As long as whatever you return matches the RudrakshaSpecialTile shape above,
 * RudrakshaSpecialRudraksha.tsx keeps working exactly as it does today with demo data — no
 * component changes needed. An admin adds a new rare/special entry (Garbh Gauri, Nag
 * Rudraksha, Nepal Rudraksha, a Collector piece, etc.) by publishing a product with that tag;
 * this grid only ever renders what's actually returned, so it appears automatically.
 * ---------------------------------------------------------------------
 */
async function fetchRudrakshaSpecialTilesFromSource(): Promise<RudrakshaSpecialTile[]> {
  // Demo/local data for now (the non-numbered entries in RUDRAKSHA_MUKHI_LIST).
  return getSpecialMukhiEntries().map(mapSpecialToTile);
}

/** Public entry point used by the "Rare & Special Rudraksha" grid. */
export async function getRudrakshaSpecialTiles(): Promise<RudrakshaSpecialTile[]> {
  try {
    return await fetchRudrakshaSpecialTilesFromSource();
  } catch {
    // Graceful degradation: any Shopify hiccup shows an empty grid (handled by the component's
    // own empty state), never a visible error — same pattern used across the rest of the catalog.
    return [];
  }
}
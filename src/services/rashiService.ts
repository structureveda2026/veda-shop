import { RASHI_LIST, RashiDetail } from '../data/rashiData';

/**
 * Normalized shape every card in the "Rudraksha by Rashi" grid (RudrakshaShopByRashi.tsx,
 * rendered on /rudraksha right after Shop By Purpose) is built from. Whether a tile came from
 * local demo data or a real Shopify metaobject entry, it always looks like this by the time it
 * reaches the UI — so the component never needs to know where the data came from.
 */
export interface RashiTile {
  id: string;
  slug: string; // e.g. "mesh" — maps to /rashi/:slug today, a real Shopify metaobject handle later
  nameEn: string; // "Aries"
  nameHi: string; // "Mesh (मेष)"
  symbol: string; // "♈"
  element: string;
  rulingPlanet: string;
  recommendedRudraksha: string; // shown on-card as a preview of the pairing (full detail lives on /rashi/:slug)
}

function mapRashiToTile(rashi: RashiDetail): RashiTile {
  return {
    id: rashi.id,
    slug: rashi.slug,
    nameEn: rashi.nameEn,
    nameHi: rashi.nameHi,
    symbol: rashi.symbol,
    element: rashi.element,
    rulingPlanet: rashi.rulingPlanet,
    recommendedRudraksha: rashi.recommendedRudraksha
  };
}

/**
 * ---------------------------------------------------------------------
 * DATA SOURCE — this is the ONLY function that needs to change when Shopify is connected.
 * Replace the body with a real Storefront API call against a "rashi" Metaobject definition
 * (spec section 30 — same admin-managed-metaobject approach as the Mukhi grid), e.g.:
 *
 *   const entries = await shopifyClient.metaobjects.fetchByType('rashi');
 *   return entries.map(mapShopifyMetaobjectToRashiTile);
 *
 * Each metaobject entry should carry: rashi_name_en, rashi_name_hi, symbol, element,
 * ruling_planet, recommended_rudraksha, recommended_gemstone, recommended_yantra,
 * recommended_puja, description, seo_title, seo_description (mirrors RashiDetail in
 * src/data/rashiData.ts, which SingleRashiPage.tsx already reads for the full detail page).
 * As long as whatever you return matches the RashiTile shape above, RudrakshaShopByRashi.tsx
 * keeps working exactly as it does today with demo data — no component changes needed. An
 * admin can add a new Rashi entry (or a future 13th split/regional variant) or unpublish one
 * entirely from the Shopify admin, and this grid picks it up automatically; the grid only ever
 * renders what's actually returned, in whatever order the source returns it.
 * ---------------------------------------------------------------------
 */
async function fetchRashiTilesFromSource(): Promise<RashiTile[]> {
  // Demo/local data for now (RASHI_LIST in src/data/rashiData.ts).
  return RASHI_LIST.map(mapRashiToTile);
}

/** Public entry point used by the "Rudraksha by Rashi" grid. */
export async function getRashiTiles(): Promise<RashiTile[]> {
  try {
    return await fetchRashiTilesFromSource();
  } catch {
    // Graceful degradation: any Shopify hiccup shows an empty grid (handled by the component's
    // own empty state), never a visible error — same pattern used across the rest of the catalog
    // (see rudrakshaCatalogService.ts / gemstoneCatalogService.ts).
    return [];
  }
}
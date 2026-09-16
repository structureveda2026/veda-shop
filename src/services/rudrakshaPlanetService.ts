import { PLANET_LIST } from '../data/gemstoneData';
import { getRudrakshaMukhiTiles } from './rudrakshaCatalogService';

/**
 * Normalized shape every card in the "Rudraksha by Planet" grid (RudrakshaShopByPlanet.tsx,
 * rendered on /rudraksha right after Shop By Rashi) is built from. Reuses the same 9 Navagraha
 * planets the Gemstone side already ships (PLANET_LIST in src/data/gemstoneData.ts, behind
 * /planets/:planetSlug today) so there's one planet identity across the whole store — only the
 * matched Mukhis here are Rudraksha-specific.
 */
export interface RudrakshaPlanetTile {
  id: string;
  slug: string; // matches PLANET_LIST's slug — resolves against /planets/:planetSlug today
  planetName: string; // e.g. "Sun (Surya Dev)"
  symbol: string;
  matchedMukhiNumbers: number[]; // e.g. [1, 12] — which Mukhis this section links to for this planet
}

/** Short keyword each Navagraha planet's rulingPlanet text is matched against (case-insensitive
 *  substring) — RUDRAKSHA_MUKHI_LIST entries often carry dual rulership, e.g. "Venus / Saturn",
 *  so a Mukhi can legitimately match more than one planet. Keyed by PLANET_LIST's own slug. */
const PLANET_MATCH_KEYWORD: Record<string, string> = {
  sun: 'sun',
  moon: 'moon',
  mars: 'mars',
  mercury: 'mercury',
  jupiter: 'jupiter',
  venus: 'venus',
  saturn: 'saturn',
  rahu: 'rahu',
  ketu: 'ketu'
};

/**
 * ---------------------------------------------------------------------
 * DATA SOURCE — this is the ONLY function that needs to change when Shopify is connected.
 * Once each Rudraksha product carries a real `associated_planet` metafield (spec section 30),
 * swap the matching below for a direct group-by on that field instead of parsing the
 * rulingPlanet string. PLANET_LIST itself already comes from the same source
 * /planets/:planetSlug uses, so no change is needed there. As long as whatever this returns
 * matches the RudrakshaPlanetTile shape above, RudrakshaShopByPlanet.tsx keeps working exactly
 * as it does today — an admin adding, editing or unpublishing a Mukhi's planet association
 * changes this grid automatically, no code changes.
 * ---------------------------------------------------------------------
 */
async function fetchRudrakshaPlanetTilesFromSource(): Promise<RudrakshaPlanetTile[]> {
  const mukhiTiles = await getRudrakshaMukhiTiles();

  return PLANET_LIST.map((planet) => {
    const keyword = PLANET_MATCH_KEYWORD[planet.slug] ?? planet.slug;
    const matchedMukhiNumbers = mukhiTiles
      .filter((tile) => tile.rulingPlanet.toLowerCase().includes(keyword))
      .map((tile) => tile.mukhiNumber)
      .sort((a, b) => a - b);

    return {
      id: planet.id,
      slug: planet.slug,
      planetName: planet.planetName,
      symbol: planet.symbol,
      matchedMukhiNumbers
    };
  });
}

/** Public entry point used by the "Rudraksha by Planet" grid. */
export async function getRudrakshaPlanetTiles(): Promise<RudrakshaPlanetTile[]> {
  try {
    return await fetchRudrakshaPlanetTilesFromSource();
  } catch {
    // Graceful degradation: any hiccup shows an empty grid (handled by the component's own
    // empty state), never a visible error — same pattern used across the rest of the catalog.
    return [];
  }
}
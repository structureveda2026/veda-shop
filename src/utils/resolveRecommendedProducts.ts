import { MOCK_PRODUCTS } from '../data/products';
import { Product, CategorySlug } from '../types/ecommerce';

/**
 * Turns a Rashi/Purpose/Planet's free-text "recommended Rudraksha / gemstone" copy into real
 * matching Product records from MOCK_PRODUCTS, so the shared dynamic pages (SingleRashiPage,
 * SinglePurposePage, PlanetGemstonesPage) show products that are actually relevant to whatever
 * the visitor picked — not a generic top-N slice regardless of selection.
 *
 * Matching is deliberately forgiving since this runs against free-text copy written for humans,
 * not a structured field: numbered Mukhi + a couple of special-Rudraksha keywords are matched
 * precisely (they map 1:1 to a known slug); gemstone names are matched loosely by keyword
 * against product titles. Once Shopify carries a real cross-reference field (a Rashi/Purpose
 * metaobject with an actual product-reference list), this function is the only thing that gets
 * replaced by a direct fetch — none of the three pages need to change either way.
 */

const SPECIAL_RUDRAKSHA_KEYWORDS: { keyword: string; slug: string }[] = [
  { keyword: 'gauri shankar', slug: 'gauri-shankar-rudraksha' },
  { keyword: 'ganesh', slug: 'ganesh-rudraksha' }
];

/** Numbered Mukhi ("7 Mukhi Rudraksha") + special-name (Gauri Shankar, Ganesh) slugs found in a
 *  piece of Rudraksha recommendation copy. */
export function extractRudrakshaSlugs(text: string | string[]): string[] {
  const combined = Array.isArray(text) ? text.join(' | ') : text;
  const slugs = new Set<string>();

  for (const match of combined.matchAll(/(\d{1,2})\s*Mukhi/gi)) {
    const num = parseInt(match[1], 10);
    if (num >= 1 && num <= 14) slugs.add(`${num}-mukhi-rudraksha`);
  }

  const lower = combined.toLowerCase();
  SPECIAL_RUDRAKSHA_KEYWORDS.forEach(({ keyword, slug }) => {
    if (lower.includes(keyword)) slugs.add(slug);
  });

  return Array.from(slugs);
}

/** Loose keyword match against product titles within one category — used for gemstone names
 *  ("Red Coral (Moonga)", "Yellow Sapphire (Pukhraj)") which don't reduce to a clean slug. */
function matchProductsByNameFragments(text: string | string[], category: CategorySlug): Product[] {
  const combined = Array.isArray(text) ? text.join(', ') : text;
  const fragments = combined.split(/[,&|]/).map((f) => f.trim()).filter(Boolean);
  const matched: Product[] = [];

  fragments.forEach((fragment) => {
    const cleaned = fragment.replace(/\(.*?\)/g, '').trim();
    const words = cleaned.toLowerCase().split(/\s+/).filter((w) => w.length > 3);
    const found = MOCK_PRODUCTS.find(
      (p) => p.category === category && words.some((w) => p.title.toLowerCase().includes(w))
    );
    if (found && !matched.some((m) => m.id === found.id)) matched.push(found);
  });

  return matched;
}

export interface ResolveRecommendedProductsOptions {
  rudrakshaText?: string | string[];
  gemstoneText?: string | string[];
  limit?: number;
}

/** Combines matched Rudraksha + gemstone products for the shared Rashi/Purpose pages, which
 *  recommend both. Falls back to a small relevant default only if nothing at all matched
 *  (e.g. the copy's format changes) so the grid is never empty. */
export function resolveRecommendedProducts({
  rudrakshaText,
  gemstoneText,
  limit = 8
}: ResolveRecommendedProductsOptions): Product[] {
  const results: Product[] = [];

  if (rudrakshaText) {
    extractRudrakshaSlugs(rudrakshaText).forEach((slug) => {
      const p = MOCK_PRODUCTS.find((mp) => mp.slug === slug);
      if (p && !results.some((r) => r.id === p.id)) results.push(p);
    });
  }

  if (gemstoneText) {
    matchProductsByNameFragments(gemstoneText, 'gemstones').forEach((p) => {
      if (!results.some((r) => r.id === p.id)) results.push(p);
    });
  }

  if (results.length === 0) {
    return MOCK_PRODUCTS.filter((p) => p.category === 'rudraksha' || p.category === 'gemstones').slice(0, limit);
  }

  return results.slice(0, limit);
}
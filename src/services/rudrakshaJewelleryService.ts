import { MOCK_PRODUCTS } from '../data/products';
import { Product } from '../types/ecommerce';

/**
 * A single "shop by type" tile — used by both the Mala Collection (spec section 11) and
 * Rudraksha Jewellery (spec section 12) sections. Neither section has a full priced-product
 * catalog behind every type yet (e.g. no dedicated "Rudraksha Pendant" SKUs exist today), so
 * both render as an honest type/category grid rather than inventing fake prices — each tile
 * routes straight to the real collection for that type and will start showing real products
 * and counts automatically the moment an admin publishes them in Shopify under that
 * collection/tag. No component changes needed either way.
 */
export interface RudrakshaTypeTile {
  id: string;
  label: string;
  description: string;
  href: string; // real /collections/:category route today; swap for a Shopify collection handle later
}

const MALA_TYPES: RudrakshaTypeTile[] = [
  { id: 'mala-5-mukhi', label: '5 Mukhi Mala', description: 'Everyday japa mala strung from 5 Mukhi beads.', href: '/collections/mala' },
  { id: 'mala-6-mukhi', label: '6 Mukhi Mala', description: 'Traditional mala for focus and courage.', href: '/collections/mala' },
  { id: 'mala-7-mukhi', label: '7 Mukhi Mala', description: 'Associated with prosperity and abundance.', href: '/collections/mala' },
  { id: 'mala-8-mukhi', label: '8 Mukhi Mala', description: 'Associated with removing obstacles.', href: '/collections/mala' },
  { id: 'mala-combination', label: 'Combination Mala', description: 'Mixed-Mukhi malas for layered significance.', href: '/collections/mala' },
  { id: 'mala-japa', label: 'Japa Mala', description: '108-bead malas made for daily mantra practice.', href: '/collections/mala' },
  { id: 'mala-premium', label: 'Premium Mala', description: 'Larger, collector-grade beads with premium finish.', href: '/collections/mala' }
];

const JEWELLERY_TYPES: RudrakshaTypeTile[] = [
  { id: 'jewellery-bracelet', label: 'Rudraksha Bracelet', description: 'Everyday wearable strands for wrist wear.', href: '/collections/bracelets' },
  { id: 'jewellery-pendant', label: 'Rudraksha Pendant', description: 'Single-bead pendants set in silver or gold.', href: '/collections/rudraksha' },
  { id: 'jewellery-kavach', label: 'Rudraksha Kavach', description: 'Bead set in a protective metal shield.', href: '/collections/rudraksha-kavach' },
  { id: 'jewellery-bracelet-men', label: "Bracelet for Men", description: 'Bolder bead sizing, matte or oxidised finish.', href: '/collections/bracelets' },
  { id: 'jewellery-bracelet-women', label: 'Bracelet for Women', description: 'Finer bead sizing with delicate accents.', href: '/collections/bracelets' }
];

/**
 * ---------------------------------------------------------------------
 * DATA SOURCE — swap for a real Shopify fetch once each type has its own collection/tag,
 * e.g. counting live products per type or pulling curated type copy from a metaobject list:
 *
 *   const collection = await shopifyClient.collection.fetchByHandle('rudraksha-mala');
 *
 * Until then this returns the fixed type list above — RudrakshaMala.tsx only ever renders
 * whatever this returns, so growing/renaming types later is a data change, not a UI change.
 * ---------------------------------------------------------------------
 */
export async function getRudrakshaMalaTypes(): Promise<RudrakshaTypeTile[]> {
  try {
    return MALA_TYPES;
  } catch {
    return [];
  }
}

/** Same swap-in note as getRudrakshaMalaTypes above, for the Jewellery type grid. */
export async function getRudrakshaJewelleryTypes(): Promise<RudrakshaTypeTile[]> {
  try {
    return JEWELLERY_TYPES;
  } catch {
    return [];
  }
}

/**
 * The one real, priced product currently published for Rudraksha Jewellery (category
 * 'rudraksha-kavach' in MOCK_PRODUCTS) — featured alongside the type grid so the section isn't
 * only placeholders. Swap the slug lookup for a real Shopify product fetch; if a store admin
 * hasn't published a Kavach product yet, this simply returns null and the component hides the
 * featured card instead of showing broken/fake data.
 */
export async function getFeaturedRudrakshaJewelleryProduct(): Promise<Product | null> {
  try {
    return MOCK_PRODUCTS.find((p) => p.category === 'rudraksha-kavach') ?? null;
  } catch {
    return null;
  }
}
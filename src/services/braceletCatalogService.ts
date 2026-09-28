import { MOCK_PRODUCTS } from '../data/products';
import { RASHI_LIST } from '../data/rashiData';
import { PLANET_LIST } from '../data/gemstoneData';
import { Product } from '../types/ecommerce';

/**
 * BRACELETS LANDING PAGE — data layer.
 *
 * Per spec section 33/34/42 ("5-Year Development Rule"): a new material, gemstone, purpose,
 * Rashi, planet, style, gifting occasion or premium tier must be addable by editing the arrays
 * below (or, once Shopify is connected, by an admin publishing a product/tag/metaobject) — never
 * by writing new component code. Every section component on /bracelets renders whatever these
 * functions return and nothing else, the same discipline already used by rudrakshaCatalogService.ts.
 *
 * Today every tile is built from real MOCK_PRODUCTS bracelet listings (category === 'bracelets')
 * plus the store's existing shared Rashi/Planet identity (RASHI_LIST, PLANET_LIST — the same data
 * /rashi, /rashi/:slug and /planets/:slug already use), so nothing here is invented from scratch.
 * Where the live catalog doesn't yet have a matching product (e.g. no Pyrite bracelet SKU today),
 * the tile is shown honestly (no fake price) rather than faked — same pattern as
 * rudrakshaJewelleryService.ts's "shop by type" grids.
 */

export function getAllBracelets(): Product[] {
  return MOCK_PRODUCTS.filter((p) => p.category === 'bracelets');
}

/** Case-insensitive match against a bracelet's title, tags, subcategory, material and benefits. */
function braceletMatchesKeywords(product: Product, keywords: string[]): boolean {
  const haystack = [
    product.title,
    product.subcategory ?? '',
    product.material ?? '',
    ...product.tags,
    ...product.benefits
  ]
    .join(' ')
    .toLowerCase();
  return keywords.some((kw) => haystack.includes(kw.toLowerCase()));
}

function findBraceletsByKeywords(keywords: string[]): Product[] {
  return getAllBracelets().filter((p) => braceletMatchesKeywords(p, keywords));
}

function findOneBraceletByKeywords(keywords: string[]): Product | null {
  return findBraceletsByKeywords(keywords)[0] ?? null;
}

// ---------------------------------------------------------------------------
// Section 6 (spec): Bestsellers — "Most Loved Bracelets". Same ranking rule as
// RudrakshaBestsellers.tsx: isBestseller flag first, then review volume × rating. Swap-in point
// for Shopify is identical — a BEST_SELLING-sorted collection fetch, see that file's own note.
// ---------------------------------------------------------------------------
export function getBestsellerBracelets(limit = 8): Product[] {
  return getAllBracelets()
    .map((product) => ({
      product,
      score: (product.isBestseller ? 100000 : 0) + product.reviewCount * product.rating
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((entry) => entry.product);
}

// ---------------------------------------------------------------------------
// Shared tile shape for every "shop by X" grid on this page (category nav, purpose, material,
// gemstone, style, gifting, premium, Rudraksha-by-Mukhi). One product may back a tile (real
// price shown) or none yet (honest "Coming Soon" state) — components render either the same way.
// ---------------------------------------------------------------------------
export interface BraceletTile {
  id: string;
  title: string;
  description: string;
  href: string;
  /** Set only when a real bracelet product backs this tile today. */
  product?: Product;
}

function buildTile(id: string, title: string, description: string, href: string, keywords: string[]): BraceletTile {
  return { id, title, description, href, product: findOneBraceletByKeywords(keywords) ?? undefined };
}

// ---------------------------------------------------------------------------
// Section 3 (spec): Quick Category Navigation.
// ---------------------------------------------------------------------------
const CATEGORY_TILES: BraceletTile[] = [
  buildTile('rudraksha', 'Rudraksha Bracelets', 'Traditional Rudraksha-based bracelets', '/rudraksha', ['rudraksha']),
  buildTile('gemstone', 'Gemstone Bracelets', 'Natural gemstone options', '/gemstones', ['gemstone']),
  buildTile('crystal', 'Crystal Bracelets', 'Crystal-based jewellery', '/collections/bracelets', ['crystal', 'quartz']),
  buildTile('karungali', 'Karungali Bracelets', 'Traditional Karungali options', '/collections/karungali', ['karungali']),
  buildTile('combination', 'Combination Bracelets', 'Multiple beads/stones combined', '/collections/bracelets', ['7 chakra', 'combo', 'combination']),
  buildTile('premium', 'Premium Bracelets', 'Premium materials and designs', '/collections/bracelets', ['premium']),
  buildTile('custom', 'Custom Bracelets', 'Personalized bracelet options', '#personalize-bracelet', [])
];

export async function getBraceletCategoryTiles(): Promise<BraceletTile[]> {
  try {
    return CATEGORY_TILES;
  } catch {
    return [];
  }
}

// ---------------------------------------------------------------------------
// Section 4 (spec): Shop By Purpose — "Choose Your Bracelet by Intention". No medical claims
// (no "cures", "controls BP", "guaranteed wealth/marriage") — traditional-association language
// only, per spec. Reuses the store's existing /purpose/:slug pages (src/data/purposeData.ts) —
// the same identity Rudraksha's own Shop By Purpose section already links to — rather than
// inventing a parallel bracelet-only purpose system.
// ---------------------------------------------------------------------------
export interface BraceletPurposeTile {
  id: string;
  title: string;
  description: string;
  purposeSlug: string;
}

const PURPOSE_TILES: BraceletPurposeTile[] = [
  { id: 'protection', title: 'Protection', description: 'Traditional protective symbolism options.', purposeSlug: 'protection' },
  { id: 'peace-meditation', title: 'Peace & Meditation', description: 'Meditation and spiritual practice traditional options.', purposeSlug: 'meditation' },
  { id: 'focus-discipline', title: 'Focus & Discipline', description: 'Traditional associations for focus and discipline.', purposeSlug: 'confidence-discipline' },
  { id: 'prosperity', title: 'Prosperity', description: 'Traditional prosperity symbolism bracelets.', purposeSlug: 'wealth' },
  { id: 'confidence', title: 'Confidence', description: 'Traditional confidence-oriented associations.', purposeSlug: 'confidence-discipline' },
  { id: 'spiritual-growth', title: 'Spiritual Growth', description: 'For spiritual practice and personal journey.', purposeSlug: 'spiritual-growth' },
  { id: 'rashi-astrology', title: 'Rashi / Astrology', description: 'Astrological guidance according bracelet.', purposeSlug: 'astrology-guidance' },
  { id: 'daily-wear', title: 'Daily Wear', description: 'Simple everyday bracelets.', purposeSlug: 'daily-wear' }
];

export async function getBraceletPurposeTiles(): Promise<BraceletPurposeTile[]> {
  try {
    return PURPOSE_TILES;
  } catch {
    return [];
  }
}

// ---------------------------------------------------------------------------
// Section 5 (spec): Shop By Material — explicitly required to be data-driven so a new material
// added later needs no new section coded by hand. `count` is the number of real bracelets
// currently matching that material in the catalog (0 is shown honestly, not hidden).
// ---------------------------------------------------------------------------
export interface BraceletMaterialTile {
  id: string;
  name: string;
  href: string;
  count: number;
}

const MATERIAL_DEFINITIONS: { id: string; name: string; href: string; keywords: string[] }[] = [
  { id: 'rudraksha', name: 'Rudraksha', href: '/rudraksha', keywords: ['rudraksha'] },
  { id: 'gemstone', name: 'Gemstone', href: '/gemstones', keywords: ['gemstone', 'quartz', 'jasper', 'jade'] },
  { id: 'crystal', name: 'Crystal', href: '/collections/bracelets', keywords: ['crystal'] },
  { id: 'karungali', name: 'Karungali', href: '/collections/karungali', keywords: ['karungali'] },
  { id: 'sphatik', name: 'Sphatik', href: '/collections/bracelets', keywords: ['sphatik', 'clear quartz'] },
  { id: 'black-onyx', name: 'Black Onyx', href: '/collections/bracelets', keywords: ['black onyx'] },
  { id: 'tiger-eye', name: 'Tiger Eye', href: '/collections/bracelets', keywords: ['tiger eye'] },
  { id: 'citrine', name: 'Citrine', href: '/collections/bracelets', keywords: ['citrine'] },
  { id: 'amethyst', name: 'Amethyst', href: '/collections/bracelets', keywords: ['amethyst'] },
  { id: 'pyrite', name: 'Pyrite', href: '/collections/bracelets', keywords: ['pyrite'] },
  { id: 'mixed-beads', name: 'Mixed Beads', href: '/collections/bracelets', keywords: ['7 chakra', 'combo', 'combination'] }
];

export async function getBraceletMaterialTiles(): Promise<BraceletMaterialTile[]> {
  try {
    return MATERIAL_DEFINITIONS.map((def) => ({
      id: def.id,
      name: def.name,
      href: def.href,
      count: findBraceletsByKeywords(def.keywords).length
    }));
  } catch {
    return [];
  }
}

// ---------------------------------------------------------------------------
// Section 8 (spec): Shop By Gemstone. Links straight to the matching real product when the
// catalog has one; otherwise an honest "Coming Soon" tile pointing at the general collection.
// ---------------------------------------------------------------------------
const GEMSTONE_NAMES = [
  'Amethyst', 'Citrine', 'Tiger Eye', 'Pyrite', 'Rose Quartz', 'Green Aventurine',
  'Black Onyx', 'Carnelian', 'Labradorite', 'Clear Quartz', 'Moonstone', 'Sodalite'
];

const GEMSTONE_KEYWORDS: Record<string, string[]> = {
  'Rose Quartz': ['rose quartz'],
  'Clear Quartz': ['clear quartz', 'crystal faced'],
  Carnelian: ['carnelian'],
  'Black Onyx': ['black onyx']
};

export async function getBraceletGemstoneTiles(): Promise<BraceletTile[]> {
  try {
    return GEMSTONE_NAMES.map((name) => {
      const keywords = GEMSTONE_KEYWORDS[name] ?? [name.toLowerCase()];
      const product = findOneBraceletByKeywords(keywords);
      return {
        id: name.toLowerCase().replace(/\s+/g, '-'),
        title: name,
        description: product ? product.shortDescription : 'Coming soon to this collection.',
        href: product ? `/products/${product.slug}` : '/collections/bracelets',
        product: product ?? undefined
      };
    });
  } catch {
    return [];
  }
}

// ---------------------------------------------------------------------------
// Section 7 (spec): Shop By Rudraksha (Mukhi bracelets), 1–14. No dedicated Rudraksha-bracelet
// SKUs exist in the catalog yet, so — same honest pattern as RudrakshaMala.tsx — this renders as
// a "shop by type" grid connected straight to the real Rudraksha main category (per spec's own
// instruction: "connect this section to the Rudraksha main category") rather than fake prices.
// ---------------------------------------------------------------------------
export interface MukhiBraceletTile {
  mukhiNumber: number;
  label: string;
  href: string;
}

export async function getBraceletMukhiTiles(): Promise<MukhiBraceletTile[]> {
  try {
    return Array.from({ length: 14 }, (_, i) => ({
      mukhiNumber: i + 1,
      label: `${i + 1} Mukhi`,
      href: `/products/${i + 1}-mukhi-rudraksha`
    }));
  } catch {
    return [];
  }
}

// ---------------------------------------------------------------------------
// Section 9 (spec): Shop By Rashi. Reuses the store's one shared Rashi identity (RASHI_LIST,
// src/data/rashiData.ts — same data /rashi and /rashi/:slug already use) rather than a parallel
// bracelet-only Rashi list. Each Rashi's own `recommendedBracelet` free-text field (already
// present on every entry) is keyword-matched against the real bracelet catalog, same technique
// resolveRecommendedProducts.ts uses for Rudraksha/gemstone matching on /rashi/:slug.
// ---------------------------------------------------------------------------
export interface RashiBraceletTile {
  id: string;
  slug: string;
  nameEn: string;
  nameHi: string;
  symbol: string;
  recommendedBracelet: string;
  matchedProduct: Product | null;
}

function matchProductByFreeText(text: string): Product | null {
  const fragments = text
    .split(/[,&|]/)
    .map((f) => f.replace(/\(.*?\)/g, '').trim().toLowerCase())
    .filter(Boolean);
  for (const fragment of fragments) {
    const words = fragment.split(/\s+/).filter((w) => w.length > 3);
    const found = getAllBracelets().find((p) => words.some((w) => p.title.toLowerCase().includes(w)));
    if (found) return found;
  }
  return null;
}

export async function getBraceletRashiTiles(): Promise<RashiBraceletTile[]> {
  try {
    return RASHI_LIST.map((rashi) => ({
      id: rashi.id,
      slug: rashi.slug,
      nameEn: rashi.nameEn,
      nameHi: rashi.nameHi,
      symbol: rashi.symbol,
      recommendedBracelet: rashi.recommendedBracelet,
      matchedProduct: matchProductByFreeText(rashi.recommendedBracelet)
    }));
  } catch {
    return [];
  }
}

// ---------------------------------------------------------------------------
// Section 10 (spec): Shop By Planet. Reuses the store's 9 Navagraha planets (PLANET_LIST, same
// data /planets/:slug already uses on the Gemstone side) and matches each planet's own
// primaryGemstone + alternativeGemstones against the real bracelet catalog — same "one planet
// identity, per-category matching" approach rudrakshaPlanetService.ts uses for Mukhis.
// ---------------------------------------------------------------------------
export interface PlanetBraceletTile {
  id: string;
  slug: string;
  planetName: string;
  symbol: string;
  matchedProduct: Product | null;
}

export async function getBraceletPlanetTiles(): Promise<PlanetBraceletTile[]> {
  try {
    return PLANET_LIST.map((planet) => {
      const candidateNames = [planet.primaryGemstone, ...planet.alternativeGemstones];
      let matchedProduct: Product | null = null;
      for (const name of candidateNames) {
        matchedProduct = matchProductByFreeText(name);
        if (matchedProduct) break;
      }
      return {
        id: planet.id,
        slug: planet.slug,
        planetName: planet.planetName,
        symbol: planet.symbol,
        matchedProduct
      };
    });
  } catch {
    return [];
  }
}

// ---------------------------------------------------------------------------
// Section 12 (spec): Style Collection — "Wear Your Spirituality".
// ---------------------------------------------------------------------------
const STYLE_COLLECTION_TILES: BraceletTile[] = [
  buildTile('minimal', 'Minimal Bracelets', 'Simple everyday designs', '/collections/bracelets', ['crystal faced', 'howlite']),
  buildTile('traditional', 'Traditional Bracelets', 'Traditional bead combinations', '/rudraksha', ['rudraksha']),
  buildTile('premium', 'Premium Bracelets', 'Premium gemstone / metal combinations', '/collections/bracelets', ['love-attraction', 'combo']),
  buildTile('silver', 'Silver Bracelets', 'Silver elements combined with beads', '/collections/bracelets', ['silver']),
  buildTile('gold-finish', 'Gold Finish', 'Gold-finish designs', '/collections/bracelets', ['gold']),
  buildTile('adjustable', 'Adjustable Bracelets', 'Adjustable cord/chain', '/collections/bracelets', ['elastic', 'adjustable']),
  buildTile('layered', 'Layered Bracelets', 'Multiple-layer designs', '/collections/bracelets', ['layered', '7 chakra'])
];

export async function getBraceletStyleTiles(): Promise<BraceletTile[]> {
  try {
    return STYLE_COLLECTION_TILES;
  } catch {
    return [];
  }
}

// ---------------------------------------------------------------------------
// Section 19 (spec): Gifting.
// ---------------------------------------------------------------------------
const GIFTING_TILES: BraceletTile[] = [
  buildTile('birthday', 'Birthday', 'A meaningful birthday gift.', '/collections/bracelets', []),
  buildTile('anniversary', 'Anniversary', 'Celebrate togetherness.', '/collections/bracelets', ['love']),
  buildTile('wedding', 'Wedding', 'A blessing for a new journey.', '/collections/bracelets', []),
  buildTile('spiritual-gift', 'Spiritual Gift', 'For someone on their own path.', '/collections/bracelets', ['spiritual', 'chakra']),
  buildTile('festival', 'Festival', 'Festive traditional picks.', '/collections/bracelets', []),
  buildTile('raksha-bandhan', 'Raksha Bandhan', 'A sibling keepsake.', '/collections/rakhi', []),
  buildTile('mahashivratri', 'Mahashivratri', 'Shiva-associated traditional picks.', '/rudraksha', ['rudraksha']),
  buildTile('diwali', 'Diwali', 'Prosperity-themed festive gifting.', '/collections/bracelets', ['citrine', 'wealth']),
  buildTile('personalized-gift', 'Personalized Gift', 'Build one from scratch.', '#personalize-bracelet', [])
];

export async function getBraceletGiftingTiles(): Promise<BraceletTile[]> {
  try {
    return GIFTING_TILES;
  } catch {
    return [];
  }
}

// ---------------------------------------------------------------------------
// Section 20 (spec): Premium Collection. No dedicated premium-tier SKUs exist yet, so — same
// honest-grid pattern as the Rudraksha Mala/Jewellery type grids — each tile links to the general
// collection until an admin publishes/tags a premium product, rather than inventing fake prices.
// ---------------------------------------------------------------------------
const PREMIUM_TILES: BraceletTile[] = [
  buildTile('premium-rudraksha', 'Premium Rudraksha', 'Collector-grade Rudraksha bracelets.', '/rudraksha', ['rudraksha']),
  buildTile('gemstone-silver', 'Gemstone + Silver', 'Gemstone beads set with silver.', '/collections/bracelets', ['silver']),
  buildTile('rare-gemstone', 'Rare Gemstone', 'Uncommon, collector-grade stones.', '/gemstones', []),
  buildTile('rudraksha-silver', 'Rudraksha + Silver', 'Rudraksha set with silver accents.', '/rudraksha', ['rudraksha', 'silver']),
  buildTile('premium-crystal', 'Premium Crystal', 'Larger, higher-clarity crystal beads.', '/collections/bracelets', ['crystal']),
  buildTile('limited-edition', 'Limited Edition', 'Small-batch, limited runs.', '/collections/bracelets', [])
];

export async function getBraceletPremiumTiles(): Promise<BraceletTile[]> {
  try {
    return PREMIUM_TILES;
  } catch {
    return [];
  }
}
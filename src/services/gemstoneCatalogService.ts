import { GEMSTONE_CATALOG_DATA, GemstoneItem } from '../data/gemstoneCatalogData';
import { MOCK_PRODUCTS, registerRuntimeProducts } from '../data/products';
import { fetchCollectionProducts, isShopifyEnabled } from '../lib/shopify';
import type { Product } from '../types/ecommerce';
import { isRemoteProduct } from './shopifyCatalogService';

/**
 * Normalized shape every gemstone "tile" is rendered from on the
 * /gemstones/view-all page. Whether a tile came from local demo data
 * or a real Shopify product, it always looks like this by the time
 * it reaches the UI — so the page component never needs to know
 * where the data actually came from.
 */
export interface GemstoneTile {
  id: string;
  slug: string;
  name: string;
  image: string;
  colorLabel: string; // raw descriptive color, e.g. "Deep Royal Blue"
  colorFamily: string; // normalized bucket used for filtering + the tile's backdrop color, e.g. "Blue"
  planet: string; // short planet name, e.g. "Saturn" ('' if not applicable)
  zodiacSigns: string[]; // short zodiac names, e.g. ["Capricorn", "Aquarius"]
  themeColor: string; // saturated brand color for this gem's card backdrop (glossy studio-light gradient)
}

// One saturated color per color family — used to build a glossy, studio-light backdrop
// (color → near-white band → color, top to bottom) behind every tile's gemstone image.
const COLOR_FAMILY_THEMES: Record<string, string> = {
  Blue: '#3E6FB0',
  Red: '#B23A55',
  Green: '#3E8A5C',
  Yellow: '#E8A93B',
  Orange: '#D9824A',
  Purple: '#7C58AC',
  Pink: '#C85A93',
  White: '#B9B0A0',
  Teal: '#3E9C93',
  Multicolor: '#CC9A3E',
  Default: '#D9A94E'
};

/** Builds the exact glossy "color → light → color" vertical gradient used behind each tile's gem. */
export function buildTileGradient(themeColor: string): string {
  return `linear-gradient(180deg, ${themeColor} 0%, #FDFBF6 50%, ${themeColor} 100%)`;
}

/** Maps a free-text color description (from the data) to a normalized filter/theme bucket. */
function getColorFamily(colorLabel: string, gemstoneType: string): string {
  const text = `${colorLabel} ${gemstoneType}`.toLowerCase();
  if (text.includes('multicolor') || text.includes('rainbow')) return 'Multicolor';
  if (text.includes('pink') || text.includes('rose')) return 'Pink';
  if (text.includes('teal') || text.includes('turquoise')) return 'Teal';
  if (text.includes('blue') || text.includes('indigo') || text.includes('sapphire')) return 'Blue';
  if (
    text.includes('red') ||
    text.includes('ruby') ||
    text.includes('crimson') ||
    text.includes('wine') ||
    text.includes('flame')
  )
    return 'Red';
  if (text.includes('green') || text.includes('emerald') || text.includes('olive')) return 'Green';
  if (
    text.includes('yellow') ||
    text.includes('golden') ||
    text.includes('gold') ||
    text.includes('sun') ||
    text.includes('citrine')
  )
    return 'Yellow';
  if (text.includes('orange') || text.includes('honey') || text.includes('cinnamon') || text.includes('amber'))
    return 'Orange';
  if (text.includes('purple') || text.includes('violet')) return 'Purple';
  if (
    text.includes('white') ||
    text.includes('clear') ||
    text.includes('colorless') ||
    text.includes('pearl') ||
    text.includes('ivory') ||
    text.includes('milky')
  )
    return 'White';
  return 'Default';
}

/**
 * Public helper — resolves the same saturated brand color used for a gem's tile backdrop
 * on the "View All Gemstones" grid, so any other component (like the "Shop By Variety" cards
 * on SingleGemstonePage) can build the identical color-matched gradient behind its own images.
 * Pass it straight to buildTileGradient() to get the CSS gradient string.
 */
export function getGemstoneThemeColor(colorLabel: string, gemstoneType: string): string {
  const colorFamily = getColorFamily(colorLabel, gemstoneType);
  return COLOR_FAMILY_THEMES[colorFamily] || COLOR_FAMILY_THEMES.Default;
}

/** Shortens data strings like "Saturn (Shani)" or "Capricorn (Makar)" down to just "Saturn" / "Capricorn". */
function shortLabel(value?: string): string {
  if (!value) return '';
  return value.split('(')[0].trim();
}

/**
 * Optional per-gemstone image override, used ONLY on the "View All Gemstones" tile grid.
 *
 * By default every tile uses `gem.image` from GEMSTONE_CATALOG_DATA (src/data/gemstoneCatalogData.ts) —
 * so it already shows an image for every card out of the box.
 *
 * If you'd rather use your own photo for a specific gemstone on THIS page (without changing the
 * image used everywhere else on the site — detail page, featured strip, etc.), drop your file in
 * /public/images/gemstones-page/all/ and add one line here, keyed by the gemstone's slug:
 *
 *   'blue-sapphire': '/images/gemstones-page/all/blue-sapphire.png',
 *   'ruby': '/images/gemstones-page/all/ruby.png',
 *
 * Any slug not listed here just falls back to gem.image automatically — nothing else to configure.
 */
const TILE_IMAGE_OVERRIDES: Record<string, string> = {
    'blue-sapphire': '/images/gemstones-page/all/BlueSapphire.png',
    'yellow-sapphire': '/images/gemstones-page/all/YellowSapphire.png',
    'red-coral': '/images/gemstones-page/all/RedCoral.png',
    'cat-eye': '/images/gemstones-page/all/CatsEye.png',
    'hessonite': '/images/gemstones-page/all/Hessonite.png',
    'pearl': '/images/gemstones-page/all/Pearl.png',
    'ruby': '/images/gemstones-page/all/Ruby.png',
    'emerald': '/images/gemstones-page/all/Emerald.png',
    'diamond': '/images/gemstones-page/all/Diamond.png',
    'garnet': '/images/gemstones-page/all/Garnet.png',
    'peridot': '/images/gemstones-page/all/Peridot.png',
    'citrine': '/images/gemstones-page/all/Citrine.png',
    'amethyst': '/images/gemstones-page/all/Amethyst.png',
    'aquamarine': '/images/gemstones-page/all/AquaMarine.png',
    'blue-topaz': '/images/gemstones-page/all/BlueTopaz.png',
    'blue-zircon': '/images/gemstones-page/all/BlueZircon.png',
    'alexandrite': '/images/gemstones-page/all/Alexandrite.png',
    'amber': '/images/gemstones-page/all/Amber.png',
    'ametrine': '/images/gemstones-page/all/Ametrine.png',
    'burmese-ruby': '/images/gemstones-page/all/BurmeseRuby.png',
};

function mapCatalogItemToTile(gem: GemstoneItem): GemstoneTile {
  const colorFamily = getColorFamily(gem.color, gem.gemstoneType);
  const themeColor = COLOR_FAMILY_THEMES[colorFamily] || COLOR_FAMILY_THEMES.Default;

  return {
    id: gem.id,
    slug: gem.slug,
    name: gem.name,
    image: TILE_IMAGE_OVERRIDES[gem.slug] || gem.image,
    colorLabel: gem.color,
    colorFamily,
    planet: shortLabel(gem.associatedPlanet),
    zodiacSigns: (gem.associatedZodiacSigns || []).map(shortLabel),
    themeColor
  };
}

/**
 * ---------------------------------------------------------------------
 * DATA SOURCE — swap this when Shopify is connected.
 * ---------------------------------------------------------------------
 * This is the ONLY function that needs to change. Replace the body with
 * a real call to your Shopify Storefront/Admin API, e.g.:
 *
 *   const products = await shopifyClient.product.fetchAll();
 *   return products.map(mapShopifyProductToGemstoneTile);
 *
 * As long as whatever you return matches the GemstoneTile shape above,
 * every component that consumes getAllGemstoneTiles() below (filters,
 * grid, cards) keeps working exactly as it does today with demo data.
 * ---------------------------------------------------------------------
 */
async function fetchGemstoneTilesFromSource(): Promise<GemstoneTile[]> {
  // Demo/local data for now (GEMSTONE_CATALOG_DATA in src/data/gemstoneCatalogData.ts).
  return GEMSTONE_CATALOG_DATA.map(mapCatalogItemToTile);
}

/** Public entry point used by the "View All Gemstones" page. */
export async function getAllGemstoneTiles(): Promise<GemstoneTile[]> {
  return fetchGemstoneTilesFromSource();
}

/**
 * ---------------------------------------------------------------------
 * VARIETY PRODUCT LISTINGS — powers the "Shop By Variety" grid on a
 * single gemstone's detail page (SingleGemstonePage.tsx).
 * ---------------------------------------------------------------------
 * Every "Type & Variety" a person can pick for a gemstone (e.g. "Zambian
 * Emerald", "Ceylon Blue Sapphire"...), including the plain base gemstone
 * itself, maps 1:1 to a `collectionHandle`. In Shopify terms that's a
 * Collection (or a tag) the admin manages directly from the Shopify
 * dashboard — whatever products they add to it are exactly what shows up
 * in the grid for that variety, and removing a product from the
 * collection removes it from the grid. Full add/remove control lives in
 * Shopify; nothing about which products appear is hardcoded here.
 * ---------------------------------------------------------------------
 */
export interface VarietyProductTile {
  id: string;
  handle: string; // this variety's collection/tag handle — admin's add/remove control lives here in Shopify
  title: string;
  image: string;
  price: number;
  compareAtPrice: number;
  discountPercent: number;
  rating: number;
  reviewCount: number;
  inStock: boolean;
  /** Set for real Shopify listings: the product's own handle, so the cart can sell exactly that product. */
  productHandle?: string;
}

function hashHandle(text: string): number {
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    hash = (hash << 5) - hash + text.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

/**
 * ---------------------------------------------------------------------
 * "TYPES & VARIETIES" DEMO DATA — shared by SingleGemstonePage's variant
 * picker AND the single-listing detail page (so a listing's page can
 * resolve its own variant name/image from a collectionHandle in the URL
 * the exact same way the picker does). Keyed by `gemstoneType`.
 *
 * Swap-in point for Shopify: once real variant records exist (their own
 * image, price, description...), replace this lookup + getGemstoneVarieties()
 * below with a real fetch and keep returning the same `string[]` of names
 * (or extend callers to use real per-variant fields) — nothing else in
 * either page needs to change.
 * ---------------------------------------------------------------------
 */
const GEMSTONE_VARIETY_DEMO_DATA: Record<string, string[]> = {
  Emerald: [
    'Zambian Emerald',
    'Brazilian Emerald',
    'Colombian Emerald',
    'Ethiopian Emerald',
    'Vivid Green Emerald',
    'Russian Emerald',
    'Panjshir Emerald',
    'Indian Emerald',
    'Swat Emerald'
  ],
  Ruby: [
    'Burmese Ruby',
    'Mozambique Ruby',
    'Thai Ruby',
    'African Ruby',
    'Ceylon Ruby',
    'Vietnamese Ruby',
    'Madagascar Ruby'
  ],
  Sapphire: [
    'Ceylon Blue Sapphire',
    'Kashmir Blue Sapphire',
    'Burmese Blue Sapphire',
    'Madagascar Blue Sapphire',
    'Australian Blue Sapphire',
    'Thai Blue Sapphire'
  ],
  Pearl: ['South Sea Pearl', 'Basra Pearl', 'Hyderabadi Pearl', 'Venezuelan Pearl', 'Freshwater Pearl'],
  Coral: ['Italian Red Coral', 'Japani Red Coral', 'Taiwan Red Coral'],
  Hessonite: ['Ceylon Hessonite', 'African Hessonite'],
  'Cat\'s Eye': ["Ceylon Cat's Eye", "Indian Cat's Eye", "Chrysoberyl Cat's Eye"]
};

/** Picks a variety list for a gemstone — matches by gemstoneType keyword, else falls back to a generic set. */
export function getGemstoneVarieties(gem: GemstoneItem): string[] {
  const typeKey = Object.keys(GEMSTONE_VARIETY_DEMO_DATA).find((key) =>
    gem.gemstoneType.toLowerCase().includes(key.toLowerCase())
  );
  if (typeKey) return GEMSTONE_VARIETY_DEMO_DATA[typeKey];

  // Generic fallback so every gemstone always has something to show here.
  return [
    `Premium ${gem.name}`,
    `Natural ${gem.name}`,
    `Certified ${gem.name}`,
    `${gem.origin} ${gem.name}`,
    `Rare ${gem.name}`
  ];
}

function slugify(text: string): string {
  return text.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

/**
 * Resolves a `collectionHandle` (as used in the "Shop By Variety" grid and
 * in a listing's product id) back to the variant's display name + image for
 * a given gem — the base gem itself if the handle is just the gem's own
 * slug, else whichever named variety slugifies to that handle. Used by the
 * single-listing detail page so a direct/shared link can rebuild the right
 * breadcrumb/title without needing anything passed through router state.
 */
export function resolveVarietyByHandle(
  gem: GemstoneItem,
  collectionHandle: string
): { name: string; image: string } {
  if (collectionHandle === gem.slug) {
    return { name: gem.name, image: gem.image };
  }
  const match = getGemstoneVarieties(gem).find((name) => slugify(name) === collectionHandle);
  return { name: match || gem.name, image: gem.image };
}

/**
 * Quality-tier labels demo listings are cycled through so a variety with several listings
 * (e.g. "Zambian Emerald") doesn't just repeat the same card 12 times. Purely cosmetic — once
 * Shopify is connected, each listing's real title/tier comes from its own product record.
 */
const DEMO_QUALITY_TIERS = [
  'Super Luxury',
  'Luxury',
  'Super Premium',
  'Premium Plus',
  'Classic',
  'Certified',
  'Natural',
  'Rare Find',
  "Collector's Choice",
  'Fine Cut',
  'Museum Grade',
  'Heirloom',
  'Signature',
  'Everyday Elegance',
  'Statement'
];

/**
 * ---------------------------------------------------------------------
 * DATA SOURCE — this is the ONLY function that needs to change when
 * Shopify is connected. Replace the body with a real Storefront API call
 * scoped to this variety's collection, e.g.:
 *
 *   const products = await shopifyClient.collection.fetchByHandle(collectionHandle);
 *   return products.map(mapShopifyProductToVarietyTile);
 *
 * If the admin hasn't added any products to this collection yet (or has
 * removed them all), just return an empty array — the grid on
 * SingleGemstonePage.tsx already renders a clean "nothing listed yet"
 * state for that case, no extra handling needed on either side.
 * ---------------------------------------------------------------------
 */
/**
 * Builds exactly one demo listing tile for `collectionHandle` at `index` — the same
 * deterministic formula fetchVarietyProductsFromSource() loops over, pulled out so a single
 * listing (e.g. reopened later on its own detail page via getVarietyProductById()) always
 * regenerates identical to how it first appeared in the grid.
 */
function buildVarietyProduct(
  collectionHandle: string,
  index: number,
  fallbackTitle: string,
  fallbackImage: string,
  basePrice: number
): VarietyProductTile {
  const ih = hashHandle(`${collectionHandle}-${index}`);
  const priceMultiplier = 0.75 + (ih % 60) / 100; // ~0.75x - 1.34x of the base gem's starting price
  const price = Math.round((basePrice * priceMultiplier) / 10) * 10;
  const discountPercent = 8 + (ih % 12); // 8% - 19%
  const compareAtPrice = Math.round(price / (1 - discountPercent / 100) / 10) * 10;
  const rating = Math.min(5, Math.round((3.7 + (ih % 14) / 10) * 10) / 10); // 3.7 - 5.0
  const reviewCount = 40 + (ih % 520);
  const tier = DEMO_QUALITY_TIERS[index % DEMO_QUALITY_TIERS.length];

  return {
    id: `${collectionHandle}-demo-${index}`,
    handle: collectionHandle,
    title: `${fallbackTitle} — ${tier}`,
    image: fallbackImage,
    price,
    compareAtPrice,
    discountPercent,
    rating,
    reviewCount,
    inStock: ih % 17 !== 0 // the odd listing shows as sold out, same as a real catalog would
  };
}

const slugifyHandle = (text: string): string => text.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

function productToVarietyTile(product: Product, collectionHandle: string): VarietyProductTile {
  return {
    id: product.slug, // the Shopify handle — also what the listing page's URL carries
    handle: collectionHandle,
    title: product.title,
    image: product.images[0] || '',
    price: product.price,
    compareAtPrice: product.compareAtPrice,
    discountPercent: product.discount,
    rating: product.rating,
    reviewCount: product.reviewCount,
    inStock: product.stock > 0,
    productHandle: product.slug
  };
}

/**
 * Shopify listings for one variety. The variety's collection (handle = the variety's slug, e.g. `ceylon-blue-sapphire`
 * or just `ruby`) wins; if it doesn't exist, any product of the `gemstones` collection tagged with that handle
 * (or whose title / subcategory matches it) is shown instead — so the admin can use either collections or tags.
 */
async function fetchShopifyVarietyListings(collectionHandle: string): Promise<VarietyProductTile[]> {
  try {
    const nodes = await fetchCollectionProducts(collectionHandle, ['carat', 'ratti', 'origin', 'treatment', 'shape', 'certification_lab']);
    if (nodes.length > 0) {
      // Make sure the product page can find these by handle even if they aren't in the `gemstones` collection.
      const missing: Product[] = nodes
        .filter((n) => !MOCK_PRODUCTS.some((p) => p.slug === n.handle && isRemoteProduct(p)))
        .map((n) => ({
          id: n.variantId,
          title: n.title,
          slug: n.handle,
          category: 'gemstones',
          description: n.description || n.title,
          shortDescription: (n.description || n.title).slice(0, 140),
          images: n.images,
          price: n.price,
          compareAtPrice: n.compareAtPrice,
          discount: n.discountPercent,
          rating: 0,
          reviewCount: 0,
          sku: n.sku,
          stock: n.availableForSale ? 20 : 0,
          tags: ['gemstones', ...n.tags.map((t) => t.toLowerCase())],
          benefits: []
        }));
      if (missing.length > 0) registerRuntimeProducts(missing);
      return nodes.map((n) => ({
        id: n.handle,
        handle: collectionHandle,
        title: n.title,
        image: n.images[0] || '',
        price: n.price,
        compareAtPrice: n.compareAtPrice,
        discountPercent: n.discountPercent,
        rating: 0,
        reviewCount: 0,
        inStock: n.availableForSale,
        productHandle: n.handle
      }));
    }
  } catch {
    /* fall through to the tag match below */
  }

  return MOCK_PRODUCTS.filter(
    (p) =>
      p.category === 'gemstones' &&
      isRemoteProduct(p) &&
      (p.tags.some((t) => slugifyHandle(t) === collectionHandle) ||
        p.subcategory === collectionHandle ||
        slugifyHandle(p.title).includes(collectionHandle))
  ).map((p) => productToVarietyTile(p, collectionHandle));
}

async function fetchVarietyProductsFromSource(
  collectionHandle: string,
  fallbackTitle: string,
  fallbackImage: string,
  basePrice: number
): Promise<VarietyProductTile[]> {
  // Shopify connected: the real listings for this variety (never demo cards next to real ones).
  if (isShopifyEnabled()) return fetchShopifyVarietyListings(collectionHandle);

  // Demo/placeholder data for now: a handful of plausible listings per variety (so the page
  // looks like a real, well-stocked collection rather than one lonely card), all derived
  // deterministically from the handle so nothing reshuffles across re-renders — only the
  // count and numbers change when you switch variety, exactly like a real filtered listing
  // would once Shopify is connected.
  const h = hashHandle(collectionHandle);
  const listingCount = 10 + (h % 6); // 10 - 15 demo listings

  return Array.from({ length: listingCount }, (_, index) =>
    buildVarietyProduct(collectionHandle, index, fallbackTitle, fallbackImage, basePrice)
  );
}

/** Public entry point used by SingleGemstonePage's "Shop By Variety" grid. */
export async function getVarietyProducts(
  collectionHandle: string,
  fallbackTitle: string,
  fallbackImage: string,
  basePrice: number
): Promise<VarietyProductTile[]> {
  try {
    return await fetchVarietyProductsFromSource(collectionHandle, fallbackTitle, fallbackImage, basePrice);
  } catch {
    // Graceful degradation: any Shopify hiccup shows an empty grid (handled by the page),
    // never a visible error.
    return [];
  }
}

/**
 * Public entry point used by the single-listing detail page (opened when someone taps an
 * individual stone card in the "Shop By Variety" grid to buy it). `productId` is exactly the
 * `id` a VarietyProductTile already carries (`${collectionHandle}-demo-${index}`), so this
 * just decodes it back into a collectionHandle + index and regenerates that one tile.
 *
 * Once Shopify is connected, replace the body with a real single-product lookup, e.g.:
 *   const product = await shopifyClient.product.fetch(productId);
 *   return mapShopifyProductToVarietyTile(product);
 * — same VarietyProductTile shape in, so the detail page needs no changes.
 */
export async function getVarietyProductById(
  productId: string,
  fallbackTitle: string,
  fallbackImage: string,
  basePrice: number
): Promise<VarietyProductTile | null> {
  const match = productId.match(/^(.*)-demo-(\d+)$/);
  if (!match) {
    // A real Shopify listing: its id is the product handle.
    const product = isShopifyEnabled() ? MOCK_PRODUCTS.find((p) => p.slug === productId && isRemoteProduct(p)) : undefined;
    return product ? productToVarietyTile(product, product.subcategory ?? productId) : null;
  }
  const [, collectionHandle, indexStr] = match;
  return buildVarietyProduct(collectionHandle, Number(indexStr), fallbackTitle, fallbackImage, basePrice);
}

/** Distinct, sorted filter option lists — derived live from whatever data source is active. */
export function getGemstoneFilterOptions(tiles: GemstoneTile[]) {
  const colors = Array.from(new Set(tiles.map((t) => t.colorFamily))).sort();
  const planets = Array.from(new Set(tiles.map((t) => t.planet).filter(Boolean))).sort();
  const zodiacSigns = Array.from(new Set(tiles.flatMap((t) => t.zodiacSigns).filter(Boolean))).sort();
  return { colors, planets, zodiacSigns };
}
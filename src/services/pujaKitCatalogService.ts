import { MOCK_PRODUCTS, registerRuntimeProducts } from '../data/products';
import { CATEGORIES } from '../data/categories';
import { PUJA_KIT_META, registerPujaKitMeta, kitArt, type PujaKitMeta } from '../data/pujaKitData';
import { resolveKitImages } from '../data/pujaKitImages';
import { fetchCollectionProducts, isShopifyEnabled, type ShopifyCollectionProduct } from '../lib/shopify';
import type { Product } from '../types/ecommerce';

/**
 * PUJA KITS LANDING PAGE (/puja-kits) — data layer.
 *
 * Same discipline as rudrakshaCatalogService.ts / braceletCatalogService.ts: every section on the page
 * renders whatever this file returns, and NOTHING on the page is a hand-written list of kits.
 *
 *   • Kit TYPES (Rudrabhishek, Ganesh, Lakshmi, …) come from the `puja-kits` category in
 *     data/categories.ts — add a subcategory there (and products under it) and a new tile + finder chip
 *     appear by themselves.
 *   • Individual samagri shortcuts come from the `puja-samagri` category the same way.
 *   • Occasions / purposes / budgets below are small config arrays — a new festival is one row here.
 *
 * SHOPIFY: `getPujaKits()` is the ONLY function that has to change when Shopify is connected (see its note).
 * Product handle = slug everywhere in this project (cart, gallery, product page), so links keep working.
 */

// ---------------------------------------------------------------------------
// Kit shape used by every section
// ---------------------------------------------------------------------------
export interface PujaKitView {
  product: Product;
  meta: PujaKitMeta;
  /** Human name of the kit type (the subcategory name), e.g. "Rudrabhishek Kit". */
  typeName: string;
}

const pujaKitCategory = () => CATEGORIES.find((c) => c.slug === 'puja-kits');
const pujaSamagriCategory = () => CATEGORIES.find((c) => c.slug === 'puja-samagri');

function typeNameFor(subcategory?: string): string {
  const sub = pujaKitCategory()?.subcategories.find((s) => s.slug === subcategory);
  return sub?.name ?? 'Puja Kit';
}

// ---------------------------------------------------------------------------
// Occasions — "Shop by Occasion". `keywords` let a brand-new kit be matched from its tags
// even before anyone fills in its `custom.kit_occasions` metafield.
// ---------------------------------------------------------------------------
export interface PujaOccasion {
  id: string;
  name: string;
  description: string;
  keywords: string[];
}

export const OCCASIONS: PujaOccasion[] = [
  { id: 'daily', name: 'Daily Puja', description: 'Everyday essentials for your home mandir.', keywords: ['daily puja', 'mandir', 'daily'] },
  { id: 'shivratri', name: 'Shivratri & Sawan', description: 'Shiva worship and Rudrabhishek.', keywords: ['shivratri', 'sawan', 'rudrabhishek'] },
  { id: 'diwali', name: 'Diwali', description: 'Lakshmi-Ganesh puja samagri.', keywords: ['diwali', 'lakshmi'] },
  { id: 'ganesh-chaturthi', name: 'Ganesh Chaturthi', description: 'Welcome Lord Ganesha traditionally.', keywords: ['ganesh chaturthi', 'ganpati'] },
  { id: 'navratri', name: 'Navratri', description: 'Devi puja and Kanya Pujan.', keywords: ['navratri', 'durga', 'devi'] },
  { id: 'griha-pravesh', name: 'Griha Pravesh', description: 'Housewarming and new beginnings.', keywords: ['griha pravesh', 'housewarming', 'new home'] },
  { id: 'purnima', name: 'Purnima & Katha', description: 'Satyanarayan Katha and family pujas.', keywords: ['purnima', 'satyanarayan', 'katha'] },
  { id: 'weekly-vrat', name: 'Weekly Vrat', description: 'Tuesday, Thursday, Friday, Saturday worship.', keywords: ['tuesday', 'saturday', 'friday puja', 'vrat'] },
  { id: 'graha-shanti', name: 'Graha Shanti', description: 'Navagraha puja samagri.', keywords: ['navgraha', 'navagraha', 'graha shanti'] }
];

// ---------------------------------------------------------------------------
// Purposes — reuse the store's existing /purpose/:slug pages (data/purposeData.ts), same as Bracelets.
// Traditional-association language only. No medical / guaranteed-outcome claims.
// ---------------------------------------------------------------------------
export interface PujaPurposeTile {
  id: string;
  title: string;
  description: string;
  purposeSlug: string;
}

const PURPOSE_TILES: PujaPurposeTile[] = [
  { id: 'devotional-practice', title: 'Devotional Practice', description: 'For a steady daily or weekly puja routine.', purposeSlug: 'devotional-practice' },
  { id: 'peace', title: 'Peace & Harmony', description: 'Traditionally performed for a calm, harmonious home.', purposeSlug: 'peace' },
  { id: 'wealth', title: 'Prosperity', description: 'Lakshmi-centred pujas traditionally associated with abundance.', purposeSlug: 'wealth' },
  { id: 'protection', title: 'Protection', description: 'Traditional protective-symbolism pujas.', purposeSlug: 'protection' },
  { id: 'career', title: 'New Beginnings', description: 'Ganesh puja, traditionally offered before new work.', purposeSlug: 'career' },
  { id: 'planetary-balance', title: 'Planetary Balance', description: 'Navagraha puja based on traditional Jyotish practice.', purposeSlug: 'planetary-balance' },
  { id: 'meditation', title: 'Meditation & Focus', description: 'Simple, quiet worship for spiritual practice.', purposeSlug: 'meditation' },
  { id: 'astrology-guidance', title: 'Astrology Guidance', description: 'Ask which puja suits your birth chart.', purposeSlug: 'astrology-guidance' }
];

export async function getPujaPurposeTiles(): Promise<PujaPurposeTile[]> {
  try {
    return PURPOSE_TILES;
  } catch {
    return [];
  }
}

// ---------------------------------------------------------------------------
// Budget ranges + sorting
// ---------------------------------------------------------------------------
export interface BudgetRange {
  id: string;
  label: string;
  min: number;
  max: number;
}

export const BUDGET_RANGES: BudgetRange[] = [
  { id: 'under-1000', label: 'Under ₹1,000', min: 0, max: 999 },
  { id: '1000-2000', label: '₹1,000 – ₹2,000', min: 1000, max: 2000 },
  { id: 'above-2000', label: 'Above ₹2,000', min: 2001, max: Number.POSITIVE_INFINITY }
];

export type PujaSortKey = 'featured' | 'price-asc' | 'price-desc' | 'rating';

export const SORT_OPTIONS: { id: PujaSortKey; label: string }[] = [
  { id: 'featured', label: 'Featured' },
  { id: 'price-asc', label: 'Price: Low to High' },
  { id: 'price-desc', label: 'Price: High to Low' },
  { id: 'rating', label: 'Top Rated' }
];

// ---------------------------------------------------------------------------
// Finder filters (kit type × occasion × budget). 'all' = no filter on that axis.
// ---------------------------------------------------------------------------
export interface PujaKitFilters {
  type: string;
  occasion: string;
  budget: string;
  sort: PujaSortKey;
}

export const DEFAULT_FILTERS: PujaKitFilters = { type: 'all', occasion: 'all', budget: 'all', sort: 'featured' };

export function hasActiveFilters(f: PujaKitFilters): boolean {
  return f.type !== 'all' || f.occasion !== 'all' || f.budget !== 'all';
}

/** Read filters from the URL, ignoring anything that isn't a real option (so stale/foreign links never break the page). */
export function filtersFromParams(params: URLSearchParams): PujaKitFilters {
  const typeSlugs = new Set((pujaKitCategory()?.subcategories ?? []).map((s) => s.slug));
  const occasion = params.get('occasion') ?? 'all';
  const budget = params.get('budget') ?? 'all';
  const type = params.get('type') ?? 'all';
  const sort = (params.get('sort') ?? 'featured') as PujaSortKey;
  return {
    type: typeSlugs.has(type) ? type : 'all',
    occasion: OCCASIONS.some((o) => o.id === occasion) ? occasion : 'all',
    budget: BUDGET_RANGES.some((b) => b.id === budget) ? budget : 'all',
    sort: SORT_OPTIONS.some((s) => s.id === sort) ? sort : 'featured'
  };
}

export function filtersToParams(f: PujaKitFilters): Record<string, string> {
  const out: Record<string, string> = {};
  if (f.type !== 'all') out.type = f.type;
  if (f.occasion !== 'all') out.occasion = f.occasion;
  if (f.budget !== 'all') out.budget = f.budget;
  if (f.sort !== 'featured') out.sort = f.sort;
  return out;
}

const featuredScore = (k: PujaKitView) => (k.product.isBestseller ? 100000 : 0) + k.product.reviewCount * k.product.rating;

export function filterPujaKits(kits: PujaKitView[], f: PujaKitFilters): PujaKitView[] {
  const budget = BUDGET_RANGES.find((b) => b.id === f.budget);
  const list = kits.filter((k) => {
    if (f.type !== 'all' && k.product.subcategory !== f.type) return false;
    if (f.occasion !== 'all' && !k.meta.occasions.includes(f.occasion)) return false;
    if (budget && (k.product.price < budget.min || k.product.price > budget.max)) return false;
    return true;
  });
  const sorted = [...list];
  switch (f.sort) {
    case 'price-asc':
      sorted.sort((a, b) => a.product.price - b.product.price);
      break;
    case 'price-desc':
      sorted.sort((a, b) => b.product.price - a.product.price);
      break;
    case 'rating':
      sorted.sort((a, b) => b.product.rating - a.product.rating || b.product.reviewCount - a.product.reviewCount);
      break;
    default:
      sorted.sort((a, b) => featuredScore(b) - featuredScore(a));
  }
  return sorted;
}

// ---------------------------------------------------------------------------
// THE SHOPIFY SWAP POINT
// ---------------------------------------------------------------------------
function deriveMeta(product: Product): PujaKitMeta {
  const haystack = [product.title, product.subcategory ?? '', ...product.tags].join(' ').toLowerCase();
  return {
    slug: product.slug,
    deity: typeNameFor(product.subcategory).replace(/\s*(puja\s*)?kit$/i, '') || 'Puja',
    occasions: OCCASIONS.filter((o) => o.keywords.some((kw) => haystack.includes(kw))).map((o) => o.id),
    purposes: [],
    contents: [],
    serves: ''
  };
}

function localKits(): PujaKitView[] {
  const metaBySlug = new Map(PUJA_KIT_META.map((m) => [m.slug, m]));
  return MOCK_PRODUCTS.filter((p) => p.category === 'puja-kits').map((product) => ({
    product,
    meta: metaBySlug.get(product.slug) ?? deriveMeta(product),
    typeName: typeNameFor(product.subcategory)
  }));
}

// ---------------------------------------------------------------------------
// Shopify → storefront mapping
// ---------------------------------------------------------------------------
export const PUJA_KIT_COLLECTION_HANDLE = 'puja-kits';

/** Product metafields (namespace `custom`, "Storefront access" ON). All optional — see data/pujaKitData.ts. */
const KIT_METAFIELD_KEYS = ['kit_type', 'kit_contents', 'kit_deity', 'kit_occasions', 'kit_purposes', 'kit_serves', 'kit_weight'];

const slugifyKit = (value: string) => value.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

function parseKitList(raw?: string): string[] {
  if (!raw) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed.map((v) => String(v).trim()).filter(Boolean);
  } catch {
    /* not JSON — plain text list */
  }
  return raw.split(/[\n,]/).map((v) => v.trim()).filter(Boolean);
}

function resolveKitType(explicit: string | undefined, haystack: string, tags: string[]): string {
  const subs = pujaKitCategory()?.subcategories ?? [];
  const slugs = new Set(subs.map((s) => s.slug));
  if (explicit && slugs.has(slugifyKit(explicit))) return slugifyKit(explicit);
  const tagMatch = tags.map(slugifyKit).find((t) => slugs.has(t));
  if (tagMatch) return tagMatch;
  const candidates = subs
    .map((s) => ({ slug: s.slug, key: s.name.toLowerCase().replace(/\s*(puja\s*)?kit$/, '').replace(/\s*shanti$/, '').trim() }))
    .filter((c) => c.key)
    .sort((a, b) => b.key.length - a.key.length);
  return candidates.find((c) => haystack.includes(c.key))?.slug ?? '';
}

function shortenKit(text: string, max = 150): string {
  const clean = text.replace(/\s+/g, ' ').trim();
  if (clean.length <= max) return clean;
  const cut = clean.slice(0, max - 1);
  return `${cut.slice(0, cut.lastIndexOf(' ') > 40 ? cut.lastIndexOf(' ') : cut.length)}…`;
}

function mapShopifyKit(node: ShopifyCollectionProduct): PujaKitView {
  const mf = node.metafields;
  const lowerTags = node.tags.map((t) => t.toLowerCase());
  const haystack = [node.title, node.productType, ...lowerTags].join(' ').toLowerCase();
  const subcategory = resolveKitType(mf.kit_type, haystack, node.tags);
  const description = node.description || `${node.title} — a complete puja kit from Veda Store.`;

  const derived = deriveMeta({ slug: node.handle, title: node.title, subcategory: subcategory || undefined, tags: lowerTags } as Product);
  const occasions = parseKitList(mf.kit_occasions).map(slugifyKit).filter((id) => OCCASIONS.some((o) => o.id === id));
  const meta: PujaKitMeta = {
    slug: node.handle,
    deity: mf.kit_deity || derived.deity,
    occasions: occasions.length > 0 ? occasions : derived.occasions,
    purposes: parseKitList(mf.kit_purposes).map(slugifyKit),
    contents: parseKitList(mf.kit_contents),
    serves: mf.kit_serves || ''
  };

  const product: Product = {
    // The variant gid as the product id: the cart then adds exactly this variant, with no extra lookup.
    id: node.variantId,
    title: node.title,
    slug: node.handle,
    category: 'puja-kits',
    subcategory: subcategory || undefined,
    description,
    shortDescription: shortenKit(description),
    images: resolveKitImages(node.handle, kitArt('saffron'), node.images),
    price: node.price,
    compareAtPrice: node.compareAtPrice,
    discount: node.discountPercent,
    // Shopify holds no reviews — a reviews app can fill these in later. 0 simply hides the stars on the cards.
    rating: 0,
    reviewCount: 0,
    sku: node.sku,
    stock: node.availableForSale ? 40 : 0,
    sizes: ['Standard Kit'],
    material: 'Pure puja samagri, packed & sealed',
    weight: mf.kit_weight,
    tags: ['puja kit', 'puja samagri', ...node.tags],
    benefits: [
      'Complete samagri in one box — no last-minute shopping',
      'Step-by-step vidhi guide included',
      'Carefully selected, sealed for freshness',
      'Suitable for home puja'
    ],
    careInstructions:
      'Store unused samagri in a cool, dry place. Keep dhoop, camphor and incense sealed after opening.',
    shippingInformation: 'Ships across India in secure, moisture-safe packaging.',
    returnInformation: 'Please refer to our Returns & Refund policy for eligibility of puja samagri items.',
    labCertified: false,
    isBestseller: lowerTags.includes('bestseller'),
    isNewArrival: lowerTags.includes('new') || lowerTags.includes('new arrival')
  };

  return { product, meta, typeName: typeNameFor(subcategory) };
}

/**
 * THE DATA SOURCE. Demo catalog until Shopify is connected, then the Shopify `puja-kits` collection
 * (handle = PUJA_KIT_COLLECTION_HANDLE). Shopify is then the single source of truth: title, photos, price /
 * compare-at price, discount and stock. Product handle = slug everywhere in this project, so links keep working.
 * Never throws — any failure returns [] and the page shows its friendly "coming soon" state.
 */
export async function getPujaKits(): Promise<PujaKitView[]> {
  if (!isShopifyEnabled()) {
    try {
      return localKits();
    } catch {
      return [];
    }
  }

  try {
    const nodes = await fetchCollectionProducts(PUJA_KIT_COLLECTION_HANDLE, KIT_METAFIELD_KEYS);
    const views = nodes.map(mapShopifyKit);
    // Let the product page, wishlist and "You may also like" find these kits by slug, like the demo ones.
    registerRuntimeProducts(views.map((v) => v.product), 'puja-kits');
    registerPujaKitMeta(views.map((v) => v.meta));
    return views;
  } catch (error) {
    console.warn('[PujaKits] Could not load the puja-kits collection from Shopify', error);
    return [];
  }
}

// ---------------------------------------------------------------------------
// Tiles derived from the kits + categories (sync, pure — the page loads kits once and passes them in)
// ---------------------------------------------------------------------------
export interface PujaKitTypeTile {
  slug: string;
  title: string;
  description: string;
  count: number;
  startingPrice: number | null;
}

/** "Shop by Puja Kit" — one tile per subcategory of the puja-kits category (categories.ts). */
export function buildTypeTiles(kits: PujaKitView[]): PujaKitTypeTile[] {
  const subs = pujaKitCategory()?.subcategories ?? [];
  return subs.map((sub) => {
    const inType = kits.filter((k) => k.product.subcategory === sub.slug);
    return {
      slug: sub.slug,
      title: sub.name,
      description: sub.description ?? '',
      count: inType.length,
      startingPrice: inType.length ? Math.min(...inType.map((k) => k.product.price)) : null
    };
  });
}

export interface PujaKitOccasionTile extends PujaOccasion {
  count: number;
}

export function buildOccasionTiles(kits: PujaKitView[]): PujaKitOccasionTile[] {
  return OCCASIONS.map((o) => ({ ...o, count: kits.filter((k) => k.meta.occasions.includes(o.id)).length }));
}

export function getBestsellerKits(kits: PujaKitView[], limit = 8): PujaKitView[] {
  return [...kits].sort((a, b) => featuredScore(b) - featuredScore(a)).slice(0, limit);
}

/** Kits that can show a real "what's inside" list, for the interactive contents section. */
export function getKitsWithContents(kits: PujaKitView[], limit = 6): PujaKitView[] {
  return getBestsellerKits(kits.filter((k) => k.meta.contents.length > 0), limit);
}

export interface SamagriTile {
  slug: string;
  title: string;
  description: string;
}

/** "Need individual items?" — subcategories of the puja-samagri category. */
export function getSamagriTiles(): SamagriTile[] {
  return (pujaSamagriCategory()?.subcategories ?? []).map((s) => ({
    slug: s.slug,
    title: s.name,
    description: s.description ?? ''
  }));
}

export function getKitTypeName(subcategory?: string): string {
  return typeNameFor(subcategory);
}
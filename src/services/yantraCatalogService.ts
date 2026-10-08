import { MOCK_PRODUCTS, registerRuntimeProducts } from '../data/products';
import { CATEGORIES } from '../data/categories';
import { YANTRA_META, registerYantraMeta, yantraArt, type YantraAccent, type YantraMeta } from '../data/yantraData';
import { resolveYantraImages } from '../data/yantraImages';
import { fetchCollectionProducts, isShopifyEnabled, type ShopifyCollectionProduct } from '../lib/shopify';
import type { Product } from '../types/ecommerce';

/**
 * YANTRA LANDING PAGE (/yantra) — data layer.
 *
 * Same discipline as pujaKitCatalogService.ts / rudrakshaCatalogService.ts: every section on the page renders whatever
 * this file returns, and NOTHING on the page is a hand-written list of yantras.
 *
 *   • Yantra TYPES (Shree, Kuber, Mahamrityunjay, …) come from the `yantra` category in data/categories.ts — add a
 *     subcategory there (and products under it) and a new tile + finder chip appear by themselves.
 *   • Purposes / materials / budgets below are small config arrays — a new material is one row here.
 *
 * DATA SOURCE (getYantras):
 *   • Shopify NOT connected (no VITE_SHOPIFY_* in .env) → the demo catalog in data/yantraData.ts. Fully working
 *     page, filters, cart, wishlist and product pages — no network call.
 *   • Shopify connected → the products of the Shopify collection with handle `yantra` (YANTRA_COLLECTION_HANDLE).
 *     Shopify is then the single source of truth: title, photos, price / compare-at price, discount, stock.
 *     Product handle = slug everywhere in this project (cart, gallery, product page), so links keep working.
 *     Any Shopify hiccup returns [] and the page shows its friendly "coming soon" state instead of crashing.
 *
 * SHOPIFY SETUP (admin → Products → Collections: create a collection with handle `yantra`; add the yantras to it).
 * Optional product metafields, namespace `custom` (Settings → Custom data → Products; tick "Storefront access"):
 *   yantra_type        single_line_text_field        a yantra subcategory slug, e.g. shree-yantra   (or just tag the product with it)
 *   yantra_deity       single_line_text_field        "Goddess Mahalakshmi"
 *   yantra_material    single_line_text_field        copper | gold-plated | silver | brass | sphatik | ashtadhatu
 *   yantra_purposes    list.single_line_text_field   wealth | protection | peace | planetary | vastu | knowledge | career | devotion
 *   yantra_mantra      single_line_text_field
 *   yantra_direction   single_line_text_field        "North-East"
 *   yantra_day         single_line_text_field        "Friday"
 *   yantra_size        single_line_text_field        "4 × 4 inch"
 *   yantra_includes    list.single_line_text_field   what comes in the box
 *   discount_percentage (number) is honoured too, exactly like on the product page.
 * A yantra with NO metafields still shows up — type, material and purposes are derived from its title, tags and
 * product type, so the page works the day the collection is created and gets richer as metafields are filled in.
 */

export const YANTRA_COLLECTION_HANDLE = 'yantra';

const YANTRA_METAFIELD_KEYS = [
  'yantra_type',
  'yantra_deity',
  'yantra_material',
  'yantra_purposes',
  'yantra_mantra',
  'yantra_direction',
  'yantra_day',
  'yantra_size',
  'yantra_includes'
];

// ---------------------------------------------------------------------------
// View shape used by every section
// ---------------------------------------------------------------------------
export interface YantraView {
  product: Product;
  meta: YantraMeta;
  /** Human name of the yantra type (the subcategory name), e.g. "Shree Yantra". */
  typeName: string;
}

const yantraCategory = () => CATEGORIES.find((c) => c.slug === 'yantra');

function typeNameFor(subcategory?: string): string {
  const sub = yantraCategory()?.subcategories.find((s) => s.slug === subcategory);
  return sub?.name ?? 'Yantra';
}

// ---------------------------------------------------------------------------
// Purposes — "Shop by Purpose". Traditional-association language only. `keywords` let a brand-new yantra be matched
// from its title / tags even before anyone fills in its `custom.yantra_purposes` metafield.
// ---------------------------------------------------------------------------
export interface YantraPurpose {
  id: string;
  name: string;
  description: string;
  keywords: string[];
}

export const YANTRA_PURPOSES: YantraPurpose[] = [
  { id: 'wealth', name: 'Wealth & Prosperity', description: 'Lakshmi and Kubera yantras, traditionally kept for abundance.', keywords: ['wealth', 'prosperity', 'lakshmi', 'kuber', 'shree', 'dhan'] },
  { id: 'protection', name: 'Protection', description: 'Yantras of Shiva and Devi, kept for a sense of safety and strength.', keywords: ['protection', 'durga', 'mahamrityunjay', 'shiva', 'bisa'] },
  { id: 'peace', name: 'Peace & Harmony', description: 'For a calm, steady home and a peaceful puja space.', keywords: ['peace', 'harmony', 'calm', 'shanti'] },
  { id: 'planetary', name: 'Planetary Balance', description: 'Navagraha and single-graha yantras from Jyotish practice.', keywords: ['navgraha', 'navagraha', 'graha', 'planet', 'surya', 'chandra', 'mangal', 'budh', 'guru', 'brihaspati', 'shukra', 'shani', 'rahu', 'ketu'] },
  { id: 'vastu', name: 'Home & Vastu', description: 'Placed at entrances and centres of homes and workplaces.', keywords: ['vastu', 'griha pravesh', 'new home', 'home', 'office'] },
  { id: 'knowledge', name: 'Knowledge & Focus', description: 'Saraswati and Guru yantras for students and learners.', keywords: ['knowledge', 'saraswati', 'student', 'study', 'guru', 'vidya'] },
  { id: 'career', name: 'Career & New Beginnings', description: 'Ganesh and Kubera yantras, offered before new work.', keywords: ['career', 'ganesh', 'ganpati', 'new beginnings', 'business', 'kuber'] },
  { id: 'devotion', name: 'Daily Worship', description: 'For a steady daily or weekly puja routine.', keywords: ['daily', 'worship', 'devotion', 'mandir', 'puja'] }
];

// ---------------------------------------------------------------------------
// Materials — "Choose the Right Material".
// ---------------------------------------------------------------------------
export interface YantraMaterial {
  id: string;
  name: string;
  description: string;
  accent: YantraAccent;
  keywords: string[];
}

export const MATERIALS: YantraMaterial[] = [
  { id: 'copper', name: 'Pure Copper', description: 'The classic yantra metal, valued in Vedic tradition for worship.', accent: 'copper', keywords: ['copper', 'tamra', 'tamba'] },
  { id: 'gold-plated', name: '24K Gold Plated', description: 'Copper base with a 24K gold-plated finish — popular for gifting.', accent: 'gold', keywords: ['gold plated', 'gold-plated', '24k', 'gold'] },
  { id: 'silver', name: 'Silver (92.5)', description: 'Compact and traditionally preferred for its purity.', accent: 'silver', keywords: ['silver', 'chandi'] },
  { id: 'brass', name: 'Brass', description: 'Durable, warm-toned metal for everyday worship.', accent: 'brass', keywords: ['brass', 'pital'] },
  { id: 'sphatik', name: 'Sphatik (Crystal)', description: 'Clear quartz, traditionally associated with calm and purity.', accent: 'crystal', keywords: ['sphatik', 'crystal', 'quartz', 'meru'] },
  { id: 'ashtadhatu', name: 'Ashtadhatu', description: 'The traditional eight-metal alloy for permanent installations.', accent: 'ashta', keywords: ['ashtadhatu', 'ashta dhatu', '8 metal', 'eight metal'] }
];

const materialById = (id: string) => MATERIALS.find((m) => m.id === id);

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
  { id: '1000-2500', label: '₹1,000 – ₹2,500', min: 1000, max: 2500 },
  { id: 'above-2500', label: 'Above ₹2,500', min: 2501, max: Number.POSITIVE_INFINITY }
];

export type YantraSortKey = 'featured' | 'price-asc' | 'price-desc' | 'rating';

export const SORT_OPTIONS: { id: YantraSortKey; label: string }[] = [
  { id: 'featured', label: 'Featured' },
  { id: 'price-asc', label: 'Price: Low to High' },
  { id: 'price-desc', label: 'Price: High to Low' },
  { id: 'rating', label: 'Top Rated' }
];

// ---------------------------------------------------------------------------
// Finder filters (type × purpose × material × budget). 'all' = no filter on that axis.
// ---------------------------------------------------------------------------
export interface YantraFilters {
  type: string;
  purpose: string;
  material: string;
  budget: string;
  sort: YantraSortKey;
}

export const DEFAULT_FILTERS: YantraFilters = { type: 'all', purpose: 'all', material: 'all', budget: 'all', sort: 'featured' };

export function hasActiveFilters(f: YantraFilters): boolean {
  return f.type !== 'all' || f.purpose !== 'all' || f.material !== 'all' || f.budget !== 'all';
}

/** Read filters from the URL, ignoring anything that isn't a real option (so stale/foreign links never break the page). */
export function filtersFromParams(params: URLSearchParams): YantraFilters {
  const typeSlugs = new Set((yantraCategory()?.subcategories ?? []).map((s) => s.slug));
  const type = params.get('type') ?? 'all';
  const purpose = params.get('purpose') ?? 'all';
  const material = params.get('material') ?? 'all';
  const budget = params.get('budget') ?? 'all';
  const sort = (params.get('sort') ?? 'featured') as YantraSortKey;
  return {
    type: typeSlugs.has(type) ? type : 'all',
    purpose: YANTRA_PURPOSES.some((p) => p.id === purpose) ? purpose : 'all',
    material: MATERIALS.some((m) => m.id === material) ? material : 'all',
    budget: BUDGET_RANGES.some((b) => b.id === budget) ? budget : 'all',
    sort: SORT_OPTIONS.some((s) => s.id === sort) ? sort : 'featured'
  };
}

export function filtersToParams(f: YantraFilters): Record<string, string> {
  const out: Record<string, string> = {};
  if (f.type !== 'all') out.type = f.type;
  if (f.purpose !== 'all') out.purpose = f.purpose;
  if (f.material !== 'all') out.material = f.material;
  if (f.budget !== 'all') out.budget = f.budget;
  if (f.sort !== 'featured') out.sort = f.sort;
  return out;
}

const featuredScore = (y: YantraView) => (y.product.isBestseller ? 100000 : 0) + y.product.reviewCount * y.product.rating;

export function filterYantras(yantras: YantraView[], f: YantraFilters): YantraView[] {
  const budget = BUDGET_RANGES.find((b) => b.id === f.budget);
  const list = yantras.filter((y) => {
    if (f.type !== 'all' && y.product.subcategory !== f.type) return false;
    if (f.purpose !== 'all' && !y.meta.purposes.includes(f.purpose)) return false;
    if (f.material !== 'all' && y.meta.material !== f.material) return false;
    if (budget && (y.product.price < budget.min || y.product.price > budget.max)) return false;
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
      sorted.sort((a, b) => featuredScore(b) - featuredScore(a)); // stable: ties keep the collection's own order
  }
  return sorted;
}

// ---------------------------------------------------------------------------
// Shopify → storefront mapping
// ---------------------------------------------------------------------------
const slugify = (value: string) => value.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

/** Metafield list values arrive as a JSON array string ("[\"a\",\"b\"]"); plain text lists (one per line / comma) work too. */
function parseList(raw?: string): string[] {
  if (!raw) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed.map((v) => String(v).trim()).filter(Boolean);
  } catch {
    /* not JSON — fall through to plain text */
  }
  return raw.split(/[\n,]/).map((v) => v.trim()).filter(Boolean);
}

const PLANET_WORDS = ['surya', 'chandra', 'mangal', 'budh', 'guru', 'brihaspati', 'shukra', 'shani', 'rahu', 'ketu', 'graha'];

function resolveType(explicit: string | undefined, haystack: string, tags: string[]): string {
  const subs = yantraCategory()?.subcategories ?? [];
  const slugs = new Set(subs.map((s) => s.slug));
  if (explicit && slugs.has(slugify(explicit))) return slugify(explicit);
  const tagMatch = tags.map(slugify).find((t) => slugs.has(t));
  if (tagMatch) return tagMatch;
  for (const sub of subs) {
    const key = sub.name.toLowerCase().replace(/\s*yantra$/, '');
    if (key && haystack.includes(key)) return sub.slug;
  }
  if (PLANET_WORDS.some((w) => haystack.includes(w)) && slugs.has('navgraha-yantra')) return 'navgraha-yantra';
  return '';
}

function resolveMaterial(explicit: string | undefined, haystack: string): string {
  if (explicit) {
    const value = explicit.trim().toLowerCase();
    const direct = MATERIALS.find((m) => m.id === slugify(value) || m.name.toLowerCase() === value || m.keywords.includes(value));
    if (direct) return direct.id;
  }
  // Check more specific materials first so "24K gold plated copper" isn't read as plain copper.
  const order = ['gold-plated', 'ashtadhatu', 'sphatik', 'silver', 'brass', 'copper'];
  for (const id of order) {
    const m = materialById(id);
    if (m && m.keywords.some((kw) => haystack.includes(kw))) return m.id;
  }
  return '';
}

function resolvePurposes(explicit: string[], haystack: string): string[] {
  const found = new Set<string>();
  for (const value of explicit) {
    const v = value.toLowerCase();
    const hit = YANTRA_PURPOSES.find((p) => p.id === slugify(v) || p.name.toLowerCase() === v || p.keywords.some((kw) => v.includes(kw)));
    if (hit) found.add(hit.id);
  }
  if (found.size === 0) {
    YANTRA_PURPOSES.forEach((p) => {
      if (p.keywords.some((kw) => haystack.includes(kw))) found.add(p.id);
    });
  }
  return [...found];
}

function shorten(text: string, max = 150): string {
  const clean = text.replace(/\s+/g, ' ').trim();
  if (clean.length <= max) return clean;
  const cut = clean.slice(0, max - 1);
  return `${cut.slice(0, cut.lastIndexOf(' ') > 40 ? cut.lastIndexOf(' ') : cut.length)}…`;
}

function mapShopifyYantra(node: ShopifyCollectionProduct): YantraView {
  const mf = node.metafields;
  const haystack = [node.title, node.productType, ...node.tags].join(' ').toLowerCase();

  const subcategory = resolveType(mf.yantra_type, haystack, node.tags);
  const materialId = resolveMaterial(mf.yantra_material, haystack);
  const material = materialById(materialId);
  const size = mf.yantra_size || '';
  const includes = parseList(mf.yantra_includes);

  const meta: YantraMeta = {
    slug: node.handle,
    deity: mf.yantra_deity || (subcategory ? typeNameFor(subcategory).replace(/\s*yantra$/i, '') : 'Sacred Yantra'),
    material: materialId,
    purposes: resolvePurposes(parseList(mf.yantra_purposes), haystack),
    mantra: mf.yantra_mantra || '',
    direction: mf.yantra_direction || '',
    day: mf.yantra_day || '',
    size,
    includes: includes.length > 0 ? includes : ['Yantra', 'Placement & worship guide']
  };

  const lowerTags = node.tags.map((t) => t.toLowerCase());
  const product: Product = {
    // The variant gid as the product id: the cart then adds exactly this variant, with no extra lookup.
    id: node.variantId,
    title: node.title,
    slug: node.handle,
    category: 'yantra',
    subcategory: subcategory || undefined,
    description: node.description || `${node.title} — a sacred yantra from Veda Store.`,
    shortDescription: shorten(node.description || node.title),
    images: resolveYantraImages(node.handle, yantraArt(material?.accent ?? 'copper'), node.images),
    price: node.price,
    compareAtPrice: node.compareAtPrice,
    discount: node.discountPercent,
    // Shopify holds no reviews — a reviews app can fill these in later. 0 simply hides the stars on the cards.
    rating: 0,
    reviewCount: 0,
    sku: node.sku,
    stock: node.availableForSale ? 20 : 0,
    sizes: size ? [size] : undefined,
    material: material?.name ?? mf.yantra_material,
    dimensions: size || undefined,
    tags: ['yantra', ...node.tags],
    benefits: [
      'Precisely engraved sacred geometry',
      material ? `Made in ${material.name}` : 'Traditionally crafted',
      'Placement & worship guide included',
      'Energization by a pandit available on request'
    ],
    careInstructions:
      'Wipe gently with a soft dry cloth. Keep on a clean, raised surface in your puja space. Avoid harsh chemicals and moisture.',
    shippingInformation: 'Ships across India in secure, padded packaging.',
    returnInformation: 'Please refer to our Returns & Refund policy for eligibility of yantra items.',
    energizationNote: 'Pran Pratishtha / energization by a pandit is available on request — contact us before ordering.',
    labCertified: false,
    isBestseller: lowerTags.includes('bestseller'),
    isNewArrival: lowerTags.includes('new') || lowerTags.includes('new arrival')
  };

  return { product, meta, typeName: typeNameFor(subcategory) };
}

// ---------------------------------------------------------------------------
// Demo data
// ---------------------------------------------------------------------------
function deriveMeta(product: Product): YantraMeta {
  const haystack = [product.title, product.subcategory ?? '', ...product.tags].join(' ').toLowerCase();
  return {
    slug: product.slug,
    deity: typeNameFor(product.subcategory).replace(/\s*yantra$/i, '') || 'Sacred Yantra',
    material: resolveMaterial(product.material, haystack),
    purposes: resolvePurposes([], haystack),
    mantra: '',
    direction: '',
    day: '',
    size: product.dimensions ?? '',
    includes: ['Yantra', 'Placement & worship guide']
  };
}

function localYantras(): YantraView[] {
  const metaBySlug = new Map(YANTRA_META.map((m) => [m.slug, m]));
  return MOCK_PRODUCTS.filter((p) => p.category === 'yantra').map((product) => ({
    product,
    meta: metaBySlug.get(product.slug) ?? deriveMeta(product),
    typeName: typeNameFor(product.subcategory)
  }));
}

/**
 * THE DATA SOURCE. Demo catalog until Shopify is connected, then the Shopify `yantra` collection.
 * Never throws — any failure returns [] and the page shows its friendly "coming soon" state.
 */
export async function getYantras(): Promise<YantraView[]> {
  if (!isShopifyEnabled()) {
    try {
      return localYantras();
    } catch {
      return [];
    }
  }

  try {
    const nodes = await fetchCollectionProducts(YANTRA_COLLECTION_HANDLE, YANTRA_METAFIELD_KEYS);
    const views = nodes.map(mapShopifyYantra);
    // Let the product page, wishlist and "You may also like" find these products by slug, like the demo ones.
    registerRuntimeProducts(views.map((v) => v.product), 'yantra');
    registerYantraMeta(views.map((v) => v.meta));
    return views;
  } catch (error) {
    console.warn('[Yantra] Could not load the yantra collection from Shopify', error);
    return [];
  }
}

// ---------------------------------------------------------------------------
// Tiles derived from the yantras + categories (sync, pure — the page loads yantras once and passes them in)
// ---------------------------------------------------------------------------
const cheapest = (list: YantraView[]): number | null => (list.length ? Math.min(...list.map((y) => y.product.price)) : null);

export interface YantraTypeTile {
  slug: string;
  title: string;
  description: string;
  count: number;
  startingPrice: number | null;
}

/** "Shop by Yantra" — one tile per subcategory of the yantra category (categories.ts). */
export function buildTypeTiles(yantras: YantraView[]): YantraTypeTile[] {
  return (yantraCategory()?.subcategories ?? []).map((sub) => {
    const inType = yantras.filter((y) => y.product.subcategory === sub.slug);
    return { slug: sub.slug, title: sub.name, description: sub.description ?? '', count: inType.length, startingPrice: cheapest(inType) };
  });
}

export interface YantraPurposeTile extends YantraPurpose {
  count: number;
}

export function buildPurposeTiles(yantras: YantraView[]): YantraPurposeTile[] {
  return YANTRA_PURPOSES.map((p) => ({ ...p, count: yantras.filter((y) => y.meta.purposes.includes(p.id)).length }));
}

export interface YantraMaterialTile extends YantraMaterial {
  count: number;
  startingPrice: number | null;
}

export function buildMaterialTiles(yantras: YantraView[]): YantraMaterialTile[] {
  return MATERIALS.map((m) => {
    const inMaterial = yantras.filter((y) => y.meta.material === m.id);
    return { ...m, count: inMaterial.length, startingPrice: cheapest(inMaterial) };
  });
}

export function getBestsellerYantras(yantras: YantraView[], limit = 8): YantraView[] {
  return [...yantras].sort((a, b) => featuredScore(b) - featuredScore(a)).slice(0, limit);
}

/** Yantras that can show a real "placement & worship" panel (they carry a mantra). */
export function getExplorerYantras(yantras: YantraView[], limit = 8): YantraView[] {
  return getBestsellerYantras(yantras.filter((y) => y.meta.mantra), limit);
}

export function getYantraTypeName(subcategory?: string): string {
  return typeNameFor(subcategory);
}

export function getMaterialName(id: string, fallback = ''): string {
  return materialById(id)?.name ?? fallback;
}
import { CATEGORIES } from '../data/categories';
import { RASHI_LIST } from '../data/rashiData';
import { registerRuntimeProducts } from '../data/products';
import { fetchCollectionProducts, isShopifyEnabled, type ShopifyCollectionProduct } from '../lib/shopify';
import type { CategorySlug, Product } from '../types/ecommerce';
import { getPujaKits } from './pujaKitCatalogService';
import { getYantras } from './yantraCatalogService';

/**
 * SHOPIFY CATALOG LOADER — the one place that pulls the store's products into the storefront.
 *
 * Every listing page (Shop, Search, Collections, Rudraksha, Bracelets, Gemstones, the product page,
 * wishlist, "You may also like"…) reads the shared product list in data/products.ts. This loader fills
 * that list from Shopify once, before the site renders (see <CatalogGate /> in App.tsx), so ALL of them
 * show the real catalog without any page having to change.
 *
 * WHERE EACH CATEGORY COMES FROM — one Shopify collection per category, handle = category slug:
 *   rudraksha · rudraksha-kavach · mala · bracelets · gemstones · puja-samagri · spiritual-essentials · vedic-gifts
 *   yantra     → loaded by services/yantraCatalogService.ts   (collection `yantra`)
 *   puja-kits  → loaded by services/pujaKitCatalogService.ts  (collection `puja-kits`)
 * A product shows up on the site by being in its category's collection. A category whose collection is
 * missing or empty simply keeps showing the built-in demo products, so a half-filled store never looks empty.
 *
 * OPTIONAL PRODUCT METAFIELDS (namespace `custom`, "Storefront access" ON). Everything is derived from the
 * title / tags / product type when a metafield is empty, so none of them is required:
 *   subcategory        single_line_text_field   a subcategory slug from data/categories.ts (e.g. 5-mukhi, ruby, rudrabhishek-kit)
 *   mukhi              single_line_text_field   "5 Mukhi"
 *   rashi              list.single_line_text_field
 *   benefits           list.single_line_text_field
 *   material · weight · dimensions · origin · treatment · shape · certification_lab
 *   carat · ratti      number_decimal
 *   discount_percentage (number) is honoured too, exactly like on the product page.
 * Tags that switch badges on: bestseller · new · certified (or lab-certified) · premium · energized.
 */

/** Categories loaded generically here (yantra and puja-kits have their own richer loaders). */
const GENERIC_CATEGORIES: CategorySlug[] = [
  'rudraksha',
  'rudraksha-kavach',
  'mala',
  'bracelets',
  'gemstones',
  'puja-samagri',
  'spiritual-essentials',
  'vedic-gifts',
];

const METAFIELD_KEYS = [
  'subcategory',
  'mukhi',
  'rashi',
  'benefits',
  'material',
  'weight',
  'dimensions',
  'origin',
  'treatment',
  'shape',
  'certification_lab',
  'carat',
  'ratti',
];

/** True for a product that came from Shopify (its id is a Shopify variant gid), false for the built-in demo products. */
export const isRemoteProduct = (product: Product): boolean => product.id.startsWith('gid://shopify/');

const slugify = (value: string): string =>
  value.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

function parseList(raw?: string): string[] {
  if (!raw) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed.map((v) => String(v).trim()).filter(Boolean);
  } catch {
    /* not JSON — plain text list */
  }
  return raw.split(/[\n,]/).map((v) => v.trim()).filter(Boolean);
}

function toNumber(raw?: string): number | undefined {
  if (!raw) return undefined;
  const n = parseFloat(raw);
  return Number.isFinite(n) ? n : undefined;
}

function shorten(text: string, max = 150): string {
  const clean = text.replace(/\s+/g, ' ').trim();
  if (clean.length <= max) return clean;
  const cut = clean.slice(0, max - 1);
  return `${cut.slice(0, cut.lastIndexOf(' ') > 40 ? cut.lastIndexOf(' ') : cut.length)}…`;
}

/** "5 Mukhi" from a metafield value or a product title; undefined when there is none. */
function mukhiLabel(explicit: string | undefined, title: string): string | undefined {
  const match = (explicit || title).match(/(\d{1,2})\s*mukhi/i);
  return match ? `${parseInt(match[1], 10)} Mukhi` : undefined;
}

/** Subcategory slug (as defined in data/categories.ts) for a Shopify product, or undefined. */
function resolveSubcategory(category: CategorySlug, explicit: string | undefined, haystack: string, tags: string[], mukhi?: string): string | undefined {
  const subs = CATEGORIES.find((c) => c.slug === category)?.subcategories ?? [];
  const slugs = new Set(subs.map((s) => s.slug));

  if (explicit && slugs.has(slugify(explicit))) return slugify(explicit);
  const tagMatch = tags.map(slugify).find((t) => slugs.has(t));
  if (tagMatch) return tagMatch;

  if (mukhi) {
    const bySlug = `${parseInt(mukhi, 10)}-mukhi`;
    if (slugs.has(bySlug)) return bySlug;
  }

  // Longest names first so "Yellow Sapphire" wins over "Sapphire". Numbered mukhi slugs are skipped here
  // ("1 mukhi" would otherwise match inside "11 mukhi") — they are resolved from the mukhi number above.
  const candidates = subs
    .filter((s) => !/^\d+-mukhi$/.test(s.slug))
    .map((s) => ({ slug: s.slug, key: s.name.replace(/\(.*?\)/g, '').replace(/\s+/g, ' ').trim().toLowerCase() }))
    .filter((c) => c.key)
    .sort((a, b) => b.key.length - a.key.length);
  return candidates.find((c) => haystack.includes(c.key))?.slug;
}

function rashiFor(explicit: string[], tags: string[]): string[] | undefined {
  if (explicit.length > 0) return explicit;
  const lower = new Set(tags.map((t) => t.toLowerCase()));
  const found = RASHI_LIST.filter((r) => lower.has(r.slug.toLowerCase()) || lower.has(r.nameEn.toLowerCase())).map((r) => r.nameEn);
  return found.length > 0 ? found : undefined;
}

function mapProduct(node: ShopifyCollectionProduct, category: CategorySlug): Product {
  const mf = node.metafields;
  const tags = node.tags.map((t) => t.toLowerCase());
  const haystack = [node.title, node.productType, ...tags].join(' ').toLowerCase();
  const takesMukhi = category === 'rudraksha' || category === 'mala' || category === 'rudraksha-kavach';
  const mukhi = takesMukhi ? mukhiLabel(mf.mukhi, node.title) : undefined;
  const description = node.description || `${node.title} from Veda Store.`;

  return {
    // The variant gid as the product id: the cart then adds exactly this variant, with no extra lookup.
    id: node.variantId,
    title: node.title,
    slug: node.handle,
    category,
    subcategory: resolveSubcategory(category, mf.subcategory, haystack, node.tags, mukhi),
    description,
    shortDescription: shorten(description),
    images: node.images,
    price: node.price,
    compareAtPrice: node.compareAtPrice,
    discount: node.discountPercent,
    // Shopify holds no reviews — a reviews app can fill these in later. 0 simply means "no reviews yet".
    rating: 0,
    reviewCount: 0,
    sku: node.sku,
    stock: node.availableForSale ? 20 : 0,
    material: mf.material,
    weight: mf.weight,
    dimensions: mf.dimensions,
    tags: [category, ...tags],
    mukhi,
    rashi: rashiFor(parseList(mf.rashi), tags),
    benefits: parseList(mf.benefits),
    isBestseller: tags.includes('bestseller'),
    isNewArrival: tags.includes('new'),
    labCertified: tags.includes('certified') || tags.includes('lab-certified'),
    qualityTier: tags.includes('premium') ? 'Premium' : undefined,
    energizationNote: tags.includes('energized') ? 'Energized' : undefined,
    carat: toNumber(mf.carat),
    ratti: toNumber(mf.ratti),
    origin: mf.origin,
    treatment: mf.treatment,
    shape: mf.shape,
    certificationLab: mf.certification_lab,
  };
}

let pending: Promise<void> | null = null;

async function loadCategory(category: CategorySlug): Promise<void> {
  try {
    const nodes = await fetchCollectionProducts(category, METAFIELD_KEYS);
    if (nodes.length > 0) registerRuntimeProducts(nodes.map((n) => mapProduct(n, category)), category);
  } catch (error) {
    console.warn(`[Catalog] Could not load the "${category}" collection from Shopify`, error);
  }
}

/**
 * Loads the Shopify catalog into the shared product list. Does nothing when Shopify isn't connected
 * (demo mode). Never throws; safe to call many times (the work happens once per page load).
 */
export function loadShopifyCatalog(): Promise<void> {
  if (!isShopifyEnabled()) return Promise.resolve();
  if (!pending) {
    pending = Promise.all([
      ...GENERIC_CATEGORIES.map(loadCategory),
      getYantras().catch(() => undefined),
      getPujaKits().catch(() => undefined),
    ]).then(() => undefined);
  }
  return pending;
}
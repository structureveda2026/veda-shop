import { isShopifyEnabled, storefront } from '../lib/shopify';
import { MOCK_PRODUCTS } from '../data/products';
import { PURPOSE_LIST } from '../data/purposeData';
import { RASHI_LIST } from '../data/rashiData';
import type { CategorySlug, Product } from '../types/ecommerce';
import type { RashiTile } from './rashiService';

/**
 * Everything the home page shows, in one place.
 *
 * WHERE THE DATA COMES FROM
 *  - Shopify connected (VITE_SHOPIFY_STORE_DOMAIN + VITE_SHOPIFY_STOREFRONT_TOKEN set):
 *    ONE Storefront API request pulls the products (bestselling collection) and every content
 *    block (Shopify metaobjects, listed under METAOBJECT_TYPES below). Nothing on the home page is
 *    hard-coded to a product, category, rashi, purpose or video — add / edit / hide an entry in the
 *    Shopify admin and the page follows.
 *  - Shopify NOT connected: the same shapes are built from the local demo data, so the page still
 *    renders during development.
 *
 * Copy defaults (the wording from the design spec) always apply when the admin hasn't filled
 * a field in, so a half-configured store never shows an empty heading.
 */

// ---------------------------------------------------------------------------
// Public shapes — components only ever see these, never a Shopify response
// ---------------------------------------------------------------------------

export type SectionStatus = 'live' | 'coming_soon';

export type SectionKey =
  | 'hero' | 'categories' | 'finder' | 'bestsellers' | 'rudraksha' | 'gemstones' | 'bracelets'
  | 'rashi' | 'purpose' | 'services' | 'kashi' | 'why' | 'video' | 'learn' | 'reviews'
  | 'social' | 'newsletter' | 'final';

/** Copy + settings for one band of the page. `status: 'coming_soon'` swaps the band for a "Coming Soon" note. */
export interface SectionContent {
  eyebrow?: string;
  title: string;
  description?: string;
  image?: string;
  status: SectionStatus;
  ctaLabel?: string;
  ctaHref?: string;
  secondaryLabel?: string;
  secondaryHref?: string;
  highlights: string[];
}

export interface TrustItem { id: string; title: string; subtitle?: string; icon: string }
export interface HomeCategory {
  id: string;
  /** Matches Product.category — a product only shows on the home page once its category is 'live'. */
  key: string;
  title: string;
  description?: string;
  image?: string;
  href: string;
  status: SectionStatus;
}
export interface FinderOption { id: string; title: string; ctaLabel: string; href: string; icon: string }
export interface PurposeTile { id: string; slug: string; name: string; tagline: string; icon: string }
export interface ValueItem { id: string; title: string; description: string; icon: string }
export interface LearnCard { id: string; eyebrow: string; title: string; description: string; href: string; icon: string }
export interface HomeVideo {
  id: string;
  title: string;
  poster?: string;
  /** Playable files, best first. Empty for an embed / poster-only card. */
  sources: { url: string; mimeType: string }[];
  embedUrl?: string;
  productHandle?: string;
  productTitle?: string;
}
export interface HomeReview {
  id: string;
  name: string;
  rating: number;
  comment: string;
  product: string;
  verified: boolean;
  image?: string;
}
export interface SocialTile { id: string; image: string; href?: string; alt: string }

export interface HomeContent {
  sections: Record<SectionKey, SectionContent>;
  trust: TrustItem[];
  categories: HomeCategory[];
  finder: FinderOption[];
  /** "Most Loved" — already limited to live categories (Rudraksha + Bracelets today). */
  products: Product[];
  rashi: RashiTile[];
  purposes: PurposeTile[];
  why: ValueItem[];
  videos: HomeVideo[];
  learn: LearnCard[];
  reviews: HomeReview[];
  social: SocialTile[];
}

// ---------------------------------------------------------------------------
// Shopify configuration
// ---------------------------------------------------------------------------

/** Shopify collection that feeds "Most Loved". Falls back to the store-wide BEST_SELLING list. */
const BESTSELLERS_COLLECTION_HANDLE = 'bestsellers';
const MOST_LOVED_LIMIT = 8;

/**
 * Metaobject definitions the admin creates once (Settings → Custom data → Metaobjects, with
 * "Storefront API access" switched on). Each entry is one row on the page; field keys are in
 * the map* functions below.
 */
const METAOBJECT_TYPES = {
  sections: 'home_section', // one entry per band — handle = the SectionKey (hero, rudraksha, gemstones…)
  categories: 'home_category',
  trust: 'home_trust',
  finder: 'home_finder',
  why: 'home_value',
  learn: 'home_learn',
  videos: 'home_video',
  reviews: 'home_review',
  social: 'home_social',
  purposes: 'purpose',
  rashi: 'rashi',
} as const;

const CACHE_MS = 5 * 60 * 1000;

// ---------------------------------------------------------------------------
// Small helpers
// ---------------------------------------------------------------------------

const slugify = (text: string): string =>
  text.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

const toNumber = (value: string | number | null | undefined, fallback = 0): number => {
  const n = typeof value === 'number' ? value : parseFloat(String(value ?? ''));
  return Number.isFinite(n) ? n : fallback;
};

/** Metaobject list fields arrive as a JSON array string; plain text may be comma / line separated. */
function parseList(value?: string): string[] | undefined {
  if (!value) return undefined;
  try {
    const parsed = JSON.parse(value);
    if (Array.isArray(parsed)) return parsed.map(String).map((s) => s.trim()).filter(Boolean);
  } catch {
    /* not JSON — treat as plain text */
  }
  const parts = value.split(/[\n,]/).map((s) => s.trim()).filter(Boolean);
  return parts.length ? parts : undefined;
}

const normalizeStatus = (value?: string): SectionStatus | undefined => {
  if (!value) return undefined;
  return /coming|soon|hidden|draft/i.test(value) ? 'coming_soon' : 'live';
};

// ---------------------------------------------------------------------------
// Metaobject reading
// ---------------------------------------------------------------------------

interface RawRef {
  image?: { url: string } | null;
  url?: string;
  sources?: { url: string; mimeType: string; height?: number }[];
  previewImage?: { url: string } | null;
  handle?: string;
  title?: string;
}
interface RawField { key: string; value: string | null; reference?: RawRef | null }
interface RawMetaobject { id: string; handle: string; fields: RawField[] }
interface RawMetaobjects { nodes: RawMetaobject[] }

interface Entry {
  id: string;
  handle: string;
  /** First non-empty text value among the given field keys. */
  str: (...keys: string[]) => string | undefined;
  /** Image from a file reference field (or a plain URL / path in a text field). */
  img: (...keys: string[]) => string | undefined;
  /** Product / Collection reference → its handle + title. */
  ref: (key: string) => { handle?: string; title?: string } | undefined;
  /** Shopify-hosted video file reference. */
  video: (key: string) => { sources: { url: string; mimeType: string }[]; poster?: string } | undefined;
}

function readEntry(node: RawMetaobject): Entry {
  const field = (key: string) => node.fields.find((f) => f.key === key);
  return {
    id: node.id,
    handle: node.handle,
    str: (...keys) => {
      for (const key of keys) {
        const value = field(key)?.value?.trim();
        if (value) return value;
      }
      return undefined;
    },
    img: (...keys) => {
      for (const key of keys) {
        const f = field(key);
        const fromRef = f?.reference?.image?.url || (f?.reference?.url && !f.reference.sources ? f.reference.url : undefined);
        if (fromRef) return fromRef;
        const text = f?.value?.trim();
        if (text && (text.startsWith('http') || text.startsWith('/'))) return text;
      }
      return undefined;
    },
    ref: (key) => {
      const ref = field(key)?.reference;
      return ref && (ref.handle || ref.title) ? { handle: ref.handle, title: ref.title } : undefined;
    },
    video: (key) => {
      const ref = field(key)?.reference;
      if (!ref?.sources?.length) return undefined;
      // mp4 first (tallest first), any other stream (HLS) last — the browser plays the first it supports.
      const files = ref.sources.filter((s) => s.mimeType === 'video/mp4').sort((a, b) => (b.height ?? 0) - (a.height ?? 0));
      const others = ref.sources.filter((s) => s.mimeType !== 'video/mp4');
      return {
        sources: [...files, ...others].map((s) => ({ url: s.url, mimeType: s.mimeType })),
        poster: ref.previewImage?.url,
      };
    },
  };
}

/** Entries in the order the admin arranged them (`sort_order` field, else Shopify's order). */
function readEntries(list?: RawMetaobjects | null): Entry[] {
  const nodes = list?.nodes ?? [];
  return nodes
    .map((node, index) => ({ entry: readEntry(node), index, order: toNumber(node.fields.find((f) => f.key === 'sort_order')?.value, NaN) }))
    .sort((a, b) => {
      const ao = Number.isNaN(a.order) ? a.index : a.order;
      const bo = Number.isNaN(b.order) ? b.index : b.order;
      return ao - bo;
    })
    .map((x) => x.entry);
}

// ---------------------------------------------------------------------------
// Local demo catalog (used only when Shopify isn't connected)
// ---------------------------------------------------------------------------

const demoProduct = (predicate: (p: Product) => boolean): Product | undefined => MOCK_PRODUCTS.find(predicate);
const demoImage = (predicate: (p: Product) => boolean): string | undefined => demoProduct(predicate)?.images[0];

const DEMO_IMAGES = {
  rudraksha: demoImage((p) => p.slug === '5-mukhi-rudraksha') ?? demoImage((p) => p.category === 'rudraksha'),
  bracelets: demoImage((p) => p.category === 'bracelets'),
  hero: '/images/home/hero-banner.jpg',
};

const interleave = <T,>(a: T[], b: T[]): T[] => {
  const out: T[] = [];
  for (let i = 0; i < Math.max(a.length, b.length); i++) {
    if (i < a.length) out.push(a[i]);
    if (i < b.length) out.push(b[i]);
  }
  return out;
};

function demoMostLoved(liveKeys: Set<string>): Product[] {
  const score = (p: Product) => (p.isBestseller ? 100000 : 0) + p.reviewCount * p.rating;
  const ranked = (key: string) =>
    MOCK_PRODUCTS.filter((p) => p.category === key).sort((a, b) => score(b) - score(a));
  const lists = Array.from(liveKeys).map(ranked);
  const merged = lists.reduce<Product[]>((acc, list) => interleave(acc, list), []);
  return merged.slice(0, MOST_LOVED_LIMIT);
}

const DEMO_REVIEWS: HomeReview[] = [
  { id: 'demo-r1', name: 'Aarav Sharma', rating: 5, verified: true, product: '7 Mukhi Rudraksha', comment: 'Received a genuine Nepalese bead with an official lab certificate. Highly trustworthy service.' },
  { id: 'demo-r2', name: 'Priya Patel', rating: 5, verified: true, product: 'Red Carnelian Bracelet', comment: 'The bracelet is stunning in person. Fast delivery across India and pristine packaging.' },
  { id: 'demo-r3', name: 'Rohan Deshmukh', rating: 5, verified: true, product: 'Gauri Shankar Rudraksha', comment: 'Bought it for our home mandir. The product page explained everything clearly and the bead arrived exactly as described.' },
  { id: 'demo-r4', name: 'Meera Nair', rating: 4, verified: true, product: '5 Mukhi Rudraksha Mala', comment: 'Good quality beads for daily japa. Delivery took a couple of days longer than expected, but the product is lovely.' },
];

function demoVideos(): HomeVideo[] {
  const pick = (title: string, product: Product | undefined): HomeVideo | null =>
    product ? { id: `demo-${slugify(title)}`, title, poster: product.images[0], sources: [], productHandle: product.slug, productTitle: product.title } : null;
  const rudraksha = MOCK_PRODUCTS.filter((p) => p.category === 'rudraksha');
  const bracelets = MOCK_PRODUCTS.filter((p) => p.category === 'bracelets');
  return [
    pick('Rudraksha close-up', rudraksha[4]),
    pick('Bracelet styling', bracelets[0]),
    pick('How to wear Rudraksha', rudraksha[6]),
    pick('Product unboxing', bracelets[2]),
  ].filter((v): v is HomeVideo => v !== null);
}

function demoSocial(): SocialTile[] {
  const rudraksha = MOCK_PRODUCTS.filter((p) => p.category === 'rudraksha');
  const bracelets = MOCK_PRODUCTS.filter((p) => p.category === 'bracelets');
  return interleave(rudraksha.slice(0, 3), bracelets.slice(0, 3)).map((p, i) => ({
    id: `demo-social-${i}`,
    image: p.images[0],
    alt: p.title,
  }));
}

// ---------------------------------------------------------------------------
// Defaults — the wording from the design spec
// ---------------------------------------------------------------------------

const section = (base: Partial<SectionContent> & { title: string }): SectionContent => ({
  status: 'live',
  highlights: [],
  ...base,
});

const DEFAULT_SECTIONS: Record<SectionKey, SectionContent> = {
  hero: section({
    eyebrow: 'A modern Vedic lifestyle store',
    title: 'Ancient Wisdom. Thoughtfully Crafted for Today.',
    description: 'Discover Rudraksha, spiritual bracelets and Vedic essentials selected for your Vedic journey.',
    image: DEMO_IMAGES.hero,
    ctaLabel: 'Shop Collection',
    ctaHref: '/shop',
    secondaryLabel: "Find What's Right for You",
    secondaryHref: '#find-your-product',
  }),
  categories: section({ eyebrow: 'Explore', title: 'Explore Veda Store' }),
  finder: section({
    eyebrow: 'Find Your Product',
    title: 'Not Sure What to Choose?',
    description: "Tell us where you are in your journey and we'll point you in the right direction.",
  }),
  bestsellers: section({
    eyebrow: 'Bestsellers',
    title: 'Most Loved',
    description: 'The pieces our customers return to again and again.',
    ctaLabel: 'View All',
    ctaHref: '/shop?filter=bestseller',
  }),
  rudraksha: section({
    eyebrow: 'Rudraksha',
    title: 'Discover Rudraksha',
    description:
      'Explore traditional Rudraksha beads from 1 to 14 Mukhi, along with malas, bracelets and special Rudraksha.',
    image: DEMO_IMAGES.rudraksha,
    ctaLabel: 'Explore Rudraksha',
    ctaHref: '/rudraksha',
    secondaryLabel: 'Find My Rudraksha',
    secondaryHref: '#find-your-product',
    highlights: ['1–14 Mukhi', 'Malas', 'Bracelets', 'Special Rudraksha'],
  }),
  // Coming soon for now. Flip `status` to "live" on the entry in Shopify (and add an image) and the
  // band below appears with this copy — no code change.
  gemstones: section({
    eyebrow: 'Gemstones',
    title: 'Discover Your Gemstone',
    description:
      'Explore Vedic gemstones and natural stones with detailed product information and expert guidance.',
    status: 'coming_soon',
    ctaLabel: 'Explore Gemstones',
    ctaHref: '/gemstones',
    secondaryLabel: 'Gemstone Recommendation',
    secondaryHref: '#find-your-product',
  }),
  bracelets: section({
    eyebrow: 'Bracelets',
    title: 'Wear Your Spirituality',
    description:
      'Discover Rudraksha, gemstone and crystal bracelets designed for everyday spiritual living.',
    image: DEMO_IMAGES.bracelets,
    ctaLabel: 'Shop Bracelets',
    ctaHref: '/collections/bracelets',
    highlights: ['Rudraksha', 'Gemstone', 'Crystal'],
  }),
  rashi: section({
    eyebrow: 'By Rashi',
    title: 'Find Products by Rashi',
    ctaLabel: 'View All Rashi',
    ctaHref: '/rashi',
  }),
  purpose: section({
    eyebrow: 'By Purpose',
    title: 'Choose by Intention',
    ctaLabel: 'Explore All',
    ctaHref: '/shop',
  }),
  services: section({
    eyebrow: 'Puja & Spiritual Services',
    title: 'More Than a Store',
    description: 'Traditional Vedic services performed from Kashi, booked online.',
    status: 'coming_soon',
    ctaLabel: 'Explore Vedic Services',
    ctaHref: '/collections/sawan-special-puja',
    highlights: ['Online Puja', 'Yagya', 'Homa / Havan', 'Japa', 'Path'],
  }),
  kashi: section({
    eyebrow: 'Kashi',
    title: 'From Kashi, With Devotion',
    description:
      'Connect with traditional Vedic practices through our services and spiritual offerings from Kashi.',
    status: 'coming_soon',
    ctaLabel: 'Explore Kashi Services',
    ctaHref: '/collections/sawan-special-puja',
  }),
  why: section({ eyebrow: 'Our Promise', title: 'Why Veda Store?' }),
  video: section({
    eyebrow: 'Watch',
    title: 'See It. Understand It. Choose Better.',
    ctaLabel: 'Watch More',
    ctaHref: '/videos',
  }),
  learn: section({
    eyebrow: 'Learn',
    title: 'Learn Before You Choose',
    ctaLabel: 'Explore Knowledge',
    ctaHref: '/blog',
  }),
  reviews: section({ eyebrow: 'Reviews', title: 'Trusted by Our Customers' }),
  social: section({ eyebrow: 'Instagram', title: 'Follow Veda Store', ctaLabel: 'Follow Us' }),
  newsletter: section({
    eyebrow: 'Newsletter',
    title: 'Stay Connected With Veda',
    description: 'Receive new arrivals, spiritual knowledge and special offers.',
  }),
  final: section({
    title: 'Begin Your Vedic Journey',
    description:
      'Explore products, discover traditional knowledge and connect with Vedic services from Veda Store.',
    ctaLabel: 'Shop Veda Store',
    ctaHref: '/shop',
    secondaryLabel: 'Talk to an Astrologer',
    secondaryHref: '/contact?subject=Vedic%20Astrology%20Consultation',
  }),
};

const DEFAULT_TRUST: TrustItem[] = [
  { id: 'authenticity', title: 'Authenticity', subtitle: 'Clear product information', icon: 'shield-check' },
  { id: 'quality', title: 'Quality Selection', subtitle: 'Chosen with care', icon: 'gem' },
  { id: 'certified', title: 'Certified & Lab Tested', subtitle: 'Verified authenticity', icon: 'award' },
  { id: 'packaging', title: 'Secure Packaging', subtitle: 'Safe delivery', icon: 'package' },
  { id: 'shipping', title: 'Free & Fast Shipping', subtitle: 'Pan-India delivery', icon: 'truck' },
  { id: 'payments', title: 'Secure Payments', subtitle: '100% safe checkout', icon: 'lock' },
  { id: 'guidance', title: 'Expert Guidance', subtitle: 'Vedic astrology support', icon: 'compass' },
  { id: 'support', title: '24/7 Customer Support', subtitle: "We're here to help", icon: 'headphones' },
  { id: 'loved', title: 'Loved by Customers', subtitle: 'Trusted by thousands', icon: 'star' },
];

const DEFAULT_CATEGORIES: HomeCategory[] = [
  { id: 'rudraksha', key: 'rudraksha', title: 'Rudraksha', description: 'Authentic Rudraksha & sacred beads', image: DEMO_IMAGES.rudraksha, href: '/rudraksha', status: 'live' },
  { id: 'gemstones', key: 'gemstones', title: 'Gemstones', description: 'Vedic & natural gemstone collection', href: '/gemstones', status: 'coming_soon' },
  { id: 'bracelets', key: 'bracelets', title: 'Bracelets', description: 'Rudraksha, gemstone & crystal bracelets', image: DEMO_IMAGES.bracelets, href: '/collections/bracelets', status: 'live' },
  { id: 'yantra', key: 'yantra', title: 'Yantra', description: 'Traditional sacred Yantras', href: '/collections/yantra', status: 'coming_soon' },
  { id: 'puja-samagri', key: 'puja-samagri', title: 'Puja Samagri', description: 'Essential products for your rituals', href: '/collections/puja-samagri', status: 'coming_soon' },
  { id: 'puja-yagya', key: 'puja-yagya', title: 'Puja & Yagya', description: 'Online Vedic services', href: '/collections/sawan-special-puja', status: 'coming_soon' },
];

const DEFAULT_FINDER: FinderOption[] = [
  { id: 'know', title: 'I Know What I Need', ctaLabel: 'Shop Products', href: '/shop', icon: 'shopping-bag' },
  { id: 'rashi', title: 'I Know My Rashi', ctaLabel: 'Explore by Rashi', href: '/rashi', icon: 'sparkles' },
  { id: 'purpose', title: 'I Have a Purpose', ctaLabel: 'Find by Purpose', href: '#shop-by-purpose', icon: 'target' },
  { id: 'guidance', title: 'I Need Guidance', ctaLabel: 'Talk to an Astrologer', href: '/contact?subject=Vedic%20Astrology%20Consultation', icon: 'headphones' },
];

const DEFAULT_WHY: ValueItem[] = [
  { id: 'authenticity', title: 'Authenticity', description: 'Clear product information.', icon: 'shield-check' },
  { id: 'selection', title: 'Thoughtful Selection', description: 'Products selected with quality and purpose in mind.', icon: 'gem' },
  { id: 'guidance', title: 'Expert Guidance', description: 'Vedic astrology guidance when you need it.', icon: 'compass' },
  { id: 'delivery', title: 'Secure Delivery', description: 'Carefully packed for safe delivery.', icon: 'package' },
  { id: 'transparency', title: 'Transparent Information', description: 'Product specifications, origin and certification where applicable.', icon: 'file-text' },
  { id: 'support', title: 'Support', description: 'Help before and after purchase.', icon: 'life-buoy' },
];

const DEFAULT_LEARN: LearnCard[] = [
  { id: 'rudraksha-guide', eyebrow: 'Guide', title: 'Rudraksha Guide', description: '1–14 Mukhi meanings, identification and traditional significance in one place.', href: '/guides/rudraksha', icon: 'book-open' },
  { id: 'authentic', eyebrow: 'Authenticity', title: 'How to Identify an Original Rudraksha', description: 'What to check before you buy, and how we verify each bead.', href: '/authenticity', icon: 'shield-check' },
  { id: 'jewellery', eyebrow: 'Guide', title: 'Spiritual Jewellery Guide', description: 'Choosing and caring for Rudraksha, gemstone and crystal bracelets.', href: '/blog', icon: 'gem' },
];

/** The 8 intentions from the spec, mapped to the purpose pages that already exist. */
const PURPOSE_LABELS: [slug: string, label: string][] = [
  ['protection', 'Protection'],
  ['peace', 'Peace'],
  ['meditation', 'Meditation'],
  ['career', 'Career'],
  ['wealth', 'Prosperity'],
  ['confidence-discipline', 'Confidence'],
  ['spiritual-growth', 'Spiritual Growth'],
  ['devotional-practice', 'Devotional Practice'],
];

function defaultPurposes(): PurposeTile[] {
  return PURPOSE_LABELS.flatMap(([slug, label]) => {
    const purpose = PURPOSE_LIST.find((p) => p.slug === slug);
    return purpose ? [{ id: purpose.id, slug, name: label, tagline: purpose.tagline, icon: purpose.icon }] : [];
  });
}

function defaultRashi(): RashiTile[] {
  return RASHI_LIST.map((r) => ({
    id: r.id,
    slug: r.slug,
    nameEn: r.nameEn,
    nameHi: r.nameHi,
    symbol: r.symbol,
    element: r.element,
    rulingPlanet: r.rulingPlanet,
    recommendedRudraksha: r.recommendedRudraksha,
  }));
}

function buildDefaults(withDemoCatalog: boolean): HomeContent {
  const categories = DEFAULT_CATEGORIES;
  const liveKeys = new Set(categories.filter((c) => c.status === 'live').map((c) => c.key));
  return {
    sections: DEFAULT_SECTIONS,
    trust: DEFAULT_TRUST,
    categories,
    finder: DEFAULT_FINDER,
    products: withDemoCatalog ? demoMostLoved(liveKeys) : [],
    rashi: defaultRashi(),
    purposes: defaultPurposes(),
    why: DEFAULT_WHY,
    videos: withDemoCatalog ? demoVideos() : [],
    learn: DEFAULT_LEARN,
    reviews: withDemoCatalog ? DEMO_REVIEWS : [],
    social: withDemoCatalog ? demoSocial() : [],
  };
}

// ---------------------------------------------------------------------------
// Shopify → home shapes
// ---------------------------------------------------------------------------

interface RawProduct {
  id: string;
  handle: string;
  title: string;
  description: string;
  productType: string;
  tags: string[];
  availableForSale: boolean;
  featuredImage?: { url: string } | null;
  images: { nodes: { url: string }[] };
  priceRange: { minVariantPrice: { amount: string } };
  compareAtPriceRange: { minVariantPrice: { amount: string } };
  rating?: { value: string } | null;
  ratingCount?: { value: string } | null;
}

/** Product.category the rest of the app understands, from Shopify's product type / tags. */
function categoryOf(productType: string, tags: string[]): CategorySlug {
  const type = slugify(productType);
  const hay = [type, ...tags.map(slugify)];
  if (hay.some((t) => t.startsWith('rudraksha'))) return 'rudraksha';
  if (hay.some((t) => t.startsWith('bracelet'))) return 'bracelets';
  return (type || 'spiritual-essentials') as CategorySlug;
}

/** Shopify's standard `reviews.rating` metafield is JSON ({"value":"4.5",…}); a plain number works too. */
function readRating(raw?: { value: string } | null): number {
  if (!raw?.value) return 0;
  try {
    const parsed = JSON.parse(raw.value);
    if (parsed && typeof parsed === 'object' && 'value' in parsed) return toNumber(parsed.value);
  } catch {
    /* plain number */
  }
  return toNumber(raw.value);
}

function mapProduct(raw: RawProduct): Product {
  const tags = (raw.tags ?? []).map((t) => t.toLowerCase());
  const price = toNumber(raw.priceRange.minVariantPrice.amount);
  const compare = toNumber(raw.compareAtPriceRange.minVariantPrice.amount);
  const compareAtPrice = compare > price ? compare : price;
  const images = raw.images.nodes.map((n) => n.url);
  if (!images.length && raw.featuredImage?.url) images.push(raw.featuredImage.url);
  const description = raw.description ?? '';

  return {
    id: raw.id,
    title: raw.title,
    slug: raw.handle, // the Shopify handle — cards link to /products/:handle
    category: categoryOf(raw.productType, tags),
    description,
    shortDescription: description.slice(0, 140),
    images,
    price,
    compareAtPrice,
    discount: compare > price ? Math.round((1 - price / compare) * 100) : 0,
    rating: readRating(raw.rating),
    reviewCount: Math.round(toNumber(raw.ratingCount?.value)),
    sku: '',
    stock: raw.availableForSale ? 99 : 0,
    tags,
    benefits: [],
    isBestseller: tags.includes('bestseller'),
    isNewArrival: tags.includes('new'),
    labCertified: tags.includes('certified') || tags.includes('lab-certified'),
    qualityTier: tags.includes('premium') ? 'Premium' : undefined,
    energizationNote: tags.includes('energized') ? 'Energized' : undefined,
  };
}

function mapSections(entries: Entry[]): Record<SectionKey, SectionContent> {
  const merged = { ...DEFAULT_SECTIONS };
  for (const e of entries) {
    const key = e.handle as SectionKey;
    const base = DEFAULT_SECTIONS[key];
    if (!base) continue; // an entry for a band this page doesn't have
    merged[key] = {
      eyebrow: e.str('eyebrow') ?? base.eyebrow,
      title: e.str('title') ?? base.title,
      description: e.str('description') ?? base.description,
      image: e.img('image') ?? base.image,
      status: normalizeStatus(e.str('status')) ?? base.status,
      ctaLabel: e.str('cta_label') ?? base.ctaLabel,
      ctaHref: e.str('cta_link') ?? base.ctaHref,
      secondaryLabel: e.str('secondary_label') ?? base.secondaryLabel,
      secondaryHref: e.str('secondary_link') ?? base.secondaryHref,
      highlights: parseList(e.str('highlights')) ?? base.highlights,
    };
  }
  return merged;
}

function mapCategories(entries: Entry[]): HomeCategory[] {
  if (!entries.length) return DEFAULT_CATEGORIES;
  return entries.map((e) => {
    const title = e.str('title', 'name') ?? e.handle;
    const collection = e.ref('collection');
    const key = slugify(e.str('key') ?? collection?.handle ?? title);
    const fallback = DEFAULT_CATEGORIES.find((c) => c.key === key);
    return {
      id: e.handle,
      key,
      title,
      description: e.str('description'),
      image: e.img('image') ?? fallback?.image,
      href: e.str('link') ?? (collection?.handle ? `/collections/${collection.handle}` : fallback?.href ?? '/shop'),
      status: normalizeStatus(e.str('status')) ?? 'live',
    };
  });
}

function mapList<T>(entries: Entry[], fallback: T[], map: (e: Entry) => T | null): T[] {
  if (!entries.length) return fallback;
  const mapped = entries.map(map).filter((x): x is T => x !== null);
  return mapped.length ? mapped : fallback;
}

function mapRashi(entries: Entry[]): RashiTile[] {
  return mapList(entries, defaultRashi(), (e) => {
    const nameEn = e.str('rashi_name_en', 'name_en');
    if (!nameEn) return null;
    return {
      id: e.handle,
      slug: e.handle,
      nameEn,
      nameHi: e.str('rashi_name_hi', 'name_hi') ?? nameEn,
      symbol: e.str('symbol') ?? '',
      element: e.str('element') ?? '',
      rulingPlanet: e.str('ruling_planet') ?? '',
      recommendedRudraksha: e.str('recommended_rudraksha') ?? '',
    };
  });
}

function mapPurposes(entries: Entry[]): PurposeTile[] {
  return mapList(entries, defaultPurposes(), (e) => {
    const name = e.str('name', 'title');
    if (!name) return null;
    return {
      id: e.handle,
      slug: e.handle,
      name,
      tagline: e.str('tagline', 'description') ?? '',
      icon: e.str('icon') ?? 'sparkles',
    };
  });
}

function buildFromShopify(data: ShopifyHomeResponse): HomeContent {
  const categories = mapCategories(readEntries(data.categories));
  const liveKeys = new Set(categories.filter((c) => c.status === 'live').map((c) => c.key));
  const onlyLive = (list: Product[]) => list.filter((p) => liveKeys.has(p.category));

  const fromCollection = onlyLive((data.collection?.products.nodes ?? []).map(mapProduct));
  const fromStore = onlyLive((data.topProducts?.nodes ?? []).map(mapProduct));
  const products = (fromCollection.length ? fromCollection : fromStore).slice(0, MOST_LOVED_LIMIT);

  return {
    sections: mapSections(readEntries(data.sections)),
    trust: mapList(readEntries(data.trust), DEFAULT_TRUST, (e) => {
      const title = e.str('title');
      return title ? { id: e.handle, title, subtitle: e.str('subtitle', 'description'), icon: e.str('icon') ?? 'shield-check' } : null;
    }),
    categories,
    finder: mapList(readEntries(data.finder), DEFAULT_FINDER, (e) => {
      const title = e.str('title');
      const href = e.str('link');
      return title && href ? { id: e.handle, title, href, ctaLabel: e.str('cta_label') ?? 'Explore', icon: e.str('icon') ?? 'sparkles' } : null;
    }),
    products,
    rashi: mapRashi(readEntries(data.rashi)),
    purposes: mapPurposes(readEntries(data.purposes)),
    why: mapList(readEntries(data.why), DEFAULT_WHY, (e) => {
      const title = e.str('title');
      return title ? { id: e.handle, title, description: e.str('description') ?? '', icon: e.str('icon') ?? 'sparkles' } : null;
    }),
    // Merchandising content has no local default in production: nothing entered = section hidden.
    videos: readEntries(data.videos).flatMap((e): HomeVideo[] => {
      const title = e.str('title');
      const file = e.video('video');
      const embedUrl = e.str('embed_url');
      const poster = e.img('poster') ?? file?.poster;
      if (!title || (!file && !embedUrl && !poster)) return [];
      const product = e.ref('product');
      return [{ id: e.handle, title, poster, sources: file?.sources ?? [], embedUrl, productHandle: product?.handle, productTitle: product?.title }];
    }),
    learn: mapList(readEntries(data.learn), DEFAULT_LEARN, (e) => {
      const title = e.str('title');
      const href = e.str('link');
      return title && href ? { id: e.handle, title, href, eyebrow: e.str('eyebrow') ?? 'Guide', description: e.str('description') ?? '', icon: e.str('icon') ?? 'book-open' } : null;
    }),
    reviews: readEntries(data.reviews).flatMap((e): HomeReview[] => {
      const name = e.str('name', 'customer_name');
      const comment = e.str('comment', 'review');
      if (!name || !comment) return [];
      return [{
        id: e.handle,
        name,
        comment,
        rating: Math.min(5, Math.max(1, Math.round(toNumber(e.str('rating'), 5)))),
        product: e.str('product_name') ?? e.ref('product')?.title ?? '',
        verified: (e.str('verified') ?? 'true').toLowerCase() !== 'false',
        image: e.img('image'),
      }];
    }),
    social: readEntries(data.social).flatMap((e): SocialTile[] => {
      const image = e.img('image');
      return image ? [{ id: e.handle, image, href: e.str('link'), alt: e.str('title') ?? 'Veda Store on Instagram' }] : [];
    }),
  };
}

// ---------------------------------------------------------------------------
// The single Storefront API request
// ---------------------------------------------------------------------------

interface ShopifyHomeResponse {
  sections?: RawMetaobjects;
  categories?: RawMetaobjects;
  trust?: RawMetaobjects;
  finder?: RawMetaobjects;
  why?: RawMetaobjects;
  learn?: RawMetaobjects;
  videos?: RawMetaobjects;
  reviews?: RawMetaobjects;
  social?: RawMetaobjects;
  purposes?: RawMetaobjects;
  rashi?: RawMetaobjects;
  collection?: { products: { nodes: RawProduct[] } } | null;
  topProducts?: { nodes: RawProduct[] };
}

const HOME_QUERY = `
  fragment HomeMeta on Metaobject {
    id
    handle
    fields {
      key
      value
      reference {
        ... on MediaImage { image { url } }
        ... on GenericFile { url }
        ... on Video { sources { url mimeType height } previewImage { url } }
        ... on Collection { handle title }
        ... on Product { handle title }
      }
    }
  }

  fragment HomeProduct on Product {
    id
    handle
    title
    description
    productType
    tags
    availableForSale
    featuredImage { url }
    images(first: 3) { nodes { url } }
    priceRange { minVariantPrice { amount } }
    compareAtPriceRange { minVariantPrice { amount } }
    rating: metafield(namespace: "reviews", key: "rating") { value }
    ratingCount: metafield(namespace: "reviews", key: "rating_count") { value }
  }

  query HomeContent {
    sections: metaobjects(type: "${METAOBJECT_TYPES.sections}", first: 40) { nodes { ...HomeMeta } }
    categories: metaobjects(type: "${METAOBJECT_TYPES.categories}", first: 12) { nodes { ...HomeMeta } }
    trust: metaobjects(type: "${METAOBJECT_TYPES.trust}", first: 6) { nodes { ...HomeMeta } }
    finder: metaobjects(type: "${METAOBJECT_TYPES.finder}", first: 6) { nodes { ...HomeMeta } }
    why: metaobjects(type: "${METAOBJECT_TYPES.why}", first: 8) { nodes { ...HomeMeta } }
    learn: metaobjects(type: "${METAOBJECT_TYPES.learn}", first: 6) { nodes { ...HomeMeta } }
    videos: metaobjects(type: "${METAOBJECT_TYPES.videos}", first: 8) { nodes { ...HomeMeta } }
    reviews: metaobjects(type: "${METAOBJECT_TYPES.reviews}", first: 10) { nodes { ...HomeMeta } }
    social: metaobjects(type: "${METAOBJECT_TYPES.social}", first: 6) { nodes { ...HomeMeta } }
    purposes: metaobjects(type: "${METAOBJECT_TYPES.purposes}", first: 12) { nodes { ...HomeMeta } }
    rashi: metaobjects(type: "${METAOBJECT_TYPES.rashi}", first: 12) { nodes { ...HomeMeta } }
    collection(handle: "${BESTSELLERS_COLLECTION_HANDLE}") {
      products(first: 24, sortKey: BEST_SELLING) { nodes { ...HomeProduct } }
    }
    topProducts: products(first: 24, sortKey: BEST_SELLING) { nodes { ...HomeProduct } }
  }
`;

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

let cache: { at: number; data: HomeContent } | null = null;

/**
 * What the page can render immediately, before any network call: the spec copy plus — only when
 * Shopify isn't connected — the local demo catalog. Once Shopify is connected the product-driven
 * bands start empty (skeletons) and fill in when getHomeContent() resolves.
 */
export function getInitialHomeContent(): HomeContent {
  if (cache && Date.now() - cache.at < CACHE_MS) return cache.data;
  return buildDefaults(!isShopifyEnabled());
}

export async function getHomeContent(): Promise<HomeContent> {
  if (cache && Date.now() - cache.at < CACHE_MS) return cache.data;

  if (!isShopifyEnabled()) {
    const data = buildDefaults(true);
    cache = { at: Date.now(), data };
    return data;
  }

  try {
    const response = await storefront<ShopifyHomeResponse>(HOME_QUERY);
    const data = buildFromShopify(response);
    cache = { at: Date.now(), data };
    return data;
  } catch (error) {
    // Graceful degradation, same as the rest of the catalog services: the page keeps its spec
    // copy, product-driven bands simply stay empty. Not cached, so the next visit retries.
    console.warn('[Home] Could not load home content from Shopify', error);
    return buildDefaults(false);
  }
}

/**
 * Newsletter signup. Shopify's Storefront API has no "subscribe an email" call, so point
 * VITE_NEWSLETTER_ENDPOINT at whatever collects emails for the store (a Klaviyo / Mailchimp form
 * endpoint, a Shopify Flow webhook, a small serverless function…). It receives { email, source }.
 */
export async function subscribeToNewsletter(email: string): Promise<void> {
  const env = ((import.meta as unknown as { env?: Record<string, string | boolean | undefined> }).env ?? {});
  const endpoint = typeof env.VITE_NEWSLETTER_ENDPOINT === 'string' ? env.VITE_NEWSLETTER_ENDPOINT : '';

  if (!endpoint) {
    if (env.DEV) {
      console.info('[Newsletter] VITE_NEWSLETTER_ENDPOINT is not set — dev mode, signup not stored:', email);
      return;
    }
    throw new Error('Newsletter endpoint is not configured');
  }

  const res = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, source: 'home' }),
  });
  if (!res.ok) throw new Error(`Newsletter signup failed (${res.status})`);
}
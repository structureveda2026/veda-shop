import type { Product } from '../types/ecommerce';
import { resolveYantraImages } from './yantraImages';

/**
 * YANTRAS — catalog data.
 *
 * DEMO data in the exact shape the store gets from Shopify, so nothing on /yantra changes when the real
 * catalog is connected:
 *
 *   • YANTRA_PRODUCTS → a Shopify product in the `yantra` collection
 *                       (handle = slug, `subcategory` = `custom.yantra_type` metafield / a tag matching a
 *                        yantra subcategory slug in data/categories.ts)
 *   • YANTRA_META     → the product's metafields (namespace `custom`):
 *        yantra_type        single_line_text_field   (subcategory slug, e.g. "shree-yantra")
 *        yantra_deity       single_line_text_field   ("Goddess Mahalakshmi")
 *        yantra_material    single_line_text_field   (id from MATERIALS in yantraCatalogService.ts)
 *        yantra_purposes    list.single_line_text_field (ids from YANTRA_PURPOSES in yantraCatalogService.ts)
 *        yantra_mantra      single_line_text_field   (beej / main mantra)
 *        yantra_direction   single_line_text_field   ("North-East")
 *        yantra_day         single_line_text_field   ("Friday")
 *        yantra_size        single_line_text_field   ("4 × 4 inch")
 *        yantra_includes    list.single_line_text_field (what comes in the box)
 *
 * Adding a NEW yantra = one row in ROWS below (or one product in Shopify). The page, finder, explorer and
 * counts all read from the catalog — never from hand-written lists.
 *
 * Wording rule (same as the rest of the store): traditional-association language only — no guaranteed
 * outcomes, no medical claims. Prices / ratings are placeholders like every other mock product.
 */

// ---------------------------------------------------------------------------
// Generated sacred-geometry art (pure SVG data-URI — no external request, no font needed).
// Concentric rings → 16 + 8 lotus petals → interlocking triangles → bindu.
// ---------------------------------------------------------------------------
export type YantraAccent = 'copper' | 'gold' | 'silver' | 'brass' | 'crystal' | 'ashta';

const ACCENT_COLOR: Record<YantraAccent, { main: string; bg1: string; bg2: string }> = {
  copper: { main: '#B4651F', bg1: '#FFF8EE', bg2: '#F2DFC2' },
  gold: { main: '#C98A14', bg1: '#FFFBF0', bg2: '#F6E6B8' },
  silver: { main: '#6F7C8C', bg1: '#FAFBFC', bg2: '#E3E8EE' },
  brass: { main: '#A47A18', bg1: '#FFFCF0', bg2: '#EFE2B5' },
  crystal: { main: '#6A8FB0', bg1: '#FAFDFF', bg2: '#DCEAF4' },
  ashta: { main: '#7B4A2A', bg1: '#FFF9F2', bg2: '#E9D4BE' }
};

const triangle = (cx: number, cy: number, r: number, up: boolean) => {
  const pts = [0, 1, 2].map((i) => {
    const a = ((up ? -90 : 90) + i * 120) * (Math.PI / 180);
    return `${(cx + r * Math.cos(a)).toFixed(1)},${(cy + r * Math.sin(a)).toFixed(1)}`;
  });
  return pts.join(' ');
};

export function yantraArt(accent: YantraAccent): string {
  const { main, bg1, bg2 } = ACCENT_COLOR[accent];
  const outer = Array.from({ length: 16 }, (_, i) =>
    `<ellipse cx="300" cy="186" rx="20" ry="52" fill="${main}" fill-opacity=".14" stroke="${main}" stroke-opacity=".35" stroke-width="1.2" transform="rotate(${i * 22.5} 300 300)"/>`
  ).join('');
  const inner = Array.from({ length: 8 }, (_, i) =>
    `<ellipse cx="300" cy="226" rx="16" ry="36" fill="${main}" fill-opacity=".2" stroke="${main}" stroke-opacity=".45" stroke-width="1.2" transform="rotate(${i * 45 + 22.5} 300 300)"/>`
  ).join('');
  const tris =
    [150, 128, 106, 84].map((r, i) => `<polygon points="${triangle(300, 306, r, true)}" fill="none" stroke="${main}" stroke-opacity="${0.75 - i * 0.08}" stroke-width="2"/>`).join('') +
    [140, 118, 96, 74, 52].map((r, i) => `<polygon points="${triangle(300, 294, r, false)}" fill="none" stroke="${main}" stroke-opacity="${0.75 - i * 0.07}" stroke-width="2"/>`).join('');
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600">` +
    `<defs><radialGradient id="g" cx="50%" cy="45%" r="75%"><stop offset="0" stop-color="${bg1}"/><stop offset="1" stop-color="${bg2}"/></radialGradient></defs>` +
    `<rect width="600" height="600" fill="url(#g)"/>` +
    `<rect x="40" y="40" width="520" height="520" fill="none" stroke="${main}" stroke-opacity=".5" stroke-width="3"/>` +
    `<rect x="62" y="62" width="476" height="476" fill="none" stroke="${main}" stroke-opacity=".3" stroke-width="1.5"/>` +
    `<circle cx="300" cy="300" r="238" fill="none" stroke="${main}" stroke-opacity=".4" stroke-width="2"/>` +
    `<circle cx="300" cy="300" r="214" fill="none" stroke="${main}" stroke-opacity=".25" stroke-width="1"/>` +
    outer + inner +
    `<circle cx="300" cy="300" r="166" fill="none" stroke="${main}" stroke-opacity=".5" stroke-width="2"/>` +
    tris +
    `<circle cx="300" cy="300" r="9" fill="${main}"/>` +
    `</svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

// ---------------------------------------------------------------------------
// Per-type traditional information (each row below can override any of it).
// ---------------------------------------------------------------------------
interface TypeInfo {
  deity: string;
  mantra: string;
  direction: string;
  day: string;
  purposes: string[];
}

const TYPE_INFO: Record<string, TypeInfo> = {
  'shree-yantra': {
    deity: 'Goddess Mahalakshmi',
    mantra: 'Om Shreem Hreem Shreem Kamale Kamalalaye Prasida Prasida Shreem Hreem Shreem Om Mahalakshmyai Namah',
    direction: 'North-East or East of the puja space',
    day: 'Friday',
    purposes: ['wealth', 'peace', 'devotion']
  },
  'kuber-yantra': {
    deity: 'Lord Kubera',
    mantra: 'Om Yakshaya Kuberaya Vaishravanaya Dhanadhanyadhipataye Dhanadhanyasamriddhim Me Dehi Dapaya Swaha',
    direction: 'North',
    day: 'Thursday or Dhanteras',
    purposes: ['wealth', 'career']
  },
  'mahamrityunjay-yantra': {
    deity: 'Lord Shiva',
    mantra: 'Om Tryambakam Yajamahe Sugandhim Pushtivardhanam Urvarukamiva Bandhanan Mrityor Mukshiya Maamritat',
    direction: 'North-East or East of the puja space',
    day: 'Monday',
    purposes: ['protection', 'peace', 'devotion']
  },
  'navgraha-yantra': {
    deity: 'Navagraha (nine planets)',
    mantra: 'Om Navagrahaya Namah',
    direction: 'East of the puja space',
    day: 'Saturday or as per your pandit',
    purposes: ['planetary', 'peace']
  },
  'vastu-yantra': {
    deity: 'Vastu Purusha',
    mantra: 'Om Vastu Purushaya Namah',
    direction: 'Main entrance or centre of the home',
    day: 'An auspicious muhurat (ask your pandit)',
    purposes: ['vastu', 'peace', 'protection']
  },
  'durga-yantra': {
    deity: 'Maa Durga',
    mantra: 'Om Dum Durgayai Namah',
    direction: 'North-East of the puja space',
    day: 'Tuesday, Friday or Navratri',
    purposes: ['protection', 'devotion']
  },
  'saraswati-yantra': {
    deity: 'Maa Saraswati',
    mantra: 'Om Aim Saraswatyai Namah',
    direction: 'North-East or the study area',
    day: 'Vasant Panchami or Thursday',
    purposes: ['knowledge', 'career']
  },
  'ganesh-yantra': {
    deity: 'Lord Ganesha',
    mantra: 'Om Gam Ganapataye Namah',
    direction: 'Main entrance or North-East',
    day: 'Wednesday',
    purposes: ['career', 'peace', 'devotion']
  }
};

// ---------------------------------------------------------------------------
// Builder — keeps every yantra consistent and computes the discount %, so a price edit
// can never leave a stale "% OFF" badge behind.
// ---------------------------------------------------------------------------
interface YantraInput {
  n: number;
  title: string;
  slug: string;
  subcategory: string;
  material: string; // id from MATERIALS in yantraCatalogService.ts
  materialLabel: string;
  size: string;
  weight: string;
  short: string;
  description: string;
  price: number;
  compareAt: number;
  rating: number;
  reviews: number;
  accent: YantraAccent;
  tags: string[];
  bestseller?: boolean;
  isNew?: boolean;
  /** Optional overrides of the per-type defaults above. */
  deity?: string;
  mantra?: string;
  direction?: string;
  day?: string;
  purposes?: string[];
  includes?: string[];
}

const DEFAULT_INCLUDES = ['Yantra plate', 'Velvet pouch / gift box', 'Placement & worship guide'];

const toProduct = (y: YantraInput): Product => ({
  id: `prod-yantra-${String(y.n).padStart(2, '0')}`,
  title: y.title,
  slug: y.slug,
  category: 'yantra',
  subcategory: y.subcategory,
  description: y.description,
  shortDescription: y.short,
  images: resolveYantraImages(y.slug, yantraArt(y.accent)),
  price: y.price,
  compareAtPrice: y.compareAt,
  discount: Math.round(((y.compareAt - y.price) / y.compareAt) * 100),
  rating: y.rating,
  reviewCount: y.reviews,
  sku: `VS-YN-${String(y.n).padStart(3, '0')}`,
  stock: 30,
  sizes: [y.size],
  material: y.materialLabel,
  weight: y.weight,
  dimensions: y.size,
  tags: ['yantra', 'sacred geometry', y.materialLabel.toLowerCase(), ...y.tags],
  benefits: [
    'Precisely engraved sacred geometry',
    `Made in ${y.materialLabel}`,
    'Placement & worship guide included',
    'Energization by a pandit available on request'
  ],
  careInstructions:
    'Wipe gently with a soft dry cloth. Keep on a clean, raised surface in your puja space. Avoid harsh chemicals and moisture.',
  shippingInformation: 'Ships across India in secure, padded packaging.',
  returnInformation: 'Please refer to our Returns & Refund policy for eligibility of yantra items.',
  energizationNote: 'Pran Pratishtha / energization by a pandit is available on request — contact us before ordering.',
  labCertified: false,
  isBestseller: y.bestseller ?? false,
  isNewArrival: y.isNew ?? false,
  faqs: [
    {
      question: 'Is this yantra energized?',
      answer:
        'Yantras are shipped clean and ready for worship. If you would like a pandit to energize it (Pran Pratishtha) before dispatch, contact us when ordering.'
    },
    {
      question: 'Where should I place it?',
      answer:
        'The recommended direction, best day and mantra are listed on this page. Ask our team or a pandit if you are unsure about the right spot in your home.'
    }
  ]
});

const toMeta = (y: YantraInput): YantraMeta => {
  const info = TYPE_INFO[y.subcategory];
  return {
    slug: y.slug,
    deity: y.deity ?? info.deity,
    material: y.material,
    purposes: y.purposes ?? info.purposes,
    mantra: y.mantra ?? info.mantra,
    direction: y.direction ?? info.direction,
    day: y.day ?? info.day,
    size: y.size,
    includes: y.includes ?? DEFAULT_INCLUDES
  };
};

export interface YantraMeta {
  slug: string;
  /** Deity / planet the yantra is dedicated to. */
  deity: string;
  /** Id from MATERIALS in yantraCatalogService.ts */
  material: string;
  /** Ids from YANTRA_PURPOSES in yantraCatalogService.ts */
  purposes: string[];
  mantra: string;
  direction: string;
  day: string;
  size: string;
  /** What comes in the box. */
  includes: string[];
}

const ROWS: YantraInput[] = [
  {
    n: 1, title: 'Shree Yantra – Pure Copper', slug: 'shree-yantra-copper', subcategory: 'shree-yantra',
    material: 'copper', materialLabel: 'Pure Copper', size: '4 × 4 inch', weight: '190g', accent: 'copper',
    short: 'Precisely engraved copper Shree Yantra for the home puja space — a symbol of abundance in Vedic tradition.',
    description:
      'The Shree Yantra is the most revered yantra of Goddess Mahalakshmi, drawn as nine interlocking triangles around a central bindu. This pure copper plate carries the geometry in fine, crisp engraving and is made for worship in the home mandir or office.',
    price: 1299, compareAt: 1799, rating: 4.9, reviews: 342, tags: ['shree yantra', 'lakshmi', 'diwali', 'friday', 'bestseller'], bestseller: true
  },
  {
    n: 2, title: 'Shree Yantra – 24K Gold Plated', slug: 'shree-yantra-gold-plated', subcategory: 'shree-yantra',
    material: 'gold-plated', materialLabel: '24K Gold Plated Copper', size: '6 × 6 inch', weight: '340g', accent: 'gold',
    short: 'A larger Shree Yantra on copper with 24K gold plating — a gift-worthy centrepiece for the mandir.',
    description:
      'A 6-inch Shree Yantra on a heavy copper base with a 24K gold-plated finish, presented in a gift box. A popular choice for housewarmings, Diwali and Dhanteras.',
    price: 3499, compareAt: 4499, rating: 4.9, reviews: 187, tags: ['shree yantra', 'lakshmi', 'dhanteras', 'gifting', 'bestseller'], bestseller: true
  },
  {
    n: 3, title: 'Shree Yantra – Sphatik (Crystal)', slug: 'shree-yantra-sphatik', subcategory: 'shree-yantra',
    material: 'sphatik', materialLabel: 'Sphatik (Clear Quartz)', size: '3 inch base', weight: '260g', accent: 'crystal',
    short: 'Hand-carved Shree Meru in clear quartz — the three-dimensional form of the Shree Yantra.',
    description:
      'The Shree Meru is the raised, three-dimensional form of the Shree Yantra. This piece is carved in Sphatik (clear quartz), traditionally associated with calm and purity, and comes with a wooden base.',
    price: 2799, compareAt: 3499, rating: 4.8, reviews: 96, tags: ['shree meru', 'sphatik', 'crystal', 'lakshmi']
  },
  {
    n: 4, title: 'Shree Yantra – Silver (92.5)', slug: 'shree-yantra-silver', subcategory: 'shree-yantra',
    material: 'silver', materialLabel: 'Silver (92.5)', size: '3 × 3 inch', weight: '60g', accent: 'silver',
    short: 'A compact 92.5 silver Shree Yantra, ideal for the home mandir, locker or office desk.',
    description:
      'A finely engraved Shree Yantra on 92.5 silver. Compact enough to keep in a locker, office desk or travel altar, and traditionally preferred for its purity.',
    price: 5499, compareAt: 6999, rating: 4.9, reviews: 64, tags: ['shree yantra', 'silver', 'gifting', 'lakshmi'], isNew: true
  },
  {
    n: 5, title: 'Kuber Yantra – Pure Copper', slug: 'kuber-yantra-copper', subcategory: 'kuber-yantra',
    material: 'copper', materialLabel: 'Pure Copper', size: '4 × 4 inch', weight: '180g', accent: 'copper',
    short: 'Copper Kuber Yantra with the traditional numeric grid, kept in the North for financial prosperity.',
    description:
      'The Kuber Yantra is dedicated to Lord Kubera, the guardian of wealth in Vedic tradition, and is traditionally kept in the North direction of the home or shop. Engraved on pure copper.',
    price: 899, compareAt: 1199, rating: 4.8, reviews: 211, tags: ['kuber', 'dhanteras', 'wealth', 'bestseller'], bestseller: true
  },
  {
    n: 6, title: 'Kuber Yantra – 24K Gold Plated', slug: 'kuber-yantra-gold-plated', subcategory: 'kuber-yantra',
    material: 'gold-plated', materialLabel: '24K Gold Plated Copper', size: '4 × 4 inch', weight: '190g', accent: 'gold',
    short: 'Gold-plated Kuber Yantra in a gift box — popular for Dhanteras and new business beginnings.',
    description:
      'A Kuber Yantra with a 24K gold-plated finish, presented in a gift box. A thoughtful gift for a new shop, office or Dhanteras.',
    price: 2499, compareAt: 3299, rating: 4.8, reviews: 88, tags: ['kuber', 'gold plated', 'dhanteras', 'gifting']
  },
  {
    n: 7, title: 'Mahamrityunjay Yantra – Pure Copper', slug: 'mahamrityunjay-yantra-copper', subcategory: 'mahamrityunjay-yantra',
    material: 'copper', materialLabel: 'Pure Copper', size: '4 × 4 inch', weight: '185g', accent: 'copper',
    short: 'Copper yantra of Lord Shiva\'s Mahamrityunjay mantra, kept for daily worship and a sense of protection.',
    description:
      'The Mahamrityunjay Yantra is traditionally worshipped by devotees of Lord Shiva alongside the Mahamrityunjay mantra, for a sense of protection and peace. Engraved on pure copper.',
    price: 999, compareAt: 1399, rating: 4.9, reviews: 258, tags: ['mahamrityunjay', 'shiva', 'sawan', 'monday', 'bestseller'], bestseller: true
  },
  {
    n: 8, title: 'Navgraha Yantra – Pure Copper', slug: 'navgraha-yantra-copper', subcategory: 'navgraha-yantra',
    material: 'copper', materialLabel: 'Pure Copper', size: '5 × 5 inch', weight: '260g', accent: 'copper',
    short: 'A single plate carrying the nine planetary yantras, used in traditional Navagraha puja.',
    description:
      'The Navgraha Yantra brings the nine planets (Surya, Chandra, Mangal, Budh, Guru, Shukra, Shani, Rahu and Ketu) together on one copper plate, used in traditional Navagraha puja. For guidance based on your birth chart, please consult an astrologer.',
    price: 1499, compareAt: 1999, rating: 4.8, reviews: 143, tags: ['navgraha', 'navagraha', 'graha shanti', 'planets']
  },
  {
    n: 9, title: 'Navgraha Yantra – Ashtadhatu', slug: 'navgraha-yantra-ashtadhatu', subcategory: 'navgraha-yantra',
    material: 'ashtadhatu', materialLabel: 'Ashtadhatu (8 metals)', size: '5 × 5 inch', weight: '420g', accent: 'ashta',
    short: 'Navgraha Yantra cast in Ashtadhatu, the traditional eight-metal alloy.',
    description:
      'Cast in Ashtadhatu — the traditional alloy of eight metals — this Navgraha Yantra is a premium choice for a permanent mandir installation.',
    price: 3999, compareAt: 4999, rating: 4.9, reviews: 52, tags: ['navgraha', 'ashtadhatu', 'premium', 'graha shanti'], isNew: true
  },
  {
    n: 10, title: 'Shani Yantra – Pure Copper', slug: 'shani-yantra-copper', subcategory: 'navgraha-yantra',
    material: 'copper', materialLabel: 'Pure Copper', size: '3 × 3 inch', weight: '110g', accent: 'copper',
    short: 'Single-planet yantra of Shani (Saturn), worshipped on Saturdays in Vedic tradition.',
    description:
      'The Shani Yantra is dedicated to Lord Shani and is traditionally worshipped on Saturdays with the Shani beej mantra. Engraved on pure copper.',
    deity: 'Lord Shani (Saturn)', mantra: 'Om Praam Preem Praum Sah Shanaischaraya Namah', direction: 'West', day: 'Saturday',
    purposes: ['planetary', 'protection'],
    price: 799, compareAt: 1099, rating: 4.7, reviews: 119, tags: ['shani', 'saturn', 'saturday', 'planets']
  },
  {
    n: 11, title: 'Surya Yantra – Pure Copper', slug: 'surya-yantra-copper', subcategory: 'navgraha-yantra',
    material: 'copper', materialLabel: 'Pure Copper', size: '3 × 3 inch', weight: '110g', accent: 'copper',
    short: 'Single-planet yantra of Surya (Sun), worshipped on Sundays at sunrise.',
    description:
      'The Surya Yantra is dedicated to Surya Dev and is traditionally worshipped on Sunday mornings with the Surya beej mantra. Engraved on pure copper.',
    deity: 'Surya Dev (Sun)', mantra: 'Om Hraam Hreem Hraum Sah Suryaya Namah', direction: 'East', day: 'Sunday',
    purposes: ['planetary', 'career'],
    price: 799, compareAt: 1099, rating: 4.7, reviews: 97, tags: ['surya', 'sun', 'sunday', 'planets']
  },
  {
    n: 12, title: 'Guru (Brihaspati) Yantra – Brass', slug: 'guru-yantra-brass', subcategory: 'navgraha-yantra',
    material: 'brass', materialLabel: 'Brass', size: '3 × 3 inch', weight: '130g', accent: 'brass',
    short: 'Single-planet yantra of Guru (Jupiter), worshipped on Thursdays.',
    description:
      'The Guru Yantra is dedicated to Brihaspati, the planet of wisdom and learning in Vedic astrology, and is traditionally worshipped on Thursdays. Cast in brass.',
    deity: 'Brihaspati (Jupiter)', mantra: 'Om Graam Greem Graum Sah Gurave Namah', direction: 'North-East', day: 'Thursday',
    purposes: ['planetary', 'knowledge'],
    price: 799, compareAt: 1099, rating: 4.7, reviews: 84, tags: ['guru', 'jupiter', 'brihaspati', 'thursday', 'planets']
  },
  {
    n: 13, title: 'Vastu Yantra for Home & Office', slug: 'vastu-yantra-copper', subcategory: 'vastu-yantra',
    material: 'copper', materialLabel: 'Pure Copper', size: '6 × 6 inch', weight: '300g', accent: 'copper',
    short: 'Copper Vastu Yantra, traditionally placed at the entrance or centre of the home or workplace.',
    description:
      'The Vastu Yantra is placed at the main entrance or the centre of a home, shop or office in Vastu tradition. Pure copper, with an installation guide.',
    price: 1199, compareAt: 1599, rating: 4.8, reviews: 132, tags: ['vastu', 'griha pravesh', 'home', 'office', 'new home'],
    includes: ['Yantra plate', 'Velvet pouch / gift box', 'Placement & worship guide', 'Mounting adhesive pads']
  },
  {
    n: 14, title: 'Durga Bisa Yantra – Pure Copper', slug: 'durga-bisa-yantra-copper', subcategory: 'durga-yantra',
    material: 'copper', materialLabel: 'Pure Copper', size: '4 × 4 inch', weight: '180g', accent: 'copper',
    short: 'Durga Bisa Yantra for Navratri and Devi worship, engraved on copper.',
    description:
      'The Durga Bisa Yantra is worshipped in the Devi tradition, especially through Navratri. Engraved on pure copper for the home mandir.',
    price: 999, compareAt: 1299, rating: 4.8, reviews: 108, tags: ['durga', 'navratri', 'devi', 'bisa yantra'], isNew: true
  },
  {
    n: 15, title: 'Saraswati Yantra – Brass', slug: 'saraswati-yantra-brass', subcategory: 'saraswati-yantra',
    material: 'brass', materialLabel: 'Brass', size: '4 × 4 inch', weight: '210g', accent: 'brass',
    short: 'Brass Saraswati Yantra for students and learners, kept in the study space.',
    description:
      'The Saraswati Yantra is dedicated to Maa Saraswati, the goddess of knowledge and the arts, and is traditionally kept in a study space and worshipped on Vasant Panchami.',
    price: 899, compareAt: 1199, rating: 4.8, reviews: 91, tags: ['saraswati', 'vasant panchami', 'student', 'study'], isNew: true
  },
  {
    n: 16, title: 'Ganesh Yantra – Pure Copper', slug: 'ganesh-yantra-copper', subcategory: 'ganesh-yantra',
    material: 'copper', materialLabel: 'Pure Copper', size: '3 × 3 inch', weight: '110g', accent: 'copper',
    short: 'Copper Ganesh Yantra for new beginnings, kept near the entrance or in the mandir.',
    description:
      'The Ganesh Yantra is worshipped before beginning new work and is traditionally kept near the entrance or in the mandir. Engraved on pure copper.',
    price: 799, compareAt: 999, rating: 4.9, reviews: 174, tags: ['ganesh', 'ganpati', 'ganesh chaturthi', 'new beginnings'], isNew: true
  }
];

export const YANTRA_PRODUCTS: Product[] = ROWS.map(toProduct);

/** Per-yantra metadata (metafields). Mutable on purpose: registerYantraMeta() adds Shopify products at runtime. */
export const YANTRA_META: YantraMeta[] = ROWS.map(toMeta);

/** Called by the catalog service when products come from Shopify, so the product page can read their facts too. */
export function registerYantraMeta(list: YantraMeta[]): void {
  for (const meta of list) {
    const i = YANTRA_META.findIndex((m) => m.slug === meta.slug);
    if (i >= 0) YANTRA_META[i] = meta;
    else YANTRA_META.push(meta);
  }
}
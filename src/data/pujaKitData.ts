import type { Product } from '../types/ecommerce';
import { resolveKitImages } from './pujaKitImages';

/**
 * PUJA KITS — catalog data.
 *
 * This is DEMO data in the exact shape the store will get from Shopify, so nothing on /puja-kits
 * needs to change when the real catalog is connected:
 *
 *   • PUJA_KIT_PRODUCTS  → a Shopify product in the `puja-kits` collection
 *                          (handle = slug, `subcategory` = the product's `custom.kit_type` metafield /
 *                           a tag that matches a subcategory slug in data/categories.ts)
 *   • PUJA_KIT_META      → the product's metafields:
 *        custom.kit_contents      list.single_line_text_field   ("what's inside" — one item per line)
 *        custom.kit_deity         single_line_text_field
 *        custom.kit_occasions     list.single_line_text_field   (ids from OCCASIONS in pujaKitCatalogService.ts)
 *        custom.kit_purposes      list.single_line_text_field   (slugs from data/purposeData.ts)
 *        custom.kit_serves        single_line_text_field        ("Family of 1–5")
 *
 * Adding a NEW kit = one entry in PUJA_KIT_PRODUCTS (+ optional meta). Nothing else: the page, the
 * finder, the "what's inside" tabs and the counts all read from the catalog, never from hand-written lists.
 * (A product with no meta entry still shows up — the service derives sensible defaults from its tags.)
 *
 * Prices/ratings below are placeholders like every other mock product in this project.
 * Photos: every kit's photo comes from the /public folder — see data/pujaKitImages.ts (slug → file name).
 * When Shopify is connected, the product's Shopify images replace them (resolveKitImages(..., remote)).
 * The themed placeholder below stays as the last fallback, so no image is ever broken.
 */

// ---------------------------------------------------------------------------
// Themed placeholder art (pure SVG data-URI — no external request, no font needed).
// ---------------------------------------------------------------------------
export type Accent = 'saffron' | 'gold' | 'rose' | 'indigo' | 'sage' | 'earth';

const ACCENT_COLOR: Record<Accent, string> = {
  saffron: '#E9A331',
  gold: '#C98A14',
  rose: '#B5525C',
  indigo: '#5B6AA8',
  sage: '#6E8F6B',
  earth: '#8A6A45'
};

export function kitArt(accent: Accent): string {
  const c = ACCENT_COLOR[accent];
  const petals = Array.from({ length: 12 }, (_, i) =>
    `<ellipse cx="300" cy="190" rx="24" ry="72" fill="${c}" fill-opacity=".16" transform="rotate(${i * 30} 300 300)"/>`
  ).join('');
  const inner = Array.from({ length: 8 }, (_, i) =>
    `<ellipse cx="300" cy="238" rx="15" ry="42" fill="${c}" fill-opacity=".28" transform="rotate(${i * 45 + 22.5} 300 300)"/>`
  ).join('');
  const dots = Array.from({ length: 24 }, (_, i) => {
    const a = (i * 15 * Math.PI) / 180;
    return `<circle cx="${(300 + 246 * Math.cos(a)).toFixed(1)}" cy="${(300 + 246 * Math.sin(a)).toFixed(1)}" r="3" fill="${c}" fill-opacity=".45"/>`;
  }).join('');
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600">` +
    `<defs><radialGradient id="g" cx="50%" cy="45%" r="75%"><stop offset="0" stop-color="#FFFBF0"/><stop offset="1" stop-color="#F3E7CC"/></radialGradient></defs>` +
    `<rect width="600" height="600" fill="url(#g)"/>` +
    `<circle cx="300" cy="300" r="262" fill="none" stroke="${c}" stroke-opacity=".25" stroke-width="1.5"/>` +
    `<circle cx="300" cy="300" r="226" fill="none" stroke="${c}" stroke-opacity=".18" stroke-width="1"/>` +
    dots + petals + inner +
    `<circle cx="300" cy="300" r="52" fill="${c}" fill-opacity=".9"/>` +
    `<circle cx="300" cy="300" r="34" fill="#FFF5DE" fill-opacity=".9"/>` +
    `<circle cx="300" cy="300" r="12" fill="${c}"/>` +
    `</svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

// ---------------------------------------------------------------------------
// Kit builder — keeps every kit consistent and computes the discount %, so a price edit
// can never leave a stale "% OFF" badge behind.
// ---------------------------------------------------------------------------
interface KitInput {
  n: number;
  title: string;
  slug: string;
  subcategory: string;
  short: string;
  description: string;
  price: number;
  compareAt: number;
  rating: number;
  reviews: number;
  weight: string;
  accent: Accent;
  tags: string[];
  bestseller?: boolean;
  isNew?: boolean;
  /** Optional one-off photo override (path under /public). Normally leave unset — see data/pujaKitImages.ts. */
  photo?: string;
}

const kit = (k: KitInput): Product => ({
  id: `prod-puja-kit-${String(k.n).padStart(2, '0')}`,
  title: k.title,
  slug: k.slug,
  category: 'puja-kits',
  subcategory: k.subcategory,
  description: k.description,
  shortDescription: k.short,
  images: resolveKitImages(k.slug, kitArt(k.accent), k.photo ? [k.photo] : undefined),
  price: k.price,
  compareAtPrice: k.compareAt,
  discount: Math.round(((k.compareAt - k.price) / k.compareAt) * 100),
  rating: k.rating,
  reviewCount: k.reviews,
  sku: `VS-PK-${String(k.n).padStart(3, '0')}`,
  stock: 40,
  sizes: ['Standard Kit'],
  material: 'Pure puja samagri, packed & sealed',
  weight: k.weight,
  tags: ['puja kit', 'puja samagri', ...k.tags],
  benefits: [
    'Complete samagri in one box — no last-minute shopping',
    'Step-by-step vidhi guide included',
    'Carefully selected, sealed for freshness',
    'Suitable for home puja'
  ],
  careInstructions:
    'Store unused samagri in a cool, dry place. Keep dhoop, camphor and incense sealed after opening.',
  shippingInformation: 'Ships across India in secure, moisture-safe packaging.',
  returnInformation:
    'Please refer to our Returns & Refund policy for eligibility of puja samagri items.',
  labCertified: false,
  isBestseller: k.bestseller ?? false,
  isNewArrival: k.isNew ?? false,
  faqs: [
    {
      question: 'What is included in this puja kit?',
      answer:
        'The full list of samagri is shown under "What\'s inside" on this page. Every kit also carries a simple step-by-step vidhi guide.'
    },
    {
      question: 'Do I need anything else for the puja?',
      answer:
        'Fresh items such as flowers, fruits, milk and curd are best bought fresh on the day. The kit covers the dry samagri.'
    }
  ]
});

export const PUJA_KIT_PRODUCTS: Product[] = [
  kit({
    n: 1, title: 'Rudrabhishek Puja Kit', slug: 'rudrabhishek-puja-kit', subcategory: 'rudrabhishek-kit',
    short: 'Complete samagri for the Lord Shiva Abhishek ritual, with a step-by-step vidhi guide.',
    description:
      'A complete kit for performing Rudrabhishek at home — Gangajal, bhasma, chandan, bel patra, akshat and every dry samagri item traditionally used in the Shiva abhishek, packed together with a simple vidhi guide so the puja can be performed with confidence.',
    price: 1499, compareAt: 1999, rating: 4.9, reviews: 286, weight: '900g', accent: 'indigo',
    tags: ['rudrabhishek', 'shiva', 'shivratri', 'sawan', 'bestseller'], bestseller: true
  }),
  kit({
    n: 2, title: 'Shiv Puja Kit', slug: 'shiv-puja-kit', subcategory: 'shiv-puja-kit',
    short: 'Essential samagri for daily and Mahashivratri worship of Lord Shiva.',
    description:
      'Everything you need for regular Shiva worship — from daily puja to Mahashivratri — in a compact, ready-to-use kit.',
    price: 699, compareAt: 899, rating: 4.8, reviews: 198, weight: '550g', accent: 'indigo',
    tags: ['shiva', 'shivratri', 'daily puja', 'bestseller'], bestseller: true
  }),
  kit({
    n: 3, title: 'Ganesh Puja Kit', slug: 'ganesh-puja-kit', subcategory: 'ganesh-puja-kit',
    short: 'Everything needed to begin any new work with Lord Ganesha\'s puja.',
    description:
      'A complete Ganesh puja kit for Ganesh Chaturthi, weekly Ganesh worship, or for beginning something new — with all the samagri traditionally offered to Lord Ganesha.',
    price: 799, compareAt: 999, rating: 4.9, reviews: 241, weight: '600g', accent: 'saffron',
    tags: ['ganesh', 'ganpati', 'ganesh chaturthi', 'new beginnings', 'bestseller'], bestseller: true
  }),
  kit({
    n: 4, title: 'Lakshmi Puja Kit', slug: 'lakshmi-puja-kit', subcategory: 'lakshmi-puja-kit',
    short: 'Diwali and Friday Lakshmi puja package with all traditional samagri.',
    description:
      'A complete Lakshmi puja kit for Diwali Lakshmi-Ganesh puja and regular Friday worship, packed with the samagri traditionally offered to Goddess Lakshmi.',
    price: 1199, compareAt: 1599, rating: 4.9, reviews: 312, weight: '750g', accent: 'gold',
    tags: ['lakshmi', 'diwali', 'friday puja', 'bestseller'], bestseller: true
  }),
  kit({
    n: 5, title: 'Navgraha Shanti Puja Kit', slug: 'navgraha-shanti-puja-kit', subcategory: 'navgraha-kit',
    short: 'Nine-planet puja samagri set, traditionally used for Navagraha worship.',
    description:
      'A nine-planet (Navagraha) puja kit with the traditional samagri associated with each graha, for a complete Navagraha shanti puja at home.',
    price: 1799, compareAt: 2299, rating: 4.8, reviews: 143, weight: '1.1kg', accent: 'earth',
    tags: ['navgraha', 'navagraha', 'graha shanti', 'planets']
  }),
  kit({
    n: 6, title: 'Satyanarayan Katha Puja Kit', slug: 'satyanarayan-puja-kit', subcategory: 'satyanarayan-kit',
    short: 'Full samagri set for the Satyanarayan Katha and puja.',
    description:
      'Everything for a traditional Satyanarayan Katha — celebrated on Purnima, at housewarmings and on family occasions — with a step-by-step guide to the puja.',
    price: 1299, compareAt: 1699, rating: 4.8, reviews: 167, weight: '850g', accent: 'sage',
    tags: ['satyanarayan', 'katha', 'purnima', 'vishnu']
  }),
  kit({
    n: 7, title: 'Griha Pravesh Puja Kit', slug: 'griha-pravesh-puja-kit', subcategory: 'griha-pravesh-kit',
    short: 'Traditional samagri for a housewarming — Ganesh, Vastu and Satyanarayan puja.',
    description:
      'A thoughtfully assembled kit for the Griha Pravesh (housewarming) ceremony, bringing together the samagri used in the traditional entry puja.',
    price: 2199, compareAt: 2799, rating: 4.9, reviews: 96, weight: '1.4kg', accent: 'sage',
    tags: ['griha pravesh', 'housewarming', 'vastu', 'new home'], isNew: true
  }),
  kit({
    n: 8, title: 'Hanuman Puja Kit', slug: 'hanuman-puja-kit', subcategory: 'hanuman-puja-kit',
    short: 'Samagri for Tuesday and Saturday Hanuman worship and Hanuman Jayanti.',
    description:
      'A simple, complete kit for Hanuman puja on Tuesdays, Saturdays and Hanuman Jayanti — with sindoor, chola-style samagri and a short puja guide.',
    price: 599, compareAt: 799, rating: 4.7, reviews: 121, weight: '500g', accent: 'rose',
    tags: ['hanuman', 'tuesday', 'saturday', 'hanuman jayanti'], isNew: true
  }),
  kit({
    n: 9, title: 'Durga Navratri Puja Kit', slug: 'durga-navratri-puja-kit', subcategory: 'durga-puja-kit',
    short: 'Samagri for Navratri Devi puja and Kanya Pujan.',
    description:
      'A complete Navratri kit for daily Devi puja and Kanya Pujan — with the traditional shringar and puja samagri offered to Maa Durga.',
    price: 1099, compareAt: 1399, rating: 4.8, reviews: 134, weight: '800g', accent: 'rose',
    tags: ['durga', 'navratri', 'devi', 'kanya pujan'], isNew: true
  }),
  kit({
    n: 10, title: 'Daily Puja Essentials Kit', slug: 'daily-puja-essentials-kit', subcategory: 'daily-puja-kit',
    short: 'A starter set of everyday puja items for your home mandir.',
    description:
      'A simple starter kit of everyday puja essentials for your home mandir — ideal for new households, gifting, or restocking the basics.',
    price: 499, compareAt: 649, rating: 4.7, reviews: 208, weight: '400g', accent: 'saffron',
    tags: ['daily puja', 'mandir', 'starter', 'gifting']
  })
];

// ---------------------------------------------------------------------------
// Per-kit metadata (metafields). Contents are indicative demo copy — edit per real kit.
// ---------------------------------------------------------------------------
export interface PujaKitMeta {
  slug: string;
  /** Deity / purpose label shown on the card. */
  deity: string;
  /** Ids from OCCASIONS in pujaKitCatalogService.ts */
  occasions: string[];
  /** Slugs from data/purposeData.ts */
  purposes: string[];
  /** "What's inside" — one line per item. */
  contents: string[];
  serves: string;
}

const CORE = ['Roli & Kumkum', 'Akshat (unbroken rice)', 'Mauli / Kalava', 'Camphor', 'Cotton wicks', 'Incense sticks'];

export const PUJA_KIT_META: PujaKitMeta[] = [
  {
    slug: 'rudrabhishek-puja-kit', deity: 'Lord Shiva',
    occasions: ['shivratri', 'weekly-vrat'], purposes: ['peace', 'spiritual-growth', 'devotional-practice'],
    contents: ['Kashi Gangajal', 'Bhasma (Vibhuti)', 'Chandan', 'Dried Bel Patra', 'Kusha grass', 'Janeu (sacred thread)', 'Supari & Laung-Elaichi', 'Dhoop', ...CORE, 'Rudrabhishek vidhi guide'],
    serves: 'Family of 1–6'
  },
  {
    slug: 'shiv-puja-kit', deity: 'Lord Shiva',
    occasions: ['daily', 'shivratri', 'weekly-vrat'], purposes: ['devotional-practice', 'meditation', 'peace'],
    contents: ['Gangajal', 'Bhasma (Vibhuti)', 'Chandan', 'Dried Bel Patra', 'Dhoop', ...CORE, 'Shiv puja guide'],
    serves: 'Family of 1–5'
  },
  {
    slug: 'ganesh-puja-kit', deity: 'Lord Ganesha',
    occasions: ['ganesh-chaturthi', 'daily', 'griha-pravesh'], purposes: ['career', 'devotional-practice'],
    contents: ['Sindoor', 'Durva grass (dried)', 'Chandan', 'Janeu (sacred thread)', 'Dhoop', 'Supari', ...CORE, 'Ganesh puja guide'],
    serves: 'Family of 1–5'
  },
  {
    slug: 'lakshmi-puja-kit', deity: 'Goddess Lakshmi',
    occasions: ['diwali', 'weekly-vrat'], purposes: ['wealth', 'devotional-practice'],
    contents: ['Kumkum & Haldi', 'Lotus seeds (Kamal Gatta)', 'Cowrie shells (Kaudi)', 'Chandan', 'Kesar', 'Dhoop', 'Batasha', ...CORE, 'Lakshmi puja guide'],
    serves: 'Family of 1–6'
  },
  {
    slug: 'navgraha-shanti-puja-kit', deity: 'Navagraha',
    occasions: ['graha-shanti'], purposes: ['planetary-balance', 'astrology-guidance'],
    contents: ['Navagraha samagri set (9 grahas)', 'Nine-colour cloth pieces', 'Navdhanya (9 grains)', 'Havan samagri', 'Ghee wicks', 'Dhoop', ...CORE, 'Navagraha puja guide'],
    serves: 'Family of 1–8'
  },
  {
    slug: 'satyanarayan-puja-kit', deity: 'Lord Vishnu',
    occasions: ['purnima', 'griha-pravesh'], purposes: ['peace', 'devotional-practice'],
    contents: ['Panchamrit ingredients (dry set)', 'Tulsi mala', 'Yellow cloth', 'Chandan', 'Haldi', 'Dhoop', ...CORE, 'Satyanarayan katha booklet'],
    serves: 'Family of 1–10'
  },
  {
    slug: 'griha-pravesh-puja-kit', deity: 'Ganesh · Vastu · Satyanarayan',
    occasions: ['griha-pravesh'], purposes: ['peace', 'spiritual-growth'],
    contents: ['Kalash set', 'Coconut & Mango-leaf toran', 'Navdhanya', 'Havan samagri', 'Gangajal', 'Sindoor', 'Haldi', 'Dhoop', ...CORE, 'Griha Pravesh vidhi guide'],
    serves: 'Family of 1–10'
  },
  {
    slug: 'hanuman-puja-kit', deity: 'Lord Hanuman',
    occasions: ['weekly-vrat', 'daily'], purposes: ['confidence-discipline', 'protection'],
    contents: ['Sindoor', 'Chameli-style oil (puja grade)', 'Red cloth', 'Chandan', 'Dhoop', ...CORE, 'Hanuman puja guide'],
    serves: 'Family of 1–4'
  },
  {
    slug: 'durga-navratri-puja-kit', deity: 'Goddess Durga',
    occasions: ['navratri'], purposes: ['protection', 'devotional-practice'],
    contents: ['Red chunri', 'Shringar samagri', 'Sindoor', 'Kumkum & Haldi', 'Havan samagri', 'Dhoop', ...CORE, 'Navratri puja guide'],
    serves: 'Family of 1–8'
  },
  {
    slug: 'daily-puja-essentials-kit', deity: 'Daily worship',
    occasions: ['daily'], purposes: ['daily-wear', 'devotional-practice', 'meditation'],
    contents: ['Roli & Kumkum', 'Chandan', 'Akshat (unbroken rice)', 'Camphor', 'Cotton wicks', 'Incense sticks', 'Dhoop', 'Mauli / Kalava'],
    serves: 'Personal use'
  }
];
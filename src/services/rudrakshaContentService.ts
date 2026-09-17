/**
 * Every export in this file is landing-page copy/content rather than a product catalog — trust
 * points, FAQ previews, reviews, guide/blog teasers, energization options. All of it is a fixed
 * demo default today. Each is written as its own small async getter (same shape every other
 * service on this page uses) so each can be swapped independently for a real fetch later —
 * typically a Shopify Page's metafields or a small metaobject list per section — without
 * touching the component that renders it. A store admin editing this copy from the Shopify
 * admin, instead of a developer editing this file, is the whole point of the swap.
 */

export interface TrustPoint {
  id: string;
  title: string;
  description: string;
}

const TRUST_POINTS: TrustPoint[] = [
  { id: 'authenticity', title: 'Authenticity', description: 'Authenticity information provided with applicable products.' },
  { id: 'quality-check', title: 'Quality Check', description: 'Each Rudraksha undergoes quality inspection before listing.' },
  { id: 'origin', title: 'Origin Information', description: 'Where available, origin information is clearly displayed.' },
  { id: 'certification', title: 'Certification', description: 'Certification/testing information displayed where applicable.' },
  { id: 'expert-guidance', title: 'Expert Guidance', description: 'Astrologer and spiritual guidance available on request.' },
  { id: 'secure-packaging', title: 'Secure Packaging', description: 'Safe, discreet packaging for every delivery.' }
];

/** Section 13 — "How Do You Know Your Rudraksha Is Authentic?" trust point grid. */
export async function getRudrakshaTrustPoints(): Promise<TrustPoint[]> {
  try {
    return TRUST_POINTS;
  } catch {
    return [];
  }
}

export interface RudrakshaFaqItem {
  id: string;
  question: string;
  answer: string;
}

// Full list lives on /faqs (spec section 24 lists 14) — this is the short landing-page preview;
// "View All FAQs" links to the real page rather than duplicating the whole list here.
const FAQ_PREVIEW: RudrakshaFaqItem[] = [
  { id: 'what-is-rudraksha', question: 'What is Rudraksha?', answer: 'Rudraksha is a seed traditionally worn as a sacred bead in Vedic practice, associated with Lord Shiva and classified by its number of "Mukhi" (faces).' },
  { id: 'which-mukhi', question: 'Which Rudraksha should I wear?', answer: 'This depends on your purpose and traditional associations. Use the Quick Finder above, or consult an astrologer for personalised guidance.' },
  { id: 'daily-wear', question: 'Can Rudraksha be worn daily?', answer: 'Yes, Rudraksha is traditionally worn daily by most practitioners, though care and cleaning guidance should be followed.' },
  { id: 'certification', question: 'Is certification available?', answer: 'Yes, certification/testing information is displayed on product pages where applicable.' },
  { id: 'astrology-consult', question: 'Can I consult an astrologer before buying?', answer: 'Yes — use the "Consult an Astrologer" option on this page to book personalised guidance before choosing.' }
];

/** Section 24 preview (full list on /faqs). */
export async function getRudrakshaFaqPreview(): Promise<RudrakshaFaqItem[]> {
  try {
    return FAQ_PREVIEW;
  } catch {
    return [];
  }
}

export interface RudrakshaReview {
  id: string;
  customerName: string;
  location: string;
  rating: number;
  comment: string;
  productPurchased: string;
  verified: boolean;
}

// Demo reviews only — swap for a real reviews-app fetch (Judge.me / Loox / Shopify Reviews)
// scoped to category 'rudraksha' once connected. Same card shape either way.
const RUDRAKSHA_REVIEWS: RudrakshaReview[] = [
  { id: 'rr1', customerName: 'Aarav Sharma', location: 'Varanasi, UP', rating: 5, comment: 'Ordered a 7 Mukhi Rudraksha. Received a genuine Nepalese bead with an official lab certificate. Very trustworthy.', productPurchased: '7 Mukhi Rudraksha', verified: true },
  { id: 'rr2', customerName: 'Rohan Deshmukh', location: 'Pune, Maharashtra', rating: 5, comment: 'Bought a Gauri Shankar Rudraksha for our home mandir. The energization process felt authentic and the packaging was excellent.', productPurchased: 'Gauri Shankar Rudraksha', verified: true },
  { id: 'rr3', customerName: 'Priya Patel', location: 'Ahmedabad, Gujarat', rating: 5, comment: 'The 1 Mukhi Rudraksha arrived exactly as described, and the traditional significance guide on the product page was genuinely helpful.', productPurchased: '1 Mukhi Rudraksha', verified: true },
  { id: 'rr4', customerName: 'Meera Nair', location: 'Kochi, Kerala', rating: 4, comment: '5 Mukhi Rudraksha mala for daily japa — good quality beads, delivery took a couple of days longer than expected.', productPurchased: '5 Mukhi Rudraksha', verified: true }
];

/** Section 23 — "What Our Customers Say". */
export async function getRudrakshaReviews(): Promise<RudrakshaReview[]> {
  try {
    return RUDRAKSHA_REVIEWS;
  } catch {
    return [];
  }
}

export interface RudrakshaLearnCard {
  id: string;
  eyebrow: string;
  title: string;
  description: string;
  href: string;
}

// Sections 25 (Education Hub) + 26 (Blog) merged into one "Learn" card grid — same format
// (title + short description + link out), so kept as a single section rather than two near-
// identical ones. Every href points at a real page already in the app (no dead links).
const LEARN_CARDS: RudrakshaLearnCard[] = [
  { id: 'guide', eyebrow: 'Rudraksha Guide', title: 'The Complete Rudraksha Knowledge Guide', description: '1–14 Mukhi meanings, identification, and traditional significance in one place.', href: '/guides/rudraksha' },
  { id: 'authenticity-guide', eyebrow: 'Authenticity', title: 'How to Identify an Original Rudraksha', description: 'Our verification process and what to check before you buy.', href: '/authenticity' },
  { id: 'blog-5-mukhi', eyebrow: 'Blog', title: '5 Mukhi Rudraksha: Complete Guide & Identification', description: 'Everything about the most commonly worn Rudraksha, from wearing to energization.', href: '/blog' },
  { id: 'puja-guide', eyebrow: 'Puja & Energization', title: 'Vedic Energization & Puja Guide', description: 'How traditional energization is carried out before a Rudraksha is dispatched.', href: '/guides/puja' }
];

/** Sections 25 + 26 — "Learn About Rudraksha" / blog teaser card grid. */
export async function getRudrakshaLearnCards(): Promise<RudrakshaLearnCard[]> {
  try {
    return LEARN_CARDS;
  } catch {
    return [];
  }
}

export interface EnergizationOption {
  id: string;
  title: string;
  description: string;
}

const ENERGIZATION_OPTIONS: EnergizationOption[] = [
  { id: 'standard', title: 'Rudraksha Energization', description: 'Standard Vedic energization before dispatch.' },
  { id: 'personalized', title: 'Personalized Energization', description: "Energization performed with the wearer's name and purpose." },
  { id: 'puja-energization', title: 'Puja + Energization', description: 'A short puja performed alongside the energization ritual.' },
  { id: 'kashi', title: 'Kashi Energization', description: 'Energization performed by Kashi-based Vedic priests.' }
];

/** Section 16 — "Get Your Rudraksha Energized" service options. */
export async function getRudrakshaEnergizationOptions(): Promise<EnergizationOption[]> {
  try {
    return ENERGIZATION_OPTIONS;
  } catch {
    return [];
  }
}
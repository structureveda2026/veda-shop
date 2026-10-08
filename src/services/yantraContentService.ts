/**
 * Landing-page copy/content for /yantra — trust points, how-it-works, why Veda Store, reviews, FAQ,
 * learn cards. Same pattern as pujaKitContentService.ts: every export is its own small async getter, so each can be
 * swapped for a Shopify Page-metafield / metaobject fetch on its own later without the component that renders it changing.
 *
 * Copy rules (carried over from the Rudraksha / Puja specs): traditional-association language only — no medical
 * claims, no guaranteed outcomes ("brings wealth", "cures", "removes dosha").
 */

// Trust bar — directly under the hero.
export interface YantraTrustPoint {
  id: string;
  title: string;
}

const TRUST_POINTS: YantraTrustPoint[] = [
  { id: 'geometry', title: 'Precisely Engraved Geometry' },
  { id: 'material', title: 'Material Clearly Disclosed' },
  { id: 'energization', title: 'Energization on Request' },
  { id: 'support', title: 'Expert Guidance' }
];

export async function getYantraTrustPoints(): Promise<YantraTrustPoint[]> {
  try {
    return TRUST_POINTS;
  } catch {
    return [];
  }
}

// How it works — 4 steps.
export interface YantraStep {
  id: string;
  step: number;
  title: string;
  description: string;
}

const HOW_IT_WORKS: YantraStep[] = [
  { id: 'choose', step: 1, title: 'Choose Your Yantra', description: 'Pick by deity, purpose or material — or use the finder above.' },
  { id: 'receive', step: 2, title: 'Receive It Safely', description: 'Your yantra arrives in padded packaging with a placement and worship guide.' },
  { id: 'place', step: 3, title: 'Place It Rightly', description: 'Install it in the recommended direction on the recommended day, on a clean raised seat.' },
  { id: 'worship', step: 4, title: 'Worship with the Mantra', description: 'Offer a diya and chant the mantra shown for your yantra. Need help? Ask us or book a pandit.' }
];

export async function getYantraHowItWorks(): Promise<YantraStep[]> {
  try {
    return HOW_IT_WORKS;
  } catch {
    return [];
  }
}

// Why Veda Store — 6 cards.
export interface YantraWhyCard {
  id: string;
  title: string;
  description: string;
}

const WHY_CARDS: YantraWhyCard[] = [
  { id: 'geometry', title: 'Authentic Geometry', description: 'Engraved to the traditional proportions of each yantra.' },
  { id: 'material', title: 'Honest Materials', description: 'Copper, silver, brass, crystal or Ashtadhatu — always clearly stated.' },
  { id: 'guide', title: 'Placement Guide', description: 'Direction, day and mantra listed for every yantra.' },
  { id: 'energize', title: 'Pran Pratishtha Option', description: 'Ask for a pandit to energize your yantra before it ships.' },
  { id: 'packaging', title: 'Secure Packaging', description: 'Padded, tamper-safe packing to reach you in perfect condition.' },
  { id: 'gifting', title: 'Gift-Ready', description: 'A meaningful gift for a housewarming, Diwali or a new business.' }
];

export async function getYantraWhyCards(): Promise<YantraWhyCard[]> {
  try {
    return WHY_CARDS;
  } catch {
    return [];
  }
}

// Reviews — demo only. Swap for a real reviews-app fetch scoped to the yantra collection once connected.
export type YantraReviewGroup = 'wealth' | 'protection' | 'planetary' | 'home';

export interface YantraReview {
  id: string;
  customerName: string;
  location: string;
  rating: number;
  comment: string;
  productPurchased: string;
  group: YantraReviewGroup;
  verified: boolean;
}

const REVIEWS: YantraReview[] = [
  { id: 'yr1', customerName: 'Rajesh Agarwal', location: 'Kanpur, Uttar Pradesh', rating: 5, comment: 'The engraving on the copper Shree Yantra is sharp and clean. It came well packed with a clear placement guide.', productPurchased: 'Shree Yantra – Pure Copper', group: 'wealth', verified: true },
  { id: 'yr2', customerName: 'Pooja Mehta', location: 'Ahmedabad, Gujarat', rating: 5, comment: 'Ordered the gold plated Kuber Yantra as a Dhanteras gift. The finish and gift box were lovely.', productPurchased: 'Kuber Yantra – 24K Gold Plated', group: 'wealth', verified: true },
  { id: 'yr3', customerName: 'Sandeep Joshi', location: 'Varanasi, Uttar Pradesh', rating: 5, comment: 'Kept the Mahamrityunjay Yantra in our mandir. Good weight and detailing for the price.', productPurchased: 'Mahamrityunjay Yantra – Pure Copper', group: 'protection', verified: true },
  { id: 'yr4', customerName: 'Anita Krishnan', location: 'Chennai, Tamil Nadu', rating: 4, comment: 'The team helped me choose the right Durga yantra for Navratri and explained where to place it.', productPurchased: 'Durga Bisa Yantra – Pure Copper', group: 'protection', verified: true },
  { id: 'yr5', customerName: 'Vikram Rathore', location: 'Jaipur, Rajasthan', rating: 5, comment: 'Navgraha yantra arrived exactly as shown. Our pandit was happy with the quality for the puja.', productPurchased: 'Navgraha Yantra – Pure Copper', group: 'planetary', verified: true },
  { id: 'yr6', customerName: 'Neha Saxena', location: 'Lucknow, Uttar Pradesh', rating: 5, comment: 'Bought the Vastu yantra for our new home. Easy instructions and sturdy plate.', productPurchased: 'Vastu Yantra for Home & Office', group: 'home', verified: true }
];

export async function getYantraReviews(group: 'all' | YantraReviewGroup = 'all'): Promise<YantraReview[]> {
  try {
    return group === 'all' ? REVIEWS : REVIEWS.filter((r) => r.group === group);
  } catch {
    return [];
  }
}

// FAQ preview — the full list lives on the existing /faqs page (same "preview + link out" pattern).
export interface YantraFaqItem {
  id: string;
  question: string;
  answer: string;
}

const FAQ_PREVIEW: YantraFaqItem[] = [
  { id: 'what-is', question: 'What is a yantra?', answer: 'A yantra is a sacred geometric diagram used in worship and meditation in the Vedic and Tantric traditions. Each yantra is dedicated to a particular deity or planet and is traditionally worshipped with its own mantra.' },
  { id: 'energized', question: 'Is the yantra energized when it arrives?', answer: 'Yantras ship clean and ready for worship. If you would like a pandit to perform Pran Pratishtha (energization) before dispatch, contact us when ordering and we will arrange it.' },
  { id: 'place', question: 'Where and when should I place it?', answer: 'Each yantra page lists the traditionally recommended direction and day. In general, place it on a clean, raised surface in your puja space, facing the right direction. If you are unsure, ask our team or your family pandit.' },
  { id: 'material', question: 'Which material should I choose?', answer: 'Copper is the classic and most widely used. Gold-plated and silver yantras are popular for gifting and compact spaces, brass is durable for daily use, and Sphatik and Ashtadhatu are chosen for special installations.' },
  { id: 'which', question: 'Which yantra is right for me?', answer: 'Start with the deity you worship or the intention you have in mind and use the finder above. For guidance based on your birth chart, we recommend consulting a Vedic astrologer.' },
  { id: 'claims', question: 'Will a yantra guarantee results?', answer: 'No. Yantras are devotional objects, traditionally associated with the intentions described. They are not a medical, legal or financial remedy and not a substitute for professional advice.' },
  { id: 'returns', question: 'What is the return policy?', answer: 'Please see our Returns & Refund policy for details on eligibility for yantra items.' }
];

export async function getYantraFaqPreview(): Promise<YantraFaqItem[]> {
  try {
    return FAQ_PREVIEW;
  } catch {
    return [];
  }
}

// Learn cards — link to real, already-built pages instead of duplicating content here.
export interface YantraLearnCard {
  id: string;
  eyebrow: string;
  title: string;
  description: string;
  href: string;
}

const LEARN_CARDS: YantraLearnCard[] = [
  { id: 'rashi', eyebrow: 'Rashi Guide', title: 'Yantra for Your Rashi', description: 'See the yantra traditionally associated with each zodiac sign.', href: '/rashi' },
  { id: 'guide', eyebrow: 'Puja Guide', title: 'Puja Vidhi Guide', description: 'The traditional way to set up and worship at home, step by step.', href: '/guides/puja' },
  { id: 'videos', eyebrow: 'Videos', title: 'Watch & Learn', description: 'Short videos on installing and worshipping your yantra.', href: '/videos' },
  { id: 'blog', eyebrow: 'Blog', title: 'Yantra Traditions', description: 'Meanings, mantras and stories from the Veda Store blog.', href: '/blog' }
];

export async function getYantraLearnCards(): Promise<YantraLearnCard[]> {
  try {
    return LEARN_CARDS;
  } catch {
    return [];
  }
}
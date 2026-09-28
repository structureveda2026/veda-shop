/**
 * Landing-page copy/content for /bracelets — trust points, "Why Veda Store", how-to-choose
 * steps, size guide, reviews, FAQ preview, learn cards. Same pattern as
 * rudrakshaContentService.ts: every export is its own small async getter so each can be swapped
 * for a real Shopify Page-metafield/metaobject fetch independently later, without the component
 * that renders it needing to change.
 */

// Section 2 (spec): Trust Bar — 4 points, directly under the hero.
export interface TrustPoint {
  id: string;
  title: string;
}

const TRUST_BAR_POINTS: TrustPoint[] = [
  { id: 'authentic', title: 'Authentic Products' },
  { id: 'quality-checked', title: 'Quality Checked' },
  { id: 'secure-packaging', title: 'Secure Packaging' },
  { id: 'expert-guidance', title: 'Expert Guidance' }
];

export async function getBraceletTrustBarPoints(): Promise<TrustPoint[]> {
  try {
    return TRUST_BAR_POINTS;
  } catch {
    return [];
  }
}

// Section 16 (spec): "Why Choose Veda Store?" — 6 cards.
export interface WhyCard {
  id: string;
  title: string;
  description: string;
}

const WHY_CARDS: WhyCard[] = [
  { id: 'selected', title: 'Carefully Selected', description: 'Products selected with quality in mind.' },
  { id: 'authenticity-info', title: 'Authenticity Information', description: 'Relevant product details clearly displayed.' },
  { id: 'expert-guidance', title: 'Expert Guidance', description: 'Astrology and spiritual guidance available.' },
  { id: 'secure-packaging', title: 'Secure Packaging', description: 'Products safely packed for delivery.' },
  { id: 'multiple-choices', title: 'Multiple Choices', description: 'Rudraksha, gemstone, crystal and combination options.' },
  { id: 'support', title: 'Support', description: 'Customer support before and after purchase.' }
];

export async function getWhyVedaStoreCards(): Promise<WhyCard[]> {
  try {
    return WHY_CARDS;
  } catch {
    return [];
  }
}

// Sections 17 + 18 merged (spec): "How to Choose the Right Bracelet?" 4-step guide, with wrist
// sizing folded in as its own step (spec explicitly calls size the last check before ordering).
export interface HowToChooseStep {
  id: string;
  step: number;
  title: string;
  description: string;
}

const HOW_TO_CHOOSE_STEPS: HowToChooseStep[] = [
  { id: 'purpose', step: 1, title: 'Decide Your Purpose', description: 'What are you looking for?' },
  { id: 'material', step: 2, title: 'Choose Material', description: 'Rudraksha / Gemstone / Crystal / Combination' },
  { id: 'design', step: 3, title: 'Select Design', description: 'Traditional / Minimal / Premium / Daily Wear' },
  { id: 'size', step: 4, title: 'Check Size', description: 'Choose your wrist size before ordering.' }
];

export async function getHowToChooseSteps(): Promise<HowToChooseStep[]> {
  try {
    return HOW_TO_CHOOSE_STEPS;
  } catch {
    return [];
  }
}

// Section 18 (spec): "Find Your Perfect Fit" wrist-size guide. Actual size options are dynamic
// per product (each product's own `sizes` field) — this is the general reference chart only.
export interface WristSizeOption {
  id: string;
  label: string;
}

const WRIST_SIZE_OPTIONS: WristSizeOption[] = [
  { id: 'xs', label: '5.5–6 inch' },
  { id: 's', label: '6–6.5 inch' },
  { id: 'm', label: '6.5–7 inch' },
  { id: 'l', label: '7–7.5 inch' },
  { id: 'xl', label: '7.5+ inch' }
];

export async function getWristSizeOptions(): Promise<WristSizeOption[]> {
  try {
    return WRIST_SIZE_OPTIONS;
  } catch {
    return [];
  }
}

// Section 23 (spec): Customer Reviews, with a category filter (All | Rudraksha | Gemstone |
// Crystal | Premium). Demo reviews only — swap for a real reviews-app fetch scoped to
// category 'bracelets' once connected, same note as rudrakshaContentService.ts's reviews.
export type BraceletReviewCategory = 'rudraksha' | 'gemstone' | 'crystal' | 'premium';

export interface BraceletReview {
  id: string;
  customerName: string;
  location: string;
  rating: number;
  comment: string;
  productPurchased: string;
  category: BraceletReviewCategory;
  verified: boolean;
}

const BRACELET_REVIEWS: BraceletReview[] = [
  { id: 'br1', customerName: 'Ananya Rao', location: 'Bengaluru, Karnataka', rating: 5, comment: 'The Tiger Eye bracelet is exactly as described — great for daily wear and the lab certificate gave real peace of mind.', productPurchased: 'Tiger Eye Bracelet', category: 'gemstone', verified: true },
  { id: 'br2', customerName: 'Kabir Malhotra', location: 'Delhi', rating: 5, comment: 'Ordered the Black Tourmaline for protection — sturdy elastic fit, comfortable for everyday wear.', productPurchased: 'Black Tourmaline Bracelet', category: 'crystal', verified: true },
  { id: 'br3', customerName: 'Sneha Iyer', location: 'Chennai, Tamil Nadu', rating: 5, comment: 'Bought the Citrine bracelet before Diwali — beautiful colour, arrived well before the festival.', productPurchased: 'Citrine Bracelet', category: 'gemstone', verified: true },
  { id: 'br4', customerName: 'Vivaan Gupta', location: 'Jaipur, Rajasthan', rating: 4, comment: 'The 7 Chakra Lava bracelet looks premium and the beads are genuinely well matched.', productPurchased: '7 Chakra Lava Bracelet', category: 'premium', verified: true }
];

export async function getBraceletReviews(category: 'all' | BraceletReviewCategory = 'all'): Promise<BraceletReview[]> {
  try {
    if (category === 'all') return BRACELET_REVIEWS;
    return BRACELET_REVIEWS.filter((r) => r.category === category);
  } catch {
    return [];
  }
}

// Section 24 (spec) preview — the spec lists 15 questions; a short preview here, full list on
// the existing /faqs page (same "preview + link out" pattern as RudrakshaFAQ.tsx).
export interface BraceletFaqItem {
  id: string;
  question: string;
  answer: string;
}

const FAQ_PREVIEW: BraceletFaqItem[] = [
  { id: 'which-bracelet', question: 'Which bracelet should I choose?', answer: 'Start with your purpose (protection, focus, prosperity, etc.) or material preference — use Shop By Purpose above, or the Find My Bracelet finder for a personalised suggestion.' },
  { id: 'rashi-wear', question: 'Can I wear a bracelet according to my Rashi?', answer: 'Yes — Rashi-based recommendation is a general starting point. For a personalised suggestion based on your full birth chart, consult an astrologer.' },
  { id: 'men-women', question: 'Can men and women both wear these bracelets?', answer: 'Yes, most designs here are unisex; some are offered in dedicated Men/Women sizing and styling — see the Find Your Style section above.' },
  { id: 'wrist-size', question: 'How do I know my wrist size?', answer: 'Measure around your wrist with a soft tape or string, then match it to the closest range in our Size Guide above. Most bracelets here also ship adjustable.' },
  { id: 'energized', question: 'Are Rudraksha bracelets energized?', answer: 'Where energization is offered, it is shown on the individual product page along with what the process involves.' }
];

export async function getBraceletFaqPreview(): Promise<BraceletFaqItem[]> {
  try {
    return FAQ_PREVIEW;
  } catch {
    return [];
  }
}

// Sections 25 (Education Hub) + 26 (Blog) merged (spec), same reasoning as
// RudrakshaLearnHub.tsx — one "Learn Before You Choose" grid linking to real, already-built pages
// rather than duplicating that content here.
export interface LearnCard {
  id: string;
  eyebrow: string;
  title: string;
  description: string;
  href: string;
}

const LEARN_CARDS: LearnCard[] = [
  { id: 'rudraksha-guide', eyebrow: 'Rudraksha Guide', title: 'Rudraksha Bracelet Guide', description: '1–14 Mukhi meanings and how they translate to wearable bracelets.', href: '/guides/rudraksha' },
  { id: 'gemstone-guide', eyebrow: 'Gemstone Guide', title: 'Gemstone Bracelet Guide', description: 'Choosing a gemstone bracelet by planet, purpose or Rashi.', href: '/guides/gemstone' },
  { id: 'authenticity', eyebrow: 'Authenticity', title: 'How to Care for Your Bracelet', description: 'Cleaning, storage and everyday care for bead bracelets.', href: '/authenticity' },
  { id: 'blog', eyebrow: 'Blog', title: 'How to Choose a Spiritual Bracelet', description: 'Purpose, material, Rashi and planet — a complete walkthrough.', href: '/blog' }
];

export async function getBraceletLearnCards(): Promise<LearnCard[]> {
  try {
    return LEARN_CARDS;
  } catch {
    return [];
  }
}
/**
 * Landing-page copy/content for /puja-kits — trust points, how-it-works, why Veda Store, reviews, FAQ,
 * learn cards. Same pattern as braceletContentService.ts / rudrakshaContentService.ts: every export is its
 * own small async getter, so each can be swapped for a Shopify Page-metafield / metaobject fetch on its own
 * later without the component that renders it changing.
 *
 * Copy rules (carried over from the Rudraksha / Bracelet specs): traditional-association language only —
 * no medical claims, no guaranteed outcomes ("brings wealth", "cures", "guaranteed marriage").
 */

// Trust bar — directly under the hero.
export interface PujaTrustPoint {
  id: string;
  title: string;
}

const TRUST_POINTS: PujaTrustPoint[] = [
  { id: 'samagri', title: 'Carefully Selected Samagri' },
  { id: 'guide', title: 'Vidhi Guide Included' },
  { id: 'packaging', title: 'Secure Packaging' },
  { id: 'support', title: 'Expert Guidance' }
];

export async function getPujaTrustPoints(): Promise<PujaTrustPoint[]> {
  try {
    return TRUST_POINTS;
  } catch {
    return [];
  }
}

// How it works — 4 steps.
export interface PujaStep {
  id: string;
  step: number;
  title: string;
  description: string;
}

const HOW_IT_WORKS: PujaStep[] = [
  { id: 'choose', step: 1, title: 'Choose Your Kit', description: 'Pick by deity, occasion or budget — or use the finder above.' },
  { id: 'receive', step: 2, title: 'Receive Your Samagri', description: 'Your kit arrives sealed in secure packaging, with a vidhi guide inside.' },
  { id: 'perform', step: 3, title: 'Follow the Vidhi', description: 'Set up your altar and follow the simple step-by-step guide at home.' },
  { id: 'guidance', step: 4, title: 'Need Help? Ask Us', description: 'Talk to our team, or book a pandit if you would like the puja performed for you.' }
];

export async function getPujaHowItWorks(): Promise<PujaStep[]> {
  try {
    return HOW_IT_WORKS;
  } catch {
    return [];
  }
}

// Why Veda Store — 6 cards.
export interface PujaWhyCard {
  id: string;
  title: string;
  description: string;
}

const WHY_CARDS: PujaWhyCard[] = [
  { id: 'complete', title: 'Complete in One Box', description: 'Everything traditionally needed for the puja, packed together.' },
  { id: 'selected', title: 'Carefully Selected', description: 'Samagri chosen with quality and freshness in mind.' },
  { id: 'guide', title: 'Simple Vidhi Guide', description: 'A clear step-by-step guide so first-timers feel confident.' },
  { id: 'packaging', title: 'Secure Packaging', description: 'Sealed and packed to reach you safely.' },
  { id: 'pandit', title: 'Pandit Support', description: 'Book a pandit or ask a question before you buy.' },
  { id: 'gifting', title: 'Gift-Ready', description: 'A thoughtful gift for a housewarming, festival or new beginning.' }
];

export async function getPujaWhyCards(): Promise<PujaWhyCard[]> {
  try {
    return WHY_CARDS;
  } catch {
    return [];
  }
}

// Reviews — demo only. Swap for a real reviews-app fetch scoped to the puja-kits collection once connected.
export type PujaReviewGroup = 'shiva' | 'lakshmi-ganesh' | 'festival' | 'home';

export interface PujaReview {
  id: string;
  customerName: string;
  location: string;
  rating: number;
  comment: string;
  productPurchased: string;
  group: PujaReviewGroup;
  verified: boolean;
}

const REVIEWS: PujaReview[] = [
  { id: 'pr1', customerName: 'Rohit Tripathi', location: 'Varanasi, Uttar Pradesh', rating: 5, comment: 'Everything for Rudrabhishek was in one box and the vidhi guide was easy to follow. No running around for samagri.', productPurchased: 'Rudrabhishek Puja Kit', group: 'shiva', verified: true },
  { id: 'pr2', customerName: 'Meenal Deshpande', location: 'Pune, Maharashtra', rating: 5, comment: 'Ordered the Lakshmi kit before Diwali. Neatly packed, and the items looked fresh and well chosen.', productPurchased: 'Lakshmi Puja Kit', group: 'lakshmi-ganesh', verified: true },
  { id: 'pr3', customerName: 'Arvind Nair', location: 'Kochi, Kerala', rating: 5, comment: 'We used the Griha Pravesh kit for our housewarming. It made preparing so much simpler for the family.', productPurchased: 'Griha Pravesh Puja Kit', group: 'home', verified: true },
  { id: 'pr4', customerName: 'Sunita Verma', location: 'Prayagraj, Uttar Pradesh', rating: 4, comment: 'Good quality dhoop and akshat in the Ganesh kit. Perfect size for a small family puja.', productPurchased: 'Ganesh Puja Kit', group: 'lakshmi-ganesh', verified: true },
  { id: 'pr5', customerName: 'Kavita Sharma', location: 'Jaipur, Rajasthan', rating: 5, comment: 'Navratri kit had everything for daily puja. The guide explained each step clearly.', productPurchased: 'Durga Navratri Puja Kit', group: 'festival', verified: true },
  { id: 'pr6', customerName: 'Deepak Menon', location: 'Bengaluru, Karnataka', rating: 5, comment: 'The daily essentials kit was a great gift for my parents\' new home mandir.', productPurchased: 'Daily Puja Essentials Kit', group: 'home', verified: true }
];

export async function getPujaReviews(group: 'all' | PujaReviewGroup = 'all'): Promise<PujaReview[]> {
  try {
    return group === 'all' ? REVIEWS : REVIEWS.filter((r) => r.group === group);
  } catch {
    return [];
  }
}

// FAQ preview — full list lives on the existing /faqs page (same "preview + link out" pattern).
export interface PujaFaqItem {
  id: string;
  question: string;
  answer: string;
}

const FAQ_PREVIEW: PujaFaqItem[] = [
  { id: 'what-is', question: 'What is a puja kit?', answer: 'A puja kit brings together the dry samagri traditionally used for a particular puja — such as Rudrabhishek, Ganesh or Lakshmi puja — so you do not have to collect each item separately.' },
  { id: 'vidhi', question: 'Is a vidhi (procedure) guide included?', answer: 'Yes. Our kits include a simple step-by-step guide. You can also read the full Puja Guide on our website.' },
  { id: 'fresh', question: 'Do I need to buy anything else?', answer: 'Fresh items such as flowers, fruits, milk, curd and leaves are best bought fresh on the day of the puja. The kit covers the dry samagri.' },
  { id: 'no-pandit', question: 'Can I perform the puja myself without a pandit?', answer: 'Many families perform these pujas at home by following the vidhi. If you would prefer a pandit to guide or perform it, you can contact us to arrange that.' },
  { id: 'which-kit', question: 'Which puja kit should I choose?', answer: 'Start with the deity you worship or the occasion you are preparing for, and use the Find Your Puja Kit filters above. For guidance based on your birth chart, consult an astrologer.' },
  { id: 'contents', question: 'Where can I see exactly what is inside a kit?', answer: 'Every kit card has a "What\'s inside" list, and the full list is also on the kit\'s product page.' },
  { id: 'returns', question: 'What is the return policy?', answer: 'Please see our Returns & Refund policy for details on eligibility for puja samagri items.' }
];

export async function getPujaFaqPreview(): Promise<PujaFaqItem[]> {
  try {
    return FAQ_PREVIEW;
  } catch {
    return [];
  }
}

// Learn cards — link to real, already-built pages instead of duplicating content here.
export interface PujaLearnCard {
  id: string;
  eyebrow: string;
  title: string;
  description: string;
  href: string;
}

const LEARN_CARDS: PujaLearnCard[] = [
  { id: 'guide', eyebrow: 'Puja Guide', title: 'Puja Vidhi Guide', description: 'The traditional procedure for performing puja at home, step by step.', href: '/guides/puja' },
  { id: 'videos', eyebrow: 'Videos', title: 'Watch & Learn', description: 'Short videos to help you set up and perform your puja.', href: '/videos' },
  { id: 'blog', eyebrow: 'Blog', title: 'Puja Tips & Traditions', description: 'Festival guides, samagri explained and more from the Veda Store blog.', href: '/blog' },
  { id: 'faq', eyebrow: 'FAQ', title: 'Common Questions', description: 'Quick answers on orders, delivery and puja preparation.', href: '/faqs' }
];

export async function getPujaLearnCards(): Promise<PujaLearnCard[]> {
  try {
    return LEARN_CARDS;
  } catch {
    return [];
  }
}
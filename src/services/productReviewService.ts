/**
 * Per-product reviews for the PDP "Reviews" tab. Demo/session-only today — the swap-in points
 * for a real backend (own API, or a reviews app like Judge.me/Loox, or Shopify's own reviews
 * product metafield) are the three functions below:
 *   - getProductReviews  → GET  /products/:id/reviews
 *   - submitProductReview → POST /products/:id/reviews (server should re-verify the delivered
 *     purchase server-side — the client-side `canReviewProduct` check below is UX only)
 * Submitted demo reviews are kept in memory rather than localStorage, since a review can carry
 * image/video data URLs that are too large for localStorage's quota.
 */
import { Order, Product, Review } from '../types/ecommerce';

const submittedReviews: Record<string, Review[]> = {};

export interface ReviewSubmission {
  productId: string;
  customerName: string;
  rating: number;
  comment: string;
  images: string[]; // data URLs in demo mode — a real reviews app returns hosted URLs after upload
  videos: string[];
}

/** Combines this session's submitted reviews with the product's demo/catalog fallback reviews. */
export async function getProductReviews(productId: string, demoFallback: Review[]): Promise<Review[]> {
  try {
    const local = submittedReviews[productId] || [];
    return [...local, ...demoFallback];
  } catch {
    return demoFallback;
  }
}

export async function submitProductReview(input: ReviewSubmission): Promise<Review> {
  const review: Review = {
    id: `review-${Date.now()}`,
    customerName: input.customerName,
    rating: input.rating,
    date: new Date().toISOString(),
    comment: input.comment,
    verifiedPurchase: true,
    images: input.images.length ? input.images : undefined,
    videos: input.videos.length ? input.videos : undefined,
  };
  submittedReviews[input.productId] = [review, ...(submittedReviews[input.productId] || [])];
  return review;
}

export function hasSubmittedReview(productId: string, customerName: string): boolean {
  return (submittedReviews[productId] || []).some((r) => r.customerName === customerName);
}

const DEMO_REVIEW_TEMPLATES: { name: string; location: string; rating: number; comment: (title: string) => string }[] = [
  { name: 'Aarav S.', location: 'Delhi', rating: 5, comment: (t) => `Ordered the ${t} — received genuine, well-packaged, and the details matched the product page. Very trustworthy.` },
  { name: 'Priya M.', location: 'Mumbai, Maharashtra', rating: 5, comment: (t) => `Beautiful ${t}, exactly as shown on the page. Energization felt authentic.` },
  { name: 'Rohan D.', location: 'Pune, Maharashtra', rating: 4, comment: (t) => `Good quality ${t}. Delivery took a couple of days longer than expected, but worth the wait.` },
];

/**
 * Deterministic per-product demo reviews shown until a real reviews backend is connected —
 * same "demo now, swap-in later" pattern as the rest of the catalog service layer.
 */
export function buildDemoFallbackReviews(product: Product): Review[] {
  return DEMO_REVIEW_TEMPLATES.map((template, i) => ({
    id: `demo-${product.id}-${i}`,
    customerName: template.name,
    location: template.location,
    rating: template.rating,
    date: new Date(Date.now() - (i + 1) * 12 * 24 * 60 * 60 * 1000).toISOString(),
    comment: template.comment(product.title),
    verifiedPurchase: true,
    productPurchased: product.title,
  }));
}

/**
 * Client-side eligibility check for showing the "Write a Review" form: signed-in customer,
 * with a Delivered order containing this product. A real backend must re-check this server-side
 * before accepting a submission — this only decides whether to show the form.
 */
export function canReviewProduct(orders: Order[], productId: string): boolean {
  return orders.some(
    (order) => order.status === 'Delivered' && order.items.some((item) => item.product.id === productId)
  );
}
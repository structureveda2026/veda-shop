/**
 * Remembers that the visitor was sent to Shopify checkout, so that when they come back to the site
 * we can tell what happened:
 *   • the Shopify cart is gone  → the order was placed (Shopify closes a cart when it becomes an order)
 *   • the Shopify cart is there → payment wasn't completed (closed the tab, failed/declined payment, pressed Back)
 */
const KEY = 'vedic_pending_checkout';
const MAX_AGE_MS = 24 * 60 * 60 * 1000;

export interface PendingCheckout {
  cartId: string;
  startedAt: number;
}

export const markCheckoutStarted = (cartId: string) => {
  try {
    localStorage.setItem(KEY, JSON.stringify({ cartId, startedAt: Date.now() } satisfies PendingCheckout));
  } catch {
    /* without storage the return can't be detected — the cart simply stays as it is */
  }
};

export const readPendingCheckout = (): PendingCheckout | null => {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PendingCheckout;
    if (!parsed.cartId || Date.now() - parsed.startedAt > MAX_AGE_MS) {
      localStorage.removeItem(KEY);
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
};

export const hasPendingCheckout = (): boolean => readPendingCheckout() !== null;

export const clearPendingCheckout = () => {
  try {
    localStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
};
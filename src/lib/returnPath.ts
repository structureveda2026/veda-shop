import { MOCK_PRODUCTS } from '../data/products';

/**
 * Remembers the last "normal" page the visitor was on — Home, Rudraksha, Bracelets, a product… —
 * i.e. anything except the cart / checkout / order-confirmation steps. After an order is placed the
 * visitor is sent back there. Kept in sessionStorage so a refresh in the middle of checkout doesn't lose it.
 */
const KEY = 'vedic_return_path';
const CHECKOUT_FLOW = ['/cart', '/checkout', '/order-success'];

const inCheckoutFlow = (path: string) =>
  CHECKOUT_FLOW.some((p) => path === p || path.startsWith(`${p}/`) || path.startsWith(`${p}?`));

export const rememberReturnPath = (path: string) => {
  if (inCheckoutFlow(path)) return;
  try {
    sessionStorage.setItem(KEY, path);
  } catch {
    /* storage unavailable — falls back to Home */
  }
};

/** Where to send the visitor after an order; Home when nothing was recorded. */
export const getReturnPath = (): string => {
  try {
    return sessionStorage.getItem(KEY) || '/';
  } catch {
    return '/';
  }
};

const titleCase = (s: string) => s.replace(/[-_]+/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

/** Short human name for a path, for "Back to …" buttons: "/" → Home, "/rudraksha" → Rudraksha, "/collections/bracelets" → Bracelets. */
export const describeReturnPath = (path: string): string => {
  const pathname = path.split(/[?#]/)[0];
  if (pathname === '/' || pathname === '') return 'Home';

  const segments = pathname.split('/').filter(Boolean);
  if (segments[0] === 'products' && segments[1]) {
    return MOCK_PRODUCTS.find((p) => p.slug === segments[1])?.title ?? 'the product';
  }
  const meaningful = segments.filter((s) => s !== 'collections' && s !== 'guides');
  return titleCase(meaningful[0] ?? segments[0]);
};
/**
 * Tiny analytics helper for the storefront.
 *
 * Events named in the spec: homepage_view, category_click, hero_cta_click, finder_start,
 * rashi_click, purpose_click, product_click, product_view, add_to_cart, wishlist, search,
 * consultation_click, puja_click, newsletter_signup, video_click.
 *
 * It only forwards the event — to gtag() if GA4 is on the page, otherwise to the GTM dataLayer.
 * With neither installed it does nothing, so it is always safe to call.
 */
type Params = Record<string, string | number | boolean | undefined>;

interface AnalyticsWindow {
  dataLayer?: unknown[];
  gtag?: (command: 'event', name: string, params?: Params) => void;
}

export function track(event: string, params: Params = {}): void {
  try {
    const w = window as unknown as AnalyticsWindow;
    if (typeof w.gtag === 'function') {
      w.gtag('event', event, params);
      return;
    }
    (w.dataLayer = w.dataLayer || []).push({ event, ...params });
  } catch {
    /* analytics must never break the page */
  }
}
/**
 * Actual price / discounted price / discount % — one rule for the whole product page.
 *
 *  1. Admin sets an actual price AND a discounted price → the discount % is worked out from them.
 *  2. Admin sets an actual price and only a discount % (no discounted price) → the discounted
 *     price is worked out from the %.
 *  3. Neither → no discount.
 *
 * In Shopify terms: `compareAtPrice` = actual price, `price` = discounted (selling) price, and the
 * optional product metafield `custom.discount_percentage` = the %. When only the % is given, the
 * variant's `price` holds the actual price (there is no separate discounted price to read).
 */
export interface ResolvedPricing {
  /** What the customer pays. */
  price: number;
  /** The actual (struck-through) price — equals `price` when there is no discount. */
  compareAtPrice: number;
  /** Discount in percent, 0 when there is none. */
  percent: number;
}

export function resolveDiscount(
  price: number,
  compareAtPrice?: number | null,
  percent?: number | null
): ResolvedPricing {
  // 1) both prices given → % is derived from them
  if (compareAtPrice != null && compareAtPrice > price) {
    return {
      price,
      compareAtPrice,
      percent: Math.round(((compareAtPrice - price) / compareAtPrice) * 100),
    };
  }

  // 2) only a % given → discounted price is derived from it (whole rupees)
  if (percent != null && Number.isFinite(percent) && percent > 0 && percent < 100) {
    return { price: Math.round(price * (1 - percent / 100)), compareAtPrice: price, percent };
  }

  // 3) no discount
  return { price, compareAtPrice: price, percent: 0 };
}
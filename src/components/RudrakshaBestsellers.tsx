import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Heart, ShoppingBag, Star } from 'lucide-react';
import { MOCK_PRODUCTS } from '../data/products';
import type { Product } from '../types/ecommerce';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';

const BESTSELLER_LIMIT = 8;

/**
 * DATA SOURCE — this is backend-driven ranking, not a hand-picked list of slugs.
 *
 * On Shopify, "Most Loved Rudraksha" becomes one query against a collection
 * sorted by Shopify's native BEST_SELLING sort key, which Shopify computes
 * from real order history across the store:
 *
 *   query MostLovedRudraksha {
 *     collection(handle: "most-loved-rudraksha") {
 *       products(first: 8, sortKey: BEST_SELLING) {
 *         edges { node { id title handle ... } }
 *       }
 *     }
 *   }
 *
 * (Storefront API `productSortKeys: BEST_SELLING` — see
 * https://shopify.dev/docs/api/storefront/latest/enums/ProductCollectionSortKeys)
 *
 * Until that collection is connected, we approximate "top selling" locally
 * from the same MOCK_PRODUCTS catalog every other component reads, ranking
 * by real product signals (the isBestseller flag + review volume + rating)
 * instead of a fixed list of slugs — so today it's demo data, but the *rule*
 * ("show whichever 8 rank highest") is already the real rule.
 *
 * To go live: delete this function's body and replace it with the
 * Storefront API call above, mapped into the same `Product` shape. Nothing
 * else in this file — the grid, the card, Add to Cart, Wishlist, the
 * "View All" link — needs to change.
 */
function getTopRudrakshaBestsellers(limit: number): Product[] {
  return MOCK_PRODUCTS
    .filter((p) => p.category === 'rudraksha')
    .map((product) => ({
      product,
      // Proxy "sales score" standing in for Shopify's real order-derived
      // BEST_SELLING rank. Weighted so a flagged bestseller always outranks
      // a non-flagged one, with review volume × rating breaking ties.
      score: (product.isBestseller ? 100000 : 0) + product.reviewCount * product.rating,
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((entry) => entry.product);
}

/**
 * Card markup mirrors RudrakshaShopByMukhi's card 1:1 (badge, wishlist heart,
 * sold-out overlay, star rating, price, Add to Cart) — deliberately kept
 * consistent with that section. Two differences, both intentional:
 *  - No Quick View (this section never had one, and it stays that way).
 *  - Only `product.images[0]` is ever shown — no hover image swap. The zoom
 *    (`group-hover:scale-105`) hover effect is kept identical to ShopByMukhi.
 */
const BestsellerCard: React.FC<{ product: Product }> = ({ product }) => {
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  const isLiked = isInWishlist(product.id);
  const inStock = product.stock > 0;

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product);
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!inStock) return;
    addToCart(product, 1);
  };

  return (
    <div className="group relative bg-white border border-vedic-gold/15 hover:border-vedic-gold/30 rounded-2xl overflow-hidden shadow-card hover:shadow-card-hover transition-all duration-300 flex flex-col">
      {/* Discount Badge */}
      {product.discount > 0 && (
        <span className="absolute top-3 left-3 z-10 bg-vedic-maroon text-vedic-goldLight text-[11px] font-bold px-2.5 py-1 rounded-full shadow-md">
          {product.discount}% OFF
        </span>
      )}

      {/* Wishlist Button */}
      <button
        onClick={handleWishlistClick}
        aria-label={isLiked ? 'Remove from Wishlist' : 'Add to Wishlist'}
        title={isLiked ? 'Remove from Wishlist' : 'Add to Wishlist'}
        className={`absolute top-3 right-3 z-10 w-9 h-9 rounded-full flex items-center justify-center backdrop-blur-md transition-all ${
          isLiked
            ? 'bg-red-50 text-red-600 shadow-md'
            : 'bg-white/90 text-gray-400 hover:text-red-500 hover:bg-white shadow-sm'
        }`}
      >
        <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
      </button>

      {/* Sold Out overlay */}
      {!inStock && (
        <div className="absolute inset-0 z-10 bg-white/60 flex items-center justify-center pointer-events-none">
          <span className="px-3 py-1 rounded-full bg-vedic-dark text-white text-xs font-bold tracking-wide">
            Sold Out
          </span>
        </div>
      )}

      {/* Image — same first image always, only a scale zoom on hover */}
      <Link to={`/products/${product.slug}`} className="relative aspect-square w-full overflow-hidden block">
        <img
          src={product.images[0]}
          alt={product.title}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
          onError={(e) => {
            (e.target as HTMLImageElement).src = `https://placehold.co/400x400/E9A331/FFF5DE?text=${encodeURIComponent(
              product.title
            )}`;
          }}
        />
      </Link>

      {/* Content */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col bg-white">
        <div className="flex items-center gap-1.5 mb-1.5">
          <div className="flex text-amber-400">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-3.5 h-3.5 ${
                  i < Math.round(product.rating) ? 'fill-current' : 'text-gray-300'
                }`}
              />
            ))}
          </div>
          <span className="text-xs text-vedic-muted font-medium">({product.reviewCount})</span>
        </div>

        <Link to={`/products/${product.slug}`}>
          <h3 className="font-serif font-bold text-vedic-dark text-base sm:text-lg leading-snug mb-3 hover:text-vedic-maroon transition-colors">
            {product.title}
          </h3>
        </Link>

        {/* Price sits on its own line and the Add button goes full-width right below it on
            narrow phones — a 2-column card is too tight for "₹1,240 ₹1,590 Add" to share one
            row without the strikethrough price colliding with the button. From sm up (more
            room per card) it goes back to one row, same as before. */}
        <div className="mt-auto pt-3 border-t border-vedic-beige flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div className="flex items-baseline gap-1.5 min-w-0 flex-wrap">
            <span className="text-base sm:text-lg font-extrabold text-vedic-dark">
              ₹{product.price.toLocaleString('en-IN')}
            </span>
            {product.compareAtPrice > product.price && (
              <span className="text-xs sm:text-sm text-vedic-muted line-through">
                ₹{product.compareAtPrice.toLocaleString('en-IN')}
              </span>
            )}
          </div>

          <button
            onClick={handleAddToCart}
            disabled={!inStock}
            title="Add to Cart"
            className="w-full sm:w-auto inline-flex items-center justify-center sm:justify-start gap-1.5 bg-vedic-gold/10 hover:bg-vedic-maroon text-vedic-maroon hover:text-vedic-ivory px-3.5 py-2 rounded-xl transition-all duration-200 border border-vedic-gold/30 hover:border-transparent text-xs sm:text-sm font-bold shrink-0 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-vedic-gold/10 disabled:hover:text-vedic-maroon"
          >
            <ShoppingBag className="w-4 h-4" />
            Add
          </button>
        </div>
      </div>
    </div>
  );
};

export const RudrakshaBestsellers: React.FC = () => {
  // ---------------------------------------------------------------------
  // Swap this one call for the Shopify BEST_SELLING collection fetch above
  // once connected — everything below already runs on the standard
  // `Product` shape.
  // ---------------------------------------------------------------------
  const bestsellerProducts = getTopRudrakshaBestsellers(BESTSELLER_LIMIT);

  if (bestsellerProducts.length === 0) return null;

  return (
    <section id="most-loved-rudraksha" className="bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        {/* Section Header */}
        <div className="flex items-end justify-between gap-4 mb-6 sm:mb-8">
          <div>
            <p className="text-[11px] sm:text-xs font-bold tracking-[0.15em] text-vedic-goldDark uppercase mb-2">
              Most Loved
            </p>
            <h2 className="font-serif font-semibold text-vedic-dark text-2xl sm:text-3xl mb-2">
              Most Loved Rudraksha
            </h2>
            <p className="text-sm text-vedic-muted max-w-xl">
              Our devotees' favourites — trusted, lab-certified where applicable, and reordered
              again and again.
            </p>
          </div>

          <Link
            to="/collections/rudraksha"
            className="hidden sm:inline-flex items-center gap-1.5 text-sm font-semibold text-vedic-goldDark hover:text-vedic-maroon transition-colors whitespace-nowrap shrink-0"
          >
            View All Rudraksha
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Top 8 bestsellers — fixed grid (4 columns x 2 rows on tablet/desktop,
            2 columns on mobile). No carousel, no scroll arrows, no auto-slide. */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
          {bestsellerProducts.map((product) => (
            <BestsellerCard key={product.id} product={product} />
          ))}
        </div>

        {/* Mobile-only fallback for the header link above (hidden on sm+) */}
        <div className="mt-6 text-center sm:hidden">
          <Link
            to="/collections/rudraksha"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-vedic-goldDark hover:text-vedic-maroon transition-colors"
          >
            View All Rudraksha
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </section>
  );
};
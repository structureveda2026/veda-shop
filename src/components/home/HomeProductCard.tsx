import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Gem, Heart, Star } from 'lucide-react';
import { AddToCartControl } from '../AddToCartControl';
import { useWishlist } from '../../context/WishlistContext';
import { track } from '../../lib/analytics';
import type { Product } from '../../types/ecommerce';

/** Only one badge is ever shown, and only when it's true for the product. */
export function productBadge(product: Product, skip: string[] = []): string | null {
  const tags = product.tags ?? [];
  const candidates: [label: string, applies: boolean][] = [
    ['Bestseller', Boolean(product.isBestseller) || tags.includes('bestseller')],
    ['New', Boolean(product.isNewArrival) || tags.includes('new')],
    ['Premium', product.qualityTier === 'Premium' || product.qualityTier === 'Collector' || tags.includes('premium')],
    ['Certified', Boolean(product.labCertified)],
    ['Energized', Boolean(product.energizationNote) || tags.includes('energized')],
  ];
  const match = candidates.find(([label, applies]) => applies && !skip.includes(label));
  return match ? match[0] : null;
}

interface HomeProductCardProps {
  product: Product;
  /** Badges to leave out (e.g. "Bestseller" inside the Most Loved band, where it's already implied). */
  hideBadges?: string[];
}

/**
 * Spec card: image · name · rating · price · Add to Cart, wishlist heart, one relevant badge.
 * The whole card links to the product's own page (/products/:handle).
 */
export const HomeProductCard: React.FC<HomeProductCardProps> = ({ product, hideBadges }) => {
  const { toggleWishlist, isInWishlist } = useWishlist();
  const [imageFailed, setImageFailed] = useState(false);

  const isLiked = isInWishlist(product.id);
  const inStock = product.stock > 0;
  const badge = productBadge(product, hideBadges);
  const href = `/products/${product.slug}`;
  const hasRating = product.reviewCount > 0 && product.rating > 0;
  const image = product.images[0];

  return (
    <article className="group relative flex flex-col h-full bg-white rounded-2xl border border-black/5 overflow-hidden shadow-card hover:shadow-[0_14px_34px_rgba(26,26,26,0.10)] transition-shadow duration-300">
      <div className="relative">
        <Link
          to={href}
          onClick={() => track('product_click', { product: product.slug, source: 'home_most_loved' })}
          aria-label={product.title}
          className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-vedic-gold"
        >
          <div className="relative aspect-square overflow-hidden bg-vedic-sand">
            {image && !imageFailed ? (
              <img
                src={image}
                alt={product.title}
                width={600}
                height={600}
                loading="lazy"
                decoding="async"
                onError={() => setImageFailed(true)}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-vedic-gold/60">
                <Gem className="w-9 h-9" aria-hidden="true" />
              </div>
            )}
          </div>
        </Link>

        {badge && (
          <span className="absolute top-3 left-3 inline-flex items-center gap-1.5 rounded-full bg-white/95 border border-vedic-gold/50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-vedic-charcoal">
            <span className="w-1.5 h-1.5 rounded-full bg-vedic-gold" aria-hidden="true" />
            {badge}
          </span>
        )}

        <button
          type="button"
          onClick={() => {
            toggleWishlist(product);
            track('wishlist', { product: product.slug });
          }}
          aria-label={isLiked ? 'Remove from wishlist' : 'Add to wishlist'}
          aria-pressed={isLiked}
          className={`absolute top-3 right-3 w-9 h-9 rounded-full bg-white/95 border border-black/5 flex items-center justify-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-vedic-gold ${
            isLiked ? 'text-red-500' : 'text-vedic-charcoal/60 hover:text-vedic-charcoal'
          }`}
        >
          <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
        </button>

        {!inStock && (
          <span className="absolute bottom-3 left-3 rounded-full bg-vedic-charcoal px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-white">
            Sold Out
          </span>
        )}
      </div>

      <div className="flex flex-col flex-1 p-3.5 md:p-5">
        <Link to={href} onClick={() => track('product_click', { product: product.slug, source: 'home_most_loved' })}>
          <h3 className="font-serif font-semibold text-[17px] md:text-lg leading-snug text-vedic-dark line-clamp-2 md:min-h-[2.75rem] hover:text-vedic-goldDeep transition-colors">
            {product.title}
          </h3>
        </Link>

        {hasRating && (
          <div className="mt-2 flex items-center gap-1.5" aria-label={`Rated ${product.rating.toFixed(1)} out of 5`}>
            <span className="flex text-vedic-gold">
              {[0, 1, 2, 3, 4].map((i) => (
                <Star key={i} className={`w-3.5 h-3.5 ${i < Math.round(product.rating) ? 'fill-current' : 'text-black/15'}`} />
              ))}
            </span>
            <span className="text-xs text-vedic-muted">({product.reviewCount})</span>
          </div>
        )}

        <div className="mt-2.5 flex items-baseline gap-2 flex-wrap">
          <span className="text-base md:text-lg font-semibold text-vedic-dark">₹{product.price.toLocaleString('en-IN')}</span>
          {product.compareAtPrice > product.price && (
            <span className="text-sm text-vedic-muted line-through">₹{product.compareAtPrice.toLocaleString('en-IN')}</span>
          )}
        </div>

        <div className="mt-auto pt-4">
          <AddToCartControl
            product={product}
            disabled={!inStock}
            disabledLabel="Sold Out"
            size="full"
            appearance="dark"
            label="Add to Cart"
            className="w-full"
            buttonClassName="justify-center rounded-full py-2.5 text-sm opacity-100"
          />
        </div>
      </div>
    </article>
  );
};
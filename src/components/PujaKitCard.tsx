import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, Heart, Package, Star } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';
import { AddToCartControl } from './AddToCartControl';
import type { PujaKitView } from '../services/pujaKitCatalogService';

/** One puja kit: image, type, rating, short description, expandable "What's inside", price and Add to Cart.
 *  Reused by Bestsellers, the Find Your Puja Kit results and anywhere else a kit needs to be shown. */
export const PujaKitCard: React.FC<{ kit: PujaKitView }> = ({ kit }) => {
  const { product, meta, typeName } = kit;
  const { toggleWishlist, isInWishlist } = useWishlist();
  const [showInside, setShowInside] = useState(false);
  const isLiked = isInWishlist(product.id);
  const inStock = product.stock > 0;
  const contents = meta.contents;
  const panelId = `kit-inside-${product.id}`;

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product);
  };

  return (
    <article className="group relative bg-white border border-vedic-gold/15 hover:border-vedic-gold/35 rounded-2xl overflow-hidden shadow-card hover:shadow-card-hover transition-all duration-300 flex flex-col">
      <div className="absolute top-3 left-3 z-10 flex flex-col items-start gap-1.5">
        {product.discount > 0 && (
          <span className="bg-vedic-gold text-vedic-dark text-[11px] font-bold px-2.5 py-1 rounded-full shadow-sm">
            {product.discount}% OFF
          </span>
        )}
        {(product.isBestseller || product.isNewArrival) && (
          <span className="bg-white/95 text-vedic-goldDeep border border-vedic-gold/30 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full">
            {product.isBestseller ? 'Bestseller' : 'New'}
          </span>
        )}
      </div>

      <button
        onClick={handleWishlist}
        aria-label={isLiked ? 'Remove from Wishlist' : 'Add to Wishlist'}
        title={isLiked ? 'Remove from Wishlist' : 'Add to Wishlist'}
        className={`absolute top-3 right-3 z-10 w-9 h-9 rounded-full flex items-center justify-center backdrop-blur-md transition-all ${
          isLiked ? 'bg-red-50 text-red-600 shadow-md' : 'bg-white/90 text-gray-400 hover:text-red-500 hover:bg-white shadow-sm'
        }`}
      >
        <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
      </button>

      {!inStock && (
        <div className="absolute inset-0 z-10 bg-white/60 flex items-center justify-center pointer-events-none">
          <span className="px-3 py-1 rounded-full bg-vedic-dark text-white text-xs font-bold tracking-wide">Sold Out</span>
        </div>
      )}

      <Link to={`/products/${product.slug}`} className="relative aspect-square w-full overflow-hidden block bg-vedic-card">
        <img
          src={product.images[0]}
          alt={product.title}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
          onError={(e) => {
            // A real photo path that isn't uploaded yet → fall back to the kit's built-in themed art.
            const fallback = product.images[product.images.length - 1];
            if (fallback && e.currentTarget.getAttribute('src') !== fallback) e.currentTarget.src = fallback;
          }}
        />
      </Link>

      <div className="p-4 sm:p-5 flex-1 flex flex-col">
        <p className="text-[10px] sm:text-[11px] font-bold tracking-[0.12em] text-vedic-goldDeep uppercase mb-1.5">{typeName}</p>

        <div className="flex items-center gap-1.5 mb-1.5">
          <div className="flex text-amber-400" aria-label={`Rated ${product.rating} out of 5`}>
            {[...Array(5)].map((_, i) => (
              <Star key={i} className={`w-3.5 h-3.5 ${i < Math.round(product.rating) ? 'fill-current' : 'text-gray-300'}`} />
            ))}
          </div>
          <span className="text-xs text-vedic-muted font-medium">({product.reviewCount})</span>
        </div>

        <Link to={`/products/${product.slug}`}>
          <h3 className="font-serif font-bold text-vedic-dark text-base sm:text-lg leading-snug mb-1 hover:text-vedic-maroon transition-colors line-clamp-2 min-h-[2.6em]">
            {product.title}
          </h3>
        </Link>
        <p className="text-xs text-vedic-muted leading-relaxed line-clamp-2 min-h-[2.5em] mb-3">{product.shortDescription}</p>

        {contents.length > 0 && (
          <div className="mb-3">
            <button
              type="button"
              onClick={() => setShowInside((v) => !v)}
              aria-expanded={showInside}
              aria-controls={panelId}
              className="w-full flex items-center justify-between gap-2 text-left rounded-xl bg-vedic-ivory hover:bg-vedic-card border border-vedic-gold/15 px-3 py-2 transition-colors"
            >
              <span className="flex items-center gap-2 text-xs font-semibold text-vedic-dark">
                <Package className="w-3.5 h-3.5 text-vedic-goldDeep" strokeWidth={1.75} />
                What&apos;s inside
                <span className="text-vedic-muted font-medium">· {contents.length} items</span>
              </span>
              <ChevronDown className={`w-4 h-4 text-vedic-goldDeep shrink-0 transition-transform duration-200 ${showInside ? 'rotate-180' : ''}`} />
            </button>

            {showInside && (
              <div id={panelId} className="mt-2 rounded-xl border border-vedic-gold/15 bg-white p-3">
                <ul className="flex flex-wrap gap-1.5">
                  {contents.map((item) => (
                    <li key={item} className="text-[11px] leading-none text-vedic-charcoal bg-vedic-card border border-vedic-gold/20 rounded-full px-2.5 py-1.5">
                      {item}
                    </li>
                  ))}
                </ul>
                {meta.serves && <p className="text-[11px] text-vedic-muted mt-2.5">Suitable for: {meta.serves}</p>}
                <Link to={`/products/${product.slug}`} className="inline-block text-[11px] font-semibold text-vedic-goldDeep hover:text-vedic-maroon mt-2">
                  View full details →
                </Link>
              </div>
            )}
          </div>
        )}

        <div className="mt-auto pt-3 border-t border-vedic-beige flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div className="flex items-baseline gap-1.5 min-w-0 flex-wrap">
            <span className="text-base sm:text-lg font-extrabold text-vedic-dark">₹{product.price.toLocaleString('en-IN')}</span>
            {product.compareAtPrice > product.price && (
              <span className="text-xs sm:text-sm text-vedic-muted line-through">₹{product.compareAtPrice.toLocaleString('en-IN')}</span>
            )}
          </div>
          <AddToCartControl product={product} disabled={!inStock} size="full" className="w-full sm:w-auto justify-center sm:justify-start" />
        </div>
      </div>
    </article>
  );
};
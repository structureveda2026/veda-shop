import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Heart, Star } from 'lucide-react';
import type { Product } from '../types/ecommerce';
import { useWishlist } from '../context/WishlistContext';
import { AddToCartControl } from './AddToCartControl';
import { getBestsellerBracelets } from '../services/braceletCatalogService';

const BestsellerCard: React.FC<{ product: Product }> = ({ product }) => {
  const { toggleWishlist, isInWishlist } = useWishlist();
  const isLiked = isInWishlist(product.id);
  const inStock = product.stock > 0;

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product);
  };

  return (
    <div className="group relative bg-white border border-vedic-gold/15 hover:border-vedic-gold/30 rounded-2xl overflow-hidden shadow-card hover:shadow-card-hover transition-all duration-300 flex flex-col">
      {product.discount > 0 && (
        <span className="absolute top-3 left-3 z-10 bg-vedic-maroon text-vedic-goldLight text-[11px] font-bold px-2.5 py-1 rounded-full shadow-md">
          {product.discount}% OFF
        </span>
      )}

      <button
        onClick={handleWishlistClick}
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

      <Link to={`/products/${product.slug}`} className="relative aspect-square w-full overflow-hidden block">
        <img
          src={product.images[0]}
          alt={product.title}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
          onError={(e) => {
            (e.target as HTMLImageElement).src = `https://placehold.co/400x400/E9A331/FFF5DE?text=${encodeURIComponent(product.title)}`;
          }}
        />
      </Link>

      <div className="p-4 sm:p-5 flex-1 flex flex-col bg-white">
        <div className="flex items-center gap-1.5 mb-1.5">
          <div className="flex text-amber-400">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className={`w-3.5 h-3.5 ${i < Math.round(product.rating) ? 'fill-current' : 'text-gray-300'}`} />
            ))}
          </div>
          <span className="text-xs text-vedic-muted font-medium">({product.reviewCount})</span>
        </div>

        <Link to={`/products/${product.slug}`}>
          <h3 className="font-serif font-bold text-vedic-dark text-base sm:text-lg leading-snug mb-1 hover:text-vedic-maroon transition-colors">
            {product.title}
          </h3>
        </Link>
        <p className="text-[11px] text-vedic-muted mb-3">{product.material}</p>

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
    </div>
  );
};

/** Section 6 (spec): Bestsellers — "Most Loved Bracelets" carousel (rendered as a fixed grid,
 *  same as RudrakshaBestsellers, rather than an actual scroll-carousel — no arrows/auto-slide). */
export const BraceletBestsellers: React.FC = () => {
  const bestsellerProducts = getBestsellerBracelets(8);
  if (bestsellerProducts.length === 0) return null;

  return (
    <section id="most-loved-bracelets" className="bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="flex items-end justify-between gap-4 mb-6 sm:mb-8">
          <div>
            <p className="text-[11px] sm:text-xs font-bold tracking-[0.15em] text-vedic-goldDark uppercase mb-2">Most Loved</p>
            <h2 className="font-serif font-semibold text-vedic-dark text-2xl sm:text-3xl">Most Loved Bracelets</h2>
          </div>
          <Link
            to="/collections/bracelets"
            className="hidden sm:inline-flex items-center gap-1.5 text-sm font-semibold text-vedic-goldDark hover:text-vedic-maroon transition-colors whitespace-nowrap shrink-0"
          >
            View All Bracelets
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
          {bestsellerProducts.map((product) => (
            <BestsellerCard key={product.id} product={product} />
          ))}
        </div>

        <div className="mt-6 text-center sm:hidden">
          <Link to="/collections/bracelets" className="inline-flex items-center gap-1.5 text-sm font-semibold text-vedic-goldDark hover:text-vedic-maroon transition-colors">
            View All Bracelets
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </section>
  );
};
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Hash, Heart, Star, X } from 'lucide-react';
import { getRudrakshaMukhiTiles, RudrakshaMukhiTile } from '../services/rudrakshaCatalogService';
import { Product } from '../types/ecommerce';
import { useWishlist } from '../context/WishlistContext';
import { AddToCartControl } from './AddToCartControl';

export interface RudrakshaShopByMukhiProps {
  /** Fires with the Mukhi number (1–14) chosen — from a grid card or the "Find Your Mukhi"
   *  popup. Defaults to a real navigation to that Mukhi's product page (/products/:slug) —
   *  same destination the Quick Finder above already uses. */
  onSelectMukhi?: (mukhiNumber: number) => void;
}

// 4 columns x 2 rows on the main grid. The remaining Mukhis are always reachable via the
// "Find Your Mukhi" popup below, so nothing is ever hidden from the user — this just keeps the
// landing page itself from feeling long. Swap this slice for a curated/"featured" flag coming
// from Shopify (e.g. a product tag or collection order) once that's wired up; the grid itself
// doesn't need to change either way.
const GRID_PREVIEW_COUNT = 8;
const CARD_SKELETON_COUNT = GRID_PREVIEW_COUNT;

/**
 * Converts a catalog tile into the same `Product` shape the rest of the storefront's cart /
 * wishlist already understands, so "Add" here behaves exactly like every other product card
 * (CartDrawer, WishlistPage, etc. need no changes). Once Shopify is connected and
 * getRudrakshaMukhiTiles() returns real product data, this mapping stays — only the tile's own
 * fields become real instead of demo values.
 */
function buildProductFromTile(tile: RudrakshaMukhiTile): Product {
  return {
    id: tile.id,
    title: tile.name,
    slug: tile.slug,
    category: 'rudraksha',
    description: tile.shortDescription,
    shortDescription: tile.shortDescription,
    images: [tile.image],
    price: tile.startingPrice,
    compareAtPrice: tile.compareAtPrice,
    discount: tile.discountPercent,
    rating: tile.rating,
    reviewCount: tile.reviewCount,
    sku: `RUD-${tile.mukhiNumber}M`,
    stock: tile.inStock ? 25 : 0,
    tags: ['rudraksha', `${tile.mukhiNumber}-mukhi`],
    mukhi: `${tile.mukhiNumber} Mukhi`,
    benefits: []
  };
}

export const RudrakshaShopByMukhi: React.FC<RudrakshaShopByMukhiProps> = ({ onSelectMukhi }) => {
  const [tiles, setTiles] = useState<RudrakshaMukhiTile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFinderOpen, setIsFinderOpen] = useState(false);
  const { toggleWishlist, isInWishlist } = useWishlist();

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    getRudrakshaMukhiTiles().then((result) => {
      if (!isMounted) return;
      setTiles(result);
      setIsLoading(false);
    });
    return () => {
      isMounted = false;
    };
  }, []);

  // Lock background scroll + close on Escape while the popup is open.
  useEffect(() => {
    if (!isFinderOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsFinderOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isFinderOpen]);

  const previewTiles = tiles.slice(0, GRID_PREVIEW_COUNT);

  const goToMukhi = (mukhiNumber: number) => {
    setIsFinderOpen(false);
    onSelectMukhi?.(mukhiNumber);
  };

  return (
    <section id="shop-by-mukhi" className="bg-vedic-ivory">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        {/* Section Header */}
        <div className="flex items-end justify-between gap-4 mb-6 sm:mb-8">
          <div>
            <p className="text-[11px] sm:text-xs font-bold tracking-[0.15em] text-vedic-goldDark uppercase mb-2">
              Shop By Mukhi
            </p>
            <h2 className="font-serif font-semibold text-vedic-dark text-2xl sm:text-3xl mb-2">
              Explore Rudraksha by Mukhi
            </h2>
            <p className="text-sm text-vedic-muted max-w-xl">
              From the supreme 1 Mukhi to the rare 14 Mukhi, each bead carries its own traditional
              significance and planetary association.
            </p>
          </div>
          <button
            onClick={() => setIsFinderOpen(true)}
            className="hidden sm:inline-flex items-center gap-1.5 text-sm font-semibold text-vedic-goldDark hover:text-vedic-maroon transition-colors whitespace-nowrap"
          >
            Find Your Mukhi
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Card Grid — 4 columns x 2 rows */}
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {Array.from({ length: CARD_SKELETON_COUNT }).map((_, i) => (
              <div
                key={i}
                className="rounded-2xl border border-vedic-gold/10 bg-white overflow-hidden animate-pulse"
              >
                <div className="aspect-square bg-vedic-card" />
                <div className="p-4 sm:p-5 space-y-2.5">
                  <div className="h-3 w-1/3 bg-vedic-card rounded" />
                  <div className="h-3.5 w-3/4 bg-vedic-card rounded" />
                  <div className="h-3 w-1/2 bg-vedic-card rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : tiles.length === 0 ? (
          // Graceful empty state — shows if the connected Shopify collection has no products yet,
          // instead of a visible error.
          <div className="text-center py-10 border border-dashed border-vedic-gold/25 rounded-2xl">
            <p className="text-sm text-vedic-muted">Rudraksha listings will appear here shortly.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {previewTiles.map((tile) => {
              const product = buildProductFromTile(tile);
              const isLiked = isInWishlist(tile.id);
              const handleCardClick = () => onSelectMukhi?.(tile.mukhiNumber);

              const handleWishlistClick = (e: React.MouseEvent) => {
                e.preventDefault();
                e.stopPropagation();
                toggleWishlist(product);
              };

              const imageBlock = (
                <img
                  src={tile.image}
                  alt={tile.name}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = `https://placehold.co/400x400/E9A331/FFF5DE?text=${encodeURIComponent(
                      tile.mukhiNumber + ' Mukhi'
                    )}`;
                  }}
                />
              );

              return (
                <div
                  key={tile.id}
                  className="group relative bg-white border border-vedic-gold/15 hover:border-vedic-gold/30 rounded-2xl overflow-hidden shadow-card hover:shadow-card-hover transition-all duration-300 flex flex-col"
                >
                  {/* Discount Badge */}
                  {tile.discountPercent > 0 && (
                    <span className="absolute top-3 left-3 z-10 bg-vedic-maroon text-vedic-goldLight text-[11px] font-bold px-2.5 py-1 rounded-full shadow-md">
                      {tile.discountPercent}% OFF
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
                  {!tile.inStock && (
                    <div className="absolute inset-0 z-10 bg-white/60 flex items-center justify-center pointer-events-none">
                      <span className="px-3 py-1 rounded-full bg-vedic-dark text-white text-xs font-bold tracking-wide">
                        Sold Out
                      </span>
                    </div>
                  )}

                  {/* Image — full-bleed, gold podium shot already baked into the asset */}
                  {onSelectMukhi ? (
                    <button
                      onClick={handleCardClick}
                      className="relative aspect-square w-full overflow-hidden block text-left"
                    >
                      {imageBlock}
                    </button>
                  ) : (
                    // TODO(Shopify): once each Mukhi maps to a real product/collection handle from
                    // Shopify, this Link target can be swapped for that handle without changing anything else here.
                    <Link to={`/products/${tile.slug}`} className="relative aspect-square w-full overflow-hidden block">
                      {imageBlock}
                    </Link>
                  )}

                  {/* Content */}
                  <div className="p-4 sm:p-5 flex-1 flex flex-col bg-white">
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <div className="flex text-amber-400">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3.5 h-3.5 ${
                              i < Math.round(tile.rating) ? 'fill-current' : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-xs text-vedic-muted font-medium">({tile.reviewCount})</span>
                    </div>

                    {onSelectMukhi ? (
                      <button onClick={handleCardClick} className="text-left">
                        <h3 className="font-serif font-bold text-vedic-dark text-base sm:text-lg leading-snug mb-3">
                          {tile.name}
                        </h3>
                      </button>
                    ) : (
                      <Link to={`/products/${tile.slug}`}>
                        <h3 className="font-serif font-bold text-vedic-dark text-base sm:text-lg leading-snug mb-3 hover:text-vedic-maroon transition-colors">
                          {tile.name}
                        </h3>
                      </Link>
                    )}

                    {/* Price sits on its own line and the Add button goes full-width right below
                        it on narrow phones — a 2-column card is too tight for "₹1,240 ₹1,590 Add"
                        to share one row without the strikethrough price colliding with the
                        button. From sm up (more room per card) it goes back to one row. */}
                    <div className="mt-auto pt-3 border-t border-vedic-beige flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <div className="flex items-baseline gap-1.5 min-w-0 flex-wrap">
                        <span className="text-base sm:text-lg font-extrabold text-vedic-dark">
                          ₹{tile.startingPrice.toLocaleString('en-IN')}
                        </span>
                        {tile.compareAtPrice > tile.startingPrice && (
                          <span className="text-xs sm:text-sm text-vedic-muted line-through">
                            ₹{tile.compareAtPrice.toLocaleString('en-IN')}
                          </span>
                        )}
                      </div>

                      <AddToCartControl
                        product={product}
                        disabled={!tile.inStock}
                        size="full"
                        className="w-full sm:w-auto justify-center sm:justify-start"
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* "Find Your Mukhi" — mobile-only fallback for the header link above (hidden on sm+) */}
        <div className="mt-6 text-center sm:hidden">
          <button
            onClick={() => setIsFinderOpen(true)}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-vedic-goldDark hover:text-vedic-maroon transition-colors"
          >
            Find Your Mukhi
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Find Your Mukhi — popup picker (all 1–14 Mukhi) */}
      {isFinderOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Select your Mukhi"
          onClick={() => setIsFinderOpen(false)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-vedic-dark/70 backdrop-blur-sm animate-in fade-in duration-200"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-2xl max-h-[85vh] overflow-y-auto bg-vedic-ivory border border-vedic-gold/25 rounded-3xl shadow-2xl p-6 sm:p-8 animate-in fade-in zoom-in-95 duration-200"
          >
            <button
              onClick={() => setIsFinderOpen(false)}
              aria-label="Close"
              className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white border border-vedic-gold/20 flex items-center justify-center text-vedic-muted hover:text-vedic-maroon hover:border-vedic-gold/40 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="text-center mb-6 sm:mb-7 pr-8">
              <span className="inline-flex items-center justify-center w-11 h-11 rounded-full bg-vedic-card mb-3">
                <Hash className="w-5 h-5 text-vedic-goldDark" strokeWidth={1.5} />
              </span>
              <p className="text-[11px] font-bold tracking-[0.15em] text-vedic-goldDark uppercase mb-1.5">
                Rudraksha Finder
              </p>
              <h3 className="font-serif font-semibold text-vedic-dark text-xl sm:text-2xl">
                Select Your Mukhi
              </h3>
              <p className="text-xs sm:text-sm text-vedic-muted mt-1.5">
                Choose from 1–14 Mukhi to explore the Rudraksha best suited to you.
              </p>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
              {(tiles.length > 0 ? tiles : Array.from({ length: 14 }, (_, i) => ({ mukhiNumber: i + 1 }))).map(
                (tile) => (
                  <button
                    key={tile.mukhiNumber}
                    onClick={() => goToMukhi(tile.mukhiNumber)}
                    className="flex flex-col items-center justify-center gap-1.5 py-3.5 px-2 rounded-xl border border-vedic-gold/20 bg-white hover:bg-vedic-gold hover:border-vedic-gold text-vedic-dark hover:text-white transition-colors"
                  >
                    <span className="text-base font-serif font-bold">{tile.mukhiNumber}</span>
                    <span className="text-[10px] font-semibold uppercase tracking-wide">Mukhi</span>
                  </button>
                )
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
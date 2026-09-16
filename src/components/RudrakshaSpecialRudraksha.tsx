import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Heart, ShoppingBag, Sparkles } from 'lucide-react';
import { getRudrakshaSpecialTiles, RudrakshaSpecialTile } from '../services/rudrakshaCatalogService';
import { Product } from '../types/ecommerce';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';

export interface RudrakshaSpecialRudrakshaProps {
  /** Fires with the special Rudraksha's slug chosen (e.g. "gauri-shankar-rudraksha").
   *  Defaults to a real navigation to /products/:slug — same destination every other
   *  Rudraksha product on this page already uses. */
  onSelectSpecial?: (slug: string) => void;
}

const CARD_SKELETON_COUNT = 4;

/** Same Product mapping approach as RudrakshaShopByMukhi.tsx, so "Add" here behaves exactly
 *  like every other product card on the site (cart, wishlist, CartDrawer all just work). */
function buildProductFromTile(tile: RudrakshaSpecialTile): Product {
  return {
    id: tile.id,
    title: tile.name,
    slug: tile.slug,
    category: 'rudraksha',
    description: tile.shortDescription,
    shortDescription: tile.shortDescription,
    images: [tile.image],
    price: tile.startingPrice,
    compareAtPrice: tile.startingPrice,
    discount: 0,
    rating: 0,
    reviewCount: 0,
    sku: `RUD-SPL-${tile.id.toUpperCase()}`,
    stock: 15,
    tags: ['rudraksha', 'special-rudraksha'],
    benefits: []
  };
}

/**
 * Section 10 (spec): Rare & Special Rudraksha — Gauri Shankar, Ganesha Rudraksha today, and
 * whatever an admin publishes next (Garbh Gauri, Nag Rudraksha, a Nepal/Collector piece, etc.)
 * via getRudrakshaSpecialTiles() (src/services/rudrakshaCatalogService.ts). Same
 * fetch/loading/empty-state pattern as the sections above, so this grid grows or shrinks with
 * the catalog automatically — no code changes when a new rare entry is added or retired.
 */
export const RudrakshaSpecialRudraksha: React.FC<RudrakshaSpecialRudrakshaProps> = ({ onSelectSpecial }) => {
  const [tiles, setTiles] = useState<RudrakshaSpecialTile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    getRudrakshaSpecialTiles().then((result) => {
      if (!isMounted) return;
      setTiles(result);
      setIsLoading(false);
    });
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <section id="special-rudraksha" className="bg-vedic-brown text-vedic-ivory">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        {/* Section Header — premium dark band, distinct from the ivory/white sections around it,
            matching the spec's "premium section" note for Rare & Special Rudraksha */}
        <div className="flex items-end justify-between gap-4 mb-6 sm:mb-8">
          <div>
            <p className="text-[11px] sm:text-xs font-bold tracking-[0.15em] text-vedic-gold uppercase mb-2 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" strokeWidth={1.5} />
              Special Rudraksha
            </p>
            <h2 className="font-serif font-semibold text-vedic-ivory text-2xl sm:text-3xl mb-2">
              Rare &amp; Special Rudraksha
            </h2>
            <p className="text-sm text-vedic-ivory/70 max-w-xl">
              Uncommon forms carrying their own distinct traditional significance.
            </p>
          </div>

          <Link
            to="/collections/rudraksha"
            className="hidden sm:inline-flex items-center gap-1.5 text-sm font-semibold text-vedic-gold hover:text-vedic-goldLight transition-colors whitespace-nowrap shrink-0"
          >
            View All Special Rudraksha
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Card Grid — 2 cols on phones, 4 from sm (a single row once every card fits) */}
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
            {Array.from({ length: CARD_SKELETON_COUNT }).map((_, i) => (
              <div
                key={i}
                className="rounded-2xl border border-vedic-gold/15 bg-vedic-ivory/5 overflow-hidden animate-pulse"
              >
                <div className="aspect-square bg-vedic-ivory/10" />
                <div className="p-4 sm:p-5 space-y-2.5">
                  <div className="h-3.5 w-3/4 bg-vedic-ivory/10 rounded" />
                  <div className="h-3 w-1/2 bg-vedic-ivory/10 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : tiles.length === 0 ? (
          // Graceful empty state — shows if the connected Shopify collection has no published
          // special-Rudraksha products yet, instead of a visible error.
          <div className="text-center py-10 border border-dashed border-vedic-gold/25 rounded-2xl">
            <p className="text-sm text-vedic-ivory/70">Special Rudraksha listings will appear here shortly.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
            {tiles.map((tile) => {
              const product = buildProductFromTile(tile);
              const isLiked = isInWishlist(tile.id);
              const handleCardClick = () => onSelectSpecial?.(tile.slug);

              const handleWishlistClick = (e: React.MouseEvent) => {
                e.preventDefault();
                e.stopPropagation();
                toggleWishlist(product);
              };

              const handleAddToCart = (e: React.MouseEvent) => {
                e.preventDefault();
                e.stopPropagation();
                addToCart(product, 1);
              };

              const imageBlock = (
                <img
                  src={tile.image}
                  alt={tile.name}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = `https://placehold.co/400x400/3D2B1F/E9A331?text=${encodeURIComponent(
                      tile.name
                    )}`;
                  }}
                />
              );

              return (
                <div
                  key={tile.id}
                  className="group relative bg-vedic-ivory/5 border border-vedic-gold/15 hover:border-vedic-gold/40 rounded-2xl overflow-hidden shadow-card hover:shadow-card-hover transition-all duration-300 flex flex-col"
                >
                  {/* Wishlist Button */}
                  <button
                    onClick={handleWishlistClick}
                    aria-label={isLiked ? 'Remove from Wishlist' : 'Add to Wishlist'}
                    title={isLiked ? 'Remove from Wishlist' : 'Add to Wishlist'}
                    className={`absolute top-3 right-3 z-10 w-9 h-9 rounded-full flex items-center justify-center backdrop-blur-md transition-all ${
                      isLiked
                        ? 'bg-red-50 text-red-600 shadow-md'
                        : 'bg-vedic-ivory/90 text-vedic-brown/50 hover:text-red-500 hover:bg-vedic-ivory shadow-sm'
                    }`}
                  >
                    <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
                  </button>

                  {/* Image */}
                  {onSelectSpecial ? (
                    <button
                      onClick={handleCardClick}
                      className="relative aspect-square w-full overflow-hidden block text-left"
                    >
                      {imageBlock}
                    </button>
                  ) : (
                    // TODO(Shopify): once each special entry maps to a real product handle,
                    // this Link target can stay exactly as-is.
                    <Link to={`/products/${tile.slug}`} className="relative aspect-square w-full overflow-hidden block">
                      {imageBlock}
                    </Link>
                  )}

                  {/* Content */}
                  <div className="p-4 sm:p-5 flex-1 flex flex-col">
                    <p className="text-[10px] sm:text-[11px] font-semibold text-vedic-gold uppercase tracking-wide mb-1">
                      {tile.rulingGod}
                    </p>

                    {onSelectSpecial ? (
                      <button onClick={handleCardClick} className="text-left">
                        <h3 className="font-serif font-bold text-vedic-ivory text-base sm:text-lg leading-snug mb-1.5">
                          {tile.name}
                        </h3>
                      </button>
                    ) : (
                      <Link to={`/products/${tile.slug}`}>
                        <h3 className="font-serif font-bold text-vedic-ivory text-base sm:text-lg leading-snug mb-1.5 hover:text-vedic-gold transition-colors">
                          {tile.name}
                        </h3>
                      </Link>
                    )}

                    <p className="text-xs sm:text-sm text-vedic-ivory/60 leading-relaxed line-clamp-2 mb-4">
                      {tile.shortDescription}
                    </p>

                    <div className="mt-auto pt-3 border-t border-vedic-ivory/10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <span className="text-base sm:text-lg font-extrabold text-vedic-ivory">
                        ₹{tile.startingPrice.toLocaleString('en-IN')}
                      </span>

                      <button
                        onClick={handleAddToCart}
                        title="Add to Cart"
                        className="w-full sm:w-auto inline-flex items-center justify-center sm:justify-start gap-1.5 bg-vedic-gold/15 hover:bg-vedic-gold text-vedic-gold hover:text-vedic-brown px-3.5 py-2 rounded-xl transition-all duration-200 border border-vedic-gold/30 hover:border-transparent text-xs sm:text-sm font-bold shrink-0"
                      >
                        <ShoppingBag className="w-4 h-4" />
                        Add
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* "View All Special Rudraksha" — mobile-only fallback for the header link above */}
        <div className="mt-6 text-center sm:hidden">
          <Link
            to="/collections/rudraksha"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-vedic-gold hover:text-vedic-goldLight transition-colors"
          >
            View All Special Rudraksha
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </section>
  );
};
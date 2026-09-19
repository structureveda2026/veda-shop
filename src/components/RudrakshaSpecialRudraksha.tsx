import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Heart, Sparkles } from 'lucide-react';
import {
  getRudrakshaSpecialTiles,
  getRudrakshaSpecialSectionContent,
  RudrakshaSpecialTile,
  RudrakshaSpecialSectionContent
} from '../services/rudrakshaCatalogService';
import { Product } from '../types/ecommerce';
import { useWishlist } from '../context/WishlistContext';
import { AddToCartControl } from './AddToCartControl';

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
const DEFAULT_SECTION_CONTENT: RudrakshaSpecialSectionContent = {
  eyebrow: 'Special Rudraksha',
  title: 'Rare & Special Rudraksha',
  subtitle: 'Uncommon forms carrying their own distinct traditional significance.',
  viewAllLabel: 'View All Special Rudraksha',
  viewAllHref: '/collections/rudraksha'
};

export const RudrakshaSpecialRudraksha: React.FC<RudrakshaSpecialRudrakshaProps> = ({ onSelectSpecial }) => {
  const [tiles, setTiles] = useState<RudrakshaSpecialTile[]>([]);
  const [content, setContent] = useState<RudrakshaSpecialSectionContent>(DEFAULT_SECTION_CONTENT);
  const [isLoading, setIsLoading] = useState(true);
  const { toggleWishlist, isInWishlist } = useWishlist();

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    // Section copy (eyebrow/title/subtitle/CTA) and the 4 cards both come from the same
    // swappable service layer — fetched together so nothing shifts on screen once either
    // resolves. DEFAULT_SECTION_CONTENT above is only ever a render-before-fetch placeholder.
    Promise.all([getRudrakshaSpecialTiles(), getRudrakshaSpecialSectionContent()]).then(
      ([tileResult, contentResult]) => {
        if (!isMounted) return;
        setTiles(tileResult);
        setContent(contentResult);
        setIsLoading(false);
      }
    );
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <section id="special-rudraksha" className="relative overflow-hidden bg-gradient-to-b from-vedic-ivory via-vedic-card to-vedic-ivory">
      {/* Light theme, matching every other Rudraksha section (white/ivory + gold accents) —
          no dark or maroon band. A soft gold glow behind the heading, a very fine gold dot
          texture, and hairline top/bottom frames give it a bit more presence than a flat fill,
          without turning it into its own heavy design. No mandala artwork (design system rule). */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_15%_0%,rgba(245,176,65,0.16),transparent_65%)]" />
      <div
        className="absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage: 'radial-gradient(circle, #E9A331 1px, transparent 1px)',
          backgroundSize: '26px 26px'
        }}
      />
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-vedic-gold/50 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-vedic-gold/50 to-transparent" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        {/* Section Header — left-aligned, same pattern as every other Rudraksha section */}
        <div className="flex items-end justify-between gap-4 mb-6 sm:mb-8">
          <div>
            <p className="text-[11px] sm:text-xs font-bold tracking-[0.15em] text-vedic-goldDark uppercase mb-2 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" strokeWidth={1.5} />
              {content.eyebrow}
            </p>
            <h2 className="font-serif font-semibold text-vedic-dark text-2xl sm:text-3xl mb-2">
              {content.title}
            </h2>
            <p className="text-sm text-vedic-muted max-w-xl">{content.subtitle}</p>
          </div>

          <Link
            to={content.viewAllHref}
            className="hidden sm:inline-flex items-center gap-1.5 text-sm font-semibold text-vedic-goldDark hover:text-vedic-maroon transition-colors whitespace-nowrap shrink-0"
          >
            {content.viewAllLabel}
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Card Grid — 2 cols on phones, 4 from sm (a single row once every card fits) */}
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
            {Array.from({ length: CARD_SKELETON_COUNT }).map((_, i) => (
              <div
                key={i}
                className="rounded-2xl border border-vedic-gold/10 bg-white overflow-hidden animate-pulse"
              >
                <div className="aspect-square bg-vedic-card" />
                <div className="p-4 sm:p-5 space-y-2.5">
                  <div className="h-3.5 w-3/4 bg-vedic-card rounded" />
                  <div className="h-3 w-1/2 bg-vedic-card rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : tiles.length === 0 ? (
          // Graceful empty state — shows if the connected Shopify collection has no published
          // special-Rudraksha products yet, instead of a visible error.
          <div className="text-center py-10 border border-dashed border-vedic-gold/25 rounded-2xl">
            <p className="text-sm text-vedic-muted">Special Rudraksha listings will appear here shortly.</p>
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

              const imageBlock = (
                <img
                  src={tile.image}
                  alt={tile.name}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = `https://placehold.co/400x400/E9A331/FFF5DE?text=${encodeURIComponent(
                      tile.name
                    )}`;
                  }}
                />
              );

              // Same card shell used everywhere else on the site (Bestsellers, Shop By Mukhi) —
              // bg-white / vedic-gold hairline border / shadow-card — just without the
              // rating/discount rows this simpler "special" tile shape doesn't carry.
              return (
                <div
                  key={tile.id}
                  className="group relative bg-white border border-vedic-gold/15 hover:border-vedic-gold/30 rounded-2xl overflow-hidden shadow-card hover:shadow-card-hover transition-all duration-300 flex flex-col"
                >
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
                  <div className="p-4 sm:p-5 flex-1 flex flex-col bg-white">
                    <p className="text-[10px] sm:text-[11px] font-semibold text-vedic-goldDark uppercase tracking-wide mb-1">
                      {tile.rulingGod}
                    </p>

                    {onSelectSpecial ? (
                      <button onClick={handleCardClick} className="text-left">
                        <h3 className="font-serif font-bold text-vedic-dark text-base sm:text-lg leading-snug mb-1.5">
                          {tile.name}
                        </h3>
                      </button>
                    ) : (
                      <Link to={`/products/${tile.slug}`}>
                        <h3 className="font-serif font-bold text-vedic-dark text-base sm:text-lg leading-snug mb-1.5 hover:text-vedic-maroon transition-colors">
                          {tile.name}
                        </h3>
                      </Link>
                    )}

                    <p className="text-xs sm:text-sm text-vedic-muted leading-relaxed line-clamp-2 mb-4">
                      {tile.shortDescription}
                    </p>

                    <div className="mt-auto pt-3 border-t border-vedic-beige flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <span className="text-base sm:text-lg font-extrabold text-vedic-dark">
                        ₹{tile.startingPrice.toLocaleString('en-IN')}
                      </span>

                      <AddToCartControl
                        product={product}
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

        {/* "View All Special Rudraksha" — mobile-only fallback for the header link above */}
        <div className="mt-6 text-center sm:hidden">
          <Link
            to={content.viewAllHref}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-vedic-goldDark hover:text-vedic-maroon transition-colors"
          >
            {content.viewAllLabel}
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </section>
  );
};
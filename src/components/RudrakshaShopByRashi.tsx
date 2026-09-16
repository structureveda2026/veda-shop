import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Compass,
  Flame,
  Gem,
  Users,
  Home,
  Crown,
  Leaf,
  Scale,
  Waves,
  Target,
  Mountain,
  Lightbulb,
  Fish,
  type LucideIcon
} from 'lucide-react';
import { getRashiTiles, RashiTile } from '../services/rashiService';

export interface RudrakshaShopByRashiProps {
  /** Fires with the Rashi slug chosen (e.g. "mesh"). Defaults to a real Link to /rashi/:slug —
   *  the same detail page the site's existing Rashi directory (/rashi) already links to. */
  onSelectRashi?: (rashiSlug: string) => void;
}

const CARD_SKELETON_COUNT = 12;

/**
 * One SVG icon per Rashi — same lucide-react set used across the rest of the storefront, so
 * these read as icons rather than emoji glyphs. Each pick reflects that sign's own symbolism
 * (its animal/figure, ruling element or core trait), not just a repeated 4-way element icon, so
 * all 12 cards stay visually distinct. Keyed by RASHI_LIST's slug (src/data/rashiData.ts) — a
 * Rashi with no entry here falls back to Compass so the grid never renders a blank icon.
 */
const RASHI_ICON: Record<string, LucideIcon> = {
  mesh: Flame, // Aries — the Ram, fire, drive
  vrishabh: Gem, // Taurus — Venus-ruled, grounded love of beauty
  mithun: Users, // Gemini — the Twins
  kark: Home, // Cancer — the Crab, home and nurture
  singh: Crown, // Leo — the Lion, regal confidence
  kanya: Leaf, // Virgo — the Maiden, earth and purity
  tula: Scale, // Libra — the Scales
  vrishchik: Waves, // Scorpio — deep, transformative water
  dhanu: Target, // Sagittarius — the Archer
  makar: Mountain, // Capricorn — the Sea-Goat, discipline and climb
  kumbh: Lightbulb, // Aquarius — the innovator, ideas
  meen: Fish // Pisces — the Fish
};

/**
 * Section 8 (spec): Shop By Rashi — "Rudraksha by Rashi". Data comes from getRashiTiles()
 * (src/services/rashiService.ts), the same fetch-then-render pattern as the Shop By Mukhi grid,
 * so an admin adding, editing or unpublishing a Rashi entry in Shopify changes this grid with no
 * code changes. id="shop-by-rashi" is exactly the anchor the Quick Finder's "Choose by Rashi"
 * panel already scrolls to when no onSelectRashi is wired there.
 */
export const RudrakshaShopByRashi: React.FC<RudrakshaShopByRashiProps> = ({ onSelectRashi }) => {
  const [tiles, setTiles] = useState<RashiTile[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    getRashiTiles().then((result) => {
      if (!isMounted) return;
      setTiles(result);
      setIsLoading(false);
    });
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <section id="shop-by-rashi" className="bg-vedic-ivory">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        {/* Section Header — same left-aligned pattern as every other Rudraksha section */}
        <div className="flex items-end justify-between gap-4 mb-6 sm:mb-8">
          <div>
            <p className="text-[11px] sm:text-xs font-bold tracking-[0.15em] text-vedic-goldDark uppercase mb-2">
              Shop By Rashi
            </p>
            <h2 className="font-serif font-semibold text-vedic-dark text-2xl sm:text-3xl mb-2">
              Rudraksha by Rashi
            </h2>
            <p className="text-sm text-vedic-muted max-w-xl">
              Traditional Vedic pairings for each of the 12 Rashis — a general starting point
              before a personalized consultation.
            </p>
          </div>

          <Link
            to="/rashi"
            className="hidden sm:inline-flex items-center gap-1.5 text-sm font-semibold text-vedic-goldDark hover:text-vedic-maroon transition-colors whitespace-nowrap shrink-0"
          >
            Find Rudraksha for My Rashi
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Card Grid — 3 cols on phones, 4 from sm, 6 from md (2 rows on desktop) */}
        {isLoading ? (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3 sm:gap-4">
            {Array.from({ length: CARD_SKELETON_COUNT }).map((_, i) => (
              <div
                key={i}
                className="rounded-2xl border border-vedic-gold/10 bg-white p-4 sm:p-5 flex flex-col items-center gap-2.5 animate-pulse"
              >
                <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-vedic-card" />
                <div className="h-3 w-3/4 bg-vedic-card rounded" />
                <div className="h-2.5 w-1/2 bg-vedic-card rounded" />
              </div>
            ))}
          </div>
        ) : tiles.length === 0 ? (
          // Graceful empty state — shows if the connected Shopify metaobject list has no
          // published entries yet, instead of a visible error.
          <div className="text-center py-10 border border-dashed border-vedic-gold/25 rounded-2xl">
            <p className="text-sm text-vedic-muted">Rashi guidance will appear here shortly.</p>
          </div>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3 sm:gap-4">
            {tiles.map((tile) => {
              const RashiIcon = RASHI_ICON[tile.slug] ?? Compass;
              const cardClassName =
                'group text-center rounded-2xl border border-vedic-gold/15 hover:border-vedic-gold/40 bg-white hover:shadow-card-hover p-3.5 sm:p-5 flex flex-col items-center gap-2 sm:gap-2.5 transition-all h-full';

              const cardContent = (
                <>
                  <span className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-vedic-card flex items-center justify-center group-hover:bg-vedic-gold/15 transition-colors">
                    <RashiIcon className="w-5 h-5 sm:w-[22px] sm:h-[22px] text-vedic-goldDark" strokeWidth={1.5} />
                  </span>
                  <div>
                    <h3 className="font-serif font-semibold text-vedic-dark text-[13px] sm:text-base leading-snug">
                      {tile.nameEn}
                    </h3>
                    <p className="text-[10px] sm:text-xs text-vedic-muted mt-0.5">{tile.nameHi}</p>
                  </div>
                  <p className="text-[10px] sm:text-[11px] text-vedic-muted leading-relaxed">
                    {tile.rulingPlanet}
                  </p>
                  <span className="mt-auto inline-flex items-center gap-1 text-[11px] sm:text-xs font-semibold text-vedic-goldDark group-hover:text-vedic-maroon transition-colors">
                    Explore
                    <ArrowRight className="w-3 h-3" />
                  </span>
                </>
              );

              return onSelectRashi ? (
                <button key={tile.id} onClick={() => onSelectRashi(tile.slug)} className={cardClassName}>
                  {cardContent}
                </button>
              ) : (
                // TODO(Shopify): once Rashi is a real metaobject handle, this Link target can
                // stay exactly as-is — /rashi/:slug already resolves against RASHI_LIST today
                // and against the live metaobject list once rashiService.ts is swapped over.
                <Link key={tile.id} to={`/rashi/${tile.slug}`} className={cardClassName}>
                  {cardContent}
                </Link>
              );
            })}
          </div>
        )}

        {/* Compliance note — per spec section 8: Rashi guidance is general, not a final
            astrological prescription. */}
        <p className="text-[11px] text-vedic-muted mt-5 sm:mt-6 italic flex items-start gap-1.5">
          <Compass className="w-3.5 h-3.5 shrink-0 mt-px" />
          Rashi-based guidance is general. For a personalized recommendation, consult an
          astrologer.
        </p>

        {/* "Find Rudraksha for My Rashi" — mobile-only fallback for the header link above */}
        <div className="mt-4 text-center sm:hidden">
          <Link
            to="/rashi"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-vedic-goldDark hover:text-vedic-maroon transition-colors"
          >
            Find Rudraksha for My Rashi
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </section>
  );
};
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Sun,
  Moon,
  Zap,
  MessageCircle,
  BookOpen,
  Heart,
  Hourglass,
  Compass,
  Eye,
  type LucideIcon
} from 'lucide-react';
import { getRudrakshaPlanetTiles, RudrakshaPlanetTile } from '../services/rudrakshaPlanetService';

export interface RudrakshaShopByPlanetProps {
  /** Fires with the planet slug chosen (e.g. "sun"). Defaults to a real Link to
   *  /planets/:planetSlug — the same planet page the Gemstone side already links to, so the
   *  whole store shares one Navagraha identity. */
  onSelectPlanet?: (planetSlug: string) => void;
}

const CARD_SKELETON_COUNT = 9;

/**
 * One SVG icon per Navagraha planet — same lucide-react set used across the rest of the
 * storefront (no emoji glyphs), each chosen for what that planet traditionally governs rather
 * than a literal planetary symbol. Keyed by PLANET_LIST's own slug (src/data/gemstoneData.ts) —
 * a planet with no entry here falls back to Compass so the grid never renders a blank icon.
 */
const PLANET_ICON: Record<string, LucideIcon> = {
  sun: Sun, // Surya — vitality, leadership
  moon: Moon, // Chandra — mind, emotion
  mars: Zap, // Mangal — energy, courage
  mercury: MessageCircle, // Budh — intellect, communication
  jupiter: BookOpen, // Guru — wisdom, fortune
  venus: Heart, // Shukra — love, luxury
  saturn: Hourglass, // Shani — karma, discipline, time
  rahu: Compass, // Rahu — ambition, foreign, direction
  ketu: Eye // Ketu — intuition, inner vision
};

/**
 * Section 9 (spec): Shop By Planet — "Rudraksha by Planet". Data comes from
 * getRudrakshaPlanetTiles() (src/services/rudrakshaPlanetService.ts), which pairs the site's
 * existing 9 Navagraha planets with whichever Mukhis are currently associated with each — same
 * fetch-then-render pattern as Shop By Mukhi and Shop By Rashi above, so it stays in sync with
 * Shopify automatically once that service is swapped over. id="shop-by-planet" is a real anchor
 * other entry points (e.g. a future Quick Finder "By Planet" option) can scroll straight to.
 */
export const RudrakshaShopByPlanet: React.FC<RudrakshaShopByPlanetProps> = ({ onSelectPlanet }) => {
  const [tiles, setTiles] = useState<RudrakshaPlanetTile[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    getRudrakshaPlanetTiles().then((result) => {
      if (!isMounted) return;
      setTiles(result);
      setIsLoading(false);
    });
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <section id="shop-by-planet" className="bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        {/* Section Header — same left-aligned pattern as every other Rudraksha section */}
        <div className="flex items-end justify-between gap-4 mb-6 sm:mb-8">
          <div>
            <p className="text-[11px] sm:text-xs font-bold tracking-[0.15em] text-vedic-goldDark uppercase mb-2">
              Shop By Planet
            </p>
            <h2 className="font-serif font-semibold text-vedic-dark text-2xl sm:text-3xl mb-2">
              Rudraksha by Planet
            </h2>
            <p className="text-sm text-vedic-muted max-w-xl">
              Each Navagraha planet is traditionally paired with specific Mukhis — a general
              starting point before a personalized consultation.
            </p>
          </div>

          <Link
            to="/collections/rudraksha"
            className="hidden sm:inline-flex items-center gap-1.5 text-sm font-semibold text-vedic-goldDark hover:text-vedic-maroon transition-colors whitespace-nowrap shrink-0"
          >
            Explore Planetary Guidance
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Card Grid — 3 cols on phones, 5 from sm, 9 (single row) from lg */}
        {isLoading ? (
          <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-9 gap-3 sm:gap-4">
            {Array.from({ length: CARD_SKELETON_COUNT }).map((_, i) => (
              <div
                key={i}
                className="rounded-2xl border border-vedic-gold/10 bg-vedic-ivory p-4 sm:p-5 flex flex-col items-center gap-2.5 animate-pulse"
              >
                <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-vedic-card" />
                <div className="h-3 w-3/4 bg-vedic-card rounded" />
                <div className="h-2.5 w-1/2 bg-vedic-card rounded" />
              </div>
            ))}
          </div>
        ) : tiles.length === 0 ? (
          // Graceful empty state — shows if the planet/Mukhi source returns nothing, instead of
          // a visible error.
          <div className="text-center py-10 border border-dashed border-vedic-gold/25 rounded-2xl">
            <p className="text-sm text-vedic-muted">Planetary guidance will appear here shortly.</p>
          </div>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-9 gap-3 sm:gap-4">
            {tiles.map((tile) => {
              const PlanetIcon = PLANET_ICON[tile.slug] ?? Compass;
              const cardClassName =
                'group text-center rounded-2xl border border-vedic-gold/15 hover:border-vedic-gold/40 bg-vedic-ivory hover:shadow-card-hover p-3.5 sm:p-4 flex flex-col items-center gap-2 transition-all h-full';

              const cardContent = (
                <>
                  <span className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-white flex items-center justify-center group-hover:bg-vedic-gold/15 transition-colors">
                    <PlanetIcon className="w-5 h-5 sm:w-[22px] sm:h-[22px] text-vedic-goldDark" strokeWidth={1.5} />
                  </span>
                  <h3 className="font-serif font-semibold text-vedic-dark text-[12px] sm:text-sm leading-snug">
                    {tile.planetName.split(' (')[0]}
                  </h3>
                  <p className="text-[10px] sm:text-[11px] text-vedic-muted leading-snug">
                    {tile.matchedMukhiNumbers.length > 0
                      ? `${tile.matchedMukhiNumbers.join(', ')} Mukhi`
                      : 'Coming soon'}
                  </p>
                </>
              );

              return onSelectPlanet ? (
                <button key={tile.id} onClick={() => onSelectPlanet(tile.slug)} className={cardClassName}>
                  {cardContent}
                </button>
              ) : (
                // TODO(Shopify): once each Mukhi carries a real associated_planet metafield,
                // this Link target can stay exactly as-is.
                <Link key={tile.id} to={`/planets/${tile.slug}`} className={cardClassName}>
                  {cardContent}
                </Link>
              );
            })}
          </div>
        )}

        {/* "Explore Planetary Guidance" — mobile-only fallback for the header link above */}
        <div className="mt-4 text-center sm:hidden">
          <Link
            to="/collections/rudraksha"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-vedic-goldDark hover:text-vedic-maroon transition-colors"
          >
            Explore Planetary Guidance
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </section>
  );
};
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight, BookOpen, Compass, Eye, Heart, Hourglass, MessageCircle, Moon, Sun, Zap,
  type LucideIcon
} from 'lucide-react';
import { getBraceletPlanetTiles, PlanetBraceletTile } from '../services/braceletCatalogService';

const PLANET_ICON: Record<string, LucideIcon> = {
  sun: Sun,
  moon: Moon,
  mars: Zap,
  mercury: MessageCircle,
  jupiter: BookOpen,
  venus: Heart,
  saturn: Hourglass,
  rahu: Compass,
  ketu: Eye
};

/** Section 10 (spec): Shop By Planet. Reuses the store's 9 Navagraha planets (PLANET_LIST) and
 *  matches each planet's own gemstone associations against the real bracelet catalog — same
 *  "one planet identity across the store" approach used on the Rudraksha side. Spec notes this
 *  section will connect to a combined Gemstone + Rudraksha + Bracelet recommendation system
 *  later — the matching function is the only thing that swap replaces. */
export const BraceletShopByPlanet: React.FC = () => {
  const [tiles, setTiles] = useState<PlanetBraceletTile[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    getBraceletPlanetTiles().then((result) => {
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
        <div className="flex items-end justify-between gap-4 mb-6 sm:mb-8">
          <div>
            <p className="text-[11px] sm:text-xs font-bold tracking-[0.15em] text-vedic-goldDark uppercase mb-2">
              Shop By Planet
            </p>
            <h2 className="font-serif font-semibold text-vedic-dark text-2xl sm:text-3xl">Bracelet by Planet</h2>
          </div>
          <Link
            to="/collections/bracelets"
            className="hidden sm:inline-flex items-center gap-1.5 text-sm font-semibold text-vedic-goldDark hover:text-vedic-maroon transition-colors whitespace-nowrap shrink-0"
          >
            Explore Planetary Guidance
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-9 gap-3 sm:gap-4">
            {Array.from({ length: 9 }).map((_, i) => (
              <div key={i} className="rounded-2xl border border-vedic-gold/10 bg-vedic-ivory p-4 h-24 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-9 gap-3 sm:gap-4">
            {tiles.map((tile) => {
              const PlanetIcon = PLANET_ICON[tile.slug] ?? Compass;
              return (
                <Link
                  key={tile.id}
                  to={`/planets/${tile.slug}`}
                  className="group text-center rounded-2xl border border-vedic-gold/15 hover:border-vedic-gold/40 bg-vedic-ivory hover:shadow-card-hover p-3.5 sm:p-4 flex flex-col items-center gap-2 transition-all h-full"
                >
                  <span className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-white flex items-center justify-center group-hover:bg-vedic-gold/15 transition-colors">
                    <PlanetIcon className="w-5 h-5 sm:w-[22px] sm:h-[22px] text-vedic-goldDark" strokeWidth={1.5} />
                  </span>
                  <h3 className="font-serif font-semibold text-vedic-dark text-[12px] sm:text-sm leading-snug">
                    {tile.planetName.split(' (')[0]}
                  </h3>
                  <p className="text-[10px] sm:text-[11px] text-vedic-muted leading-snug line-clamp-1">
                    {tile.matchedProduct ? tile.matchedProduct.title : 'Coming soon'}
                  </p>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};
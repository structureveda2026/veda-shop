import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight, Compass, Crown, Fish, Flame, Gem, Home, Leaf, Lightbulb, Mountain, Scale, Target, Users, Waves,
  type LucideIcon
} from 'lucide-react';
import { getBraceletRashiTiles, RashiBraceletTile } from '../services/braceletCatalogService';

// Same per-sign icon assignment as RudrakshaShopByRashi.tsx, kept in sync so a Rashi reads the
// same visual identity everywhere in the store.
const RASHI_ICON: Record<string, LucideIcon> = {
  mesh: Flame,
  vrishabh: Gem,
  mithun: Users,
  kark: Home,
  singh: Crown,
  kanya: Leaf,
  tula: Scale,
  vrishchik: Waves,
  dhanu: Target,
  makar: Mountain,
  kumbh: Lightbulb,
  meen: Fish
};

/** Section 9 (spec): Shop By Rashi — reuses the store's one shared Rashi identity (RASHI_LIST)
 *  and each Rashi's own recommendedBracelet text, matched against the real bracelet catalog. */
export const BraceletShopByRashi: React.FC = () => {
  const [tiles, setTiles] = useState<RashiBraceletTile[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    getBraceletRashiTiles().then((result) => {
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
        <div className="flex items-end justify-between gap-4 mb-6 sm:mb-8">
          <div>
            <p className="text-[11px] sm:text-xs font-bold tracking-[0.15em] text-vedic-goldDark uppercase mb-2">
              Shop By Rashi
            </p>
            <h2 className="font-serif font-semibold text-vedic-dark text-2xl sm:text-3xl mb-2">Bracelet by Rashi</h2>
            <p className="text-sm text-vedic-muted max-w-xl">
              Traditional Vedic pairings for each of the 12 Rashis — a general starting point
              before a personalized consultation.
            </p>
          </div>
          <Link
            to="/rashi"
            className="hidden sm:inline-flex items-center gap-1.5 text-sm font-semibold text-vedic-goldDark hover:text-vedic-maroon transition-colors whitespace-nowrap shrink-0"
          >
            Find Bracelet for My Rashi
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3 sm:gap-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="rounded-2xl border border-vedic-gold/10 bg-white p-4 h-28 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3 sm:gap-4">
            {tiles.map((tile) => {
              const RashiIcon = RASHI_ICON[tile.slug] ?? Compass;
              return (
                <Link
                  key={tile.id}
                  to={`/rashi/${tile.slug}`}
                  className="group text-center rounded-2xl border border-vedic-gold/15 hover:border-vedic-gold/40 bg-white hover:shadow-card-hover p-3.5 sm:p-5 flex flex-col items-center gap-2 transition-all h-full"
                >
                  <span className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-vedic-card flex items-center justify-center group-hover:bg-vedic-gold/15 transition-colors">
                    <RashiIcon className="w-5 h-5 sm:w-[22px] sm:h-[22px] text-vedic-goldDark" strokeWidth={1.5} />
                  </span>
                  <div>
                    <h3 className="font-serif font-semibold text-vedic-dark text-[13px] sm:text-base leading-snug">
                      {tile.nameEn}
                    </h3>
                    <p className="text-[10px] sm:text-xs text-vedic-muted mt-0.5">{tile.nameHi}</p>
                  </div>
                  <p className="text-[10px] sm:text-[11px] text-vedic-muted leading-relaxed line-clamp-2">
                    {tile.matchedProduct ? tile.matchedProduct.title : tile.recommendedBracelet}
                  </p>
                </Link>
              );
            })}
          </div>
        )}

        <p className="text-[11px] text-vedic-muted mt-5 sm:mt-6 italic flex items-start gap-1.5">
          <Compass className="w-3.5 h-3.5 shrink-0 mt-px" />
          Rashi-based recommendation is general guidance. For a personalized recommendation,
          consult an astrologer.
        </p>
      </div>
    </section>
  );
};
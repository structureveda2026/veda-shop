import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Circle, Crown, Gem, Layers, Sparkles, Wand2, type LucideIcon } from 'lucide-react';
import { getBraceletCategoryTiles, BraceletTile } from '../services/braceletCatalogService';

const CATEGORY_ICON: Record<string, LucideIcon> = {
  rudraksha: Circle,
  gemstone: Gem,
  crystal: Sparkles,
  karungali: Circle,
  combination: Layers,
  premium: Crown,
  custom: Wand2
};

/** Section 3 (spec): Quick Category Navigation — horizontal cards, one per bracelet type. */
export const BraceletCategoryNav: React.FC = () => {
  const [tiles, setTiles] = useState<BraceletTile[]>([]);

  useEffect(() => {
    let isMounted = true;
    getBraceletCategoryTiles().then((result) => {
      if (isMounted) setTiles(result);
    });
    return () => {
      isMounted = false;
    };
  }, []);

  if (tiles.length === 0) return null;

  return (
    <section className="bg-vedic-ivory">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="flex items-end justify-between gap-4 mb-6 sm:mb-8">
          <div>
            <p className="text-[11px] sm:text-xs font-bold tracking-[0.15em] text-vedic-goldDark uppercase mb-2">
              Quick Categories
            </p>
            <h2 className="font-serif font-semibold text-vedic-dark text-2xl sm:text-3xl">
              Shop Bracelets by Type
            </h2>
          </div>
          <Link
            to="/collections/bracelets"
            className="hidden sm:inline-flex items-center gap-1.5 text-sm font-semibold text-vedic-goldDark hover:text-vedic-maroon transition-colors whitespace-nowrap shrink-0"
          >
            Explore All
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          {tiles.map((tile) => {
            const Icon = CATEGORY_ICON[tile.id] ?? Gem;
            return (
              <Link
                key={tile.id}
                to={tile.href}
                className="group text-left rounded-2xl border border-vedic-gold/15 hover:border-vedic-gold/40 bg-white hover:shadow-card-hover p-4 sm:p-5 flex flex-col gap-2.5 sm:gap-3 transition-all h-full"
              >
                <span className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-vedic-card flex items-center justify-center">
                  <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-vedic-goldDark" strokeWidth={1.5} />
                </span>
                <div>
                  <h3 className="font-serif font-semibold text-vedic-dark text-[13px] sm:text-base mb-1 leading-snug">
                    {tile.title}
                  </h3>
                  <p className="text-[11px] sm:text-sm text-vedic-muted leading-relaxed">{tile.description}</p>
                </div>
                <span className="mt-auto inline-flex items-center gap-1 text-[11px] sm:text-xs font-semibold text-vedic-goldDark group-hover:text-vedic-maroon transition-colors">
                  Explore
                  <ArrowRight className="w-3 h-3" />
                </span>
              </Link>
            );
          })}
        </div>

        <div className="mt-4 text-center sm:hidden">
          <Link
            to="/collections/bracelets"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-vedic-goldDark hover:text-vedic-maroon transition-colors"
          >
            Explore All
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </section>
  );
};
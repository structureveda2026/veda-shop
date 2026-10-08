import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, Coins, Flame, Home, Moon, Orbit, Shield, Sparkles, type LucideIcon } from 'lucide-react';
import { buildTypeTiles, type YantraView } from '../services/yantraCatalogService';

const TYPE_ICON: Record<string, LucideIcon> = {
  'shree-yantra': Sparkles,
  'kuber-yantra': Coins,
  'mahamrityunjay-yantra': Moon,
  'navgraha-yantra': Orbit,
  'vastu-yantra': Home,
  'durga-yantra': Shield,
  'saraswati-yantra': BookOpen,
  'ganesh-yantra': Flame
};

export interface YantraTypeNavProps {
  yantras: YantraView[];
  activeType: string;
  onSelect: (typeSlug: string) => void;
}

/** Section 3: "Shop by Yantra". One tile per subcategory of the `yantra` category (data/categories.ts) — add a
 *  subcategory there and a tile appears here with no code change. Tapping a tile filters the finder below. */
export const YantraTypeNav: React.FC<YantraTypeNavProps> = ({ yantras, activeType, onSelect }) => {
  const tiles = useMemo(() => buildTypeTiles(yantras), [yantras]);
  if (tiles.length === 0) return null;

  return (
    <section id="yantra-types" className="bg-vedic-ivory scroll-mt-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="flex items-end justify-between gap-4 mb-6 sm:mb-8">
          <div>
            <p className="text-[11px] sm:text-xs font-bold tracking-[0.15em] text-vedic-goldDeep uppercase mb-2">Shop By Yantra</p>
            <h2 className="font-serif font-semibold text-vedic-dark text-2xl sm:text-3xl">Choose the Yantra You Are Looking For</h2>
          </div>
          <Link
            to="/collections/yantra"
            className="hidden sm:inline-flex items-center gap-1.5 text-sm font-semibold text-vedic-goldDeep hover:text-vedic-maroon transition-colors whitespace-nowrap shrink-0"
          >
            View All Yantras <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {tiles.map((tile) => {
            const Icon = TYPE_ICON[tile.slug] ?? Sparkles;
            const available = tile.count > 0;
            const active = activeType === tile.slug;
            return (
              <button
                key={tile.slug}
                type="button"
                disabled={!available}
                aria-pressed={active}
                onClick={() => onSelect(tile.slug)}
                className={`group text-left rounded-2xl border p-4 sm:p-5 flex flex-col gap-2.5 sm:gap-3 h-full transition-all ${
                  active
                    ? 'bg-vedic-card border-vedic-gold shadow-card-hover'
                    : available
                    ? 'bg-white border-vedic-gold/15 hover:border-vedic-gold/40 hover:shadow-card-hover'
                    : 'bg-white/60 border-vedic-gold/10 opacity-70 cursor-not-allowed'
                }`}
              >
                <span className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-vedic-card flex items-center justify-center">
                  <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-vedic-goldDeep" strokeWidth={1.5} />
                </span>
                <div>
                  <h3 className="font-serif font-semibold text-vedic-dark text-[13px] sm:text-base mb-1 leading-snug">{tile.title}</h3>
                  <p className="text-[11px] sm:text-xs text-vedic-muted leading-relaxed line-clamp-2">{tile.description}</p>
                </div>
                <span className="mt-auto text-[11px] sm:text-xs font-semibold text-vedic-goldDeep group-hover:text-vedic-maroon transition-colors">
                  {available
                    ? `${tile.count} ${tile.count === 1 ? 'yantra' : 'yantras'}${tile.startingPrice ? ` · from ₹${tile.startingPrice.toLocaleString('en-IN')}` : ''}`
                    : 'Coming soon'}
                </span>
              </button>
            );
          })}
        </div>

        <div className="mt-5 text-center sm:hidden">
          <Link to="/collections/yantra" className="inline-flex items-center gap-1.5 text-sm font-semibold text-vedic-goldDeep hover:text-vedic-maroon transition-colors">
            View All Yantras <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </section>
  );
};
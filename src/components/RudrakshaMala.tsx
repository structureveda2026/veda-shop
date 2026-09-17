import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Circle } from 'lucide-react';
import { getRudrakshaMalaTypes, RudrakshaTypeTile } from '../services/rudrakshaJewelleryService';

const TILE_SKELETON_COUNT = 7;

/**
 * Section 11 (spec): Rudraksha Mala Collection. A "shop by type" grid rather than priced
 * product cards — see the note on getRudrakshaMalaTypes (rudrakshaJewelleryService.ts) for why.
 * Kept as its own section, separate from Rudraksha Jewellery below, per spec's own separation.
 */
export const RudrakshaMala: React.FC = () => {
  const [types, setTypes] = useState<RudrakshaTypeTile[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    getRudrakshaMalaTypes().then((result) => {
      if (!isMounted) return;
      setTypes(result);
      setIsLoading(false);
    });
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <section id="rudraksha-mala" className="bg-vedic-ivory">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="flex items-end justify-between gap-4 mb-6 sm:mb-8">
          <div>
            <p className="text-[11px] sm:text-xs font-bold tracking-[0.15em] text-vedic-goldDark uppercase mb-2">
              Mala Collection
            </p>
            <h2 className="font-serif font-semibold text-vedic-dark text-2xl sm:text-3xl mb-2">
              Rudraksha Mala Collection
            </h2>
            <p className="text-sm text-vedic-muted max-w-xl">
              Japa malas strung for daily mantra practice, from single-Mukhi to premium
              combination pieces.
            </p>
          </div>
          <Link
            to="/collections/mala"
            className="hidden sm:inline-flex items-center gap-1.5 text-sm font-semibold text-vedic-goldDark hover:text-vedic-maroon transition-colors whitespace-nowrap shrink-0"
          >
            Shop Rudraksha Mala
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
            {Array.from({ length: TILE_SKELETON_COUNT }).map((_, i) => (
              <div key={i} className="rounded-2xl border border-vedic-gold/10 bg-white p-5 animate-pulse h-28" />
            ))}
          </div>
        ) : types.length === 0 ? (
          <div className="text-center py-10 border border-dashed border-vedic-gold/25 rounded-2xl">
            <p className="text-sm text-vedic-muted">Mala listings will appear here shortly.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
            {types.map((type) => (
              <Link
                key={type.id}
                to={type.href}
                className="group bg-white border border-vedic-gold/15 hover:border-vedic-gold/40 rounded-2xl p-5 flex flex-col gap-2.5 transition-all duration-300 hover:-translate-y-1 hover:shadow-card-hover"
              >
                <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-vedic-card group-hover:bg-vedic-gold/20 transition-colors">
                  <Circle className="w-4 h-4 text-vedic-goldDark" strokeWidth={1.5} />
                </span>
                <h3 className="font-serif font-bold text-vedic-dark text-sm sm:text-base leading-snug">
                  {type.label}
                </h3>
                <p className="text-xs text-vedic-muted leading-relaxed line-clamp-2">{type.description}</p>
              </Link>
            ))}
          </div>
        )}

        <div className="mt-6 text-center sm:hidden">
          <Link
            to="/collections/mala"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-vedic-goldDark hover:text-vedic-maroon transition-colors"
          >
            Shop Rudraksha Mala
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </section>
  );
};
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Gem } from 'lucide-react';
import type { BraceletTile } from '../services/braceletCatalogService';

export interface BraceletTileGridProps {
  id: string;
  eyebrow: string;
  title: string;
  subtitle?: string;
  ctaLabel: string;
  ctaHref: string;
  load: () => Promise<BraceletTile[]>;
  background?: 'white' | 'ivory' | 'dark';
}

/** Reusable, data-driven "shop by collection" grid used by Style Collection, Gifting and Premium
 *  (spec sections 12, 19, 20). New style/occasion/premium tier = a data row in
 *  braceletCatalogService.ts, never a new component (spec section 42). */
export const BraceletTileGrid: React.FC<BraceletTileGridProps> = ({
  id, eyebrow, title, subtitle, ctaLabel, ctaHref, load, background = 'white'
}) => {
  const [tiles, setTiles] = useState<BraceletTile[]>([]);

  useEffect(() => {
    let isMounted = true;
    load().then((r) => {
      if (isMounted) setTiles(r);
    });
    return () => {
      isMounted = false;
    };
  }, [load]);

  if (tiles.length === 0) return null;
  const dark = background === 'dark';
  const bg = dark ? 'bg-vedic-dark' : background === 'ivory' ? 'bg-vedic-ivory' : 'bg-white';

  return (
    <section id={id} className={bg}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="flex items-end justify-between gap-4 mb-6 sm:mb-8">
          <div>
            <p className="text-[11px] sm:text-xs font-bold tracking-[0.15em] text-vedic-gold uppercase mb-2">{eyebrow}</p>
            <h2 className={`font-serif font-semibold text-2xl sm:text-3xl mb-2 ${dark ? 'text-vedic-goldLight' : 'text-vedic-dark'}`}>{title}</h2>
            {subtitle && <p className={`text-sm max-w-xl ${dark ? 'text-gray-400' : 'text-vedic-muted'}`}>{subtitle}</p>}
          </div>
          <Link
            to={ctaHref}
            className="hidden sm:inline-flex items-center gap-1.5 text-sm font-semibold text-vedic-gold hover:text-vedic-goldLight transition-colors whitespace-nowrap shrink-0"
          >
            {ctaLabel}
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
          {tiles.map((tile) => {
            const isAnchor = tile.href.startsWith('#');
            const cls = `group rounded-2xl border p-5 flex flex-col gap-2.5 transition-all duration-300 hover:-translate-y-1 ${
              dark
                ? 'bg-white/5 border-vedic-gold/20 hover:border-vedic-gold/50'
                : 'bg-vedic-ivory border-vedic-gold/15 hover:border-vedic-gold/40 hover:shadow-card-hover'
            }`;
            const content = (
              <>
                <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-vedic-gold/15">
                  <Gem className="w-4 h-4 text-vedic-goldDark" strokeWidth={1.5} />
                </span>
                <h3 className={`font-serif font-bold text-sm sm:text-base leading-snug ${dark ? 'text-vedic-goldLight' : 'text-vedic-dark'}`}>{tile.title}</h3>
                <p className={`text-xs leading-relaxed line-clamp-2 ${dark ? 'text-gray-400' : 'text-vedic-muted'}`}>{tile.description}</p>
              </>
            );
            return isAnchor ? (
              <a key={tile.id} href={tile.href} className={cls}>{content}</a>
            ) : (
              <Link key={tile.id} to={tile.href} className={cls}>{content}</Link>
            );
          })}
        </div>

        <div className="mt-6 text-center sm:hidden">
          <Link to={ctaHref} className="inline-flex items-center gap-1.5 text-sm font-semibold text-vedic-gold">
            {ctaLabel}
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </section>
  );
};
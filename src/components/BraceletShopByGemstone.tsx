import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Gem } from 'lucide-react';
import { getBraceletGemstoneTiles, BraceletTile } from '../services/braceletCatalogService';

/** Section 8 (spec): Shop By Gemstone. Links straight to the real matching product when the
 *  catalog has one today; an honest "Coming Soon" tile otherwise — future gemstones are a data
 *  addition in braceletCatalogService.ts's GEMSTONE_NAMES list, not a new component. */
export const BraceletShopByGemstone: React.FC = () => {
  const [tiles, setTiles] = useState<BraceletTile[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    getBraceletGemstoneTiles().then((result) => {
      if (!isMounted) return;
      setTiles(result);
      setIsLoading(false);
    });
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <section id="shop-by-gemstone" className="bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="flex items-end justify-between gap-4 mb-6 sm:mb-8">
          <div>
            <p className="text-[11px] sm:text-xs font-bold tracking-[0.15em] text-vedic-goldDark uppercase mb-2">
              Shop By Gemstone
            </p>
            <h2 className="font-serif font-semibold text-vedic-dark text-2xl sm:text-3xl">Gemstone Bracelets</h2>
          </div>
          <Link
            to="/gemstones"
            className="hidden sm:inline-flex items-center gap-1.5 text-sm font-semibold text-vedic-goldDark hover:text-vedic-maroon transition-colors whitespace-nowrap shrink-0"
          >
            Explore Gemstone Bracelets
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3 sm:gap-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="rounded-2xl border border-vedic-gold/10 bg-vedic-ivory p-4 h-24 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3 sm:gap-4">
            {tiles.map((tile) => (
              <Link
                key={tile.id}
                to={tile.href}
                className="group text-center rounded-2xl border border-vedic-gold/15 hover:border-vedic-gold/40 bg-vedic-ivory hover:shadow-card-hover p-4 flex flex-col items-center gap-2 transition-all"
              >
                <span className="w-10 h-10 rounded-full bg-white flex items-center justify-center group-hover:bg-vedic-gold/15 transition-colors">
                  <Gem className="w-4 h-4 text-vedic-goldDark" strokeWidth={1.5} />
                </span>
                <h3 className="font-serif font-semibold text-vedic-dark text-[12px] sm:text-sm leading-snug">{tile.title}</h3>
                {tile.product ? (
                  <p className="text-[10px] font-bold text-vedic-maroon">₹{tile.product.price.toLocaleString('en-IN')}</p>
                ) : (
                  <p className="text-[10px] text-vedic-muted">Coming soon</p>
                )}
              </Link>
            ))}
          </div>
        )}

        <div className="mt-4 text-center sm:hidden">
          <Link to="/gemstones" className="inline-flex items-center gap-1.5 text-sm font-semibold text-vedic-goldDark hover:text-vedic-maroon transition-colors">
            Explore Gemstone Bracelets
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </section>
  );
};
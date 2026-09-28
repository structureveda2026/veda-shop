import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { getBraceletMukhiTiles, MukhiBraceletTile } from '../services/braceletCatalogService';

/** Section 7 (spec): Shop By Rudraksha (Mukhi bracelets, 1–14). No dedicated Rudraksha-bracelet
 *  SKUs exist yet, so this is an honest "shop by type" grid connected straight to the real
 *  Rudraksha main category, per the spec's own instruction to connect this section there. */
export const BraceletShopByMukhi: React.FC = () => {
  const [tiles, setTiles] = useState<MukhiBraceletTile[]>([]);

  useEffect(() => {
    let isMounted = true;
    getBraceletMukhiTiles().then((result) => {
      if (isMounted) setTiles(result);
    });
    return () => {
      isMounted = false;
    };
  }, []);

  if (tiles.length === 0) return null;

  return (
    <section id="shop-by-rudraksha" className="bg-vedic-ivory">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="flex items-end justify-between gap-4 mb-6 sm:mb-8">
          <div>
            <p className="text-[11px] sm:text-xs font-bold tracking-[0.15em] text-vedic-goldDark uppercase mb-2">
              Shop By Rudraksha
            </p>
            <h2 className="font-serif font-semibold text-vedic-dark text-2xl sm:text-3xl">Rudraksha Bracelets</h2>
          </div>
          <Link
            to="/rudraksha"
            className="hidden sm:inline-flex items-center gap-1.5 text-sm font-semibold text-vedic-goldDark hover:text-vedic-maroon transition-colors whitespace-nowrap shrink-0"
          >
            Explore Rudraksha Bracelets
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-4 sm:grid-cols-7 gap-2.5 sm:gap-3">
          {tiles.map((tile) => (
            <Link
              key={tile.mukhiNumber}
              to={tile.href}
              className="group flex flex-col items-center justify-center gap-1 py-3.5 px-2 rounded-xl border border-vedic-gold/20 bg-white hover:bg-vedic-gold hover:border-vedic-gold text-vedic-dark hover:text-white transition-colors"
            >
              <span className="text-base font-serif font-bold">{tile.mukhiNumber}</span>
              <span className="text-[9px] font-semibold uppercase tracking-wide">Mukhi</span>
            </Link>
          ))}
        </div>

        <div className="mt-4 text-center sm:hidden">
          <Link to="/rudraksha" className="inline-flex items-center gap-1.5 text-sm font-semibold text-vedic-goldDark hover:text-vedic-maroon transition-colors">
            Explore Rudraksha Bracelets
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </section>
  );
};
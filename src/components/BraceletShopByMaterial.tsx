import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Gem } from 'lucide-react';
import { getBraceletMaterialTiles, BraceletMaterialTile } from '../services/braceletCatalogService';

/** Section 5 (spec): Shop By Material — "Choose Your Bracelet". Explicitly required to be
 *  data-driven (spec: "a new material added later must not require a hand-coded new section") —
 *  this grid renders whatever getBraceletMaterialTiles() returns, nothing per-item hardcoded in
 *  this component. Adding a 12th material later is a one-line addition to that service file. */
export const BraceletShopByMaterial: React.FC = () => {
  const [tiles, setTiles] = useState<BraceletMaterialTile[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    getBraceletMaterialTiles().then((result) => {
      if (!isMounted) return;
      setTiles(result);
      setIsLoading(false);
    });
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <section id="shop-by-material" className="bg-vedic-ivory">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-10">
          <p className="text-[11px] sm:text-xs font-bold tracking-[0.15em] text-vedic-goldDark uppercase mb-2">
            Shop By Material
          </p>
          <h2 className="font-serif font-semibold text-vedic-dark text-2xl sm:text-3xl">
            Choose Your Bracelet
          </h2>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3 sm:gap-4">
            {Array.from({ length: 11 }).map((_, i) => (
              <div key={i} className="rounded-2xl border border-vedic-gold/10 bg-white p-4 h-20 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3 sm:gap-4">
            {tiles.map((tile) => (
              <Link
                key={tile.id}
                to={tile.href}
                className="group text-center rounded-2xl border border-vedic-gold/15 hover:border-vedic-gold/40 bg-white hover:shadow-card-hover p-4 flex flex-col items-center gap-2 transition-all"
              >
                <span className="w-10 h-10 rounded-full bg-vedic-card flex items-center justify-center group-hover:bg-vedic-gold/15 transition-colors">
                  <Gem className="w-4 h-4 text-vedic-goldDark" strokeWidth={1.5} />
                </span>
                <h3 className="font-serif font-semibold text-vedic-dark text-[12px] sm:text-sm leading-snug">
                  {tile.name}
                </h3>
                <p className="text-[10px] text-vedic-muted">
                  {tile.count > 0 ? `${tile.count} option${tile.count > 1 ? 's' : ''}` : 'Coming soon'}
                </p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
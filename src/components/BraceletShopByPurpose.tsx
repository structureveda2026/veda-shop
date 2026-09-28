import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Coins, Compass, Flame, Shield, Sun, Target, Smile, type LucideIcon } from 'lucide-react';
import { getBraceletPurposeTiles, BraceletPurposeTile } from '../services/braceletCatalogService';

const PURPOSE_ICON: Record<string, LucideIcon> = {
  protection: Shield,
  'peace-meditation': Smile,
  'focus-discipline': Target,
  prosperity: Coins,
  confidence: Flame,
  'spiritual-growth': BookOpen,
  'rashi-astrology': Compass,
  'daily-wear': Sun
};

/** Section 4 (spec): Shop By Purpose — "Choose Your Bracelet by Intention". The single most
 *  important discovery section per spec. Traditional-association language only; no medical
 *  claims (no cures, no BP/diabetes claims, no guaranteed wealth/marriage). */
export const BraceletShopByPurpose: React.FC = () => {
  const [tiles, setTiles] = useState<BraceletPurposeTile[]>([]);

  useEffect(() => {
    let isMounted = true;
    getBraceletPurposeTiles().then((result) => {
      if (isMounted) setTiles(result);
    });
    return () => {
      isMounted = false;
    };
  }, []);

  if (tiles.length === 0) return null;

  return (
    <section id="shop-by-purpose" className="bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-10">
          <p className="text-[11px] sm:text-xs font-bold tracking-[0.15em] text-vedic-goldDark uppercase mb-2">
            Shop By Purpose
          </p>
          <h2 className="font-serif font-semibold text-vedic-dark text-2xl sm:text-3xl mb-2">
            Choose Your Bracelet by Intention
          </h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          {tiles.map((tile) => {
            const Icon = PURPOSE_ICON[tile.id] ?? Compass;
            return (
              <Link
                key={tile.id}
                to={`/purpose/${tile.purposeSlug}`}
                className="group text-left rounded-2xl border border-vedic-gold/15 hover:border-vedic-gold/40 bg-vedic-ivory hover:shadow-card-hover p-4 sm:p-5 flex flex-col gap-2.5 sm:gap-3 transition-all h-full"
              >
                <span className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-white flex items-center justify-center">
                  <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-vedic-goldDark" strokeWidth={1.5} />
                </span>
                <div>
                  <h3 className="font-serif font-semibold text-vedic-dark text-[13px] sm:text-base mb-1 leading-snug">
                    {tile.title}
                  </h3>
                  <p className="text-[11px] sm:text-sm text-vedic-muted leading-relaxed">{tile.description}</p>
                </div>
              </Link>
            );
          })}
        </div>

        <p className="text-[11px] text-vedic-muted mt-5 sm:mt-6 italic">
          Traditionally associated with the intentions shown above — general guidance, not a
          medical claim or a substitute for professional advice.
        </p>
      </div>
    </section>
  );
};
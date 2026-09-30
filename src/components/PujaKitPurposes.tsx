import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Coins, Compass, Home, Orbit, Shield, Smile, Sparkles, type LucideIcon } from 'lucide-react';
import { getPujaPurposeTiles, type PujaPurposeTile } from '../services/pujaKitCatalogService';
import { PujaKitSectionHeading } from './PujaKitSectionHeading';

const PURPOSE_ICON: Record<string, LucideIcon> = {
  'devotional-practice': BookOpen,
  peace: Home,
  wealth: Coins,
  protection: Shield,
  career: Sparkles,
  'planetary-balance': Orbit,
  meditation: Smile,
  'astrology-guidance': Compass
};

/** Section 9: "Shop by Purpose" — links to the store's existing /purpose/:slug pages (same source as the Rudraksha and
 *  Bracelet pages). Traditional-association wording only; no medical claims or guaranteed outcomes. */
export const PujaKitPurposes: React.FC = () => {
  const [tiles, setTiles] = useState<PujaPurposeTile[]>([]);

  useEffect(() => {
    let isMounted = true;
    getPujaPurposeTiles().then((r) => isMounted && setTiles(r));
    return () => {
      isMounted = false;
    };
  }, []);

  if (tiles.length === 0) return null;

  return (
    <section id="puja-by-purpose" className="bg-vedic-ivory scroll-mt-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <PujaKitSectionHeading align="center" eyebrow="Shop By Purpose" title="Choose Your Puja by Intention" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          {tiles.map((tile) => {
            const Icon = PURPOSE_ICON[tile.id] ?? Compass;
            return (
              <Link
                key={tile.id}
                to={`/purpose/${tile.purposeSlug}`}
                className="group rounded-2xl border border-vedic-gold/15 hover:border-vedic-gold/40 bg-white hover:shadow-card-hover p-4 sm:p-5 flex flex-col gap-2.5 sm:gap-3 h-full transition-all"
              >
                <span className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-vedic-card flex items-center justify-center">
                  <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-vedic-goldDeep" strokeWidth={1.5} />
                </span>
                <div>
                  <h3 className="font-serif font-semibold text-vedic-dark text-[13px] sm:text-base mb-1 leading-snug">{tile.title}</h3>
                  <p className="text-[11px] sm:text-sm text-vedic-muted leading-relaxed">{tile.description}</p>
                </div>
              </Link>
            );
          })}
        </div>
        <p className="text-[11px] text-vedic-muted mt-5 sm:mt-6 italic text-center">
          Traditionally associated with the intentions shown above — general guidance, not a medical claim or a substitute for professional advice.
        </p>
      </div>
    </section>
  );
};
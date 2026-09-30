import React, { useMemo } from 'react';
import { CalendarHeart } from 'lucide-react';
import { buildOccasionTiles, type PujaKitView } from '../services/pujaKitCatalogService';
import { PujaKitSectionHeading } from './PujaKitSectionHeading';

export interface PujaKitOccasionsProps {
  kits: PujaKitView[];
  activeOccasion: string;
  onSelect: (occasionId: string) => void;
}

/** Section 4: "Shop by Occasion" — festivals and family occasions. Only occasions that currently have kits are shown;
 *  a new festival is one row in OCCASIONS (pujaKitCatalogService.ts) plus tagging kits with it. */
export const PujaKitOccasions: React.FC<PujaKitOccasionsProps> = ({ kits, activeOccasion, onSelect }) => {
  const tiles = useMemo(() => buildOccasionTiles(kits).filter((t) => t.count > 0), [kits]);
  if (tiles.length === 0) return null;

  return (
    <section id="puja-by-occasion" className="bg-white scroll-mt-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <PujaKitSectionHeading
          align="center"
          eyebrow="Shop By Occasion"
          title="Preparing for a Festival or Special Day?"
          subtitle="Pick the occasion and see the kits traditionally used for it."
        />

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
          {tiles.map((tile) => {
            const active = activeOccasion === tile.id;
            return (
              <button
                key={tile.id}
                type="button"
                aria-pressed={active}
                onClick={() => onSelect(tile.id)}
                className={`group text-left rounded-2xl border p-4 sm:p-5 flex flex-col gap-2 h-full transition-all ${
                  active ? 'bg-vedic-card border-vedic-gold shadow-card-hover' : 'bg-vedic-ivory border-vedic-gold/15 hover:border-vedic-gold/40 hover:shadow-card-hover'
                }`}
              >
                <span className="w-9 h-9 rounded-full bg-white flex items-center justify-center">
                  <CalendarHeart className="w-4 h-4 text-vedic-goldDeep" strokeWidth={1.5} />
                </span>
                <h3 className="font-serif font-semibold text-vedic-dark text-[13px] sm:text-base leading-snug">{tile.name}</h3>
                <p className="text-[11px] sm:text-xs text-vedic-muted leading-relaxed line-clamp-2">{tile.description}</p>
                <span className="mt-auto text-[11px] font-semibold text-vedic-goldDeep group-hover:text-vedic-maroon transition-colors">
                  {tile.count} {tile.count === 1 ? 'kit' : 'kits'}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
};
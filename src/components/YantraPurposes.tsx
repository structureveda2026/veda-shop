import React, { useMemo } from 'react';
import { BookOpen, Coins, Flame, Home, Orbit, Shield, Sparkles, Smile, type LucideIcon } from 'lucide-react';
import { buildPurposeTiles, type YantraView } from '../services/yantraCatalogService';
import { YantraSectionHeading } from './YantraSectionHeading';

const PURPOSE_ICON: Record<string, LucideIcon> = {
  wealth: Coins,
  protection: Shield,
  peace: Smile,
  planetary: Orbit,
  vastu: Home,
  knowledge: BookOpen,
  career: Sparkles,
  devotion: Flame
};

export interface YantraPurposesProps {
  yantras: YantraView[];
  activePurpose: string;
  onSelect: (purposeId: string) => void;
}

/** Section 4: "Shop by Purpose". Only purposes that currently have yantras are shown; a new purpose is one row in
 *  YANTRA_PURPOSES (yantraCatalogService.ts). Traditional-association wording only — no claims or guaranteed outcomes. */
export const YantraPurposes: React.FC<YantraPurposesProps> = ({ yantras, activePurpose, onSelect }) => {
  const tiles = useMemo(() => buildPurposeTiles(yantras).filter((t) => t.count > 0), [yantras]);
  if (tiles.length === 0) return null;

  return (
    <section id="yantra-by-purpose" className="bg-white scroll-mt-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <YantraSectionHeading
          align="center"
          eyebrow="Shop By Purpose"
          title="Choose Your Yantra by Intention"
          subtitle="Pick the intention and see the yantras traditionally kept for it."
        />

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          {tiles.map((tile) => {
            const Icon = PURPOSE_ICON[tile.id] ?? Sparkles;
            const active = activePurpose === tile.id;
            return (
              <button
                key={tile.id}
                type="button"
                aria-pressed={active}
                onClick={() => onSelect(tile.id)}
                className={`group text-left rounded-2xl border p-4 sm:p-5 flex flex-col gap-2.5 h-full transition-all ${
                  active ? 'bg-vedic-card border-vedic-gold shadow-card-hover' : 'bg-vedic-ivory border-vedic-gold/15 hover:border-vedic-gold/40 hover:shadow-card-hover'
                }`}
              >
                <span className="w-10 h-10 rounded-full bg-white flex items-center justify-center">
                  <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-vedic-goldDeep" strokeWidth={1.5} />
                </span>
                <h3 className="font-serif font-semibold text-vedic-dark text-[13px] sm:text-base leading-snug">{tile.name}</h3>
                <p className="text-[11px] sm:text-xs text-vedic-muted leading-relaxed line-clamp-3">{tile.description}</p>
                <span className="mt-auto text-[11px] font-semibold text-vedic-goldDeep group-hover:text-vedic-maroon transition-colors">
                  {tile.count} {tile.count === 1 ? 'yantra' : 'yantras'}
                </span>
              </button>
            );
          })}
        </div>

        <p className="text-[11px] text-vedic-muted mt-5 sm:mt-6 italic text-center">
          Traditionally associated with the intentions shown above — general guidance, not a medical, legal or financial claim or a substitute for professional advice.
        </p>
      </div>
    </section>
  );
};
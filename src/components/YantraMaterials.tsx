import React, { useMemo } from 'react';
import { yantraArt } from '../data/yantraData';
import { buildMaterialTiles, type YantraView } from '../services/yantraCatalogService';
import { YantraSectionHeading } from './YantraSectionHeading';

export interface YantraMaterialsProps {
  yantras: YantraView[];
  activeMaterial: string;
  onSelect: (materialId: string) => void;
}

/** Section 8: "Choose the Right Material" — copper, gold plated, silver, brass, Sphatik, Ashtadhatu. Only materials
 *  that currently have yantras are shown; tapping one filters the finder. A new material is one row in MATERIALS. */
export const YantraMaterials: React.FC<YantraMaterialsProps> = ({ yantras, activeMaterial, onSelect }) => {
  const tiles = useMemo(() => buildMaterialTiles(yantras).filter((t) => t.count > 0), [yantras]);
  const thumbs = useMemo(() => Object.fromEntries(tiles.map((t) => [t.id, yantraArt(t.accent)])), [tiles]);
  if (tiles.length === 0) return null;

  return (
    <section id="yantra-by-material" className="bg-white scroll-mt-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <YantraSectionHeading
          align="center"
          eyebrow="Shop By Material"
          title="Choose the Right Material"
          subtitle="Every yantra states its material clearly. Pick the one that suits your puja space and budget."
        />

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          {tiles.map((tile) => {
            const active = activeMaterial === tile.id;
            return (
              <button
                key={tile.id}
                type="button"
                aria-pressed={active}
                onClick={() => onSelect(tile.id)}
                className={`group text-left rounded-2xl border overflow-hidden flex flex-col h-full transition-all ${
                  active ? 'bg-vedic-card border-vedic-gold shadow-card-hover' : 'bg-vedic-ivory border-vedic-gold/15 hover:border-vedic-gold/40 hover:shadow-card-hover'
                }`}
              >
                <img src={thumbs[tile.id]} alt="" aria-hidden="true" loading="lazy" className="w-full aspect-square object-cover" />
                <div className="p-3 sm:p-4 flex flex-col gap-1.5 flex-1">
                  <h3 className="font-serif font-semibold text-vedic-dark text-[13px] sm:text-sm leading-snug">{tile.name}</h3>
                  <p className="text-[11px] text-vedic-muted leading-relaxed line-clamp-3">{tile.description}</p>
                  <span className="mt-auto pt-1 text-[11px] font-semibold text-vedic-goldDeep group-hover:text-vedic-maroon transition-colors">
                    {tile.count} {tile.count === 1 ? 'yantra' : 'yantras'}
                    {tile.startingPrice ? ` · from ₹${tile.startingPrice.toLocaleString('en-IN')}` : ''}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
};
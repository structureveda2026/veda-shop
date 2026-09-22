import React from 'react';
import { HomeSection, SectionHeader } from './HomeSection';
import { resolveIcon } from './homeIcons';
import type { SectionContent, ValueItem } from '../../services/homeService';

/** "Why Veda Store?" — six short promises, no boxes-within-boxes. */
export const HomeWhy: React.FC<{ content: SectionContent; items: ValueItem[] }> = ({ content, items }) => {
  if (!items.length) return null;
  return (
    <HomeSection id="why-veda-store" tone="white">
      <SectionHeader eyebrow={content.eyebrow} title={content.title} description={content.description} />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {items.map((item) => {
          const Icon = resolveIcon(item.icon);
          return (
            <div key={item.id} className="rounded-2xl bg-vedic-ivory border border-black/5 p-6 md:p-8">
              <Icon className="w-7 h-7 text-vedic-gold" strokeWidth={1.5} aria-hidden="true" />
              <h3 className="mt-5 font-serif font-semibold text-xl text-vedic-dark">{item.title}</h3>
              {item.description && <p className="mt-2 text-sm leading-relaxed text-vedic-muted">{item.description}</p>}
            </div>
          );
        })}
      </div>
    </HomeSection>
  );
};
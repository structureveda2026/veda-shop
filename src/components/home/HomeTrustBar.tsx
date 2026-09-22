import React from 'react';
import { resolveIcon } from './homeIcons';
import type { TrustItem } from '../../services/homeService';

/**
 * Trust points as one continuous, slow-scrolling marquee row — same single-row behaviour on
 * mobile and desktop (no grid/breakpoint switch). The visual track duplicates the list once so
 * the loop is seamless (`.animate-marquee` in index.css moves it by exactly -50%, i.e. the
 * width of one copy) and is `aria-hidden`; a plain, non-repeating list underneath is what
 * screen readers actually get.
 */
export const HomeTrustBar: React.FC<{ items: TrustItem[] }> = ({ items }) => {
  if (!items.length) return null;

  const renderChip = (item: TrustItem, key: string) => {
    const Icon = resolveIcon(item.icon);
    return (
      <div key={key} className="flex items-center gap-2.5 px-6 sm:px-8 shrink-0 whitespace-nowrap">
        <Icon className="w-4 h-4 sm:w-[18px] sm:h-[18px] text-vedic-gold shrink-0" strokeWidth={1.75} aria-hidden="true" />
        <span className="text-xs sm:text-sm font-semibold text-vedic-dark">{item.title}</span>
        <span className="text-vedic-gold/40" aria-hidden="true">•</span>
      </div>
    );
  };

  return (
    <section aria-label="Why shop with us" className="bg-white border-y border-black/5 overflow-hidden">
      {/* Screen-reader-only, non-repeating list (the marquee track below is decorative). */}
      <ul className="sr-only">
        {items.map((item) => (
          <li key={item.id}>
            {item.title}
            {item.subtitle ? ` — ${item.subtitle}` : ''}
          </li>
        ))}
      </ul>

      <div className="animate-marquee py-4 md:py-5" aria-hidden="true">
        {items.map((item) => renderChip(item, `a-${item.id}`))}
        {items.map((item) => renderChip(item, `b-${item.id}`))}
      </div>
    </section>
  );
};
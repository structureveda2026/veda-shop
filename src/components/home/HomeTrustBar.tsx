import React from 'react';
import { resolveIcon } from './homeIcons';
import type { TrustItem } from '../../services/homeService';

/** Four quiet trust points under the hero — small icons, no badges. */
export const HomeTrustBar: React.FC<{ items: TrustItem[] }> = ({ items }) => {
  if (!items.length) return null;
  return (
    <section aria-label="Why shop with us" className="bg-white border-y border-black/5">
      <ul className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-7 grid grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-5">
        {items.map((item) => {
          const Icon = resolveIcon(item.icon);
          return (
            <li key={item.id} className="flex items-center justify-center lg:justify-start gap-3">
              <Icon className="w-6 h-6 shrink-0 text-vedic-gold" strokeWidth={1.5} aria-hidden="true" />
              <div className="min-w-0">
                <p className="text-sm font-semibold text-vedic-dark leading-tight">{item.title}</p>
                {item.subtitle && <p className="hidden md:block text-xs text-vedic-muted mt-0.5">{item.subtitle}</p>}
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
};
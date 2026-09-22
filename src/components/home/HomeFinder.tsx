import React from 'react';
import { HomeSection, SectionHeader } from './HomeSection';
import { HomeLink } from './HomeCta';
import { resolveIcon } from './homeIcons';
import { track } from '../../lib/analytics';
import type { FinderOption, SectionContent } from '../../services/homeService';

/**
 * "Not Sure What to Choose?" — the page's main conversion band. Four routes into the catalogue.
 * Each option is a plain link, so a Veda AI recommendation flow can later replace any of them
 * just by changing the entry's link in Shopify.
 */
export const HomeFinder: React.FC<{ content: SectionContent; options: FinderOption[] }> = ({ content, options }) => {
  if (!options.length) return null;
  return (
    <HomeSection id="find-your-product" tone="sand">
      <SectionHeader eyebrow={content.eyebrow} title={content.title} description={content.description} />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {options.map((option) => {
          const Icon = resolveIcon(option.icon);
          return (
            <HomeLink
              key={option.id}
              href={option.href}
              onClick={() => track('finder_start', { option: option.id })}
              className="group flex flex-col h-full bg-white rounded-2xl border border-black/5 p-5 md:p-7 shadow-card hover:shadow-[0_14px_34px_rgba(26,26,26,0.10)] hover:border-vedic-gold/50 transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-vedic-gold"
            >
              <span className="w-11 h-11 rounded-full border border-vedic-gold/50 flex items-center justify-center text-vedic-goldDeep">
                <Icon className="w-5 h-5" strokeWidth={1.5} aria-hidden="true" />
              </span>
              <h3 className="mt-5 font-serif font-semibold text-lg md:text-xl leading-snug text-vedic-dark">{option.title}</h3>
              <span className="mt-auto pt-5 inline-flex items-center gap-1.5 text-sm font-medium text-vedic-charcoal group-hover:text-vedic-goldDeep transition-colors">
                {option.ctaLabel} <span aria-hidden="true" className="transition-transform group-hover:translate-x-0.5">→</span>
              </span>
            </HomeLink>
          );
        })}
      </div>
    </HomeSection>
  );
};
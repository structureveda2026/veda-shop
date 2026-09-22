import React from 'react';
import { Link } from 'react-router-dom';
import { HomeSection, SectionHeader } from './HomeSection';
import { HomeCta } from './HomeCta';
import { resolveIcon } from './homeIcons';
import { track } from '../../lib/analytics';
import type { PurposeTile, SectionContent } from '../../services/homeService';

/** "Choose by Intention" — dynamic: every card is a purpose entry, opening /purpose/:slug. */
export const HomePurposeGrid: React.FC<{ content: SectionContent; purposes: PurposeTile[] }> = ({ content, purposes }) => {
  if (!purposes.length) return null;
  return (
    <HomeSection id="shop-by-purpose" tone="sand">
      <SectionHeader eyebrow={content.eyebrow} title={content.title} description={content.description} />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-5">
        {purposes.slice(0, 8).map((p) => {
          const Icon = resolveIcon(p.icon);
          return (
            <Link
              key={p.id}
              to={`/purpose/${p.slug}`}
              onClick={() => track('purpose_click', { purpose: p.slug })}
              className="group flex flex-col h-full bg-white rounded-2xl border border-black/5 p-5 md:p-6 shadow-card hover:border-vedic-gold/60 hover:shadow-[0_12px_28px_rgba(26,26,26,0.08)] transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-vedic-gold"
            >
              <Icon className="w-6 h-6 text-vedic-gold" strokeWidth={1.5} aria-hidden="true" />
              <h3 className="mt-4 font-serif font-semibold text-lg md:text-xl leading-snug text-vedic-dark group-hover:text-vedic-goldDeep transition-colors">{p.name}</h3>
              {p.tagline && <p className="mt-1.5 text-xs md:text-[13px] leading-relaxed text-vedic-muted line-clamp-2">{p.tagline}</p>}
            </Link>
          );
        })}
      </div>
      {content.ctaLabel && content.ctaHref && (
        <div className="mt-10 text-center">
          <HomeCta href={content.ctaHref} variant="secondary">{content.ctaLabel}</HomeCta>
        </div>
      )}
    </HomeSection>
  );
};
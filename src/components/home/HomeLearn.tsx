import React from 'react';
import { HomeSection, SectionHeader } from './HomeSection';
import { HomeCta, HomeLink } from './HomeCta';
import { resolveIcon } from './homeIcons';
import type { LearnCard, SectionContent } from '../../services/homeService';

/** "Learn Before You Choose" — 3–4 guide cards. Good for SEO and for trust. */
export const HomeLearn: React.FC<{ content: SectionContent; cards: LearnCard[] }> = ({ content, cards }) => {
  if (!cards.length) return null;
  return (
    <HomeSection id="learn" tone="sand">
      <SectionHeader eyebrow={content.eyebrow} title={content.title} description={content.description} />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        {cards.slice(0, 4).map((card) => {
          const Icon = resolveIcon(card.icon);
          return (
            <HomeLink
              key={card.id}
              href={card.href}
              className="group flex flex-col h-full bg-white rounded-2xl border border-black/5 p-6 md:p-8 shadow-card hover:border-vedic-gold/60 hover:shadow-[0_12px_28px_rgba(26,26,26,0.08)] transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-vedic-gold"
            >
              <span className="w-11 h-11 rounded-full bg-vedic-sand flex items-center justify-center text-vedic-goldDeep">
                <Icon className="w-5 h-5" strokeWidth={1.5} aria-hidden="true" />
              </span>
              <p className="mt-6 text-[11px] font-semibold uppercase tracking-[0.2em] text-vedic-goldDeep">{card.eyebrow}</p>
              <h3 className="mt-2 font-serif font-semibold text-xl md:text-2xl leading-snug text-vedic-dark">{card.title}</h3>
              {card.description && <p className="mt-2 text-sm leading-relaxed text-vedic-muted">{card.description}</p>}
              <span className="mt-auto pt-6 inline-flex items-center gap-1.5 text-sm font-medium text-vedic-charcoal group-hover:text-vedic-goldDeep transition-colors">
                Learn More <span aria-hidden="true" className="transition-transform group-hover:translate-x-0.5">→</span>
              </span>
            </HomeLink>
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
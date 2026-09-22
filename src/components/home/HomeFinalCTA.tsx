import React from 'react';
import { HomeSection } from './HomeSection';
import { HomeCta } from './HomeCta';
import { track } from '../../lib/analytics';
import type { SectionContent } from '../../services/homeService';

/** Closing call-to-action — the one dark band on the page. */
export const HomeFinalCTA: React.FC<{ content: SectionContent }> = ({ content }) => (
  <HomeSection id="begin" tone="dark" className="[&>div]:py-16 md:[&>div]:py-24">
    <div className="max-w-2xl mx-auto text-center">
      <span className="block w-10 h-px bg-vedic-gold mx-auto mb-8" aria-hidden="true" />
      <h2 className="font-serif font-semibold text-4xl md:text-5xl leading-tight text-white">{content.title}</h2>
      {content.description && <p className="mt-5 text-base md:text-lg leading-relaxed text-white/70">{content.description}</p>}

      <div className="mt-9 flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3">
        {content.ctaLabel && content.ctaHref && (
          <HomeCta href={content.ctaHref} variant="light">{content.ctaLabel}</HomeCta>
        )}
        {content.secondaryLabel && content.secondaryHref && (
          <HomeCta href={content.secondaryHref} variant="outline-light" onClick={() => track('consultation_click', { from: 'home_final_cta' })}>
            {content.secondaryLabel}
          </HomeCta>
        )}
      </div>
    </div>
  </HomeSection>
);
import React, { useState } from 'react';
import { Gem } from 'lucide-react';
import { HomeCta } from './HomeCta';
import { track } from '../../lib/analytics';
import type { SectionContent } from '../../services/homeService';

/**
 * Hero — full-width banner photo with heading/copy/buttons overlaid on top, the way every
 * storefront hero banner works (same full-bleed + scrim pattern as GemstoneHero.tsx).
 * Every word and the image come from the "hero" entry in Shopify (defaults in homeService.ts).
 */
export const HomeHeroSection: React.FC<{ content: SectionContent }> = ({ content }) => {
  const [imageFailed, setImageFailed] = useState(false);

  // "Ancient Wisdom. Thoughtfully Crafted for Today." → two lines, second one in gold italic.
  const lines = content.title.match(/[^.]+\.?/g)?.map((s) => s.trim()).filter(Boolean) ?? [content.title];

  return (
    <section className="relative overflow-hidden bg-vedic-dark min-h-[520px] sm:min-h-[560px] lg:min-h-[620px] flex items-center">
      {/* Full-width background banner photo */}
      {content.image && !imageFailed ? (
        <img
          src={content.image}
          alt="Rudraksha and sacred Vedic essentials from Veda Store"
          width={1920}
          height={1080}
          loading="eager"
          fetchPriority="high"
          decoding="async"
          onError={() => setImageFailed(true)}
          className="absolute inset-0 w-full h-full object-cover object-center"
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center bg-vedic-sand text-vedic-gold/60">
          <Gem className="w-14 h-14" aria-hidden="true" />
        </div>
      )}

      {/* Scrim — darkens the photo so light text stays legible everywhere.
          Left-to-right fade on larger screens (copy sits on the left, photo detail stays
          visible on the right); a flatter overlay on mobile since text sits centered over
          the whole frame there. */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/35 to-black/10 sm:bg-gradient-to-r sm:from-black/75 sm:via-black/45 sm:to-black/10" />

      {/* Copy, overlaid on the banner */}
      <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        <div className="max-w-xl mx-auto text-center sm:mx-0 sm:text-left">
          {content.eyebrow && (
            <p className="text-[11px] sm:text-xs font-semibold uppercase tracking-[0.22em] text-vedic-gold mb-4 sm:mb-5">
              {content.eyebrow}
            </p>
          )}

          <h1 className="font-serif font-semibold text-[2.25rem] sm:text-5xl lg:text-[3.5rem] xl:text-[4rem] leading-[1.1] text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.45)]">
            {lines.length > 1 ? (
              <>
                {lines[0]}
                <span className="block italic font-medium text-vedic-gold mt-1">{lines.slice(1).join(' ')}</span>
              </>
            ) : (
              content.title
            )}
          </h1>

          {content.description && (
            <p className="mt-5 sm:mt-6 text-sm sm:text-base md:text-lg leading-relaxed text-white/90 max-w-md mx-auto sm:mx-0">
              {content.description}
            </p>
          )}

          <div className="mt-8 sm:mt-9 flex flex-col sm:flex-row items-stretch sm:items-center justify-center sm:justify-start gap-3">
            {content.ctaLabel && content.ctaHref && (
              <HomeCta href={content.ctaHref} variant="primary" onClick={() => track('hero_cta_click', { cta: 'primary', label: content.ctaLabel })}>
                {content.ctaLabel}
              </HomeCta>
            )}
            {content.secondaryLabel && content.secondaryHref && (
              <HomeCta
                href={content.secondaryHref}
                variant="secondary"
                className="bg-white/90 backdrop-blur-sm border-white/60 hover:bg-white"
                onClick={() => track('hero_cta_click', { cta: 'secondary', label: content.secondaryLabel })}
              >
                {content.secondaryLabel}
              </HomeCta>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
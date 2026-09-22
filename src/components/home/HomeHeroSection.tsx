import React, { useState } from 'react';
import { Gem } from 'lucide-react';
import { HomeCta } from './HomeCta';
import { track } from '../../lib/analytics';
import type { SectionContent } from '../../services/homeService';

/**
 * Hero — heading, one line of copy, two buttons, one premium image. Image only: no video, no slider.
 * Every word and the image come from the "hero" entry in Shopify (defaults in homeService.ts).
 */
export const HomeHeroSection: React.FC<{ content: SectionContent }> = ({ content }) => {
  const [imageFailed, setImageFailed] = useState(false);

  // "Ancient Wisdom. Thoughtfully Crafted for Today." → two lines, second one in gold italic.
  const lines = content.title.match(/[^.]+\.?/g)?.map((s) => s.trim()).filter(Boolean) ?? [content.title];

  return (
    <section className="bg-vedic-ivory">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-14 md:pt-16 md:pb-20 lg:pt-20 lg:pb-24 grid lg:grid-cols-12 gap-10 lg:gap-14 items-center">
        {/* Copy */}
        <div className="lg:col-span-6 text-center lg:text-left">
          {content.eyebrow && (
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-vedic-goldDeep mb-5">{content.eyebrow}</p>
          )}

          <h1 className="font-serif font-semibold text-[2.6rem] sm:text-6xl lg:text-[3.6rem] xl:text-[4rem] leading-[1.08] text-vedic-dark">
            {lines.length > 1 ? (
              <>
                {lines[0]}
                <span className="block italic font-medium text-vedic-goldDeep mt-1">{lines.slice(1).join(' ')}</span>
              </>
            ) : (
              content.title
            )}
          </h1>

          {content.description && (
            <p className="mt-6 text-base md:text-lg leading-relaxed text-vedic-muted max-w-md mx-auto lg:mx-0">
              {content.description}
            </p>
          )}

          <div className="mt-9 flex flex-col sm:flex-row items-stretch sm:items-center justify-center lg:justify-start gap-3">
            {content.ctaLabel && content.ctaHref && (
              <HomeCta href={content.ctaHref} variant="primary" onClick={() => track('hero_cta_click', { cta: 'primary', label: content.ctaLabel })}>
                {content.ctaLabel}
              </HomeCta>
            )}
            {content.secondaryLabel && content.secondaryHref && (
              <HomeCta href={content.secondaryHref} variant="secondary" onClick={() => track('hero_cta_click', { cta: 'secondary', label: content.secondaryLabel })}>
                {content.secondaryLabel}
              </HomeCta>
            )}
          </div>
        </div>

        {/* Image */}
        <div className="lg:col-span-6 relative">
          {/* thin gold offset frame — the only decoration */}
          <div className="hidden sm:block absolute inset-0 translate-x-3 translate-y-3 rounded-[28px] border border-vedic-gold/60" aria-hidden="true" />
          <div className="relative aspect-[4/3] overflow-hidden rounded-[28px] bg-vedic-sand">
            {content.image && !imageFailed ? (
              <img
                src={content.image}
                alt="Rudraksha and sacred Vedic essentials from Veda Store"
                width={1200}
                height={900}
                loading="eager"
                decoding="async"
                onError={() => setImageFailed(true)}
                className="absolute inset-0 w-full h-full object-cover object-center"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-vedic-gold/60">
                <Gem className="w-14 h-14" aria-hidden="true" />
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
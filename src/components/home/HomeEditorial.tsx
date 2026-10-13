import React, { useState } from 'react';
import { Gem } from 'lucide-react';
import { HomeSection } from './HomeSection';
import type { SectionTone } from './HomeSection';
import { HomeCta } from './HomeCta';
import { track } from '../../lib/analytics';
import type { SectionContent } from '../../services/homeService';

interface HomeEditorialProps {
  id: string;
  content: SectionContent;
  tone?: SectionTone;
  /** Put the image on the right instead of the left (desktop). */
  imageRight?: boolean;
}

/**
 * One big editorial band: a premium image beside a short story and one or two buttons.
 * Used for Rudraksha, Gemstones, Bracelets, Yantra, Puja Kits and the Puja / Kashi bands.
 * A band the admin marked "hidden" in Shopify renders nothing.
 */
export const HomeEditorial: React.FC<HomeEditorialProps> = ({ id, content, tone = 'ivory', imageRight = false }) => {
  const [imageFailed, setImageFailed] = useState(false);

  if (content.status === 'hidden') return null;

  return (
    <HomeSection id={id} tone={tone}>
      <div className="grid lg:grid-cols-2 gap-10 lg:gap-20 items-center">
        {/* Image */}
        <div className={`relative ${imageRight ? 'lg:order-2' : ''}`}>
          <div
            className={`hidden sm:block absolute inset-0 rounded-[28px] border border-vedic-gold/60 ${imageRight ? '-translate-x-3' : 'translate-x-3'} translate-y-3`}
            aria-hidden="true"
          />
          <div className="relative aspect-[5/4] lg:aspect-[5/6] overflow-hidden rounded-[28px] bg-vedic-sand">
            {content.image && !imageFailed ? (
              <img
                src={content.image}
                alt={content.title}
                width={960}
                height={1200}
                loading="lazy"
                decoding="async"
                onError={() => setImageFailed(true)}
                className="absolute inset-0 w-full h-full object-cover"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-vedic-gold/60">
                <Gem className="w-14 h-14" aria-hidden="true" />
              </div>
            )}
          </div>
        </div>

        {/* Story */}
        <div className="text-center lg:text-left">
          {content.eyebrow && (
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-vedic-goldDeep mb-4">{content.eyebrow}</p>
          )}
          <h2 className="font-serif font-semibold text-3xl md:text-5xl leading-[1.1] text-vedic-dark">{content.title}</h2>
          {content.description && (
            <p className="mt-5 text-base md:text-lg leading-relaxed text-vedic-muted max-w-lg mx-auto lg:mx-0">{content.description}</p>
          )}

          {content.highlights.length > 0 && (
            <ul className="mt-6 flex flex-wrap justify-center lg:justify-start gap-2">
              {content.highlights.map((item) => (
                <li key={item} className="rounded-full border border-vedic-gold/50 bg-white px-3.5 py-1.5 text-xs font-medium text-vedic-charcoal">
                  {item}
                </li>
              ))}
            </ul>
          )}

          <div className="mt-8 flex flex-col sm:flex-row items-stretch sm:items-center justify-center lg:justify-start gap-3">
            {content.ctaLabel && content.ctaHref && (
              <HomeCta href={content.ctaHref} variant="primary" onClick={() => track('category_click', { category: id, cta: 'primary' })}>
                {content.ctaLabel}
              </HomeCta>
            )}
            {content.secondaryLabel && content.secondaryHref && (
              <HomeCta href={content.secondaryHref} variant="secondary" onClick={() => track('finder_start', { from: id })}>
                {content.secondaryLabel}
              </HomeCta>
            )}
          </div>
        </div>
      </div>
    </HomeSection>
  );
};
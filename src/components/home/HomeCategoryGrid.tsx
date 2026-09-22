import React, { useState } from 'react';
import { Gem } from 'lucide-react';
import { HomeSection, SectionHeader } from './HomeSection';
import { HomeCta, HomeLink } from './HomeCta';
import { track } from '../../lib/analytics';
import type { HomeCategory, SectionContent } from '../../services/homeService';

const CARD_SHADOW = 'shadow-card hover:shadow-[0_14px_34px_rgba(26,26,26,0.10)]';

const LiveCard: React.FC<{ category: HomeCategory }> = ({ category }) => {
  const [imageFailed, setImageFailed] = useState(false);
  return (
    <HomeLink
      href={category.href}
      onClick={() => track('category_click', { category: category.key })}
      className={`group flex flex-col h-full bg-white rounded-2xl overflow-hidden border border-black/5 ${CARD_SHADOW} transition-shadow duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-vedic-gold`}
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-vedic-sand">
        {category.image && !imageFailed ? (
          <img
            src={category.image}
            alt={category.title}
            width={640}
            height={480}
            loading="lazy"
            decoding="async"
            onError={() => setImageFailed(true)}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-vedic-gold/60">
            <Gem className="w-10 h-10" aria-hidden="true" />
          </div>
        )}
      </div>
      <div className="p-4 md:p-6 flex flex-col flex-1">
        <h3 className="font-serif font-semibold text-xl md:text-2xl text-vedic-dark">{category.title}</h3>
        {category.description && (
          <p className="mt-1.5 text-[13px] md:text-sm text-vedic-muted leading-relaxed line-clamp-2">{category.description}</p>
        )}
        <span className="mt-auto pt-4 inline-flex items-center gap-1.5 text-sm font-medium text-vedic-charcoal group-hover:text-vedic-goldDeep transition-colors">
          Explore <span aria-hidden="true" className="transition-transform group-hover:translate-x-0.5">→</span>
        </span>
      </div>
    </HomeLink>
  );
};

/**
 * Not live yet. Same image-on-top card as LiveCard once an image is added (see CATEGORY_IMAGES in
 * homeService.ts) — just not clickable, and "Coming Soon" instead of "Explore →". Until an image
 * is added it falls back to the plain dashed placeholder (name + "Coming Soon", nothing else).
 */
const SoonCard: React.FC<{ category: HomeCategory }> = ({ category }) => {
  const [imageFailed, setImageFailed] = useState(false);

  if (!category.image || imageFailed) {
    return (
      <div className="h-full min-h-[120px] md:min-h-[160px] flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-vedic-gold/50 bg-white/60 p-4 text-center">
        <h3 className="font-serif font-semibold text-xl md:text-2xl text-vedic-charcoal/70">{category.title}</h3>
        <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-vedic-goldDeep">Coming Soon</span>
      </div>
    );
  }

  return (
    <div className={`flex flex-col h-full bg-white rounded-2xl overflow-hidden border border-black/5 ${CARD_SHADOW}`}>
      <div className="relative aspect-[4/3] overflow-hidden bg-vedic-sand">
        <img
          src={category.image}
          alt={category.title}
          width={640}
          height={480}
          loading="lazy"
          decoding="async"
          onError={() => setImageFailed(true)}
          className="absolute inset-0 w-full h-full object-cover"
        />
      </div>
      <div className="p-4 md:p-6 flex flex-col flex-1">
        <h3 className="font-serif font-semibold text-xl md:text-2xl text-vedic-dark">{category.title}</h3>
        {category.description && (
          <p className="mt-1.5 text-[13px] md:text-sm text-vedic-muted leading-relaxed line-clamp-2">{category.description}</p>
        )}
        <span className="mt-auto pt-4 inline-flex items-center gap-1.5 text-sm font-medium text-vedic-goldDeep">
          Coming Soon
        </span>
      </div>
    </div>
  );
};

/** "Explore Veda Store" — one card per category from Shopify; a new category is a new entry, not new code. */
export const HomeCategoryGrid: React.FC<{ content: SectionContent; categories: HomeCategory[] }> = ({ content, categories }) => {
  if (!categories.length) return null;
  return (
    <HomeSection id="explore" tone="ivory">
      <SectionHeader eyebrow={content.eyebrow} title={content.title} description={content.description} />
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {categories.map((c) => (c.status === 'live' ? <LiveCard key={c.id} category={c} /> : <SoonCard key={c.id} category={c} />))}
      </div>
      {content.ctaLabel && content.ctaHref && (
        <div className="mt-10 text-center">
          <HomeCta href={content.ctaHref} variant="tertiary">{content.ctaLabel}</HomeCta>
        </div>
      )}
    </HomeSection>
  );
};
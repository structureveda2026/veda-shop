import React from 'react';
import { Link } from 'react-router-dom';
import { HomeSection, SectionHeader } from './HomeSection';
import { HomeCta } from './HomeCta';
import { track } from '../../lib/analytics';
import type { RashiTile } from '../../services/rashiService';
import type { SectionContent } from '../../services/homeService';

/** "Mesh (मेष)" → { name: "Mesh", hindi: "मेष" } */
function splitName(nameHi: string): { name: string; hindi: string } {
  const match = nameHi.match(/^(.*?)\s*\((.*)\)\s*$/);
  return match ? { name: match[1], hindi: match[2] } : { name: nameHi, hindi: '' };
}

/**
 * "Find Products by Rashi" — one reusable tile per rashi; every tile opens the same
 * /rashi/:slug template. The tiles come from Shopify, so the row is whatever the admin publishes.
 */
export const HomeRashiGrid: React.FC<{ content: SectionContent; rashi: RashiTile[] }> = ({ content, rashi }) => {
  if (!rashi.length) return null;
  return (
    <HomeSection id="shop-by-rashi" tone="ivory">
      <SectionHeader eyebrow={content.eyebrow} title={content.title} description={content.description} />
      <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-4">
        {rashi.map((r) => {
          const { name, hindi } = splitName(r.nameHi);
          return (
            <Link
              key={r.id}
              to={`/rashi/${r.slug}`}
              onClick={() => track('rashi_click', { rashi: r.slug })}
              className="group flex flex-col items-center text-center bg-white rounded-2xl border border-black/5 px-2 py-5 md:py-6 shadow-card hover:border-vedic-gold/60 hover:shadow-[0_12px_28px_rgba(26,26,26,0.08)] transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-vedic-gold"
            >
              {/* \uFE0E forces the plain (text) glyph so it takes our gold instead of a colour emoji */}
              <span className="text-3xl md:text-4xl leading-none text-vedic-gold" aria-hidden="true">
                {r.symbol}
                {'\uFE0E'}
              </span>
              <span className="mt-3 font-serif font-semibold text-base md:text-lg text-vedic-dark group-hover:text-vedic-goldDeep transition-colors">{name}</span>
              {hindi && <span className="text-xs text-vedic-muted mt-0.5">{hindi}</span>}
            </Link>
          );
        })}
      </div>
      {content.ctaLabel && content.ctaHref && (
        <div className="mt-10 text-center">
          <HomeCta href={content.ctaHref} variant="tertiary">{content.ctaLabel}</HomeCta>
        </div>
      )}
    </HomeSection>
  );
};
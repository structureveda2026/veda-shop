import React, { useState } from 'react';
import { Instagram } from 'lucide-react';
import { HomeSection, SectionHeader } from './HomeSection';
import { HomeCta } from './HomeCta';
import type { SectionContent, SocialTile } from '../../services/homeService';

/** One tile image; if it fails to load we show a calm placeholder instead of broken-image alt text. */
const TileImage: React.FC<{ tile: SocialTile }> = ({ tile }) => {
  const [failed, setFailed] = useState(false);
  if (failed) {
    return (
      <span className="absolute inset-0 flex items-center justify-center text-vedic-gold/60">
        <Instagram className="w-6 h-6" aria-hidden="true" />
      </span>
    );
  }
  return (
    <img
      src={tile.image}
      alt={tile.alt}
      width={400}
      height={400}
      loading="lazy"
      decoding="async"
      onError={() => setFailed(true)}
      className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
    />
  );
};

/** "Follow Veda Store" — a six-tile Instagram-style grid. Hidden until the admin adds tiles. */
export const HomeSocial: React.FC<{ content: SectionContent; tiles: SocialTile[] }> = ({ content, tiles }) => {
  if (!tiles.length) return null;
  return (
    <HomeSection id="social" tone="ivory">
      <SectionHeader eyebrow={content.eyebrow} title={content.title} description={content.description} />
      <ul className="grid grid-cols-3 lg:grid-cols-6 gap-2 md:gap-3">
        {tiles.slice(0, 6).map((tile) => {
          const image = (
            <>
              <TileImage tile={tile} />
              {tile.href && (
                <span className="absolute inset-0 flex items-center justify-center bg-vedic-dark/0 group-hover:bg-vedic-dark/35 transition-colors">
                  <Instagram className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" aria-hidden="true" />
                </span>
              )}
            </>
          );
          const frame = 'group relative block aspect-square overflow-hidden rounded-xl bg-vedic-sand';
          return (
            <li key={tile.id}>
              {tile.href ? (
                <a href={tile.href} target="_blank" rel="noopener noreferrer" aria-label={tile.alt} className={`${frame} focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-vedic-gold`}>
                  {image}
                </a>
              ) : (
                <div className={frame}>{image}</div>
              )}
            </li>
          );
        })}
      </ul>
      {content.ctaLabel && content.ctaHref && (
        <div className="mt-10 text-center">
          <HomeCta href={content.ctaHref} variant="secondary">{content.ctaLabel}</HomeCta>
        </div>
      )}
    </HomeSection>
  );
};
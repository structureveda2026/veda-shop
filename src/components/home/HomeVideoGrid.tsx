import React, { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Play } from 'lucide-react';
import { HomeSection, ScrollControls, SectionHeader } from './HomeSection';
import { HomeCta } from './HomeCta';
import { track } from '../../lib/analytics';
import type { HomeVideo, SectionContent } from '../../services/homeService';

/**
 * A reel-style card. Nothing heavy loads up front: it's just a poster image until the visitor
 * taps play, and only then does the <video> (or embed) get created.
 */
const VideoCard: React.FC<{ video: HomeVideo }> = ({ video }) => {
  const [playing, setPlaying] = useState(false);
  const [posterFailed, setPosterFailed] = useState(false);
  const playable = video.sources.length > 0 || Boolean(video.embedUrl);
  const productHref = video.productHandle ? `/products/${video.productHandle}` : undefined;

  const frame = 'relative block aspect-[9/16] rounded-2xl overflow-hidden bg-vedic-charcoal';
  const poster = video.poster && !posterFailed && (
    <img
      src={video.poster}
      alt={video.title}
      width={360}
      height={640}
      loading="lazy"
      decoding="async"
      onError={() => setPosterFailed(true)}
      className="absolute inset-0 w-full h-full object-cover"
    />
  );

  let media: React.ReactNode;
  if (playing && video.embedUrl) {
    media = (
      <div className={frame}>
        <iframe
          src={`${video.embedUrl}${video.embedUrl.includes('?') ? '&' : '?'}autoplay=1`}
          title={video.title}
          allow="autoplay; encrypted-media; picture-in-picture"
          allowFullScreen
          className="absolute inset-0 w-full h-full"
        />
      </div>
    );
  } else if (playing) {
    media = (
      <div className={frame}>
        <video autoPlay controls playsInline preload="none" poster={video.poster} className="absolute inset-0 w-full h-full object-cover bg-black">
          {video.sources.map((s) => (
            <source key={s.url} src={s.url} type={s.mimeType} />
          ))}
        </video>
      </div>
    );
  } else if (playable) {
    media = (
      <button
        type="button"
        onClick={() => {
          track('video_click', { video: video.id });
          setPlaying(true);
        }}
        aria-label={`Play video: ${video.title}`}
        className={`${frame} group w-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-vedic-gold`}
      >
        {poster}
        <span className="absolute inset-0 flex items-center justify-center">
          <span className="w-14 h-14 rounded-full bg-white/90 flex items-center justify-center text-vedic-charcoal shadow-md transition-transform duration-300 group-hover:scale-105">
            <Play className="w-5 h-5 fill-current ml-0.5" aria-hidden="true" />
          </span>
        </span>
      </button>
    );
  } else {
    // No playable file (poster-only entry) — the card simply opens the product / video page.
    media = (
      <Link to={productHref ?? '/videos'} onClick={() => track('video_click', { video: video.id })} className={`${frame} group`}>
        {poster}
      </Link>
    );
  }

  return (
    <div className="snap-start shrink-0 w-[62%] sm:w-[230px] lg:w-[250px]">
      {media}
      <p className="mt-3 text-sm font-medium text-vedic-dark leading-snug">{video.title}</p>
      {productHref && (
        <Link to={productHref} className="mt-1 inline-block text-xs text-vedic-muted hover:text-vedic-goldDeep transition-colors line-clamp-1">
          {video.productTitle ? `Shop ${video.productTitle} →` : 'Shop this product →'}
        </Link>
      )}
    </div>
  );
};

/** "See It. Understand It. Choose Better." — horizontal video row. Hidden until at least one video exists. */
export const HomeVideoGrid: React.FC<{ content: SectionContent; videos: HomeVideo[] }> = ({ content, videos }) => {
  const rowRef = useRef<HTMLDivElement>(null);
  if (!videos.length) return null;

  return (
    <HomeSection id="shop-by-video" tone="ivory">
      <SectionHeader
        eyebrow={content.eyebrow}
        title={content.title}
        description={content.description}
        align="left"
        action={<ScrollControls targetRef={rowRef} className="hidden md:flex" />}
      />
      <div ref={rowRef} className="flex gap-4 md:gap-6 overflow-x-auto snap-x snap-mandatory scroll-smooth no-scrollbar -mx-4 px-4 scroll-px-4 sm:mx-0 sm:px-0 sm:scroll-px-0 pb-2">
        {videos.map((video) => (
          <VideoCard key={video.id} video={video} />
        ))}
      </div>
      {content.ctaLabel && content.ctaHref && (
        <div className="mt-10 text-center">
          <HomeCta href={content.ctaHref} variant="secondary">{content.ctaLabel}</HomeCta>
        </div>
      )}
    </HomeSection>
  );
};
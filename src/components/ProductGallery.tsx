import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { ChevronLeft, ChevronRight, Maximize2, Play, X } from 'lucide-react';
import { ProductMediaItem, fetchProductMedia, isShopifyEnabled } from '../lib/shopify';

interface ProductGalleryProps {
  title: string;
  /** Shopify product handle (the product's slug). With Shopify enabled, the gallery shows whatever
   *  the owner has uploaded for it — images and videos, in their order. */
  handle?: string;
  /** Used when Shopify isn't enabled, or has nothing for this product. */
  images: string[];
  videos?: string[];
  /** Badges / wishlist button etc., positioned by the caller over the main picture. */
  overlay?: React.ReactNode;
  /** Extra classes for the gallery's outer element (e.g. to let it fill the height of its column). */
  className?: string;
}

/** Shopify CDN images can be resized through ?width= — no need to download a 4000px original for a thumbnail. */
const sized = (url: string, width: number) => {
  try {
    const u = new URL(url);
    if (!u.hostname.endsWith('cdn.shopify.com') && !u.pathname.includes('/cdn/shop/')) return url;
    u.searchParams.set('width', String(width));
    return u.toString();
  } catch {
    return url;
  }
};

const MediaView: React.FC<{ item: ProductMediaItem; title: string; width: number; className?: string; autoPlay?: boolean }> = ({
  item,
  title,
  width,
  className = '',
  autoPlay = false,
}) => {
  if (item.kind === 'video') {
    return (
      <video
        key={item.id}
        controls
        playsInline
        autoPlay={autoPlay}
        preload="metadata"
        poster={item.poster ? sized(item.poster, width) : undefined}
        className={`bg-black ${className}`}
      >
        {(item.sources?.length ? item.sources : [{ url: item.url, mimeType: '' }]).map((s) => (
          <source key={s.url} src={s.url} type={s.mimeType || undefined} />
        ))}
      </video>
    );
  }
  if (item.kind === 'embed') {
    return (
      <iframe
        key={item.id}
        src={item.url}
        title={item.alt || `${title} video`}
        allow="autoplay; fullscreen; picture-in-picture"
        allowFullScreen
        className={`bg-black border-0 ${className}`}
      />
    );
  }
  return <img src={sized(item.url, width)} alt={item.alt || title} className={className} draggable={false} />;
};

const Lightbox: React.FC<{
  items: ProductMediaItem[];
  index: number;
  title: string;
  onIndex: (i: number) => void;
  onClose: () => void;
}> = ({ items, index, title, onIndex, onClose }) => {
  const item = items[index];
  const many = items.length > 1;
  const go = (delta: number) => onIndex((index + delta + items.length) % items.length);
  const touchX = useRef<number | null>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      else if (many && e.key === 'ArrowRight') go(1);
      else if (many && e.key === 'ArrowLeft') go(-1);
    };
    window.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  });

  const navBtn = 'absolute top-1/2 -translate-y-1/2 z-10 w-11 h-11 flex items-center justify-center rounded-full bg-white/15 hover:bg-white/30 text-white backdrop-blur-sm transition-colors';

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`${title} — full view`}
      className="fixed inset-0 z-[200] bg-black/95 flex items-center justify-center"
      onClick={onClose}
      onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
      onTouchEnd={(e) => {
        if (touchX.current === null || !many) return;
        const dx = e.changedTouches[0].clientX - touchX.current;
        touchX.current = null;
        if (Math.abs(dx) > 60) go(dx < 0 ? 1 : -1);
      }}
    >
      <button
        onClick={onClose}
        aria-label="Close full view"
        className="absolute top-4 right-4 z-10 w-11 h-11 flex items-center justify-center rounded-full bg-white/15 hover:bg-white/30 text-white backdrop-blur-sm transition-colors"
      >
        <X className="w-5 h-5" />
      </button>

      {many && (
        <span className="absolute top-5 left-1/2 -translate-x-1/2 text-xs font-bold text-white/80 tabular-nums">
          {index + 1} / {items.length}
        </span>
      )}

      {many && (
        <button onClick={(e) => { e.stopPropagation(); go(-1); }} aria-label="Previous" className={`${navBtn} left-3 sm:left-6`}>
          <ChevronLeft className="w-6 h-6" />
        </button>
      )}

      <div className="w-full h-full px-4 sm:px-20 py-16 flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
        <MediaView
          key={item.id}
          item={item}
          title={title}
          width={2000}
          autoPlay={item.kind === 'video'}
          className={
            item.kind === 'embed'
              ? 'w-full max-w-5xl aspect-video rounded-xl'
              : 'max-w-full max-h-full object-contain rounded-xl'
          }
        />
      </div>

      {many && (
        <button onClick={(e) => { e.stopPropagation(); go(1); }} aria-label="Next" className={`${navBtn} right-3 sm:right-6`}>
          <ChevronRight className="w-6 h-6" />
        </button>
      )}
    </div>,
    document.body
  );
};

/**
 * Fills the space above / below a picture that is shorter than its card (the card grows with the info card
 * beside it): the picture's own top / bottom edge, stretched and softened, so it carries on seamlessly
 * instead of leaving white bands and the card reads as just the image.
 */
const EdgeFill: React.FC<{ url: string; side: 'top' | 'bottom' }> = ({ url, side }) => (
  <div aria-hidden="true" className="relative w-full flex-1 min-h-0 overflow-hidden pointer-events-none">
    <div
      className="absolute -inset-4 blur-md"
      style={{
        backgroundImage: `url("${sized(url, 160)}")`,
        backgroundRepeat: 'no-repeat',
        // only the first / last few rows of the picture, stretched tall; flipped so that the row touching
        // the picture is the one sitting right at the seam
        backgroundSize: '100% 3000%',
        backgroundPosition: side === 'top' ? 'center top' : 'center bottom',
        transform: 'scaleY(-1)',
      }}
    />
  </div>
);

export const ProductGallery: React.FC<ProductGalleryProps> = ({ title, handle, images, videos, overlay, className = '' }) => {
  const useShopify = isShopifyEnabled() && Boolean(handle);
  // undefined = still loading · null = Shopify has no such product / request failed · array = its media
  const [remote, setRemote] = useState<ProductMediaItem[] | null | undefined>(undefined);

  useEffect(() => {
    if (!useShopify) return;
    let live = true;
    setRemote(undefined);
    fetchProductMedia(handle as string)
      .then((media) => live && setRemote(media))
      .catch(() => live && setRemote(null));
    return () => {
      live = false;
    };
  }, [handle, useShopify]);

  const local = useMemo<ProductMediaItem[]>(
    () => [
      ...images.map((url, i) => ({ id: `img-${i}`, kind: 'image' as const, url })),
      ...(videos ?? []).map((url, i) => ({ id: `vid-${i}`, kind: 'video' as const, url })),
    ],
    [images, videos]
  );

  const loading = useShopify && remote === undefined;
  const items = remote && remote.length > 0 ? remote : local;

  const [active, setActive] = useState(0);
  const [fullView, setFullView] = useState(false);
  const columnRef = useRef<HTMLDivElement>(null);

  useEffect(() => setActive(0), [items]);

  // Keep the selected thumbnail in view inside its own scrolling column (never scrolls the page).
  useEffect(() => {
    const col = columnRef.current;
    const thumb = col?.children[active] as HTMLElement | undefined;
    if (!col || !thumb) return;
    if (thumb.offsetTop < col.scrollTop) col.scrollTop = thumb.offsetTop - 4;
    else if (thumb.offsetTop + thumb.offsetHeight > col.scrollTop + col.clientHeight)
      col.scrollTop = thumb.offsetTop + thumb.offsetHeight - col.clientHeight + 4;
  }, [active, items]);

  const current = items[Math.min(active, items.length - 1)];

  if (loading) {
    return (
      <div className={`flex gap-3 items-stretch animate-pulse ${className}`} aria-busy="true">
        <div className="w-16 sm:w-[5.5rem] shrink-0 flex flex-col gap-2 sm:gap-3 p-1">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="w-14 h-14 sm:w-20 sm:h-20 rounded-2xl bg-vedic-beige" />
          ))}
        </div>
        <div className="flex-1 min-w-0 aspect-square rounded-3xl bg-vedic-beige" />
      </div>
    );
  }

  if (!current) return null;

  return (
    <div className={`flex gap-3 items-stretch ${className}`}>
      {/* Thumbnails — vertical, on the left */}
      {items.length > 1 && (
        <div className="relative w-16 sm:w-[5.5rem] shrink-0">
          <div ref={columnRef} className="absolute inset-0 overflow-y-auto no-scrollbar flex flex-col gap-2 sm:gap-3 p-1">
            {items.map((item, idx) => (
              <button
                key={item.id}
                onClick={() => setActive(idx)}
                aria-label={item.kind === 'image' ? `View image ${idx + 1}` : `Play video ${idx + 1}`}
                aria-current={idx === active}
                className={`relative w-14 h-14 sm:w-20 sm:h-20 rounded-2xl overflow-hidden border-2 shrink-0 transition-all bg-white p-1 ${
                  idx === active
                    ? 'border-vedic-gold scale-95 shadow-md ring-2 ring-vedic-gold/40'
                    : 'border-vedic-beige opacity-70 hover:opacity-100'
                }`}
              >
                {item.kind === 'image' || item.poster ? (
                  <img
                    src={sized(item.kind === 'image' ? item.url : (item.poster as string), 200)}
                    alt=""
                    className="w-full h-full object-contain rounded-xl"
                    draggable={false}
                  />
                ) : (
                  <span className="block w-full h-full rounded-xl bg-vedic-dark" />
                )}
                {item.kind !== 'image' && (
                  <span className="absolute inset-0 flex items-center justify-center">
                    <span className="w-7 h-7 rounded-full bg-black/60 text-white flex items-center justify-center">
                      <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                    </span>
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Main picture / video */}
      <div className="flex-1 min-w-0 aspect-square rounded-3xl overflow-hidden bg-vedic-beige border border-vedic-gold/30 shadow-card relative group flex flex-col items-center justify-center">
        {/* The card is never left with white space: a blurred copy of the picture fills any gap around it
            (sides, when the photo isn't square) and its edges are mirrored above / below (see EdgeFill). */}
        {current.kind === 'image' && (
          <img
            src={sized(current.url, 160)}
            alt=""
            aria-hidden="true"
            draggable={false}
            className="absolute inset-0 w-full h-full object-cover scale-125 blur-2xl pointer-events-none"
          />
        )}
        {current.kind === 'image' && <EdgeFill url={current.url} side="top" />}
        {current.kind === 'image' ? (
          <button
            onClick={() => setFullView(true)}
            aria-label="Open full view"
            className="relative w-full aspect-square shrink-0 flex items-center justify-center cursor-zoom-in"
          >
            <MediaView
              item={current}
              title={title}
              width={1200}
              className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
            />
          </button>
        ) : (
          <MediaView
            item={current}
            title={title}
            width={1200}
            className={current.kind === 'embed' ? 'w-full aspect-video' : 'w-full h-full object-contain'}
          />
        )}
        {current.kind === 'image' && <EdgeFill url={current.url} side="bottom" />}

        {overlay}

        <button
          onClick={() => setFullView(true)}
          aria-label="Full view"
          title="Full view"
          className="absolute top-[4.5rem] right-4 bg-white/90 backdrop-blur-md p-2.5 rounded-full shadow-md text-vedic-maroon hover:bg-vedic-gold transition-colors"
        >
          <Maximize2 className="w-5 h-5" />
        </button>
      </div>

      {fullView && (
        <Lightbox
          items={items}
          index={Math.min(active, items.length - 1)}
          title={title}
          onIndex={setActive}
          onClose={() => setFullView(false)}
        />
      )}
    </div>
  );
};
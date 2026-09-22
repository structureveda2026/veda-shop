import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { SectionContent } from '../../services/homeService';

/** Shared building blocks for every band of the home page. */

const TONES = {
  ivory: 'bg-vedic-ivory',
  white: 'bg-white',
  sand: 'bg-vedic-sand',
  dark: 'bg-vedic-dark text-white',
} as const;

export type SectionTone = keyof typeof TONES;

interface HomeSectionProps {
  id?: string;
  tone?: SectionTone;
  className?: string;
  children: React.ReactNode;
}

export const HomeSection: React.FC<HomeSectionProps> = ({ id, tone = 'ivory', className = '', children }) => (
  // scroll-mt keeps in-page anchors clear of the sticky header
  <section id={id} className={`scroll-mt-28 ${TONES[tone]} ${className}`}>
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 md:py-20">{children}</div>
  </section>
);

interface SectionHeaderProps {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: 'center' | 'left';
  /** Right-hand slot (e.g. a "View All →" link) — shown beside a left-aligned header. */
  action?: React.ReactNode;
  className?: string;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({ eyebrow, title, description, align = 'center', action, className = 'mb-10 md:mb-14' }) => {
  const centered = align === 'center';
  return (
    <div className={`${className} ${centered ? 'text-center' : 'flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4'}`}>
      <div className={centered ? 'max-w-2xl mx-auto' : 'max-w-2xl'}>
        {eyebrow && (
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-vedic-goldDeep mb-3">{eyebrow}</p>
        )}
        <h2 className="font-serif font-semibold text-3xl md:text-[2.6rem] leading-tight text-vedic-dark">{title}</h2>
        {centered && <span className="block w-10 h-px bg-vedic-gold mx-auto mt-5" aria-hidden="true" />}
        {description && (
          <p className={`mt-4 text-[15px] md:text-base leading-relaxed text-vedic-muted ${centered ? '' : 'max-w-xl'}`}>{description}</p>
        )}
      </div>
      {action && !centered && <div className="shrink-0">{action}</div>}
    </div>
  );
};

/** Just the "Coming Soon" note — nothing else is shown for a band that isn't live yet. */
export const ComingSoonBox: React.FC = () => (
  <div className="max-w-2xl mx-auto rounded-2xl border border-dashed border-vedic-gold/60 bg-white/70 px-6 py-9 text-center">
    <p className="font-serif italic text-2xl text-vedic-goldDeep">Coming Soon</p>
  </div>
);

/**
 * A whole band in its "coming soon" state.
 * Once `content.image` is set (see COMING_SOON_BANNERS in homeService.ts), the eyebrow + title
 * stay, and a full-bleed banner (edge-to-edge, breaking out of the page container) replaces the
 * "Coming Soon" note below them. The banner's top/bottom edges fade into the section background
 * instead of cutting off hard, so it blends with the page. Until an image is added, it falls back
 * to the plain heading + "Coming Soon" note so nothing looks broken.
 */
export const ComingSoonSection: React.FC<{ id?: string; tone?: SectionTone; content: SectionContent }> = ({ id, tone = 'ivory', content }) => {
  if (content.image) {
    const fade =
      'linear-gradient(to bottom, transparent 0, black 32px, black calc(100% - 32px), transparent 100%)';
    return (
      <HomeSection id={id} tone={tone} className="[&>div]:py-10 md:[&>div]:py-14">
        <SectionHeader eyebrow={content.eyebrow} title={content.title} className="mb-8" />
        {/* left-1/2 + -mx-[50vw] + w-screen breaks the image out of the max-w-7xl container so it
            spans the full viewport width, regardless of how narrow or wide the page container is. */}
        <div className="relative left-1/2 right-1/2 -mx-[50vw] w-screen">
          <img
            src={content.image}
            alt={content.title}
            width={1920}
            height={640}
            loading="lazy"
            decoding="async"
            className="block w-full h-auto md:h-[420px] md:object-cover"
            style={{ WebkitMaskImage: fade, maskImage: fade }}
          />
        </div>
      </HomeSection>
    );
  }

  return (
    <HomeSection id={id} tone={tone} className="[&>div]:py-12 md:[&>div]:py-14">
      <SectionHeader eyebrow={content.eyebrow} title={content.title} className="mb-8" />
      <ComingSoonBox />
    </HomeSection>
  );
};

/** Prev / next buttons for a horizontally scrolling row. */
export const ScrollControls: React.FC<{ targetRef: React.RefObject<HTMLElement>; className?: string }> = ({ targetRef, className = '' }) => {
  const scrollBy = (direction: 1 | -1) => {
    const el = targetRef.current;
    if (!el) return;
    el.scrollBy({ left: direction * el.clientWidth * 0.8, behavior: 'smooth' });
  };
  const btn =
    'w-10 h-10 rounded-full border border-vedic-charcoal/20 bg-white text-vedic-charcoal flex items-center justify-center hover:border-vedic-charcoal transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-vedic-gold';
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <button type="button" onClick={() => scrollBy(-1)} aria-label="Previous" className={btn}>
        <ChevronLeft className="w-4 h-4" />
      </button>
      <button type="button" onClick={() => scrollBy(1)} aria-label="Next" className={btn}>
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
};
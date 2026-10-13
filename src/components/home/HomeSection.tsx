import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

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
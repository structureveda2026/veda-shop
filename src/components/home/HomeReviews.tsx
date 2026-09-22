import React, { useRef } from 'react';
import { ShieldCheck, Star } from 'lucide-react';
import { HomeSection, ScrollControls, SectionHeader } from './HomeSection';
import type { HomeReview, SectionContent } from '../../services/homeService';

/** "Trusted by Our Customers" — a calm scroll-snap carousel (no auto-play). Hidden until reviews exist. */
export const HomeReviews: React.FC<{ content: SectionContent; reviews: HomeReview[] }> = ({ content, reviews }) => {
  const rowRef = useRef<HTMLDivElement>(null);
  if (!reviews.length) return null;

  return (
    <HomeSection id="reviews" tone="white">
      <SectionHeader
        eyebrow={content.eyebrow}
        title={content.title}
        description={content.description}
        align="left"
        action={<ScrollControls targetRef={rowRef} className="hidden md:flex" />}
      />

      <div ref={rowRef} className="flex gap-4 md:gap-6 overflow-x-auto snap-x snap-mandatory scroll-smooth no-scrollbar -mx-4 px-4 scroll-px-4 sm:mx-0 sm:px-0 sm:scroll-px-0 pb-2">
        {reviews.map((review) => (
          <figure
            key={review.id}
            className="snap-start shrink-0 w-[86%] sm:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)] flex flex-col bg-vedic-ivory rounded-2xl border border-black/5 p-6 md:p-8"
          >
            <div className="flex text-vedic-gold" role="img" aria-label={`${review.rating} out of 5 stars`}>
              {[0, 1, 2, 3, 4].map((i) => (
                <Star key={i} className={`w-4 h-4 ${i < review.rating ? 'fill-current' : 'text-black/15'}`} />
              ))}
            </div>

            <blockquote className="mt-4 font-serif text-lg md:text-xl leading-snug text-vedic-dark">“{review.comment}”</blockquote>

            <figcaption className="mt-auto pt-6 flex items-center gap-3">
              {review.image && (
                <img src={review.image} alt="" width={40} height={40} loading="lazy" decoding="async" className="w-10 h-10 rounded-full object-cover" />
              )}
              <div className="min-w-0">
                <p className="text-sm font-semibold text-vedic-dark">{review.name}</p>
                {review.product && <p className="text-xs text-vedic-muted truncate">{review.product}</p>}
                {review.verified && (
                  <p className="mt-1 inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700">
                    <ShieldCheck className="w-3.5 h-3.5" aria-hidden="true" /> Verified Purchase
                  </p>
                )}
              </div>
            </figcaption>
          </figure>
        ))}
      </div>
    </HomeSection>
  );
};
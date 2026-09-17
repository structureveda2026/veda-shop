import React, { useEffect, useState } from 'react';
import { CheckCircle2, Star } from 'lucide-react';
import { getRudrakshaReviews, RudrakshaReview } from '../services/rudrakshaContentService';

const CARD_SKELETON_COUNT = 4;

/** Section 23 (spec): "What Our Customers Say" review grid. */
export const RudrakshaReviews: React.FC = () => {
  const [reviews, setReviews] = useState<RudrakshaReview[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    getRudrakshaReviews().then((result) => {
      if (!isMounted) return;
      setReviews(result);
      setIsLoading(false);
    });
    return () => {
      isMounted = false;
    };
  }, []);

  if (!isLoading && reviews.length === 0) return null;

  return (
    <section id="rudraksha-reviews" className="bg-vedic-ivory">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="text-center max-w-xl mx-auto mb-8 sm:mb-10">
          <p className="text-[11px] sm:text-xs font-bold tracking-[0.15em] text-vedic-goldDark uppercase mb-2">
            What People Say
          </p>
          <h2 className="font-serif font-semibold text-vedic-dark text-2xl sm:text-3xl">
            Customer Reviews
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {isLoading
            ? Array.from({ length: CARD_SKELETON_COUNT }).map((_, i) => (
                <div key={i} className="bg-white rounded-3xl p-5 border border-vedic-gold/15 shadow-card h-44 animate-pulse" />
              ))
            : reviews.map((rev) => (
                <div
                  key={rev.id}
                  className="bg-white rounded-3xl p-5 border border-vedic-gold/15 shadow-card flex flex-col justify-between"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex text-amber-400">
                        {[...Array(rev.rating)].map((_, i) => (
                          <Star key={i} className="w-3.5 h-3.5 fill-current" />
                        ))}
                      </div>
                      {rev.verified && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 whitespace-nowrap">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Verified
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-vedic-charcoal italic leading-relaxed line-clamp-5">
                      "{rev.comment}"
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-vedic-beige">
                    <h4 className="font-serif font-bold text-sm text-vedic-dark">{rev.customerName}</h4>
                    <p className="text-[10px] text-vedic-muted">{rev.location}</p>
                    <p className="text-[10px] font-semibold text-vedic-goldDark mt-0.5">
                      Purchased: {rev.productPurchased}
                    </p>
                  </div>
                </div>
              ))}
        </div>
      </div>
    </section>
  );
};
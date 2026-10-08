import React, { useEffect, useState } from 'react';
import { CheckCircle2, Star } from 'lucide-react';
import { getYantraReviews, type YantraReview, type YantraReviewGroup } from '../services/yantraContentService';
import { YantraSectionHeading } from './YantraSectionHeading';

const FILTERS: { id: 'all' | YantraReviewGroup; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'wealth', label: 'Shree & Kuber' },
  { id: 'protection', label: 'Shiva & Devi' },
  { id: 'planetary', label: 'Navgraha' },
  { id: 'home', label: 'Home & Vastu' }
];

/** Section 12: "Loved by Our Customers" with a group filter. Demo reviews — real ones come from the reviews app
 *  scoped to the yantra collection once Shopify is connected. */
export const YantraReviews: React.FC = () => {
  const [filter, setFilter] = useState<'all' | YantraReviewGroup>('all');
  const [reviews, setReviews] = useState<YantraReview[]>([]);

  useEffect(() => {
    let isMounted = true;
    getYantraReviews(filter).then((r) => isMounted && setReviews(r));
    return () => {
      isMounted = false;
    };
  }, [filter]);

  return (
    <section id="yantra-reviews" className="bg-white scroll-mt-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <YantraSectionHeading align="center" eyebrow="What People Say" title="Loved by Our Customers" />

        <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-4 px-4 pb-1 sm:mx-0 sm:px-0 sm:flex-wrap sm:justify-center mb-8">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              aria-pressed={filter === f.id}
              className={`shrink-0 px-4 py-1.5 rounded-full text-xs font-semibold border transition-colors whitespace-nowrap ${
                filter === f.id ? 'bg-vedic-gold text-vedic-dark border-vedic-gold' : 'bg-white text-vedic-muted border-vedic-gold/20 hover:border-vedic-gold/50'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {reviews.length === 0 ? (
          <p className="text-center text-sm text-vedic-muted">No reviews in this category yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {reviews.map((rev) => (
              <div key={rev.id} className="bg-vedic-ivory rounded-3xl p-5 border border-vedic-gold/15 shadow-card flex flex-col justify-between">
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex text-amber-400" aria-label={`${rev.rating} out of 5`}>
                      {[...Array(rev.rating)].map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-current" />
                      ))}
                    </div>
                    {rev.verified && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 whitespace-nowrap">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Verified Purchase
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-vedic-charcoal italic leading-relaxed">&ldquo;{rev.comment}&rdquo;</p>
                </div>
                <div className="mt-4 pt-3 border-t border-vedic-beige">
                  <h4 className="font-serif font-bold text-sm text-vedic-dark">{rev.customerName}</h4>
                  <p className="text-[11px] text-vedic-muted">{rev.location}</p>
                  <p className="text-[11px] font-semibold text-vedic-goldDeep mt-0.5">Purchased: {rev.productPurchased}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
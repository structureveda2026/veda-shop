import React, { useEffect, useState } from 'react';
import { CheckCircle2, Star } from 'lucide-react';
import { BraceletReview, BraceletReviewCategory, getBraceletReviews } from '../services/braceletContentService';

const FILTERS: { id: 'all' | BraceletReviewCategory; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'rudraksha', label: 'Rudraksha' },
  { id: 'gemstone', label: 'Gemstone' },
  { id: 'crystal', label: 'Crystal' },
  { id: 'premium', label: 'Premium' }
];

/** Section 23 (spec): Loved by Our Customers — with All | Rudraksha | Gemstone | Crystal | Premium
 *  filters. Demo reviews; real product reviews (with photo/video) come from the review system
 *  built on the product page once the backend is connected. */
export const BraceletReviews: React.FC = () => {
  const [filter, setFilter] = useState<'all' | BraceletReviewCategory>('all');
  const [reviews, setReviews] = useState<BraceletReview[]>([]);

  useEffect(() => {
    let isMounted = true;
    getBraceletReviews(filter).then((r) => isMounted && setReviews(r));
    return () => {
      isMounted = false;
    };
  }, [filter]);

  return (
    <section id="bracelet-reviews" className="bg-vedic-ivory">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="text-center max-w-xl mx-auto mb-6">
          <p className="text-[11px] sm:text-xs font-bold tracking-[0.15em] text-vedic-goldDark uppercase mb-2">What People Say</p>
          <h2 className="font-serif font-semibold text-vedic-dark text-2xl sm:text-3xl">Loved by Our Customers</h2>
        </div>

        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              aria-pressed={filter === f.id}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            {reviews.map((rev) => (
              <div key={rev.id} className="bg-white rounded-3xl p-5 border border-vedic-gold/15 shadow-card flex flex-col justify-between">
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex text-amber-400">
                      {[...Array(rev.rating)].map((_, i) => (<Star key={i} className="w-3.5 h-3.5 fill-current" />))}
                    </div>
                    {rev.verified && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 whitespace-nowrap">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Verified Purchase
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-vedic-charcoal italic leading-relaxed line-clamp-5">"{rev.comment}"</p>
                </div>
                <div className="mt-4 pt-3 border-t border-vedic-beige">
                  <h4 className="font-serif font-bold text-sm text-vedic-dark">{rev.customerName}</h4>
                  <p className="text-[10px] text-vedic-muted">{rev.location}</p>
                  <p className="text-[10px] font-semibold text-vedic-goldDark mt-0.5">Purchased: {rev.productPurchased}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
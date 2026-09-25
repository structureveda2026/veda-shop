import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Product, Review } from '../types/ecommerce';
import { useAuth } from '../context/AuthContext';
import {
  buildDemoFallbackReviews,
  canReviewProduct,
  getProductReviews,
  hasSubmittedReview,
  submitProductReview,
} from '../services/productReviewService';
import { Star, ImagePlus, Video, X, BadgeCheck, PlayCircle, Loader2 } from 'lucide-react';

const MAX_IMAGES = 4;
const MAX_VIDEOS = 1;

const fileToDataUrl = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error('Could not read file'));
    reader.readAsDataURL(file);
  });

const StarPicker: React.FC<{ value: number; onChange: (v: number) => void }> = ({ value, onChange }) => (
  <div className="flex items-center gap-1">
    {[1, 2, 3, 4, 5].map((n) => (
      <button
        key={n}
        type="button"
        onClick={() => onChange(n)}
        aria-label={`${n} star${n > 1 ? 's' : ''}`}
        className="p-0.5"
      >
        <Star className={`w-6 h-6 ${n <= value ? 'fill-amber-400 text-amber-400' : 'text-vedic-beige'}`} />
      </button>
    ))}
  </div>
);

const ReviewCard: React.FC<{ review: Review }> = ({ review }) => (
  <div className="bg-vedic-ivory p-4 rounded-2xl border border-vedic-gold/20 space-y-2">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2 font-bold text-vedic-maroon text-xs">
        <span>{review.customerName}</span>
        {review.verifiedPurchase && (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
            <BadgeCheck className="w-3 h-3" /> Verified Purchase
          </span>
        )}
      </div>
      <div className="flex items-center text-amber-400">
        {[...Array(5)].map((_, i) => (
          <Star key={i} className={`w-3.5 h-3.5 ${i < review.rating ? 'fill-current' : 'text-vedic-beige'}`} />
        ))}
      </div>
    </div>
    <p className="text-xs text-vedic-charcoal leading-relaxed">"{review.comment}"</p>
    {(review.images?.length || review.videos?.length) ? (
      <div className="flex flex-wrap gap-2 pt-1">
        {review.images?.map((src, i) => (
          <img key={i} src={src} alt="Review attachment" className="w-16 h-16 rounded-lg object-cover border border-vedic-gold/20" />
        ))}
        {review.videos?.map((src, i) => (
          <div key={i} className="relative w-16 h-16 rounded-lg overflow-hidden border border-vedic-gold/20 bg-black/80 flex items-center justify-center">
            <video src={src} className="w-full h-full object-cover opacity-70" muted />
            <PlayCircle className="absolute w-6 h-6 text-white" />
          </div>
        ))}
      </div>
    ) : null}
    <p className="text-[10px] text-vedic-muted">
      {new Date(review.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
      {review.location ? ` · ${review.location}` : ''}
    </p>
  </div>
);

export const ProductReviewsSection: React.FC<{ product: Product }> = ({ product }) => {
  const { user, isAuthenticated, orders, openAuthModal } = useAuth();

  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [videos, setVideos] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [justSubmitted, setJustSubmitted] = useState(false);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let live = true;
    setIsLoading(true);
    getProductReviews(product.id, buildDemoFallbackReviews(product)).then((data) => {
      if (!live) return;
      setReviews(data);
      setIsLoading(false);
    });
    return () => {
      live = false;
    };
  }, [product.id]);

  // Reset the write-review flow when navigating to a different product.
  useEffect(() => {
    setShowForm(false);
    setRating(5);
    setComment('');
    setImages([]);
    setVideos([]);
    setJustSubmitted(false);
  }, [product.id]);

  const averageRating = useMemo(() => {
    if (reviews.length === 0) return product.rating;
    return reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
  }, [reviews, product.rating]);

  // Real orders come from Shopify Customer Account API / a real backend once connected — this demo
  // AuthContext already models order status, so eligibility (delivered purchase of this product)
  // works the same way it will then. A backend must still re-verify this server-side on submit.
  const isEligible = isAuthenticated && canReviewProduct(orders, product.id);
  const alreadyReviewed = user ? hasSubmittedReview(product.id, user.fullName) : false;

  const handleAddImages = async (files: FileList | null) => {
    if (!files) return;
    const slots = MAX_IMAGES - images.length;
    const picked = Array.from(files).slice(0, slots);
    const dataUrls = await Promise.all(picked.map(fileToDataUrl));
    setImages((prev) => [...prev, ...dataUrls]);
  };

  const handleAddVideos = async (files: FileList | null) => {
    if (!files) return;
    const slots = MAX_VIDEOS - videos.length;
    const picked = Array.from(files).slice(0, slots);
    const dataUrls = await Promise.all(picked.map(fileToDataUrl));
    setVideos((prev) => [...prev, ...dataUrls]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !comment.trim() || isSubmitting) return;
    setIsSubmitting(true);
    try {
      const review = await submitProductReview({
        productId: product.id,
        customerName: user.fullName,
        rating,
        comment: comment.trim(),
        images,
        videos,
      });
      setReviews((prev) => [review, ...prev]);
      setShowForm(false);
      setJustSubmitted(true);
      setComment('');
      setImages([]);
      setVideos([]);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between border-b border-vedic-beige pb-3">
        <span className="font-serif font-bold text-sm text-vedic-brown">Customer Reviews</span>
        <span className="text-xs text-vedic-goldDark font-bold">
          {averageRating.toFixed(1)} Star Rating · {reviews.length} Review{reviews.length === 1 ? '' : 's'}
        </span>
      </div>

      {/* Write a review — only for a signed-in customer with a delivered purchase of this product. */}
      <div className="bg-white rounded-2xl border border-vedic-gold/20 p-4">
        {justSubmitted && !showForm && (
          <p className="text-xs font-semibold text-emerald-700 mb-2">Thanks — your review has been posted!</p>
        )}
        {!isAuthenticated && (
          <p className="text-xs text-vedic-muted">
            <button onClick={() => openAuthModal('to write a review')} className="font-bold text-vedic-maroon hover:underline">
              Sign in
            </button>{' '}
            after your order is delivered to write a review.
          </p>
        )}
        {isAuthenticated && !isEligible && (
          <p className="text-xs text-vedic-muted">You can write a review once your order for this product has been delivered.</p>
        )}
        {isAuthenticated && isEligible && alreadyReviewed && !showForm && (
          <p className="text-xs text-vedic-muted">You've already reviewed this product. Thank you!</p>
        )}
        {isAuthenticated && isEligible && !alreadyReviewed && !showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="text-xs font-bold text-vedic-maroon hover:underline"
          >
            WRITE A REVIEW →
          </button>
        )}

        {showForm && (
          <form onSubmit={handleSubmit} className="space-y-3 mt-1">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-vedic-muted mb-1">Your Rating</label>
              <StarPicker value={rating} onChange={setRating} />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-vedic-muted mb-1">Your Review</label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                required
                rows={3}
                placeholder="Share your experience with this product…"
                className="w-full text-xs p-3 rounded-xl border border-vedic-gold/30 bg-vedic-ivory focus:outline-none focus:ring-2 focus:ring-vedic-gold/40 resize-none"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {images.map((src, i) => (
                <div key={i} className="relative">
                  <img src={src} alt="" className="w-14 h-14 rounded-lg object-cover border border-vedic-gold/20" />
                  <button
                    type="button"
                    onClick={() => setImages((prev) => prev.filter((_, idx) => idx !== i))}
                    className="absolute -top-1.5 -right-1.5 bg-vedic-maroon text-white rounded-full p-0.5"
                    aria-label="Remove photo"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
              {videos.map((src, i) => (
                <div key={i} className="relative w-14 h-14 rounded-lg overflow-hidden border border-vedic-gold/20 bg-black/80 flex items-center justify-center">
                  <video src={src} className="w-full h-full object-cover opacity-70" muted />
                  <PlayCircle className="absolute w-5 h-5 text-white" />
                  <button
                    type="button"
                    onClick={() => setVideos((prev) => prev.filter((_, idx) => idx !== i))}
                    className="absolute -top-1.5 -right-1.5 bg-vedic-maroon text-white rounded-full p-0.5"
                    aria-label="Remove video"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}

              {images.length < MAX_IMAGES && (
                <button
                  type="button"
                  onClick={() => imageInputRef.current?.click()}
                  className="w-14 h-14 rounded-lg border border-dashed border-vedic-gold/40 flex flex-col items-center justify-center text-vedic-muted hover:border-vedic-gold hover:text-vedic-brown transition-colors"
                >
                  <ImagePlus className="w-4 h-4" />
                  <span className="text-[9px] mt-0.5">Photo</span>
                </button>
              )}
              {videos.length < MAX_VIDEOS && (
                <button
                  type="button"
                  onClick={() => videoInputRef.current?.click()}
                  className="w-14 h-14 rounded-lg border border-dashed border-vedic-gold/40 flex flex-col items-center justify-center text-vedic-muted hover:border-vedic-gold hover:text-vedic-brown transition-colors"
                >
                  <Video className="w-4 h-4" />
                  <span className="text-[9px] mt-0.5">Video</span>
                </button>
              )}
              <input
                ref={imageInputRef}
                type="file"
                accept="image/*"
                multiple
                hidden
                onChange={(e) => handleAddImages(e.target.files)}
              />
              <input
                ref={videoInputRef}
                type="file"
                accept="video/*"
                hidden
                onChange={(e) => handleAddVideos(e.target.files)}
              />
            </div>

            <div className="flex items-center gap-3 pt-1">
              <button
                type="submit"
                disabled={isSubmitting || !comment.trim()}
                className="bg-vedic-gold hover:bg-vedic-goldDark text-vedic-dark font-bold text-xs px-4 py-2 rounded-full shadow-sm disabled:opacity-40 disabled:cursor-not-allowed inline-flex items-center gap-1.5"
              >
                {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                SUBMIT REVIEW
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="text-xs font-bold text-vedic-muted hover:text-vedic-dark"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Review list */}
      <div className="space-y-3">
        {isLoading ? (
          <div className="space-y-2">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="h-20 rounded-2xl bg-vedic-beige animate-pulse" aria-busy="true" />
            ))}
          </div>
        ) : (
          reviews.map((review) => <ReviewCard key={review.id} review={review} />)
        )}
      </div>
    </div>
  );
};
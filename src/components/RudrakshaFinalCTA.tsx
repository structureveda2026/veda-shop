import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Compass, Phone, ShoppingBag } from 'lucide-react';

export interface RudrakshaFinalCTAProps {
  /** Scrolls back up to the Quick Finder — matches the same handler used by the Hero above. */
  onFindRudrakshaClick?: () => void;
}

/** Section 27 (spec): dark/premium closing CTA — the page's final push before the footer. */
export const RudrakshaFinalCTA: React.FC<RudrakshaFinalCTAProps> = ({ onFindRudrakshaClick }) => {
  return (
    <section id="rudraksha-final-cta" className="bg-vedic-dark">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20 text-center">
        <h2 className="font-serif font-semibold text-vedic-goldLight text-2xl sm:text-4xl mb-3">
          Find the Rudraksha That Fits Your Journey
        </h2>
        <p className="text-sm sm:text-base text-gray-400 max-w-xl mx-auto mb-8">
          Explore authentic Rudraksha or get personalized guidance before you choose.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            to="/collections/rudraksha"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-vedic-gold text-vedic-dark text-sm font-bold hover:bg-vedic-goldDark transition-colors"
          >
            <ShoppingBag className="w-4 h-4" />
            Shop Rudraksha
          </Link>
          <button
            onClick={onFindRudrakshaClick}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full border border-vedic-gold/40 text-vedic-gold text-sm font-bold hover:bg-white/5 transition-colors"
          >
            <Compass className="w-4 h-4" />
            Find My Rudraksha
          </button>
          <Link
            to="/contact?subject=Vedic%20Astrology%20Consultation"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full border border-white/20 text-white text-sm font-bold hover:bg-white/5 transition-colors"
          >
            <Phone className="w-4 h-4" />
            Talk to an Astrologer
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </section>
  );
};
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Compass, Phone, ShoppingBag } from 'lucide-react';

export interface BraceletFinalCTAProps {
  onFindBraceletClick?: () => void;
}

/** Section 26 (spec): premium closing CTA. */
export const BraceletFinalCTA: React.FC<BraceletFinalCTAProps> = ({ onFindBraceletClick }) => (
  <section id="bracelet-final-cta" className="bg-vedic-dark">
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20 text-center">
      <h2 className="font-serif font-semibold text-vedic-goldLight text-2xl sm:text-4xl mb-3">
        Find a Bracelet That Feels Right for You
      </h2>
      <p className="text-sm sm:text-base text-gray-400 max-w-xl mx-auto mb-8">
        Choose from Rudraksha, gemstones, crystals and traditional spiritual designs—or get
        personalized guidance before you buy.
      </p>
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
        <Link to="/collections/bracelets" className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-vedic-gold text-vedic-dark text-sm font-bold hover:bg-vedic-goldDark transition-colors">
          <ShoppingBag className="w-4 h-4" /> Shop Bracelets
        </Link>
        <button onClick={onFindBraceletClick} className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full border border-vedic-gold/40 text-vedic-gold text-sm font-bold hover:bg-white/5 transition-colors">
          <Compass className="w-4 h-4" /> Find My Bracelet
        </button>
        <Link to="/contact?subject=Vedic%20Astrology%20Consultation" className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full border border-white/20 text-white text-sm font-bold hover:bg-white/5 transition-colors">
          <Phone className="w-4 h-4" /> Consult an Astrologer <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  </section>
);
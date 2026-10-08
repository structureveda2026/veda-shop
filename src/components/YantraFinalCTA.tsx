import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, Phone, ShoppingBag } from 'lucide-react';
import { track } from '../lib/analytics';

export interface YantraFinalCTAProps {
  onFindYantraClick?: () => void;
}

/** Section 15: closing CTA. Light gold panel with a gold border — matches the store's light sections. */
export const YantraFinalCTA: React.FC<YantraFinalCTAProps> = ({ onFindYantraClick }) => (
  <section id="yantra-final-cta" className="bg-vedic-ivory">
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
      <div className="rounded-3xl border border-vedic-gold/40 bg-gradient-to-br from-vedic-card via-white to-vedic-card px-6 py-10 sm:px-12 sm:py-14 text-center shadow-card">
        <h2 className="font-serif font-semibold text-vedic-dark text-2xl sm:text-4xl mb-3">Bring Sacred Geometry into Your Worship</h2>
        <p className="text-sm sm:text-base text-vedic-muted max-w-xl mx-auto mb-8">
          Choose a yantra for your home or workplace, or talk to us for personal guidance before you buy.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            to="/collections/yantra"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-vedic-gold text-vedic-dark text-sm font-bold hover:bg-vedic-goldDark shadow-gold transition-colors"
          >
            <ShoppingBag className="w-4 h-4" /> Shop Yantras
          </Link>
          <button
            type="button"
            onClick={onFindYantraClick}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full border border-vedic-goldDeep/40 bg-white text-vedic-dark text-sm font-bold hover:border-vedic-goldDeep transition-colors"
          >
            <Compass className="w-4 h-4" /> Find My Yantra
          </button>
          <Link
            to="/contact?subject=Vedic%20Astrology%20Consultation"
            onClick={() => track('consultation_click', { source: 'yantra_final_cta' })}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full border border-vedic-gold/30 bg-white/70 text-vedic-dark text-sm font-bold hover:bg-white transition-colors"
          >
            <Phone className="w-4 h-4" /> Consult an Astrologer
          </Link>
        </div>
      </div>
    </div>
  </section>
);
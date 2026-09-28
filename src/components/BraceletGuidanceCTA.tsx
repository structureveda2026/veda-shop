import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Compass, Phone } from 'lucide-react';
import { FindMyProductModal } from './FindMyProductModal';

/** Sections 14 + 15 merged (spec): "Not Sure Which Bracelet to Choose?" finder + "Want a Bracelet
 *  According to Your Kundli?" astrology CTA — same merged treatment as RudrakshaGuidanceCTA.
 *  id="find-my-bracelet" is the scroll target BraceletHero's "Find My Bracelet" button uses.
 *  Reuses the site's real FindMyProductModal (already supports a Bracelet type). */
export const BraceletGuidanceCTA: React.FC = () => {
  const [isFinderOpen, setIsFinderOpen] = useState(false);

  return (
    <section id="find-my-bracelet" className="bg-vedic-ivory">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        <div className="bg-vedic-brown text-vedic-ivory rounded-3xl p-8 sm:p-12 border border-vedic-gold/40 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-3 max-w-2xl text-center md:text-left">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-vedic-gold uppercase tracking-widest">
              <Phone className="w-4 h-4" /> Free Vedic Guidance
            </span>
            <h2 className="font-serif font-bold text-2xl md:text-3xl text-vedic-goldLight">
              Not Sure Which Bracelet to Choose?
            </h2>
            <p className="text-sm text-gray-300 font-light leading-relaxed">
              Rashi-based selection is general. For a personalized recommendation, our astrologer
              can review your birth details and suggest suitable options — or use our finder for an
              instant suggestion by purpose, material, Rashi and budget.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 shrink-0">
            <Link
              to="/contact?subject=Vedic%20Astrology%20Consultation"
              className="bg-vedic-gold hover:bg-vedic-goldDark text-vedic-dark font-serif font-bold text-sm px-6 py-3.5 rounded-full shadow-lg hover:scale-105 transition-transform flex items-center justify-center gap-2 whitespace-nowrap"
            >
              Get Personalized Recommendation
            </Link>
            <button
              onClick={() => setIsFinderOpen(true)}
              className="bg-white/10 text-white border border-white/30 font-bold text-sm px-6 py-3.5 rounded-full hover:bg-white/20 transition-all flex items-center justify-center gap-2 whitespace-nowrap"
            >
              <Compass className="w-4 h-4" />
              Find My Bracelet
            </button>
          </div>
        </div>
      </div>

      <FindMyProductModal isOpen={isFinderOpen} onClose={() => setIsFinderOpen(false)} />
    </section>
  );
};
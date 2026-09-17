import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Compass, Phone } from 'lucide-react';
import { FindMyProductModal } from './FindMyProductModal';

/**
 * Sections 17 + 18 merged (spec): "Not Sure Which Rudraksha Is Right for You?" (Astrologer
 * Consultation) and the Rudraksha Recommendation System both solve the same problem —
 * personalised guidance before buying — so they sit together as two CTAs on one banner rather
 * than two separate sections.
 *
 * "Get Rudraksha Recommendation" reuses the site's existing FindMyProductModal (the same
 * Purpose/Rashi/Type finder already wired on the homepage) instead of building a new form —
 * that component already is the "Rudraksha Finder" frontend the spec asks for; a fuller
 * birth-chart-based engine (spec: "Future: Veda AI") is a backend upgrade to that same modal
 * later, not a new UI.
 */
export const RudrakshaGuidanceCTA: React.FC = () => {
  const [isFinderOpen, setIsFinderOpen] = useState(false);

  return (
    <section id="rudraksha-guidance" className="bg-vedic-ivory">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        <div className="bg-vedic-brown text-vedic-ivory rounded-3xl p-8 sm:p-12 border border-vedic-gold/40 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-3 max-w-2xl text-center md:text-left">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-vedic-gold uppercase tracking-widest">
              <Phone className="w-4 h-4" /> Free Vedic Guidance
            </span>
            <h2 className="font-serif font-bold text-2xl md:text-3xl text-vedic-goldLight">
              Not Sure Which Rudraksha Is Right for You?
            </h2>
            <p className="text-sm text-gray-300 font-light leading-relaxed">
              Every person has a different birth chart. Consult a Vedic astrologer for
              personalised guidance, or use our Rudraksha Finder for an instant recommendation
              based on your purpose and Rashi.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 shrink-0">
            <Link
              to="/contact?subject=Vedic%20Astrology%20Consultation"
              className="bg-vedic-gold hover:bg-vedic-goldDark text-vedic-dark font-serif font-bold text-sm px-6 py-3.5 rounded-full shadow-lg hover:scale-105 transition-transform flex items-center justify-center gap-2 whitespace-nowrap"
            >
              Consult an Astrologer
            </Link>
            <button
              onClick={() => setIsFinderOpen(true)}
              className="bg-white/10 text-white border border-white/30 font-bold text-sm px-6 py-3.5 rounded-full hover:bg-white/20 transition-all flex items-center justify-center gap-2 whitespace-nowrap"
            >
              <Compass className="w-4 h-4" />
              Get Rudraksha Recommendation
            </button>
          </div>
        </div>
      </div>

      <FindMyProductModal isOpen={isFinderOpen} onClose={() => setIsFinderOpen(false)} />
    </section>
  );
};
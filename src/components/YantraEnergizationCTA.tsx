import React from 'react';
import { Link } from 'react-router-dom';
import { Flame, Phone } from 'lucide-react';
import { track } from '../lib/analytics';

/** Section 10: "Want it energized by a pandit?" — connects the yantra business to the store's Puja & Yagya / consultation
 *  services. Light gold panel (no dark blocks), consistent with the rest of the store's light sections. */
export const YantraEnergizationCTA: React.FC = () => (
  <section id="yantra-energization" className="bg-white scroll-mt-28">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
      <div className="rounded-3xl border border-vedic-gold/40 bg-gradient-to-br from-vedic-card via-white to-vedic-card p-7 sm:p-12 shadow-card flex flex-col md:flex-row items-center justify-between gap-7">
        <div className="space-y-3 max-w-2xl text-center md:text-left">
          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-vedic-goldDeep uppercase tracking-widest">
            <Flame className="w-4 h-4" /> Energization &amp; Pandit Support
          </span>
          <h2 className="font-serif font-bold text-2xl md:text-3xl text-vedic-dark">Want Your Yantra Energized by a Pandit?</h2>
          <p className="text-sm text-vedic-muted leading-relaxed">
            Order your yantra and tell us you would like Pran Pratishtha — our team will arrange a pandit to energize it with the right mantras
            before it ships. For guidance based on your birth chart, you can also consult a Vedic astrologer.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row md:flex-col lg:flex-row gap-3 shrink-0 w-full sm:w-auto">
          <Link
            to="/contact?subject=Yantra%20Energization"
            onClick={() => track('puja_click', { source: 'yantra_energization' })}
            className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-vedic-gold hover:bg-vedic-goldDark text-vedic-dark text-sm font-bold shadow-gold hover:scale-[1.03] transition-all whitespace-nowrap"
          >
            <Flame className="w-4 h-4" /> Request Energization
          </Link>
          <Link
            to="/contact?subject=Vedic%20Astrology%20Consultation"
            onClick={() => track('consultation_click', { source: 'yantra_astrologer' })}
            className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full border border-vedic-goldDeep/40 bg-white hover:border-vedic-goldDeep text-vedic-dark text-sm font-bold transition-all whitespace-nowrap"
          >
            <Phone className="w-4 h-4" /> Consult an Astrologer
          </Link>
        </div>
      </div>
    </div>
  </section>
);
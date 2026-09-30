import React from 'react';
import { Link } from 'react-router-dom';
import { Phone, Users } from 'lucide-react';
import { track } from '../lib/analytics';

/** Section 11: "Prefer a pandit?" — connects the kit business to the store's Puja & Yagya / consultation services.
 *  Light gold panel (no dark blocks), consistent with the rest of the store's light sections. */
export const PujaKitPanditCTA: React.FC = () => (
  <section id="pandit-support" className="bg-vedic-ivory scroll-mt-28">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
      <div className="rounded-3xl border border-vedic-gold/40 bg-gradient-to-br from-vedic-card via-white to-vedic-card p-7 sm:p-12 shadow-card flex flex-col md:flex-row items-center justify-between gap-7">
        <div className="space-y-3 max-w-2xl text-center md:text-left">
          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-vedic-goldDeep uppercase tracking-widest">
            <Users className="w-4 h-4" /> Pandit Support
          </span>
          <h2 className="font-serif font-bold text-2xl md:text-3xl text-vedic-dark">Prefer a Pandit to Guide or Perform Your Puja?</h2>
          <p className="text-sm text-vedic-muted leading-relaxed">
            Order your kit and let our team help you arrange a pandit for the puja — or explore our online puja services. For guidance based on
            your birth chart, you can also consult a Vedic astrologer.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row md:flex-col lg:flex-row gap-3 shrink-0 w-full sm:w-auto">
          <Link
            to="/contact?subject=Book%20a%20Pandit%20for%20Puja"
            onClick={() => track('consultation_click', { source: 'puja_kits_pandit' })}
            className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-vedic-gold hover:bg-vedic-goldDark text-vedic-dark text-sm font-bold shadow-gold hover:scale-[1.03] transition-all whitespace-nowrap"
          >
            <Phone className="w-4 h-4" /> Book a Pandit
          </Link>
          <Link
            to="/collections/sawan-special-puja"
            onClick={() => track('puja_click', { source: 'puja_kits_online_puja' })}
            className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full border border-vedic-goldDeep/40 bg-white hover:border-vedic-goldDeep text-vedic-dark text-sm font-bold transition-all whitespace-nowrap"
          >
            Online Puja Services
          </Link>
        </div>
      </div>
    </div>
  </section>
);
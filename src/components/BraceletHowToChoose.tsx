import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Ruler } from 'lucide-react';
import {
  getHowToChooseSteps, getWristSizeOptions, HowToChooseStep, WristSizeOption
} from '../services/braceletContentService';

/** Sections 17 + 18 merged (spec): "How to Choose the Right Bracelet?" 4-step guide, with the
 *  wrist Size Guide as the expansion of step 4 (same merge logic as Rudraksha's Wear + Energize).
 *  Actual size options per product stay dynamic (each product's own sizes); the chart below is
 *  the general reference. Adjustable bracelets show an "Adjustable Fit" badge on their product card. */
export const BraceletHowToChoose: React.FC = () => {
  const [steps, setSteps] = useState<HowToChooseStep[]>([]);
  const [sizes, setSizes] = useState<WristSizeOption[]>([]);

  useEffect(() => {
    let isMounted = true;
    getHowToChooseSteps().then((r) => isMounted && setSteps(r));
    getWristSizeOptions().then((r) => isMounted && setSizes(r));
    return () => {
      isMounted = false;
    };
  }, []);

  if (steps.length === 0) return null;

  return (
    <section id="how-to-choose" className="bg-vedic-ivory">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-10">
          <p className="text-[11px] sm:text-xs font-bold tracking-[0.15em] text-vedic-goldDark uppercase mb-2">Simple Guide</p>
          <h2 className="font-serif font-semibold text-vedic-dark text-2xl sm:text-3xl">How to Choose the Right Bracelet?</h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-8">
          {steps.map((s) => (
            <div key={s.id} className="bg-white border border-vedic-gold/15 rounded-2xl p-5 shadow-card">
              <span className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-vedic-gold text-vedic-dark font-serif font-bold text-sm mb-3">{s.step}</span>
              <h3 className="font-serif font-bold text-vedic-dark text-sm sm:text-base mb-1">{s.title}</h3>
              <p className="text-xs text-vedic-muted leading-relaxed">{s.description}</p>
            </div>
          ))}
        </div>

        <div className="bg-white border border-vedic-gold/20 rounded-3xl p-6 sm:p-8 shadow-card">
          <div className="flex items-center gap-2 mb-1">
            <Ruler className="w-4 h-4 text-vedic-goldDark" strokeWidth={1.5} />
            <h3 className="font-serif font-bold text-vedic-dark text-lg">Find Your Perfect Fit</h3>
          </div>
          <p className="text-sm text-vedic-muted mb-4">Measure your wrist with a soft tape or string, then match it to a range below.</p>
          <div className="flex flex-wrap gap-2 mb-4">
            {sizes.map((s) => (
              <span key={s.id} className="px-4 py-2 rounded-full bg-vedic-ivory border border-vedic-gold/25 text-xs sm:text-sm font-semibold text-vedic-dark">{s.label}</span>
            ))}
          </div>
          <p className="text-[11px] text-vedic-muted">Size options shown on each product are dynamic. Adjustable bracelets carry an “Adjustable Fit” badge.</p>
        </div>

        <div className="mt-6 text-center">
          <Link to="/blog" className="inline-flex items-center gap-1.5 text-sm font-semibold text-vedic-goldDark hover:text-vedic-maroon transition-colors">
            Read Bracelet Buying Guide
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </section>
  );
};
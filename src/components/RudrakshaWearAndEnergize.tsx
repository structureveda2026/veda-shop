import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Droplets, Flame, Heart, ListChecks, Sparkles } from 'lucide-react';
import { getRudrakshaEnergizationOptions, EnergizationOption } from '../services/rudrakshaContentService';

const WEAR_STEPS = [
  { id: 'choose', title: 'Choose', description: 'Select the Rudraksha appropriate for you.', icon: ListChecks },
  { id: 'clean', title: 'Clean', description: 'Follow the recommended cleaning procedure.', icon: Droplets },
  { id: 'energize', title: 'Energization', description: 'Optional traditional Vedic energization process.', icon: Flame },
  { id: 'wear', title: 'Wear', description: 'Follow the appropriate wearing guidance.', icon: Heart },
  { id: 'care', title: 'Care', description: 'Maintain and store your Rudraksha properly.', icon: Sparkles }
];

/**
 * Sections 15 + 16 merged (spec): "How to Wear Rudraksha" and "Get Your Rudraksha Energized"
 * sit side by side because Energization is literally step 3 of the wearing process — showing
 * the service right next to where it belongs in the journey reads better than a separate band
 * further down the page.
 */
export const RudrakshaWearAndEnergize: React.FC = () => {
  const [options, setOptions] = useState<EnergizationOption[]>([]);

  useEffect(() => {
    let isMounted = true;
    getRudrakshaEnergizationOptions().then((result) => {
      if (isMounted) setOptions(result);
    });
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <section id="how-to-wear" className="bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 sm:gap-10">
          {/* How to Wear — steps */}
          <div className="lg:col-span-3">
            <p className="text-[11px] sm:text-xs font-bold tracking-[0.15em] text-vedic-goldDark uppercase mb-2">
              Wearing Guide
            </p>
            <h2 className="font-serif font-semibold text-vedic-dark text-2xl sm:text-3xl mb-2">
              How to Wear Rudraksha?
            </h2>
            <p className="text-sm text-vedic-muted max-w-md mb-6 sm:mb-8">
              A simple five-step process, from choosing the right bead to caring for it daily.
            </p>

            <ol className="space-y-4">
              {WEAR_STEPS.map((step, index) => {
                const Icon = step.icon;
                return (
                  <li key={step.id} className="flex items-start gap-4">
                    <span className="shrink-0 relative">
                      <span className="flex items-center justify-center w-10 h-10 rounded-full bg-vedic-ivory border border-vedic-gold/20">
                        <Icon className="w-4 h-4 text-vedic-goldDark" strokeWidth={1.5} />
                      </span>
                      {index < WEAR_STEPS.length - 1 && (
                        <span className="absolute left-1/2 top-10 -translate-x-1/2 w-px h-4 bg-vedic-gold/25" />
                      )}
                    </span>
                    <div className="pt-1.5">
                      <h3 className="font-serif font-bold text-vedic-dark text-sm sm:text-base">
                        {index + 1}. {step.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-vedic-muted mt-0.5">{step.description}</p>
                    </div>
                  </li>
                );
              })}
            </ol>

            <Link
              to="/guides/rudraksha"
              className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-vedic-goldDark hover:text-vedic-maroon transition-colors"
            >
              Complete Wearing Guide
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Energization service */}
          <div className="lg:col-span-2">
            <div className="bg-vedic-ivory border border-vedic-gold/20 rounded-3xl p-6 sm:p-7 h-full flex flex-col">
              <span className="inline-flex items-center justify-center w-11 h-11 rounded-full bg-white border border-vedic-gold/25 mb-4">
                <Flame className="w-5 h-5 text-vedic-goldDark" strokeWidth={1.5} />
              </span>
              <h3 className="font-serif font-bold text-vedic-dark text-lg sm:text-xl mb-2">
                Get Your Rudraksha Energized
              </h3>
              <p className="text-sm text-vedic-muted mb-5">
                Your Rudraksha can be prepared through a traditional Vedic energization process
                before delivery.
              </p>

              <ul className="space-y-2.5 mb-6 flex-1">
                {options.map((option) => (
                  <li key={option.id} className="flex items-start gap-2.5">
                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-vedic-goldDark shrink-0" />
                    <div>
                      <p className="text-sm font-semibold text-vedic-dark">{option.title}</p>
                      <p className="text-xs text-vedic-muted">{option.description}</p>
                    </div>
                  </li>
                ))}
              </ul>

              <Link
                to="/contact?subject=Rudraksha%20Energization"
                className="inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-full bg-vedic-dark text-vedic-gold text-sm font-semibold hover:bg-vedic-maroon hover:text-white transition-colors"
              >
                Book Energization
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
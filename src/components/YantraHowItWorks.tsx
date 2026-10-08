import React, { useEffect, useState } from 'react';
import { getYantraHowItWorks, type YantraStep } from '../services/yantraContentService';
import { YantraSectionHeading } from './YantraSectionHeading';

/** Section 9: "How It Works" — 4 steps. */
export const YantraHowItWorks: React.FC = () => {
  const [steps, setSteps] = useState<YantraStep[]>([]);

  useEffect(() => {
    let isMounted = true;
    getYantraHowItWorks().then((r) => isMounted && setSteps(r));
    return () => {
      isMounted = false;
    };
  }, []);

  if (steps.length === 0) return null;

  return (
    <section id="yantra-how-it-works" className="bg-vedic-ivory scroll-mt-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <YantraSectionHeading align="center" eyebrow="How It Works" title="From Yantra to Worship in Four Simple Steps" />
        <ol className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {steps.map((s) => (
            <li key={s.id} className="relative rounded-2xl border border-vedic-gold/15 bg-white p-5 sm:p-6">
              <span className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-vedic-gold text-vedic-dark font-serif font-bold mb-3">{s.step}</span>
              <h3 className="font-serif font-semibold text-vedic-dark text-base sm:text-lg mb-1.5">{s.title}</h3>
              <p className="text-sm text-vedic-muted leading-relaxed">{s.description}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
};
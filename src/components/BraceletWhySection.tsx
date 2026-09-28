import React, { useEffect, useState } from 'react';
import { Award, HeartHandshake, Layers, Package, ShieldCheck, Users, type LucideIcon } from 'lucide-react';
import { getWhyVedaStoreCards, WhyCard } from '../services/braceletContentService';

const WHY_ICON: Record<string, LucideIcon> = {
  selected: Award,
  'authenticity-info': ShieldCheck,
  'expert-guidance': Users,
  'secure-packaging': Package,
  'multiple-choices': Layers,
  support: HeartHandshake
};

/** Section 16 (spec): Why Choose Veda Store? — 6 cards. */
export const BraceletWhySection: React.FC = () => {
  const [cards, setCards] = useState<WhyCard[]>([]);

  useEffect(() => {
    let isMounted = true;
    getWhyVedaStoreCards().then((r) => {
      if (isMounted) setCards(r);
    });
    return () => {
      isMounted = false;
    };
  }, []);

  if (cards.length === 0) return null;

  return (
    <section id="why-veda-store" className="bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-10">
          <p className="text-[11px] sm:text-xs font-bold tracking-[0.15em] text-vedic-goldDark uppercase mb-2">Why Us</p>
          <h2 className="font-serif font-semibold text-vedic-dark text-2xl sm:text-3xl">Why Choose Veda Store?</h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
          {cards.map((card) => {
            const Icon = WHY_ICON[card.id] ?? ShieldCheck;
            return (
              <div key={card.id} className="bg-vedic-ivory border border-vedic-gold/15 rounded-2xl p-5 flex flex-col gap-2.5">
                <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-white">
                  <Icon className="w-[18px] h-[18px] text-vedic-goldDark" strokeWidth={1.5} />
                </span>
                <h3 className="font-serif font-bold text-vedic-dark text-sm sm:text-base leading-snug">{card.title}</h3>
                <p className="text-xs text-vedic-muted leading-relaxed">{card.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
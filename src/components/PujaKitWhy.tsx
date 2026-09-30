import React, { useEffect, useState } from 'react';
import { BookOpen, Gift, Package, ShieldCheck, Sparkles, Users, type LucideIcon } from 'lucide-react';
import { getPujaWhyCards, type PujaWhyCard } from '../services/pujaKitContentService';
import { PujaKitSectionHeading } from './PujaKitSectionHeading';

const WHY_ICON: Record<string, LucideIcon> = {
  complete: Package,
  selected: ShieldCheck,
  guide: BookOpen,
  packaging: Sparkles,
  pandit: Users,
  gifting: Gift
};

/** Section 12: "Why Choose Veda Store?" — 6 cards. */
export const PujaKitWhy: React.FC = () => {
  const [cards, setCards] = useState<PujaWhyCard[]>([]);

  useEffect(() => {
    let isMounted = true;
    getPujaWhyCards().then((r) => isMounted && setCards(r));
    return () => {
      isMounted = false;
    };
  }, []);

  if (cards.length === 0) return null;

  return (
    <section id="why-veda-puja" className="bg-white scroll-mt-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <PujaKitSectionHeading align="center" eyebrow="Why Veda Store" title="Puja Made Simple and Trustworthy" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {cards.map((c) => {
            const Icon = WHY_ICON[c.id] ?? Sparkles;
            return (
              <div key={c.id} className="rounded-2xl border border-vedic-gold/15 bg-vedic-ivory p-5 sm:p-6 flex items-start gap-4">
                <span className="w-11 h-11 rounded-full bg-white flex items-center justify-center shrink-0">
                  <Icon className="w-5 h-5 text-vedic-goldDeep" strokeWidth={1.5} />
                </span>
                <div>
                  <h3 className="font-serif font-semibold text-vedic-dark text-base mb-1">{c.title}</h3>
                  <p className="text-sm text-vedic-muted leading-relaxed">{c.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
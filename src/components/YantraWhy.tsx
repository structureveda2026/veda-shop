import React, { useEffect, useState } from 'react';
import { BookOpen, Compass, Flame, Gift, Package, ShieldCheck, Sparkles, type LucideIcon } from 'lucide-react';
import { getYantraWhyCards, type YantraWhyCard } from '../services/yantraContentService';
import { YantraSectionHeading } from './YantraSectionHeading';

const WHY_ICON: Record<string, LucideIcon> = {
  geometry: Compass,
  material: ShieldCheck,
  guide: BookOpen,
  energize: Flame,
  packaging: Package,
  gifting: Gift
};

/** Section 11: "Why Choose Veda Store?" — 6 cards. */
export const YantraWhy: React.FC = () => {
  const [cards, setCards] = useState<YantraWhyCard[]>([]);

  useEffect(() => {
    let isMounted = true;
    getYantraWhyCards().then((r) => isMounted && setCards(r));
    return () => {
      isMounted = false;
    };
  }, []);

  if (cards.length === 0) return null;

  return (
    <section id="why-veda-yantra" className="bg-vedic-ivory scroll-mt-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <YantraSectionHeading align="center" eyebrow="Why Veda Store" title="Yantras Made Simple and Trustworthy" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {cards.map((c) => {
            const Icon = WHY_ICON[c.id] ?? Sparkles;
            return (
              <div key={c.id} className="rounded-2xl border border-vedic-gold/15 bg-white p-5 sm:p-6 flex items-start gap-4">
                <span className="w-11 h-11 rounded-full bg-vedic-card flex items-center justify-center shrink-0">
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
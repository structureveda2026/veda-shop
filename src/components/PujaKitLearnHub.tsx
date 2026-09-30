import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { getPujaLearnCards, type PujaLearnCard } from '../services/pujaKitContentService';
import { PujaKitSectionHeading } from './PujaKitSectionHeading';

/** Section 15: "Learn Before You Perform" — links to real, already-built pages rather than duplicating content. */
export const PujaKitLearnHub: React.FC = () => {
  const [cards, setCards] = useState<PujaLearnCard[]>([]);

  useEffect(() => {
    let isMounted = true;
    getPujaLearnCards().then((r) => isMounted && setCards(r));
    return () => {
      isMounted = false;
    };
  }, []);

  if (cards.length === 0) return null;

  return (
    <section id="puja-learn" className="bg-vedic-ivory scroll-mt-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <PujaKitSectionHeading align="center" eyebrow="Learn" title="Learn Before You Perform" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {cards.map((c) => (
            <Link
              key={c.id}
              to={c.href}
              className="group rounded-2xl border border-vedic-gold/15 hover:border-vedic-gold/40 bg-white hover:shadow-card-hover p-5 sm:p-6 flex flex-col gap-2 transition-all"
            >
              <p className="text-[11px] font-bold tracking-[0.12em] text-vedic-goldDeep uppercase">{c.eyebrow}</p>
              <h3 className="font-serif font-semibold text-vedic-dark text-base sm:text-lg leading-snug">{c.title}</h3>
              <p className="text-sm text-vedic-muted leading-relaxed">{c.description}</p>
              <span className="mt-auto pt-2 inline-flex items-center gap-1 text-xs font-semibold text-vedic-goldDeep group-hover:text-vedic-maroon transition-colors">
                Read more <ArrowRight className="w-3 h-3" />
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};
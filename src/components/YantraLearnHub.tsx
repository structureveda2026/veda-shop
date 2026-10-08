import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { getYantraLearnCards, type YantraLearnCard } from '../services/yantraContentService';
import { YantraSectionHeading } from './YantraSectionHeading';

/** Section 14: "Learn Before You Install" — links to real, already-built pages rather than duplicating content. */
export const YantraLearnHub: React.FC = () => {
  const [cards, setCards] = useState<YantraLearnCard[]>([]);

  useEffect(() => {
    let isMounted = true;
    getYantraLearnCards().then((r) => isMounted && setCards(r));
    return () => {
      isMounted = false;
    };
  }, []);

  if (cards.length === 0) return null;

  return (
    <section id="yantra-learn" className="bg-white scroll-mt-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <YantraSectionHeading align="center" eyebrow="Learn" title="Learn Before You Install" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {cards.map((c) => (
            <Link
              key={c.id}
              to={c.href}
              className="group rounded-2xl border border-vedic-gold/15 hover:border-vedic-gold/40 bg-vedic-ivory hover:shadow-card-hover p-5 sm:p-6 flex flex-col gap-2 transition-all"
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
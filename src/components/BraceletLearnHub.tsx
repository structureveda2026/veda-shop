import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen } from 'lucide-react';
import { getBraceletLearnCards, LearnCard } from '../services/braceletContentService';

/** Sections 25 + 26 merged (spec): "Learn Before You Choose" — guide/blog teaser cards linking to
 *  real existing pages. */
export const BraceletLearnHub: React.FC = () => {
  const [cards, setCards] = useState<LearnCard[]>([]);

  useEffect(() => {
    let isMounted = true;
    getBraceletLearnCards().then((r) => isMounted && setCards(r));
    return () => {
      isMounted = false;
    };
  }, []);

  if (cards.length === 0) return null;

  return (
    <section id="bracelet-learn" className="bg-vedic-ivory">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="flex items-end justify-between gap-4 mb-6 sm:mb-8">
          <div>
            <p className="text-[11px] sm:text-xs font-bold tracking-[0.15em] text-vedic-goldDark uppercase mb-2 flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5" strokeWidth={1.5} /> Learn
            </p>
            <h2 className="font-serif font-semibold text-vedic-dark text-2xl sm:text-3xl">Learn Before You Choose</h2>
          </div>
          <Link to="/blog" className="hidden sm:inline-flex items-center gap-1.5 text-sm font-semibold text-vedic-goldDark hover:text-vedic-maroon transition-colors whitespace-nowrap shrink-0">
            Explore Bracelet Guides <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
          {cards.map((card) => (
            <Link
              key={card.id}
              to={card.href}
              className="group bg-white border border-vedic-gold/15 hover:border-vedic-gold/40 rounded-2xl p-6 flex flex-col gap-1.5 transition-all duration-300 hover:-translate-y-1 hover:shadow-card-hover"
            >
              <span className="text-[10px] font-bold text-vedic-goldDark uppercase tracking-wide">{card.eyebrow}</span>
              <h3 className="font-serif font-bold text-vedic-dark text-base sm:text-lg leading-snug group-hover:text-vedic-maroon transition-colors">{card.title}</h3>
              <p className="text-xs sm:text-sm text-vedic-muted leading-relaxed">{card.description}</p>
              <span className="text-xs font-bold text-vedic-maroon inline-flex items-center gap-1 pt-1">Read More <ArrowRight className="w-3 h-3" /></span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};
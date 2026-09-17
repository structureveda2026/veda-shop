import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen } from 'lucide-react';
import { getRudrakshaLearnCards, RudrakshaLearnCard } from '../services/rudrakshaContentService';

const CARD_SKELETON_COUNT = 4;

/**
 * Sections 25 (Education Hub) + 26 (Blog/SEO) merged (spec): both are the same format — a
 * short teaser card linking out to real content (guide, authenticity page, blog, puja guide),
 * so they're one "Learn About Rudraksha" grid instead of two visually identical sections.
 */
export const RudrakshaLearnHub: React.FC = () => {
  const [cards, setCards] = useState<RudrakshaLearnCard[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    getRudrakshaLearnCards().then((result) => {
      if (!isMounted) return;
      setCards(result);
      setIsLoading(false);
    });
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <section id="rudraksha-learn" className="bg-vedic-ivory">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="flex items-end justify-between gap-4 mb-6 sm:mb-8">
          <div>
            <p className="text-[11px] sm:text-xs font-bold tracking-[0.15em] text-vedic-goldDark uppercase mb-2 flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5" strokeWidth={1.5} />
              Learn
            </p>
            <h2 className="font-serif font-semibold text-vedic-dark text-2xl sm:text-3xl mb-2">
              Learn About Rudraksha
            </h2>
            <p className="text-sm text-vedic-muted max-w-xl">
              Guides, identification tips and the latest from our Vedic knowledge desk.
            </p>
          </div>
          <Link
            to="/blog"
            className="hidden sm:inline-flex items-center gap-1.5 text-sm font-semibold text-vedic-goldDark hover:text-vedic-maroon transition-colors whitespace-nowrap shrink-0"
          >
            Explore Rudraksha Knowledge
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
            {Array.from({ length: CARD_SKELETON_COUNT }).map((_, i) => (
              <div key={i} className="rounded-2xl border border-vedic-gold/10 bg-white p-6 h-32 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
            {cards.map((card) => (
              <Link
                key={card.id}
                to={card.href}
                className="group bg-white border border-vedic-gold/15 hover:border-vedic-gold/40 rounded-2xl p-6 flex flex-col gap-1.5 transition-all duration-300 hover:-translate-y-1 hover:shadow-card-hover"
              >
                <span className="text-[10px] font-bold text-vedic-goldDark uppercase tracking-wide">
                  {card.eyebrow}
                </span>
                <h3 className="font-serif font-bold text-vedic-dark text-base sm:text-lg leading-snug group-hover:text-vedic-maroon transition-colors">
                  {card.title}
                </h3>
                <p className="text-xs sm:text-sm text-vedic-muted leading-relaxed">{card.description}</p>
                <span className="text-xs font-bold text-vedic-maroon inline-flex items-center gap-1 pt-1">
                  Read More <ArrowRight className="w-3 h-3" />
                </span>
              </Link>
            ))}
          </div>
        )}

        <div className="mt-6 text-center sm:hidden">
          <Link
            to="/blog"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-vedic-goldDark hover:text-vedic-maroon transition-colors"
          >
            Explore Rudraksha Knowledge
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </section>
  );
};
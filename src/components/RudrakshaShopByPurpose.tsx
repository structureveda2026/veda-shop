import React from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  BookOpen,
  Sparkles,
  Shield,
  Smile,
  Flame,
  Heart,
  Compass,
  Sun,
  type LucideIcon
} from 'lucide-react';

export interface RudrakshaPurposeCard {
  icon: LucideIcon;
  title: string;
  description: string;
  /** Matches a slug in PURPOSE_LIST (src/data/purposeData.ts) — every card links to a real /purpose/:slug page. */
  purposeSlug: string;
}

export interface RudrakshaShopByPurposeProps {
  /** Fires with the purpose slug chosen. Defaults to a real Link to /purpose/:slug. */
  onSelectPurpose?: (purposeSlug: string) => void;
}

/**
 * DATA — per spec: exactly these 8 intents, traditional/Vedic association language only, no
 * medical claims ("cures diabetes", "controls BP", etc. are explicitly disallowed). Each entry
 * maps 1:1 to a real record in PURPOSE_LIST, so every card + the section CTA already lands on a
 * working page today. Swap this array for a Shopify metafield/tag-driven list later (e.g. a
 * "purpose" tag per product feeding this grid) — the cards, grid and click-through stay the same.
 */
const PURPOSE_CARDS: RudrakshaPurposeCard[] = [
  {
    icon: BookOpen,
    title: 'Spiritual Growth',
    description: 'Explore traditional spiritual-use Rudraksha.',
    purposeSlug: 'spiritual-growth'
  },
  {
    icon: Sparkles,
    title: 'Meditation & Focus',
    description: 'Traditional meditation-oriented options.',
    purposeSlug: 'meditation'
  },
  {
    icon: Shield,
    title: 'Protection',
    description: 'Explore traditionally associated Rudraksha.',
    purposeSlug: 'protection'
  },
  {
    icon: Smile,
    title: 'Peace & Balance',
    description: 'Explore traditional options associated with calmness and balance.',
    purposeSlug: 'peace'
  },
  {
    icon: Flame,
    title: 'Confidence & Discipline',
    description: 'Explore relevant traditional associations.',
    purposeSlug: 'confidence-discipline'
  },
  {
    icon: Heart,
    title: 'Devotional Practice',
    description: 'For users following a devotional routine.',
    purposeSlug: 'devotional-practice'
  },
  {
    icon: Compass,
    title: 'Astrology Guidance',
    description: 'Get a recommendation based on your Kundli.',
    purposeSlug: 'astrology-guidance'
  },
  {
    icon: Sun,
    title: 'Daily Wear',
    description: 'Simple Rudraksha options for regular use.',
    purposeSlug: 'daily-wear'
  }
];

export const RudrakshaShopByPurpose: React.FC<RudrakshaShopByPurposeProps> = ({ onSelectPurpose }) => {
  return (
    // id="shop-by-purpose" — this is the exact anchor the Quick Finder's "I Want Rudraksha for a
    // Purpose" panel already scrolls to when no onSelectPurpose is wired there.
    <section id="shop-by-purpose" className="bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        {/* Section Header — left-aligned, same pattern as every other Rudraksha section */}
        <div className="flex items-end justify-between gap-4 mb-6 sm:mb-8">
          <div>
            <p className="text-[11px] sm:text-xs font-bold tracking-[0.15em] text-vedic-goldDark uppercase mb-2">
              Shop By Purpose
            </p>
            <h2 className="font-serif font-semibold text-vedic-dark text-2xl sm:text-3xl mb-2">
              Choose Rudraksha by Your Intention
            </h2>
            <p className="text-sm text-vedic-muted max-w-xl">
              Traditionally associated with different intentions — choose the one closest to yours.
            </p>
          </div>

          <Link
            to="/collections/rudraksha"
            className="hidden sm:inline-flex items-center gap-1.5 text-sm font-semibold text-vedic-goldDark hover:text-vedic-maroon transition-colors whitespace-nowrap shrink-0"
          >
            Explore by Purpose
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* 8 cards — 2 cols on phones, 4 from sm up (2 rows either way) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          {PURPOSE_CARDS.map((card) => {
            const Icon = card.icon;
            const cardClassName =
              'group text-left rounded-2xl border border-vedic-gold/15 hover:border-vedic-gold/40 bg-white hover:shadow-card-hover p-4 sm:p-5 flex flex-col gap-2.5 sm:gap-3 transition-all h-full';

            const cardContent = (
              <>
                <span className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-vedic-card flex items-center justify-center">
                  <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-vedic-goldDark" strokeWidth={1.5} />
                </span>
                <div>
                  <h3 className="font-serif font-semibold text-vedic-dark text-[13px] sm:text-base mb-1 leading-snug">
                    {card.title}
                  </h3>
                  <p className="text-[11px] sm:text-sm text-vedic-muted leading-relaxed">{card.description}</p>
                </div>
                <span className="mt-auto inline-flex items-center gap-1 text-[11px] sm:text-xs font-semibold text-vedic-goldDark group-hover:text-vedic-maroon transition-colors">
                  Explore
                  <ArrowRight className="w-3 h-3" />
                </span>
              </>
            );

            return onSelectPurpose ? (
              <button key={card.purposeSlug} onClick={() => onSelectPurpose(card.purposeSlug)} className={cardClassName}>
                {cardContent}
              </button>
            ) : (
              // TODO(Shopify): once purpose is a real product tag/metafield, this Link target can
              // point straight at the filtered collection — nothing else here needs to change.
              <Link key={card.purposeSlug} to={`/purpose/${card.purposeSlug}`} className={cardClassName}>
                {cardContent}
              </Link>
            );
          })}
        </div>

        {/* Compliance note — traditional/Vedic association language only, per spec. No medical
            claims anywhere in this section (no "cures", "controls BP", "treats" wording). */}
        <p className="text-[11px] text-vedic-muted mt-5 sm:mt-6 italic">
          Traditionally associated with the intentions shown above — general guidance, not a
          medical claim or a substitute for professional advice.
        </p>

        {/* "Explore by Purpose" — mobile-only fallback for the header link above (hidden on sm+) */}
        <div className="mt-4 text-center sm:hidden">
          <Link
            to="/collections/rudraksha"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-vedic-goldDark hover:text-vedic-maroon transition-colors"
          >
            Explore by Purpose
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </section>
  );
};
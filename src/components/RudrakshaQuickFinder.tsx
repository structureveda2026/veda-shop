import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Hash,
  Compass,
  Sparkles,
  HelpCircle,
  ChevronDown,
  ArrowRight,
  MessageCircle,
  type LucideIcon
} from 'lucide-react';

export interface RudrakshaQuickFinderProps {
  /** 1–14 by default. Swap for a live list (e.g. only Mukhis currently in stock) once Shopify is connected. */
  mukhiOptions?: number[];
  /** Demo purpose list for now — swap for real purpose/tag data from Shopify metafields later. */
  purposeOptions?: string[];
  /** Demo Rashi list — already generic Vedic data, not Rudraksha-specific, so it's safe to reuse as-is. */
  rashiOptions?: string[];
  /** Fires with the Mukhi number chosen. Defaults to a real navigation to that Mukhi's product page. */
  onSelectMukhi?: (mukhi: number) => void;
  /** Fires with the purpose chosen. Defaults to scrolling to #shop-by-purpose (built in a later section). */
  onSelectPurpose?: (purpose: string) => void;
  /** Fires with the Rashi chosen. Defaults to scrolling to #shop-by-rashi (built in a later section). */
  onSelectRashi?: (rashi: string) => void;
  /** Fires when "Get Expert Guidance" is clicked. Defaults to opening WhatsApp with a prefilled message. */
  onRequestGuidance?: () => void;
}

const DEFAULT_MUKHI_OPTIONS = Array.from({ length: 14 }, (_, i) => i + 1);

const DEFAULT_PURPOSE_OPTIONS = [
  'Spiritual Growth',
  'Meditation',
  'Focus',
  'Confidence',
  'Protection',
  'Peace',
  'Devotional Practice',
  'Traditional Jyotish Guidance'
];

const DEFAULT_RASHI_OPTIONS = [
  'Mesh',
  'Vrishabh',
  'Mithun',
  'Kark',
  'Singh',
  'Kanya',
  'Tula',
  'Vrishchik',
  'Dhanu',
  'Makar',
  'Kumbh',
  'Meen'
];

type FinderKey = 'mukhi' | 'purpose' | 'rashi';

export const RudrakshaQuickFinder: React.FC<RudrakshaQuickFinderProps> = ({
  mukhiOptions = DEFAULT_MUKHI_OPTIONS,
  purposeOptions = DEFAULT_PURPOSE_OPTIONS,
  rashiOptions = DEFAULT_RASHI_OPTIONS,
  onSelectMukhi,
  onSelectPurpose,
  onSelectRashi,
  onRequestGuidance
}) => {
  const [openPanel, setOpenPanel] = useState<FinderKey | null>(null);

  const togglePanel = (key: FinderKey) => setOpenPanel((prev) => (prev === key ? null : key));

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleGuidanceClick = () => {
    if (onRequestGuidance) {
      onRequestGuidance();
      return;
    }
    const message = encodeURIComponent(
      "Namaste! I'm not sure which Rudraksha is right for me. Could you please guide me based on my birth details and purpose?"
    );
    window.open(`https://wa.me/919621340116?text=${message}`, '_blank');
  };

  const cards: {
    key: FinderKey | 'guidance';
    icon: LucideIcon;
    title: string;
    description: string;
  }[] = [
    { key: 'mukhi', icon: Hash, title: 'I Know My Mukhi', description: 'Jump straight to your 1–14 Mukhi Rudraksha.' },
    {
      key: 'purpose',
      icon: Compass,
      title: 'I Want Rudraksha for a Purpose',
      description: 'Spiritual growth, focus, protection, peace and more.'
    },
    { key: 'rashi', icon: Sparkles, title: 'Choose by Rashi', description: 'Traditional guidance based on your Rashi.' },
    {
      key: 'guidance',
      icon: HelpCircle,
      title: "I Don't Know Which Rudraksha to Choose",
      description: 'Talk to a Vedic expert for personal guidance.'
    }
  ];

  return (
    <section className="bg-vedic-ivory">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        {/* Left-aligned header — kept consistent with every other section on the page
            (kicker + heading, no centering) instead of the old centered block. */}
        <div className="mb-6 sm:mb-10">
          <p className="text-[11px] sm:text-xs font-bold tracking-[0.15em] text-vedic-goldDark uppercase mb-2">
            Rudraksha Finder
          </p>
          <h2 className="font-serif font-semibold text-vedic-dark text-2xl sm:text-3xl">
            Find the Right Rudraksha for You
          </h2>
        </div>

        {/* 4 cards → 2x2 grid on mobile (was a single stacked column), 2 cols on small
            tablets, a single row of 4 from lg up. Same cards, same click behaviour. */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {cards.map((card) => {
            const Icon = card.icon;
            const isFinderCard = card.key !== 'guidance';
            const isOpen = isFinderCard && openPanel === card.key;

            return (
              <button
                key={card.key}
                onClick={() => (isFinderCard ? togglePanel(card.key as FinderKey) : handleGuidanceClick())}
                className={`text-left rounded-2xl border p-4 sm:p-5 flex flex-col gap-2.5 sm:gap-3 transition-all hover:shadow-card-hover ${
                  isOpen
                    ? 'bg-white border-vedic-gold shadow-md ring-1 ring-vedic-gold'
                    : 'bg-white border-vedic-gold/15 hover:border-vedic-gold/40'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-vedic-card flex items-center justify-center">
                    <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-vedic-goldDark" strokeWidth={1.5} />
                  </span>
                  {isFinderCard && (
                    <ChevronDown
                      className={`w-4 h-4 text-vedic-muted transition-transform ${isOpen ? 'rotate-180' : ''}`}
                    />
                  )}
                  {!isFinderCard && <ArrowRight className="w-4 h-4 text-vedic-muted" />}
                </div>
                <div>
                  <h3 className="font-serif font-semibold text-vedic-dark text-[13px] sm:text-base mb-1 leading-snug">
                    {card.title}
                  </h3>
                  <p className="text-[11px] sm:text-sm text-vedic-muted leading-relaxed">{card.description}</p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Expandable picker panel — shows whichever option (Mukhi / Purpose / Rashi) is open */}
        {openPanel && (
          <div className="mt-5 bg-white border border-vedic-gold/20 rounded-2xl p-5 sm:p-6 animate-in fade-in slide-in-from-top-2 duration-200">
            {openPanel === 'mukhi' && (
              <>
                <p className="text-xs sm:text-sm font-bold text-vedic-dark uppercase tracking-wide mb-4">
                  Select Your Mukhi
                </p>
                <div className="grid grid-cols-4 sm:grid-cols-7 gap-2.5">
                  {mukhiOptions.map((mukhi) =>
                    onSelectMukhi ? (
                      <button
                        key={mukhi}
                        onClick={() => onSelectMukhi(mukhi)}
                        className="py-2.5 rounded-lg border border-vedic-gold/20 bg-vedic-ivory hover:bg-vedic-gold hover:text-white hover:border-vedic-gold text-vedic-dark text-xs sm:text-sm font-semibold transition-colors"
                      >
                        {mukhi} Mukhi
                      </button>
                    ) : (
                      // TODO(Shopify): once each Mukhi maps to a real product/collection handle from
                      // Shopify, this Link target can be swapped for that handle without changing anything else here.
                      <Link
                        key={mukhi}
                        to={`/products/${mukhi}-mukhi-rudraksha`}
                        className="py-2.5 text-center rounded-lg border border-vedic-gold/20 bg-vedic-ivory hover:bg-vedic-gold hover:text-white hover:border-vedic-gold text-vedic-dark text-xs sm:text-sm font-semibold transition-colors"
                      >
                        {mukhi} Mukhi
                      </Link>
                    )
                  )}
                </div>
              </>
            )}

            {openPanel === 'purpose' && (
              <>
                <p className="text-xs sm:text-sm font-bold text-vedic-dark uppercase tracking-wide mb-4">
                  What Are You Looking For?
                </p>
                <div className="flex flex-wrap gap-2.5">
                  {purposeOptions.map((purpose) => (
                    <button
                      key={purpose}
                      onClick={() => (onSelectPurpose ? onSelectPurpose(purpose) : scrollToSection('shop-by-purpose'))}
                      className="px-4 py-2 rounded-full border border-vedic-gold/20 bg-vedic-ivory hover:bg-vedic-gold hover:text-white hover:border-vedic-gold text-vedic-dark text-xs sm:text-sm font-semibold transition-colors"
                    >
                      {purpose}
                    </button>
                  ))}
                </div>
              </>
            )}

            {openPanel === 'rashi' && (
              <>
                <p className="text-xs sm:text-sm font-bold text-vedic-dark uppercase tracking-wide mb-4">
                  Select Your Rashi
                </p>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5">
                  {rashiOptions.map((rashi) => (
                    <button
                      key={rashi}
                      onClick={() => (onSelectRashi ? onSelectRashi(rashi) : scrollToSection('shop-by-rashi'))}
                      className="py-2.5 rounded-lg border border-vedic-gold/20 bg-vedic-ivory hover:bg-vedic-gold hover:text-white hover:border-vedic-gold text-vedic-dark text-xs sm:text-sm font-semibold transition-colors"
                    >
                      {rashi}
                    </button>
                  ))}
                </div>
                <p className="text-[11px] text-vedic-muted mt-4 italic">
                  Rashi-based guidance is general. For personalized recommendation, consult an astrologer.
                </p>
              </>
            )}
          </div>
        )}

        {/* Inline nudge toward guidance, shown once a picker is open — a soft, non-blocking assist */}
        {openPanel && (
          <div className="mt-3 flex items-center justify-center gap-2 text-xs sm:text-sm text-vedic-muted">
            <span>Still unsure?</span>
            <button
              onClick={handleGuidanceClick}
              className="inline-flex items-center gap-1 font-semibold text-vedic-goldDark hover:text-vedic-maroon transition-colors"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              Get Expert Guidance
            </button>
          </div>
        )}
      </div>
    </section>
  );
};
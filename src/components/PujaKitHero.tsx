import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, Flame, Package, Search, Users } from 'lucide-react';

export interface PujaKitHeroProps {
  /** Full-width banner image, served from /public — swap the file to change it any time. If it fails to load,
   *  the warm gradient behind it shows instead — the hero never looks empty or broken. */
  imageSrc?: string;
  imageAlt?: string;
  heading?: string;
  subheading?: string;
  shopAllLink?: string;
  /** Fires when "Find My Kit" is clicked — the page scrolls to the finder. */
  onFindKitClick?: () => void;
}

const DEFAULT_HEADING = 'Everything for Your Puja, in One Sacred Kit';
const DEFAULT_SUBHEADING =
  'Complete puja samagri kits for Shiv, Ganesh, Lakshmi and more — carefully selected, sealed for freshness and delivered with a simple step-by-step vidhi guide.';

/** Section 1: Hero. Full-bleed banner behind, copy in front — same pattern as the Rudraksha / Bracelets heroes. */
export const PujaKitHero: React.FC<PujaKitHeroProps> = ({
  imageSrc = '/images/puja-kit/PoojaKit-HeroBanner.png',
  imageAlt = 'Puja thali with diya, flowers and samagri',
  heading = DEFAULT_HEADING,
  subheading = DEFAULT_SUBHEADING,
  shopAllLink = '/collections/puja-kits',
  onFindKitClick
}) => {
  return (
    // The warm ivory/gold gradient lives on the section itself, behind the <img>. If the banner is slow to load
    // (or a path/case mismatch ever 404s it), this shows instead of a blank box.
    <section className="relative w-full overflow-hidden bg-gradient-to-br from-vedic-ivory via-vedic-card to-vedic-sand">
      {/* Full-bleed banner image — edge to edge, no medallion/side panel. */}
      <img
        src={imageSrc}
        alt={imageAlt}
        loading="eager"
        decoding="async"
        className="absolute inset-0 w-full h-full object-cover object-[70%_center] sm:object-center"
        onError={(e) => {
          // Banner failed to load — hide it so the gradient behind shows cleanly instead of a broken-image icon.
          e.currentTarget.style.display = 'none';
        }}
      />
      {/* Light ivory scrim so the dark heading stays readable on a bright banner.
          Mobile: top-to-bottom (text sits over the whole frame). sm+: left-to-right, fading out
          so the right side of the banner stays clear and vivid. */}
      <div className="absolute inset-0 bg-gradient-to-b from-vedic-ivory/90 via-vedic-ivory/60 to-vedic-ivory/90 sm:bg-gradient-to-r sm:from-vedic-ivory/90 sm:via-vedic-ivory/55 sm:to-transparent" />

      <div className="relative z-10 flex flex-col items-start justify-center text-left px-5 sm:px-10 lg:px-16 py-12 sm:py-16 lg:py-20 min-h-[420px] sm:min-h-[460px] lg:min-h-[520px] max-w-3xl">
        <div className="flex items-center gap-3 mb-3 sm:mb-4">
          <Flame className="w-4 h-4 text-vedic-goldDeep" strokeWidth={1.75} />
          <span className="w-10 sm:w-14 h-px bg-vedic-gold/60" />
        </div>

        <p className="text-[10px] sm:text-xs font-bold tracking-[0.12em] sm:tracking-[0.2em] text-vedic-goldDeep uppercase mb-4">
          Puja Kits &nbsp;•&nbsp; Complete Samagri &nbsp;•&nbsp; Vidhi Guide Included
        </p>

        <h1 className="font-serif font-semibold text-vedic-dark text-[28px] sm:text-4xl lg:text-5xl leading-[1.12] tracking-tight max-w-xl mb-4">
          {heading}
        </h1>

        <p className="text-sm sm:text-base text-vedic-charcoal leading-relaxed max-w-md mb-7">{subheading}</p>

        <div className="flex flex-wrap items-center gap-3 sm:gap-4">
          <Link
            to={shopAllLink}
            className="inline-flex items-center justify-center gap-2 px-6 sm:px-7 py-3 sm:py-3.5 rounded-full bg-vedic-gold hover:bg-vedic-goldDark text-vedic-dark font-bold text-sm sm:text-base transition-all duration-300 shadow-gold hover:scale-[1.03]"
          >
            Shop All Puja Kits
            <ArrowRight className="w-4 h-4" />
          </Link>
          <button
            type="button"
            onClick={onFindKitClick}
            className="inline-flex items-center justify-center gap-2 px-6 sm:px-7 py-3 sm:py-3.5 rounded-full border border-vedic-goldDeep/40 bg-white/70 hover:bg-white hover:border-vedic-goldDeep text-vedic-dark font-semibold text-sm sm:text-base backdrop-blur-sm transition-all duration-300"
          >
            <Search className="w-4 h-4" />
            Find My Kit
          </button>
        </div>

        <ul className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs sm:text-sm text-vedic-charcoal">
          <li className="inline-flex items-center gap-1.5"><BookOpen className="w-4 h-4 text-vedic-goldDeep" strokeWidth={1.75} /> Vidhi guide in every kit</li>
          <li className="inline-flex items-center gap-1.5"><Package className="w-4 h-4 text-vedic-goldDeep" strokeWidth={1.75} /> Sealed &amp; secure packaging</li>
          <li className="inline-flex items-center gap-1.5"><Users className="w-4 h-4 text-vedic-goldDeep" strokeWidth={1.75} /> Pandit support available</li>
        </ul>
      </div>
    </section>
  );
};
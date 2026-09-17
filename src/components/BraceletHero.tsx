import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Search, Gem } from 'lucide-react';

export interface BraceletHeroProps {
  /** Full-width banner image, served from /public — swap the file to change it any time. */
  imageSrc?: string;
  imageAlt?: string;
  heading?: string;
  subheading?: string;
  /** Where "Shop All Bracelets" should take the visitor. */
  shopAllLink?: string;
  /** Fires when "Find My Bracelet" is clicked — wire this to the Find My Bracelet finder section below. */
  onFindBraceletClick?: () => void;
}

// Copy pulled directly from the Bracelets Landing Page spec, Section 1 (Hero).
const DEFAULT_HEADING = 'Spiritual Bracelets, Made for Your Journey';
const DEFAULT_SUBHEADING =
  'Explore Rudraksha, Gemstone, Crystal and traditional spiritual bracelets designed for everyday wear.';

export const BraceletHero: React.FC<BraceletHeroProps> = ({
  imageSrc = '/images/banners/bracelets-banner.png',
  imageAlt = 'Rudraksha and black onyx bracelet with a gold Om bead, resting on a stone beside tulsi leaves and a diya',
  heading = DEFAULT_HEADING,
  subheading = DEFAULT_SUBHEADING,
  shopAllLink = '/collections/bracelets',
  onFindBraceletClick
}) => {
  return (
    // A warm maroon/gold gradient lives on the section itself, behind the <img>. If the banner
    // is slow to load on mobile data (or a path/case mismatch ever 404s it), this shows instead
    // of a flat black rectangle — the section never looks "broken" or empty.
    <section className="relative w-full overflow-hidden bg-gradient-to-br from-vedic-maroonDark via-[#2a0d0d] to-black">
      {/* Full-bleed banner image — edge to edge, no side panel/split. The banner itself is shot
          with the bracelet sitting in the right ~60% of the frame and the left kept dark, so the
          text below reads clearly without any separate overlay card.
          object-[68%_45%] is deliberate, not decorative: on a wide desktop section object-cover
          crops the image's TOP/BOTTOM (height > container), so the 45% keeps the bracelet's own
          vertical centre in frame; on a narrow mobile section it crops the LEFT/RIGHT instead
          (width > container), so the 68% keeps the bracelet itself in frame instead of showing
          empty dark background — swapping this banner for another wide product photo later just
          means nudging this one position value, not rebuilding the layout. */}
      <img
        src={imageSrc}
        alt={imageAlt}
        loading="eager"
        decoding="async"
        className="absolute inset-0 w-full h-full object-cover object-[68%_45%]"
        onError={(e) => {
          // Banner failed to load — hide it so the gradient behind it shows cleanly
          // instead of a broken image icon or a solid black box.
          e.currentTarget.style.display = 'none';
        }}
      />
      {/* Two overlays, and the FIRST one deliberately changes direction at `sm`, not just
          strength:
          - Mobile crop (object-position cropping left/right) puts the bracelet across almost
            the whole frame with no natural dark patch behind the text, so below `sm` this is a
            top-to-bottom scrim — dark behind the heading up top, dark again behind the buttons
            at the bottom, a lighter band in the middle so the bracelet still shows through.
          - From `sm` up, the crop widens back out and the photo's own dark left side is back in
            frame, so the overlay switches to a light left-to-right scrim that just reinforces it. */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/75 via-black/30 to-black/70 sm:bg-gradient-to-r sm:from-black/65 sm:via-black/20 sm:to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/35" />

      <div className="relative z-10 flex flex-col items-start justify-center text-left px-5 sm:px-10 lg:px-16 py-12 sm:py-16 lg:py-20 min-h-[420px] sm:min-h-[460px] lg:min-h-[520px] max-w-3xl">
        {/* Ornamental divider */}
        <div className="flex items-center gap-3 mb-3 sm:mb-4">
          <Gem className="w-4 h-4 text-vedic-gold" strokeWidth={1.5} />
          <span className="w-10 sm:w-14 h-px bg-vedic-gold/60" />
        </div>

        <p className="text-[10px] sm:text-xs font-bold tracking-[0.1em] sm:tracking-[0.2em] text-vedic-gold uppercase mb-4">
          Rudraksha &nbsp;•&nbsp; Gemstone &nbsp;•&nbsp; Crystal &nbsp;•&nbsp; Everyday Wear
        </p>

        <h1 className="font-serif font-semibold text-white text-[26px] sm:text-4xl lg:text-5xl leading-[1.15] tracking-tight max-w-xl drop-shadow-lg mb-4">
          {heading}
        </h1>

        <p className="text-[13px] sm:text-base text-gray-200 font-light leading-relaxed max-w-md mb-6">
          {subheading}
        </p>

        <div className="flex flex-wrap items-center gap-3 sm:gap-4">
          <Link
            to={shopAllLink}
            className="inline-flex items-center gap-2 px-6 sm:px-8 py-3 rounded-full bg-vedic-gold hover:bg-vedic-goldDark text-vedic-dark font-bold text-sm sm:text-base transition-all duration-300 shadow-gold hover:scale-105"
          >
            Shop All Bracelets
            <ArrowRight className="w-4 h-4" />
          </Link>

          <button
            onClick={onFindBraceletClick}
            className="inline-flex items-center gap-2 px-6 sm:px-8 py-3 rounded-full border border-white/30 bg-white/5 hover:bg-white/15 hover:border-white/50 text-white font-semibold text-sm sm:text-base backdrop-blur-sm transition-all duration-300"
          >
            <Search className="w-4 h-4" />
            Find My Bracelet
          </button>
        </div>
      </div>
    </section>
  );
};
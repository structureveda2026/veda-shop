import React from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Search,
  ShieldCheck,
  Gem,
  Sparkles,
  Truck,
  type LucideIcon
} from 'lucide-react';
export interface RudrakshaHeroStat {
  icon: LucideIcon;
  value: string;
  label: string;
}

export interface RudrakshaHeroProps {
  /** Full-width banner image, served from /public — swap the file to change it any time. */
  imageSrc?: string;
  imageAlt?: string;
  heading?: string;
  subheading?: string;
  /** Where "Shop All Rudraksha" should take the visitor. */
  shopAllLink?: string;
  /** Fires when "Find Your Rudraksha" is clicked — wire this to the Quick Finder section below. */
  onFindRudrakshaClick?: () => void;
  /**
   * Quick stats shown in the glass strip along the bottom of the banner. Demo values for now —
   * once Shopify is connected, pass real aggregates here instead (e.g. live product/variety
   * count, verified review count). The banner itself needs no other changes.
   */
  stats?: RudrakshaHeroStat[];
}

const DEFAULT_HEADING = 'Authentic Rudraksha for Your Spiritual Journey';
const DEFAULT_SUBHEADING =
  'Explore carefully selected Rudraksha beads, malas and spiritual products with authenticity, guidance and expert support.';

// DEMO DATA — see the `stats` prop note above for how this gets replaced by real backend values.
const DEFAULT_STATS: RudrakshaHeroStat[] = [
  { icon: Gem, value: '1–14', label: 'Mukhi Varieties' },
  { icon: ShieldCheck, value: '100%', label: 'Authentic & Lab Certified' },
  { icon: Sparkles, value: 'Vedic', label: 'Energization Available' },
  { icon: Truck, value: 'Pan India', label: 'Secure Delivery' }
];

export const RudrakshaHero: React.FC<RudrakshaHeroProps> = ({
  imageSrc = '/images/banners/rudraksha1-banner.jpg',
  imageAlt = 'Rudraksha beads and malas resting on an Om-engraved stone, mirrored symmetrically with temple idols glowing in the background',
  heading = DEFAULT_HEADING,
  subheading = DEFAULT_SUBHEADING,
  shopAllLink = '/collections/rudraksha',
  onFindRudrakshaClick,
  stats = DEFAULT_STATS
}) => {
  return (
    // A warm maroon/gold gradient lives on the section itself, behind the <img>. If the banner
    // is slow to load on mobile data (or a path/case mismatch ever 404s it), this shows instead
    // of a flat black rectangle — the section never looks "broken" or empty.
    <section className="relative w-full overflow-hidden bg-gradient-to-br from-vedic-maroonDark via-[#2a0d0d] to-black">
      {/* Full-bleed banner image — edge to edge, no side panel/split. `object-[center_28%]` keeps
          the visually "busiest" part of the banner in frame on the tall, narrow mobile crop;
          it relaxes back to a normal center crop from the sm breakpoint up. */}
      <img
        src={imageSrc}
        alt={imageAlt}
        loading="eager"
        decoding="async"
        className="absolute inset-0 w-full h-full object-cover object-[center_28%] sm:object-center"
        onError={(e) => {
          // Banner failed to load — hide it so the gradient behind it shows cleanly
          // instead of a broken image icon or a solid black box.
          e.currentTarget.style.display = 'none';
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/45 via-black/20 to-black/65 sm:from-black/55 sm:via-black/25 sm:to-black/70" />

      <div className="relative z-10 flex flex-col items-center justify-center text-center px-4 sm:px-8 py-9 sm:py-12 min-h-[380px] sm:min-h-[430px] lg:min-h-[460px]">
        {/* Ornamental divider */}
        <div className="flex items-center gap-3 mb-3 sm:mb-4">
          <span className="w-10 sm:w-14 h-px bg-vedic-gold/60" />
          <Gem className="w-4 h-4 text-vedic-gold" strokeWidth={1.5} />
          <span className="w-10 sm:w-14 h-px bg-vedic-gold/60" />
        </div>

        <p className="text-[10px] sm:text-xs font-bold tracking-[0.1em] sm:tracking-[0.2em] text-vedic-gold uppercase mb-4 px-2">
          Kashi Heritage &nbsp;•&nbsp; Lab Certified &nbsp;•&nbsp; Vedic Energization
        </p>

        <h1 className="font-serif font-semibold text-white text-[26px] sm:text-4xl lg:text-5xl leading-[1.15] tracking-tight max-w-3xl drop-shadow-lg mb-4">
          {heading}
        </h1>

        <p className="text-[13px] sm:text-base text-gray-200 font-light leading-relaxed max-w-xl mb-6">
          {subheading}
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
          <button
            onClick={onFindRudrakshaClick}
            className="inline-flex items-center gap-2 px-6 sm:px-8 py-3 rounded-full bg-vedic-gold hover:bg-vedic-goldDark text-vedic-dark font-bold text-sm sm:text-base transition-all duration-300 shadow-gold hover:scale-105"
          >
            <Search className="w-4 h-4" />
            Find Your Rudraksha
          </button>

          <Link
            to={shopAllLink}
            className="inline-flex items-center gap-2 px-6 sm:px-8 py-3 rounded-full border border-white/30 bg-white/5 hover:bg-white/15 hover:border-white/50 text-white font-semibold text-sm sm:text-base backdrop-blur-sm transition-all duration-300"
          >
            Shop All Rudraksha
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Glass stats strip — sits right on the banner's bottom edge. 2x2 grid with hairline
          dividers on mobile (a clean "spec sheet" look instead of loosely floating text),
          becomes one divided row of 4 from the sm breakpoint up. */}
      <div className="relative z-10 border-t border-white/10 bg-black/35 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 sm:px-8">
          <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-y divide-white/10 sm:divide-y-0">
            {stats.map((stat) => {
              const Icon = stat.icon;
              return (
                <div
                  key={stat.label}
                  className="flex flex-col sm:flex-row items-center justify-center sm:justify-start gap-1.5 sm:gap-2.5 text-center sm:text-left px-2 py-4 sm:py-4"
                >
                  <span className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-4 h-4 text-vedic-gold" strokeWidth={1.75} />
                  </span>
                  <span>
                    <span className="block text-sm sm:text-base font-bold text-white leading-tight">
                      {stat.value}
                    </span>
                    <span className="block text-[10px] sm:text-xs text-gray-300 leading-tight">
                      {stat.label}
                    </span>
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, Droplets, Flame, Flower2, Package, Search, Sparkles, Users, Wheat, Wind, type LucideIcon } from 'lucide-react';

export interface PujaKitHeroProps {
  /** Optional real hero photo (served from /public). When set it fills the medallion; if it fails to load the
   *  built-in mandala illustration shows instead — the hero never looks empty or broken. */
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

// Six samagri "orbiting" the medallion — decorative, and a quick visual answer to "what comes in a kit?".
const ORBIT: { label: string; Icon: LucideIcon }[] = [
  { label: 'Gangajal', Icon: Droplets },
  { label: 'Dhoop', Icon: Wind },
  { label: 'Diya Wicks', Icon: Flame },
  { label: 'Kumkum', Icon: Sparkles },
  { label: 'Akshat', Icon: Wheat },
  { label: 'Flowers & Toran', Icon: Flower2 }
];

const Mandala: React.FC = () => (
  <svg viewBox="0 0 400 400" className="w-full h-full" aria-hidden="true">
    <defs>
      <radialGradient id="pk-hero-bg" cx="50%" cy="45%" r="70%">
        <stop offset="0" stopColor="#FFFBF0" />
        <stop offset="1" stopColor="#F6E7C6" />
      </radialGradient>
    </defs>
    <circle cx="200" cy="200" r="196" fill="url(#pk-hero-bg)" />
    <circle cx="200" cy="200" r="184" fill="none" stroke="#E9A331" strokeOpacity=".35" />
    <circle cx="200" cy="200" r="150" fill="none" stroke="#E9A331" strokeOpacity=".25" />
    {Array.from({ length: 12 }, (_, i) => (
      <ellipse key={`o${i}`} cx="200" cy="112" rx="17" ry="50" fill="#E9A331" fillOpacity=".17" transform={`rotate(${i * 30} 200 200)`} />
    ))}
    {Array.from({ length: 8 }, (_, i) => (
      <ellipse key={`i${i}`} cx="200" cy="150" rx="11" ry="30" fill="#E9A331" fillOpacity=".3" transform={`rotate(${i * 45 + 22.5} 200 200)`} />
    ))}
    <circle cx="200" cy="200" r="40" fill="#E9A331" fillOpacity=".92" />
    <circle cx="200" cy="200" r="26" fill="#FFF5DE" />
    <circle cx="200" cy="200" r="9" fill="#C98A14" />
  </svg>
);

/** Section 1: Hero. Light, premium, image-optional — works today with zero uploaded photos. */
export const PujaKitHero: React.FC<PujaKitHeroProps> = ({
  imageSrc = '/images/puja-kit/PoojaKit-HeroBanner.png',
  imageAlt = 'Puja thali with diya, flowers and samagri',
  heading = DEFAULT_HEADING,
  subheading = DEFAULT_SUBHEADING,
  shopAllLink = '/collections/puja-kits',
  onFindKitClick
}) => {
  const [imageFailed, setImageFailed] = React.useState(false);
  const showPhoto = Boolean(imageSrc) && !imageFailed;

  return (
    <section className="relative w-full overflow-hidden bg-gradient-to-br from-vedic-ivory via-vedic-card to-vedic-sand">
      {/* soft gold glows — purely decorative */}
      <div className="pointer-events-none absolute -top-24 -right-24 w-[420px] h-[420px] rounded-full bg-vedic-gold/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -left-24 w-[360px] h-[360px] rounded-full bg-vedic-gold/10 blur-3xl" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 lg:py-20 grid lg:grid-cols-2 gap-10 lg:gap-12 items-center">
        {/* Copy */}
        <div className="text-center lg:text-left order-2 lg:order-1">
          <div className="flex items-center justify-center lg:justify-start gap-3 mb-3 sm:mb-4">
            <Flame className="w-4 h-4 text-vedic-goldDeep" strokeWidth={1.75} />
            <span className="w-10 sm:w-14 h-px bg-vedic-gold/60" />
          </div>

          <p className="text-[10px] sm:text-xs font-bold tracking-[0.12em] sm:tracking-[0.2em] text-vedic-goldDeep uppercase mb-4">
            Puja Kits &nbsp;•&nbsp; Complete Samagri &nbsp;•&nbsp; Vidhi Guide Included
          </p>

          <h1 className="font-serif font-semibold text-vedic-dark text-[30px] sm:text-4xl lg:text-5xl leading-[1.12] tracking-tight mb-4">
            {heading}
          </h1>

          <p className="text-sm sm:text-base text-vedic-muted leading-relaxed max-w-xl mx-auto lg:mx-0 mb-7">{subheading}</p>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center lg:justify-start gap-3 sm:gap-4">
            <Link
              to={shopAllLink}
              className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full bg-vedic-gold hover:bg-vedic-goldDark text-vedic-dark font-bold text-sm sm:text-base transition-all duration-300 shadow-gold hover:scale-[1.03]"
            >
              Shop All Puja Kits
              <ArrowRight className="w-4 h-4" />
            </Link>
            <button
              type="button"
              onClick={onFindKitClick}
              className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full border border-vedic-goldDeep/40 bg-white/70 hover:bg-white hover:border-vedic-goldDeep text-vedic-dark font-semibold text-sm sm:text-base transition-all duration-300"
            >
              <Search className="w-4 h-4" />
              Find My Kit
            </button>
          </div>

          <ul className="mt-7 flex flex-wrap items-center justify-center lg:justify-start gap-x-6 gap-y-2 text-xs sm:text-sm text-vedic-charcoal">
            <li className="inline-flex items-center gap-1.5"><BookOpen className="w-4 h-4 text-vedic-goldDeep" strokeWidth={1.75} /> Vidhi guide in every kit</li>
            <li className="inline-flex items-center gap-1.5"><Package className="w-4 h-4 text-vedic-goldDeep" strokeWidth={1.75} /> Sealed &amp; secure packaging</li>
            <li className="inline-flex items-center gap-1.5"><Users className="w-4 h-4 text-vedic-goldDeep" strokeWidth={1.75} /> Pandit support available</li>
          </ul>
        </div>

        {/* Medallion */}
        <div className="order-1 lg:order-2 flex justify-center">
          <div className="relative w-[250px] h-[250px] sm:w-[340px] sm:h-[340px] lg:w-[420px] lg:h-[420px]">
            <div className="absolute inset-0 rounded-full border border-vedic-gold/40" />
            <div className="absolute inset-[7%] rounded-full overflow-hidden shadow-gold bg-vedic-card">
              {showPhoto ? (
                <img src={imageSrc} alt={imageAlt} loading="eager" decoding="async" className="w-full h-full object-cover" onError={() => setImageFailed(true)} />
              ) : (
                <Mandala />
              )}
            </div>

            {ORBIT.map(({ label, Icon }, i) => {
              const angle = (-90 + i * 60) * (Math.PI / 180);
              return (
                <div
                  key={label}
                  className="absolute -translate-x-1/2 -translate-y-1/2 flex items-center gap-1.5 rounded-full bg-white border border-vedic-gold/30 shadow-card pl-1.5 pr-2.5 sm:pr-3 py-1 sm:py-1.5"
                  style={{ left: `${50 + 50 * Math.cos(angle)}%`, top: `${50 + 50 * Math.sin(angle)}%` }}
                >
                  <span className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-vedic-card flex items-center justify-center shrink-0">
                    <Icon className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-vedic-goldDeep" strokeWidth={1.75} />
                  </span>
                  <span className="text-[9px] sm:text-[11px] font-semibold text-vedic-dark whitespace-nowrap">{label}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};
import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Compass, Flame, Search, ShieldCheck, Users } from 'lucide-react';
import { yantraArt } from '../data/yantraData';

export interface YantraHeroProps {
  /** Full-bleed banner image, served from /public — swap the file to change it any time. If it fails to load,
   *  the warm gradient plus the generated yantra art show instead — the hero never looks empty or broken. */
  imageSrc?: string;
  imageAlt?: string;
  heading?: string;
  subheading?: string;
  shopAllLink?: string;
  /** Fires when "Find My Yantra" is clicked — the page scrolls to the finder. */
  onFindYantraClick?: () => void;
}

const DEFAULT_HEADING = 'Sacred Geometry for Your Home & Worship';
const DEFAULT_SUBHEADING =
  'Precisely engraved Shree, Kuber, Mahamrityunjay, Navgraha and Vastu yantras in copper, silver, brass and crystal — with a placement and worship guide for every one.';

/** Section 1: Hero. Full-bleed banner behind, copy in front — same pattern as the Rudraksha / Puja Kit heroes. */
export const YantraHero: React.FC<YantraHeroProps> = ({
  imageSrc = 'images/yantra/YantraBanner.png',
  imageAlt = 'Sacred copper Shree Yantra with diya and flowers',
  heading = DEFAULT_HEADING,
  subheading = DEFAULT_SUBHEADING,
  shopAllLink = '/collections/yantra',
  onFindYantraClick
}) => {
  const [bannerFailed, setBannerFailed] = useState(false);
  const art = useMemo(() => yantraArt('gold'), []);

  return (
    <section className="relative w-full overflow-hidden bg-gradient-to-br from-vedic-ivory via-vedic-card to-vedic-sand">
      {!bannerFailed && (
        <img
          src={imageSrc}
          alt={imageAlt}
          loading="eager"
          decoding="async"
          className="absolute inset-0 w-full h-full object-cover object-[70%_center] sm:object-center"
          onError={() => setBannerFailed(true)}
        />
      )}

      {/* No banner uploaded yet → the generated yantra fills the hero edge to edge behind the text (same layout as the
          Puja Kit hero: picture behind, copy in front), fading out toward the text side. Upload
          public/images/yantra/Yantra-HeroBanner.png and it replaces this automatically. */}
      {bannerFailed && (
        <div aria-hidden="true" className="absolute inset-0 overflow-hidden">
          <div
            className="absolute top-1/2 -translate-y-1/2 -right-1/4 sm:right-0 h-[130%] sm:h-[135%] aspect-square"
            style={{
              WebkitMaskImage: 'linear-gradient(to left, #000 40%, transparent 100%)',
              maskImage: 'linear-gradient(to left, #000 40%, transparent 100%)'
            }}
          >
            <img src={art} alt="" className="w-full h-full object-cover opacity-90" />
          </div>
        </div>
      )}

      <div className="absolute inset-0 bg-gradient-to-b from-vedic-ivory/90 via-vedic-ivory/60 to-vedic-ivory/90 sm:bg-gradient-to-r sm:from-vedic-ivory/90 sm:via-vedic-ivory/55 sm:to-transparent" />

      <div className="relative z-10 flex flex-col items-start justify-center text-left px-5 sm:px-10 lg:px-16 py-12 sm:py-16 lg:py-20 min-h-[420px] sm:min-h-[460px] lg:min-h-[520px] max-w-3xl">
        <div className="flex items-center gap-3 mb-3 sm:mb-4">
          <Compass className="w-4 h-4 text-vedic-goldDeep" strokeWidth={1.75} />
          <span className="w-10 sm:w-14 h-px bg-vedic-gold/60" />
        </div>

        <p className="text-[10px] sm:text-xs font-bold tracking-[0.12em] sm:tracking-[0.2em] text-vedic-goldDeep uppercase mb-4">
          Yantras &nbsp;•&nbsp; Sacred Geometry &nbsp;•&nbsp; Placement Guide Included
        </p>

        <h1 className="font-serif font-semibold text-vedic-dark text-[28px] sm:text-4xl lg:text-5xl leading-[1.12] tracking-tight max-w-xl mb-4">{heading}</h1>

        <p className="text-sm sm:text-base text-vedic-charcoal leading-relaxed max-w-md mb-7">{subheading}</p>

        <div className="flex flex-wrap items-center gap-3 sm:gap-4">
          <Link
            to={shopAllLink}
            className="inline-flex items-center justify-center gap-2 px-6 sm:px-7 py-3 sm:py-3.5 rounded-full bg-vedic-gold hover:bg-vedic-goldDark text-vedic-dark font-bold text-sm sm:text-base transition-all duration-300 shadow-gold hover:scale-[1.03]"
          >
            Shop All Yantras
            <ArrowRight className="w-4 h-4" />
          </Link>
          <button
            type="button"
            onClick={onFindYantraClick}
            className="inline-flex items-center justify-center gap-2 px-6 sm:px-7 py-3 sm:py-3.5 rounded-full border border-vedic-goldDeep/40 bg-white/70 hover:bg-white hover:border-vedic-goldDeep text-vedic-dark font-semibold text-sm sm:text-base backdrop-blur-sm transition-all duration-300"
          >
            <Search className="w-4 h-4" />
            Find My Yantra
          </button>
        </div>

        <ul className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs sm:text-sm text-vedic-charcoal">
          <li className="inline-flex items-center gap-1.5"><ShieldCheck className="w-4 h-4 text-vedic-goldDeep" strokeWidth={1.75} /> Material clearly disclosed</li>
          <li className="inline-flex items-center gap-1.5"><Flame className="w-4 h-4 text-vedic-goldDeep" strokeWidth={1.75} /> Energization on request</li>
          <li className="inline-flex items-center gap-1.5"><Users className="w-4 h-4 text-vedic-goldDeep" strokeWidth={1.75} /> Pandit guidance available</li>
        </ul>
      </div>
    </section>
  );
};
import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { Sparkles, ShieldCheck, Phone } from 'lucide-react';
import { PLANET_LIST } from '../data/gemstoneData';
import { Product } from '../types/ecommerce';
import { ProductCard } from '../components/ProductCard';
import { Breadcrumb } from '../components/Breadcrumb';
import { NotFoundPage } from './NotFoundPage';
import { resolveRecommendedProducts, extractRudrakshaSlugs } from '../utils/resolveRecommendedProducts';
import { getRudrakshaPlanetTiles } from '../services/rudrakshaPlanetService';
import { MOCK_PRODUCTS } from '../data/products';

/**
 * One single dynamic page for /planets/:planetSlug, shared by both the Gemstone side (default)
 * and the Rudraksha "Shop By Planet" section (?category=rudraksha) — same planet identity
 * (PLANET_LIST), same URL pattern, just a different product category resolved and rendered
 * depending on where the visitor came from. No separate Rudraksha-planet page needed.
 */
export const PlanetGemstonesPage: React.FC = () => {
  const { planetSlug } = useParams<{ planetSlug: string }>();
  const [searchParams] = useSearchParams();
  const isRudraksha = searchParams.get('category') === 'rudraksha';

  const planet = PLANET_LIST.find(
    (p) => p.slug === planetSlug?.toLowerCase() || p.id === planetSlug?.toLowerCase()
  );

  const [rudrakshaProducts, setRudrakshaProducts] = useState<Product[]>([]);

  useEffect(() => {
    if (!isRudraksha || !planet) return;
    let isMounted = true;
    getRudrakshaPlanetTiles().then((tiles) => {
      if (!isMounted) return;
      const match = tiles.find((t) => t.slug === planet.slug);
      const slugs = match?.matchedMukhiNumbers.map((n) => `${n}-mukhi-rudraksha`) ?? [];
      const matched = slugs
        .map((slug) => MOCK_PRODUCTS.find((p) => p.slug === slug))
        .filter((p): p is Product => Boolean(p));
      setRudrakshaProducts(
        matched.length > 0 ? matched : MOCK_PRODUCTS.filter((p) => p.category === 'rudraksha').slice(0, 8)
      );
    });
    return () => {
      isMounted = false;
    };
  }, [isRudraksha, planet]);

  if (!planet) {
    return <NotFoundPage />;
  }

  const gemstoneProducts = resolveRecommendedProducts({
    gemstoneText: [planet.primaryGemstone, ...planet.alternativeGemstones]
  });

  const products = isRudraksha ? rudrakshaProducts : gemstoneProducts;
  const rudrakshaMukhiNumbers = isRudraksha
    ? Array.from(new Set(extractRudrakshaSlugs(products.map((p) => p.title)).map((s) => s.split('-')[0])))
    : [];

  return (
    <div className="space-y-12 pb-16 bg-vedic-ivory text-vedic-dark">
      <div className="max-w-7xl mx-auto px-4 pt-4">
        <Breadcrumb
          items={
            isRudraksha
              ? [{ label: 'Rudraksha', path: '/rudraksha' }, { label: planet.planetName }]
              : [{ label: 'Gemstones', path: '/gemstones' }, { label: planet.planetName }]
          }
        />
      </div>

      <section className="relative bg-vedic-brown text-vedic-ivory py-20 overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={planet.bannerImage}
            alt={planet.planetName}
            className="w-full h-full object-cover"
            loading="eager"
          />
          <div className="absolute inset-0 bg-vedic-brown/80" />
          <div className="absolute inset-0 bg-gradient-to-t from-vedic-brown via-transparent to-vedic-brown/40" />
        </div>

        <div className="relative max-w-4xl mx-auto px-4 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-vedic-gold/15 text-vedic-gold flex items-center justify-center text-3xl mx-auto border border-vedic-gold/40 shadow-xl backdrop-blur-sm">
            {planet.symbol}
          </div>
          <span className="inline-flex items-center gap-1.5 bg-vedic-gold/20 text-vedic-gold border border-vedic-gold/40 px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-widest">
            <Sparkles className="w-3.5 h-3.5" />
            {isRudraksha ? 'Planetary Rudraksha Architecture' : 'Planetary Gemstone Architecture'}
          </span>
          <h1 className="font-serif font-extrabold text-3xl md:text-5xl text-vedic-goldLight">
            {isRudraksha ? 'Rudraksha Associated with' : 'Gemstones Associated with'} {planet.planetName}
          </h1>
          <p className="text-xs md:text-sm text-gray-200 font-light max-w-xl mx-auto leading-relaxed">
            {planet.description}
          </p>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-4">
        <div className="bg-white rounded-3xl p-8 border border-vedic-gold/30 shadow-card space-y-4">
          <h2 className="font-serif font-bold text-2xl text-vedic-maroon">
            Astrological Significance of {planet.planetName} Remedies
          </h2>
          <p className="text-xs md:text-sm text-vedic-charcoal leading-relaxed">
            {planet.astrologicalSignificance}
          </p>

          {isRudraksha ? (
            <div className="p-4 bg-vedic-ivory rounded-2xl border border-vedic-gold/20 space-y-1">
              <span className="text-[10px] font-bold text-vedic-goldDark uppercase">Recommended Mukhi</span>
              <p className="text-xs font-semibold text-vedic-dark">
                {rudrakshaMukhiNumbers.length > 0
                  ? rudrakshaMukhiNumbers.map((n) => `${n} Mukhi`).join(', ')
                  : 'Traditional associations vary — consult an astrologer for confirmation.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="p-4 bg-vedic-ivory rounded-2xl border border-vedic-gold/20 space-y-1">
                <span className="text-[10px] font-bold text-vedic-goldDark uppercase">Primary Prescribed Gemstone</span>
                <h3 className="font-serif font-bold text-base text-vedic-brown">{planet.primaryGemstone}</h3>
                <Link
                  to={`/gemstones/${planet.primaryGemstoneSlug}`}
                  className="text-xs font-bold text-vedic-maroon hover:underline block pt-1"
                >
                  Explore {planet.primaryGemstone} →
                </Link>
              </div>

              <div className="p-4 bg-vedic-ivory rounded-2xl border border-vedic-gold/20 space-y-1">
                <span className="text-[10px] font-bold text-vedic-goldDark uppercase">Approved Alternatives (Uparatna)</span>
                <p className="text-xs font-semibold text-vedic-dark">{planet.alternativeGemstones.join(', ')}</p>
              </div>
            </div>
          )}
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 space-y-6">
        <div className="border-b border-vedic-gold/20 pb-4">
          <span className="text-xs font-bold text-vedic-goldDark uppercase tracking-widest">Available Items</span>
          <h2 className="font-serif font-extrabold text-2xl text-vedic-maroon mt-1">
            Shop {planet.planetName} {isRudraksha ? 'Rudraksha' : 'Gemstones'}
          </h2>
        </div>

        {products.length === 0 ? (
          <div className="text-center py-10 border border-dashed border-vedic-gold/25 rounded-2xl">
            <p className="text-sm text-vedic-muted">Listings for {planet.planetName} will appear here shortly.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      <section className="max-w-7xl mx-auto px-4">
        <div className="bg-vedic-brown text-vedic-ivory rounded-3xl p-8 md:p-12 border border-vedic-gold/40 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-3 max-w-2xl text-center md:text-left">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-vedic-gold uppercase tracking-widest">
              <ShieldCheck className="w-4 h-4" /> Check with Your Birth Chart
            </span>
            <h3 className="font-serif font-extrabold text-2xl md:text-4xl text-vedic-goldLight">
              Get Personalized Astrological Validation
            </h3>
            <p className="text-xs md:text-sm text-gray-300 font-light leading-relaxed">
              {planet.planetName} remedies work best when confirmed against your own birth chart.
              Consult a Vedic astrologer before wearing planetary {isRudraksha ? 'Rudraksha' : 'gemstones'}.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 shrink-0">
            <Link
              to={`/contact?subject=Planetary%20${isRudraksha ? 'Rudraksha' : 'Gemstone'}%20Consultation`}
              className="bg-gold-gradient text-vedic-dark font-serif font-bold text-xs px-6 py-3.5 rounded-full shadow-lg hover:scale-105 transition-transform flex items-center justify-center gap-2"
            >
              <Phone className="w-4 h-4" /> CONSULT AN ASTROLOGER
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
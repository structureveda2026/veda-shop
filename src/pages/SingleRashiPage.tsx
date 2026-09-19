import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Compass, Sparkles, ShieldCheck, Phone, ArrowRight, HelpCircle, Star, CheckCircle2 } from 'lucide-react';
import { RASHI_LIST, RashiDetail } from '../data/rashiData';
import { ProductCard } from '../components/ProductCard';
import { Breadcrumb } from '../components/Breadcrumb';
import { NotFoundPage } from './NotFoundPage';
import { resolveRecommendedProducts } from '../utils/resolveRecommendedProducts';

export const SingleRashiPage: React.FC = () => {
  const { rashi } = useParams<{ rashi: string }>();

  const currentRashi = RASHI_LIST.find(
    (r) => r.slug === rashi?.toLowerCase() || r.nameEn.toLowerCase() === rashi?.toLowerCase()
  );

  if (!currentRashi) {
    return <NotFoundPage />;
  }

  // Real products matching this Rashi's recommended Rudraksha + gemstone copy — dynamic per Rashi.
  const recommendedProducts = resolveRecommendedProducts({
    rudrakshaText: currentRashi.recommendedRudraksha,
    gemstoneText: currentRashi.recommendedGemstone
  });

  const relatedRashis = RASHI_LIST.filter((r) => r.id !== currentRashi.id).slice(0, 4);

  return (
    <div className="space-y-12 pb-16 bg-vedic-ivory text-vedic-dark">
      {/* 01. Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 pt-4">
        <Breadcrumb items={[{ label: 'Shop by Rashi', path: '/rashi' }, { label: currentRashi.nameEn }]} />
      </div>

      {/* 02. Rashi Hero */}
      <section className="relative bg-vedic-brown text-vedic-ivory py-20 overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={currentRashi.imageUrl}
            alt={currentRashi.nameEn}
            className="w-full h-full object-cover"
            loading="eager"
          />
          <div className="absolute inset-0 bg-vedic-brown/80" />
          <div className="absolute inset-0 bg-gradient-to-t from-vedic-brown via-transparent to-vedic-brown/40" />
        </div>

        <div className="relative max-w-4xl mx-auto px-4 text-center space-y-4">
          <div className="w-20 h-20 rounded-full bg-vedic-gold/15 text-vedic-gold flex items-center justify-center text-5xl font-serif mx-auto border border-vedic-gold/40 shadow-xl backdrop-blur-sm">
            {currentRashi.symbol}
          </div>

          <span className="inline-flex items-center gap-1.5 bg-vedic-gold/20 text-vedic-gold border border-vedic-gold/40 px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-widest">
            <Sparkles className="w-3.5 h-3.5" /> Element: {currentRashi.element} • Ruling: {currentRashi.rulingPlanet}
          </span>

          <h1 className="font-serif font-extrabold text-3xl md:text-5xl text-vedic-goldLight">
            {currentRashi.nameHi} — {currentRashi.nameEn}
          </h1>

          <p className="text-xs md:text-sm text-gray-200 max-w-2xl mx-auto font-light leading-relaxed">
            {currentRashi.description}
          </p>
        </div>
      </section>

      {/* 03. Rashi Information & Why These Products */}
      <section className="max-w-5xl mx-auto px-4">
        <div className="bg-white rounded-3xl p-8 border border-vedic-gold/30 shadow-card space-y-6">
          <div className="text-center max-w-xl mx-auto">
            <span className="text-xs font-bold text-vedic-goldDark uppercase tracking-widest">
              Vedic Astrology Synthesis
            </span>
            <h2 className="font-serif font-bold text-2xl text-vedic-maroon mt-1">
              Why Are These Remedies Prescribed for {currentRashi.nameEn}?
            </h2>
          </div>

          <p className="text-xs md:text-sm text-vedic-charcoal leading-relaxed">
            {currentRashi.whyTheseProducts}
          </p>

          {/* Quick Summary Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
            <div className="p-3 bg-vedic-ivory rounded-2xl border border-vedic-gold/20">
              <span className="text-[10px] font-bold text-vedic-goldDark uppercase">Recommended Rudraksha</span>
              <p className="text-xs font-bold text-vedic-brown mt-1">{currentRashi.recommendedRudraksha}</p>
            </div>
            <div className="p-3 bg-vedic-ivory rounded-2xl border border-vedic-gold/20">
              <span className="text-[10px] font-bold text-vedic-goldDark uppercase">Primary Gemstone</span>
              <p className="text-xs font-bold text-vedic-brown mt-1">{currentRashi.recommendedGemstone}</p>
            </div>
            <div className="p-3 bg-vedic-ivory rounded-2xl border border-vedic-gold/20">
              <span className="text-[10px] font-bold text-vedic-goldDark uppercase">Vedic Yantra</span>
              <p className="text-xs font-bold text-vedic-brown mt-1">{currentRashi.recommendedYantra}</p>
            </div>
            <div className="p-3 bg-vedic-ivory rounded-2xl border border-vedic-gold/20">
              <span className="text-[10px] font-bold text-vedic-goldDark uppercase">Prescribed Puja</span>
              <p className="text-xs font-bold text-vedic-brown mt-1">{currentRashi.recommendedPuja}</p>
            </div>
          </div>
        </div>
      </section>

      {/* 04. Recommended Products Grid */}
      <section className="max-w-7xl mx-auto px-4 space-y-6">
        <div className="border-b border-vedic-gold/20 pb-4 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <span className="text-xs font-bold text-vedic-goldDark uppercase tracking-widest">
              Zodiac Curated Items
            </span>
            <h2 className="font-serif font-extrabold text-2xl md:text-3xl text-vedic-maroon mt-1">
              Recommended Products for {currentRashi.nameEn}
            </h2>
            <p className="text-xs text-vedic-muted mt-1">
              Traditionally associated with balancing planetary energies of {currentRashi.rulingPlanet}.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {recommendedProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* 05. Astrologer Recommendation CTA (Section 18 Wording Compliant) */}
      <section className="max-w-7xl mx-auto px-4">
        <div className="bg-vedic-brown text-vedic-ivory rounded-3xl p-8 md:p-12 border border-vedic-gold/40 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-3 max-w-2xl text-center md:text-left">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-vedic-gold uppercase tracking-widest">
              <ShieldCheck className="w-4 h-4" /> Important Vedic Note
            </span>
            <h3 className="font-serif font-extrabold text-2xl md:text-4xl text-vedic-goldLight">
              Need Personalized Kundli Guidance?
            </h3>
            <p className="text-xs md:text-sm text-gray-300 font-light leading-relaxed">
              Your Rashi is only one part of Vedic analysis. Get personalized guidance before choosing a gemstone, Rudraksha, or other Vedic product. Gemstone recommendations should allow complete Kundli-based consultation.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 shrink-0">
            <Link
              to="/contact?subject=Kundli%20Gemstone%20Consultation"
              className="bg-gold-gradient text-vedic-dark font-serif font-bold text-xs px-6 py-3.5 rounded-full shadow-lg hover:scale-105 transition-transform flex items-center justify-center gap-2"
            >
              <Phone className="w-4 h-4" /> CONSULT AN ASTROLOGER
            </Link>
          </div>
        </div>
      </section>

      {/* 06. FAQs */}
      {currentRashi.faqs.length > 0 && (
        <section className="max-w-4xl mx-auto px-4 space-y-4">
          <div className="text-center space-y-1">
            <span className="text-xs font-bold text-vedic-goldDark uppercase tracking-widest flex items-center justify-center gap-1">
              <HelpCircle className="w-4 h-4 text-vedic-gold" /> Clear Doubts
            </span>
            <h3 className="font-serif font-extrabold text-2xl text-vedic-maroon">
              {currentRashi.nameEn} (Zodiac) Astrological FAQs
            </h3>
          </div>

          <div className="space-y-3">
            {currentRashi.faqs.map((faq, idx) => (
              <div key={idx} className="bg-white rounded-2xl p-5 border border-vedic-gold/20 shadow-sm space-y-2">
                <h4 className="font-serif font-bold text-sm text-vedic-dark">{faq.question}</h4>
                <p className="text-xs text-vedic-charcoal leading-relaxed">{faq.answer}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 07. Related Rashis */}
      <section className="max-w-7xl mx-auto px-4 space-y-6">
        <div className="text-center space-y-1">
          <span className="text-xs font-bold text-vedic-goldDark uppercase tracking-widest">
            Explore Other Signs
          </span>
          <h3 className="font-serif font-extrabold text-2xl text-vedic-maroon">
            Related Zodiac Signs
          </h3>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {relatedRashis.map((r) => (
            <Link
              key={r.id}
              to={`/rashi/${r.slug}`}
              className="p-4 rounded-2xl bg-white border border-vedic-gold/20 hover:border-vedic-gold shadow-sm hover:shadow-md transition-all text-center flex flex-col items-center justify-center"
            >
              <span className="text-3xl text-vedic-gold font-serif mb-1">{r.symbol}</span>
              <span className="font-serif font-bold text-sm text-vedic-dark">{r.nameEn}</span>
              <span className="text-[10px] text-vedic-muted">{r.nameHi.split(' ')[0]}</span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
};
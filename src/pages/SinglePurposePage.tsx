import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Sparkles, ShieldCheck, Compass, ArrowRight, HelpCircle, Phone, CheckCircle2 } from 'lucide-react';
import { PURPOSE_LIST } from '../data/purposeData';
import { ProductCard } from '../components/ProductCard';
import { Breadcrumb } from '../components/Breadcrumb';
import { NotFoundPage } from './NotFoundPage';
import { resolveRecommendedProducts } from '../utils/resolveRecommendedProducts';

export const SinglePurposePage: React.FC = () => {
  const { purposeId } = useParams<{ purposeId: string }>();

  const purpose = PURPOSE_LIST.find(
    (p) => p.slug === purposeId || p.id === purposeId
  );

  if (!purpose) {
    return <NotFoundPage />;
  }

  // Real products matching this purpose's recommended Rudraksha + gemstones — dynamic per purpose.
  const recommendedProducts = resolveRecommendedProducts({
    rudrakshaText: purpose.recommendedRudraksha,
    gemstoneText: purpose.recommendedGemstones
  });

  return (
    <div className="space-y-12 pb-16 bg-vedic-ivory text-vedic-dark">
      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 pt-4">
        <Breadcrumb items={[{ label: 'Shop by Purpose', path: '/#shop-by-purpose' }, { label: purpose.name }]} />
      </div>

      {/* Purpose Hero Section */}
      <section className="relative bg-vedic-brown text-vedic-ivory py-20 overflow-hidden">
        <div className="absolute inset-0">
          <img src={purpose.heroImage} alt={purpose.name} className="w-full h-full object-cover" loading="eager" />
          <div className="absolute inset-0 bg-vedic-brown/80" />
          <div className="absolute inset-0 bg-gradient-to-t from-vedic-brown via-transparent to-vedic-brown/40" />
        </div>
        <div className="relative max-w-4xl mx-auto px-4 text-center space-y-4">
          <span className="inline-flex items-center gap-1.5 bg-vedic-gold/20 text-vedic-gold border border-vedic-gold/40 px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-widest">
            <Sparkles className="w-3.5 h-3.5" /> Intentional Vedic Remedy
          </span>

          <h1 className="font-serif font-extrabold text-3xl md:text-5xl text-vedic-goldLight">
            {purpose.name} ({purpose.hindiName})
          </h1>

          <p className="text-sm md:text-base text-gray-200 max-w-2xl mx-auto font-light leading-relaxed">
            {purpose.tagline}
          </p>
        </div>
      </section>

      {/* What Does This Purpose Mean Section */}
      <section className="max-w-5xl mx-auto px-4">
        <div className="bg-white rounded-3xl p-8 border border-vedic-gold/30 shadow-card space-y-4 text-center md:text-left">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="w-16 h-16 rounded-2xl bg-vedic-gold/20 text-vedic-brown flex items-center justify-center shrink-0">
              <Compass className="w-8 h-8 text-vedic-goldDark" />
            </div>
            <div className="space-y-2 flex-1">
              <h2 className="font-serif font-bold text-2xl text-vedic-maroon">
                Understanding {purpose.name} in Vedic Tradition
              </h2>
              <p className="text-xs md:text-sm text-vedic-charcoal leading-relaxed">
                {purpose.description}
              </p>
              <p className="text-xs text-vedic-muted leading-relaxed">
                {purpose.whatItMeans}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Recommended Items Grid */}
      <section className="max-w-7xl mx-auto px-4 space-y-6">
        <div className="border-b border-vedic-gold/20 pb-4">
          <span className="text-xs font-bold text-vedic-goldDark uppercase tracking-widest">
            Curated Selection
          </span>
          <h2 className="font-serif font-extrabold text-2xl md:text-3xl text-vedic-maroon mt-1">
            Recommended Products for {purpose.name}
          </h2>
          <p className="text-xs text-vedic-muted mt-1">
            "Traditionally associated with balancing planetary energies and inviting abundance."
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {recommendedProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* Astrologer Recommendation CTA */}
      <section className="max-w-7xl mx-auto px-4">
        <div className="bg-vedic-brown text-vedic-ivory rounded-3xl p-8 md:p-12 border border-vedic-gold/40 shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-3 max-w-2xl text-center md:text-left">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-vedic-gold uppercase tracking-widest">
              <ShieldCheck className="w-4 h-4" /> Need Personalized Guidance?
            </span>
            <h3 className="font-serif font-extrabold text-2xl md:text-4xl text-vedic-goldLight">
              Consult a Vedic Astrologer Before Selecting
            </h3>
            <p className="text-xs md:text-sm text-gray-300 font-light leading-relaxed">
              Your Rashi and intention are part of Vedic analysis. Get personalized guidance based on your Kundli before choosing a gemstone, Rudraksha, or Puja kit.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 shrink-0">
            <Link
              to="/contact?subject=Kundli%20Astrology%20Consultation"
              className="bg-gold-gradient text-vedic-dark font-serif font-bold text-xs px-6 py-3.5 rounded-full shadow-lg hover:scale-105 transition-transform flex items-center justify-center gap-2"
            >
              <Phone className="w-4 h-4" /> CONSULT AN ASTROLOGER
            </Link>
          </div>
        </div>
      </section>

      {/* Purpose FAQ Section */}
      {purpose.faqs.length > 0 && (
        <section className="max-w-4xl mx-auto px-4 space-y-4">
          <div className="text-center space-y-1">
            <span className="text-xs font-bold text-vedic-goldDark uppercase tracking-widest flex items-center justify-center gap-1">
              <HelpCircle className="w-4 h-4 text-vedic-gold" /> Clear Doubts
            </span>
            <h3 className="font-serif font-extrabold text-2xl text-vedic-maroon">
              Frequently Asked Questions on {purpose.name}
            </h3>
          </div>

          <div className="space-y-3">
            {purpose.faqs.map((faq, idx) => (
              <div key={idx} className="bg-white rounded-2xl p-5 border border-vedic-gold/20 shadow-sm space-y-2">
                <h4 className="font-serif font-bold text-sm text-vedic-dark">{faq.question}</h4>
                <p className="text-xs text-vedic-charcoal leading-relaxed">{faq.answer}</p>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
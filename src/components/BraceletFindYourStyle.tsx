import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { getAllBracelets } from '../services/braceletCatalogService';

const GENDER_TABS = ['Women', 'Men', 'Unisex'] as const;

// Data-driven chips. Keywords match real bracelet tags/material until Shopify `style` and
// `gender` metafields exist (spec section 33), at which point matching becomes a direct field filter.
const STYLE_CHIPS: { label: string; keywords: string[] }[] = [
  { label: 'Minimal', keywords: ['crystal faced', 'howlite', 'quartz'] },
  { label: 'Traditional', keywords: ['rudraksha', 'evil eye'] },
  { label: 'Premium', keywords: ['combo', 'love-attraction'] },
  { label: 'Daily Wear', keywords: [] },
  { label: 'Spiritual', keywords: ['chakra', 'peace', 'spiritual'] },
  { label: 'Fashion', keywords: ['jade', 'aura'] },
  { label: 'Office Wear', keywords: ['focus', 'tiger eye', 'citrine'] }
];

/** Section 11 (spec): Find Your Style — Women | Men | Unisex tabs with style filter chips. */
export const BraceletFindYourStyle: React.FC = () => {
  const [gender, setGender] = useState<(typeof GENDER_TABS)[number]>('Unisex');
  const [style, setStyle] = useState('Daily Wear');

  const products = useMemo(() => {
    const chip = STYLE_CHIPS.find((c) => c.label === style);
    const all = getAllBracelets();
    if (!chip || chip.keywords.length === 0) return all.slice(0, 4);
    const matched = all.filter((p) => {
      const h = [p.title, p.material ?? '', ...p.tags].join(' ').toLowerCase();
      return chip.keywords.some((k) => h.includes(k));
    });
    return (matched.length > 0 ? matched : all).slice(0, 4);
  }, [style]);

  return (
    <section id="find-your-style" className="bg-vedic-ivory">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="text-center max-w-2xl mx-auto mb-6">
          <p className="text-[11px] sm:text-xs font-bold tracking-[0.15em] text-vedic-goldDark uppercase mb-2">Women / Men / Unisex</p>
          <h2 className="font-serif font-semibold text-vedic-dark text-2xl sm:text-3xl">Find Your Style</h2>
        </div>

        <div className="flex justify-center gap-2 mb-4">
          {GENDER_TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setGender(tab)}
              aria-pressed={gender === tab}
              className={`px-5 py-2 rounded-full text-sm font-semibold border transition-colors ${
                gender === tab ? 'bg-vedic-dark text-vedic-gold border-vedic-dark' : 'bg-white text-vedic-dark border-vedic-gold/25 hover:border-vedic-gold/50'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {STYLE_CHIPS.map((chip) => (
            <button
              key={chip.label}
              onClick={() => setStyle(chip.label)}
              aria-pressed={style === chip.label}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
                style === chip.label ? 'bg-vedic-gold text-vedic-dark border-vedic-gold' : 'bg-white text-vedic-muted border-vedic-gold/20 hover:border-vedic-gold/50'
              }`}
            >
              {chip.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-5">
          {products.map((p) => (
            <Link key={p.id} to={`/products/${p.slug}`} className="group bg-white border border-vedic-gold/15 hover:border-vedic-gold/40 rounded-2xl overflow-hidden shadow-card hover:shadow-card-hover transition-all">
              <div className="aspect-square overflow-hidden">
                <img src={p.images[0]} alt={p.title} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              </div>
              <div className="p-3 sm:p-4">
                <h3 className="font-serif font-bold text-vedic-dark text-sm leading-snug line-clamp-2">{p.title}</h3>
                <p className="text-sm font-extrabold text-vedic-maroon mt-1">₹{p.price.toLocaleString('en-IN')}</p>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-6 text-center">
          <Link to="/collections/bracelets" className="inline-flex items-center gap-1.5 text-sm font-semibold text-vedic-goldDark hover:text-vedic-maroon transition-colors">
            View All {gender} Bracelets
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </section>
  );
};
import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Flame } from 'lucide-react';
import { getSamagriTiles } from '../services/pujaKitCatalogService';
import { PujaKitSectionHeading } from './PujaKitSectionHeading';

/** Section 10: "Need Individual Items?" — shortcuts into the `puja-samagri` category (categories.ts), so single items
 *  (Gangajal, incense, ghee wicks, …) stay one tap away for people who don't need a full kit. */
export const PujaKitSamagri: React.FC = () => {
  const tiles = useMemo(() => getSamagriTiles(), []);
  if (tiles.length === 0) return null;

  return (
    <section id="puja-samagri" className="bg-white scroll-mt-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <PujaKitSectionHeading
          eyebrow="Puja Samagri"
          title="Need Just a Few Items?"
          subtitle="Shop individual samagri — pure Gangajal, incense, ghee wicks and more."
          action={{ label: 'Shop All Puja Samagri', to: '/collections/puja-samagri' }}
        />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          {tiles.map((t) => (
            <Link
              key={t.slug}
              to={`/collections/puja-samagri/${t.slug}`}
              className="group rounded-2xl border border-vedic-gold/15 hover:border-vedic-gold/40 bg-vedic-ivory hover:shadow-card-hover p-5 flex items-start gap-4 transition-all"
            >
              <span className="w-11 h-11 rounded-full bg-white flex items-center justify-center shrink-0">
                <Flame className="w-5 h-5 text-vedic-goldDeep" strokeWidth={1.5} />
              </span>
              <div className="min-w-0">
                <h3 className="font-serif font-semibold text-vedic-dark text-base mb-1 leading-snug">{t.title}</h3>
                <p className="text-xs sm:text-sm text-vedic-muted leading-relaxed">{t.description}</p>
              </div>
            </Link>
          ))}
        </div>
        <div className="mt-5 text-center sm:hidden">
          <Link to="/collections/puja-samagri" className="inline-flex items-center gap-1.5 text-sm font-semibold text-vedic-goldDeep hover:text-vedic-maroon transition-colors">
            Shop All Puja Samagri <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </section>
  );
};
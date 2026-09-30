import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { getBestsellerKits, type PujaKitView } from '../services/pujaKitCatalogService';
import { PujaKitCard } from './PujaKitCard';
import { PujaKitSectionHeading } from './PujaKitSectionHeading';

/** Section 5: "Most Loved Puja Kits". Ranking = bestseller flag first, then review volume × rating
 *  (same rule as RudrakshaBestsellers / BraceletBestsellers). Once Shopify is connected, the same order can come
 *  from a BEST_SELLING-sorted collection — this component only ever renders what the service gives it. */
export const PujaKitBestsellers: React.FC<{ kits: PujaKitView[] }> = ({ kits }) => {
  const top = useMemo(() => getBestsellerKits(kits, 4), [kits]);
  if (top.length === 0) return null;

  return (
    <section id="most-loved-puja-kits" className="bg-vedic-ivory scroll-mt-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <PujaKitSectionHeading
          eyebrow="Most Loved"
          title="Most Loved Puja Kits"
          action={{ label: 'View All Puja Kits', to: '/collections/puja-kits' }}
        />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 items-start">
          {top.map((kit) => (
            <PujaKitCard key={kit.product.id} kit={kit} />
          ))}
        </div>
        <div className="mt-6 text-center sm:hidden">
          <Link to="/collections/puja-kits" className="inline-flex items-center gap-1.5 text-sm font-semibold text-vedic-goldDeep hover:text-vedic-maroon transition-colors">
            View All Puja Kits <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </section>
  );
};
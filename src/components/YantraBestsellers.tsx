import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { getBestsellerYantras, type YantraView } from '../services/yantraCatalogService';
import { YantraCard } from './YantraCard';
import { YantraSectionHeading } from './YantraSectionHeading';

/** Section 5: "Most Loved Yantras". Ranking = bestseller flag first, then review volume × rating
 *  (same rule as the Rudraksha / Puja Kit pages). This component only ever renders what the service gives it. */
export const YantraBestsellers: React.FC<{ yantras: YantraView[] }> = ({ yantras }) => {
  const top = useMemo(() => getBestsellerYantras(yantras, 4), [yantras]);
  if (top.length === 0) return null;

  return (
    <section id="most-loved-yantras" className="bg-vedic-ivory scroll-mt-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <YantraSectionHeading eyebrow="Most Loved" title="Most Loved Yantras" action={{ label: 'View All Yantras', to: '/collections/yantra' }} />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 items-start">
          {top.map((yantra) => (
            <YantraCard key={yantra.product.id} yantra={yantra} />
          ))}
        </div>
        <div className="mt-6 text-center sm:hidden">
          <Link to="/collections/yantra" className="inline-flex items-center gap-1.5 text-sm font-semibold text-vedic-goldDeep hover:text-vedic-maroon transition-colors">
            View All Yantras <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </section>
  );
};
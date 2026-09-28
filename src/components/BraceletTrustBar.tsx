import React, { useEffect, useState } from 'react';
import { Award, Package, ShieldCheck, Users, type LucideIcon } from 'lucide-react';
import { getBraceletTrustBarPoints, TrustPoint } from '../services/braceletContentService';

const TRUST_ICON: Record<string, LucideIcon> = {
  authentic: ShieldCheck,
  'quality-checked': Award,
  'secure-packaging': Package,
  'expert-guidance': Users
};

/** Section 2 (spec): Trust Bar — 4 points directly under the Hero. Certificate details, where
 *  available, are shown at the individual product level (see BraceletAuthenticity below) —
 *  never a blanket "all bracelets certified" claim here, per spec's own instruction. */
export const BraceletTrustBar: React.FC = () => {
  const [points, setPoints] = useState<TrustPoint[]>([]);

  useEffect(() => {
    let isMounted = true;
    getBraceletTrustBarPoints().then((result) => {
      if (isMounted) setPoints(result);
    });
    return () => {
      isMounted = false;
    };
  }, []);

  if (points.length === 0) return null;

  return (
    <section className="bg-white border-b border-vedic-gold/15">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-6">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          {points.map((point) => {
            const Icon = TRUST_ICON[point.id] ?? ShieldCheck;
            return (
              <div key={point.id} className="flex items-center gap-2.5 justify-center sm:justify-start">
                <span className="w-9 h-9 rounded-full bg-vedic-card flex items-center justify-center shrink-0">
                  <Icon className="w-4 h-4 text-vedic-goldDark" strokeWidth={1.5} />
                </span>
                <span className="text-[12px] sm:text-sm font-bold text-vedic-dark leading-tight">
                  {point.title}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
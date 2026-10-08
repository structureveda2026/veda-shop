import React, { useEffect, useState } from 'react';
import { Compass, Flame, ShieldCheck, Users, type LucideIcon } from 'lucide-react';
import { getYantraTrustPoints, type YantraTrustPoint } from '../services/yantraContentService';

const TRUST_ICON: Record<string, LucideIcon> = {
  geometry: Compass,
  material: ShieldCheck,
  energization: Flame,
  support: Users
};

/** Section 2: Trust bar — 4 points directly under the hero. */
export const YantraTrustBar: React.FC = () => {
  const [points, setPoints] = useState<YantraTrustPoint[]>([]);

  useEffect(() => {
    let isMounted = true;
    getYantraTrustPoints().then((r) => {
      if (isMounted) setPoints(r);
    });
    return () => {
      isMounted = false;
    };
  }, []);

  if (points.length === 0) return null;

  return (
    <section className="bg-white border-y border-vedic-gold/15">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-6">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          {points.map((point) => {
            const Icon = TRUST_ICON[point.id] ?? ShieldCheck;
            return (
              <div key={point.id} className="flex items-center gap-2.5 justify-center sm:justify-start">
                <span className="w-9 h-9 rounded-full bg-vedic-card flex items-center justify-center shrink-0">
                  <Icon className="w-4 h-4 text-vedic-goldDeep" strokeWidth={1.5} />
                </span>
                <span className="text-[12px] sm:text-sm font-bold text-vedic-dark leading-tight">{point.title}</span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
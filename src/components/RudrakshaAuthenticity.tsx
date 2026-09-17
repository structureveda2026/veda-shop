import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Award,
  ArrowRight,
  FileCheck,
  MapPin,
  Package,
  ShieldCheck,
  Users
} from 'lucide-react';
import { getRudrakshaTrustPoints, TrustPoint } from '../services/rudrakshaContentService';

const TRUST_ICONS: Record<string, React.ElementType> = {
  authenticity: ShieldCheck,
  'quality-check': Award,
  origin: MapPin,
  certification: FileCheck,
  'expert-guidance': Users,
  'secure-packaging': Package
};

/**
 * Sections 13 + 14 merged (spec): the trust-point grid ("How Do You Know Your Rudraksha Is
 * Authentic?") and the Authenticity Guide teaser sit together here since they're the same
 * message — trust signals, then where to read the full verification standards. Both CTAs link
 * to real, already-built pages (/authenticity, /guides/rudraksha) rather than duplicating that
 * content on the landing page itself.
 */
export const RudrakshaAuthenticity: React.FC = () => {
  const [points, setPoints] = useState<TrustPoint[]>([]);

  useEffect(() => {
    let isMounted = true;
    getRudrakshaTrustPoints().then((result) => {
      if (isMounted) setPoints(result);
    });
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <section id="rudraksha-authenticity" className="bg-vedic-ivory">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-10">
          <p className="text-[11px] sm:text-xs font-bold tracking-[0.15em] text-vedic-goldDark uppercase mb-2">
            Authenticity
          </p>
          <h2 className="font-serif font-semibold text-vedic-dark text-2xl sm:text-3xl mb-3">
            How Do You Know Your Rudraksha Is Authentic?
          </h2>
          <p className="text-sm text-vedic-muted">
            Authenticity is the single biggest concern when buying Rudraksha — here's what we
            check before a bead ever reaches you.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 mb-10">
          {(points.length > 0
            ? points
            : Array.from({ length: 6 }, (_, i) => ({ id: `skeleton-${i}`, title: '', description: '' }))
          ).map((point) => {
            const Icon = TRUST_ICONS[point.id] ?? ShieldCheck;
            return (
              <div
                key={point.id}
                className="bg-white border border-vedic-gold/15 rounded-2xl p-5 flex flex-col gap-2.5 shadow-card"
              >
                <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-vedic-card">
                  <Icon className="w-[18px] h-[18px] text-vedic-goldDark" strokeWidth={1.5} />
                </span>
                {point.title ? (
                  <>
                    <h3 className="font-serif font-bold text-vedic-dark text-sm sm:text-base leading-snug">
                      {point.title}
                    </h3>
                    <p className="text-xs text-vedic-muted leading-relaxed">{point.description}</p>
                  </>
                ) : (
                  <div className="space-y-2 animate-pulse">
                    <div className="h-3 w-2/3 bg-vedic-card rounded" />
                    <div className="h-2.5 w-full bg-vedic-card rounded" />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Guide teaser banner */}
        <div className="bg-white border border-vedic-gold/20 rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-card">
          <div className="text-center sm:text-left">
            <h3 className="font-serif font-bold text-vedic-dark text-lg sm:text-xl mb-1.5">
              How to Identify an Original Rudraksha?
            </h3>
            <p className="text-sm text-vedic-muted max-w-xl">
              Mukhi identification, surface texture, natural holes, and what a lab certificate
              actually confirms — our complete guide walks through all of it.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 shrink-0">
            <Link
              to="/guides/rudraksha"
              className="inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-full bg-vedic-dark text-vedic-gold text-sm font-semibold hover:bg-vedic-maroon hover:text-white transition-colors whitespace-nowrap"
            >
              Read Complete Guide
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <Link
              to="/authenticity"
              className="inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-full border border-vedic-gold/30 text-vedic-goldDark text-sm font-semibold hover:bg-vedic-gold/10 transition-colors whitespace-nowrap"
            >
              Certification Standards
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};
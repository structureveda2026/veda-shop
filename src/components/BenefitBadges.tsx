import React from 'react';
import {
  BookOpen, Coins, Crown, Flame, Heart, HeartPulse, Leaf, Lightbulb,
  MessageCircle, Moon, Scale, ShieldCheck, Sparkle, TrendingUp, type LucideIcon,
} from 'lucide-react';

type IconComponent = LucideIcon | React.FC<{ className?: string }>;

/** Custom line-art icons for themes none of lucide's stock icons render well at badge size —
 *  drawn in the same stroke style as the lucide set (24x24, 1.5 stroke, round caps) so they sit
 *  in the same family, but with imagery that actually fits a Vedic/spiritual product. */
const Mandala: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="12" r="9" />
    <circle cx="12" cy="12" r="5" />
    <circle cx="12" cy="12" r="1.3" fill="currentColor" stroke="none" />
    <path d="M12 3v2.2M12 18.8V21M21 12h-2.2M5.2 12H3M18.1 5.9l-1.6 1.6M7.5 16.5l-1.6 1.6M18.1 18.1l-1.6-1.6M7.5 7.5 5.9 5.9" />
  </svg>
);

const ThirdEye: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M3 13c2.5-4 6-6 9-6s6.5 2 9 6c-2.5 4-6 6-9 6s-6.5-2-9-6Z" />
    <circle cx="12" cy="13" r="2.6" />
    <circle cx="12" cy="4.3" r="1" fill="currentColor" stroke="none" />
  </svg>
);

const FocusRing: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="12" r="6.5" />
    <circle cx="12" cy="12" r="1" fill="currentColor" stroke="none" />
    <path d="M12 2v3M12 19v3M22 12h-3M5 12H2" />
  </svg>
);

/**
 * Benefit → icon. The benefits come as plain text per product (from the product data / backend), so the
 * icon is picked from the words in each one; the first matching rule wins, anything else gets a sparkle.
 */
const ICON_RULES: [RegExp, IconComponent][] = [
  [/sleep/i, Moon],
  [/relation|marital|love|harmony|bliss|emotional|heart/i, Heart],
  [/communicat|speech|eloquen|express|understanding/i, MessageCircle],
  [/creativ|innovat/i, Lightbulb],
  [/intuition/i, ThirdEye],
  [/knowledge|wisdom|education|academic|learn/i, BookOpen],
  [/focus|willpower|discipline|concentrat|clarity|mental|intellect|intelligen|decision|wit\b/i, FocusRing],
  [/stress|anxiety|calm|peace|composure|relax|soothe/i, Leaf],
  [/health|well-?being|immunity|stamina/i, HeartPulse],
  [/wealth|prosper|financ|money|abundance|fortune|business/i, Coins],
  [/success|career|progress|breakthrough|recognition/i, TrendingUp],
  [/leader|authority|charisma/i, Crown],
  [/confiden|courage|brave|strength|power|drive|passion|fire|vital/i, Flame],
  [/protect|shield|negativ|obstacle|remov|destroy|hurdle|ward|defen|dosha|malefic|deflect|overcom/i, ShieldCheck],
  [/spiritual|meditat|divine|inner|chakra|conscious/i, Mandala],
  [/balanc|stab|secur|ground|planet/i, Scale],
];

const iconFor = (benefit: string): IconComponent => ICON_RULES.find(([rule]) => rule.test(benefit))?.[1] ?? Sparkle;

export const BenefitBadges: React.FC<{ benefits: string[] }> = ({ benefits }) => {
  if (benefits.length === 0) return null;
  return (
    <div className="space-y-3">
      <h4 className="text-xs font-bold text-vedic-dark uppercase tracking-wider">Benefits</h4>
      <div className="grid grid-cols-3 sm:grid-cols-5 gap-x-2 gap-y-4">
        {benefits.map((benefit) => {
          const Icon = iconFor(benefit);
          return (
            <div key={benefit} className="flex flex-col items-center text-center gap-1.5">
              <span className="w-12 h-12 rounded-full bg-vedic-gold/15 border border-vedic-gold/40 shadow-sm flex items-center justify-center text-vedic-maroon">
                <Icon className="w-5 h-5" />
              </span>
              <span className="text-[11px] font-semibold leading-tight text-vedic-dark line-clamp-3">{benefit}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
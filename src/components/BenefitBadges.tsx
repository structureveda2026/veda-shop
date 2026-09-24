import React from 'react';
import {
  BookOpen, Brain, Coins, Crown, Eye, Flame, Flower2, Heart, HeartPulse, Leaf, Lightbulb,
  MessageCircle, Moon, Scale, ShieldCheck, Sparkles, TrendingUp, type LucideIcon,
} from 'lucide-react';

/**
 * Benefit → icon. The benefits come as plain text per product (from the product data / backend), so the
 * icon is picked from the words in each one; the first matching rule wins, anything else gets a sparkle.
 */
const ICON_RULES: [RegExp, LucideIcon][] = [
  [/sleep/i, Moon],
  [/relation|marital|love|harmony|bliss|emotional|heart/i, Heart],
  [/communicat|speech|eloquen|express|understanding/i, MessageCircle],
  [/creativ|innovat/i, Lightbulb],
  [/intuition/i, Eye],
  [/knowledge|wisdom|education|academic|learn/i, BookOpen],
  [/focus|willpower|discipline|concentrat|clarity|mental|intellect|intelligen|decision|wit\b/i, Brain],
  [/stress|anxiety|calm|peace|composure|relax|soothe/i, Leaf],
  [/health|well-?being|immunity|stamina/i, HeartPulse],
  [/wealth|prosper|financ|money|abundance|fortune|business/i, Coins],
  [/success|career|progress|breakthrough|recognition/i, TrendingUp],
  [/leader|authority|charisma/i, Crown],
  [/confiden|courage|brave|strength|power|drive|passion|fire|vital/i, Flame],
  [/protect|shield|negativ|obstacle|remov|destroy|hurdle|ward|defen|dosha|malefic|deflect|overcom/i, ShieldCheck],
  [/spiritual|meditat|divine|inner|chakra|conscious/i, Flower2],
  [/balanc|stab|secur|ground|planet/i, Scale],
];

const iconFor = (benefit: string): LucideIcon => ICON_RULES.find(([rule]) => rule.test(benefit))?.[1] ?? Sparkles;

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
              <span className="w-12 h-12 rounded-full bg-vedic-gold/15 border border-vedic-gold/40 flex items-center justify-center text-vedic-maroon">
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
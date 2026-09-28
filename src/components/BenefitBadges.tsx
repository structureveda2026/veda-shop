import React from 'react';
import {
  AwardFill, BookFill, Bullseye, CashCoin, ChatDotsFill, EyeFill, Fire, Flower1,
  GraphUpArrow, HeartFill, HeartPulseFill, LightbulbFill, MoonStarsFill, PeaceFill,
  ShieldFillCheck, Stars, YinYang, type Icon,
} from 'react-bootstrap-icons';

/**
 * Benefit → icon. Bootstrap Icons (filled) are used instead of thin-line icons so each one reads
 * clearly at badge size and actually looks like the thing it represents (a real peace symbol for
 * "peace", a real flower for "spiritual", etc.) rather than an abstract line glyph. The benefits
 * come as plain text per product (from the product data / backend), so the icon is picked from the
 * words in each one; the first matching rule wins, anything else gets a sparkle.
 */
const ICON_RULES: [RegExp, Icon][] = [
  [/sleep/i, MoonStarsFill],
  [/relation|marital|love|harmony|bliss|emotional|heart/i, HeartFill],
  [/communicat|speech|eloquen|express|understanding/i, ChatDotsFill],
  [/creativ|innovat/i, LightbulbFill],
  [/intuition/i, EyeFill],
  [/knowledge|wisdom|education|academic|learn/i, BookFill],
  [/focus|willpower|discipline|concentrat|clarity|mental|intellect|intelligen|decision|wit\b/i, Bullseye],
  [/stress|anxiety|calm|peace|composure|relax|soothe/i, PeaceFill],
  [/health|well-?being|immunity|stamina/i, HeartPulseFill],
  [/wealth|prosper|financ|money|abundance|fortune|business/i, CashCoin],
  [/success|career|progress|breakthrough|recognition/i, GraphUpArrow],
  [/leader|authority|charisma/i, AwardFill],
  [/confiden|courage|brave|strength|power|drive|passion|fire|vital/i, Fire],
  [/protect|shield|negativ|obstacle|remov|destroy|hurdle|ward|defen|dosha|malefic|deflect|overcom/i, ShieldFillCheck],
  [/spiritual|meditat|divine|inner|chakra|conscious/i, Flower1],
  [/balanc|stab|secur|ground|planet/i, YinYang],
];

const iconFor = (benefit: string): Icon => ICON_RULES.find(([rule]) => rule.test(benefit))?.[1] ?? Stars;

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
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

export interface PujaKitSectionHeadingProps {
  eyebrow: string;
  title: string;
  subtitle?: string;
  align?: 'left' | 'center';
  /** Optional "View all" link shown on the right (desktop) — mobile pages put their own link below the grid. */
  action?: { label: string; to: string };
}

/** Shared eyebrow + serif title (+ subtitle) block used by every /puja-kits section, so spacing and type stay identical. */
export const PujaKitSectionHeading: React.FC<PujaKitSectionHeadingProps> = ({
  eyebrow,
  title,
  subtitle,
  align = 'left',
  action
}) => {
  const centered = align === 'center';
  return (
    <div className={`flex items-end gap-4 mb-6 sm:mb-8 ${centered ? 'justify-center text-center' : 'justify-between'}`}>
      <div className={centered ? 'max-w-2xl mx-auto' : ''}>
        <p className="text-[11px] sm:text-xs font-bold tracking-[0.15em] text-vedic-goldDeep uppercase mb-2">{eyebrow}</p>
        <h2 className="font-serif font-semibold text-vedic-dark text-2xl sm:text-3xl leading-tight">{title}</h2>
        {subtitle && <p className="text-sm text-vedic-muted mt-2 max-w-xl leading-relaxed">{subtitle}</p>}
      </div>
      {action && !centered && (
        <Link
          to={action.to}
          className="hidden sm:inline-flex items-center gap-1.5 text-sm font-semibold text-vedic-goldDeep hover:text-vedic-maroon transition-colors whitespace-nowrap shrink-0"
        >
          {action.label}
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      )}
    </div>
  );
};
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

/**
 * The one CTA component for the home page — keeps button wording/styling consistent (spec §33):
 *  primary   → dark  ("Shop Now")            secondary → outline ("Explore")
 *  tertiary  → text link with arrow ("Learn More →")
 *  gold      → the important CTA ("Find My Product")
 *  light / outline-light → for dark bands
 *
 * `href` can be an internal route, an in-page anchor ("#shop-by-purpose", scrolls smoothly),
 * or an external URL (opens in a new tab). Without `href` it renders a <button>.
 */
type Variant = 'primary' | 'secondary' | 'tertiary' | 'gold' | 'light' | 'outline-light';

interface HomeCtaProps {
  href?: string;
  variant?: Variant;
  children: React.ReactNode;
  onClick?: () => void;
  /** Add a trailing arrow (tertiary always has one). */
  arrow?: boolean;
  className?: string;
}

const BASE =
  'inline-flex items-center justify-center gap-2 text-sm font-medium tracking-wide transition-colors duration-200 ' +
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-vedic-gold focus-visible:ring-offset-2';

const PILL = 'px-7 py-3.5 rounded-full';

const VARIANTS: Record<Variant, string> = {
  primary: `${PILL} bg-vedic-charcoal text-white hover:bg-vedic-dark focus-visible:ring-offset-vedic-ivory`,
  secondary: `${PILL} border border-vedic-charcoal/30 text-vedic-charcoal hover:border-vedic-charcoal hover:bg-white focus-visible:ring-offset-vedic-ivory`,
  gold: `${PILL} bg-vedic-gold text-vedic-dark font-semibold hover:bg-vedic-primary focus-visible:ring-offset-vedic-ivory`,
  light: `${PILL} bg-white text-vedic-dark hover:bg-vedic-ivory focus-visible:ring-offset-vedic-dark`,
  'outline-light': `${PILL} border border-white/40 text-white hover:bg-white/10 focus-visible:ring-offset-vedic-dark`,
  tertiary: 'group text-vedic-charcoal hover:text-vedic-goldDeep focus-visible:ring-offset-vedic-ivory rounded-sm',
};

/** Renders the right kind of anchor for an internal route, an in-page "#anchor", or an external URL. */
export const HomeLink: React.FC<{
  href: string;
  className?: string;
  onClick?: () => void;
  children: React.ReactNode;
  ariaLabel?: string;
}> = ({ href, className, onClick, children, ariaLabel }) => {
  if (href.startsWith('#')) {
    const scrollToTarget = (e: React.MouseEvent) => {
      e.preventDefault();
      document.getElementById(href.slice(1))?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      onClick?.();
    };
    return (
      <a href={href} onClick={scrollToTarget} className={className} aria-label={ariaLabel}>
        {children}
      </a>
    );
  }

  if (href.startsWith('http://') || href.startsWith('https://')) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" onClick={onClick} className={className} aria-label={ariaLabel}>
        {children}
      </a>
    );
  }

  return (
    <Link to={href} onClick={onClick} className={className} aria-label={ariaLabel}>
      {children}
    </Link>
  );
};

export const HomeCta: React.FC<HomeCtaProps> = ({ href, variant = 'primary', children, onClick, arrow, className = '' }) => {
  const classes = `${BASE} ${VARIANTS[variant]} ${className} group`;
  const showArrow = arrow || variant === 'tertiary';
  const content = (
    <>
      <span>{children}</span>
      {showArrow && <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5" aria-hidden="true" />}
    </>
  );

  if (!href) {
    return (
      <button type="button" onClick={onClick} className={classes}>
        {content}
      </button>
    );
  }

  return (
    <HomeLink href={href} onClick={onClick} className={classes}>
      {content}
    </HomeLink>
  );
};
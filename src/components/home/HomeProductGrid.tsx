import React from 'react';
import { HomeSection, SectionHeader } from './HomeSection';
import { HomeCta } from './HomeCta';
import { HomeProductCard } from './HomeProductCard';
import type { Product } from '../../types/ecommerce';
import type { SectionContent } from '../../services/homeService';

const SkeletonCard: React.FC = () => (
  <div className="rounded-2xl border border-black/5 bg-white overflow-hidden animate-pulse" aria-hidden="true">
    <div className="aspect-square bg-vedic-sand" />
    <div className="p-5 space-y-3">
      <div className="h-4 w-4/5 rounded bg-vedic-sand" />
      <div className="h-3 w-1/3 rounded bg-vedic-sand" />
      <div className="h-10 rounded-full bg-vedic-sand" />
    </div>
  </div>
);

/** "Most Loved" — up to 8 products from the store's bestselling collection (Rudraksha + Bracelets today). */
export const HomeProductGrid: React.FC<{ content: SectionContent; products: Product[]; loading: boolean }> = ({ content, products, loading }) => {
  if (!loading && products.length === 0) return null;

  return (
    <HomeSection id="most-loved" tone="white">
      <SectionHeader
        eyebrow={content.eyebrow}
        title={content.title}
        description={content.description}
        align="left"
        action={
          content.ctaLabel && content.ctaHref ? (
            <HomeCta href={content.ctaHref} variant="tertiary" className="hidden sm:inline-flex">{content.ctaLabel}</HomeCta>
          ) : undefined
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
        {products.length > 0
          ? products.map((product) => <HomeProductCard key={product.id} product={product} hideBadges={['Bestseller']} />)
          : Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
      </div>

      {content.ctaLabel && content.ctaHref && (
        <div className="mt-8 text-center sm:hidden">
          <HomeCta href={content.ctaHref} variant="secondary">{content.ctaLabel}</HomeCta>
        </div>
      )}
    </HomeSection>
  );
};
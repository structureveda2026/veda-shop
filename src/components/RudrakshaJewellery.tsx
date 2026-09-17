import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Gem } from 'lucide-react';
import {
  getRudrakshaJewelleryTypes,
  getFeaturedRudrakshaJewelleryProduct,
  RudrakshaTypeTile
} from '../services/rudrakshaJewelleryService';
import { Product } from '../types/ecommerce';
import { ProductCard } from './ProductCard';

const TILE_SKELETON_COUNT = 5;

/**
 * Section 12 (spec): Rudraksha Jewellery — "Wear Rudraksha Your Way". Kept as its own section
 * (not merged with the Mala Collection above), matching the spec's own separation. A "shop by
 * type" grid, same reasoning as RudrakshaMala.tsx, plus one real featured product (Rudraksha
 * Kavach) wherever the catalog actually has one — this fills in with more real product cards
 * automatically as an admin publishes Bracelet/Pendant SKUs under these collections in Shopify.
 */
export const RudrakshaJewellery: React.FC = () => {
  const [types, setTypes] = useState<RudrakshaTypeTile[]>([]);
  const [featuredProduct, setFeaturedProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    Promise.all([getRudrakshaJewelleryTypes(), getFeaturedRudrakshaJewelleryProduct()]).then(
      ([typeResult, featured]) => {
        if (!isMounted) return;
        setTypes(typeResult);
        setFeaturedProduct(featured);
        setIsLoading(false);
      }
    );
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <section id="rudraksha-jewellery" className="bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="flex items-end justify-between gap-4 mb-6 sm:mb-8">
          <div>
            <p className="text-[11px] sm:text-xs font-bold tracking-[0.15em] text-vedic-goldDark uppercase mb-2">
              Rudraksha Jewellery
            </p>
            <h2 className="font-serif font-semibold text-vedic-dark text-2xl sm:text-3xl mb-2">
              Wear Rudraksha Your Way
            </h2>
            <p className="text-sm text-vedic-muted max-w-xl">
              Bracelets, pendants and protective Kavach settings for everyday wear.
            </p>
          </div>
          <Link
            to="/collections/bracelets"
            className="hidden sm:inline-flex items-center gap-1.5 text-sm font-semibold text-vedic-goldDark hover:text-vedic-maroon transition-colors whitespace-nowrap shrink-0"
          >
            Shop Rudraksha Jewellery
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          {/* Type grid */}
          <div className="lg:col-span-2">
            {isLoading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
                {Array.from({ length: TILE_SKELETON_COUNT }).map((_, i) => (
                  <div key={i} className="rounded-2xl border border-vedic-gold/10 bg-vedic-ivory p-5 animate-pulse h-28" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
                {types.map((type) => (
                  <Link
                    key={type.id}
                    to={type.href}
                    className="group bg-vedic-ivory border border-vedic-gold/15 hover:border-vedic-gold/40 rounded-2xl p-5 flex flex-col gap-2.5 transition-all duration-300 hover:-translate-y-1 hover:shadow-card-hover"
                  >
                    <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-white group-hover:bg-vedic-gold/20 transition-colors">
                      <Gem className="w-4 h-4 text-vedic-goldDark" strokeWidth={1.5} />
                    </span>
                    <h3 className="font-serif font-bold text-vedic-dark text-sm sm:text-base leading-snug">
                      {type.label}
                    </h3>
                    <p className="text-xs text-vedic-muted leading-relaxed line-clamp-2">{type.description}</p>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Featured real product, when the catalog has one */}
          {!isLoading && featuredProduct && (
            <div className="lg:col-span-1">
              <p className="text-[11px] font-semibold text-vedic-goldDark uppercase tracking-wide mb-2.5">
                Featured
              </p>
              <ProductCard product={featuredProduct} />
            </div>
          )}
        </div>

        <div className="mt-6 text-center sm:hidden">
          <Link
            to="/collections/bracelets"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-vedic-goldDark hover:text-vedic-maroon transition-colors"
          >
            Shop Rudraksha Jewellery
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </section>
  );
};
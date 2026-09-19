import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Star, Heart, Eye, ShieldCheck, MapPin, Award } from 'lucide-react';
import { Product } from '../types/ecommerce';
import { useWishlist } from '../context/WishlistContext';
import { useUnit } from '../context/UnitContext';
import { QuickViewModal } from './QuickViewModal';
import { AddToCartControl } from './AddToCartControl';

interface ProductCardProps {
  product: Product;
  showPrice?: boolean;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, showPrice = true }) => {
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { formatWeight } = useUnit();

  const isLiked = isInWishlist(product.id);
  const secondaryImage = product.images[1] || product.images[0];

  return (
    <>
      <div
        className="group relative bg-white rounded-2xl border border-vedic-gold/20 overflow-hidden shadow-card hover:shadow-card-hover transition-all duration-300 flex flex-col h-full"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Badges Overlay */}
        <div className="absolute top-2.5 left-2.5 z-10 flex flex-col gap-1">
          {product.discount > 0 && (
            <span className="bg-vedic-maroon text-vedic-goldLight text-[10px] font-bold px-2 py-0.5 rounded-full shadow-md">
              {product.discount}% OFF
            </span>
          )}
          {product.qualityTier === 'Collector' && (
            <span className="bg-amber-500 text-black text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full shadow-md">
              👑 Collector
            </span>
          )}
          {product.certificationLab && (
            <span className="bg-emerald-800 text-white text-[9px] font-semibold px-2 py-0.5 rounded-full shadow-md flex items-center gap-1">
              <Award className="w-2.5 h-2.5" /> Lab: {product.certificationLab}
            </span>
          )}
        </div>

        {/* Wishlist Button */}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleWishlist(product);
          }}
          className={`absolute top-2.5 right-2.5 z-10 p-2 rounded-full backdrop-blur-md transition-all ${
            isLiked
              ? 'bg-red-50 text-red-600 shadow-md'
              : 'bg-white/80 text-gray-400 hover:text-red-500 hover:bg-white'
          }`}
          title={isLiked ? 'Remove from Wishlist' : 'Add to Wishlist'}
        >
          <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
        </button>

        {/* Image Container */}
        <Link to={`/products/${product.slug}`} className="relative aspect-square overflow-hidden block bg-vedic-ivory">
          <img
            src={isHovered ? secondaryImage : product.images[0]}
            alt={product.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />

          {/* Origin & Weight Tag */}
          <div className="absolute bottom-2.5 left-2.5 z-10 flex items-center gap-1.5 pointer-events-none">
            {product.carat && (
              <span className="bg-black/80 backdrop-blur-md text-vedic-gold text-[10px] font-serif font-bold px-2 py-0.5 rounded-full border border-vedic-gold/30">
                {formatWeight(product.carat)}
              </span>
            )}
            {product.origin && (
              <span className="bg-black/60 backdrop-blur-md text-white text-[9px] font-semibold px-2 py-0.5 rounded-full border border-white/20 flex items-center gap-0.5">
                <MapPin className="w-2.5 h-2.5 text-vedic-gold" /> {product.origin}
              </span>
            )}
          </div>

          {/* Quick Actions Hover Bar */}
          <div className="absolute inset-x-2 bottom-2 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center gap-2">
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsQuickViewOpen(true);
              }}
              className="flex-1 bg-white/90 backdrop-blur-sm text-vedic-dark text-xs font-semibold py-2 rounded-xl hover:bg-vedic-maroon hover:text-white transition-colors shadow-md flex items-center justify-center gap-1"
            >
              <Eye className="w-3.5 h-3.5" /> Quick View
            </button>
          </div>
        </Link>

        {/* Content Body */}
        <div className="p-3.5 flex flex-col flex-1 justify-between bg-white">
          <div>
            <div className="flex items-center gap-1 mb-1">
              <div className="flex text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-3 h-3 ${
                      i < Math.floor(product.rating) ? 'fill-current' : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <span className="text-[10px] text-vedic-muted font-medium">
                ({product.reviewCount})
              </span>
            </div>

            <Link to={`/products/${product.slug}`}>
              <h3 className="text-xs md:text-sm font-bold text-vedic-dark hover:text-vedic-maroon transition-colors line-clamp-2 leading-snug">
                {product.title}
              </h3>
            </Link>

            {showPrice && product.pricePerCarat && (
              <span className="text-[10px] text-stone-500 block mt-0.5 font-medium">
                ₹{product.pricePerCarat.toLocaleString('en-IN')} / ct
              </span>
            )}
          </div>

          {showPrice ? (
            <div className="mt-3 pt-2 border-t border-vedic-beige flex items-center justify-between flex-wrap gap-2">
              <div>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-sm md:text-base font-extrabold text-vedic-maroon">
                    ₹{product.price.toLocaleString('en-IN')}
                  </span>
                  {product.compareAtPrice > product.price && (
                    <span className="text-[11px] text-vedic-muted line-through">
                      ₹{product.compareAtPrice.toLocaleString('en-IN')}
                    </span>
                  )}
                </div>
              </div>

              <AddToCartControl product={product} disabled={product.stock === 0} />
            </div>
          ) : (
            <div className="mt-3 pt-2 border-t border-vedic-beige text-center">
              <Link
                to={`/products/${product.slug}`}
                className="w-full bg-vedic-gold/20 hover:bg-vedic-gold text-vedic-dark font-bold text-xs py-2 px-3 rounded-xl transition-colors block"
              >
                Explore Product →
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Quick View Modal */}
      {isQuickViewOpen && (
        <QuickViewModal
          product={product}
          onClose={() => setIsQuickViewOpen(false)}
        />
      )}
    </>
  );
};
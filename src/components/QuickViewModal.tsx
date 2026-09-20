import React, { useState } from 'react';
import { X, Star, ShieldCheck, Heart } from 'lucide-react';
import { Product } from '../types/ecommerce';
import { useWishlist } from '../context/WishlistContext';
import { Link } from 'react-router-dom';
import { AddToCartControl } from './AddToCartControl';

interface QuickViewModalProps {
  product: Product;
  onClose: () => void;
}

export const QuickViewModal: React.FC<QuickViewModalProps> = ({ product, onClose }) => {
  const [selectedImage, setSelectedImage] = useState(product.images[0]);
  const [selectedSize, setSelectedSize] = useState(product.sizes ? product.sizes[0] : undefined);

  const { toggleWishlist, isInWishlist } = useWishlist();

  const isLiked = isInWishlist(product.id);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/65 backdrop-blur-sm" onClick={onClose} />

      {/* Modal Container */}
      <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl overflow-hidden z-10 grid grid-cols-1 md:grid-cols-2 border border-vedic-gold/30 max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-20 p-2 rounded-full bg-white/80 hover:bg-vedic-maroon hover:text-white transition-colors shadow-md"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Left Column: Image Gallery */}
        <div className="p-4 bg-vedic-ivory flex flex-col justify-between">
          <div className="aspect-square rounded-2xl overflow-hidden border border-vedic-gold/20 mb-3 bg-white">
            <img
              src={selectedImage}
              alt={product.title}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
            {product.images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedImage(img)}
                className={`w-14 h-14 rounded-xl overflow-hidden border-2 shrink-0 transition-all ${
                  selectedImage === img ? 'border-vedic-gold scale-95 shadow-md' : 'border-transparent opacity-70'
                }`}
              >
                <img src={img} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* Right Column: Details & Actions */}
        <div className="p-6 flex flex-col justify-between bg-white space-y-4">
          <div>
            {product.labCertified && (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 mb-2">
                <ShieldCheck className="w-3.5 h-3.5" /> 100% Lab Certified Authentic
              </span>
            )}

            <h3 className="font-serif font-bold text-lg text-vedic-dark leading-snug">
              {product.title}
            </h3>

            <div className="flex items-center gap-2 mt-2">
              <div className="flex text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < Math.floor(product.rating) ? 'fill-current' : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <span className="text-xs font-semibold text-vedic-dark">{product.rating}</span>
              <span className="text-xs text-vedic-muted">({product.reviewCount} customer reviews)</span>
            </div>

            <div className="flex items-baseline gap-2 mt-3">
              <span className="text-2xl font-extrabold text-vedic-maroon">
                ₹{product.price.toLocaleString('en-IN')}
              </span>
              {product.compareAtPrice > product.price && (
                <>
                  <span className="text-sm text-vedic-muted line-through">
                    ₹{product.compareAtPrice.toLocaleString('en-IN')}
                  </span>
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                    {product.discount}% OFF
                  </span>
                </>
              )}
            </div>

            <p className="text-xs text-vedic-muted mt-3 leading-relaxed">
              {product.shortDescription}
            </p>

            {/* Sizes / Options if present */}
            {product.sizes && (
              <div className="mt-4">
                <label className="block text-xs font-bold text-vedic-dark mb-1">
                  Select Size / Fitting:
                </label>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((sz) => (
                    <button
                      key={sz}
                      onClick={() => setSelectedSize(sz)}
                      className={`px-3 py-1 text-xs rounded-lg border font-medium transition-all ${
                        selectedSize === sz
                          ? 'border-vedic-maroon bg-vedic-maroon text-white font-bold'
                          : 'border-vedic-gold/30 bg-white text-vedic-dark hover:border-vedic-gold'
                      }`}
                    >
                      {sz}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="space-y-3 pt-4 border-t border-vedic-beige">
            <div className="flex items-center gap-3">
              <AddToCartControl
                product={product}
                size="cta"
                appearance="solid"
                label="Add to Cart"
                // Only a real choice (2+ sizes) makes a separate cart line — same as the product cards.
                selectedSize={product.sizes && product.sizes.length > 1 ? selectedSize : undefined}
                className="flex-1"
                buttonClassName="py-3 gap-2"
              />

              <button
                onClick={() => toggleWishlist(product)}
                className={`p-3 rounded-xl border transition-colors ${
                  isLiked ? 'bg-red-50 border-red-200 text-red-600' : 'border-vedic-gold/30 text-gray-400 hover:text-red-500'
                }`}
              >
                <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
              </button>
            </div>

            <Link
              to={`/products/${product.slug}`}
              onClick={onClose}
              className="block text-center text-xs font-bold text-vedic-goldDark hover:underline"
            >
              View Full Product Specifications & Lab Report →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
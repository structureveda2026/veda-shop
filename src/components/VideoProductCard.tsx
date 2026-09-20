import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Play, Volume2, VolumeX, Sparkles } from 'lucide-react';
import { Product } from '../types/ecommerce';
import { AddToCartControl } from './AddToCartControl';

interface VideoProductCardProps {
  product: Product;
  videoUrl?: string;
}

export const VideoProductCard: React.FC<VideoProductCardProps> = ({ product }) => {
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);

  return (
    <div className="relative aspect-[9/16] rounded-3xl overflow-hidden bg-vedic-dark shadow-xl border-2 border-vedic-gold/30 group">
      {/* Background Image / Video representation */}
      <img
        src={product.images[0]}
        alt={product.title}
        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
      />

      {/* Dark overlay gradients */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-black/20" />

      {/* Top Bar: Reels Icon & Mute Toggle */}
      <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10">
        <span className="flex items-center gap-1.5 bg-black/50 backdrop-blur-md text-vedic-gold text-[10px] font-bold px-3 py-1 rounded-full border border-vedic-gold/40">
          <Sparkles className="w-3 h-3 text-vedic-gold animate-spin" /> Reel Showcase
        </span>
        <button
          onClick={() => setIsMuted(!isMuted)}
          className="p-2 rounded-full bg-black/50 backdrop-blur-md text-white hover:text-vedic-gold transition-colors"
        >
          {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
        </button>
      </div>

      {/* Center Play Button Overlay */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-12 h-12 rounded-full bg-vedic-gold/20 backdrop-blur-md border border-vedic-gold flex items-center justify-center text-vedic-gold group-hover:scale-110 transition-transform">
          <Play className="w-6 h-6 fill-current ml-0.5" />
        </div>
      </div>

      {/* Bottom Product Details Card Overlay */}
      <div className="absolute bottom-3 inset-x-3 bg-white/95 backdrop-blur-md rounded-2xl p-3 border border-vedic-gold/30 shadow-lg z-10">
        <Link to={`/products/${product.slug}`} className="block">
          <h4 className="text-xs font-bold text-vedic-dark truncate hover:text-vedic-maroon">
            {product.title}
          </h4>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-sm font-extrabold text-vedic-maroon">
              ₹{product.price.toLocaleString('en-IN')}
            </span>
            <span className="text-[10px] text-vedic-muted line-through">
              ₹{product.compareAtPrice.toLocaleString('en-IN')}
            </span>
            <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
              {product.discount}% OFF
            </span>
          </div>
        </Link>

        <AddToCartControl
          product={product}
          size="full"
          appearance="solid"
          label="Shop Product Now"
          className="w-full mt-2.5"
          buttonClassName="py-2 justify-center gap-1.5"
        />
      </div>
    </div>
  );
};
import React, { useState } from 'react';
import { Minus, Plus, ShoppingBag } from 'lucide-react';
import { Product } from '../types/ecommerce';
import { useCart } from '../context/CartContext';

export interface AddToCartControlProps {
  product: Product;
  disabled?: boolean;
  /** 'compact' fits tight card footers (icon-only idle state); 'full' shows "Add" label too.
   *  Both sizes use the same interaction: tap once to reveal a quantity stepper, tap "Add"
   *  again to confirm — the quantity is always picked before anything is added to cart. */
  size?: 'compact' | 'full';
  className?: string;
}

const MAX_QUICK_QUANTITY = 20;

/**
 * Two-step Add to Cart used everywhere a product card offers "Add": tapping the cart icon
 * doesn't add anything by itself — it morphs, in place, into a small quantity stepper
 * (defaulting to 1) with its own "Add" button. Only that second tap actually calls
 * addToCart(), which in turn drives the global CartAddedToast — this component never opens
 * the cart drawer itself.
 */
export const AddToCartControl: React.FC<AddToCartControlProps> = ({
  product,
  disabled = false,
  size = 'compact',
  className = ''
}) => {
  const { addToCart } = useCart();
  const [isSelecting, setIsSelecting] = useState(false);
  const [quantity, setQuantity] = useState(1);

  const openSelector = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setQuantity(1);
    setIsSelecting(true);
  };

  const closeSelector = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsSelecting(false);
  };

  const changeQuantity = (delta: number) => (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setQuantity((q) => Math.min(MAX_QUICK_QUANTITY, Math.max(1, q + delta)));
  };

  const confirmAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, quantity);
    setIsSelecting(false);
  };

  if (isSelecting) {
    return (
      <div
        className={`inline-flex items-center gap-1.5 ${className}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="inline-flex items-center bg-vedic-ivory border border-vedic-gold/30 rounded-full">
          <button
            onClick={changeQuantity(-1)}
            disabled={quantity <= 1}
            aria-label="Decrease quantity"
            className="w-7 h-7 flex items-center justify-center rounded-full text-vedic-maroon disabled:text-vedic-muted disabled:cursor-not-allowed hover:bg-vedic-gold/15 transition-colors"
          >
            <Minus className="w-3 h-3" />
          </button>
          <span
            aria-live="polite"
            aria-label={`Quantity ${quantity}`}
            className="w-5 text-center text-xs font-bold text-vedic-dark tabular-nums"
          >
            {quantity}
          </span>
          <button
            onClick={changeQuantity(1)}
            disabled={quantity >= MAX_QUICK_QUANTITY}
            aria-label="Increase quantity"
            className="w-7 h-7 flex items-center justify-center rounded-full text-vedic-maroon disabled:text-vedic-muted disabled:cursor-not-allowed hover:bg-vedic-gold/15 transition-colors"
          >
            <Plus className="w-3 h-3" />
          </button>
        </div>

        <button
          onClick={confirmAdd}
          className="bg-vedic-maroon hover:bg-vedic-dark text-vedic-ivory text-xs font-bold px-3 h-7 rounded-full transition-colors whitespace-nowrap"
        >
          Add
        </button>

        <button
          onClick={closeSelector}
          aria-label="Cancel"
          className="w-6 h-6 shrink-0 flex items-center justify-center rounded-full text-vedic-muted hover:text-vedic-maroon hover:bg-vedic-gold/10 transition-colors"
        >
          ×
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={openSelector}
      disabled={disabled}
      title={disabled ? 'Out of Stock' : 'Add to Cart'}
      className={`bg-vedic-gold/10 hover:bg-vedic-maroon text-vedic-maroon hover:text-vedic-ivory p-2 rounded-xl transition-all duration-200 border border-vedic-gold/30 hover:border-transparent flex items-center gap-1 text-xs font-bold disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-vedic-gold/10 disabled:hover:text-vedic-maroon ${className}`}
    >
      <ShoppingBag className="w-4 h-4" />
      {size === 'full' && <span>Add</span>}
      <span className={size === 'compact' ? 'hidden sm:inline' : 'hidden'}>Add</span>
    </button>
  );
};
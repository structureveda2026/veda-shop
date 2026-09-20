import React, { useEffect, useState } from 'react';
import { Trash2 } from 'lucide-react';
import { useCart } from '../context/CartContext';

/**
 * "Clear cart" — used by the cart drawer and the cart page. Two taps on purpose: the first turns the
 * button into an inline "Remove all N items?" question (it goes back on its own after a few seconds),
 * the second empties the cart. clearCart() lives in CartContext, which mirrors the now-empty cart to
 * the Shopify cart (every line is removed there too) whenever Shopify is enabled.
 */
export const ClearCartButton: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { clearCart, totalItems } = useCart();
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    if (!confirming) return;
    const t = setTimeout(() => setConfirming(false), 6000);
    return () => clearTimeout(t);
  }, [confirming]);

  if (!confirming) {
    return (
      <button
        type="button"
        onClick={() => setConfirming(true)}
        className={`inline-flex items-center gap-1.5 text-xs font-bold text-vedic-muted hover:text-red-700 transition-colors ${className}`}
      >
        <Trash2 className="w-3.5 h-3.5" />
        Clear cart
      </button>
    );
  }

  return (
    <div
      role="alertdialog"
      aria-label="Confirm clearing the cart"
      className={`inline-flex items-center gap-2 bg-red-50 border border-red-200 rounded-full pl-3 pr-1 py-1 ${className}`}
    >
      <span className="text-xs font-semibold text-red-800 whitespace-nowrap">
        Remove all {totalItems} {totalItems === 1 ? 'item' : 'items'}?
      </span>
      <button
        type="button"
        onClick={() => setConfirming(false)}
        className="text-xs font-bold text-vedic-dark hover:text-vedic-maroon px-2 py-1 rounded-full transition-colors"
      >
        Keep
      </button>
      <button
        type="button"
        onClick={() => {
          clearCart();
          setConfirming(false);
        }}
        className="text-xs font-bold text-white bg-red-600 hover:bg-red-700 px-3 py-1 rounded-full transition-colors whitespace-nowrap"
      >
        Yes, clear
      </button>
    </div>
  );
};
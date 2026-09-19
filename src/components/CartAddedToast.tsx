import React from 'react';
import { CheckCircle2, X } from 'lucide-react';
import { useCart } from '../context/CartContext';

/**
 * Mounted once at the app root (App.tsx, alongside CartDrawer). Reads `justAdded` from
 * CartContext — every addToCart() call anywhere in the app (product cards, PDPs, quick view,
 * quiz/recommendation flows) sets that automatically, so this toast appears everywhere "Add to
 * Cart" is used with zero per-page wiring. Clicking "View Cart" opens the drawer; the toast
 * itself never opens it on its own.
 */
export const CartAddedToast: React.FC = () => {
  const { justAdded, dismissJustAdded, setIsCartOpen } = useCart();

  if (!justAdded) return null;

  const handleViewCart = () => {
    setIsCartOpen(true);
    dismissJustAdded();
  };

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed inset-x-0 bottom-20 md:bottom-5 z-[60] flex justify-center px-3 pointer-events-none"
    >
      <div className="pointer-events-auto flex items-center gap-2.5 sm:gap-3 bg-vedic-dark text-vedic-ivory rounded-full shadow-2xl border border-vedic-gold/30 pl-3.5 pr-2 py-2 sm:pl-4 sm:pr-2.5 sm:py-2.5 max-w-[calc(100vw-1.5rem)] animate-in fade-in slide-in-from-bottom-2 duration-200">
        <CheckCircle2 className="w-4 h-4 sm:w-[18px] sm:h-[18px] text-emerald-400 shrink-0" />
        <span className="text-xs sm:text-sm font-semibold whitespace-nowrap">Item Added to Cart</span>

        <button
          onClick={handleViewCart}
          className="shrink-0 inline-flex items-center gap-1 bg-vedic-gold text-vedic-dark text-xs sm:text-sm font-bold px-3 sm:px-3.5 py-1.5 rounded-full hover:bg-vedic-goldDark transition-colors whitespace-nowrap"
        >
          View Cart
        </button>

        <button
          onClick={dismissJustAdded}
          aria-label="Dismiss"
          className="shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-vedic-ivory/60 hover:text-vedic-ivory hover:bg-white/10 transition-colors"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
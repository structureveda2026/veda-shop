import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, X } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { clearPendingCheckout, readPendingCheckout } from '../lib/checkoutSession';
import { fetchCart, isShopifyEnabled } from '../lib/shopify';

/**
 * Mounted once in App.tsx. After the visitor is sent to Shopify checkout this works out what happened
 * when they come back (also on Back / tab focus), using Shopify's own cart as the evidence:
 *   cart is gone  → Shopify turned it into an order → empty the local cart and open the confirmation page
 *   cart is there → payment wasn't completed (closed, declined, failed) → keep the cart, say so
 */
export const CheckoutReturnWatcher: React.FC = () => {
  const { clearCart } = useCart();
  const navigate = useNavigate();
  const [notice, setNotice] = useState<string | null>(null);
  const checking = useRef(false);

  const check = useCallback(async () => {
    const pending = readPendingCheckout();
    if (!pending || checking.current || !isShopifyEnabled()) return;
    checking.current = true;
    try {
      const remote = await fetchCart(pending.cartId);
      clearPendingCheckout();
      if (!remote) {
        clearCart();
        navigate('/order-success', { replace: true, state: { fromCheckout: true, since: pending.startedAt } });
      } else {
        setNotice('Your payment was not completed, so no order was placed. Your cart is saved — you can try again any time.');
      }
    } catch {
      // Couldn't reach Shopify: leave the marker so the next focus / reload tries again.
    } finally {
      checking.current = false;
    }
  }, [clearCart, navigate]);

  useEffect(() => {
    void check();
    const onShow = () => void check();
    const onVisible = () => {
      if (document.visibilityState === 'visible') void check();
    };
    window.addEventListener('pageshow', onShow);
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      window.removeEventListener('pageshow', onShow);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [check]);

  if (!notice) return null;
  return (
    <div role="alert" className="fixed inset-x-0 bottom-20 md:bottom-5 z-[60] flex justify-center px-3 pointer-events-none">
      <div className="pointer-events-auto flex items-start gap-2.5 bg-vedic-dark text-vedic-ivory rounded-2xl shadow-2xl border border-vedic-gold/30 pl-3.5 pr-2 py-2.5 max-w-md">
        <AlertCircle className="w-[18px] h-[18px] text-amber-400 shrink-0 mt-0.5" />
        <span className="text-xs sm:text-sm font-semibold">{notice}</span>
        <button
          onClick={() => setNotice(null)}
          aria-label="Dismiss"
          className="shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-vedic-ivory/60 hover:text-vedic-ivory hover:bg-white/10"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
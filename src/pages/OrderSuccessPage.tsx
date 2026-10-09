import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { CheckCircle2, Sparkles, Package, ArrowLeft, Loader2 } from 'lucide-react';
import { describeReturnPath, getReturnPath } from '../lib/returnPath';
import { useAuth } from '../context/AuthContext';
import { listOrders } from '../lib/ordersApi';
import { formatMoney, PaymentBadge } from '../components/orders/OrderParts';
import type { ShopifyOrder } from '../types/orders';

// How long the confirmation stays up before the visitor is taken back to the page they ordered from
const REDIRECT_SECONDS = 20;

/**
 * Two ways in:
 *  • Shopify checkout finished (CheckoutReturnWatcher → state.fromCheckout): shows the REAL order Shopify just created.
 *  • Demo mode (no Shopify configured): the original local confirmation.
 */
export const OrderSuccessPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { shopifyAuth, isAuthenticated, authLoading } = useAuth();
  const state = (location.state || {}) as { orderId?: string; grandTotal?: number; fromCheckout?: boolean; since?: number };

  const live = Boolean(state.fromCheckout);
  const [order, setOrder] = useState<ShopifyOrder | null>(null);
  const [phase, setPhase] = useState<'loading' | 'found' | 'delayed'>(live ? 'loading' : 'found');

  // Direct visits with nothing to show go to My Orders instead of faking a receipt.
  useEffect(() => {
    if (!live && !state.orderId) navigate(shopifyAuth ? '/account/orders' : '/', { replace: true });
  }, [live, state.orderId, shopifyAuth, navigate]);

  // Shopify creates the order a moment after payment — look for it (newest order placed since checkout began).
  useEffect(() => {
    if (!live || authLoading || !isAuthenticated) return;
    let alive = true;
    (async () => {
      for (let attempt = 0; attempt < 8 && alive; attempt++) {
        try {
          const { orders } = await listOrders();
          const fresh = orders.find((o) => new Date(o.createdAt).getTime() >= (state.since ?? 0) - 5 * 60 * 1000);
          if (fresh) {
            if (alive) {
              setOrder(fresh);
              setPhase('found');
            }
            return;
          }
        } catch {
          /* try again below */
        }
        await new Promise((r) => setTimeout(r, 2500));
      }
      if (alive) setPhase('delayed');
    })();
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [live, authLoading, isAuthenticated]);

  // The page they were on before the cart / checkout (Home, Rudraksha, Bracelets…), fixed when this page opens.
  const [returnPath] = useState(getReturnPath);
  const returnLabel = describeReturnPath(returnPath);
  const [secondsLeft, setSecondsLeft] = useState<number | null>(REDIRECT_SECONDS); // null = redirect cancelled

  useEffect(() => {
    if (secondsLeft === null || phase === 'loading') return;
    if (secondsLeft <= 0) {
      navigate(returnPath, { replace: true });
      return;
    }
    const t = setTimeout(() => setSecondsLeft((s) => (s === null ? null : s - 1)), 1000);
    return () => clearTimeout(t);
  }, [secondsLeft, navigate, returnPath, phase]);

  if (!live && !state.orderId) return null;

  const orderLabel = order?.name ?? state.orderId;
  const trackTo = order ? `/account/orders/${order.id}` : live ? '/account/orders' : `/track-order?id=${state.orderId}`;

  return (
    <div className="max-w-3xl mx-auto px-4 py-12 text-center space-y-6">
      <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-lg">
        {phase === 'loading' ? <Loader2 className="w-10 h-10 animate-spin" /> : <CheckCircle2 className="w-12 h-12" />}
      </div>

      <div className="space-y-2">
        <span className="inline-flex items-center gap-1.5 text-xs font-bold text-vedic-gold bg-vedic-maroon px-3 py-1 rounded-full">
          <Sparkles className="w-3.5 h-3.5" /> {phase === 'loading' ? 'Confirming your payment…' : 'Order Successfully Placed & Consecrated'}
        </span>
        <h1 className="font-serif font-extrabold text-3xl md:text-4xl text-vedic-maroon">Thank You For Your Divine Purchase!</h1>
        <p className="text-xs text-vedic-muted">
          {phase === 'delayed'
            ? "Your payment went through. Your order is still being registered — it will appear in My Orders in a moment."
            : 'Your order has been registered and is being prepared for traditional Prana Pratishtha ritual before dispatch.'}
        </p>
      </div>

      {phase !== 'loading' && (
        <div className="bg-white rounded-3xl p-6 border border-vedic-gold/30 shadow-card text-left space-y-4 max-w-lg mx-auto">
          {orderLabel && (
            <div className="flex justify-between items-center border-b border-vedic-beige pb-3 text-xs font-bold">
              <span className="text-vedic-muted">Order Reference:</span>
              <span className="text-vedic-maroon font-mono">{orderLabel}</span>
            </div>
          )}
          <div className="space-y-1 text-xs">
            {order ? (
              <>
                <div className="flex justify-between">
                  <span className="text-vedic-muted">Status:</span>
                  <span className="font-bold text-vedic-dark">{order.stageLabel}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-vedic-muted">Payment Status:</span>
                  <PaymentBadge order={order} />
                </div>
                <div className="flex justify-between text-sm font-extrabold text-vedic-maroon pt-2 border-t border-vedic-beige">
                  <span>Order Total:</span>
                  <span>{formatMoney(order.total, order.currency)}</span>
                </div>
              </>
            ) : phase === 'found' ? (
              <>
                <div className="flex justify-between">
                  <span className="text-vedic-muted">Estimated Express Delivery:</span>
                  <span className="font-bold text-vedic-dark">3 - 5 Business Days</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-vedic-muted">Payment Status:</span>
                  <span className="font-bold text-emerald-700">Confirmed (Secure)</span>
                </div>
                {state.grandTotal != null && (
                  <div className="flex justify-between text-sm font-extrabold text-vedic-maroon pt-2 border-t border-vedic-beige">
                    <span>Total Paid:</span>
                    <span>₹{state.grandTotal.toLocaleString('en-IN')}</span>
                  </div>
                )}
              </>
            ) : (
              <p className="text-vedic-muted">We'll email you a confirmation as soon as it's registered.</p>
            )}
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
        <Link
          to={trackTo}
          className="bg-vedic-maroon text-vedic-ivory px-7 py-3 rounded-full text-xs font-bold shadow-md hover:bg-vedic-maroonDark transition-colors flex items-center gap-2"
        >
          <Package className="w-4 h-4 text-vedic-gold" /> {live ? 'View My Order' : 'Track Live Order Status'}
        </Link>
        <Link
          to={returnPath}
          replace
          className="bg-white text-vedic-dark border border-vedic-gold/40 px-6 py-3 rounded-full text-xs font-bold hover:bg-vedic-ivory transition-colors flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4 text-vedic-gold" /> Back to {returnLabel}
        </Link>
      </div>

      {secondsLeft !== null && phase !== 'loading' && (
        <p className="text-xs text-vedic-muted" aria-live="polite">
          Taking you back to <span className="font-bold text-vedic-dark">{returnLabel}</span> in {secondsLeft}s ·{' '}
          <button onClick={() => setSecondsLeft(null)} className="font-bold text-vedic-maroon hover:underline">
            Stay here
          </button>
        </p>
      )}
    </div>
  );
};
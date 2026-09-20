import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { CheckCircle2, Sparkles, Package, ArrowLeft } from 'lucide-react';
import { describeReturnPath, getReturnPath } from '../lib/returnPath';

// How long the confirmation stays up before the visitor is taken back to the page they ordered from
const REDIRECT_SECONDS = 10;

export const OrderSuccessPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state || {};
  const [fallbackOrderId] = useState(() => `VA-ORD-${Math.floor(100000 + Math.random() * 900000)}`);
  const orderId = state.orderId || fallbackOrderId;
  const grandTotal = state.grandTotal || 1299;

  // The page they were on before the cart / checkout (Home, Rudraksha, Bracelets…), fixed when this page opens.
  const [returnPath] = useState(getReturnPath);
  const returnLabel = describeReturnPath(returnPath);
  const [secondsLeft, setSecondsLeft] = useState<number | null>(REDIRECT_SECONDS); // null = redirect cancelled

  useEffect(() => {
    if (secondsLeft === null) return;
    if (secondsLeft <= 0) {
      // replace, so the browser's Back button doesn't land here again and start another countdown
      navigate(returnPath, { replace: true });
      return;
    }
    const t = setTimeout(() => setSecondsLeft((s) => (s === null ? null : s - 1)), 1000);
    return () => clearTimeout(t);
  }, [secondsLeft, navigate, returnPath]);

  return (
    <div className="max-w-3xl mx-auto px-4 py-12 text-center space-y-6">
      <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-lg">
        <CheckCircle2 className="w-12 h-12" />
      </div>

      <div className="space-y-2">
        <span className="inline-flex items-center gap-1.5 text-xs font-bold text-vedic-gold bg-vedic-maroon px-3 py-1 rounded-full">
          <Sparkles className="w-3.5 h-3.5" /> Order Successfully Placed & Consecrated
        </span>
        <h1 className="font-serif font-extrabold text-3xl md:text-4xl text-vedic-maroon">
          Thank You For Your Divine Purchase!
        </h1>
        <p className="text-xs text-vedic-muted">
          Your order has been registered and is being prepared for traditional Prana Pratishtha ritual before dispatch.
        </p>
      </div>

      <div className="bg-white rounded-3xl p-6 border border-vedic-gold/30 shadow-card text-left space-y-4 max-w-lg mx-auto">
        <div className="flex justify-between items-center border-b border-vedic-beige pb-3 text-xs font-bold">
          <span className="text-vedic-muted">Order Reference:</span>
          <span className="text-vedic-maroon font-mono">{orderId}</span>
        </div>

        <div className="space-y-1 text-xs">
          <div className="flex justify-between">
            <span className="text-vedic-muted">Estimated Express Delivery:</span>
            <span className="font-bold text-vedic-dark">3 - 5 Business Days</span>
          </div>
          <div className="flex justify-between">
            <span className="text-vedic-muted">Payment Status:</span>
            <span className="font-bold text-emerald-700">Confirmed (Secure)</span>
          </div>
          <div className="flex justify-between text-sm font-extrabold text-vedic-maroon pt-2 border-t border-vedic-beige">
            <span>Total Paid:</span>
            <span>₹{grandTotal.toLocaleString('en-IN')}</span>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
        <Link
          to={`/track-order?id=${orderId}`}
          className="bg-vedic-maroon text-vedic-ivory px-7 py-3 rounded-full text-xs font-bold shadow-md hover:bg-vedic-maroonDark transition-colors flex items-center gap-2"
        >
          <Package className="w-4 h-4 text-vedic-gold" /> Track Live Order Status
        </Link>
        <Link
          to={returnPath}
          replace
          className="bg-white text-vedic-dark border border-vedic-gold/40 px-6 py-3 rounded-full text-xs font-bold hover:bg-vedic-ivory transition-colors flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4 text-vedic-gold" /> Back to {returnLabel}
        </Link>
      </div>

      {secondsLeft !== null && (
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
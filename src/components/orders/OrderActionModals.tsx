import React, { useEffect, useState } from 'react';
import { Loader2, X, AlertCircle } from 'lucide-react';
import { CANCEL_REASONS, RETURN_REASONS } from '../../types/orders';
import type { OrderLine, ShopifyOrder } from '../../types/orders';
import { cancelOrder, getOrder, requestExchange, requestReturn } from '../../lib/ordersApi';
import { fetchProductDetail, ShopifyVariantDetail } from '../../lib/shopify';
import { formatMoney } from './OrderParts';

const Shell: React.FC<{ title: string; onClose: () => void; busy?: boolean; children: React.ReactNode }> = ({ title, onClose, busy, children }) => (
  <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
    <div className="fixed inset-0 bg-black/65 backdrop-blur-sm" onClick={busy ? undefined : onClose} />
    <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-vedic-gold/30 max-h-[92vh] overflow-y-auto z-10">
      <div className="flex items-center justify-between px-6 pt-5 pb-3 border-b border-vedic-beige">
        <h3 className="font-serif font-bold text-lg text-vedic-maroon">{title}</h3>
        <button onClick={onClose} disabled={busy} aria-label="Close" className="p-1.5 rounded-full hover:bg-vedic-beige disabled:opacity-50">
          <X className="w-4 h-4" />
        </button>
      </div>
      <div className="p-6 space-y-4 text-xs">{children}</div>
    </div>
  </div>
);

const ErrorBox: React.FC<{ message: string | null }> = ({ message }) =>
  message ? (
    <div className="flex items-start gap-2 text-[11px] font-semibold text-red-700 bg-red-50 border border-red-200 rounded-xl px-3 py-2">
      <AlertCircle className="w-4 h-4 shrink-0 mt-px" /> <span>{message}</span>
    </div>
  ) : null;

const inputCls = 'w-full px-3 py-2 bg-vedic-ivory rounded-xl border border-vedic-gold/30 focus:outline-none focus:border-vedic-gold';

// ---------------------------------------------------------------------------
// Cancel
// ---------------------------------------------------------------------------

export const CancelOrderModal: React.FC<{
  order: ShopifyOrder;
  onClose: () => void;
  onUpdated: (order: ShopifyOrder) => void;
}> = ({ order, onClose, onUpdated }) => {
  const [reason, setReason] = useState(CANCEL_REASONS[0]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    setBusy(true);
    setError(null);
    try {
      let { order: next, pending } = await cancelOrder(order.id, reason);
      // Shopify finishes cancellations in the background — keep reading its state until it shows up.
      for (let i = 0; pending && i < 8; i++) {
        await new Promise((r) => setTimeout(r, 1500));
        next = await getOrder(order.id);
        pending = !next.cancelledAt;
      }
      onUpdated(next);
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not cancel the order.');
      setBusy(false);
    }
  };

  return (
    <Shell title={`Cancel Order ${order.name}`} onClose={onClose} busy={busy}>
      <p className="text-vedic-muted">
        The whole order will be cancelled.{' '}
        {order.payment.amountPaid > 0
          ? `Your payment of ${formatMoney(order.payment.amountPaid, order.currency)} will be refunded to the original payment method.`
          : 'You have not paid anything yet, so nothing needs refunding.'}
      </p>
      <div>
        <label className="block font-bold text-vedic-dark mb-1">Reason for cancelling</label>
        <select value={reason} onChange={(e) => setReason(e.target.value)} className={inputCls} disabled={busy}>
          {CANCEL_REASONS.map((r) => (
            <option key={r}>{r}</option>
          ))}
        </select>
      </div>
      <ErrorBox message={error} />
      <div className="flex gap-3 pt-1">
        <button onClick={onClose} disabled={busy} className="px-5 py-2.5 rounded-full font-bold border border-vedic-gold/40 text-vedic-dark disabled:opacity-50">
          Keep Order
        </button>
        <button
          onClick={submit}
          disabled={busy}
          className="flex-1 bg-red-700 text-white py-2.5 rounded-full font-bold hover:bg-red-800 flex items-center justify-center gap-2 disabled:opacity-60"
        >
          {busy && <Loader2 className="w-4 h-4 animate-spin" />} Yes, Cancel Order
        </button>
      </div>
    </Shell>
  );
};

// ---------------------------------------------------------------------------
// Return / Exchange
// ---------------------------------------------------------------------------

export const ReturnExchangeModal: React.FC<{
  mode: 'return' | 'exchange';
  order: ShopifyOrder;
  /** Pre-select this line (when opened from a single item). */
  line?: OrderLine;
  onClose: () => void;
  onUpdated: (order: ShopifyOrder) => void;
}> = ({ mode, order, line, onClose, onUpdated }) => {
  const eligible = order.lines.filter((l) => (mode === 'return' ? !l.returnBlockedReason : !l.exchangeBlockedReason));
  const [qty, setQty] = useState<Record<string, number>>(() => (line && eligible.some((l) => l.id === line.id) ? { [line.id]: 1 } : {}));
  const [exchangeLineId, setExchangeLineId] = useState<string>(line && eligible.some((l) => l.id === line.id) ? line.id : eligible[0]?.id ?? '');
  const [reason, setReason] = useState('');
  const [note, setNote] = useState('');
  const [variantId, setVariantId] = useState('');
  const [variants, setVariants] = useState<ShopifyVariantDetail[] | null>(null);
  const [variantError, setVariantError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const exLine = eligible.find((l) => l.id === exchangeLineId);

  // Exchange options come live from Shopify (price + stock), same source the product page uses.
  useEffect(() => {
    if (mode !== 'exchange' || !exLine) return;
    let alive = true;
    setVariants(null);
    setVariantError(null);
    setVariantId('');
    if (!exLine.handle) {
      setVariants([]);
      return;
    }
    fetchProductDetail(exLine.handle)
      .then((d) => alive && setVariants(d ? d.variants.filter((v) => v.id !== exLine.variantId) : []))
      .catch(() => alive && setVariantError("We couldn't load the available options. Please try again."));
    return () => {
      alive = false;
    };
  }, [mode, exLine?.id, exLine?.handle, exLine?.variantId]);

  const selected = Object.entries(qty).filter(([, q]) => q > 0);
  const canSubmit =
    !busy && reason && (mode === 'return' ? selected.length > 0 : Boolean(exLine && variantId));

  const submit = async () => {
    setBusy(true);
    setError(null);
    try {
      const next =
        mode === 'return'
          ? await requestReturn({ orderId: order.id, items: selected.map(([lineItemId, quantity]) => ({ lineItemId, quantity })), reason, note })
          : await requestExchange({ orderId: order.id, lineItemId: exchangeLineId, quantity: qty[exchangeLineId] || 1, variantId, reason, note });
      onUpdated(next);
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not submit your request.');
      setBusy(false);
    }
  };

  const title = mode === 'return' ? 'Return Items' : 'Exchange Item';

  return (
    <Shell title={`${title} · ${order.name}`} onClose={onClose} busy={busy}>
      {eligible.length === 0 ? (
        <p className="text-vedic-muted">{(mode === 'return' ? order.actions.returnBlockedReason : order.actions.exchangeBlockedReason) || 'Nothing in this order is eligible right now.'}</p>
      ) : (
        <>
          <div className="space-y-2">
            <label className="block font-bold text-vedic-dark">{mode === 'return' ? 'Which items are you returning?' : 'Which item do you want to exchange?'}</label>
            {eligible.map((l) => {
              const on = mode === 'return' ? (qty[l.id] ?? 0) > 0 : exchangeLineId === l.id;
              return (
                <div key={l.id} className={`flex items-center gap-3 p-2.5 rounded-2xl border ${on ? 'border-vedic-gold bg-vedic-ivory' : 'border-vedic-gold/30'}`}>
                  <input
                    type={mode === 'return' ? 'checkbox' : 'radio'}
                    name="line"
                    checked={on}
                    disabled={busy}
                    onChange={() => (mode === 'return' ? setQty({ ...qty, [l.id]: on ? 0 : 1 }) : (setExchangeLineId(l.id), setQty({ [l.id]: 1 })))}
                    className="accent-vedic-maroon"
                  />
                  {l.image && <img src={l.image} alt="" className="w-10 h-10 rounded-lg object-cover border border-vedic-gold/20" />}
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-vedic-dark truncate">{l.title}</p>
                    {l.variantTitle && <p className="text-[10px] text-vedic-muted">{l.variantTitle}</p>}
                  </div>
                  {mode === 'return' && on && l.returnableQty > 1 && (
                    <select
                      value={qty[l.id]}
                      disabled={busy}
                      onChange={(e) => setQty({ ...qty, [l.id]: Number(e.target.value) })}
                      className="px-2 py-1 bg-white rounded-lg border border-vedic-gold/30"
                    >
                      {Array.from({ length: l.returnableQty }, (_, i) => i + 1).map((n) => (
                        <option key={n} value={n}>
                          Qty {n}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              );
            })}
          </div>

          {mode === 'exchange' && exLine && (
            <div className="space-y-2">
              <label className="block font-bold text-vedic-dark">What would you like instead?</label>
              {variants === null && !variantError && (
                <p className="text-vedic-muted flex items-center gap-2">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" /> Checking what's in stock…
                </p>
              )}
              <ErrorBox message={variantError} />
              {variants && variants.length === 0 && (
                <p className="text-vedic-muted">There are no other options for this product to exchange into. You can request a return instead.</p>
              )}
              {variants?.map((v) => (
                <label
                  key={v.id}
                  className={`flex items-center gap-3 p-2.5 rounded-2xl border text-xs ${
                    !v.availableForSale ? 'opacity-50 cursor-not-allowed border-vedic-gold/20' : variantId === v.id ? 'border-vedic-gold bg-vedic-ivory cursor-pointer' : 'border-vedic-gold/30 cursor-pointer'
                  }`}
                >
                  <input type="radio" name="variant" disabled={!v.availableForSale || busy} checked={variantId === v.id} onChange={() => setVariantId(v.id)} className="accent-vedic-maroon" />
                  <span className="flex-1 font-bold text-vedic-dark">{v.title}</span>
                  <span className="text-vedic-muted">{v.availableForSale ? formatMoney(v.price, v.currencyCode) : 'Out of stock'}</span>
                </label>
              ))}
              {variants && variants.length > 0 && (
                <p className="text-[10px] text-vedic-muted">If the new option's price is different, we'll contact you about the difference before it ships.</p>
              )}
            </div>
          )}

          <div>
            <label className="block font-bold text-vedic-dark mb-1">Reason *</label>
            <select value={reason} onChange={(e) => setReason(e.target.value)} className={inputCls} disabled={busy}>
              <option value="">Select a reason</option>
              {RETURN_REASONS.map((r) => (
                <option key={r.code} value={r.code}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block font-bold text-vedic-dark mb-1">Anything else we should know? (optional)</label>
            <textarea value={note} onChange={(e) => setNote(e.target.value.slice(0, 150))} rows={2} disabled={busy} className={inputCls} />
          </div>

          <ErrorBox message={error} />
          <div className="flex gap-3 pt-1">
            <button onClick={onClose} disabled={busy} className="px-5 py-2.5 rounded-full font-bold border border-vedic-gold/40 text-vedic-dark disabled:opacity-50">
              Close
            </button>
            <button
              onClick={submit}
              disabled={!canSubmit}
              className="flex-1 bg-vedic-maroon text-white py-2.5 rounded-full font-bold hover:bg-vedic-maroonDark flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {busy && <Loader2 className="w-4 h-4 animate-spin" />} {mode === 'return' ? 'Submit Return Request' : 'Submit Exchange Request'}
            </button>
          </div>
          <p className="text-[10px] text-vedic-muted">Your request is reviewed by our team. You can follow its status on this page.</p>
        </>
      )}
    </Shell>
  );
};
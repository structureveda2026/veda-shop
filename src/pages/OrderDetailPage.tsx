import React, { useCallback, useEffect, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { AlertCircle, ExternalLink, Loader2, MapPin, Package, RefreshCw, Truck } from 'lucide-react';
import { Breadcrumb } from '../components/Breadcrumb';
import { useAuth } from '../context/AuthContext';
import { getOrder, OrdersApiError } from '../lib/ordersApi';
import { formatDate, formatMoney, OrderTimeline, PaymentBadge, RefundCard, StageBadge } from '../components/orders/OrderParts';
import { CancelOrderModal, ReturnExchangeModal } from '../components/orders/OrderActionModals';
import type { OrderLine, ShopifyOrder } from '../types/orders';

type ModalState = { kind: 'cancel' } | { kind: 'return' | 'exchange'; line?: OrderLine } | null;

export const OrderDetailPage: React.FC = () => {
  const { orderId = '' } = useParams();
  const [search, setSearch] = useSearchParams();
  const { isAuthenticated, authLoading, shopifyAuth, openAuthModal, signInWithShopify } = useAuth();
  const [order, setOrder] = useState<ShopifyOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<{ message: string; notFound: boolean } | null>(null);
  const [modal, setModal] = useState<ModalState>(null);
  const [flash, setFlash] = useState<string | null>(null);

  const load = useCallback(
    async (quiet = false) => {
      if (quiet) setRefreshing(true);
      else setLoading(true);
      try {
        setOrder(await getOrder(orderId));
        setError(null);
      } catch (e) {
        if (e instanceof OrdersApiError && e.isAuth) {
          signInWithShopify({ returnTo: `/account/orders/${orderId}` });
          return;
        }
        if (!quiet) setError({ message: e instanceof Error ? e.message : 'Could not load this order.', notFound: e instanceof OrdersApiError && e.status === 404 });
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [orderId, signInWithShopify]
  );

  useEffect(() => {
    if (shopifyAuth && isAuthenticated) void load();
    else if (!authLoading) setLoading(false);
  }, [shopifyAuth, isAuthenticated, authLoading, load]);

  useEffect(() => {
    if (!shopifyAuth || !isAuthenticated) return;
    const onVisible = () => document.visibilityState === 'visible' && void load(true);
    document.addEventListener('visibilitychange', onVisible);
    return () => document.removeEventListener('visibilitychange', onVisible);
  }, [shopifyAuth, isAuthenticated, load]);

  // "Cancel Order" on the list page lands here with ?cancel=1
  useEffect(() => {
    if (order && search.get('cancel') === '1') {
      if (order.actions.canCancel) setModal({ kind: 'cancel' });
      setSearch({}, { replace: true });
    }
  }, [order, search, setSearch]);

  const updated = (next: ShopifyOrder, message: string) => {
    setOrder(next);
    setFlash(message);
    setTimeout(() => setFlash(null), 6000);
  };

  const shell = (children: React.ReactNode) => (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      <Breadcrumb items={[{ label: 'My Account', path: '/account' }, { label: 'My Orders', path: '/account/orders' }, { label: order?.name || 'Order' }]} />
      {children}
    </div>
  );

  if (!shopifyAuth || (!authLoading && !isAuthenticated)) {
    return shell(
      <div className="bg-white rounded-3xl p-10 border border-vedic-gold/20 shadow-card text-center space-y-4">
        <h2 className="font-serif font-bold text-xl text-vedic-maroon">Sign In to See This Order</h2>
        {shopifyAuth && (
          <button onClick={() => openAuthModal('Sign in to view and track your orders.')} className="bg-vedic-maroon text-white px-6 py-2.5 rounded-full text-xs font-bold">
            Sign In / Register
          </button>
        )}
      </div>
    );
  }

  if (loading || authLoading) return shell(<div className="py-16 text-center"><Loader2 className="w-8 h-8 text-vedic-gold animate-spin mx-auto" /></div>);

  if (error || !order) {
    return shell(
      <div className="bg-white rounded-3xl p-8 border border-red-200 text-center space-y-3">
        <AlertCircle className="w-7 h-7 text-red-600 mx-auto" />
        <p className="text-xs text-red-700 font-semibold">{error?.notFound ? "We couldn't find that order on your account." : error?.message}</p>
        <div className="flex justify-center gap-3">
          {!error?.notFound && (
            <button onClick={() => load()} className="bg-vedic-maroon text-white px-5 py-2 rounded-full text-xs font-bold">
              Try Again
            </button>
          )}
          <Link to="/account/orders" className="px-5 py-2 rounded-full text-xs font-bold border border-vedic-gold/40">
            All Orders
          </Link>
        </div>
      </div>
    );
  }

  const a = order.actions;
  const showReturnArea = order.stage !== 'CANCELLED';

  return shell(
    <>
      {flash && <div className="text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-2xl px-4 py-3">{flash}</div>}

      <div className="bg-white rounded-3xl p-6 border border-vedic-gold/20 shadow-card space-y-4">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <h1 className="font-serif font-extrabold text-2xl text-vedic-maroon font-mono">Order {order.name}</h1>
            <p className="text-[11px] text-vedic-muted">Placed on {formatDate(order.createdAt, true)}</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => load(true)} disabled={refreshing} aria-label="Refresh status" className="p-2 rounded-full border border-vedic-gold/30 hover:bg-vedic-ivory disabled:opacity-60">
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
            <StageBadge stage={order.stage} label={order.stageLabel} />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 pt-1">
          {a.canCancel && (
            <button onClick={() => setModal({ kind: 'cancel' })} className="px-4 py-2 rounded-full text-xs font-bold border border-red-300 text-red-700 hover:bg-red-50">
              Cancel Order
            </button>
          )}
          {showReturnArea && a.canReturn && (
            <button onClick={() => setModal({ kind: 'return' })} className="px-4 py-2 rounded-full text-xs font-bold bg-vedic-maroon text-white hover:bg-vedic-maroonDark">
              Return Items
            </button>
          )}
          {showReturnArea && a.canExchange && (
            <button onClick={() => setModal({ kind: 'exchange' })} className="px-4 py-2 rounded-full text-xs font-bold border border-vedic-maroon text-vedic-maroon hover:bg-vedic-ivory">
              Exchange an Item
            </button>
          )}
          {order.payment.status === 'FAILED' && order.statusPageUrl && (
            <a href={order.statusPageUrl} className="px-4 py-2 rounded-full text-xs font-bold bg-gold-gradient text-vedic-dark inline-flex items-center gap-1.5">
              Retry Payment <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
        </div>
        {!a.canCancel && a.cancelBlockedReason && order.stage !== 'CANCELLED' && !a.canReturn && !a.canExchange && (
          <p className="text-[11px] text-vedic-muted">{a.returnBlockedReason || a.cancelBlockedReason}</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 items-start">
        <div className="md:col-span-3 space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-vedic-gold/20 shadow-card space-y-5">
            <h3 className="font-serif font-bold text-base text-vedic-maroon">Order Status</h3>
            <OrderTimeline steps={order.timeline} />
            {order.estimatedDelivery && order.stage !== 'DELIVERED' && order.stage !== 'CANCELLED' && (
              <p className="text-[11px] text-vedic-muted">Estimated delivery: {formatDate(order.estimatedDelivery)}</p>
            )}
            {order.tracking.length > 0 && (
              <div className="space-y-1.5 border-t border-vedic-beige pt-3">
                {order.tracking.map((t, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs">
                    <Truck className="w-4 h-4 text-vedic-gold" />
                    <span className="text-vedic-dark font-semibold">{t.company || 'Courier'}</span>
                    {t.number && <span className="font-mono text-vedic-muted">{t.number}</span>}
                    {t.url && (
                      <a href={t.url} target="_blank" rel="noreferrer" className="text-vedic-goldDark font-bold hover:underline inline-flex items-center gap-1">
                        Track <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {order.returns.length > 0 && (
            <div className="bg-white rounded-3xl p-6 border border-vedic-gold/20 shadow-card space-y-3">
              <h3 className="font-serif font-bold text-base text-vedic-maroon">Returns & Exchanges</h3>
              {order.returns.map((r) => (
                <div key={r.id} className="p-4 bg-vedic-ivory rounded-2xl border border-vedic-gold/20 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-vedic-dark">
                      {r.kind === 'EXCHANGE' ? 'Exchange' : 'Return'} {r.name}
                    </span>
                    <span
                      className={`font-bold ${
                        r.status === 'DECLINED' || r.status === 'CANCELED' ? 'text-red-700' : r.status === 'COMPLETED' ? 'text-emerald-700' : 'text-amber-700'
                      }`}
                    >
                      {r.label}
                    </span>
                  </div>
                  {r.items.length > 0 && <p className="text-vedic-muted">{r.items.map((i) => `${i.quantity} × ${i.title || 'item'}`).join(', ')}</p>}
                  {r.exchangeTo && <p className="text-vedic-muted">Exchange for: <span className="font-bold text-vedic-dark">{r.exchangeTo.title}</span></p>}
                  {r.reason && <p className="text-vedic-muted">Reason: {r.reason}</p>}
                  {r.status === 'REQUESTED' && <p className="text-[11px] text-vedic-muted">Waiting for our team to review your request.</p>}
                  {r.status === 'APPROVED' && <p className="text-[11px] text-vedic-muted">Approved — we'll be in touch with the next steps.</p>}
                  {r.status === 'DECLINED' && <p className="text-[11px] text-vedic-muted">We couldn't approve this request. Please contact support if you'd like to know why.</p>}
                </div>
              ))}
            </div>
          )}

          <RefundCard refund={order.refund} currency={order.currency} />
        </div>

        <div className="md:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-vedic-gold/20 shadow-card space-y-3">
            <h3 className="font-serif font-bold text-base text-vedic-maroon">Items</h3>
            {order.lines.map((l) => (
              <div key={l.id} className="flex gap-3 text-xs">
                <div className="w-14 h-14 rounded-xl border border-vedic-gold/20 bg-vedic-ivory overflow-hidden shrink-0 flex items-center justify-center">
                  {l.image ? <img src={l.image} alt={l.title} className="w-full h-full object-cover" /> : <Package className="w-5 h-5 text-vedic-gold" />}
                </div>
                <div className="flex-1 min-w-0 space-y-0.5">
                  <p className="font-bold text-vedic-dark">{l.title}</p>
                  {l.variantTitle && <p className="text-[10px] text-vedic-muted">{l.variantTitle}</p>}
                  <p className="text-vedic-muted">
                    {l.quantity} × {formatMoney(l.unitPrice, order.currency)}
                  </p>
                  {showReturnArea && (
                    <div className="flex gap-3 pt-0.5">
                      {!l.returnBlockedReason && (
                        <button onClick={() => setModal({ kind: 'return', line: l })} className="text-vedic-goldDark font-bold hover:underline">
                          Return
                        </button>
                      )}
                      {!l.exchangeBlockedReason && (
                        <button onClick={() => setModal({ kind: 'exchange', line: l })} className="text-vedic-goldDark font-bold hover:underline">
                          Exchange
                        </button>
                      )}
                    </div>
                  )}
                  {showReturnArea && l.returnBlockedReason && order.stage !== 'CANCELLED' && !order.summary && (
                    <p className="text-[10px] text-vedic-muted">{l.returnBlockedReason}</p>
                  )}
                </div>
                <span className="font-bold text-vedic-maroon">{formatMoney(l.lineTotal, order.currency)}</span>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-3xl p-6 border border-vedic-gold/20 shadow-card space-y-2 text-xs">
            <h3 className="font-serif font-bold text-base text-vedic-maroon pb-1">Payment</h3>
            <Row label="Subtotal" value={formatMoney(order.subtotal, order.currency)} />
            {order.discount > 0 && <Row label="Discount" value={`-${formatMoney(order.discount, order.currency)}`} tone="text-emerald-700" />}
            <Row label="Shipping" value={order.shipping > 0 ? formatMoney(order.shipping, order.currency) : 'Free'} />
            {order.tax > 0 && <Row label="Tax" value={formatMoney(order.tax, order.currency)} />}
            <div className="flex justify-between font-extrabold text-vedic-maroon text-sm border-t border-vedic-beige pt-2">
              <span>Total</span>
              <span>{formatMoney(order.total, order.currency)}</span>
            </div>
            <div className="flex justify-between items-center pt-1">
              <span className="text-vedic-muted">{order.payment.gateway || 'Payment'}</span>
              <PaymentBadge order={order} />
            </div>
          </div>

          {order.shippingAddress && (
            <div className="bg-white rounded-3xl p-6 border border-vedic-gold/20 shadow-card space-y-1 text-xs">
              <h3 className="font-serif font-bold text-base text-vedic-maroon pb-1 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-vedic-gold" /> Shipping Address
              </h3>
              <p className="font-bold text-vedic-dark">{order.shippingAddress.name}</p>
              <p className="text-vedic-muted">
                {order.shippingAddress.address1}
                {order.shippingAddress.address2 ? `, ${order.shippingAddress.address2}` : ''}, {order.shippingAddress.city}, {order.shippingAddress.province} -{' '}
                {order.shippingAddress.zip}, {order.shippingAddress.country}
              </p>
              {order.shippingAddress.phone && <p className="text-vedic-muted">Phone: {order.shippingAddress.phone}</p>}
            </div>
          )}
        </div>
      </div>

      {modal?.kind === 'cancel' && (
        <CancelOrderModal order={order} onClose={() => setModal(null)} onUpdated={(o) => updated(o, o.cancelledAt ? 'Your order has been cancelled.' : 'Cancellation requested — the status will update shortly.')} />
      )}
      {(modal?.kind === 'return' || modal?.kind === 'exchange') && (
        <ReturnExchangeModal
          mode={modal.kind}
          order={order}
          line={modal.line}
          onClose={() => setModal(null)}
          onUpdated={(o) => updated(o, modal.kind === 'return' ? 'Return request submitted.' : 'Exchange request submitted.')}
        />
      )}
    </>
  );
};

const Row: React.FC<{ label: string; value: string; tone?: string }> = ({ label, value, tone }) => (
  <div className={`flex justify-between ${tone || ''}`}>
    <span className="text-vedic-muted">{label}</span>
    <span>{value}</span>
  </div>
);
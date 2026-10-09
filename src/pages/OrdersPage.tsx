import React, { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Loader2, Package, User, AlertCircle, ChevronRight } from 'lucide-react';
import { Breadcrumb } from '../components/Breadcrumb';
import { useAuth } from '../context/AuthContext';
import { listOrders, OrdersApiError } from '../lib/ordersApi';
import { formatDate, formatMoney, PaymentBadge, StageBadge } from '../components/orders/OrderParts';
import type { ShopifyOrder } from '../types/orders';

export const OrdersPage: React.FC = () => {
  const { isAuthenticated, authLoading, shopifyAuth, openAuthModal, signInWithShopify } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<ShopifyOrder[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (quiet = false) => {
    if (!quiet) setLoading(true);
    setError(null);
    try {
      const page = await listOrders();
      setOrders(page.orders);
      setCursor(page.endCursor);
      setHasMore(page.hasNextPage);
    } catch (e) {
      if (e instanceof OrdersApiError && e.isAuth) {
        signInWithShopify({ returnTo: '/account/orders' });
        return;
      }
      if (!quiet) setError(e instanceof Error ? e.message : 'Could not load your orders.');
    } finally {
      setLoading(false);
    }
  }, [signInWithShopify]);

  useEffect(() => {
    if (shopifyAuth && isAuthenticated) void load();
    else if (!authLoading) setLoading(false);
  }, [shopifyAuth, isAuthenticated, authLoading, load]);

  // Coming back to the tab (e.g. after the store updated the order) shows Shopify's latest state.
  useEffect(() => {
    if (!shopifyAuth || !isAuthenticated) return;
    const onVisible = () => document.visibilityState === 'visible' && void load(true);
    document.addEventListener('visibilitychange', onVisible);
    return () => document.removeEventListener('visibilitychange', onVisible);
  }, [shopifyAuth, isAuthenticated, load]);

  const more = async () => {
    if (!cursor) return;
    setLoadingMore(true);
    try {
      const page = await listOrders(cursor);
      setOrders((prev) => [...prev, ...page.orders]);
      setCursor(page.endCursor);
      setHasMore(page.hasNextPage);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not load more orders.');
    } finally {
      setLoadingMore(false);
    }
  };

  const shell = (children: React.ReactNode) => (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      <Breadcrumb items={[{ label: 'My Account', path: '/account' }, { label: 'My Orders' }]} />
      {children}
    </div>
  );

  if (!shopifyAuth) {
    return shell(
      <div className="bg-white rounded-3xl p-10 border border-vedic-gold/20 shadow-card text-center space-y-3">
        <Package className="w-8 h-8 text-vedic-gold mx-auto" />
        <p className="text-xs text-vedic-muted">Order tracking turns on as soon as the store's Shopify account connection is finished.</p>
        <Link to="/account" className="inline-block bg-vedic-maroon text-white px-5 py-2 rounded-full text-xs font-bold">
          Back to My Account
        </Link>
      </div>
    );
  }

  if (authLoading) {
    return shell(<div className="py-16 text-center"><Loader2 className="w-8 h-8 text-vedic-gold animate-spin mx-auto" /></div>);
  }

  if (!isAuthenticated) {
    return shell(
      <div className="bg-white rounded-3xl p-10 border border-vedic-gold/20 shadow-card text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-vedic-maroon text-vedic-gold flex items-center justify-center mx-auto">
          <User className="w-8 h-8" />
        </div>
        <h2 className="font-serif font-bold text-xl text-vedic-maroon">Sign In to See Your Orders</h2>
        <button
          onClick={() => openAuthModal('Sign in to view and track your orders.')}
          className="bg-vedic-maroon text-white px-6 py-2.5 rounded-full text-xs font-bold shadow-md hover:bg-vedic-maroonDark"
        >
          Sign In / Register
        </button>
      </div>
    );
  }

  return shell(
    <>
      <h1 className="font-serif font-extrabold text-2xl text-vedic-maroon">My Orders</h1>

      {loading ? (
        <div className="space-y-4">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-32 rounded-3xl bg-white border border-vedic-gold/20 animate-pulse" />
          ))}
        </div>
      ) : error ? (
        <div className="bg-white rounded-3xl p-8 border border-red-200 text-center space-y-3">
          <AlertCircle className="w-7 h-7 text-red-600 mx-auto" />
          <p className="text-xs text-red-700 font-semibold">{error}</p>
          <button onClick={() => load()} className="bg-vedic-maroon text-white px-5 py-2 rounded-full text-xs font-bold">
            Try Again
          </button>
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-white rounded-3xl p-10 border border-vedic-gold/20 shadow-card text-center space-y-3">
          <Package className="w-8 h-8 text-vedic-gold mx-auto" />
          <p className="text-xs text-vedic-muted">You haven't placed any orders yet.</p>
          <Link to="/shop" className="inline-block bg-vedic-maroon text-white px-5 py-2 rounded-full text-xs font-bold">
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((o) => (
            <div key={o.id} className="bg-white rounded-3xl p-5 border border-vedic-gold/20 shadow-card space-y-4">
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div>
                  <span className="font-bold font-mono text-vedic-maroon block">Order {o.name}</span>
                  <span className="text-[11px] text-vedic-muted">Placed on {formatDate(o.createdAt)}</span>
                </div>
                <StageBadge stage={o.stage} label={o.stageLabel} />
              </div>

              <div className="flex items-center gap-2">
                {o.lines.slice(0, 4).map((l) => (
                  <div key={l.id} className="w-14 h-14 rounded-xl border border-vedic-gold/20 bg-vedic-ivory overflow-hidden flex items-center justify-center">
                    {l.image ? <img src={l.image} alt={l.title} className="w-full h-full object-cover" /> : <Package className="w-5 h-5 text-vedic-gold" />}
                  </div>
                ))}
                <p className="text-xs text-vedic-muted ml-1 truncate">
                  {o.lines[0]?.title}
                  {o.lines.length > 1 ? ` + ${o.lines.length - 1} more` : ''}
                </p>
              </div>

              <div className="flex items-center justify-between gap-3 flex-wrap text-xs border-t border-vedic-beige pt-3">
                <div className="space-y-0.5">
                  <span className="font-extrabold text-vedic-dark block text-sm">{formatMoney(o.total, o.currency)}</span>
                  <PaymentBadge order={o} />
                  {o.refund.status !== 'NOT_APPLICABLE' && <span className="block text-[11px] font-bold text-vedic-goldDark">{o.refund.label}</span>}
                </div>
                <div className="flex items-center gap-2">
                  {o.actions.canCancel && (
                    <button
                      onClick={() => navigate(`/account/orders/${o.id}?cancel=1`)}
                      className="px-4 py-2 rounded-full font-bold border border-red-300 text-red-700 hover:bg-red-50"
                    >
                      Cancel Order
                    </button>
                  )}
                  <Link
                    to={`/account/orders/${o.id}`}
                    className="inline-flex items-center gap-1 bg-vedic-maroon text-white px-4 py-2 rounded-full font-bold hover:bg-vedic-maroonDark"
                  >
                    View Details <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          ))}

          {hasMore && (
            <div className="text-center">
              <button
                onClick={more}
                disabled={loadingMore}
                className="px-6 py-2.5 rounded-full text-xs font-bold border border-vedic-gold/40 text-vedic-dark hover:bg-white disabled:opacity-60 inline-flex items-center gap-2"
              >
                {loadingMore && <Loader2 className="w-3.5 h-3.5 animate-spin" />} Load Older Orders
              </button>
            </div>
          )}
        </div>
      )}
    </>
  );
};
import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Breadcrumb } from '../components/Breadcrumb';
import { Loader2, Sparkles, User, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { listOrders } from '../lib/ordersApi';
import { OrderTimeline, StageBadge } from '../components/orders/OrderParts';
import type { ShopifyOrder } from '../types/orders';

const normalise = (v: string) => v.replace(/[^a-z0-9]/gi, '').toLowerCase();

/** Live tracker: looks the order number up among the signed-in customer's own Shopify orders. */
export const TrackOrderPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const initialId = searchParams.get('id') || '';
  const { shopifyAuth, isAuthenticated, authLoading, openAuthModal } = useAuth();

  const [orderId, setOrderId] = useState(initialId);
  const [searched, setSearched] = useState<string | null>(initialId || null);
  const [orders, setOrders] = useState<ShopifyOrder[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!shopifyAuth || !isAuthenticated || !searched) return;
    let alive = true;
    setLoading(true);
    setError(null);
    (async () => {
      try {
        const all: ShopifyOrder[] = [];
        let cursor: string | undefined;
        for (let i = 0; i < 5; i++) {
          const page = await listOrders(cursor);
          all.push(...page.orders);
          if (!page.hasNextPage || !page.endCursor || all.some((o) => normalise(o.name) === normalise(searched))) break;
          cursor = page.endCursor;
        }
        if (alive) setOrders(all);
      } catch (e) {
        if (alive) setError(e instanceof Error ? e.message : 'Could not load your orders.');
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [shopifyAuth, isAuthenticated, searched]);

  const handleTrackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (orderId.trim()) setSearched(orderId.trim());
  };

  const match = searched && orders ? orders.find((o) => normalise(o.name) === normalise(searched) || o.id === searched) : null;

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-8">
      <Breadcrumb items={[{ label: 'Track Order' }]} />

      <div className="bg-white rounded-3xl p-8 border border-vedic-gold/20 shadow-card text-center space-y-4">
        <Sparkles className="w-8 h-8 text-vedic-gold mx-auto" />
        <h1 className="font-serif font-extrabold text-2xl md:text-3xl text-vedic-maroon">Live Order Status Tracker</h1>
        <p className="text-xs text-vedic-muted max-w-md mx-auto">Enter your order number to see exactly where your shipment is.</p>

        <form onSubmit={handleTrackSubmit} className="flex gap-2 max-w-md mx-auto">
          <input
            type="text"
            required
            value={orderId}
            onChange={(e) => setOrderId(e.target.value)}
            placeholder="Enter Order Number (e.g. #1001)"
            className="flex-1 px-4 py-2.5 text-xs bg-vedic-ivory rounded-full border border-vedic-gold/40 focus:outline-none"
          />
          <button type="submit" className="bg-vedic-maroon text-white px-6 py-2.5 rounded-full text-xs font-bold shadow-md hover:bg-vedic-maroonDark">
            Track Order
          </button>
        </form>
      </div>

      {searched && shopifyAuth && !authLoading && !isAuthenticated && (
        <div className="bg-white rounded-3xl p-8 border border-vedic-gold/30 shadow-card text-center space-y-3">
          <User className="w-7 h-7 text-vedic-gold mx-auto" />
          <p className="text-xs text-vedic-muted">Sign in to the account you ordered with to track this order.</p>
          <button onClick={() => openAuthModal('Sign in to track your order.')} className="bg-vedic-maroon text-white px-6 py-2.5 rounded-full text-xs font-bold">
            Sign In / Register
          </button>
        </div>
      )}

      {searched && !shopifyAuth && (
        <div className="bg-white rounded-3xl p-8 border border-vedic-gold/30 shadow-card text-center text-xs text-vedic-muted">
          Live tracking turns on once the store's Shopify connection is finished.
        </div>
      )}

      {loading && <div className="py-8 text-center"><Loader2 className="w-7 h-7 text-vedic-gold animate-spin mx-auto" /></div>}

      {error && (
        <div className="bg-white rounded-3xl p-6 border border-red-200 text-center text-xs text-red-700 font-semibold flex items-center justify-center gap-2">
          <AlertCircle className="w-4 h-4" /> {error}
        </div>
      )}

      {searched && orders && !loading && !match && (
        <div className="bg-white rounded-3xl p-8 border border-vedic-gold/30 shadow-card text-center text-xs text-vedic-muted">
          We couldn't find order <span className="font-mono font-bold">{searched}</span> on your account. Check the number in your confirmation email.
        </div>
      )}

      {match && (
        <div className="bg-white rounded-3xl p-6 md:p-8 border border-vedic-gold/30 shadow-card space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-vedic-beige pb-4 gap-2">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-vedic-goldDark">Tracking Details For</span>
              <h3 className="font-serif font-bold text-lg text-vedic-maroon font-mono">{match.name}</h3>
            </div>
            <StageBadge stage={match.stage} label={match.stageLabel} />
          </div>
          <OrderTimeline steps={match.timeline} />
          <Link to={`/account/orders/${match.id}`} className="inline-block text-xs font-bold text-vedic-goldDark hover:underline">
            View full order details, returns & refunds →
          </Link>
        </div>
      )}
    </div>
  );
};
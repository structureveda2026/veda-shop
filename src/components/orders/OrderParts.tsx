import React from 'react';
import { CheckCircle2, Circle, Banknote, AlertTriangle } from 'lucide-react';
import type { OrderStage, OrderTimelineStep, RefundInfo, RefundStatus, ShopifyOrder } from '../../types/orders';

export const formatMoney = (amount: number, currency = 'INR'): string =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency, maximumFractionDigits: amount % 1 === 0 ? 0 : 2 }).format(amount);

export const formatDate = (iso?: string | null, withTime = false): string => {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    ...(withTime ? { hour: 'numeric', minute: '2-digit' } : {}),
  });
};

const STAGE_TONE: Record<OrderStage, string> = {
  ORDER_PLACED: 'bg-vedic-beige text-vedic-dark border-vedic-gold/30',
  CONFIRMED: 'bg-sky-50 text-sky-800 border-sky-200',
  PROCESSING: 'bg-sky-50 text-sky-800 border-sky-200',
  PACKED: 'bg-indigo-50 text-indigo-800 border-indigo-200',
  SHIPPED: 'bg-indigo-50 text-indigo-800 border-indigo-200',
  OUT_FOR_DELIVERY: 'bg-amber-50 text-amber-800 border-amber-200',
  DELIVERED: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  CANCELLED: 'bg-red-50 text-red-700 border-red-200',
  RETURN_REQUESTED: 'bg-amber-50 text-amber-800 border-amber-200',
  RETURN_APPROVED: 'bg-amber-50 text-amber-800 border-amber-200',
  RETURNED: 'bg-slate-100 text-slate-700 border-slate-200',
  EXCHANGE_REQUESTED: 'bg-amber-50 text-amber-800 border-amber-200',
  EXCHANGE_PROCESSING: 'bg-amber-50 text-amber-800 border-amber-200',
  REFUNDED: 'bg-emerald-50 text-emerald-800 border-emerald-200',
};

export const StageBadge: React.FC<{ stage: OrderStage; label: string }> = ({ stage, label }) => (
  <span className={`inline-flex items-center text-[11px] font-bold px-3 py-1 rounded-full border ${STAGE_TONE[stage]}`}>{label}</span>
);

export const PaymentBadge: React.FC<{ order: ShopifyOrder }> = ({ order }) => {
  const bad = order.payment.status === 'FAILED' || order.payment.status === 'VOIDED' || order.payment.status === 'EXPIRED';
  const good = order.payment.status === 'PAID' || order.payment.status === 'REFUNDED' || order.payment.status === 'PARTIALLY_REFUNDED';
  return (
    <span className={`inline-flex items-center gap-1 text-[11px] font-bold ${bad ? 'text-red-700' : good ? 'text-emerald-700' : 'text-vedic-goldDark'}`}>
      <Banknote className="w-3.5 h-3.5" /> {order.payment.label}
    </span>
  );
};

/** Vertical order tracker — same look as the existing Track Order page. */
export const OrderTimeline: React.FC<{ steps: OrderTimelineStep[] }> = ({ steps }) => (
  <div className="space-y-6 relative before:absolute before:left-3.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-vedic-gold/30">
    {steps.map((step) => (
      <div key={step.key} className="relative flex items-start gap-4 pl-8">
        <div
          className={`absolute left-0 top-0.5 w-7 h-7 rounded-full flex items-center justify-center border-2 ${
            step.done
              ? step.current
                ? 'bg-vedic-gold border-vedic-maroon text-vedic-maroon ring-4 ring-vedic-gold/25'
                : 'bg-vedic-maroon border-vedic-gold text-vedic-gold'
              : 'bg-vedic-ivory border-gray-300 text-gray-400'
          }`}
        >
          {step.done ? <CheckCircle2 className="w-4 h-4" /> : <Circle className="w-3.5 h-3.5" />}
        </div>
        <div>
          <h4 className={`text-xs font-bold ${step.done ? 'text-vedic-dark' : 'text-gray-400'}`}>{step.label}</h4>
          {step.at && <p className="text-[10px] text-vedic-muted">{formatDate(step.at, true)}</p>}
        </div>
      </div>
    ))}
  </div>
);

const REFUND_TONE: Record<RefundStatus, string> = {
  NOT_APPLICABLE: 'text-vedic-muted',
  PENDING: 'text-amber-700',
  PROCESSING: 'text-sky-700',
  PARTIALLY_REFUNDED: 'text-emerald-700',
  REFUNDED: 'text-emerald-700',
  FAILED: 'text-red-700',
};

const REFUND_NOTE: Record<RefundStatus, string> = {
  NOT_APPLICABLE: '',
  PENDING: "We'll issue your refund once the returned item reaches us and is checked.",
  PROCESSING: 'Your refund has been started and is on its way to your original payment method. Banks usually take 5–7 working days.',
  PARTIALLY_REFUNDED: 'Part of your payment has been returned to the original payment method.',
  REFUNDED: 'The full amount has been returned to your original payment method.',
  FAILED: "The refund didn't go through. Our team has been alerted — please contact support with your order number.",
};

export const RefundCard: React.FC<{ refund: RefundInfo; currency: string }> = ({ refund, currency }) => {
  if (refund.status === 'NOT_APPLICABLE') return null;
  return (
    <div className="p-4 bg-vedic-ivory rounded-2xl border border-vedic-gold/20 space-y-2 text-xs">
      <div className="flex items-center justify-between gap-2">
        <span className="font-bold text-vedic-dark">Refund</span>
        <span className={`font-extrabold ${REFUND_TONE[refund.status]} flex items-center gap-1`}>
          {refund.status === 'FAILED' && <AlertTriangle className="w-3.5 h-3.5" />}
          {refund.label}
        </span>
      </div>
      <p className="text-vedic-muted">{REFUND_NOTE[refund.status]}</p>
      {refund.entries.map((e) => (
        <div key={e.id} className="flex justify-between text-vedic-dark border-t border-vedic-beige pt-2">
          <span>
            {formatMoney(e.amount, currency)} {e.at ? `· ${formatDate(e.at)}` : ''}
          </span>
          <span className={e.status === 'FAILED' ? 'text-red-700 font-bold' : e.status === 'PROCESSING' ? 'text-sky-700 font-bold' : 'text-emerald-700 font-bold'}>
            {e.status === 'FAILED' ? 'Failed' : e.status === 'PROCESSING' ? 'Processing' : 'Refunded'}
          </span>
        </div>
      ))}
    </div>
  );
};
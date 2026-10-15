import type {
  OrderActions,
  OrderAddress,
  OrderLine,
  OrderStage,
  OrderTimelineStep,
  OrderTracking,
  PaymentStatus,
  RefundEntry,
  RefundInfo,
  RefundStatus,
  ReturnRequestInfo,
  ReturnRequestStatus,
  ShopifyOrder,
} from '../../src/types/orders';

/**
 * Turns a raw Shopify Admin `Order` into the object the storefront renders.
 *
 * Pure function — no network, no storage. Every status the customer sees is DERIVED here from
 * Shopify's own state (financial status, fulfillments, returns, refunds, transactions):
 *
 *  Placed → Confirmed → Processing → Packed → Shipped → Out for Delivery → Delivered
 *      order created     paid / tag      fulfillment-order     label / tag     fulfillment display status
 *
 * Shopify has no native "Confirmed / Processing / Packed" states, so they come from signals the
 * merchant already controls in Shopify admin:
 *   Confirmed  → payment authorised/paid, or the order tag `confirmed` (use for COD)
 *   Processing → a fulfillment order IN_PROGRESS, or the order tag `processing`
 *   Packed     → the order tag `packed`, or a fulfillment whose shipping label is printed/purchased
 * Product tags `non-returnable` / `non-exchangeable` opt a product out of returns / exchanges.
 */

// ---------------------------------------------------------------------------
// Raw (Admin API) shapes — only the fields we read
// ---------------------------------------------------------------------------

type MoneySet = { shopMoney?: { amount?: string; currencyCode?: string } } | null | undefined;
interface Nodes<T> {
  nodes?: T[];
}

export interface RawLineItem {
  id: string;
  title?: string;
  variantTitle?: string | null;
  sku?: string | null;
  quantity?: number;
  currentQuantity?: number;
  image?: { url?: string } | null;
  originalUnitPriceSet?: MoneySet;
  discountedUnitPriceSet?: MoneySet;
  product?: { id?: string; handle?: string; tags?: string[] } | null;
  variant?: { id?: string; title?: string } | null;
}

interface RawFulfillment {
  id: string;
  status?: string | null;
  displayStatus?: string | null;
  createdAt?: string | null;
  deliveredAt?: string | null;
  inTransitAt?: string | null;
  estimatedDeliveryAt?: string | null;
  trackingInfo?: { company?: string | null; number?: string | null; url?: string | null }[] | null;
  fulfillmentLineItems?: Nodes<{ id: string; quantity?: number; lineItem?: { id?: string } | null }>;
  events?: Nodes<{ status?: string; happenedAt?: string; message?: string | null }>;
}

interface RawReturn {
  id: string;
  name?: string;
  status?: string;
  closedAt?: string | null;
  returnLineItems?: Nodes<{
    quantity?: number;
    customerNote?: string | null;
    fulfillmentLineItem?: { lineItem?: { title?: string } | null } | null;
  }>;
}

interface RawTransaction {
  id?: string;
  kind?: string;
  status?: string;
  processedAt?: string | null;
  amountSet?: MoneySet;
}

interface RawRefund {
  id: string;
  createdAt?: string | null;
  totalRefundedSet?: MoneySet;
  transactions?: Nodes<RawTransaction>;
}

export interface RawOrder {
  id: string;
  name: string;
  createdAt: string;
  processedAt?: string | null;
  cancelledAt?: string | null;
  cancelReason?: string | null;
  email?: string | null;
  tags?: string[];
  displayFinancialStatus?: string | null;
  displayFulfillmentStatus?: string | null;
  returnStatus?: string | null;
  statusPageUrl?: string | null;
  currencyCode?: string;
  subtotalPriceSet?: MoneySet;
  totalShippingPriceSet?: MoneySet;
  totalTaxSet?: MoneySet;
  totalDiscountsSet?: MoneySet;
  totalPriceSet?: MoneySet;
  totalReceivedSet?: MoneySet;
  paymentGatewayNames?: string[];
  customer?: { id?: string } | null;
  shippingAddress?: {
    name?: string | null;
    address1?: string | null;
    address2?: string | null;
    city?: string | null;
    province?: string | null;
    zip?: string | null;
    country?: string | null;
    phone?: string | null;
  } | null;
  lineItems?: Nodes<RawLineItem>;
  fulfillments?: RawFulfillment[];
  fulfillmentOrders?: Nodes<{ status?: string }>;
  returns?: Nodes<RawReturn>;
  refunds?: RawRefund[];
  transactions?: RawTransaction[];
  returnableFulfillments?: Nodes<{
    id: string;
    returnableFulfillmentLineItems?: Nodes<{
      quantity?: number;
      fulfillmentLineItem?: { id: string; lineItem?: { id?: string } | null } | null;
    }>;
  }>;
}

export interface MapOptions {
  /** true = the single-order query (eligibility, tracking, events); false = the light list query. */
  detail: boolean;
  returnWindowDays: number;
  exchangeWindowDays: number;
  now?: Date;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const num = (v?: string | null): number => (v ? parseFloat(v) || 0 : 0);
const amount = (set: MoneySet): number => num(set?.shopMoney?.amount);
const lastId = (gid?: string | null): string => (gid ? gid.split('/').pop() || '' : '');
const lower = (list?: string[]) => (list ?? []).map((t) => t.trim().toLowerCase());
const DAY = 24 * 60 * 60 * 1000;

export const STAGE_LABELS: Record<OrderStage, string> = {
  ORDER_PLACED: 'Order Placed',
  CONFIRMED: 'Confirmed',
  PROCESSING: 'Processing',
  PACKED: 'Packed',
  SHIPPED: 'Shipped',
  OUT_FOR_DELIVERY: 'Out for Delivery',
  DELIVERED: 'Delivered',
  CANCELLED: 'Cancelled',
  RETURN_REQUESTED: 'Return Requested',
  RETURN_APPROVED: 'Return Approved',
  RETURNED: 'Returned',
  EXCHANGE_REQUESTED: 'Exchange Requested',
  EXCHANGE_PROCESSING: 'Exchange Processing',
  REFUNDED: 'Refunded',
};

const FORWARD: OrderStage[] = [
  'ORDER_PLACED',
  'CONFIRMED',
  'PROCESSING',
  'PACKED',
  'SHIPPED',
  'OUT_FOR_DELIVERY',
  'DELIVERED',
];

type Phase = 'packed' | 'shipped' | 'out' | 'delivered';

/** What a fulfillment tells us. null = it doesn't count (cancelled, failed, voided label…). */
export function fulfillmentPhase(f: RawFulfillment): Phase | null {
  if (f.status && f.status !== 'SUCCESS') return null;
  switch (f.displayStatus) {
    case 'DELIVERED':
    case 'PICKED_UP':
      return 'delivered';
    case 'OUT_FOR_DELIVERY':
      return 'out';
    case 'LABEL_PRINTED':
    case 'LABEL_PURCHASED':
    case 'SUBMITTED':
    case 'READY_FOR_PICKUP':
      return 'packed';
    case 'CANCELED':
    case 'FAILURE':
    case 'NOT_DELIVERED':
    case 'LABEL_VOIDED':
      return null;
    default:
      return 'shipped'; // IN_TRANSIT, CONFIRMED, FULFILLED, MARKED_AS_FULFILLED, ATTEMPTED_DELIVERY, DELAYED, unknown
  }
}

const isCod = (gateways: string[] = []) => gateways.some((g) => /cash on delivery|\bcod\b/i.test(g));

// ---------------------------------------------------------------------------
// Returns / exchanges
// ---------------------------------------------------------------------------

const EXCHANGE_MARK = /\[EXCHANGE variant=(gid:\/\/shopify\/ProductVariant\/\d+)\]/;
const EXCHANGE_TITLE = /Replace with "([^"]*)"/;
const REASON_PART = /Reason:\s*([^.]*)\./;

const RETURN_STATUS_LABELS: Record<ReturnRequestStatus, { RETURN: string; EXCHANGE: string }> = {
  REQUESTED: { RETURN: 'Return Requested', EXCHANGE: 'Exchange Requested' },
  APPROVED: { RETURN: 'Return Approved', EXCHANGE: 'Exchange Processing' },
  COMPLETED: { RETURN: 'Returned', EXCHANGE: 'Exchange Completed' },
  DECLINED: { RETURN: 'Return Declined', EXCHANGE: 'Exchange Declined' },
  CANCELED: { RETURN: 'Return Cancelled', EXCHANGE: 'Exchange Cancelled' },
};

const mapReturnStatus = (s?: string): ReturnRequestStatus => {
  switch (s) {
    case 'OPEN':
      return 'APPROVED';
    case 'CLOSED':
      return 'COMPLETED';
    case 'DECLINED':
      return 'DECLINED';
    case 'CANCELED':
      return 'CANCELED';
    default:
      return 'REQUESTED';
  }
};

function mapReturns(raw: RawOrder): ReturnRequestInfo[] {
  return (raw.returns?.nodes ?? []).map((r) => {
    const lines = r.returnLineItems?.nodes ?? [];
    const note = lines.map((l) => l.customerNote).find(Boolean) ?? null;
    const mark = note?.match(EXCHANGE_MARK);
    const kind: 'RETURN' | 'EXCHANGE' = mark ? 'EXCHANGE' : 'RETURN';
    const status = mapReturnStatus(r.status);
    return {
      id: lastId(r.id),
      name: r.name || '',
      kind,
      status,
      label: RETURN_STATUS_LABELS[status][kind],
      items: lines.map((l) => ({ title: l.fulfillmentLineItem?.lineItem?.title || '', quantity: l.quantity ?? 1 })),
      reason: note?.match(REASON_PART)?.[1]?.trim() || null,
      customerNote: note ? note.replace(EXCHANGE_MARK, '').replace(EXCHANGE_TITLE, '').replace(REASON_PART, '').replace(/\s+/g, ' ').trim() || null : null,
      exchangeTo: mark ? { variantId: mark[1], title: note?.match(EXCHANGE_TITLE)?.[1] || '' } : null,
      closedAt: r.closedAt ?? null,
    };
  });
}

/** The return/exchange that currently defines the order's stage: newest open one, else the newest completed one. */
function headlineReturn(returns: ReturnRequestInfo[]): ReturnRequestInfo | null {
  const live = returns.filter((r) => r.status !== 'DECLINED' && r.status !== 'CANCELED');
  const byNewest = (a: ReturnRequestInfo, b: ReturnRequestInfo) => Number(b.id) - Number(a.id);
  const active = live.filter((r) => r.status === 'REQUESTED' || r.status === 'APPROVED').sort(byNewest);
  if (active.length) return active[0];
  return live.sort(byNewest)[0] ?? null;
}

// ---------------------------------------------------------------------------
// Payment & refund
// ---------------------------------------------------------------------------

const PAYMENT_LABELS: Record<PaymentStatus, string> = {
  PENDING: 'Payment Pending',
  AUTHORIZED: 'Payment Authorised',
  PAID: 'Paid',
  PARTIALLY_PAID: 'Partially Paid',
  PARTIALLY_REFUNDED: 'Partially Refunded',
  REFUNDED: 'Refunded',
  VOIDED: 'Payment Voided',
  EXPIRED: 'Payment Expired',
  FAILED: 'Payment Failed',
};

function paymentStatus(raw: RawOrder, cod: boolean): { status: PaymentStatus; label: string } {
  let status = (raw.displayFinancialStatus as PaymentStatus | undefined) ?? 'PENDING';
  if (!(status in PAYMENT_LABELS)) status = 'PENDING';

  // An order whose latest payment attempt failed and was never paid: let the customer retry from Shopify's status page.
  if (status === 'PENDING' && !cod) {
    const attempts = (raw.transactions ?? []).filter((t) => t.kind === 'SALE' || t.kind === 'AUTHORIZATION');
    if (attempts.length && attempts.every((t) => t.status === 'FAILURE' || t.status === 'ERROR')) status = 'FAILED';
  }
  const label = status === 'PENDING' && cod ? 'Pay on Delivery' : PAYMENT_LABELS[status];
  return { status, label };
}

const REFUND_LABELS: Record<RefundStatus, string> = {
  NOT_APPLICABLE: 'No refund due',
  PENDING: 'Refund Pending',
  PROCESSING: 'Refund Processing',
  PARTIALLY_REFUNDED: 'Partially Refunded',
  REFUNDED: 'Refunded',
  FAILED: 'Refund Failed',
};

function mapRefund(raw: RawOrder, paid: number, returns: ReturnRequestInfo[]): RefundInfo {
  const entries: RefundEntry[] = (raw.refunds ?? [])
    .map((r) => {
      const tx = r.transactions?.nodes ?? [];
      let status: RefundEntry['status'] = 'REFUNDED';
      if (tx.some((t) => t.status === 'FAILURE' || t.status === 'ERROR')) status = 'FAILED';
      else if (tx.some((t) => t.status === 'PENDING' || t.status === 'AWAITING_RESPONSE')) status = 'PROCESSING';
      return {
        id: lastId(r.id),
        amount: amount(r.totalRefundedSet),
        status,
        at: tx.find((t) => t.processedAt)?.processedAt ?? r.createdAt ?? null,
      };
    })
    .filter((e) => e.amount > 0);

  const refundedAmount = entries.filter((e) => e.status === 'REFUNDED').reduce((s, e) => s + e.amount, 0);
  const fullyRefunded = raw.displayFinancialStatus === 'REFUNDED';

  let status: RefundStatus;
  if (entries.some((e) => e.status === 'FAILED')) status = 'FAILED';
  else if (entries.some((e) => e.status === 'PROCESSING')) status = 'PROCESSING';
  else if (entries.length) status = fullyRefunded ? 'REFUNDED' : 'PARTIALLY_REFUNDED';
  else if (raw.cancelledAt && paid > 0) status = 'PROCESSING'; // Shopify is still issuing the refund for a cancelled, paid order
  else if (paid > 0 && returns.some((r) => r.status !== 'DECLINED' && r.status !== 'CANCELED')) status = 'PENDING';
  else status = 'NOT_APPLICABLE';

  return { status, label: REFUND_LABELS[status], refundedAmount, entries };
}

// ---------------------------------------------------------------------------
// Stage
// ---------------------------------------------------------------------------

function baseStage(raw: RawOrder, phases: Phase[]): OrderStage {
  const tags = lower(raw.tags);
  const fulfilled = raw.displayFulfillmentStatus === 'FULFILLED';

  if (phases.length && phases.every((p) => p === 'delivered') && fulfilled) return 'DELIVERED';
  if (phases.includes('out')) return 'OUT_FOR_DELIVERY';
  if (phases.includes('delivered') && !fulfilled) return 'SHIPPED'; // part of the order delivered, rest still on its way
  if (phases.includes('delivered')) return 'DELIVERED';
  if (phases.includes('shipped')) return 'SHIPPED';
  if (phases.includes('packed') || tags.includes('packed')) return 'PACKED';

  const inProgress =
    (raw.fulfillmentOrders?.nodes ?? []).some((f) => f.status === 'IN_PROGRESS') ||
    raw.displayFulfillmentStatus === 'IN_PROGRESS' ||
    tags.includes('processing');
  if (inProgress) return 'PROCESSING';

  const paid = ['PAID', 'AUTHORIZED', 'PARTIALLY_PAID'].includes(raw.displayFinancialStatus || '');
  if (paid || tags.includes('confirmed')) return 'CONFIRMED';
  return 'ORDER_PLACED';
}

function deriveStage(raw: RawOrder, base: OrderStage, head: ReturnRequestInfo | null): OrderStage {
  if (raw.cancelledAt) return 'CANCELLED';
  if (raw.displayFinancialStatus === 'REFUNDED') return 'REFUNDED';
  if (head) {
    if (head.kind === 'EXCHANGE') {
      if (head.status === 'REQUESTED') return 'EXCHANGE_REQUESTED';
      if (head.status === 'APPROVED') return 'EXCHANGE_PROCESSING';
    } else {
      if (head.status === 'REQUESTED') return 'RETURN_REQUESTED';
      if (head.status === 'APPROVED') return 'RETURN_APPROVED';
      if (head.status === 'COMPLETED') return 'RETURNED';
    }
  }
  return base;
}

// ---------------------------------------------------------------------------
// Timeline
// ---------------------------------------------------------------------------

function buildTimeline(
  raw: RawOrder,
  stage: OrderStage,
  base: OrderStage,
  head: ReturnRequestInfo | null,
  refund: RefundInfo,
  at: (k: OrderStage) => string | null
): OrderTimelineStep[] {
  const step = (key: OrderStage, done: boolean): OrderTimelineStep => ({
    key,
    label: STAGE_LABELS[key],
    done,
    current: false,
    at: done ? at(key) : null,
  });

  let steps: OrderTimelineStep[];
  if (raw.cancelledAt) {
    steps = [step('ORDER_PLACED', true), step('CANCELLED', true)];
    if (refund.status !== 'NOT_APPLICABLE') steps.push(step('REFUNDED', refund.status === 'REFUNDED'));
  } else {
    const idx = FORWARD.indexOf(base);
    steps = FORWARD.map((k, i) => step(k, i <= idx));

    if (head) {
      const branch: OrderStage[] =
        head.kind === 'EXCHANGE'
          ? ['EXCHANGE_REQUESTED', 'EXCHANGE_PROCESSING']
          : ['RETURN_REQUESTED', 'RETURN_APPROVED', 'RETURNED'];
      const reached = head.status === 'REQUESTED' ? 0 : head.status === 'APPROVED' ? 1 : branch.length - 1;
      branch.forEach((k, i) => steps.push(step(k, i <= reached)));
    }
    if (head?.kind === 'RETURN' || stage === 'REFUNDED' || refund.status === 'PARTIALLY_REFUNDED' || refund.status === 'REFUNDED') {
      steps.push(step('REFUNDED', refund.status === 'REFUNDED' || stage === 'REFUNDED'));
    }
  }

  // "Current" = the latest step reached (the one the headline status names).
  let current = -1;
  steps.forEach((s, i) => {
    if (s.done) current = i;
  });
  const named = steps.findIndex((s) => s.key === stage && s.done);
  if (named >= 0) current = named;
  if (current >= 0) steps[current].current = true;
  return steps;
}

// ---------------------------------------------------------------------------
// Eligibility
// ---------------------------------------------------------------------------

function cancelEligibility(raw: RawOrder, returns: ReturnRequestInfo[]): { ok: boolean; reason: string | null } {
  const fulfillments = raw.fulfillments ?? [];
  if (raw.cancelledAt) return { ok: false, reason: 'This order has already been cancelled.' };
  if (['REFUNDED', 'VOIDED'].includes(raw.displayFinancialStatus || '')) return { ok: false, reason: 'This order has already been refunded.' };

  const shipped =
    fulfillments.some((f) => fulfillmentPhase(f) !== null) ||
    ['FULFILLED', 'PARTIALLY_FULFILLED'].includes(raw.displayFulfillmentStatus || '');
  if (shipped) return { ok: false, reason: 'This order has already been shipped, so it can no longer be cancelled. You can request a return after delivery.' };
  if (returns.length) return { ok: false, reason: 'A return has already been requested for this order.' };
  return { ok: true, reason: null };
}

interface DeliveredInfo {
  deliveredAt: string | null;
}

function lineEligibility(
  raw: RawOrder,
  line: RawLineItem,
  returnable: Map<string, number>,
  delivered: Map<string, DeliveredInfo>,
  opts: MapOptions,
  now: number
): { returnReason: string | null; exchangeReason: string | null; qty: number } {
  const id = lastId(line.id);
  const qty = returnable.get(id) ?? 0;
  const tags = lower(line.product?.tags);

  const common = (): string | null => {
    if (raw.cancelledAt) return 'This order was cancelled.';
    if (!delivered.has(id)) return 'Available after the item is delivered.';
    return null;
  };

  const windowEnded = (days: number): boolean => {
    const at = delivered.get(id)?.deliveredAt;
    if (!at) return false;
    return now > new Date(at).getTime() + days * DAY;
  };

  let returnReason = common();
  if (!returnReason && tags.includes('non-returnable')) returnReason = 'This product is not eligible for return.';
  if (!returnReason && windowEnded(opts.returnWindowDays)) returnReason = `The ${opts.returnWindowDays}-day return window has ended.`;
  if (!returnReason && qty <= 0) returnReason = 'Already returned, or a return is in progress.';

  let exchangeReason = common();
  if (!exchangeReason && (tags.includes('non-exchangeable') || tags.includes('non-returnable'))) exchangeReason = 'This product is not eligible for exchange.';
  if (!exchangeReason && windowEnded(opts.exchangeWindowDays)) exchangeReason = `The ${opts.exchangeWindowDays}-day exchange window has ended.`;
  if (!exchangeReason && qty <= 0) exchangeReason = 'Already returned/exchanged, or a request is in progress.';

  return { returnReason, exchangeReason, qty };
}

/**
 * For a return request: line item id → the Shopify fulfillment-line-item ids (and quantities) it can be
 * returned from. Always computed from a fresh read of the order — never from anything the browser sent.
 */
export function returnAllocation(raw: RawOrder): Map<string, { fulfillmentLineItemId: string; quantity: number }[]> {
  const out = new Map<string, { fulfillmentLineItemId: string; quantity: number }[]>();
  for (const rf of raw.returnableFulfillments?.nodes ?? []) {
    for (const item of rf.returnableFulfillmentLineItems?.nodes ?? []) {
      const lineId = lastId(item.fulfillmentLineItem?.lineItem?.id);
      const fliId = item.fulfillmentLineItem?.id;
      if (!lineId || !fliId || !item.quantity) continue;
      const list = out.get(lineId) ?? [];
      list.push({ fulfillmentLineItemId: fliId, quantity: item.quantity });
      out.set(lineId, list);
    }
  }
  return out;
}

// ---------------------------------------------------------------------------
// Main mapper
// ---------------------------------------------------------------------------

export function mapOrder(raw: RawOrder, opts: MapOptions): ShopifyOrder {
  const now = (opts.now ?? new Date()).getTime();
  const fulfillments = raw.fulfillments ?? [];
  const phases = fulfillments.map(fulfillmentPhase).filter((p): p is Phase => p !== null);

  const returns = mapReturns(raw);
  const head = headlineReturn(returns);
  const cod = isCod(raw.paymentGatewayNames) || lower(raw.tags).includes('cod'); // COD orders from api/checkout.ts carry the `COD` tag
  const pay = paymentStatus(raw, cod);
  const paid = amount(raw.totalReceivedSet);
  const refund = mapRefund(raw, paid, returns);

  const base = baseStage(raw, phases);
  const stage = deriveStage(raw, base, head);

  // ---- delivery facts per line (detail only) ----
  const delivered = new Map<string, DeliveredInfo>();
  const eventTime = (f: RawFulfillment, status: string) =>
    (f.events?.nodes ?? []).filter((e) => e.status === status).map((e) => e.happenedAt).sort().pop() ?? null;
  const deliveredTimes: string[] = [];
  let outForDeliveryAt: string | null = null;
  for (const f of fulfillments) {
    const phase = fulfillmentPhase(f);
    if (phase === 'out') outForDeliveryAt = eventTime(f, 'OUT_FOR_DELIVERY') ?? outForDeliveryAt;
    if (phase !== 'delivered') continue;
    const at = f.deliveredAt || eventTime(f, 'DELIVERED') || f.createdAt || null;
    if (at) deliveredTimes.push(at);
    for (const fli of f.fulfillmentLineItems?.nodes ?? []) {
      const lid = lastId(fli.lineItem?.id);
      if (lid) delivered.set(lid, { deliveredAt: at });
    }
  }
  const shippedAt = fulfillments.map((f) => f.inTransitAt || f.createdAt).filter((x): x is string => Boolean(x)).sort()[0] ?? null;

  const returnable = new Map<string, number>();
  for (const [lineId, parts] of returnAllocation(raw)) returnable.set(lineId, parts.reduce((s, p) => s + p.quantity, 0));

  // ---- lines ----
  const lines: OrderLine[] = (raw.lineItems?.nodes ?? []).map((l) => {
    const unit = amount(l.discountedUnitPriceSet) || amount(l.originalUnitPriceSet);
    const quantity = l.currentQuantity ?? l.quantity ?? 1;
    const elig = opts.detail
      ? lineEligibility(raw, l, returnable, delivered, opts, now)
      : { returnReason: 'Open the order to see return options.', exchangeReason: 'Open the order to see exchange options.', qty: 0 };
    return {
      id: lastId(l.id),
      title: l.title || 'Item',
      variantTitle: l.variantTitle && l.variantTitle !== 'Default Title' ? l.variantTitle : null,
      sku: l.sku ?? null,
      quantity,
      image: l.image?.url ?? null,
      unitPrice: unit,
      lineTotal: unit * quantity,
      handle: l.product?.handle ?? null,
      productId: l.product?.id ?? null,
      variantId: l.variant?.id ?? null,
      returnableQty: elig.qty,
      returnBlockedReason: elig.returnReason,
      exchangeBlockedReason: elig.exchangeReason,
    };
  });

  const cancel = cancelEligibility(raw, returns);
  const anyReturn = lines.some((l) => !l.returnBlockedReason);
  const anyExchange = lines.some((l) => !l.exchangeBlockedReason);
  const actions: OrderActions = {
    canCancel: cancel.ok,
    cancelBlockedReason: cancel.reason,
    canReturn: opts.detail && anyReturn,
    canExchange: opts.detail && anyExchange,
    returnBlockedReason: opts.detail && !anyReturn ? lines.find((l) => l.returnBlockedReason)?.returnBlockedReason ?? null : null,
    exchangeBlockedReason: opts.detail && !anyExchange ? lines.find((l) => l.exchangeBlockedReason)?.exchangeBlockedReason ?? null : null,
  };

  const timeline = buildTimeline(raw, stage, base, head, refund, (k) => {
    switch (k) {
      case 'ORDER_PLACED':
        return raw.createdAt;
      case 'SHIPPED':
        return shippedAt;
      case 'OUT_FOR_DELIVERY':
        return outForDeliveryAt;
      case 'DELIVERED':
        return deliveredTimes.sort().pop() ?? null;
      case 'CANCELLED':
        return raw.cancelledAt ?? null;
      case 'RETURNED':
        return head?.closedAt ?? null;
      default:
        return null;
    }
  });

  const tracking: OrderTracking[] = fulfillments.flatMap((f) =>
    (f.trackingInfo ?? []).map((t) => ({ company: t.company ?? null, number: t.number ?? null, url: t.url ?? null }))
  );

  const ship = raw.shippingAddress;
  const shippingAddress: OrderAddress | null = ship
    ? {
        name: ship.name || '',
        address1: ship.address1 || '',
        address2: ship.address2 ?? null,
        city: ship.city || '',
        province: ship.province || '',
        zip: ship.zip || '',
        country: ship.country || '',
        phone: ship.phone ?? null,
      }
    : null;

  return {
    id: lastId(raw.id),
    name: raw.name,
    createdAt: raw.createdAt,
    stage,
    stageLabel: STAGE_LABELS[stage],
    cancelledAt: raw.cancelledAt ?? null,
    cancelReason: raw.cancelReason ?? null,
    payment: { ...pay, gateway: raw.paymentGatewayNames?.[0] ?? null, cod, amountPaid: paid },
    currency: raw.currencyCode || raw.totalPriceSet?.shopMoney?.currencyCode || 'INR',
    subtotal: amount(raw.subtotalPriceSet),
    shipping: amount(raw.totalShippingPriceSet),
    tax: amount(raw.totalTaxSet),
    discount: amount(raw.totalDiscountsSet),
    total: amount(raw.totalPriceSet),
    lines,
    shippingAddress,
    tracking,
    estimatedDelivery: fulfillments.map((f) => f.estimatedDeliveryAt).find(Boolean) ?? null,
    timeline,
    returns,
    refund,
    actions,
    statusPageUrl: raw.statusPageUrl ?? null,
    summary: !opts.detail,
  };
}
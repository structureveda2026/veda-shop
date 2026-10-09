/**
 * Shapes returned by the order API (api/orders.ts). Every value here is derived from Shopify's
 * own order / fulfillment / return / refund objects on the server — nothing is stored by the storefront.
 */

export type OrderStage =
  | 'ORDER_PLACED'
  | 'CONFIRMED'
  | 'PROCESSING'
  | 'PACKED'
  | 'SHIPPED'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'RETURN_REQUESTED'
  | 'RETURN_APPROVED'
  | 'RETURNED'
  | 'EXCHANGE_REQUESTED'
  | 'EXCHANGE_PROCESSING'
  | 'REFUNDED';

export type PaymentStatus =
  | 'PENDING'
  | 'AUTHORIZED'
  | 'PAID'
  | 'PARTIALLY_PAID'
  | 'PARTIALLY_REFUNDED'
  | 'REFUNDED'
  | 'VOIDED'
  | 'EXPIRED'
  | 'FAILED';

export type RefundStatus = 'NOT_APPLICABLE' | 'PENDING' | 'PROCESSING' | 'PARTIALLY_REFUNDED' | 'REFUNDED' | 'FAILED';

export type ReturnRequestStatus = 'REQUESTED' | 'APPROVED' | 'DECLINED' | 'CANCELED' | 'COMPLETED';

export interface OrderLine {
  /** Numeric Shopify line-item id (the part after gid://shopify/LineItem/). */
  id: string;
  title: string;
  variantTitle: string | null;
  sku: string | null;
  quantity: number;
  image: string | null;
  unitPrice: number;
  lineTotal: number;
  /** Shopify product handle — used to load exchange variants from the Storefront API. */
  handle: string | null;
  productId: string | null;
  variantId: string | null;
  /** How many units can still be returned/exchanged (from Shopify's returnableFulfillments). */
  returnableQty: number;
  /** null = this line can be returned right now; otherwise the reason it can't. */
  returnBlockedReason: string | null;
  exchangeBlockedReason: string | null;
}

export interface OrderTracking {
  company: string | null;
  number: string | null;
  url: string | null;
}

export interface OrderTimelineStep {
  key: OrderStage;
  label: string;
  done: boolean;
  /** The step the order is at right now. */
  current: boolean;
  at: string | null;
}

export interface ReturnRequestInfo {
  id: string;
  name: string;
  kind: 'RETURN' | 'EXCHANGE';
  status: ReturnRequestStatus;
  label: string;
  items: { title: string; quantity: number }[];
  reason: string | null;
  customerNote: string | null;
  exchangeTo: { title: string; variantId: string } | null;
  closedAt: string | null;
}

export interface RefundEntry {
  id: string;
  amount: number;
  status: 'PROCESSING' | 'REFUNDED' | 'FAILED';
  at: string | null;
}

export interface RefundInfo {
  status: RefundStatus;
  label: string;
  refundedAmount: number;
  entries: RefundEntry[];
}

export interface OrderActions {
  canCancel: boolean;
  cancelBlockedReason: string | null;
  canReturn: boolean;
  canExchange: boolean;
  /** Why nothing on this order can be returned right now (null when something can). */
  returnBlockedReason: string | null;
  exchangeBlockedReason: string | null;
}

export interface OrderAddress {
  name: string;
  address1: string;
  address2: string | null;
  city: string;
  province: string;
  zip: string;
  country: string;
  phone: string | null;
}

export interface ShopifyOrder {
  /** Numeric Shopify order id. */
  id: string;
  /** Customer-facing order number, e.g. "#1001". */
  name: string;
  createdAt: string;
  stage: OrderStage;
  stageLabel: string;
  cancelledAt: string | null;
  cancelReason: string | null;
  payment: { status: PaymentStatus; label: string; gateway: string | null; cod: boolean; amountPaid: number };
  currency: string;
  subtotal: number;
  shipping: number;
  tax: number;
  discount: number;
  total: number;
  lines: OrderLine[];
  shippingAddress: OrderAddress | null;
  tracking: OrderTracking[];
  estimatedDelivery: string | null;
  timeline: OrderTimelineStep[];
  returns: ReturnRequestInfo[];
  refund: RefundInfo;
  actions: OrderActions;
  /** Shopify's own order-status page (also where a pending payment can be retried). */
  statusPageUrl: string | null;
  /** True for list responses: line eligibility / tracking detail is only filled in by the detail endpoint. */
  summary: boolean;
}

export interface OrdersPage {
  orders: ShopifyOrder[];
  hasNextPage: boolean;
  endCursor: string | null;
}

export interface CustomerProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
}

export const RETURN_REASONS: { code: string; label: string }[] = [
  { code: 'DEFECTIVE', label: 'Item is damaged or defective' },
  { code: 'NOT_AS_DESCRIBED', label: 'Not as described / different from photos' },
  { code: 'WRONG_ITEM', label: 'Received the wrong item' },
  { code: 'SIZE_TOO_SMALL', label: 'Size is too small' },
  { code: 'SIZE_TOO_LARGE', label: 'Size is too large' },
  { code: 'UNWANTED', label: 'Changed my mind' },
  { code: 'OTHER', label: 'Other' },
];

export const CANCEL_REASONS: string[] = [
  'Ordered by mistake',
  'Found a better price elsewhere',
  'Delivery is taking too long',
  'Want to change the product / size',
  'Other',
];
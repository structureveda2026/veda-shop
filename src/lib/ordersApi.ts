import { getAccessToken } from './customerAccount';
import type { OrdersPage, ShopifyOrder } from '../types/orders';

/**
 * Client for api/orders.ts. Every call carries the buyer's own Shopify customer-account token; the
 * server checks it with Shopify, reads/changes the order in Shopify, and returns Shopify's real state.
 */

const env = ((import.meta as unknown as { env?: Record<string, string | undefined> }).env ?? {});
const BASE = env.VITE_ORDERS_API_URL || '/api/orders';

export class OrdersApiError extends Error {
  status: number;
  code: string;
  constructor(message: string, status: number, code: string) {
    super(message);
    this.name = 'OrdersApiError';
    this.status = status;
    this.code = code;
  }
  /** The visitor has to sign in again. */
  get isAuth(): boolean {
    return this.status === 401;
  }
}

async function call<T>(path: string, init: RequestInit = {}, retried = false): Promise<T> {
  const token = await getAccessToken(retried);
  if (!token) throw new OrdersApiError('Please sign in to see your orders.', 401, 'unauthorized');

  let res: Response;
  try {
    res = await fetch(`${BASE}${path}`, {
      ...init,
      headers: { ...(init.headers || {}), Authorization: `Bearer ${token}`, ...(init.body ? { 'Content-Type': 'application/json' } : {}) },
    });
  } catch {
    throw new OrdersApiError('Could not reach the server. Check your connection and try again.', 0, 'network');
  }

  const text = await res.text();
  let json: { error?: { code?: string; message?: string } } & Record<string, unknown>;
  try {
    json = JSON.parse(text);
  } catch {
    throw new OrdersApiError('The order service is not available. (Run the site with `vercel dev` or deploy it to Vercel.)', res.status || 404, 'api_unavailable');
  }

  if (res.status === 401 && !retried) return call<T>(path, init, true); // one forced token refresh
  if (!res.ok) throw new OrdersApiError(json.error?.message || 'Something went wrong. Please try again.', res.status, json.error?.code || 'error');
  return json as T;
}

export const listOrders = (after?: string): Promise<OrdersPage> =>
  call<OrdersPage>(after ? `?after=${encodeURIComponent(after)}` : '');

export const getOrder = async (id: string): Promise<ShopifyOrder> => (await call<{ order: ShopifyOrder }>(`?id=${encodeURIComponent(id)}`)).order;

const post = <T>(body: Record<string, unknown>) => call<T>('', { method: 'POST', body: JSON.stringify(body) });

export const cancelOrder = (orderId: string, reason?: string) =>
  post<{ order: ShopifyOrder; pending: boolean }>({ action: 'cancel', orderId, reason });

export const requestReturn = async (input: {
  orderId: string;
  items: { lineItemId: string; quantity: number }[];
  reason: string;
  note?: string;
}): Promise<ShopifyOrder> => (await post<{ order: ShopifyOrder }>({ action: 'return', ...input })).order;

export const requestExchange = async (input: {
  orderId: string;
  lineItemId: string;
  quantity: number;
  variantId: string;
  reason: string;
  note?: string;
}): Promise<ShopifyOrder> => (await post<{ order: ShopifyOrder }>({ action: 'exchange', ...input })).order;
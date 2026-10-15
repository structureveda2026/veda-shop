import { getAccessToken } from './customerAccount';

/**
 * Client for api/checkout.ts — Cash on Delivery only. Online payments use Shopify's hosted
 * checkout (CartContext.beginCheckout) and never touch this file.
 */

const env = ((import.meta as unknown as { env?: Record<string, string | undefined> }).env ?? {});
const BASE = env.VITE_CHECKOUT_API_URL || '/api/checkout';

export interface CodConfig {
  enabled: boolean;
  /** Extra COD handling charge in ₹ (0 = free). */
  fee: number;
  /** Highest order total (₹) that can be paid by COD. */
  maxOrderValue: number;
}

export class CheckoutApiError extends Error {
  status: number;
  code: string;
  constructor(message: string, status: number, code: string) {
    super(message);
    this.name = 'CheckoutApiError';
    this.status = status;
    this.code = code;
  }
}

const parse = async (res: Response) => {
  const text = await res.text();
  try {
    return JSON.parse(text) as { error?: { code?: string; message?: string } } & Record<string, unknown>;
  } catch {
    throw new CheckoutApiError('The checkout service is not available. (Run the site with `vercel dev` or deploy it to Vercel.)', res.status || 404, 'api_unavailable');
  }
};

/** Whether COD is offered (and its fee / limit). Never throws — if the API is unreachable COD is simply hidden. */
export async function getCodConfig(): Promise<CodConfig> {
  try {
    const res = await fetch(BASE, { headers: { Accept: 'application/json' } });
    const json = await parse(res);
    const cod = json.cod as Partial<CodConfig> | undefined;
    if (!res.ok || !cod) return { enabled: false, fee: 0, maxOrderValue: 0 };
    return { enabled: Boolean(cod.enabled), fee: Number(cod.fee) || 0, maxOrderValue: Number(cod.maxOrderValue) || 0 };
  } catch {
    return { enabled: false, fee: 0, maxOrderValue: 0 };
  }
}

export interface PlaceCodOrderInput {
  lines: { variantId: string; quantity: number }[];
  buyer: {
    phone: string;
    address: {
      firstName: string;
      lastName: string;
      address1: string;
      address2?: string;
      city: string;
      province: string;
      zip: string;
    };
  };
  couponCode?: string | null;
}

export async function placeCodOrder(input: PlaceCodOrderInput, retried = false): Promise<{ id: string; name: string }> {
  const token = await getAccessToken(retried);
  if (!token) throw new CheckoutApiError('Please sign in to place your order.', 401, 'unauthorized');

  let res: Response;
  try {
    res = await fetch(BASE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ action: 'cod', ...input }),
    });
  } catch {
    throw new CheckoutApiError('Could not reach the server. Check your connection and try again.', 0, 'network');
  }

  const json = await parse(res);
  if (res.status === 401 && !retried) return placeCodOrder(input, true); // one forced token refresh
  if (!res.ok) throw new CheckoutApiError(json.error?.message || 'Something went wrong. Please try again.', res.status, json.error?.code || 'error');
  return json.order as { id: string; name: string };
}
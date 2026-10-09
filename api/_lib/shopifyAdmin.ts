import { ApiError, ApiRequest, siteOrigin, sleep } from './http.js';

/**
 * Server-only Shopify access.
 *
 *  • Admin API  — reads orders / returns / refunds and performs cancel + return requests.
 *    Needs a token with: read_orders, write_orders, read_returns, write_returns, read_products,
 *    read_customers, read_fulfillments (+ read_all_orders to see orders older than 60 days).
 *  • Customer Account API — only used to prove WHO the caller is (the buyer's own access token
 *    is checked against Shopify on every request; the Admin token is never reachable from the browser).
 *
 * Env (set in Vercel → Project → Settings → Environment Variables, NOT prefixed with VITE_):
 *   SHOPIFY_STORE_DOMAIN          your-store.myshopify.com
 *   SHOPIFY_ADMIN_ACCESS_TOKEN    shpat_…            (a static Admin API token)
 *     — or —
 *   SHOPIFY_CLIENT_ID + SHOPIFY_CLIENT_SECRET         (Dev Dashboard app → client-credentials grant)
 *   SHOPIFY_ADMIN_API_VERSION     default 2025-10
 */

const env = process.env;

export const shopDomain = (): string =>
  (env.SHOPIFY_STORE_DOMAIN || env.VITE_SHOPIFY_STORE_DOMAIN || '').replace(/^https?:\/\//, '').replace(/\/+$/, '');

const adminVersion = () => env.SHOPIFY_ADMIN_API_VERSION || '2025-10';

export const adminConfigured = (): boolean =>
  Boolean(shopDomain() && (env.SHOPIFY_ADMIN_ACCESS_TOKEN || (env.SHOPIFY_CLIENT_ID && env.SHOPIFY_CLIENT_SECRET)));

// ---------------------------------------------------------------------------
// Admin API
// ---------------------------------------------------------------------------

let cachedToken: { value: string; expiresAt: number } | null = null;

async function adminToken(): Promise<string> {
  if (env.SHOPIFY_ADMIN_ACCESS_TOKEN) return env.SHOPIFY_ADMIN_ACCESS_TOKEN;
  if (cachedToken && cachedToken.expiresAt > Date.now() + 60_000) return cachedToken.value;

  const res = await fetch(`https://${shopDomain()}/admin/oauth/access_token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({
      client_id: env.SHOPIFY_CLIENT_ID,
      client_secret: env.SHOPIFY_CLIENT_SECRET,
      grant_type: 'client_credentials',
    }),
  });
  if (!res.ok) {
    console.error('[shopify] client-credentials token request failed', res.status);
    throw new ApiError(502, 'admin_auth', 'The store connection is not set up correctly. Please contact support.');
  }
  const json = (await res.json()) as { access_token: string; expires_in?: number };
  cachedToken = { value: json.access_token, expiresAt: Date.now() + (json.expires_in ?? 86_000) * 1000 };
  return cachedToken.value;
}

interface GraphQLResult<T> {
  data?: T;
  errors?: { message: string; extensions?: { code?: string } }[];
}

export async function adminGraphQL<T>(query: string, variables: Record<string, unknown> = {}): Promise<T> {
  for (let attempt = 0; attempt < 3; attempt++) {
    let res: Response;
    try {
      res = await fetch(`https://${shopDomain()}/admin/api/${adminVersion()}/graphql.json`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          'X-Shopify-Access-Token': await adminToken(),
        },
        body: JSON.stringify({ query, variables }),
      });
    } catch (e) {
      if (e instanceof ApiError) throw e;
      throw new ApiError(502, 'shopify_unreachable', 'Could not reach the store. Please try again.');
    }

    if (res.status === 429) {
      await sleep(1000 * (attempt + 1));
      continue;
    }
    if (res.status === 401 || res.status === 403) {
      console.error('[shopify] Admin API rejected the token', res.status);
      throw new ApiError(502, 'admin_auth', 'The store connection is not set up correctly. Please contact support.');
    }
    if (!res.ok) {
      console.error('[shopify] Admin API HTTP', res.status);
      throw new ApiError(502, 'shopify_error', 'The store is having trouble right now. Please try again.');
    }

    const json = (await res.json()) as GraphQLResult<T>;
    if (json.errors?.length) {
      if (json.errors.some((e) => e.extensions?.code === 'THROTTLED') && attempt < 2) {
        await sleep(1200 * (attempt + 1));
        continue;
      }
      console.error('[shopify] Admin GraphQL errors', JSON.stringify(json.errors));
      throw new ShopifyGraphQLError(json.errors.map((e) => e.message).join('; '));
    }
    return json.data as T;
  }
  throw new ApiError(503, 'throttled', 'The store is busy. Please try again in a moment.');
}

/** A top-level GraphQL error (bad field/enum for this API version, etc.) — callers may retry with a fallback. */
export class ShopifyGraphQLError extends ApiError {
  constructor(message: string) {
    super(502, 'shopify_error', 'The store could not process this request. Please try again.');
    this.detail = message;
  }
  detail: string;
}

// ---------------------------------------------------------------------------
// Customer Account API — identity only
// ---------------------------------------------------------------------------

interface Discovery {
  graphql_api?: string;
}

const DISCOVERY_TTL = 60 * 60 * 1000;
let customerApi: { url: string; at: number } | null = null;

async function customerApiUrl(): Promise<string> {
  if (customerApi && Date.now() - customerApi.at < DISCOVERY_TTL) return customerApi.url;
  const res = await fetch(`https://${shopDomain()}/.well-known/customer-account-api`);
  if (!res.ok) throw new ApiError(503, 'customer_accounts', 'Customer accounts are not enabled on this store.');
  const json = (await res.json()) as Discovery;
  if (!json.graphql_api) throw new ApiError(503, 'customer_accounts', 'Customer accounts are not enabled on this store.');
  customerApi = { url: json.graphql_api, at: Date.now() };
  return json.graphql_api;
}

export async function customerAccountQuery<T>(accessToken: string, query: string, origin: string): Promise<T> {
  let res: Response;
  try {
    res = await fetch(await customerApiUrl(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        // Raw token — the Customer Account API does not take a "Bearer " prefix.
        Authorization: accessToken,
        Origin: origin,
      },
      body: JSON.stringify({ query }),
    });
  } catch (e) {
    if (e instanceof ApiError) throw e;
    throw new ApiError(502, 'shopify_unreachable', 'Could not reach the store. Please try again.');
  }
  if (res.status === 401 || res.status === 403) {
    throw new ApiError(401, 'unauthorized', 'Your session has expired. Please sign in again.');
  }
  if (!res.ok) throw new ApiError(502, 'shopify_error', 'The store is having trouble right now. Please try again.');
  const json = (await res.json()) as GraphQLResult<T>;
  if (json.errors?.length) {
    console.error('[shopify] Customer Account API errors', JSON.stringify(json.errors));
    throw new ApiError(502, 'shopify_error', 'The store is having trouble right now. Please try again.');
  }
  return json.data as T;
}

export interface VerifiedCustomer {
  /** gid://shopify/Customer/… */
  id: string;
  numericId: string;
  email: string;
}

export interface CustomerProfileData {
  customer: {
    id: string;
    firstName?: string | null;
    lastName?: string | null;
    emailAddress?: { emailAddress?: string | null } | null;
    phoneNumber?: { phoneNumber?: string | null } | null;
  } | null;
}

export const PROFILE_QUERY = `{ customer { id firstName lastName emailAddress { emailAddress } phoneNumber { phoneNumber } } }`;

const verified = new Map<string, { customer: VerifiedCustomer; expires: number }>();

export const bearerToken = (req: ApiRequest): string => {
  const h = req.headers['authorization'];
  const value = Array.isArray(h) ? h[0] : h;
  const m = value?.match(/^Bearer\s+(.+)$/i);
  if (!m) throw new ApiError(401, 'unauthorized', 'Please sign in to continue.');
  return m[1].trim();
};

/** Proves the caller's identity with Shopify itself. Short-lived in-memory cache keeps page loads to one round-trip. */
export async function verifyCustomer(req: ApiRequest): Promise<VerifiedCustomer> {
  const token = bearerToken(req);
  const hit = verified.get(token);
  if (hit && hit.expires > Date.now()) return hit.customer;

  const data = await customerAccountQuery<CustomerProfileData>(token, PROFILE_QUERY, siteOrigin(req));
  const c = data.customer;
  const email = c?.emailAddress?.emailAddress;
  if (!c?.id || !email) throw new ApiError(401, 'unauthorized', 'Your session has expired. Please sign in again.');

  const customer: VerifiedCustomer = { id: c.id, numericId: c.id.split('/').pop() as string, email: email.toLowerCase() };
  if (verified.size > 500) verified.clear();
  verified.set(token, { customer, expires: Date.now() + 60_000 });
  return customer;
}

// ---------------------------------------------------------------------------
// OAuth discovery (used by api/auth.ts)
// ---------------------------------------------------------------------------

export interface OpenIdConfig {
  authorization_endpoint: string;
  token_endpoint: string;
  end_session_endpoint?: string;
}

let openId: { cfg: OpenIdConfig; at: number } | null = null;

export async function openIdConfig(): Promise<OpenIdConfig> {
  if (openId && Date.now() - openId.at < DISCOVERY_TTL) return openId.cfg;
  const res = await fetch(`https://${shopDomain()}/.well-known/openid-configuration`);
  if (!res.ok) throw new ApiError(503, 'customer_accounts', 'Customer accounts are not enabled on this store.');
  const cfg = (await res.json()) as OpenIdConfig;
  if (!cfg.authorization_endpoint || !cfg.token_endpoint) {
    throw new ApiError(503, 'customer_accounts', 'Customer accounts are not enabled on this store.');
  }
  openId = { cfg, at: Date.now() };
  return cfg;
}
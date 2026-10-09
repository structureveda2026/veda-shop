import { isShopifyEnabled } from './shopify';
import type { CustomerProfile } from '../types/orders';

/**
 * Shopify Customer Account sign-in (OAuth 2.0 authorization-code + PKCE, public client).
 *
 * The customer signs in on Shopify's own secure page (email one-time code / Shop), so there is no
 * password stored or typed on this site — and every order Shopify creates for them is tied to that
 * account. Legacy password logins (Storefront `customerAccessTokenCreate`) are deprecated by Shopify.
 *
 * INACTIVE BY DEFAULT: only turns on when both of these are set (see .env.example):
 *   VITE_SHOPIFY_STORE_DOMAIN + VITE_SHOPIFY_STOREFRONT_TOKEN      (already used by the cart)
 *   VITE_SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_ID                         (Headless channel → Customer Account API)
 * Without it the site keeps its original local demo sign-in.
 *
 * Token endpoints are reached through /api/auth (api/auth.ts) because Shopify only accepts them from
 * the registered JavaScript origin. Tokens live in localStorage: the access token is short-lived and
 * only identifies the buyer to Shopify; the Admin token never leaves the server.
 */

const env = ((import.meta as unknown as { env?: Record<string, string | undefined> }).env ?? {});
const CLIENT_ID = env.VITE_SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_ID || '';
const AUTH_API = env.VITE_AUTH_API_URL || '/api/auth';

export const isCustomerAccountEnabled = (): boolean => isShopifyEnabled() && Boolean(CLIENT_ID);

const TOKENS_KEY = 'vedic_ca_tokens';
const PKCE_KEY = 'vedic_ca_pkce';

export class AuthApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = 'AuthApiError';
    this.status = status;
  }
}

interface Tokens {
  accessToken: string;
  refreshToken: string | null;
  idToken: string | null;
  /** epoch ms */
  expiresAt: number;
}

// ---------------------------------------------------------------------------
// token storage
// ---------------------------------------------------------------------------

const readTokens = (): Tokens | null => {
  try {
    const raw = localStorage.getItem(TOKENS_KEY);
    return raw ? (JSON.parse(raw) as Tokens) : null;
  } catch {
    return null;
  }
};

const saveTokens = (t: Tokens) => {
  try {
    localStorage.setItem(TOKENS_KEY, JSON.stringify(t));
  } catch {
    /* storage unavailable — the session just won't survive a reload */
  }
};

export const clearTokens = () => {
  try {
    localStorage.removeItem(TOKENS_KEY);
  } catch {
    /* ignore */
  }
};

/** True when a Shopify sign-in is remembered in this browser (it may still need a refresh). */
export const hasStoredSession = (): boolean => Boolean(readTokens());

// ---------------------------------------------------------------------------
// helpers
// ---------------------------------------------------------------------------

const b64url = (bytes: Uint8Array): string => {
  let s = '';
  bytes.forEach((b) => (s += String.fromCharCode(b)));
  return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
};

const randomString = (bytes = 32): string => b64url(crypto.getRandomValues(new Uint8Array(bytes)));

const sha256 = async (value: string): Promise<Uint8Array> =>
  new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value)));

const redirectUri = (): string => `${window.location.origin}/account/callback`;

const jwtPayload = (jwt: string): Record<string, unknown> => {
  try {
    const part = jwt.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(atob(part.padEnd(part.length + ((4 - (part.length % 4)) % 4), '=')));
  } catch {
    return {};
  }
};

async function authApi<T>(path: string, init?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${AUTH_API}${path}`, init);
  } catch {
    throw new AuthApiError('Could not reach the server. Check your connection and try again.', 0);
  }
  const text = await res.text();
  let json: { error?: { message?: string } } & Record<string, unknown>;
  try {
    json = JSON.parse(text);
  } catch {
    throw new AuthApiError('Sign-in service is not available. (Run the site with `vercel dev` or deploy it to Vercel.)', res.status || 404);
  }
  if (!res.ok) throw new AuthApiError(json.error?.message || 'Something went wrong. Please try again.', res.status);
  return json as T;
}

interface TokenReply {
  accessToken: string;
  refreshToken: string | null;
  idToken: string | null;
  expiresIn: number;
}

const toTokens = (r: TokenReply, previous?: Tokens | null): Tokens => ({
  accessToken: r.accessToken,
  refreshToken: r.refreshToken ?? previous?.refreshToken ?? null,
  idToken: r.idToken ?? previous?.idToken ?? null,
  expiresAt: Date.now() + r.expiresIn * 1000,
});

// ---------------------------------------------------------------------------
// sign in
// ---------------------------------------------------------------------------

/** Sends the visitor to Shopify's sign-in page. Never returns (the page navigates away). */
export async function startLogin(options: { returnTo?: string; loginHint?: string } = {}): Promise<void> {
  const config = await authApi<{ authorizationEndpoint: string }>('?action=config');

  const verifier = randomString(48);
  const state = randomString(16);
  const nonce = randomString(16);
  const challenge = b64url(await sha256(verifier));

  try {
    sessionStorage.setItem(
      PKCE_KEY,
      JSON.stringify({ verifier, state, nonce, returnTo: options.returnTo || window.location.pathname + window.location.search })
    );
  } catch {
    throw new AuthApiError('Your browser is blocking storage, so sign-in cannot continue.', 0);
  }

  const url = new URL(config.authorizationEndpoint);
  url.search = new URLSearchParams({
    scope: 'openid email customer-account-api:full',
    client_id: CLIENT_ID,
    response_type: 'code',
    redirect_uri: redirectUri(),
    state,
    nonce,
    code_challenge: challenge,
    code_challenge_method: 'S256',
    ...(options.loginHint ? { login_hint: options.loginHint } : {}),
  }).toString();
  window.location.assign(url.toString());
}

let exchanging: { code: string; promise: Promise<{ returnTo: string }> } | null = null;

/** Finishes sign-in on /account/callback: checks `state`, swaps the code for tokens. Safe to call twice (React StrictMode). */
export function completeLogin(params: URLSearchParams): Promise<{ returnTo: string }> {
  const code = params.get('code') || '';
  if (exchanging && exchanging.code === code) return exchanging.promise;

  const promise = (async () => {
    const error = params.get('error');
    if (error) throw new AuthApiError(params.get('error_description') || 'Sign-in was cancelled.', 400);
    if (!code) throw new AuthApiError('Sign-in link is incomplete. Please try again.', 400);

    let saved: { verifier: string; state: string; nonce: string; returnTo: string } | null = null;
    try {
      saved = JSON.parse(sessionStorage.getItem(PKCE_KEY) || 'null');
    } catch {
      saved = null;
    }
    if (!saved || saved.state !== params.get('state')) {
      throw new AuthApiError('This sign-in session has expired. Please start again.', 400);
    }

    const reply = await authApi<TokenReply>('', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'token', code, codeVerifier: saved.verifier, redirectUri: redirectUri() }),
    });
    if (reply.idToken && jwtPayload(reply.idToken).nonce !== saved.nonce) {
      throw new AuthApiError('Sign-in could not be verified. Please try again.', 400);
    }

    saveTokens(toTokens(reply));
    try {
      sessionStorage.removeItem(PKCE_KEY);
    } catch {
      /* ignore */
    }
    return { returnTo: saved.returnTo || '/account' };
  })();

  exchanging = { code, promise };
  return promise;
}

// ---------------------------------------------------------------------------
// access token
// ---------------------------------------------------------------------------

let refreshing: Promise<string | null> | null = null;

/** A valid access token, refreshed when it's about to expire. null = the visitor isn't (or is no longer) signed in. */
export async function getAccessToken(forceRefresh = false): Promise<string | null> {
  const tokens = readTokens();
  if (!tokens) return null;
  if (!forceRefresh && tokens.expiresAt - 60_000 > Date.now()) return tokens.accessToken;
  if (!tokens.refreshToken) {
    if (!forceRefresh && tokens.expiresAt > Date.now()) return tokens.accessToken;
    clearTokens();
    return null;
  }

  if (!refreshing) {
    refreshing = authApi<TokenReply>('', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'refresh', refreshToken: tokens.refreshToken }),
    })
      .then((reply) => {
        const next = toTokens(reply, tokens);
        saveTokens(next);
        return next.accessToken;
      })
      .catch((err) => {
        // Only an outright rejection ends the session — a network blip shouldn't sign people out.
        if (err instanceof AuthApiError && err.status >= 400 && err.status < 500) clearTokens();
        return null;
      })
      .finally(() => {
        refreshing = null;
      });
  }
  return refreshing;
}

export async function fetchProfile(token: string): Promise<CustomerProfile> {
  const reply = await authApi<{ profile: CustomerProfile }>('?action=profile', { headers: { Authorization: `Bearer ${token}` } });
  return reply.profile;
}

// ---------------------------------------------------------------------------
// sign out
// ---------------------------------------------------------------------------

/**
 * Forgets the session here and also ends it on Shopify (so a shared computer isn't signed in again silently).
 * Needs the site's origin registered under "Logout URI" in the Customer Account API settings.
 */
export async function signOut(): Promise<void> {
  const tokens = readTokens();
  clearTokens();
  if (!tokens?.idToken) return;
  try {
    const config = await authApi<{ endSessionEndpoint: string | null }>('?action=config');
    if (!config.endSessionEndpoint) return;
    const url = new URL(config.endSessionEndpoint);
    url.searchParams.set('id_token_hint', tokens.idToken);
    url.searchParams.set('post_logout_redirect_uri', window.location.origin);
    window.location.assign(url.toString());
  } catch {
    /* the local session is already gone — that's enough */
  }
}
import { ApiError, ApiRequest, ApiResponse, bodyObject, header, noStore, queryParam, sendError, siteOrigin } from './_lib/http.js';
import {
  adminConfigured,
  bearerToken,
  customerAccountQuery,
  CustomerProfileData,
  openIdConfig,
  PROFILE_QUERY,
  shopDomain,
} from './_lib/shopifyAdmin.js';
import type { CustomerProfile } from '../src/types/orders';

/**
 * Thin, fixed-purpose proxy for Shopify's Customer Account OAuth (authorization-code + PKCE, public client).
 * The browser does the redirect to Shopify's own sign-in page; these calls just do the parts that
 * Shopify only allows from a registered origin, and keep the site free of CORS surprises.
 *
 *   GET  /api/auth?action=config   → { authorizationEndpoint, endSessionEndpoint }
 *   POST /api/auth { action:'token',   code, codeVerifier, redirectUri }
 *   POST /api/auth { action:'refresh', refreshToken }
 *   GET  /api/auth?action=profile  (Authorization: Bearer <access token>) → { profile }
 *
 * Env: SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_ID (or VITE_SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_ID) — from the Headless
 * channel → Customer Account API settings. Callback URI = https://<your-site>/account/callback.
 */

const clientId = () => process.env.SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_ID || process.env.VITE_SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_ID || '';

interface TokenResponse {
  access_token?: string;
  refresh_token?: string;
  id_token?: string;
  expires_in?: number;
  error?: string;
  error_description?: string;
}

async function tokenRequest(req: ApiRequest, params: Record<string, string>) {
  const cfg = await openIdConfig();
  let res: Response;
  try {
    res = await fetch(cfg.token_endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Accept: 'application/json',
        Origin: siteOrigin(req),
      },
      body: new URLSearchParams({ client_id: clientId(), ...params }).toString(),
    });
  } catch {
    throw new ApiError(502, 'shopify_unreachable', 'Could not reach the store. Please try again.');
  }
  const json = (await res.json().catch(() => ({}))) as TokenResponse;
  if (!res.ok || !json.access_token) {
    console.error('[auth] token endpoint error', res.status, json.error, json.error_description);
    throw new ApiError(401, 'sign_in_failed', 'Sign-in could not be completed. Please try again.');
  }
  return {
    accessToken: json.access_token,
    refreshToken: json.refresh_token ?? null,
    idToken: json.id_token ?? null,
    expiresIn: json.expires_in ?? 3600,
  };
}

export default async function handler(req: ApiRequest, res: ApiResponse) {
  try {
    noStore(res);
    if (!shopDomain() || !clientId()) throw new ApiError(503, 'not_configured', 'Sign-in is not available yet.');

    if (req.method === 'GET') {
      const action = queryParam(req, 'action');
      if (action === 'config') {
        const cfg = await openIdConfig();
        res.status(200).json({ authorizationEndpoint: cfg.authorization_endpoint, endSessionEndpoint: cfg.end_session_endpoint ?? null, ordersEnabled: adminConfigured() });
        return;
      }
      if (action === 'profile') {
        const data = await customerAccountQuery<CustomerProfileData>(bearerToken(req), PROFILE_QUERY, siteOrigin(req));
        const c = data.customer;
        if (!c?.id) throw new ApiError(401, 'unauthorized', 'Your session has expired. Please sign in again.');
        const profile: CustomerProfile = {
          id: c.id,
          email: c.emailAddress?.emailAddress ?? '',
          firstName: c.firstName ?? '',
          lastName: c.lastName ?? '',
          phone: c.phoneNumber?.phoneNumber ?? '',
        };
        res.status(200).json({ profile });
        return;
      }
      throw new ApiError(400, 'bad_request', 'Unknown action.');
    }

    if (req.method === 'POST') {
      const body = bodyObject(req);
      if (body.action === 'token') {
        const code = String(body.code ?? '');
        const verifier = String(body.codeVerifier ?? '');
        const redirectUri = String(body.redirectUri ?? '');
        if (!code || !verifier || !redirectUri) throw new ApiError(400, 'bad_request', 'Missing sign-in details.');
        // The callback must live on this site — stops the endpoint being used to redeem codes for other apps.
        let sameSite = false;
        try {
          const u = new URL(redirectUri);
          sameSite = u.origin === siteOrigin(req) || u.host === header(req, 'host');
        } catch {
          /* not a URL */
        }
        if (!sameSite) throw new ApiError(400, 'bad_request', 'Invalid redirect.');
        res.status(200).json(await tokenRequest(req, { grant_type: 'authorization_code', redirect_uri: redirectUri, code, code_verifier: verifier }));
        return;
      }
      if (body.action === 'refresh') {
        const refreshToken = String(body.refreshToken ?? '');
        if (!refreshToken) throw new ApiError(400, 'bad_request', 'Missing refresh token.');
        res.status(200).json(await tokenRequest(req, { grant_type: 'refresh_token', refresh_token: refreshToken }));
        return;
      }
      throw new ApiError(400, 'bad_request', 'Unknown action.');
    }

    res.setHeader('Allow', 'GET, POST');
    throw new ApiError(405, 'method_not_allowed', 'Method not allowed.');
  } catch (err) {
    sendError(res, err);
  }
}
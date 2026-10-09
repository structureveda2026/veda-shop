/**
 * Minimal request/response contract for the Vercel serverless functions in /api — declared here
 * so the functions need no extra dependency (@vercel/node) to type-check.
 */
export interface ApiRequest {
  method?: string;
  headers: Record<string, string | string[] | undefined>;
  query: Record<string, string | string[] | undefined>;
  body?: unknown;
}

export interface ApiResponse {
  status(code: number): ApiResponse;
  json(body: unknown): void;
  setHeader(name: string, value: string): void;
}

export class ApiError extends Error {
  status: number;
  code: string;
  constructor(status: number, code: string, message: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
  }
}

export const header = (req: ApiRequest, name: string): string => {
  const v = req.headers[name.toLowerCase()];
  return (Array.isArray(v) ? v[0] : v) ?? '';
};

export const queryParam = (req: ApiRequest, name: string): string => {
  const v = req.query?.[name];
  return (Array.isArray(v) ? v[0] : v) ?? '';
};

export const bodyObject = (req: ApiRequest): Record<string, unknown> => {
  const b = req.body;
  if (b && typeof b === 'object') return b as Record<string, unknown>;
  if (typeof b === 'string' && b.trim()) {
    try {
      const parsed = JSON.parse(b);
      if (parsed && typeof parsed === 'object') return parsed as Record<string, unknown>;
    } catch {
      /* falls through */
    }
  }
  throw new ApiError(400, 'bad_request', 'Request body must be JSON.');
};

/** The site's own origin — Shopify's customer-account endpoints require it to match a registered JavaScript origin. */
export const siteOrigin = (req: ApiRequest): string => {
  const fromHeader = header(req, 'origin');
  if (fromHeader) return fromHeader;
  if (process.env.SITE_ORIGIN) return process.env.SITE_ORIGIN.replace(/\/+$/, '');
  const host = header(req, 'x-forwarded-host') || header(req, 'host');
  const proto = header(req, 'x-forwarded-proto') || (host.startsWith('localhost') ? 'http' : 'https');
  return `${proto}://${host}`;
};

export const sendError = (res: ApiResponse, err: unknown) => {
  if (err instanceof ApiError) {
    res.status(err.status).json({ error: { code: err.code, message: err.message } });
    return;
  }
  console.error('[api] unexpected error', err);
  res.status(500).json({ error: { code: 'internal', message: 'Something went wrong. Please try again.' } });
};

export const noStore = (res: ApiResponse) => {
  res.setHeader('Cache-Control', 'no-store');
};

export const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));
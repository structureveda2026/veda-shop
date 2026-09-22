import type { CartItem } from '../types/ecommerce';

/**
 * Shopify Storefront API — cart client.
 *
 * INACTIVE BY DEFAULT: nothing here makes a network call until both of these are set in `.env`
 * (see .env.example) — until then the cart runs on local demo data exactly as before.
 *
 *   VITE_SHOPIFY_STORE_DOMAIN=your-store.myshopify.com
 *   VITE_SHOPIFY_STOREFRONT_TOKEN=<Storefront API public access token>
 *
 * Optional:
 *   VITE_SHOPIFY_API_VERSION=2026-01   (Storefront API version)
 *   VITE_SHOPIFY_COUNTRY=IN            (buyer country for pricing/markets)
 *
 * Only the Cart API is used (cartCreate / cartLinesAdd / cartLinesUpdate / cartLinesRemove / cart)
 * — every mutation returns the full updated cart, so no extra re-fetch is ever needed.
 */

const env = ((import.meta as unknown as { env?: Record<string, string | undefined> }).env ?? {});

const STORE_DOMAIN = (env.VITE_SHOPIFY_STORE_DOMAIN || '').replace(/^https?:\/\//, '').replace(/\/+$/, '');
const STOREFRONT_TOKEN = env.VITE_SHOPIFY_STOREFRONT_TOKEN || '';
const API_VERSION = env.VITE_SHOPIFY_API_VERSION || '2026-01';
const BUYER_COUNTRY = env.VITE_SHOPIFY_COUNTRY || 'IN';

const ENDPOINT = `https://${STORE_DOMAIN}/api/${API_VERSION}/graphql.json`;

export const isShopifyEnabled = (): boolean => Boolean(STORE_DOMAIN && STOREFRONT_TOKEN);

/** 'user' = Shopify understood the request but refused it (e.g. the cart no longer exists). */
export class ShopifyError extends Error {
  kind: 'request' | 'graphql' | 'user';
  constructor(message: string, kind: 'request' | 'graphql' | 'user') {
    super(message);
    this.name = 'ShopifyError';
    this.kind = kind;
  }
}

export async function storefront<T>(query: string, variables: Record<string, unknown> = {}): Promise<T> {
  let res: Response;
  try {
    res = await fetch(ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'X-Shopify-Storefront-Access-Token': STOREFRONT_TOKEN,
      },
      body: JSON.stringify({ query, variables }),
    });
  } catch {
    throw new ShopifyError('Could not reach Shopify', 'request');
  }

  if (!res.ok) throw new ShopifyError(`Shopify responded with ${res.status}`, 'request');

  const json = (await res.json()) as { data?: T; errors?: { message: string }[] };
  if (json.errors?.length) {
    throw new ShopifyError(json.errors.map((e) => e.message).join('; '), 'graphql');
  }
  return json.data as T;
}

// ---------------------------------------------------------------------------
// Cart
// ---------------------------------------------------------------------------

export interface ShopifyCartLine {
  id: string; // cart line id
  quantity: number;
  variantId: string; // ProductVariant gid — what the local cart is matched on
}

export interface ShopifyCartSnapshot {
  id: string;
  checkoutUrl: string;
  lines: ShopifyCartLine[];
}

interface RawCart {
  id: string;
  checkoutUrl: string;
  lines: { nodes: { id: string; quantity: number; merchandise?: { id?: string } }[] };
}

interface CartPayload {
  cart: RawCart | null;
  userErrors: { message: string }[];
}

const CART_FIELDS = `
  fragment CartFields on Cart {
    id
    checkoutUrl
    lines(first: 100) {
      nodes {
        id
        quantity
        merchandise { ... on ProductVariant { id } }
      }
    }
  }
`;

function toSnapshot(cart: RawCart): ShopifyCartSnapshot {
  return {
    id: cart.id,
    checkoutUrl: cart.checkoutUrl,
    lines: cart.lines.nodes
      .filter((n) => n.merchandise?.id)
      .map((n) => ({ id: n.id, quantity: n.quantity, variantId: n.merchandise!.id as string })),
  };
}

function unwrap(payload: CartPayload | null | undefined): ShopifyCartSnapshot {
  if (!payload) throw new ShopifyError('Empty response from Shopify', 'graphql');
  if (payload.userErrors?.length) {
    throw new ShopifyError(payload.userErrors.map((e) => e.message).join('; '), 'user');
  }
  if (!payload.cart) throw new ShopifyError('Shopify returned no cart', 'user');
  return toSnapshot(payload.cart);
}

/** Returns null when the cart no longer exists (expired, or already checked out). */
export async function fetchCart(cartId: string): Promise<ShopifyCartSnapshot | null> {
  const data = await storefront<{ cart: RawCart | null }>(
    `query Cart($id: ID!) { cart(id: $id) { ...CartFields } } ${CART_FIELDS}`,
    { id: cartId }
  );
  return data.cart ? toSnapshot(data.cart) : null;
}

export async function createCart(lines: { merchandiseId: string; quantity: number }[]) {
  const data = await storefront<{ cartCreate: CartPayload }>(
    `mutation CartCreate($lines: [CartLineInput!]!, $buyerIdentity: CartBuyerIdentityInput) {
       cartCreate(input: { lines: $lines, buyerIdentity: $buyerIdentity }) {
         cart { ...CartFields }
         userErrors { message }
       }
     } ${CART_FIELDS}`,
    { lines, buyerIdentity: { countryCode: BUYER_COUNTRY } }
  );
  return unwrap(data.cartCreate);
}

export async function addCartLines(cartId: string, lines: { merchandiseId: string; quantity: number }[]) {
  const data = await storefront<{ cartLinesAdd: CartPayload }>(
    `mutation CartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {
       cartLinesAdd(cartId: $cartId, lines: $lines) {
         cart { ...CartFields }
         userErrors { message }
       }
     } ${CART_FIELDS}`,
    { cartId, lines }
  );
  return unwrap(data.cartLinesAdd);
}

export async function updateCartLines(cartId: string, lines: { id: string; quantity: number }[]) {
  const data = await storefront<{ cartLinesUpdate: CartPayload }>(
    `mutation CartLinesUpdate($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
       cartLinesUpdate(cartId: $cartId, lines: $lines) {
         cart { ...CartFields }
         userErrors { message }
       }
     } ${CART_FIELDS}`,
    { cartId, lines }
  );
  return unwrap(data.cartLinesUpdate);
}

export async function removeCartLines(cartId: string, lineIds: string[]) {
  const data = await storefront<{ cartLinesRemove: CartPayload }>(
    `mutation CartLinesRemove($cartId: ID!, $lineIds: [ID!]!) {
       cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
         cart { ...CartFields }
         userErrors { message }
       }
     } ${CART_FIELDS}`,
    { cartId, lineIds }
  );
  return unwrap(data.cartLinesRemove);
}

// ---------------------------------------------------------------------------
// Product → Shopify variant
// ---------------------------------------------------------------------------

interface VariantInfo {
  id: string;
  title: string;
  availableForSale: boolean;
}

const variantCache = new Map<string, Promise<VariantInfo[] | null>>();
const warnedMissing = new Set<string>();

function fetchProductVariants(handle: string): Promise<VariantInfo[] | null> {
  let pending = variantCache.get(handle);
  if (!pending) {
    pending = storefront<{ product: { variants: { nodes: VariantInfo[] } } | null }>(
      `query ProductVariants($handle: String!) {
         product(handle: $handle) {
           variants(first: 100) { nodes { id title availableForSale } }
         }
       }`,
      { handle }
    ).then((data) => (data.product ? data.product.variants.nodes : null));
    variantCache.set(handle, pending);
    // A failed lookup must not be cached — the next sync retries it.
    pending.catch(() => variantCache.delete(handle));
  }
  return pending;
}

const isVariantGid = (id?: string): boolean => Boolean(id && id.startsWith('gid://shopify/ProductVariant/'));

/**
 * Finds the Shopify ProductVariant a local cart line stands for, or null if the item isn't a
 * Shopify product (demo data) — in which case it simply stays a local-only line.
 *
 *  1. an id that already is a ProductVariant gid (selectedVariant.id, then product.id)
 *  2. otherwise product.slug is treated as the Shopify product handle: the variant whose title
 *     matches the chosen variant/size, else the first variant that's available for sale.
 */
export async function resolveMerchandiseId(item: CartItem): Promise<string | null> {
  const { product, selectedVariant, selectedSize } = item;

  if (isVariantGid(selectedVariant?.id)) return selectedVariant!.id;
  if (isVariantGid(product.id)) return product.id;

  const handle = product.slug;
  if (!handle) return null;

  const variants = await fetchProductVariants(handle);
  if (!variants || variants.length === 0) {
    if (!warnedMissing.has(handle)) {
      warnedMissing.add(handle);
      console.warn(`[Shopify] No product with handle "${handle}" — it stays a local-only cart line.`);
    }
    return null;
  }

  const wanted = [selectedVariant?.name, selectedSize]
    .filter((v): v is string => Boolean(v))
    .map((v) => v.trim().toLowerCase());

  const byTitle = variants.find((v) => wanted.includes(v.title.trim().toLowerCase()));
  return (byTitle ?? variants.find((v) => v.availableForSale) ?? variants[0]).id;
}

// ---------------------------------------------------------------------------
// Product media (images + videos, in the order the owner arranged them in Shopify admin)
// ---------------------------------------------------------------------------

export interface ProductMediaItem {
  id: string;
  /** 'video' = Shopify-hosted file (play with <video>), 'embed' = YouTube/Vimeo (play in an iframe). */
  kind: 'image' | 'video' | 'embed';
  /** image: the image · video: fallback file · embed: the embed URL */
  url: string;
  /** still frame for videos / embeds */
  poster?: string;
  alt?: string;
  /** video only: playable files, best first — the browser plays the first one it supports */
  sources?: { url: string; mimeType: string }[];
}

interface RawMedia {
  id: string;
  mediaContentType: 'IMAGE' | 'VIDEO' | 'EXTERNAL_VIDEO' | 'MODEL_3D';
  alt?: string | null;
  previewImage?: { url: string } | null;
  image?: { url: string } | null;
  sources?: { url: string; mimeType: string; height?: number }[];
  embedUrl?: string;
}

const mediaCache = new Map<string, Promise<ProductMediaItem[] | null>>();

/**
 * Everything the owner has uploaded for a product in Shopify admin (Products → Media), in their
 * order. Returns null when no product has that handle, [] when it has no supported media.
 * Cached per handle for the page's lifetime; a fresh page load always sees new uploads.
 */
export function fetchProductMedia(handle: string): Promise<ProductMediaItem[] | null> {
  let pending = mediaCache.get(handle);
  if (!pending) {
    pending = storefront<{ product: { media: { nodes: RawMedia[] } } | null }>(
      `query ProductMedia($handle: String!) {
         product(handle: $handle) {
           media(first: 50) {
             nodes {
               id
               mediaContentType
               alt
               previewImage { url }
               ... on MediaImage { image { url } }
               ... on Video { sources { url mimeType height } }
               ... on ExternalVideo { embedUrl }
             }
           }
         }
       }`,
      { handle }
    ).then((data) => (data.product ? data.product.media.nodes.flatMap(toMediaItem) : null));
    mediaCache.set(handle, pending);
    pending.catch(() => mediaCache.delete(handle));
  }
  return pending;
}

function toMediaItem(m: RawMedia): ProductMediaItem[] {
  const poster = m.previewImage?.url;
  const alt = m.alt || undefined;

  if (m.mediaContentType === 'IMAGE' && (m.image?.url || poster)) {
    return [{ id: m.id, kind: 'image', url: (m.image?.url || poster) as string, alt }];
  }

  if (m.mediaContentType === 'VIDEO' && m.sources?.length) {
    // mp4 first (tallest first), the HLS stream last for browsers that only speak that (Safari).
    const files = m.sources.filter((s) => s.mimeType === 'video/mp4').sort((a, b) => (b.height ?? 0) - (a.height ?? 0));
    const hls = m.sources.filter((s) => s.mimeType !== 'video/mp4');
    const sources = [...files, ...hls].map((s) => ({ url: s.url, mimeType: s.mimeType }));
    return [{ id: m.id, kind: 'video', url: sources[0].url, poster, alt, sources }];
  }

  if (m.mediaContentType === 'EXTERNAL_VIDEO' && m.embedUrl) {
    return [{ id: m.id, kind: 'embed', url: m.embedUrl, poster, alt }];
  }

  return []; // 3D models etc. aren't shown in the gallery
}
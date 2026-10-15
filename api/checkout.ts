import { ApiError, ApiRequest, ApiResponse, bodyObject, noStore, sendError } from './_lib/http.js';
import { adminConfigured, adminGraphQL, verifyCustomer } from './_lib/shopifyAdmin.js';

/**
 * Cash on Delivery (COD) checkout. Online payments never come through here — they go to Shopify's
 * own hosted checkout (see CartContext.beginCheckout). COD has no payment step, so the order is
 * created directly in Shopify as a "payment pending" order:
 *
 *   GET  /api/checkout                          → { cod: { enabled, fee, maxOrderValue } }   (public, no login needed)
 *   POST /api/checkout { action: 'cod', … }     → { order: { id, name } }                    (signed-in customer only)
 *
 * Safety: the browser only sends WHICH variants + quantities + address. Prices, stock, shipping,
 * COD fee and coupon discount are all worked out here from Shopify's own data, so nothing the
 * browser sends can change what the customer is charged.
 *
 * Needs the Admin API scopes: write_draft_orders, read_draft_orders (plus the ones the orders API already uses).
 *
 * Env (server-side only, Vercel → Settings → Environment Variables):
 *   COD_ENABLED          "true" (default) / "false" — switch COD off without redeploying code
 *   COD_FEE              extra COD handling charge in ₹ (default 0)
 *   COD_MAX_ORDER_VALUE  highest order total allowed for COD in ₹ (default 25000)
 *   SHIPPING_FEE         shipping charge below the free-shipping limit in ₹ (default 70)
 *   FREE_SHIPPING_ABOVE  free shipping at/above this subtotal in ₹ (default 999)
 */

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const num = (name: string, fallback: number): number => {
  const n = Number(process.env[name]);
  return Number.isFinite(n) && n >= 0 ? n : fallback;
};

const codConfig = () => ({
  enabled: adminConfigured() && (process.env.COD_ENABLED ?? 'true').toLowerCase() !== 'false',
  fee: num('COD_FEE', 0),
  maxOrderValue: num('COD_MAX_ORDER_VALUE', 25000),
});

const shippingFor = (subtotal: number): number =>
  subtotal >= num('FREE_SHIPPING_ABOVE', 999) ? 0 : num('SHIPPING_FEE', 70);

/**
 * Coupons the storefront offers (keep in sync with CartContext.applyCoupon). The discount is
 * re-calculated here, so a tampered request can never get a bigger discount than the rule allows.
 */
const COUPONS: Record<string, { type: 'PERCENTAGE' | 'FIXED_AMOUNT'; value: number; minSubtotal?: number }> = {
  VEDIC10: { type: 'PERCENTAGE', value: 10 },
  DIVINE100: { type: 'FIXED_AMOUNT', value: 100, minSubtotal: 999 },
};

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------

const clean = (s: unknown, max: number): string =>
  String(s ?? '')
    .replace(/[\r\n\t]+/g, ' ')
    .trim()
    .slice(0, max);

const VARIANT_GID = /^gid:\/\/shopify\/ProductVariant\/\d+$/;

interface Line {
  variantId: string;
  quantity: number;
}

function parseLines(raw: unknown): Line[] {
  if (!Array.isArray(raw) || raw.length === 0 || raw.length > 40) throw new ApiError(422, 'invalid_items', 'Your cart is empty.');
  const merged = new Map<string, number>();
  for (const item of raw as { variantId?: unknown; quantity?: unknown }[]) {
    const variantId = String(item?.variantId ?? '');
    const quantity = Number(item?.quantity);
    if (!VARIANT_GID.test(variantId) || !Number.isInteger(quantity) || quantity < 1 || quantity > 50) {
      throw new ApiError(422, 'invalid_items', 'One of the items in your cart is not valid.');
    }
    merged.set(variantId, (merged.get(variantId) ?? 0) + quantity);
  }
  return [...merged].map(([variantId, quantity]) => ({ variantId, quantity }));
}

interface Address {
  firstName: string;
  lastName: string;
  address1: string;
  address2: string;
  city: string;
  province: string;
  zip: string;
  phone: string;
}

function parseBuyer(raw: unknown): { phone: string; address: Address } {
  const b = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>;
  const a = (b.address && typeof b.address === 'object' ? b.address : {}) as Record<string, unknown>;

  const digits = String(b.phone ?? a.phone ?? '').replace(/[^\d]/g, '');
  const phone = digits.slice(-10);
  if (!/^[6-9]\d{9}$/.test(phone)) throw new ApiError(422, 'invalid_phone', 'Please enter a valid 10-digit mobile number.');

  const zip = clean(a.zip, 10).replace(/\s/g, '');
  if (!/^[1-9]\d{5}$/.test(zip)) throw new ApiError(422, 'invalid_pincode', 'Please enter a valid 6-digit pincode.');

  const address: Address = {
    firstName: clean(a.firstName, 60),
    lastName: clean(a.lastName, 60),
    address1: clean(a.address1, 150),
    address2: clean(a.address2, 150),
    city: clean(a.city, 80),
    province: clean(a.province, 60),
    zip,
    phone: `+91${phone}`,
  };
  if (!address.firstName || !address.address1 || !address.city || !address.province) {
    throw new ApiError(422, 'invalid_address', 'Please fill in your full delivery address.');
  }
  return { phone: `+91${phone}`, address };
}

// ---------------------------------------------------------------------------
// Shopify
// ---------------------------------------------------------------------------

interface VariantNode {
  id: string;
  title: string;
  availableForSale: boolean;
  inventoryPolicy: string;
  inventoryQuantity: number | null;
  price: string;
  product: { title: string; status: string };
}

async function loadVariants(lines: Line[]): Promise<{ variants: Map<string, VariantNode>; currency: string }> {
  const data = await adminGraphQL<{ nodes: (VariantNode | null)[]; shop: { currencyCode: string } }>(
    `query CodVariants($ids: [ID!]!) {
       shop { currencyCode }
       nodes(ids: $ids) {
         ... on ProductVariant {
           id title availableForSale inventoryPolicy inventoryQuantity price
           product { title status }
         }
       }
     }`,
    { ids: lines.map((l) => l.variantId) }
  );
  const variants = new Map<string, VariantNode>();
  for (const n of data.nodes) if (n?.id) variants.set(n.id, n);
  return { variants, currency: data.shop.currencyCode || 'INR' };
}

const money = (n: number): string => n.toFixed(2);

async function createCodOrder(req: ApiRequest): Promise<{ id: string; name: string }> {
  const customer = await verifyCustomer(req);
  const cfg = codConfig();
  if (!cfg.enabled) throw new ApiError(409, 'cod_unavailable', 'Cash on Delivery is not available right now. Please pay online.');

  const body = bodyObject(req);
  const lines = parseLines(body.lines);
  const { phone, address } = parseBuyer(body.buyer);
  const couponCode = clean(body.couponCode, 30).toUpperCase();

  // 1) Real prices + stock from Shopify
  const { variants, currency } = await loadVariants(lines);
  let subtotal = 0;
  for (const l of lines) {
    const v = variants.get(l.variantId);
    const name = v?.product.title ?? 'An item in your cart';
    if (!v || v.product.status !== 'ACTIVE' || !v.availableForSale) {
      throw new ApiError(409, 'unavailable', `${name} is sold out or no longer available. Please remove it and try again.`);
    }
    if (v.inventoryPolicy === 'DENY' && v.inventoryQuantity != null && v.inventoryQuantity < l.quantity) {
      throw new ApiError(409, 'unavailable', `Only ${Math.max(0, v.inventoryQuantity)} left of ${name}. Please reduce the quantity.`);
    }
    subtotal += Number(v.price) * l.quantity;
  }

  // 2) Coupon, shipping, COD fee — all worked out here
  let discount: { type: 'PERCENTAGE' | 'FIXED_AMOUNT'; value: number; amount: number } | null = null;
  if (couponCode) {
    const rule = COUPONS[couponCode];
    if (!rule) throw new ApiError(422, 'coupon', `The coupon ${couponCode} is not valid.`);
    if (rule.minSubtotal && subtotal < rule.minSubtotal) {
      throw new ApiError(422, 'coupon', `${couponCode} needs a minimum order of ₹${rule.minSubtotal}.`);
    }
    const amount = rule.type === 'PERCENTAGE' ? Math.round((subtotal * rule.value) / 100) : rule.value;
    discount = { ...rule, amount };
  }
  const shipping = shippingFor(subtotal);
  const shippingLineTotal = shipping + cfg.fee;
  const total = Math.max(0, subtotal - (discount?.amount ?? 0)) + shippingLineTotal;
  if (total > cfg.maxOrderValue) {
    throw new ApiError(409, 'cod_limit', `Cash on Delivery is available on orders up to ₹${cfg.maxOrderValue.toLocaleString('en-IN')}. Please pay online for this order.`);
  }

  // 3) Draft order → completed with payment pending (= a normal Shopify order, unpaid, "Pay on Delivery")
  const mailing = { ...address, address2: address.address2 || undefined, countryCode: 'IN' };
  const created = await adminGraphQL<{
    draftOrderCreate: { draftOrder?: { id: string } | null; userErrors?: { message: string }[] };
  }>(
    `mutation CodDraft($input: DraftOrderInput!) {
       draftOrderCreate(input: $input) { draftOrder { id } userErrors { field message } }
     }`,
    {
      input: {
        email: customer.email,
        phone,
        purchasingEntity: { customerId: customer.id },
        lineItems: lines.map((l) => ({ variantId: l.variantId, quantity: l.quantity })),
        shippingAddress: mailing,
        billingAddress: mailing,
        shippingLine: {
          title: cfg.fee > 0 ? 'Standard Shipping + COD charge' : 'Standard Shipping (COD)',
          priceWithCurrency: { amount: money(shippingLineTotal), currencyCode: currency },
        },
        ...(discount
          ? {
              appliedDiscount: {
                title: couponCode,
                description: `Coupon ${couponCode}`,
                valueType: discount.type,
                value: discount.value,
              },
            }
          : {}),
        tags: ['COD', 'cod-pending-confirmation'],
        note: 'Cash on Delivery order placed from the storefront.',
        customAttributes: [{ key: 'payment_method', value: 'Cash on Delivery' }],
      },
    }
  );
  const draftId = created.draftOrderCreate.draftOrder?.id;
  const createErrors = created.draftOrderCreate.userErrors ?? [];
  if (!draftId || createErrors.length) {
    console.error('[checkout] draftOrderCreate rejected', JSON.stringify(createErrors));
    throw new ApiError(422, 'cod_rejected', createErrors.map((e) => e.message).join(' ') || 'Your order could not be placed. Please check your details.');
  }

  const done = await adminGraphQL<{
    draftOrderComplete: { draftOrder?: { order?: { id: string; name: string } | null } | null; userErrors?: { message: string }[] };
  }>(
    `mutation CodComplete($id: ID!) {
       draftOrderComplete(id: $id, paymentPending: true) {
         draftOrder { order { id name } }
         userErrors { field message }
       }
     }`,
    { id: draftId }
  );
  const order = done.draftOrderComplete.draftOrder?.order;
  const doneErrors = done.draftOrderComplete.userErrors ?? [];
  if (!order || doneErrors.length) {
    console.error('[checkout] draftOrderComplete rejected', JSON.stringify(doneErrors));
    // Don't leave a dangling draft behind.
    try {
      await adminGraphQL(`mutation CodDiscard($id: ID!) { draftOrderDelete(input: { id: $id }) { deletedId userErrors { message } } }`, { id: draftId });
    } catch {
      /* the merchant can delete a leftover draft from Shopify admin */
    }
    throw new ApiError(422, 'cod_rejected', doneErrors.map((e) => e.message).join(' ') || 'Your order could not be placed. Please try again.');
  }
  return { id: order.id, name: order.name };
}

// ---------------------------------------------------------------------------
// Handler
// ---------------------------------------------------------------------------

export default async function handler(req: ApiRequest, res: ApiResponse) {
  try {
    noStore(res);

    if (req.method === 'GET') {
      res.status(200).json({ cod: codConfig() });
      return;
    }

    if (req.method === 'POST') {
      if (!adminConfigured()) throw new ApiError(503, 'not_configured', 'Cash on Delivery is not available yet. Please pay online.');
      const body = bodyObject(req);
      if (body.action !== 'cod') throw new ApiError(400, 'bad_request', 'Unknown action.');
      res.status(200).json({ order: await createCodOrder(req) });
      return;
    }

    res.setHeader('Allow', 'GET, POST');
    throw new ApiError(405, 'method_not_allowed', 'Method not allowed.');
  } catch (err) {
    sendError(res, err);
  }
}
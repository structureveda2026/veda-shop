import { ApiError, ApiRequest, ApiResponse, bodyObject, noStore, queryParam, sendError, sleep } from './_lib/http.js';
import { adminConfigured, adminGraphQL, ShopifyGraphQLError, verifyCustomer, VerifiedCustomer } from './_lib/shopifyAdmin.js';
import { mapOrder, MapOptions, RawOrder, returnAllocation } from './_lib/orderMapper.js';
import type { OrdersPage, ShopifyOrder } from '../src/types/orders';

/**
 * One serverless function for the whole post-purchase lifecycle. Shopify is the source of truth —
 * nothing is stored here. Every request:
 *   1. proves the caller's identity against Shopify (their own customer-account access token),
 *   2. loads the order from the Shopify Admin API and checks it belongs to that customer,
 *   3. validates eligibility from Shopify's own state, then performs the action through Shopify.
 *
 *   GET  /api/orders                  → { orders, hasNextPage, endCursor }   (?after=<cursor>)
 *   GET  /api/orders?id=<orderId>     → { order }
 *   POST /api/orders { action: 'cancel',   orderId, reason? }
 *   POST /api/orders { action: 'return',   orderId, items:[{lineItemId, quantity}], reason, note? }
 *   POST /api/orders { action: 'exchange', orderId, lineItemId, quantity, variantId, reason, note? }
 *
 * Refunds are never triggered by the browser: a cancelled paid order is refunded by Shopify itself
 * (orderCancel → refund to the original payment method) and return refunds are issued by the store
 * from Shopify admin (Return → Process). The storefront only reports their live status.
 */

// ---------------------------------------------------------------------------
// GraphQL
// ---------------------------------------------------------------------------

const MONEY = (field: string) => `${field} { shopMoney { amount currencyCode } }`;

const CORE = `
  id name createdAt processedAt cancelledAt cancelReason email tags currencyCode
  displayFinancialStatus displayFulfillmentStatus returnStatus
  paymentGatewayNames
  customer { id }
  ${MONEY('totalPriceSet')}
  ${MONEY('totalReceivedSet')}
  fulfillmentOrders(first: 3) { nodes { status } }
  transactions(first: 5) { kind status }
`;

const LIST_FIELDS = `
  ${CORE}
  lineItems(first: 5) { nodes { id title quantity image { url } } }
  fulfillments(first: 3) { id status displayStatus }
  returns(first: 3) { nodes { id name status closedAt returnLineItems(first: 2) { nodes { quantity customerNote } } } }
  refunds(first: 3) { id createdAt ${MONEY('totalRefundedSet')} transactions(first: 3) { nodes { status processedAt } } }
`;

const DETAIL_FIELDS = `
  ${CORE}
  statusPageUrl
  ${MONEY('subtotalPriceSet')}
  ${MONEY('totalShippingPriceSet')}
  ${MONEY('totalTaxSet')}
  ${MONEY('totalDiscountsSet')}
  shippingAddress { name address1 address2 city province zip country phone }
  lineItems(first: 20) {
    nodes {
      id title variantTitle sku quantity currentQuantity
      image { url }
      ${MONEY('originalUnitPriceSet')}
      ${MONEY('discountedUnitPriceSet')}
      product { id handle tags }
      variant { id title }
    }
  }
  fulfillments(first: 4) {
    id status displayStatus createdAt deliveredAt inTransitAt estimatedDeliveryAt
    trackingInfo { company number url }
    fulfillmentLineItems(first: 20) { nodes { id quantity lineItem { id } } }
    events(first: 8) { nodes { status happenedAt } }
  }
  returns(first: 4) {
    nodes {
      id name status closedAt
      returnLineItems(first: 8) {
        nodes { quantity customerNote ... on ReturnLineItem { fulfillmentLineItem { lineItem { title } } } }
      }
    }
  }
  refunds(first: 4) { id createdAt ${MONEY('totalRefundedSet')} transactions(first: 3) { nodes { status processedAt } } }
  returnableFulfillments(first: 4) {
    nodes {
      id
      returnableFulfillmentLineItems(first: 20) {
        nodes { quantity fulfillmentLineItem { id lineItem { id } } }
      }
    }
  }
`;

const PAGE_SIZE = 10;

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const intEnv = (name: string, fallback: number): number => {
  const n = parseInt(process.env[name] || '', 10);
  return Number.isFinite(n) && n >= 0 ? n : fallback;
};

const mapOptions = (detail: boolean): MapOptions => ({
  detail,
  returnWindowDays: intEnv('RETURN_WINDOW_DAYS', 7),
  exchangeWindowDays: intEnv('EXCHANGE_WINDOW_DAYS', 7),
});

// ---------------------------------------------------------------------------
// Shopify access
// ---------------------------------------------------------------------------

const orderGid = (id: string): string => {
  if (!/^\d{1,20}$/.test(id)) throw new ApiError(400, 'bad_request', 'Invalid order id.');
  return `gid://shopify/Order/${id}`;
};

const owns = (raw: RawOrder, customer: VerifiedCustomer): boolean =>
  raw.customer?.id === customer.id || (raw.email ?? '').toLowerCase() === customer.email;

async function loadOrder(id: string, customer: VerifiedCustomer): Promise<RawOrder> {
  const data = await adminGraphQL<{ order: RawOrder | null }>(
    `query OrderDetail($id: ID!) { order(id: $id) { ${DETAIL_FIELDS} } }`,
    { id: orderGid(id) }
  );
  // Same answer for "doesn't exist" and "isn't yours" — never confirm other customers' order ids.
  if (!data.order || !owns(data.order, customer)) throw new ApiError(404, 'not_found', 'Order not found.');
  return data.order;
}

async function listOrders(customer: VerifiedCustomer, after: string): Promise<OrdersPage> {
  const email = customer.email.replace(/"/g, '');
  const query = `customer_id:${customer.numericId} OR email:"${email}"`;
  const data = await adminGraphQL<{
    orders: { pageInfo: { hasNextPage: boolean; endCursor: string | null }; nodes: RawOrder[] };
  }>(
    `query Orders($first: Int!, $after: String, $query: String) {
       orders(first: $first, after: $after, sortKey: CREATED_AT, reverse: true, query: $query) {
         pageInfo { hasNextPage endCursor }
         nodes { ${LIST_FIELDS} }
       }
     }`,
    { first: PAGE_SIZE, after: after || null, query }
  );
  const opts = mapOptions(false);
  return {
    orders: data.orders.nodes.filter((o) => owns(o, customer)).map((o) => mapOrder(o, opts)),
    hasNextPage: data.orders.pageInfo.hasNextPage,
    endCursor: data.orders.pageInfo.endCursor,
  };
}

const detailOf = (raw: RawOrder): ShopifyOrder => mapOrder(raw, mapOptions(true));

// ---------------------------------------------------------------------------
// Actions
// ---------------------------------------------------------------------------

const clean = (s: unknown, max: number): string =>
  String(s ?? '')
    .replace(/[\r\n\t]+/g, ' ')
    .replace(/[\[\]"]/g, '')
    .trim()
    .slice(0, max);

async function cancelOrder(id: string, customer: VerifiedCustomer, reasonText: string): Promise<{ order: ShopifyOrder; pending: boolean }> {
  const raw = await loadOrder(id, customer);
  const order = detailOf(raw);
  if (!order.actions.canCancel) throw new ApiError(409, 'not_cancellable', order.actions.cancelBlockedReason || 'This order can no longer be cancelled.');

  const data = await adminGraphQL<{
    orderCancel: { job?: { id: string; done: boolean } | null; orderCancelUserErrors?: { message: string }[] };
  }>(
    `mutation OrderCancel($orderId: ID!, $reason: OrderCancelReason!, $refund: Boolean!, $restock: Boolean!, $notifyCustomer: Boolean, $staffNote: String) {
       orderCancel(orderId: $orderId, reason: $reason, refund: $refund, restock: $restock, notifyCustomer: $notifyCustomer, staffNote: $staffNote) {
         job { id done }
         orderCancelUserErrors { field message code }
       }
     }`,
    {
      orderId: orderGid(id),
      reason: 'CUSTOMER',
      // Paid orders are refunded by Shopify to the original payment method; unpaid (COD) orders have nothing to refund.
      refund: order.payment.amountPaid > 0,
      restock: true,
      notifyCustomer: true,
      staffNote: `Cancelled by customer from the storefront.${reasonText ? ` Reason: ${reasonText}` : ''}`,
    }
  );
  const errors = data.orderCancel.orderCancelUserErrors ?? [];
  if (errors.length) throw new ApiError(409, 'cancel_rejected', errors.map((e) => e.message).join(' '));

  // orderCancel is asynchronous on Shopify's side — give the job a moment, then read the real state back.
  const jobId = data.orderCancel.job?.id;
  if (jobId) {
    for (let i = 0; i < 5; i++) {
      const j = await adminGraphQL<{ job: { done: boolean } | null }>(`query Job($id: ID!) { job(id: $id) { id done } }`, { id: jobId });
      if (j.job?.done) break;
      await sleep(600);
    }
  }
  const after = detailOf(await loadOrder(id, customer));
  return { order: after, pending: !after.cancelledAt };
}

// Shopify's ReturnReason values; anything the API version doesn't know falls back to UNKNOWN (the reason is also kept in the note).
const REASONS: Record<string, { label: string; code: string }> = {
  DEFECTIVE: { label: 'Item is damaged or defective', code: 'DEFECTIVE' },
  NOT_AS_DESCRIBED: { label: 'Not as described', code: 'NOT_AS_DESCRIBED' },
  WRONG_ITEM: { label: 'Received the wrong item', code: 'WRONG_ITEM' },
  SIZE_TOO_SMALL: { label: 'Size is too small', code: 'SIZE_TOO_SMALL' },
  SIZE_TOO_LARGE: { label: 'Size is too large', code: 'SIZE_TOO_LARGE' },
  UNWANTED: { label: 'Changed my mind', code: 'UNWANTED' },
  OTHER: { label: 'Other', code: 'OTHER' },
};

interface ReturnLineInput {
  fulfillmentLineItemId: string;
  quantity: number;
  returnReason: string;
  customerNote: string;
}

async function submitReturnRequest(orderId: string, lines: Omit<ReturnLineInput, 'returnReason'>[], reasonCode: string) {
  const run = (code: string) =>
    adminGraphQL<{ returnRequest: { return?: { id: string; status: string } | null; userErrors?: { message: string }[] } }>(
      `mutation ReturnRequest($input: ReturnRequestInput!) {
         returnRequest(input: $input) { return { id status } userErrors { field message } }
       }`,
      { input: { orderId: orderGid(orderId), returnLineItems: lines.map((l) => ({ ...l, returnReason: code })) } }
    );

  let result;
  try {
    result = await run(code(reasonCode));
  } catch (e) {
    // This API version may not know the specific reason enum — retry once with the generic one.
    if (e instanceof ShopifyGraphQLError && /returnReason|ReturnReason|invalid value/i.test(e.detail)) result = await run('UNKNOWN');
    else throw e;
  }
  const errors = result.returnRequest.userErrors ?? [];
  if (errors.length || !result.returnRequest.return) {
    throw new ApiError(422, 'return_rejected', errors.map((e) => e.message).join(' ') || 'The return could not be requested.');
  }
}

const code = (c: string) => REASONS[c].code;

/** Takes `qty` units of one line from Shopify's returnable fulfillment lines, never more than what's returnable. */
function allocate(parts: { fulfillmentLineItemId: string; quantity: number }[], qty: number) {
  const out: { fulfillmentLineItemId: string; quantity: number }[] = [];
  let left = qty;
  for (const p of parts) {
    if (left <= 0) break;
    const take = Math.min(left, p.quantity);
    out.push({ fulfillmentLineItemId: p.fulfillmentLineItemId, quantity: take });
    left -= take;
  }
  return left > 0 ? null : out;
}

async function tagOrder(id: string, tags: string[]) {
  try {
    await adminGraphQL(`mutation Tag($id: ID!, $tags: [String!]!) { tagsAdd(id: $id, tags: $tags) { userErrors { message } } }`, {
      id: orderGid(id),
      tags,
    });
  } catch {
    /* tags only help the merchant filter orders — never fail the customer's request over them */
  }
}

async function returnOrder(id: string, customer: VerifiedCustomer, body: Record<string, unknown>): Promise<ShopifyOrder> {
  const reason = String(body.reason ?? '');
  if (!REASONS[reason]) throw new ApiError(422, 'invalid_reason', 'Please choose a reason for the return.');
  const items = Array.isArray(body.items) ? (body.items as { lineItemId?: unknown; quantity?: unknown }[]) : [];
  if (!items.length || items.length > 10) throw new ApiError(422, 'invalid_items', 'Select the items you want to return.');

  const raw = await loadOrder(id, customer);
  const order = detailOf(raw);
  const allocation = returnAllocation(raw);
  const note = clean(body.note, 150);
  const customerNote = `Reason: ${REASONS[reason].label}.${note ? ` ${note}` : ''}`;

  const seen = new Set<string>();
  const lines: Omit<ReturnLineInput, 'returnReason'>[] = [];
  for (const it of items) {
    const lineId = String(it.lineItemId ?? '');
    const qty = Number(it.quantity);
    const line = order.lines.find((l) => l.id === lineId);
    if (!line || seen.has(lineId) || !Number.isInteger(qty) || qty < 1) throw new ApiError(422, 'invalid_items', 'One of the selected items is not valid.');
    seen.add(lineId);
    if (line.returnBlockedReason) throw new ApiError(409, 'not_returnable', `${line.title}: ${line.returnBlockedReason}`);
    if (qty > line.returnableQty) throw new ApiError(409, 'not_returnable', `${line.title}: only ${line.returnableQty} unit(s) can be returned.`);
    const parts = allocate(allocation.get(lineId) ?? [], qty);
    if (!parts) throw new ApiError(409, 'not_returnable', `${line.title} can't be returned right now.`);
    parts.forEach((p) => lines.push({ ...p, customerNote }));
  }

  await submitReturnRequest(id, lines, reason);
  await tagOrder(id, ['return-requested']);
  return detailOf(await loadOrder(id, customer));
}

async function exchangeOrder(id: string, customer: VerifiedCustomer, body: Record<string, unknown>): Promise<ShopifyOrder> {
  const reason = String(body.reason ?? '');
  if (!REASONS[reason]) throw new ApiError(422, 'invalid_reason', 'Please choose a reason for the exchange.');
  const lineId = String(body.lineItemId ?? '');
  const qty = Number(body.quantity ?? 1);
  const variantId = String(body.variantId ?? '');
  if (!/^gid:\/\/shopify\/ProductVariant\/\d+$/.test(variantId)) throw new ApiError(422, 'invalid_variant', 'Please choose the item you want in exchange.');
  if (!Number.isInteger(qty) || qty < 1) throw new ApiError(422, 'invalid_items', 'Invalid quantity.');

  const raw = await loadOrder(id, customer);
  const order = detailOf(raw);
  const line = order.lines.find((l) => l.id === lineId);
  if (!line) throw new ApiError(422, 'invalid_items', 'That item is not part of this order.');
  if (line.exchangeBlockedReason) throw new ApiError(409, 'not_exchangeable', `${line.title}: ${line.exchangeBlockedReason}`);
  if (qty > line.returnableQty) throw new ApiError(409, 'not_exchangeable', `${line.title}: only ${line.returnableQty} unit(s) can be exchanged.`);
  if (variantId === line.variantId) throw new ApiError(422, 'invalid_variant', 'Choose a different option than the one you received.');

  // The replacement must exist, belong to the same product, and be in stock right now.
  const v = await adminGraphQL<{ productVariant: { id: string; title: string; availableForSale: boolean; product: { id: string } } | null }>(
    `query Variant($id: ID!) { productVariant(id: $id) { id title availableForSale product { id } } }`,
    { id: variantId }
  );
  if (!v.productVariant || v.productVariant.product.id !== line.productId) throw new ApiError(422, 'invalid_variant', 'That replacement is not available for this product.');
  if (!v.productVariant.availableForSale) throw new ApiError(409, 'out_of_stock', 'That option is currently out of stock. Please choose another.');

  const parts = allocate(returnAllocation(raw).get(lineId) ?? [], qty);
  if (!parts) throw new ApiError(409, 'not_exchangeable', `${line.title} can't be exchanged right now.`);

  const note = clean(body.note, 100);
  const title = clean(v.productVariant.title, 60);
  const customerNote = `[EXCHANGE variant=${variantId}] Replace with "${title}". Reason: ${REASONS[reason].label}.${note ? ` ${note}` : ''}`;

  await submitReturnRequest(id, parts.map((p) => ({ ...p, customerNote })), reason);
  await tagOrder(id, ['exchange-requested']);
  return detailOf(await loadOrder(id, customer));
}

// ---------------------------------------------------------------------------
// Handler
// ---------------------------------------------------------------------------

export default async function handler(req: ApiRequest, res: ApiResponse) {
  try {
    noStore(res);
    if (!adminConfigured()) throw new ApiError(503, 'not_configured', 'Orders are not available yet. Please try again later.');
    const customer = await verifyCustomer(req);

    if (req.method === 'GET') {
      const id = queryParam(req, 'id');
      if (id) {
        res.status(200).json({ order: detailOf(await loadOrder(id, customer)) });
        return;
      }
      res.status(200).json(await listOrders(customer, queryParam(req, 'after')));
      return;
    }

    if (req.method === 'POST') {
      const body = bodyObject(req);
      const orderId = String(body.orderId ?? '');
      switch (body.action) {
        case 'cancel': {
          const { order, pending } = await cancelOrder(orderId, customer, clean(body.reason, 120));
          res.status(200).json({ order, pending });
          return;
        }
        case 'return':
          res.status(200).json({ order: await returnOrder(orderId, customer, body) });
          return;
        case 'exchange':
          res.status(200).json({ order: await exchangeOrder(orderId, customer, body) });
          return;
        default:
          throw new ApiError(400, 'bad_request', 'Unknown action.');
      }
    }

    res.setHeader('Allow', 'GET, POST');
    throw new ApiError(405, 'method_not_allowed', 'Method not allowed.');
  } catch (err) {
    sendError(res, err);
  }
}
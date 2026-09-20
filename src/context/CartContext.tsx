import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { Product, CartItem, ProductVariant } from '../types/ecommerce';
import {
  ShopifyCartSnapshot,
  ShopifyError,
  addCartLines,
  createCart,
  fetchCart,
  isShopifyEnabled,
  removeCartLines,
  resolveMerchandiseId,
  updateCartLines,
} from '../lib/shopify';

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: Product, quantity?: number, selectedVariant?: ProductVariant, selectedSize?: string) => void;
  /** `selectedSize`: undefined = every line of that product, null = the line with no size, string = that size's line. */
  removeFromCart: (productId: string, selectedSize?: string | null) => void;
  updateQuantity: (productId: string, quantity: number, selectedSize?: string | null) => void;
  /** First cart line for a product (`selectedSize` undefined = any line of it). Drives the in-place Add / quantity control. */
  getCartLine: (productId: string, selectedSize?: string | null) => CartItem | undefined;
  clearCart: () => void;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  totalItems: number;
  subtotal: number;
  /** What the items would have cost at their compare-at prices, minus what they cost — for the "You save" rows. */
  savings: number;
  discountAmount: number;
  shippingFee: number;
  freeShippingThreshold: number;
  appliedCoupon: string | null;
  applyCoupon: (code: string) => { success: boolean; message: string };
  removeCoupon: () => void;
  grandTotal: number;
  /** The most recently added item, used to drive the bottom "Item Added to Cart" toast
   *  (CartAddedToast.tsx) instead of force-opening the cart drawer on every add. */
  justAdded: { product: Product; quantity: number } | null;
  dismissJustAdded: () => void;
  /** Shopify-hosted checkout for the synced cart — null until Shopify is enabled and the cart has synced. */
  checkoutUrl: string | null;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const SHOPIFY_CART_ID_KEY = 'vedic_shopify_cart_id';
const SHOPIFY_SYNC_DEBOUNCE_MS = 350;

const lineKey = (item: CartItem) => `${item.product.id}::${item.selectedSize ?? ''}`;

const matchesLine = (item: CartItem, productId: string, selectedSize?: string | null) =>
  item.product.id === productId && (selectedSize === undefined || (item.selectedSize ?? null) === selectedSize);

const readStoredShopifyCartId = (): string | null => {
  try {
    return localStorage.getItem(SHOPIFY_CART_ID_KEY);
  } catch {
    return null;
  }
};

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('vedic_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [justAdded, setJustAdded] = useState<{ product: Product; quantity: number } | null>(null);
  const justAddedTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const freeShippingThreshold = 999;

  useEffect(() => {
    try {
      localStorage.setItem('vedic_cart', JSON.stringify(cart));
    } catch (e) {
      console.error('Failed to save cart', e);
    }
  }, [cart]);

  // -------------------------------------------------------------------------
  // Shopify cart sync
  //
  // The local cart drives the UI instantly (optimistic); after every change it is mirrored to a
  // Shopify Storefront cart in the background. Each sync diffs "what the local cart wants" against
  // "what Shopify currently holds" per ProductVariant and sends only the difference, one sync at a
  // time — so rapid +/- taps collapse into a single request instead of racing each other.
  // Fully inert unless Shopify is configured (see src/lib/shopify.ts).
  // -------------------------------------------------------------------------
  const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null);
  const cartRef = useRef<CartItem[]>(cart);
  cartRef.current = cart;
  const shopifyCartIdRef = useRef<string | null>(readStoredShopifyCartId());
  const remoteLinesRef = useRef<Map<string, { lineId: string; quantity: number }>>(new Map());
  const remoteLoadedRef = useRef(false);
  const syncTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const syncRunningRef = useRef(false);
  const syncQueuedRef = useRef(false);

  const applyRemoteCart = (snapshot: ShopifyCartSnapshot) => {
    shopifyCartIdRef.current = snapshot.id;
    remoteLinesRef.current = new Map(
      snapshot.lines.map((l) => [l.variantId, { lineId: l.id, quantity: l.quantity }])
    );
    setCheckoutUrl(snapshot.checkoutUrl);
    try {
      localStorage.setItem(SHOPIFY_CART_ID_KEY, snapshot.id);
    } catch {
      /* storage unavailable — the cart id just isn't remembered across reloads */
    }
  };

  const resetRemoteCart = () => {
    shopifyCartIdRef.current = null;
    remoteLinesRef.current = new Map();
    setCheckoutUrl(null);
    try {
      localStorage.removeItem(SHOPIFY_CART_ID_KEY);
    } catch {
      /* ignore */
    }
  };

  const syncOnce = async () => {
    // 1) What the local cart wants, as total quantity per Shopify variant.
    const lines = cartRef.current;
    const variantByLine = new Map<string, string>();
    const desired = new Map<string, number>();
    for (const item of lines) {
      const variantId = await resolveMerchandiseId(item);
      if (!variantId) continue; // not a Shopify product — stays local-only
      variantByLine.set(lineKey(item), variantId);
      desired.set(variantId, (desired.get(variantId) ?? 0) + item.quantity);
    }

    // 2) What Shopify currently holds (loaded once per page load when a cart id was remembered).
    if (!remoteLoadedRef.current) {
      if (shopifyCartIdRef.current) {
        const remote = await fetchCart(shopifyCartIdRef.current);
        if (remote) applyRemoteCart(remote);
        else resetRemoteCart(); // expired or already checked out
      }
      remoteLoadedRef.current = true; // only once the lookup actually succeeded
    }

    // 3) The difference.
    const remote = remoteLinesRef.current;
    const toRemove: string[] = [];
    const toUpdate: { id: string; quantity: number }[] = [];
    const toAdd: { merchandiseId: string; quantity: number }[] = [];
    desired.forEach((quantity, variantId) => {
      const existing = remote.get(variantId);
      if (!existing) toAdd.push({ merchandiseId: variantId, quantity });
      else if (existing.quantity !== quantity) toUpdate.push({ id: existing.lineId, quantity });
    });
    remote.forEach((existing, variantId) => {
      if (!desired.has(variantId)) toRemove.push(existing.lineId);
    });
    if (!toRemove.length && !toUpdate.length && !toAdd.length) return;

    // 4) Send it.
    const cartId = shopifyCartIdRef.current;
    if (!cartId) {
      if (toAdd.length) applyRemoteCart(await createCart(toAdd));
    } else {
      if (toRemove.length) applyRemoteCart(await removeCartLines(cartId, toRemove));
      if (toUpdate.length) applyRemoteCart(await updateCartLines(cartId, toUpdate));
      if (toAdd.length) applyRemoteCart(await addCartLines(cartId, toAdd));
    }

    // 4b) Every response carries Shopify's full cart. If it holds lines this cart never asked for
    //     (e.g. added from another device since we last looked), sweep them out too — so an emptied
    //     cart really is empty on Shopify, not just here.
    const leftovers: string[] = [];
    remoteLinesRef.current.forEach((held, variantId) => {
      if (!desired.has(variantId)) leftovers.push(held.lineId);
    });
    if (leftovers.length && shopifyCartIdRef.current) {
      applyRemoteCart(await removeCartLines(shopifyCartIdRef.current, leftovers));
    }

    // 5) Shopify is the authority on stock: if it holds fewer units than were asked for, bring the
    //    local line down to match (only when it's the sole local line for that variant and the
    //    person hasn't changed it in the meantime).
    const soleLine = new Map<string, number>();
    variantByLine.forEach((variantId) => soleLine.set(variantId, (soleLine.get(variantId) ?? 0) + 1));
    const capped = new Map<string, number>();
    desired.forEach((quantity, variantId) => {
      const held = remoteLinesRef.current.get(variantId);
      if (held && held.quantity < quantity && soleLine.get(variantId) === 1) capped.set(variantId, held.quantity);
    });
    if (capped.size) {
      setCart((prev) =>
        prev.map((item) => {
          const variantId = variantByLine.get(lineKey(item));
          if (!variantId || !capped.has(variantId) || item.quantity !== desired.get(variantId)) return item;
          return { ...item, quantity: capped.get(variantId)! };
        })
      );
    }
  };

  const runShopifySync = async () => {
    if (!isShopifyEnabled()) return;
    if (syncRunningRef.current) {
      syncQueuedRef.current = true; // picked up as soon as the running sync finishes
      return;
    }
    syncRunningRef.current = true;
    let retried = false;
    try {
      do {
        syncQueuedRef.current = false;
        try {
          await syncOnce();
        } catch (err) {
          console.warn('[Shopify] cart sync failed', err);
          // Shopify refused the request (e.g. the remembered cart is gone): start a fresh cart once.
          if (err instanceof ShopifyError && err.kind === 'user' && shopifyCartIdRef.current && !retried) {
            retried = true;
            resetRemoteCart();
            syncQueuedRef.current = true;
          }
        }
      } while (syncQueuedRef.current);
    } finally {
      syncRunningRef.current = false;
    }
  };

  useEffect(() => {
    if (!isShopifyEnabled()) return;
    if (syncTimerRef.current) clearTimeout(syncTimerRef.current);
    syncTimerRef.current = setTimeout(() => {
      syncTimerRef.current = null;
      void runShopifySync();
    }, SHOPIFY_SYNC_DEBOUNCE_MS);
  }, [cart]);

  useEffect(() => {
    return () => {
      if (justAddedTimerRef.current) clearTimeout(justAddedTimerRef.current);
      if (syncTimerRef.current) clearTimeout(syncTimerRef.current);
    };
  }, []);

  const dismissJustAdded = () => {
    if (justAddedTimerRef.current) {
      clearTimeout(justAddedTimerRef.current);
      justAddedTimerRef.current = null;
    }
    setJustAdded(null);
  };

  const addToCart = (product: Product, quantity = 1, selectedVariant?: ProductVariant, selectedSize?: string) => {
    setCart((prev) => {
      const existingIndex = prev.findIndex(
        (item) => item.product.id === product.id && item.selectedSize === selectedSize
      );
      if (existingIndex > -1) {
        // Copy the line instead of mutating it — state updaters run twice under React StrictMode,
        // and an in-place `+=` would double the quantity in development.
        const updated = [...prev];
        updated[existingIndex] = { ...updated[existingIndex], quantity: updated[existingIndex].quantity + quantity };
        return updated;
      }
      return [...prev, { product, quantity, selectedVariant, selectedSize }];
    });

    // Instead of force-opening the cart drawer, surface a dismissible bottom toast
    // (CartAddedToast.tsx) with a "View Cart" action — the drawer only opens if the person
    // chooses to. Re-triggers cleanly even if the previous toast hadn't finished dismissing.
    if (justAddedTimerRef.current) clearTimeout(justAddedTimerRef.current);
    setJustAdded({ product, quantity });
    justAddedTimerRef.current = setTimeout(() => {
      setJustAdded(null);
      justAddedTimerRef.current = null;
    }, 4000);
  };

  const removeFromCart = (productId: string, selectedSize?: string | null) => {
    setCart((prev) => prev.filter((item) => !matchesLine(item, productId, selectedSize)));
  };

  const updateQuantity = (productId: string, quantity: number, selectedSize?: string | null) => {
    if (quantity <= 0) {
      removeFromCart(productId, selectedSize);
      return;
    }
    setCart((prev) =>
      prev.map((item) => (matchesLine(item, productId, selectedSize) ? { ...item, quantity } : item))
    );
  };

  const getCartLine = (productId: string, selectedSize?: string | null) =>
    cart.find((item) => matchesLine(item, productId, selectedSize));

  const clearCart = () => {
    setCart([]);
    setAppliedCoupon(null);
  };

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  const subtotal = cart.reduce((sum, item) => {
    const itemPrice = item.selectedVariant ? item.selectedVariant.price : item.product.price;
    return sum + itemPrice * item.quantity;
  }, 0);

  const savings = cart.reduce((sum, item) => {
    const price = item.selectedVariant ? item.selectedVariant.price : item.product.price;
    const compare = item.selectedVariant ? item.selectedVariant.compareAtPrice : item.product.compareAtPrice;
    return sum + Math.max(0, (compare ?? 0) - price) * item.quantity;
  }, 0);

  let discountAmount = 0;
  if (appliedCoupon === 'VEDIC10') {
    discountAmount = Math.round(subtotal * 0.1);
  } else if (appliedCoupon === 'DIVINE100' && subtotal >= 999) {
    discountAmount = 100;
  }

  const shippingFee = subtotal >= freeShippingThreshold || cart.length === 0 ? 0 : 70;
  const grandTotal = Math.max(0, subtotal - discountAmount + shippingFee);

  const applyCoupon = (code: string) => {
    const cleanCode = code.trim().toUpperCase();
    if (cleanCode === 'VEDIC10') {
      setAppliedCoupon('VEDIC10');
      return { success: true, message: '10% Extra Discount Applied!' };
    }
    if (cleanCode === 'DIVINE100') {
      if (subtotal < 999) {
        return { success: false, message: 'Minimum cart value of ₹999 required for DIVINE100' };
      }
      setAppliedCoupon('DIVINE100');
      return { success: true, message: '₹100 Instant Discount Applied!' };
    }
    return { success: false, message: 'Invalid Coupon Code' };
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        getCartLine,
        clearCart,
        isCartOpen,
        setIsCartOpen,
        totalItems,
        subtotal,
        savings,
        discountAmount,
        shippingFee,
        freeShippingThreshold,
        appliedCoupon,
        applyCoupon,
        removeCoupon,
        grandTotal,
        justAdded,
        dismissJustAdded,
        checkoutUrl,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
};
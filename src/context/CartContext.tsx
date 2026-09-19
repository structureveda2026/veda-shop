import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, CartItem, ProductVariant } from '../types/ecommerce';

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: Product, quantity?: number, selectedVariant?: ProductVariant, selectedSize?: string) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  totalItems: number;
  subtotal: number;
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
}

const CartContext = createContext<CartContextType | undefined>(undefined);

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

  useEffect(() => {
    return () => {
      if (justAddedTimerRef.current) clearTimeout(justAddedTimerRef.current);
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
        const updated = [...prev];
        updated[existingIndex].quantity += quantity;
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

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart((prev) =>
      prev.map((item) => (item.product.id === productId ? { ...item, quantity } : item))
    );
  };

  const clearCart = () => {
    setCart([]);
    setAppliedCoupon(null);
  };

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  const subtotal = cart.reduce((sum, item) => {
    const itemPrice = item.selectedVariant ? item.selectedVariant.price : item.product.price;
    return sum + itemPrice * item.quantity;
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
        clearCart,
        isCartOpen,
        setIsCartOpen,
        totalItems,
        subtotal,
        discountAmount,
        shippingFee,
        freeShippingThreshold,
        appliedCoupon,
        applyCoupon,
        removeCoupon,
        grandTotal,
        justAdded,
        dismissJustAdded,
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
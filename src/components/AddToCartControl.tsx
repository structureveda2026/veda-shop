import React, { useEffect, useState } from 'react';
import { Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { Product } from '../types/ecommerce';
import { useCart } from '../context/CartContext';

export interface AddToCartControlProps {
  product: Product;
  disabled?: boolean;
  /** 'compact' = icon-only on phones (tight card footers) · 'full' = icon + label always ·
   *  'cta' = same as 'full' but taller, for detail-page / modal buttons. */
  size?: 'compact' | 'full' | 'cta';
  /** 'card' soft-gold idle button · 'solid' maroon · 'gold' gold gradient for dark surfaces. */
  appearance?: 'card' | 'solid' | 'gold';
  /** Idle button text (defaults to "Add"), and what it says instead when `disabled` (e.g. "Sold Out"). */
  label?: string;
  disabledLabel?: string;
  /** The option/fitting this line is for. Pages that let the person pick one pass it, so each
   *  option is its own cart line; leave it out and any cart line of the product counts. */
  selectedSize?: string;
  /** Runs before the picker opens and again before the item is added — return false to stop
   *  (e.g. a detail page that still has required options unselected). */
  beforeAdd?: () => boolean;
  /** Layout of the outermost element in every state (width, flex-1, margin, shrink…). */
  className?: string;
  /** Shape/typography overrides for the idle button only (padding, radius, font, shadow…). */
  buttonClassName?: string;
}

const MAX_QUICK_QUANTITY = 20;

const THEMES = {
  card: {
    idle: 'bg-vedic-gold/10 hover:bg-vedic-maroon text-vedic-maroon hover:text-vedic-ivory border border-vedic-gold/30 hover:border-transparent disabled:hover:bg-vedic-gold/10 disabled:hover:text-vedic-maroon',
    add: 'bg-vedic-maroon hover:bg-vedic-dark text-vedic-ivory',
    picker: 'bg-vedic-ivory border border-vedic-gold/30 text-vedic-maroon',
    pickerBtn: 'hover:bg-vedic-gold/15 disabled:text-vedic-muted',
    count: 'text-vedic-dark',
    live: 'bg-vedic-maroon text-vedic-ivory',
    liveBtn: 'hover:bg-white/15 disabled:opacity-40',
  },
  solid: {
    idle: 'bg-vedic-maroon hover:bg-vedic-maroonDark text-vedic-ivory shadow-md [&>svg]:text-vedic-gold',
    add: 'bg-vedic-maroon hover:bg-vedic-maroonDark text-vedic-ivory',
    picker: 'bg-vedic-ivory border border-vedic-gold/30 text-vedic-maroon',
    pickerBtn: 'hover:bg-vedic-gold/15 disabled:text-vedic-muted',
    count: 'text-vedic-dark',
    live: 'bg-vedic-maroon text-vedic-ivory',
    liveBtn: 'hover:bg-white/15 disabled:opacity-40',
  },
  gold: {
    idle: 'bg-gold-gradient text-vedic-dark hover:brightness-105',
    add: 'bg-gold-gradient text-vedic-dark hover:brightness-105',
    picker: 'bg-black/40 border border-vedic-gold/40 text-vedic-goldLight',
    pickerBtn: 'hover:bg-vedic-gold/20 disabled:opacity-40',
    count: 'text-white',
    live: 'bg-gold-gradient text-vedic-dark',
    liveBtn: 'hover:bg-black/10 disabled:opacity-40',
  },
} as const;

const swallow = (e: React.SyntheticEvent) => {
  // The control lives inside clickable cards / links — never let a tap on it navigate.
  e.preventDefault();
  e.stopPropagation();
};

/**
 * The one "Add to Cart" control used everywhere an item can be added.
 *
 *  1. Not in cart  → the normal Add button.
 *  2. Tap it       → in the very same spot it becomes a quantity picker with an "Add" button right
 *                    below it. Nothing is added until "Add" is tapped.
 *  3. In cart      → the Add button is gone: a live [− qty +] stepper takes its place for as long as
 *                    the item is in the cart (− at 1 removes it, and the Add button comes back).
 *
 * All state comes from CartContext, so every instance of the same item — card, quick view, detail
 * page, sticky bar — always agrees, and every change is mirrored to the Shopify cart by the context.
 */
export const AddToCartControl: React.FC<AddToCartControlProps> = ({
  product,
  disabled = false,
  size = 'compact',
  appearance = 'card',
  label,
  disabledLabel,
  selectedSize,
  beforeAdd,
  className,
  buttonClassName,
}) => {
  const { addToCart, updateQuantity, removeFromCart, getCartLine } = useCart();
  const [isSelecting, setIsSelecting] = useState(false);
  const [quantity, setQuantity] = useState(1);

  const theme = THEMES[appearance];
  const isCta = size === 'cta';
  const line = getCartLine(product.id, selectedSize);
  const inCart = line !== undefined;

  // Never offer more than is in stock (or 20 at a time).
  const maxQty = Math.min(MAX_QUICK_QUANTITY, Number.isFinite(product.stock) && product.stock > 0 ? product.stock : MAX_QUICK_QUANTITY);

  // If the item lands in the cart some other way while the picker is open, drop the picker.
  useEffect(() => {
    if (inCart) setIsSelecting(false);
  }, [inCart]);

  const openSelector = (e: React.MouseEvent) => {
    swallow(e);
    if (beforeAdd && !beforeAdd()) return;
    setQuantity(1);
    setIsSelecting(true);
  };

  const closeSelector = (e: React.MouseEvent) => {
    swallow(e);
    setIsSelecting(false);
  };

  const changeQuantity = (delta: number) => (e: React.MouseEvent) => {
    swallow(e);
    setQuantity((q) => Math.min(maxQty, Math.max(1, q + delta)));
  };

  const confirmAdd = (e: React.MouseEvent) => {
    swallow(e);
    if (beforeAdd && !beforeAdd()) return;
    addToCart(product, quantity, undefined, selectedSize);
    setIsSelecting(false);
  };

  // ---- 3. In cart: live stepper, no Add button ---------------------------------------------
  if (line) {
    const lineSize = line.selectedSize ?? null;

    const decrement = (e: React.MouseEvent) => {
      swallow(e);
      if (line.quantity <= 1) removeFromCart(product.id, lineSize);
      else updateQuantity(product.id, line.quantity - 1, lineSize);
    };

    const increment = (e: React.MouseEvent) => {
      swallow(e);
      updateQuantity(product.id, Math.min(maxQty, line.quantity + 1), lineSize);
    };

    const stepBtn = twMerge(
      'shrink-0 flex items-center justify-center rounded-full transition-colors disabled:cursor-not-allowed',
      isCta ? 'w-10 h-10' : 'w-8 h-8',
      theme.liveBtn
    );

    return (
      <div
        onClick={swallow}
        className={twMerge(
          'flex items-center justify-between rounded-full px-0.5 font-bold',
          isCta ? 'h-11 min-w-[7.5rem] text-sm' : 'h-9 min-w-[5.75rem] text-xs',
          theme.live,
          className
        )}
      >
        <button
          onClick={decrement}
          aria-label={line.quantity <= 1 ? 'Remove from cart' : 'Decrease quantity'}
          className={stepBtn}
        >
          {line.quantity <= 1 ? <Trash2 className="w-3.5 h-3.5" /> : <Minus className="w-3.5 h-3.5" />}
        </button>
        <span aria-live="polite" aria-label={`${line.quantity} in cart`} className="px-1 text-center tabular-nums">
          {line.quantity}
        </span>
        <button
          onClick={increment}
          disabled={line.quantity >= maxQty}
          aria-label="Increase quantity"
          className={stepBtn}
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  }

  // ---- 2. Picking a quantity: picker on top, "Add" directly below it -----------------------
  if (isSelecting) {
    const pickBtn = twMerge(
      'flex items-center justify-center rounded-full transition-colors disabled:cursor-not-allowed',
      isCta ? 'w-9 h-9' : 'w-7 h-7',
      theme.pickerBtn
    );

    return (
      <div onClick={swallow} className={twMerge('flex flex-col items-stretch gap-1.5', className)}>
        <div className="flex items-center justify-center gap-1.5">
          <div className={twMerge('flex items-center rounded-full', theme.picker)}>
            <button onClick={changeQuantity(-1)} disabled={quantity <= 1} aria-label="Decrease quantity" className={pickBtn}>
              <Minus className="w-3 h-3" />
            </button>
            <span
              aria-live="polite"
              aria-label={`Quantity ${quantity}`}
              className={twMerge('text-center font-bold tabular-nums', isCta ? 'w-7 text-sm' : 'w-5 text-xs', theme.count)}
            >
              {quantity}
            </span>
            <button onClick={changeQuantity(1)} disabled={quantity >= maxQty} aria-label="Increase quantity" className={pickBtn}>
              <Plus className="w-3 h-3" />
            </button>
          </div>

          <button
            onClick={closeSelector}
            aria-label="Cancel"
            className="w-6 h-6 shrink-0 flex items-center justify-center rounded-full text-base leading-none text-vedic-muted hover:text-vedic-maroon hover:bg-vedic-gold/10 transition-colors"
          >
            ×
          </button>
        </div>

        <button
          onClick={confirmAdd}
          className={twMerge(
            'w-full flex items-center justify-center rounded-full px-3 font-bold whitespace-nowrap transition-colors',
            isCta ? 'h-9 text-sm' : 'h-7 text-xs',
            theme.add
          )}
        >
          Add
        </button>
      </div>
    );
  }

  // ---- 1. Idle: the normal Add button -------------------------------------------------------
  const idleText = disabled && disabledLabel ? disabledLabel : label ?? 'Add';

  return (
    <button
      onClick={openSelector}
      disabled={disabled}
      title={disabled ? 'Out of Stock' : 'Add to Cart'}
      className={twMerge(
        'flex items-center gap-1 p-2 rounded-xl text-xs font-bold transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed',
        size === 'cta' && 'justify-center',
        theme.idle,
        buttonClassName,
        className
      )}
    >
      <ShoppingBag className="w-4 h-4 shrink-0" />
      <span className={size === 'compact' ? 'hidden sm:inline' : undefined}>{idleText}</span>
    </button>
  );
};
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { Breadcrumb } from '../components/Breadcrumb';
import { ClearCartButton } from '../components/ClearCartButton';
import { Trash2, Plus, Minus, ArrowRight, ArrowLeft, ShieldCheck, Tag, ShoppingBag, Truck, Lock, Sparkles } from 'lucide-react';

export const CartPage: React.FC = () => {
  const {
    cart,
    removeFromCart,
    updateQuantity,
    subtotal,
    savings,
    discountAmount,
    shippingFee,
    freeShippingThreshold,
    appliedCoupon,
    applyCoupon,
    removeCoupon,
    grandTotal,
    totalItems,
  } = useCart();

  const [couponInput, setCouponInput] = useState('');
  const [couponMsg, setCouponMsg] = useState<{ success: boolean; message: string } | null>(null);
  const navigate = useNavigate();

  const handleCouponSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const res = applyCoupon(couponInput);
    setCouponMsg(res);
    if (res.success) setCouponInput('');
  };

  if (cart.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-6">
        <div className="w-20 h-20 rounded-full bg-vedic-gold/10 text-vedic-gold flex items-center justify-center mx-auto">
          <ShoppingBag className="w-10 h-10" />
        </div>
        <h1 className="font-serif font-extrabold text-2xl md:text-3xl text-vedic-maroon">
          Your Sacred Cart is Empty
        </h1>
        <p className="text-xs text-vedic-muted max-w-sm mx-auto">
          Explore our certified Rudraksha beads, crystal energy bracelets, and Vastu decor.
        </p>
        <Link
          to="/"
          className="inline-block bg-vedic-maroon text-vedic-ivory px-8 py-3 rounded-full text-xs font-bold shadow-lg hover:bg-vedic-maroonDark transition-colors"
        >
          Back to Home
        </Link>
      </div>
    );
  }

  const freeShippingNeeded = freeShippingThreshold - subtotal;
  const freeShippingProgress = Math.min(100, (subtotal / freeShippingThreshold) * 100);

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      <Breadcrumb items={[{ label: 'Shopping Bag' }]} />

      {/* Title + page actions */}
      <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
        <div>
          <h1 className="font-serif font-extrabold text-2xl md:text-3xl text-vedic-maroon">Your Shopping Bag</h1>
          <p className="text-xs text-vedic-muted mt-1">
            {totalItems} {totalItems === 1 ? 'item' : 'items'} · Review your sacred picks before checkout
          </p>
        </div>
        <div className="flex items-center gap-5">
          <Link
            to="/shop"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-vedic-maroon hover:text-vedic-goldDark transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Continue Shopping
          </Link>
          <ClearCartButton />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 items-start">
        {/* Cart Item List */}
        <div className="lg:col-span-2 space-y-4">
          {/* Free shipping progress */}
          <div className="bg-white rounded-3xl border border-vedic-gold/25 shadow-card px-5 py-4">
            {freeShippingNeeded > 0 ? (
              <p className="text-xs text-vedic-dark font-medium flex items-center gap-2">
                <Truck className="w-4 h-4 text-vedic-goldDark shrink-0" />
                <span>
                  Add <span className="font-bold text-vedic-maroon">₹{freeShippingNeeded.toLocaleString('en-IN')}</span> more for{' '}
                  <span className="font-bold text-vedic-goldDark">FREE Shipping</span>
                </span>
              </p>
            ) : (
              <p className="text-xs font-bold text-emerald-700 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-vedic-gold shrink-0" /> You’ve unlocked FREE Express Shipping!
              </p>
            )}
            <div className="w-full bg-vedic-beige h-2 rounded-full mt-2.5 overflow-hidden">
              <div className="bg-gold-gradient h-full rounded-full transition-all duration-500" style={{ width: `${freeShippingProgress}%` }} />
            </div>
          </div>

          {cart.map((item) => {
            const price = item.selectedVariant ? item.selectedVariant.price : item.product.price;
            const comparePrice = item.selectedVariant ? item.selectedVariant.compareAtPrice : item.product.compareAtPrice;
            const lineSize = item.selectedSize ?? null;
            return (
              <div
                key={`${item.product.id}-${item.selectedSize}`}
                className="bg-white rounded-3xl p-4 sm:p-5 border border-vedic-gold/25 shadow-card flex gap-4 sm:gap-5"
              >
                <Link to={`/products/${item.product.slug}`} className="shrink-0">
                  <img
                    src={item.product.images[0]}
                    alt={item.product.title}
                    className="w-24 h-24 sm:w-32 sm:h-32 object-cover rounded-2xl border border-vedic-gold/20"
                  />
                </Link>

                <div className="flex-1 min-w-0 flex flex-col">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 space-y-1">
                      <Link
                        to={`/products/${item.product.slug}`}
                        className="font-serif font-bold text-sm sm:text-base text-vedic-dark hover:text-vedic-maroon line-clamp-2 leading-snug"
                      >
                        {item.product.title}
                      </Link>
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                        {item.selectedSize && <span className="text-[11px] text-vedic-muted">Size: {item.selectedSize}</span>}
                        {item.product.labCertified && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                            <ShieldCheck className="w-3 h-3" /> Lab Certified
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-vedic-muted">
                        ₹{price.toLocaleString('en-IN')} each
                        {comparePrice > price && (
                          <span className="line-through ml-1.5">₹{comparePrice.toLocaleString('en-IN')}</span>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => removeFromCart(item.product.id, lineSize)}
                      className="shrink-0 -mr-1 p-1.5 rounded-full text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                      title="Remove Item"
                      aria-label={`Remove ${item.product.title}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex items-end justify-between gap-3 mt-auto pt-3">
                    <div className="flex items-center rounded-full border border-vedic-gold/40 bg-vedic-ivory">
                      <button
                        onClick={() => updateQuantity(item.product.id, item.quantity - 1, lineSize)}
                        aria-label="Decrease quantity"
                        className="w-8 h-8 flex items-center justify-center rounded-full text-vedic-maroon hover:bg-vedic-gold/15 transition-colors"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-8 text-center text-sm font-bold text-vedic-dark tabular-nums">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.product.id, item.quantity + 1, lineSize)}
                        aria-label="Increase quantity"
                        className="w-8 h-8 flex items-center justify-center rounded-full text-vedic-maroon hover:bg-vedic-gold/15 transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="text-right leading-tight">
                      {comparePrice > price && (
                        <span className="text-[11px] text-vedic-muted line-through block">
                          ₹{(comparePrice * item.quantity).toLocaleString('en-IN')}
                        </span>
                      )}
                      <span className="text-lg font-extrabold text-vedic-maroon">
                        ₹{(price * item.quantity).toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Order Summary Side Panel */}
        <div className="bg-white rounded-3xl border border-vedic-gold/25 shadow-card overflow-hidden lg:sticky lg:top-28">
          <div className="bg-vedic-maroon px-6 py-4 border-b-2 border-vedic-gold/50">
            <h3 className="font-serif font-bold text-lg text-vedic-goldLight">Order Summary</h3>
          </div>

          <div className="p-6 space-y-5">
            {/* Coupon Code Form */}
            <div className="space-y-2">
              {!appliedCoupon ? (
                <form onSubmit={handleCouponSubmit} className="flex gap-2">
                  <div className="relative flex-1">
                    <Tag className="w-4 h-4 text-vedic-gold absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value)}
                      placeholder="Coupon (e.g. VEDIC10)"
                      className="w-full pl-9 pr-3 py-2.5 text-xs bg-vedic-ivory rounded-full border border-vedic-gold/30 uppercase font-semibold focus:outline-none focus:border-vedic-gold"
                    />
                  </div>
                  <button
                    type="submit"
                    className="bg-vedic-goldDark text-white px-5 py-2.5 rounded-full text-xs font-bold hover:bg-vedic-maroon transition-colors"
                  >
                    Apply
                  </button>
                </form>
              ) : (
                <div className="flex items-center justify-between bg-emerald-50 px-3.5 py-2.5 rounded-full text-xs font-bold text-emerald-800 border border-emerald-200">
                  <span>Applied: {appliedCoupon}</span>
                  <button onClick={removeCoupon} className="text-red-600 text-[11px] underline">
                    Remove
                  </button>
                </div>
              )}
              {couponMsg && !appliedCoupon && (
                <p className={`text-[11px] font-medium px-2 ${couponMsg.success ? 'text-emerald-700' : 'text-red-600'}`}>
                  {couponMsg.message}
                </p>
              )}
            </div>

            <div className="space-y-2 text-xs text-vedic-dark">
              <div className="flex justify-between">
                <span className="text-vedic-muted">Subtotal</span>
                <span className="font-bold">₹{subtotal.toLocaleString('en-IN')}</span>
              </div>
              {savings > 0 && (
                <div className="flex justify-between text-emerald-700 font-bold">
                  <span>You save</span>
                  <span>₹{savings.toLocaleString('en-IN')}</span>
                </div>
              )}
              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-700 font-bold">
                  <span>Coupon Savings</span>
                  <span>-₹{discountAmount.toLocaleString('en-IN')}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-vedic-muted">Express Shipping</span>
                <span className="font-bold">
                  {shippingFee === 0 ? <span className="text-emerald-700">FREE</span> : `₹${shippingFee}`}
                </span>
              </div>
              <div className="flex justify-between items-baseline text-vedic-maroon pt-3 border-t border-dashed border-vedic-gold/40">
                <span className="font-serif font-bold text-base">Total Payable</span>
                <span className="text-2xl font-extrabold">₹{grandTotal.toLocaleString('en-IN')}</span>
              </div>
              <p className="text-[10px] text-vedic-muted text-right">Inclusive of all taxes</p>
            </div>

            <button
              onClick={() => navigate('/checkout')}
              className="w-full bg-gold-gradient text-vedic-dark py-4 rounded-full font-serif font-bold text-sm shadow-xl hover:brightness-105 transition-all flex items-center justify-center gap-2"
            >
              Proceed to Checkout <ArrowRight className="w-4 h-4" />
            </button>

            <ul className="space-y-2 text-[11px] text-vedic-muted border-t border-vedic-beige pt-4">
              <li className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-vedic-gold shrink-0" /> 100% authentic, lab-certified products
              </li>
              <li className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-vedic-gold shrink-0" /> Free shipping on orders above ₹{freeShippingThreshold.toLocaleString('en-IN')}
              </li>
              <li className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-vedic-gold shrink-0" /> Secure checkout
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth, getDefaultAddress } from '../context/AuthContext';
import { Breadcrumb } from '../components/Breadcrumb';
import {
  ShieldCheck,
  Lock,
  CreditCard,
  Smartphone,
  Banknote,
  ArrowRight,
  MapPin,
  Plus,
  User,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { isShopifyEnabled } from '../lib/shopify';
import type { UnavailableLine } from '../context/CartContext';

const emptyAddressFields = {
  addressLine1: '',
  addressLine2: '',
  city: '',
  state: '',
  pincode: '',
};

export const CheckoutPage: React.FC = () => {
  const { cart, grandTotal, subtotal, discountAmount, shippingFee, clearCart, beginCheckout, removeFromCart, appliedCoupon } = useCart();
  const { isAuthenticated, user, placeOrder, addAddress, openAuthModal } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const defaultAddress = getDefaultAddress(user);
  const [selectedAddressId, setSelectedAddressId] = useState<string | 'new' | null>(
    defaultAddress ? defaultAddress.id : user && user.addresses.length ? user.addresses[0].id : 'new'
  );

  const [formData, setFormData] = useState(() => ({
    fullName: user?.fullName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    ...(defaultAddress
      ? {
          addressLine1: defaultAddress.addressLine1,
          addressLine2: defaultAddress.addressLine2 || '',
          city: defaultAddress.city,
          state: defaultAddress.state,
          pincode: defaultAddress.pincode,
        }
      : emptyAddressFields),
    paymentMethod: 'upi',
  }));
  const [saveNewAddress, setSaveNewAddress] = useState(true);

  // Shopify checkout: payment + order creation happen on Shopify's secure page (see CartContext.beginCheckout).
  const shopifyMode = isShopifyEnabled();
  const [paying, setPaying] = useState(false);
  const [payError, setPayError] = useState<string | null>(null);
  const [unavailable, setUnavailable] = useState<UnavailableLine[]>([]);
  const [couponIssue, setCouponIssue] = useState<string | null>(null);

  // Every unauthenticated visit to /checkout (e.g. straight from a "Buy Now" click)
  // gets the login/register popup instead of a hardcoded form.
  useEffect(() => {
    if (!isAuthenticated) {
      openAuthModal('Please sign in or create an account to complete your order.');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  // Keep the form in sync with the user's saved profile/address once signed in.
  useEffect(() => {
    if (!user) return;
    const addr = user.addresses.find((a) => a.id === selectedAddressId);
    setFormData((prev) => ({
      ...prev,
      fullName: prev.fullName || user.fullName,
      email: prev.email || user.email,
      phone: prev.phone || user.phone,
      ...(addr
        ? {
            addressLine1: addr.addressLine1,
            addressLine2: addr.addressLine2 || '',
            city: addr.city,
            state: addr.state,
            pincode: addr.pincode,
          }
        : {}),
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, selectedAddressId]);

  if (!isAuthenticated || !user) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-vedic-maroon text-vedic-gold flex items-center justify-center mx-auto">
          <User className="w-8 h-8" />
        </div>
        <h2 className="font-serif font-bold text-xl text-vedic-maroon">Sign In to Complete Your Order</h2>
        <p className="text-xs text-vedic-muted">Please sign in or create an account to proceed to checkout.</p>
        <button
          onClick={() => openAuthModal('Please sign in or create an account to complete your order.')}
          className="bg-vedic-maroon text-white px-6 py-2.5 rounded-full text-xs font-bold shadow-md hover:bg-vedic-maroonDark transition-colors"
        >
          Sign In / Register
        </button>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-4">
        <h2 className="font-serif font-bold text-xl text-vedic-maroon">Your Cart is Empty</h2>
        <button
          onClick={() => navigate('/')}
          className="bg-vedic-maroon text-white px-6 py-2 rounded-full text-xs font-bold"
        >
          Back to Home
        </button>
      </div>
    );
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const selectSavedAddress = (id: string) => {
    setSelectedAddressId(id);
  };

  const selectNewAddress = () => {
    setSelectedAddressId('new');
    setFormData((prev) => ({ ...prev, ...emptyAddressFields }));
  };

  const handleAddressSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedAddressId === 'new' && saveNewAddress) {
      await addAddress({
        fullName: formData.fullName,
        phone: formData.phone,
        addressLine1: formData.addressLine1,
        addressLine2: formData.addressLine2,
        city: formData.city,
        state: formData.state,
        pincode: formData.pincode,
        country: 'India',
        isDefault: user.addresses.length === 0,
      });
    }
    setStep(2);
  };

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    if (paying) return;
    setPaying(true);
    setPayError(null);
    setUnavailable([]);
    const [firstName, ...rest] = formData.fullName.trim().split(/\s+/);
    const result = await beginCheckout(
      {
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        address: {
          firstName,
          lastName: rest.join(' '),
          address1: formData.addressLine1,
          address2: formData.addressLine2 || undefined,
          city: formData.city,
          province: formData.state,
          zip: formData.pincode,
          country: 'India',
          phone: formData.phone.trim(),
        },
      },
      { acceptCouponIssue: Boolean(couponIssue) }
    );
    if (result.ok) {
      window.location.assign(result.url); // Shopify takes the payment and creates the order
      return;
    }
    if (result.code === 'coupon') setCouponIssue(result.message);
    else setPayError(result.message);
    if (result.unavailable) setUnavailable(result.unavailable);
    setPaying(false);
  };

  const handlePlaceOrder = (e: React.FormEvent) => {
    if (shopifyMode) return void handlePay(e);
    e.preventDefault();
    const order = placeOrder({
      items: cart,
      subtotal,
      discountAmount,
      shippingFee,
      total: grandTotal,
      shippingAddress: {
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        addressLine1: formData.addressLine1,
        addressLine2: formData.addressLine2,
        city: formData.city,
        state: formData.state,
        pincode: formData.pincode,
      },
      paymentMethod: formData.paymentMethod,
    });
    clearCart();
    navigate('/order-success', { state: { orderId: order.id, formData, grandTotal } });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      <Breadcrumb items={[{ label: 'Checkout' }]} />

      {/* Steps Indicator */}
      <div className="max-w-2xl mx-auto flex items-center justify-between mb-6 border-b border-vedic-gold/20 pb-4">
        <div className={`flex items-center gap-2 text-xs font-bold ${step >= 1 ? 'text-vedic-maroon' : 'text-gray-400'}`}>
          <span className="w-6 h-6 rounded-full bg-vedic-maroon text-white flex items-center justify-center text-[10px]">1</span>
          <span>Address & Shipping</span>
        </div>
        <div className="h-0.5 flex-1 bg-vedic-gold/30 mx-3" />
        <div className={`flex items-center gap-2 text-xs font-bold ${step >= 2 ? 'text-vedic-maroon' : 'text-gray-400'}`}>
          <span className="w-6 h-6 rounded-full bg-vedic-maroon text-white flex items-center justify-center text-[10px]">2</span>
          <span>Payment Method</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Form Column */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 md:p-8 border border-vedic-gold/20 shadow-card space-y-6">
          {step === 1 ? (
            <form onSubmit={handleAddressSubmit} className="space-y-6">
              <h3 className="font-serif font-bold text-lg text-vedic-maroon border-b border-vedic-beige pb-3">
                Shipping Address Details
              </h3>

              {/* Saved addresses picker — pulled from the signed-in account, not hardcoded */}
              {user.addresses.length > 0 && (
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-vedic-dark">Choose a saved address</label>
                  {user.addresses.map((addr) => (
                    <label
                      key={addr.id}
                      className={`flex items-start gap-3 p-3 rounded-2xl border cursor-pointer transition-all text-xs ${
                        selectedAddressId === addr.id ? 'border-vedic-gold bg-vedic-ivory' : 'border-vedic-gold/30 bg-white'
                      }`}
                    >
                      <input
                        type="radio"
                        name="savedAddress"
                        checked={selectedAddressId === addr.id}
                        onChange={() => selectSavedAddress(addr.id)}
                        className="mt-0.5 accent-vedic-maroon"
                      />
                      <div>
                        <span className="font-bold text-vedic-dark flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-vedic-gold" /> {addr.fullName}
                          {addr.isDefault && <span className="text-[10px] text-vedic-goldDark font-bold">(Default)</span>}
                        </span>
                        <span className="text-vedic-muted block mt-0.5">
                          {addr.addressLine1}
                          {addr.addressLine2 ? `, ${addr.addressLine2}` : ''}, {addr.city}, {addr.state} - {addr.pincode}
                        </span>
                      </div>
                    </label>
                  ))}
                  <label
                    className={`flex items-center gap-3 p-3 rounded-2xl border cursor-pointer transition-all text-xs font-bold ${
                      selectedAddressId === 'new' ? 'border-vedic-gold bg-vedic-ivory text-vedic-maroon' : 'border-vedic-gold/30 bg-white text-vedic-dark'
                    }`}
                  >
                    <input
                      type="radio"
                      name="savedAddress"
                      checked={selectedAddressId === 'new'}
                      onChange={selectNewAddress}
                      className="accent-vedic-maroon"
                    />
                    <Plus className="w-3.5 h-3.5 text-vedic-gold" /> Deliver to a new address
                  </label>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-bold text-vedic-dark mb-1">Full Name *</label>
                  <input
                    type="text"
                    name="fullName"
                    required
                    value={formData.fullName}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 bg-vedic-ivory rounded-xl border border-vedic-gold/30 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-vedic-dark mb-1">Mobile Number (for Courier SMS) *</label>
                  <input
                    type="tel"
                    name="phone"
                    required
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 bg-vedic-ivory rounded-xl border border-vedic-gold/30 focus:outline-none"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block font-bold text-vedic-dark mb-1">Email Address *</label>
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 bg-vedic-ivory rounded-xl border border-vedic-gold/30 focus:outline-none"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block font-bold text-vedic-dark mb-1">Street Address / House No. *</label>
                  <input
                    type="text"
                    name="addressLine1"
                    required
                    value={formData.addressLine1}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 bg-vedic-ivory rounded-xl border border-vedic-gold/30 focus:outline-none"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block font-bold text-vedic-dark mb-1">Landmark / Area (optional)</label>
                  <input
                    type="text"
                    name="addressLine2"
                    value={formData.addressLine2}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 bg-vedic-ivory rounded-xl border border-vedic-gold/30 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-vedic-dark mb-1">City *</label>
                  <input
                    type="text"
                    name="city"
                    required
                    value={formData.city}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 bg-vedic-ivory rounded-xl border border-vedic-gold/30 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-vedic-dark mb-1">State *</label>
                  <input
                    type="text"
                    name="state"
                    required
                    value={formData.state}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 bg-vedic-ivory rounded-xl border border-vedic-gold/30 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-vedic-dark mb-1">Pincode *</label>
                  <input
                    type="text"
                    name="pincode"
                    required
                    value={formData.pincode}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 bg-vedic-ivory rounded-xl border border-vedic-gold/30 focus:outline-none"
                  />
                </div>
              </div>

              {selectedAddressId === 'new' && (
                <label className="flex items-center gap-2 text-xs text-vedic-muted">
                  <input
                    type="checkbox"
                    checked={saveNewAddress}
                    onChange={(e) => setSaveNewAddress(e.target.checked)}
                    className="accent-vedic-maroon"
                  />
                  Save this address to my account for next time
                </label>
              )}

              <button
                type="submit"
                className="w-full bg-vedic-maroon text-white py-3.5 rounded-full text-xs font-bold shadow-md hover:bg-vedic-maroonDark transition-colors flex items-center justify-center gap-2"
              >
                Proceed to Select Payment Method <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          ) : (
            <form onSubmit={handlePlaceOrder} className="space-y-6">
              <h3 className="font-serif font-bold text-lg text-vedic-maroon border-b border-vedic-beige pb-3">
                Select Secure Payment Method
              </h3>

              {shopifyMode ? (
                <div className="space-y-3">
                  <div className="p-4 rounded-2xl border-2 border-vedic-gold bg-vedic-ivory space-y-1.5">
                    <span className="font-bold text-xs text-vedic-dark flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" /> Pay securely on our payment partner's page
                    </span>
                    <p className="text-[11px] text-vedic-muted leading-relaxed">
                      You'll choose UPI, cards, net banking{' '}or cash on delivery (where available) on the next screen. Final shipping and taxes are
                      calculated there too. Your order is created the moment payment succeeds.
                    </p>
                  </div>
                  {couponIssue && (
                    <div className="flex items-start gap-2 text-[11px] font-semibold text-amber-800 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2">
                      <AlertCircle className="w-4 h-4 shrink-0 mt-px" />
                      <span>{couponIssue} Press the button again to continue without it.</span>
                    </div>
                  )}
                  {payError && (
                    <div className="flex items-start gap-2 text-[11px] font-semibold text-red-700 bg-red-50 border border-red-200 rounded-xl px-3 py-2">
                      <AlertCircle className="w-4 h-4 shrink-0 mt-px" />
                      <span>{payError}</span>
                    </div>
                  )}
                  {unavailable.length > 0 && (
                    <div className="space-y-2 text-xs bg-red-50 border border-red-200 rounded-xl p-3">
                      <p className="font-bold text-red-700">Please remove these to continue:</p>
                      {unavailable.map((u) => (
                        <div key={`${u.productId}-${u.selectedSize ?? ''}`} className="flex items-center justify-between gap-2">
                          <span className="text-vedic-dark truncate">{u.title}</span>
                          <button
                            type="button"
                            onClick={() => {
                              removeFromCart(u.productId, u.selectedSize ?? null);
                              setUnavailable((list) => list.filter((x) => x !== u));
                            }}
                            className="text-vedic-maroon font-bold hover:underline shrink-0"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
              <div className="space-y-3">
                <label className="flex items-center justify-between p-4 rounded-2xl border-2 cursor-pointer transition-all border-vedic-gold bg-vedic-ivory">
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="upi"
                      checked={formData.paymentMethod === 'upi'}
                      onChange={handleInputChange}
                      className="accent-vedic-maroon"
                    />
                    <div>
                      <span className="font-bold text-xs text-vedic-dark block flex items-center gap-1.5">
                        <Smartphone className="w-4 h-4 text-vedic-gold" /> UPI / Google Pay / PhonePe / Paytm
                      </span>
                      <span className="text-[10px] text-vedic-muted">Instant & 100% Secure via Razorpay Gateway</span>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                    Fastest
                  </span>
                </label>

                <label className="flex items-center justify-between p-4 rounded-2xl border cursor-pointer border-vedic-gold/30 bg-white">
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="card"
                      checked={formData.paymentMethod === 'card'}
                      onChange={handleInputChange}
                      className="accent-vedic-maroon"
                    />
                    <div>
                      <span className="font-bold text-xs text-vedic-dark block flex items-center gap-1.5">
                        <CreditCard className="w-4 h-4 text-vedic-gold" /> Credit / Debit Card / NetBanking
                      </span>
                      <span className="text-[10px] text-vedic-muted">All major Indian banks supported</span>
                    </div>
                  </div>
                </label>

                <label className="flex items-center justify-between p-4 rounded-2xl border cursor-pointer border-vedic-gold/30 bg-white">
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="cod"
                      checked={formData.paymentMethod === 'cod'}
                      onChange={handleInputChange}
                      className="accent-vedic-maroon"
                    />
                    <div>
                      <span className="font-bold text-xs text-vedic-dark block flex items-center gap-1.5">
                        <Banknote className="w-4 h-4 text-vedic-gold" /> Cash on Delivery (COD)
                      </span>
                      <span className="text-[10px] text-vedic-muted">Pay cash upon delivery at your doorstep</span>
                    </div>
                  </div>
                </label>
              </div>
              )}

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  disabled={paying}
                  className="px-6 py-3 rounded-full text-xs font-bold border border-vedic-gold/40 text-vedic-dark"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={paying}
                  className="flex-1 bg-gold-gradient text-vedic-dark py-4 rounded-full font-serif font-bold text-sm shadow-xl hover:brightness-105 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {paying ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
                  {shopifyMode
                    ? paying
                      ? 'Preparing secure payment…'
                      : `Pay Securely (₹${grandTotal.toLocaleString('en-IN')})`
                    : `Complete Sacred Order (₹${grandTotal.toLocaleString('en-IN')})`}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Right Summary Column */}
        <div className="bg-white rounded-3xl p-6 border border-vedic-gold/20 shadow-card space-y-4">
          <h3 className="font-serif font-bold text-base text-vedic-maroon border-b border-vedic-beige pb-3">
            Item Summary ({cart.length})
          </h3>

          <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
            {cart.map((item) => (
              <div key={item.product.id} className="flex gap-3 items-center text-xs">
                <img
                  src={item.product.images[0]}
                  alt=""
                  className="w-12 h-12 rounded-xl object-cover border border-vedic-gold/20"
                />
                <div className="flex-1 min-w-0">
                  <h5 className="font-bold text-vedic-dark truncate">{item.product.title}</h5>
                  <p className="text-[10px] text-vedic-muted">Qty: {item.quantity}</p>
                </div>
                <span className="font-bold text-vedic-maroon">
                  ₹{(item.product.price * item.quantity).toLocaleString('en-IN')}
                </span>
              </div>
            ))}
          </div>

          <div className="space-y-1.5 text-xs text-vedic-dark border-t border-vedic-beige pt-3">
            <div className="flex justify-between">
              <span className="text-vedic-muted">Subtotal</span>
              <span>₹{subtotal.toLocaleString('en-IN')}</span>
            </div>
            {discountAmount > 0 && (
              <div className="flex justify-between text-emerald-700">
                <span>Discount</span>
                <span>-₹{discountAmount.toLocaleString('en-IN')}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-vedic-maroon pt-2 border-t border-vedic-beige text-sm">
              <span>Grand Total</span>
              <span>₹{grandTotal.toLocaleString('en-IN')}</span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-[10px] text-vedic-muted pt-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Secure checkout • Encrypted payment
          </div>
          {shopifyMode && <p className="text-[10px] text-vedic-muted">Shipping, taxes and the final total are confirmed on the payment page.</p>}
        </div>
      </div>
    </div>
  );
};
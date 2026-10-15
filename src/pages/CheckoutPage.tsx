import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth, getDefaultAddress } from '../context/AuthContext';
import { Breadcrumb } from '../components/Breadcrumb';
import {
  ShieldCheck,
  Lock,
  CreditCard,
  Banknote,
  ArrowRight,
  ArrowLeft,
  MapPin,
  Plus,
  User,
  Loader2,
  AlertCircle,
  Check,
  ChevronDown,
  Truck,
  BadgeCheck,
  RotateCcw,
  Pencil,
  Tag,
  X,
  Package,
} from 'lucide-react';
import { isShopifyEnabled, resolveMerchandiseId } from '../lib/shopify';
import { CheckoutApiError, getCodConfig, placeCodOrder, type CodConfig } from '../lib/codApi';
import type { UnavailableLine } from '../context/CartContext';
import type { CartItem } from '../types/ecommerce';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa', 'Gujarat', 'Haryana',
  'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
  'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana',
  'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal', 'Andaman and Nicobar Islands', 'Chandigarh',
  'Dadra and Nagar Haveli and Daman and Diu', 'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Lakshadweep', 'Puducherry',
];

const inr = (n: number) => `₹${n.toLocaleString('en-IN')}`;

/** Returns the 10-digit Indian mobile number, or '' if what was typed isn't one. */
const normalizePhone = (value: string): string => {
  let d = value.replace(/\D/g, '');
  if (d.length === 12 && d.startsWith('91')) d = d.slice(2);
  else if (d.length === 11 && d.startsWith('0')) d = d.slice(1);
  return /^[6-9]\d{9}$/.test(d) ? d : '';
};

const unitPrice = (item: CartItem) => (item.selectedVariant ? item.selectedVariant.price : item.product.price);

const emptyAddressFields = { addressLine1: '', addressLine2: '', city: '', state: '', pincode: '' };

type PayMethod = 'online' | 'cod';

const inputBase =
  'w-full h-11 px-3.5 rounded-xl bg-white border text-base sm:text-sm text-vedic-dark placeholder:text-vedic-muted/60 ' +
  'transition-colors focus:outline-none focus:border-vedic-gold focus:ring-2 focus:ring-vedic-gold/25';

const Field: React.FC<{ label: string; error?: string; className?: string; children: React.ReactNode }> = ({
  label,
  error,
  className = '',
  children,
}) => (
  <div className={className}>
    <label className="block text-xs font-semibold text-vedic-dark mb-1.5">{label}</label>
    {children}
    {error && (
      <p className="mt-1 text-[11px] font-medium text-red-600 flex items-center gap-1">
        <AlertCircle className="w-3 h-3 shrink-0" /> {error}
      </p>
    )}
  </div>
);

const Stepper: React.FC<{ step: 1 | 2; onBack: () => void }> = ({ step, onBack }) => {
  const items = [
    { n: 1, label: 'Delivery' },
    { n: 2, label: 'Payment' },
    { n: 3, label: 'Confirmation' },
  ];
  return (
    <ol className="flex items-center justify-center gap-2 sm:gap-3 text-xs">
      {items.map((it, i) => {
        const done = it.n < step;
        const active = it.n === step;
        const body = (
          <>
            <span
              className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold border transition-colors ${
                done
                  ? 'bg-emerald-600 border-emerald-600 text-white'
                  : active
                  ? 'bg-gold-gradient border-vedic-gold text-vedic-dark shadow-gold'
                  : 'bg-white border-vedic-gold/30 text-vedic-muted'
              }`}
            >
              {done ? <Check className="w-3.5 h-3.5" /> : it.n}
            </span>
            <span className={`hidden sm:inline font-semibold ${active || done ? 'text-vedic-dark' : 'text-vedic-muted'}`}>{it.label}</span>
          </>
        );
        return (
          <React.Fragment key={it.n}>
            <li className="flex items-center gap-2">
              {done ? (
                <button type="button" onClick={onBack} className="flex items-center gap-2" aria-label={`Back to ${it.label}`}>
                  {body}
                </button>
              ) : (
                body
              )}
            </li>
            {i < items.length - 1 && <span className={`h-px w-8 sm:w-14 ${it.n < step ? 'bg-emerald-500' : 'bg-vedic-gold/30'}`} />}
          </React.Fragment>
        );
      })}
    </ol>
  );
};

const PayOption: React.FC<{
  selected: boolean;
  disabled?: boolean;
  onSelect: () => void;
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  badge?: string;
  children?: React.ReactNode;
}> = ({ selected, disabled, onSelect, icon, title, subtitle, badge, children }) => (
  <div
    className={`rounded-2xl border-2 transition-all ${
      disabled
        ? 'border-vedic-gold/15 bg-vedic-ivory/60 opacity-70'
        : selected
        ? 'border-vedic-gold bg-vedic-card/50 shadow-gold'
        : 'border-vedic-gold/25 bg-white hover:border-vedic-gold/60'
    }`}
  >
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      disabled={disabled}
      onClick={onSelect}
      className="w-full flex items-center gap-3 p-4 text-left disabled:cursor-not-allowed"
    >
      <span
        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
          selected ? 'border-vedic-gold bg-vedic-gold' : 'border-vedic-muted/40 bg-white'
        }`}
      >
        {selected && <Check className="w-3 h-3 text-vedic-dark" strokeWidth={3} />}
      </span>
      <span className="w-10 h-10 rounded-xl bg-vedic-ivory border border-vedic-gold/25 flex items-center justify-center text-vedic-goldDeep shrink-0">
        {icon}
      </span>
      <span className="flex-1 min-w-0">
        <span className="block text-sm font-bold text-vedic-dark">{title}</span>
        <span className="block text-[11px] text-vedic-muted leading-snug mt-0.5">{subtitle}</span>
      </span>
      {badge && (
        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full shrink-0">{badge}</span>
      )}
    </button>
    {selected && children && <div className="px-4 pb-4 pl-[4.75rem] -mt-1">{children}</div>}
  </div>
);

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export const CheckoutPage: React.FC = () => {
  const {
    cart,
    grandTotal,
    subtotal,
    discountAmount,
    shippingFee,
    savings,
    freeShippingThreshold,
    clearCart,
    beginCheckout,
    removeFromCart,
    appliedCoupon,
    applyCoupon,
    removeCoupon,
  } = useCart();
  const { isAuthenticated, user, placeOrder, addAddress, openAuthModal } = useAuth();
  const navigate = useNavigate();

  const shopifyMode = isShopifyEnabled();

  const [step, setStep] = useState<1 | 2>(1);
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
  }));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saveNewAddress, setSaveNewAddress] = useState(true);

  // Payment
  const [payMethod, setPayMethod] = useState<PayMethod>('online');
  const [cod, setCod] = useState<CodConfig | null>(shopifyMode ? null : { enabled: true, fee: 0, maxOrderValue: 0 });
  const [paying, setPaying] = useState(false);
  const [payError, setPayError] = useState<string | null>(null);
  const [unavailable, setUnavailable] = useState<UnavailableLine[]>([]);
  const [couponIssue, setCouponIssue] = useState<string | null>(null);

  // Summary (collapsible on mobile) + coupon box
  const [summaryOpen, setSummaryOpen] = useState(false);
  const [couponInput, setCouponInput] = useState('');
  const [couponMsg, setCouponMsg] = useState<{ ok: boolean; text: string } | null>(null);

  // Every unauthenticated visit to /checkout (e.g. straight from a "Buy Now" click) gets the login popup.
  useEffect(() => {
    if (!isAuthenticated) {
      openAuthModal('Please sign in or create an account to complete your order.');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  // Is Cash on Delivery switched on in the store settings (api/checkout.ts)?
  useEffect(() => {
    if (!shopifyMode) return;
    let alive = true;
    getCodConfig().then((c) => alive && setCod(c));
    return () => {
      alive = false;
    };
  }, [shopifyMode]);

  // Keep the form in sync with the user's saved profile/address once signed in.
  useEffect(() => {
    if (!user) return;
    const addr = user.addresses.find((a) => a.id === selectedAddressId);
    setFormData((prev) => ({
      ...prev,
      fullName: addr?.fullName || prev.fullName || user.fullName,
      email: prev.email || user.email,
      phone: addr?.phone || prev.phone || user.phone,
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

  // ----- COD availability for THIS order -----
  const codFee = cod?.fee ?? 0;
  const codBlockedReason = useMemo(() => {
    if (!cod) return null; // still loading
    if (!cod.enabled) return 'Cash on Delivery is not available right now.';
    if (cod.maxOrderValue > 0 && grandTotal + codFee > cod.maxOrderValue) {
      return `Available on orders up to ${inr(cod.maxOrderValue)}. Please pay online for this order.`;
    }
    return null;
  }, [cod, grandTotal, codFee]);
  const codUsable = Boolean(cod) && !codBlockedReason;
  const method: PayMethod = payMethod === 'cod' && codUsable ? 'cod' : 'online';
  const payable = grandTotal + (method === 'cod' ? codFee : 0);

  const stateOptions = useMemo(
    () => (formData.state && !INDIAN_STATES.includes(formData.state) ? [formData.state, ...INDIAN_STATES] : INDIAN_STATES),
    [formData.state]
  );

  // ----- gates -----
  if (!isAuthenticated || !user) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-vedic-card border border-vedic-gold/40 text-vedic-goldDeep flex items-center justify-center mx-auto">
          <User className="w-8 h-8" />
        </div>
        <h2 className="font-serif font-bold text-2xl text-vedic-dark">Sign In to Complete Your Order</h2>
        <p className="text-sm text-vedic-muted">Please sign in or create an account to proceed to checkout.</p>
        <button
          onClick={() => openAuthModal('Please sign in or create an account to complete your order.')}
          className="bg-gold-gradient text-vedic-dark px-7 py-3 rounded-full text-sm font-bold shadow-gold hover:brightness-105 transition"
        >
          Sign In / Register
        </button>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-vedic-card border border-vedic-gold/40 text-vedic-goldDeep flex items-center justify-center mx-auto">
          <Package className="w-8 h-8" />
        </div>
        <h2 className="font-serif font-bold text-2xl text-vedic-dark">Your Cart is Empty</h2>
        <button
          onClick={() => navigate('/')}
          className="bg-gold-gradient text-vedic-dark px-7 py-3 rounded-full text-sm font-bold shadow-gold hover:brightness-105 transition"
        >
          Continue Shopping
        </button>
      </div>
    );
  }

  // ----- handlers -----
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    let { name, value } = e.target;
    if (name === 'pincode') value = value.replace(/\D/g, '').slice(0, 6);
    if (name === 'phone') value = value.replace(/[^\d+\s-]/g, '').slice(0, 16);
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const selectNewAddress = () => {
    setSelectedAddressId('new');
    setFormData((prev) => ({ ...prev, ...emptyAddressFields }));
  };

  const validate = () => {
    const next: Record<string, string> = {};
    if (formData.fullName.trim().length < 2) next.fullName = 'Please enter your full name.';
    if (!normalizePhone(formData.phone)) next.phone = 'Enter a valid 10-digit mobile number.';
    if (!/^\S+@\S+\.\S+$/.test(formData.email.trim())) next.email = 'Enter a valid email address.';
    if (formData.addressLine1.trim().length < 5) next.addressLine1 = 'Please enter your house no. / street address.';
    if (!formData.city.trim()) next.city = 'Please enter your city.';
    if (!formData.state) next.state = 'Please select your state.';
    if (!/^[1-9]\d{5}$/.test(formData.pincode)) next.pincode = 'Enter a valid 6-digit pincode.';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleAddressSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
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
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setStep(2);
  };

  const splitName = () => {
    const [firstName, ...rest] = formData.fullName.trim().split(/\s+/);
    return { firstName, lastName: rest.join(' ') };
  };

  // Online payment — Shopify's secure hosted checkout takes the money and creates the order.
  const handlePay = async () => {
    if (paying) return;
    setPaying(true);
    setPayError(null);
    setUnavailable([]);
    const { firstName, lastName } = splitName();
    const phone = `+91${normalizePhone(formData.phone)}`;
    const result = await beginCheckout(
      {
        email: formData.email.trim(),
        phone,
        address: {
          firstName,
          lastName,
          address1: formData.addressLine1,
          address2: formData.addressLine2 || undefined,
          city: formData.city,
          province: formData.state,
          zip: formData.pincode,
          country: 'India',
          phone,
        },
      },
      { acceptCouponIssue: Boolean(couponIssue) }
    );
    if (result.ok) {
      window.location.assign(result.url);
      return;
    }
    if (result.code === 'coupon') setCouponIssue(result.message);
    else setPayError(result.message);
    if (result.unavailable) setUnavailable(result.unavailable);
    setPaying(false);
  };

  // Cash on Delivery — order is created in Shopify as "payment pending" (api/checkout.ts).
  const handleCod = async () => {
    if (paying) return;
    setPaying(true);
    setPayError(null);
    setUnavailable([]);
    try {
      const lines: { variantId: string; quantity: number }[] = [];
      const missing: UnavailableLine[] = [];
      for (const item of cart) {
        const variantId = await resolveMerchandiseId(item);
        if (variantId) lines.push({ variantId, quantity: item.quantity });
        else missing.push({ productId: item.product.id, selectedSize: item.selectedSize, title: item.product.title });
      }
      if (missing.length) {
        setUnavailable(missing);
        setPayError('Some items are not available for online ordering. Please remove them to continue.');
        setPaying(false);
        return;
      }
      const { firstName, lastName } = splitName();
      const startedAt = Date.now();
      const order = await placeCodOrder({
        lines,
        buyer: {
          phone: `+91${normalizePhone(formData.phone)}`,
          address: {
            firstName,
            lastName,
            address1: formData.addressLine1,
            address2: formData.addressLine2 || undefined,
            city: formData.city,
            province: formData.state,
            zip: formData.pincode,
          },
        },
        couponCode: appliedCoupon,
      });
      navigate('/order-success', { replace: true, state: { fromCheckout: true, since: startedAt, cod: true, orderName: order.name } });
      clearCart();
    } catch (err) {
      if (err instanceof CheckoutApiError && err.status === 401) openAuthModal('Your session has expired. Please sign in again.');
      setPayError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
      setPaying(false);
    }
  };

  const handleDemoOrder = () => {
    const order = placeOrder({
      items: cart,
      subtotal,
      discountAmount,
      shippingFee,
      total: payable,
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
      paymentMethod: method === 'cod' ? 'cod' : 'upi',
    });
    clearCart();
    navigate('/order-success', { state: { orderId: order.id, formData, grandTotal: payable, cod: method === 'cod' } });
  };

  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!shopifyMode) return handleDemoOrder();
    return method === 'cod' ? void handleCod() : void handlePay();
  };

  const handleApplyCoupon = () => {
    if (!couponInput.trim()) return;
    const r = applyCoupon(couponInput);
    setCouponMsg({ ok: r.success, text: r.message });
    if (r.success) setCouponInput('');
  };

  const toFreeShipping = Math.max(0, freeShippingThreshold - subtotal);
  const shippingProgress = Math.min(100, Math.round((subtotal / freeShippingThreshold) * 100));
  const itemCount = cart.reduce((n, i) => n + i.quantity, 0);

  // -------------------------------------------------------------------------
  // Order summary (right column; collapsible on mobile)
  // -------------------------------------------------------------------------
  const summary = (
    <aside className="lg:sticky lg:top-24 bg-white rounded-3xl border border-vedic-gold/25 shadow-card overflow-hidden">
      <button
        type="button"
        onClick={() => setSummaryOpen((o) => !o)}
        className="lg:hidden w-full flex items-center justify-between gap-3 px-5 py-4 bg-vedic-card/60 text-left"
        aria-expanded={summaryOpen}
      >
        <span className="flex items-center gap-2 text-sm font-bold text-vedic-dark">
          <Package className="w-4 h-4 text-vedic-goldDeep" /> {summaryOpen ? 'Hide' : 'Show'} order summary
          <ChevronDown className={`w-4 h-4 transition-transform ${summaryOpen ? 'rotate-180' : ''}`} />
        </span>
        <span className="text-base font-extrabold text-vedic-dark">{inr(payable)}</span>
      </button>

      <div className={`${summaryOpen ? 'block' : 'hidden'} lg:block p-5 sm:p-6 space-y-5`}>
        <h3 className="hidden lg:flex items-center justify-between font-serif font-bold text-xl text-vedic-dark">
          Order Summary
          <span className="text-xs font-sans font-semibold text-vedic-muted">
            {itemCount} {itemCount === 1 ? 'item' : 'items'}
          </span>
        </h3>

        <ul className="space-y-3.5 max-h-72 overflow-y-auto pr-1">
          {cart.map((item) => {
            const label = item.selectedSize || item.selectedVariant?.name;
            return (
              <li key={`${item.product.id}-${item.selectedSize ?? ''}`} className="flex gap-3 items-center">
                <div className="relative shrink-0">
                  <img
                    src={item.product.images[0]}
                    alt=""
                    className="w-14 h-14 rounded-xl object-cover border border-vedic-gold/25 bg-vedic-ivory"
                  />
                  <span className="absolute -top-1.5 -right-1.5 min-w-[20px] h-5 px-1 rounded-full bg-vedic-dark text-white text-[10px] font-bold flex items-center justify-center">
                    {item.quantity}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-vedic-dark line-clamp-2 leading-snug">{item.product.title}</p>
                  {label && <p className="text-[11px] text-vedic-muted mt-0.5">{label}</p>}
                </div>
                <span className="text-sm font-bold text-vedic-dark shrink-0">{inr(unitPrice(item) * item.quantity)}</span>
              </li>
            );
          })}
        </ul>

        {/* Coupon */}
        <div className="border-t border-vedic-gold/20 pt-4">
          {appliedCoupon ? (
            <div className="flex items-center justify-between gap-2 bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-2">
              <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-800">
                <Tag className="w-3.5 h-3.5" /> {appliedCoupon} applied
              </span>
              <button
                type="button"
                onClick={() => {
                  removeCoupon();
                  setCouponMsg(null);
                  setCouponIssue(null);
                }}
                aria-label="Remove coupon"
                className="text-emerald-800 hover:text-emerald-950"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <>
              <div className="flex gap-2">
                <input
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleApplyCoupon();
                    }
                  }}
                  placeholder="Coupon code"
                  className={`${inputBase} border-vedic-gold/30 uppercase`}
                />
                <button
                  type="button"
                  onClick={handleApplyCoupon}
                  className="px-4 h-11 rounded-xl border border-vedic-gold text-vedic-dark text-xs font-bold hover:bg-vedic-card transition-colors shrink-0"
                >
                  Apply
                </button>
              </div>
              {couponMsg && (
                <p className={`mt-1.5 text-[11px] font-medium ${couponMsg.ok ? 'text-emerald-700' : 'text-red-600'}`}>{couponMsg.text}</p>
              )}
            </>
          )}
        </div>

        {/* Free shipping nudge */}
        {toFreeShipping > 0 && (
          <div className="bg-vedic-card/60 border border-vedic-gold/25 rounded-xl px-3.5 py-3">
            <p className="text-[11px] font-semibold text-vedic-dark flex items-center gap-1.5">
              <Truck className="w-3.5 h-3.5 text-vedic-goldDeep" />
              Add <span className="font-extrabold">{inr(toFreeShipping)}</span> more for free shipping
            </p>
            <div className="mt-2 h-1.5 rounded-full bg-white overflow-hidden">
              <div className="h-full bg-gold-gradient rounded-full transition-all" style={{ width: `${shippingProgress}%` }} />
            </div>
          </div>
        )}

        {/* Totals */}
        <dl className="space-y-2 text-sm border-t border-vedic-gold/20 pt-4">
          <div className="flex justify-between">
            <dt className="text-vedic-muted">Subtotal</dt>
            <dd className="font-semibold text-vedic-dark">{inr(subtotal)}</dd>
          </div>
          {discountAmount > 0 && (
            <div className="flex justify-between text-emerald-700">
              <dt>Coupon discount</dt>
              <dd className="font-semibold">-{inr(discountAmount)}</dd>
            </div>
          )}
          <div className="flex justify-between">
            <dt className="text-vedic-muted">Shipping</dt>
            <dd className={`font-semibold ${shippingFee === 0 ? 'text-emerald-700' : 'text-vedic-dark'}`}>
              {shippingFee === 0 ? 'FREE' : inr(shippingFee)}
            </dd>
          </div>
          {method === 'cod' && codFee > 0 && (
            <div className="flex justify-between">
              <dt className="text-vedic-muted">COD charge</dt>
              <dd className="font-semibold text-vedic-dark">{inr(codFee)}</dd>
            </div>
          )}
          {savings > 0 && (
            <div className="flex justify-between text-xs text-emerald-700 font-medium">
              <dt>You're saving on products</dt>
              <dd>{inr(savings)}</dd>
            </div>
          )}
          <div className="flex justify-between items-baseline pt-3 border-t border-vedic-gold/20">
            <dt className="font-bold text-vedic-dark">{method === 'cod' ? 'Pay on delivery' : 'Total'}</dt>
            <dd className="text-2xl font-extrabold text-vedic-dark font-serif">{inr(payable)}</dd>
          </div>
        </dl>

        {shopifyMode && method === 'online' && (
          <p className="text-[11px] text-vedic-muted leading-relaxed">
            Taxes and the final shipping charge are confirmed on the secure payment page.
          </p>
        )}

        <div className="grid grid-cols-2 gap-2.5 pt-1">
          {[
            { icon: <ShieldCheck className="w-4 h-4" />, text: 'Secure payments' },
            { icon: <BadgeCheck className="w-4 h-4" />, text: 'Authentic products' },
            { icon: <Truck className="w-4 h-4" />, text: 'Pan-India delivery' },
            { icon: <RotateCcw className="w-4 h-4" />, text: 'Easy returns' },
          ].map((t) => (
            <div key={t.text} className="flex items-center gap-2 text-[11px] font-semibold text-vedic-dark">
              <span className="text-vedic-goldDeep">{t.icon}</span>
              {t.text}
            </div>
          ))}
        </div>
      </div>
    </aside>
  );

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------
  return (
    <div className="max-w-6xl mx-auto px-4 pb-24 md:pb-10">
      <Breadcrumb items={[{ label: 'Checkout' }]} />

      <div className="text-center space-y-4 mb-7">
        <h1 className="font-serif font-bold text-3xl sm:text-4xl text-vedic-dark">Secure Checkout</h1>
        <Stepper step={step} onBack={() => setStep(1)} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_380px] gap-6 lg:gap-8 items-start">
        {/* Summary first on mobile so the total is always visible; right column on desktop */}
        <div className="lg:order-2">{summary}</div>

        <div className="lg:order-1 bg-white rounded-3xl p-5 sm:p-8 border border-vedic-gold/25 shadow-card">
          {step === 1 ? (
            <form onSubmit={handleAddressSubmit} noValidate className="space-y-7">
              {/* Contact */}
              <section className="space-y-4">
                <h2 className="font-serif font-bold text-xl text-vedic-dark flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-vedic-card border border-vedic-gold/40 text-vedic-goldDeep text-xs font-sans font-bold flex items-center justify-center">1</span>
                  Contact details
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label="Full name *" error={errors.fullName}>
                    <input
                      type="text"
                      name="fullName"
                      autoComplete="name"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      className={`${inputBase} ${errors.fullName ? 'border-red-400' : 'border-vedic-gold/30'}`}
                    />
                  </Field>
                  <Field label="Mobile number *" error={errors.phone}>
                    <input
                      type="tel"
                      name="phone"
                      inputMode="tel"
                      autoComplete="tel"
                      placeholder="10-digit mobile number"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className={`${inputBase} ${errors.phone ? 'border-red-400' : 'border-vedic-gold/30'}`}
                    />
                  </Field>
                  <Field label="Email address *" error={errors.email} className="sm:col-span-2">
                    <input
                      type="email"
                      name="email"
                      autoComplete="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className={`${inputBase} ${errors.email ? 'border-red-400' : 'border-vedic-gold/30'}`}
                    />
                  </Field>
                </div>
                <p className="text-[11px] text-vedic-muted">We'll send order and delivery updates to this number and email.</p>
              </section>

              {/* Address */}
              <section className="space-y-4">
                <h2 className="font-serif font-bold text-xl text-vedic-dark flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-vedic-card border border-vedic-gold/40 text-vedic-goldDeep text-xs font-sans font-bold flex items-center justify-center">2</span>
                  Delivery address
                </h2>

                {user.addresses.length > 0 && (
                  <div className="space-y-2" role="radiogroup" aria-label="Saved addresses">
                    {user.addresses.map((addr) => {
                      const on = selectedAddressId === addr.id;
                      return (
                        <button
                          type="button"
                          key={addr.id}
                          role="radio"
                          aria-checked={on}
                          onClick={() => setSelectedAddressId(addr.id)}
                          className={`w-full flex items-start gap-3 p-3.5 rounded-2xl border-2 text-left transition-all ${
                            on ? 'border-vedic-gold bg-vedic-card/50' : 'border-vedic-gold/25 bg-white hover:border-vedic-gold/60'
                          }`}
                        >
                          <span
                            className={`mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                              on ? 'border-vedic-gold bg-vedic-gold' : 'border-vedic-muted/40'
                            }`}
                          >
                            {on && <Check className="w-3 h-3 text-vedic-dark" strokeWidth={3} />}
                          </span>
                          <span className="text-xs min-w-0">
                            <span className="font-bold text-vedic-dark flex items-center gap-1.5 text-sm">
                              <MapPin className="w-3.5 h-3.5 text-vedic-goldDeep" /> {addr.fullName}
                              {addr.isDefault && (
                                <span className="text-[10px] font-bold text-vedic-goldDeep bg-vedic-card px-1.5 py-0.5 rounded-full">Default</span>
                              )}
                            </span>
                            <span className="text-vedic-muted block mt-1 leading-relaxed">
                              {addr.addressLine1}
                              {addr.addressLine2 ? `, ${addr.addressLine2}` : ''}, {addr.city}, {addr.state} - {addr.pincode}
                            </span>
                          </span>
                        </button>
                      );
                    })}
                    <button
                      type="button"
                      role="radio"
                      aria-checked={selectedAddressId === 'new'}
                      onClick={selectNewAddress}
                      className={`w-full flex items-center gap-3 p-3.5 rounded-2xl border-2 text-sm font-bold text-left transition-all ${
                        selectedAddressId === 'new'
                          ? 'border-vedic-gold bg-vedic-card/50 text-vedic-dark'
                          : 'border-dashed border-vedic-gold/40 bg-white text-vedic-dark hover:border-vedic-gold'
                      }`}
                    >
                      <Plus className="w-4 h-4 text-vedic-goldDeep" /> Deliver to a new address
                    </button>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label="House no. / Street address *" error={errors.addressLine1} className="sm:col-span-2">
                    <input
                      type="text"
                      name="addressLine1"
                      autoComplete="address-line1"
                      value={formData.addressLine1}
                      onChange={handleInputChange}
                      className={`${inputBase} ${errors.addressLine1 ? 'border-red-400' : 'border-vedic-gold/30'}`}
                    />
                  </Field>
                  <Field label="Landmark / Area (optional)" className="sm:col-span-2">
                    <input
                      type="text"
                      name="addressLine2"
                      autoComplete="address-line2"
                      value={formData.addressLine2}
                      onChange={handleInputChange}
                      className={`${inputBase} border-vedic-gold/30`}
                    />
                  </Field>
                  <Field label="Pincode *" error={errors.pincode}>
                    <input
                      type="text"
                      name="pincode"
                      inputMode="numeric"
                      autoComplete="postal-code"
                      maxLength={6}
                      value={formData.pincode}
                      onChange={handleInputChange}
                      className={`${inputBase} ${errors.pincode ? 'border-red-400' : 'border-vedic-gold/30'}`}
                    />
                  </Field>
                  <Field label="City *" error={errors.city}>
                    <input
                      type="text"
                      name="city"
                      autoComplete="address-level2"
                      value={formData.city}
                      onChange={handleInputChange}
                      className={`${inputBase} ${errors.city ? 'border-red-400' : 'border-vedic-gold/30'}`}
                    />
                  </Field>
                  <Field label="State *" error={errors.state} className="sm:col-span-2">
                    <select
                      name="state"
                      autoComplete="address-level1"
                      value={formData.state}
                      onChange={handleInputChange}
                      className={`${inputBase} ${errors.state ? 'border-red-400' : 'border-vedic-gold/30'}`}
                    >
                      <option value="">Select state</option>
                      {stateOptions.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </Field>
                </div>

                {selectedAddressId === 'new' && (
                  <label className="flex items-center gap-2 text-xs text-vedic-muted cursor-pointer">
                    <input
                      type="checkbox"
                      checked={saveNewAddress}
                      onChange={(e) => setSaveNewAddress(e.target.checked)}
                      className="w-4 h-4 accent-vedic-gold"
                    />
                    Save this address to my account for next time
                  </label>
                )}
              </section>

              <button
                type="submit"
                className="w-full bg-gold-gradient text-vedic-dark py-4 rounded-full font-bold text-sm shadow-gold hover:brightness-105 active:scale-[0.99] transition flex items-center justify-center gap-2"
              >
                Continue to Payment <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          ) : (
            <form onSubmit={handlePlaceOrder} className="space-y-6">
              {/* Delivery recap */}
              <section className="rounded-2xl border border-vedic-gold/25 bg-vedic-ivory/70 p-4 flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 min-w-0">
                  <MapPin className="w-4 h-4 text-vedic-goldDeep mt-0.5 shrink-0" />
                  <div className="text-xs min-w-0">
                    <p className="font-bold text-vedic-dark text-sm">{formData.fullName}</p>
                    <p className="text-vedic-muted mt-0.5 leading-relaxed">
                      {formData.addressLine1}
                      {formData.addressLine2 ? `, ${formData.addressLine2}` : ''}, {formData.city}, {formData.state} - {formData.pincode}
                    </p>
                    <p className="text-vedic-muted mt-0.5">
                      {formData.phone} · {formData.email}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  disabled={paying}
                  className="shrink-0 flex items-center gap-1 text-xs font-bold text-vedic-goldDeep hover:underline disabled:opacity-50"
                >
                  <Pencil className="w-3 h-3" /> Change
                </button>
              </section>

              <section className="space-y-3">
                <h2 className="font-serif font-bold text-xl text-vedic-dark">Choose payment method</h2>

                <div role="radiogroup" aria-label="Payment method" className="space-y-3">
                  {/* Online */}
                  <PayOption
                    selected={method === 'online'}
                    onSelect={() => setPayMethod('online')}
                    icon={<CreditCard className="w-5 h-5" />}
                    title="Pay Online"
                    subtitle="UPI, Credit / Debit Card, Net Banking & Wallets"
                    badge="Recommended"
                  >
                    <div className="flex flex-wrap gap-1.5">
                      {['UPI', 'Visa', 'Mastercard', 'RuPay', 'Net Banking', 'Wallets'].map((c) => (
                        <span key={c} className="text-[10px] font-bold text-vedic-dark bg-white border border-vedic-gold/30 px-2 py-0.5 rounded-md">
                          {c}
                        </span>
                      ))}
                    </div>
                    <p className="text-[11px] text-vedic-muted leading-relaxed mt-2.5 flex items-start gap-1.5">
                      <Lock className="w-3 h-3 mt-0.5 shrink-0 text-emerald-600" />
                      {shopifyMode
                        ? "You'll be taken to our secure payment page to complete the payment. Your order is confirmed the moment it succeeds."
                        : 'Encrypted, secure payment. Your order is confirmed as soon as the payment succeeds.'}
                    </p>
                    {codFee > 0 && cod?.enabled && (
                      <p className="text-[11px] font-semibold text-emerald-700 mt-1.5">No extra charges — save {inr(codFee)} vs Cash on Delivery.</p>
                    )}
                  </PayOption>

                  {/* COD */}
                  <PayOption
                    selected={method === 'cod'}
                    disabled={!codUsable}
                    onSelect={() => setPayMethod('cod')}
                    icon={cod === null ? <Loader2 className="w-5 h-5 animate-spin" /> : <Banknote className="w-5 h-5" />}
                    title="Cash on Delivery"
                    subtitle={
                      cod === null
                        ? 'Checking availability…'
                        : codBlockedReason ?? (codFee > 0 ? `Pay when your order arrives · ${inr(codFee)} COD charge` : 'Pay in cash when your order arrives')
                    }
                  >
                    <ul className="text-[11px] text-vedic-muted leading-relaxed space-y-1">
                      <li className="flex items-start gap-1.5">
                        <Check className="w-3 h-3 mt-0.5 shrink-0 text-emerald-600" /> Pay {inr(payable)} to the delivery partner at your doorstep.
                      </li>
                      <li className="flex items-start gap-1.5">
                        <Check className="w-3 h-3 mt-0.5 shrink-0 text-emerald-600" /> We may contact you on your mobile to confirm the order before dispatch.
                      </li>
                      <li className="flex items-start gap-1.5">
                        <Check className="w-3 h-3 mt-0.5 shrink-0 text-emerald-600" /> Please keep the exact amount ready if possible.
                      </li>
                    </ul>
                  </PayOption>
                </div>

                {couponIssue && (
                  <div className="flex items-start gap-2 text-[11px] font-semibold text-amber-800 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2.5">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-px" />
                    <span>{couponIssue} Press the button again to continue without it.</span>
                  </div>
                )}
                {payError && (
                  <div role="alert" className="flex items-start gap-2 text-[12px] font-semibold text-red-700 bg-red-50 border border-red-200 rounded-xl px-3 py-2.5">
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
                          className="text-red-700 font-bold hover:underline shrink-0"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </section>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  disabled={paying}
                  className="h-14 px-5 rounded-full text-sm font-bold border border-vedic-gold/50 text-vedic-dark hover:bg-vedic-card transition-colors disabled:opacity-50 flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span className="hidden sm:inline">Back</span>
                </button>
                <button
                  type="submit"
                  disabled={paying}
                  className="flex-1 h-14 bg-gold-gradient text-vedic-dark rounded-full font-bold text-sm sm:text-base shadow-gold hover:brightness-105 active:scale-[0.99] transition flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {paying ? <Loader2 className="w-4 h-4 animate-spin" /> : method === 'cod' ? <Banknote className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                  {paying
                    ? method === 'cod'
                      ? 'Placing your order…'
                      : 'Preparing secure payment…'
                    : method === 'cod'
                    ? `Place COD Order · ${inr(payable)}`
                    : `Pay ${inr(payable)} Securely`}
                </button>
              </div>

              <p className="text-[11px] text-center text-vedic-muted flex items-center justify-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Your details are encrypted and never shared.
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
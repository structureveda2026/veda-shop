import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { Breadcrumb } from '../components/Breadcrumb';
import { ShieldCheck, Lock, CheckCircle2, CreditCard, Smartphone, Banknote, ArrowRight } from 'lucide-react';

export const CheckoutPage: React.FC = () => {
  const { cart, grandTotal, subtotal, discountAmount, shippingFee, clearCart } = useCart();
  const navigate = useNavigate();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [formData, setFormData] = useState({
    fullName: 'Yash Sharma',
    email: 'yash@example.com',
    phone: '9876543210',
    addressLine1: 'Flat 402, Lotus Towers',
    addressLine2: 'MG Road, Connaught Place',
    city: 'New Delhi',
    state: 'Delhi',
    pincode: '110001',
    paymentMethod: 'upi',
  });

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

  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault();
    const orderId = `VA-ORD-${Math.floor(100000 + Math.random() * 900000)}`;
    clearCart();
    navigate('/order-success', { state: { orderId, formData, grandTotal } });
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
            <div className="space-y-6">
              <h3 className="font-serif font-bold text-lg text-vedic-maroon border-b border-vedic-beige pb-3">
                Shipping Address Details
              </h3>

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

              <button
                onClick={() => setStep(2)}
                className="w-full bg-vedic-maroon text-white py-3.5 rounded-full text-xs font-bold shadow-md hover:bg-vedic-maroonDark transition-colors flex items-center justify-center gap-2"
              >
                Proceed to Select Payment Method <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <form onSubmit={handlePlaceOrder} className="space-y-6">
              <h3 className="font-serif font-bold text-lg text-vedic-maroon border-b border-vedic-beige pb-3">
                Select Secure Payment Method
              </h3>

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

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-6 py-3 rounded-full text-xs font-bold border border-vedic-gold/40 text-vedic-dark"
                >
                  Back
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-gold-gradient text-vedic-dark py-4 rounded-full font-serif font-bold text-sm shadow-xl hover:brightness-105 transition-all flex items-center justify-center gap-2"
                >
                  <Lock className="w-4 h-4" /> Complete Sacred Order (₹{grandTotal.toLocaleString('en-IN')})
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
        </div>
      </div>
    </div>
  );
};
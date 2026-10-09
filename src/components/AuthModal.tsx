import React, { useEffect, useState } from 'react';
import { X, Mail, Lock, User, Phone, Eye, EyeOff, Loader2, Sparkles, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

/**
 * Global Login / Register popup. Rendered once in App.tsx and opened from anywhere via
 * `useAuth().openAuthModal(reason)` — the cart, wishlist, Buy Now buttons and the Header's
 * Account icon all trigger the same instance instead of each owning their own modal.
 */
export const AuthModal: React.FC = () => {
  const {
    isAuthModalOpen,
    authModalTab,
    authModalReason,
    closeAuthModal,
    setAuthModalTab,
    login,
    register,
    authError,
    isSubmitting,
    clearAuthError,
    shopifyAuth,
    signInWithShopify,
  } = useAuth();
  const [shopifyEmail, setShopifyEmail] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [registerData, setRegisterData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthModalOpen) {
      setFormError(null);
      clearAuthError();
      setShowPassword(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthModalOpen, authModalTab]);

  if (!isAuthModalOpen) return null;

  const switchTab = (tab: 'login' | 'register') => {
    setFormError(null);
    clearAuthError();
    setAuthModalTab(tab);
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (!loginData.email.trim() || !loginData.password) {
      setFormError('Please enter your email and password.');
      return;
    }
    await login(loginData);
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    const { fullName, email, phone, password, confirmPassword } = registerData;
    if (!fullName.trim() || !email.trim() || !phone.trim() || !password) {
      setFormError('Please fill in all fields.');
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
      setFormError('Please enter a valid email address.');
      return;
    }
    if (phone.replace(/\D/g, '').length !== 10) {
      setFormError('Please enter a valid 10-digit mobile number.');
      return;
    }
    if (password.length < 6) {
      setFormError('Password must be at least 6 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setFormError('Passwords do not match.');
      return;
    }
    const ok = await register({ fullName, email, phone, password });
    if (ok) {
      setRegisterData({ fullName: '', email: '', phone: '', password: '', confirmPassword: '' });
    }
  };

  const displayError = formError || authError;

  const handleShopifySignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    const email = shopifyEmail.trim();
    if (email && !/^\S+@\S+\.\S+$/.test(email)) {
      setFormError('Please enter a valid email address.');
      return;
    }
    await signInWithShopify({ loginHint: email || undefined });
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/65 backdrop-blur-sm" onClick={closeAuthModal} />

      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden z-10 border border-vedic-gold/30 max-h-[92vh] overflow-y-auto">
        <button
          onClick={closeAuthModal}
          className="absolute top-3 right-3 z-20 p-2 rounded-full bg-white/80 hover:bg-vedic-maroon hover:text-white transition-colors shadow-md"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="bg-vedic-brown px-6 pt-8 pb-6 text-center">
          <div className="w-12 h-12 rounded-full bg-gold-gradient flex items-center justify-center mx-auto mb-3 shadow-gold">
            <Sparkles className="w-6 h-6 text-vedic-dark" />
          </div>
          <h2 className="font-serif font-extrabold text-xl text-vedic-ivory">
            {shopifyAuth ? 'Sign In or Join' : authModalTab === 'login' ? 'Welcome Back' : 'Join Veda Structure'}
          </h2>
          <p className="text-xs text-vedic-gold/80 mt-1">
            {shopifyAuth
              ? 'One secure account for your cart, orders and returns'
              : authModalTab === 'login'
              ? 'Sign in to continue your sacred journey'
              : 'Create your account to begin shopping'}
          </p>
        </div>

        {authModalReason && (
          <div className="mx-6 mt-4 flex items-start gap-2 bg-vedic-gold/10 border border-vedic-gold/30 rounded-xl px-3 py-2.5 text-[11px] text-vedic-maroon font-semibold">
            <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5 text-vedic-goldDark" />
            <span>{authModalReason}</span>
          </div>
        )}

        {!shopifyAuth && (
        <div className="flex mx-6 mt-4 bg-vedic-ivory rounded-full p-1 border border-vedic-gold/20">
          <button
            onClick={() => switchTab('login')}
            className={`flex-1 py-2 rounded-full text-xs font-bold transition-colors ${
              authModalTab === 'login' ? 'bg-vedic-maroon text-white shadow' : 'text-vedic-dark'
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => switchTab('register')}
            className={`flex-1 py-2 rounded-full text-xs font-bold transition-colors ${
              authModalTab === 'register' ? 'bg-vedic-maroon text-white shadow' : 'text-vedic-dark'
            }`}
          >
            Register
          </button>
        </div>
        )}

        <div className="p-6">
          {displayError && (
            <div className="mb-4 text-[11px] font-semibold text-red-700 bg-red-50 border border-red-200 rounded-xl px-3 py-2">
              {displayError}
            </div>
          )}

          {shopifyAuth ? (
            <form onSubmit={handleShopifySignIn} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-vedic-dark mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-vedic-muted absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={shopifyEmail}
                    onChange={(e) => setShopifyEmail(e.target.value)}
                    placeholder="you@example.com"
                    autoComplete="email"
                    className="w-full pl-9 pr-3 py-2.5 bg-vedic-ivory rounded-xl border border-vedic-gold/30 focus:outline-none focus:border-vedic-gold"
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-vedic-maroon text-white py-3 rounded-full text-xs font-bold shadow-md hover:bg-vedic-maroonDark transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                Continue Securely
              </button>
              <p className="text-center text-[11px] text-vedic-muted leading-relaxed">
                We'll email you a one-time code on our secure sign-in page — no password needed. New here? An account is
                created automatically.
              </p>
            </form>
          ) : authModalTab === 'login' ? (
            <form onSubmit={handleLoginSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-vedic-dark mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-vedic-muted absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={loginData.email}
                    onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                    placeholder="you@example.com"
                    className="w-full pl-9 pr-3 py-2.5 bg-vedic-ivory rounded-xl border border-vedic-gold/30 focus:outline-none focus:border-vedic-gold"
                  />
                </div>
              </div>
              <div>
                <label className="block font-bold text-vedic-dark mb-1">Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-vedic-muted absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={loginData.password}
                    onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-9 py-2.5 bg-vedic-ivory rounded-xl border border-vedic-gold/30 focus:outline-none focus:border-vedic-gold"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-vedic-muted"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-vedic-maroon text-white py-3 rounded-full text-xs font-bold shadow-md hover:bg-vedic-maroonDark transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                Sign In
              </button>
              <p className="text-center text-vedic-muted">
                New to Veda Structure?{' '}
                <button type="button" onClick={() => switchTab('register')} className="text-vedic-goldDark font-bold hover:underline">
                  Create an account
                </button>
              </p>
            </form>
          ) : (
            <form onSubmit={handleRegisterSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-vedic-dark mb-1">Full Name</label>
                <div className="relative">
                  <User className="w-4 h-4 text-vedic-muted absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={registerData.fullName}
                    onChange={(e) => setRegisterData({ ...registerData, fullName: e.target.value })}
                    placeholder="Your full name"
                    className="w-full pl-9 pr-3 py-2.5 bg-vedic-ivory rounded-xl border border-vedic-gold/30 focus:outline-none focus:border-vedic-gold"
                  />
                </div>
              </div>
              <div>
                <label className="block font-bold text-vedic-dark mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-vedic-muted absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={registerData.email}
                    onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                    placeholder="you@example.com"
                    className="w-full pl-9 pr-3 py-2.5 bg-vedic-ivory rounded-xl border border-vedic-gold/30 focus:outline-none focus:border-vedic-gold"
                  />
                </div>
              </div>
              <div>
                <label className="block font-bold text-vedic-dark mb-1">Mobile Number</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-vedic-muted absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    value={registerData.phone}
                    onChange={(e) => setRegisterData({ ...registerData, phone: e.target.value })}
                    placeholder="98765 43210"
                    className="w-full pl-9 pr-3 py-2.5 bg-vedic-ivory rounded-xl border border-vedic-gold/30 focus:outline-none focus:border-vedic-gold"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-vedic-dark mb-1">Password</label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={registerData.password}
                    onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                    placeholder="••••••••"
                    className="w-full px-3 py-2.5 bg-vedic-ivory rounded-xl border border-vedic-gold/30 focus:outline-none focus:border-vedic-gold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-vedic-dark mb-1">Confirm</label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={registerData.confirmPassword}
                    onChange={(e) => setRegisterData({ ...registerData, confirmPassword: e.target.value })}
                    placeholder="••••••••"
                    className="w-full px-3 py-2.5 bg-vedic-ivory rounded-xl border border-vedic-gold/30 focus:outline-none focus:border-vedic-gold"
                  />
                </div>
              </div>
              <label className="flex items-center gap-2 text-[11px] text-vedic-muted">
                <input
                  type="checkbox"
                  onChange={() => setShowPassword((s) => !s)}
                  checked={showPassword}
                  className="accent-vedic-maroon"
                />
                Show password
              </label>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gold-gradient text-vedic-dark py-3 rounded-full text-xs font-bold shadow-md hover:brightness-105 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                Create Account
              </button>
              <p className="text-center text-vedic-muted">
                Already have an account?{' '}
                <button type="button" onClick={() => switchTab('login')} className="text-vedic-goldDark font-bold hover:underline">
                  Sign in
                </button>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
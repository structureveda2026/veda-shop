import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { X, Mail, User, Phone, Loader2, ArrowRight, ArrowLeft, ShieldCheck } from 'lucide-react';
import { useAuth, savePendingSignup } from '../context/AuthContext';

/**
 * Background of the sign-in screen. Served from /public now; to switch it to a Shopify-hosted image later,
 * set VITE_AUTH_BG_URL to the image URL (Shopify → Content → Files) — nothing else needs to change.
 */
const AUTH_BG: string = import.meta.env.VITE_AUTH_BG_URL || '/images/auth/auth-bg.jpg';

const EMAIL_RE = /^\S+@\S+\.\S+$/;

const inputCls =
  'w-full pl-10 pr-3 py-3 bg-white/80 rounded-xl border border-vedic-gold/30 focus:outline-none focus:border-vedic-maroon text-sm text-vedic-dark placeholder:text-vedic-muted';

/**
 * Global Login / Create-account popup (one form at a time). Rendered once in App.tsx and opened from anywhere via
 * `useAuth().openAuthModal(reason, tab)`. Sign-in and account creation are fully handled by Shopify Customer
 * Accounts: this form only collects the email, then Shopify emails a one-time code on its secure page.
 */
export const AuthModal: React.FC = () => {
  const {
    isAuthModalOpen,
    authModalTab,
    authModalReason,
    closeAuthModal,
    setAuthModalTab,
    authError,
    isSubmitting,
    clearAuthError,
    shopifyAuth,
    signInWithShopify,
  } = useAuth();

  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [agree, setAgree] = useState(true);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthModalOpen) {
      setFormError(null);
      clearAuthError();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthModalOpen, authModalTab]);

  useEffect(() => {
    if (!isAuthModalOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && closeAuthModal();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [isAuthModalOpen, closeAuthModal]);

  if (!isAuthModalOpen) return null;

  const isLogin = authModalTab === 'login';
  const displayError = formError || authError;

  const switchTab = (tab: 'login' | 'register') => {
    setFormError(null);
    clearAuthError();
    setAuthModalTab(tab);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    const mail = email.trim();
    if (!EMAIL_RE.test(mail)) return setFormError('Please enter a valid email address.');
    if (!isLogin) {
      if (!fullName.trim()) return setFormError('Please enter your full name.');
      if (phone.trim() && phone.replace(/\D/g, '').length !== 10) {
        return setFormError('Please enter a valid 10-digit mobile number, or leave it empty.');
      }
      if (!agree) return setFormError('Please accept the Terms & Conditions and Privacy Policy.');
      savePendingSignup({ email: mail, fullName: fullName.trim(), phone: phone.trim() });
    }
    await signInWithShopify({ loginHint: mail });
  };

  // Google / Apple / Facebook buttons live on Shopify's own sign-in page (turn them on in Shopify admin).
  const moreOptions = () => signInWithShopify();

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div
        className="fixed inset-0 bg-cover bg-center scale-110 blur-[3px]"
        style={{ backgroundImage: `url(${AUTH_BG})` }}
        onClick={closeAuthModal}
        aria-hidden="true"
      />
      <div className="fixed inset-0 bg-black/40" onClick={closeAuthModal} aria-hidden="true" />

      <div
        role="dialog"
        aria-modal="true"
        aria-label={isLogin ? 'Sign in' : 'Create account'}
        className="relative z-10 w-full max-w-[400px] my-auto bg-vedic-ivory/95 rounded-3xl shadow-2xl border border-vedic-gold/30 px-5 sm:px-7 py-7 max-h-[94vh] overflow-y-auto"
      >
        {isLogin ? (
          <button
            onClick={closeAuthModal}
            className="absolute top-3 right-3 p-2 rounded-full bg-white/80 hover:bg-vedic-maroon hover:text-white transition-colors shadow"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        ) : (
          <button
            onClick={() => switchTab('login')}
            className="absolute top-3 left-3 p-2 rounded-full bg-white/80 hover:bg-vedic-maroon hover:text-white transition-colors shadow"
            aria-label="Back to sign in"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
        )}

        <div className="text-center">
          <img src="/logo.png" alt="Veda Store" className="h-14 w-auto mx-auto object-contain" />
          <h2 className="font-serif font-bold text-2xl sm:text-3xl text-vedic-maroonDark mt-3">
            {isLogin ? 'Welcome Back' : 'Create Your Account'}
          </h2>
          <p className="text-xs sm:text-sm text-vedic-muted mt-1.5 leading-relaxed">
            {isLogin
              ? 'Sign in to continue your spiritual journey with Veda Store'
              : 'Join Veda Store and be a part of a mindful, spiritual lifestyle.'}
          </p>
        </div>

        {authModalReason && (
          <div className="mt-4 flex items-start gap-2 bg-vedic-gold/10 border border-vedic-gold/30 rounded-xl px-3 py-2 text-[11px] text-vedic-maroon font-semibold">
            <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5 text-vedic-goldDark" />
            <span>{authModalReason}</span>
          </div>
        )}

        {displayError && (
          <div className="mt-4 text-[11px] font-semibold text-red-700 bg-red-50 border border-red-200 rounded-xl px-3 py-2">
            {displayError}
          </div>
        )}

        {!shopifyAuth ? (
          <p className="mt-5 text-xs text-center text-vedic-muted bg-white/70 border border-vedic-gold/30 rounded-xl p-3">
            Sign-in is not connected yet. Add <b>VITE_SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_ID</b> to the environment variables.
          </p>
        ) : (
          <form onSubmit={submit} className="mt-5 space-y-3.5 text-xs">
            {!isLogin && (
              <div>
                <label className="block font-semibold text-vedic-dark mb-1">Full Name</label>
                <div className="relative">
                  <User className="w-4 h-4 text-vedic-muted absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Enter your full name"
                    autoComplete="name"
                    className={inputCls}
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block font-semibold text-vedic-dark mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-vedic-muted absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  autoComplete="email"
                  className={inputCls}
                />
              </div>
            </div>

            {!isLogin && (
              <>
                <div>
                  <label className="block font-semibold text-vedic-dark mb-1">
                    Phone Number <span className="font-normal text-vedic-muted">(Optional)</span>
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-vedic-muted absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="tel"
                      inputMode="numeric"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="Enter your phone number"
                      autoComplete="tel"
                      className={inputCls}
                    />
                  </div>
                </div>
                <label className="flex items-start gap-2 text-[11px] text-vedic-dark cursor-pointer">
                  <input
                    type="checkbox"
                    checked={agree}
                    onChange={(e) => setAgree(e.target.checked)}
                    className="mt-0.5 accent-vedic-maroon"
                  />
                  <span>
                    I agree to the{' '}
                    <Link to="/policies/terms" onClick={closeAuthModal} className="text-vedic-maroon font-semibold underline">
                      Terms &amp; Conditions
                    </Link>{' '}
                    and{' '}
                    <Link to="/policies/privacy" onClick={closeAuthModal} className="text-vedic-maroon font-semibold underline">
                      Privacy Policy
                    </Link>
                  </span>
                </label>
              </>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-vedic-maroon text-white py-3 rounded-xl text-sm font-bold shadow-md hover:bg-vedic-maroonDark transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              {isLogin ? 'Send OTP' : 'Create Account'}
              {!isSubmitting && <ArrowRight className="w-4 h-4" />}
            </button>

            <p className="text-center text-[11px] text-vedic-muted leading-relaxed">
              A 6-digit code is emailed to you on Shopify's secure page. No password needed.
            </p>

            <div className="flex items-center gap-3 text-[10px] text-vedic-muted">
              <span className="flex-1 h-px bg-vedic-gold/30" />
              OR
              <span className="flex-1 h-px bg-vedic-gold/30" />
            </div>

            <button
              type="button"
              onClick={moreOptions}
              disabled={isSubmitting}
              className="w-full bg-white py-3 rounded-xl border border-vedic-gold/30 text-sm font-semibold text-vedic-dark hover:border-vedic-maroon transition-colors disabled:opacity-60"
            >
              Continue with Google / Apple / Facebook
            </button>
          </form>
        )}

        <p className="mt-5 text-center text-xs text-vedic-dark">
          {isLogin ? "Don't have an account? " : 'Already have an account? '}
          <button
            onClick={() => switchTab(isLogin ? 'register' : 'login')}
            className="font-bold text-vedic-maroon hover:underline"
          >
            {isLogin ? 'Create Account' : 'Sign In'}
          </button>
        </p>
      </div>
    </div>
  );
};
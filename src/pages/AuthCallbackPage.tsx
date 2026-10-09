import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Loader2, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

/** Shopify sends the visitor back here after sign-in (register this URL as the Callback URI). */
export const AuthCallbackPage: React.FC = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { completeShopifySignIn, signInWithShopify } = useAuth();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    completeShopifySignIn(params)
      .then((returnTo) => alive && navigate(returnTo, { replace: true }))
      .catch((e) => alive && setError(e instanceof Error ? e.message : 'Sign-in failed. Please try again.'));
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
      {error ? (
        <>
          <div className="w-16 h-16 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto">
            <AlertCircle className="w-8 h-8" />
          </div>
          <h2 className="font-serif font-bold text-xl text-vedic-maroon">We couldn't sign you in</h2>
          <p className="text-xs text-vedic-muted">{error}</p>
          <button
            onClick={() => signInWithShopify({ returnTo: '/account' })}
            className="bg-vedic-maroon text-white px-6 py-2.5 rounded-full text-xs font-bold shadow-md hover:bg-vedic-maroonDark"
          >
            Try Again
          </button>
        </>
      ) : (
        <>
          <Loader2 className="w-10 h-10 text-vedic-gold animate-spin mx-auto" />
          <p className="text-sm font-semibold text-vedic-maroon">Signing you in securely…</p>
        </>
      )}
    </div>
  );
};
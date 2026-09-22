import React, { useState } from 'react';
import { HomeSection, SectionHeader } from './HomeSection';
import { subscribeToNewsletter } from '../../services/homeService';
import { track } from '../../lib/analytics';
import type { SectionContent } from '../../services/homeService';

type Status = 'idle' | 'submitting' | 'success' | 'error';

/** One field, one button. No popup. */
export const HomeNewsletter: React.FC<{ content: SectionContent }> = ({ content }) => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const value = email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      setStatus('error');
      setMessage('Please enter a valid email address.');
      return;
    }
    setStatus('submitting');
    try {
      await subscribeToNewsletter(value);
      track('newsletter_signup');
      setStatus('success');
      setMessage("Thank you — you're on the list.");
      setEmail('');
    } catch {
      setStatus('error');
      setMessage("We couldn't sign you up just now. Please try again in a moment.");
    }
  };

  return (
    <HomeSection id="newsletter" tone="sand" className="[&>div]:py-12 md:[&>div]:py-16">
      <div className="max-w-xl mx-auto">
        <SectionHeader eyebrow={content.eyebrow} title={content.title} description={content.description} className="mb-8" />

        <form onSubmit={handleSubmit} noValidate className="flex flex-col sm:flex-row gap-3">
          <label htmlFor="home-newsletter-email" className="sr-only">Email address</label>
          <input
            id="home-newsletter-email"
            type="email"
            inputMode="email"
            autoComplete="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (status === 'error') setStatus('idle');
            }}
            placeholder="Enter your email"
            aria-invalid={status === 'error'}
            className="flex-1 min-w-0 rounded-full border border-vedic-charcoal/20 bg-white px-5 py-3.5 text-sm text-vedic-dark placeholder:text-vedic-muted focus:outline-none focus:border-vedic-gold focus:ring-2 focus:ring-vedic-gold/30"
          />
          <button
            type="submit"
            disabled={status === 'submitting'}
            className="rounded-full bg-vedic-charcoal px-7 py-3.5 text-sm font-medium tracking-wide text-white hover:bg-vedic-dark disabled:opacity-60 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-vedic-gold focus-visible:ring-offset-2 focus-visible:ring-offset-vedic-sand"
          >
            {status === 'submitting' ? 'Subscribing…' : 'Subscribe'}
          </button>
        </form>

        <p
          role="status"
          aria-live="polite"
          className={`mt-3 min-h-[1.25rem] text-center text-sm ${status === 'error' ? 'text-red-600' : 'text-emerald-700'}`}
        >
          {status === 'success' || status === 'error' ? message : ''}
        </p>
      </div>
    </HomeSection>
  );
};
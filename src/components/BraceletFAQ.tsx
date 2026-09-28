import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ChevronDown, HelpCircle } from 'lucide-react';
import { BraceletFaqItem, getBraceletFaqPreview } from '../services/braceletContentService';

/** Section 24 (spec): FAQ accordion — short preview here, full list on /faqs. */
export const BraceletFAQ: React.FC = () => {
  const [faqs, setFaqs] = useState<BraceletFaqItem[]>([]);
  const [openId, setOpenId] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    getBraceletFaqPreview().then((r) => {
      if (!isMounted) return;
      setFaqs(r);
      setOpenId(r[0]?.id ?? null);
    });
    return () => {
      isMounted = false;
    };
  }, []);

  if (faqs.length === 0) return null;

  return (
    <section id="bracelet-faq" className="bg-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="text-center mb-8">
          <p className="text-[11px] sm:text-xs font-bold tracking-[0.15em] text-vedic-goldDark uppercase mb-2 flex items-center justify-center gap-1.5">
            <HelpCircle className="w-3.5 h-3.5" strokeWidth={1.5} /> FAQs
          </p>
          <h2 className="font-serif font-semibold text-vedic-dark text-2xl sm:text-3xl">Frequently Asked Questions</h2>
        </div>

        <div className="space-y-3">
          {faqs.map((faq) => {
            const isOpen = openId === faq.id;
            return (
              <div key={faq.id} className="border border-vedic-gold/15 rounded-2xl overflow-hidden bg-vedic-ivory">
                <button
                  onClick={() => setOpenId(isOpen ? null : faq.id)}
                  aria-expanded={isOpen}
                  className="w-full flex items-center justify-between gap-4 text-left px-5 py-4"
                >
                  <span className="font-serif font-semibold text-vedic-dark text-sm sm:text-base">{faq.question}</span>
                  <ChevronDown className={`w-4 h-4 text-vedic-goldDark shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
                </button>
                {isOpen && (
                  <div className="px-5 pb-4">
                    <p className="text-sm text-vedic-muted leading-relaxed">{faq.answer}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-7 text-center">
          <Link to="/faqs" className="inline-flex items-center gap-1.5 text-sm font-semibold text-vedic-goldDark hover:text-vedic-maroon transition-colors">
            View All FAQs <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </section>
  );
};
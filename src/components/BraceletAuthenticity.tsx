import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, FileCheck, Image as ImageIcon, MapPin, PackageSearch, PlayCircle, ScanEye } from 'lucide-react';

// Data-driven card list (spec section 21).
const CARDS = [
  { id: 'details', title: 'Product Details', description: 'Material, size and specifications', icon: PackageSearch },
  { id: 'origin', title: 'Origin', description: 'Origin information where available', icon: MapPin },
  { id: 'certification', title: 'Certification', description: 'Certificate information where applicable', icon: FileCheck },
  { id: 'treatment', title: 'Treatment Disclosure', description: 'Treatment status where relevant', icon: ScanEye },
  { id: 'images', title: 'Product Images', description: 'Actual product photography wherever practical', icon: ImageIcon },
  { id: 'transparency', title: 'Transparency', description: 'Clear product specifications', icon: FileCheck }
];

/** Sections 21 + 22 merged (spec): "Know What You're Buying" + "See It Before You Buy". No blanket
 *  certification claim — certificates are shown per product where they exist. The video CTA links
 *  to the existing /videos page (reel content reused in ecommerce). */
export const BraceletAuthenticity: React.FC = () => (
  <section id="bracelet-authenticity" className="bg-white">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
      <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-10">
        <p className="text-[11px] sm:text-xs font-bold tracking-[0.15em] text-vedic-goldDark uppercase mb-2">Authenticity</p>
        <h2 className="font-serif font-semibold text-vedic-dark text-2xl sm:text-3xl">Know What You're Buying</h2>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 mb-10">
        {CARDS.map(({ id, title, description, icon: Icon }) => (
          <div key={id} className="bg-vedic-ivory border border-vedic-gold/15 rounded-2xl p-5 flex flex-col gap-2.5">
            <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-white">
              <Icon className="w-[18px] h-[18px] text-vedic-goldDark" strokeWidth={1.5} />
            </span>
            <h3 className="font-serif font-bold text-vedic-dark text-sm sm:text-base leading-snug">{title}</h3>
            <p className="text-xs text-vedic-muted leading-relaxed">{description}</p>
          </div>
        ))}
      </div>

      <div className="bg-vedic-ivory border border-vedic-gold/20 rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="text-center sm:text-left">
          <h3 className="font-serif font-bold text-vedic-dark text-lg sm:text-xl mb-1.5">See It Before You Buy</h3>
          <p className="text-sm text-vedic-muted max-w-xl">Short vertical videos — close-ups, bead size, wrist view, packaging and certificates.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 shrink-0">
          <Link to="/videos" className="inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-full bg-vedic-dark text-vedic-gold text-sm font-semibold hover:bg-vedic-maroon hover:text-white transition-colors whitespace-nowrap">
            <PlayCircle className="w-4 h-4" /> Watch Product Videos
          </Link>
          <Link to="/authenticity" className="inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-full border border-vedic-gold/30 text-vedic-goldDark text-sm font-semibold hover:bg-vedic-gold/10 transition-colors whitespace-nowrap">
            Learn About Authenticity <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  </section>
);
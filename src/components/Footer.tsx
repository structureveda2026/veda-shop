import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Phone, Mail, MapPin, ShieldCheck, Truck, RotateCcw, Award } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-vedic-dark text-vedic-ivory pt-16 pb-24 md:pb-12 border-t-4 border-vedic-gold">


      {/* Main Multi-Column Links */}
      <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-10">
        {/* Col 1: Brand Info */}
        <div className="space-y-4 lg:col-span-1">
          <Link to="/" className="inline-block bg-white p-2 rounded-2xl shadow-md">
            <img
              src="/logo.png"
              alt="Veda Structure - Making Worship Easier Through Online Worldwide"
              className="h-10 w-auto object-contain"
            />
          </Link>
          <p className="text-xs text-vedic-muted leading-relaxed">
            Established in 2022, Veda Structure brings together astrologers, sages, pundits, and experts. Providing authentic Nepalese Rudraksha, gemstones, yantras, Vedic puja, astrology consultations, numerology, and spiritual merchandise.
          </p>
          <div className="text-[11px] text-vedic-gold font-bold uppercase tracking-wider">
            Making Worship Easier Through Online Worldwide
          </div>
        </div>

        {/* Col 2: Quick Links */}
        <div className="space-y-3">
          <h4 className="font-serif font-bold text-sm text-vedic-goldLight tracking-wider uppercase">
            Quick Navigation
          </h4>
          <ul className="space-y-2 text-xs text-vedic-muted">
            <li><Link to="/" className="hover:text-vedic-gold transition-colors">Home</Link></li>
            <li><Link to="/about" className="hover:text-vedic-gold transition-colors">About Veda Structure</Link></li>
            <li><Link to="/contact" className="hover:text-vedic-gold transition-colors">Contact Us</Link></li>
            <li><Link to="/collections/rudraksha-kavach" className="hover:text-vedic-gold transition-colors">Rudraksha Kavach</Link></li>
            <li><Link to="/collections/rudraksha" className="hover:text-vedic-gold transition-colors">Nepali Rudraksha</Link></li>
            <li><Link to="/collections/bracelets" className="hover:text-vedic-gold transition-colors">Crystal Bracelets</Link></li>
            <li><Link to="/puja-kits" className="hover:text-vedic-gold transition-colors">Puja Kits</Link></li>
            <li><Link to="/yantra" className="hover:text-vedic-gold transition-colors">Sacred Yantras</Link></li>
            <li><Link to="/collections/sawan-special-collection" className="hover:text-vedic-gold transition-colors">Sawan Special Collection</Link></li>
            <li><Link to="/collections/sawan-special-puja" className="hover:text-vedic-gold transition-colors">Online Puja & Pandit Services</Link></li>
          </ul>
        </div>

        {/* Col 3: Customer Care & Policies */}
        <div className="space-y-3">
          <h4 className="font-serif font-bold text-sm text-vedic-goldLight tracking-wider uppercase">
            Customer Care
          </h4>
          <ul className="space-y-2 text-xs text-vedic-muted">
            <li><Link to="/track-order" className="hover:text-vedic-gold transition-colors">Track Your Order</Link></li>
            <li><Link to="/rashi" className="hover:text-vedic-gold transition-colors">Choose Rudraksha by Zodiac</Link></li>
            <li><Link to="/policies/shipping" className="hover:text-vedic-gold transition-colors">Shipping Policy</Link></li>
            <li><Link to="/policies/returns" className="hover:text-vedic-gold transition-colors">Return & Exchange Policy</Link></li>
            <li><Link to="/policies/privacy" className="hover:text-vedic-gold transition-colors">Privacy Policy</Link></li>
            <li><Link to="/policies/terms" className="hover:text-vedic-gold transition-colors">Terms & Conditions</Link></li>
          </ul>
        </div>

        {/* Col 4: Spiritual Services */}
        <div className="space-y-3">
          <h4 className="font-serif font-bold text-sm text-vedic-goldLight tracking-wider uppercase">
            Vedic Services
          </h4>
          <ul className="space-y-2 text-xs text-vedic-muted">
            <li><span className="hover:text-vedic-gold cursor-default">Vedic Astrology Consultations</span></li>
            <li><span className="hover:text-vedic-gold cursor-default">Horoscope Predictions</span></li>
            <li><span className="hover:text-vedic-gold cursor-default">Numerology Analysis</span></li>
            <li><span className="hover:text-vedic-gold cursor-default">Vedic & Online Puja</span></li>
            <li><span className="hover:text-vedic-gold cursor-default">Pandit Services</span></li>
            <li><span className="hover:text-vedic-gold cursor-default">Lab Certified Gemstones</span></li>
            <li><span className="hover:text-vedic-gold cursor-default">Astrology Reports & Courses</span></li>
          </ul>
        </div>

        {/* Col 5: Contact & Support */}
        <div className="space-y-3">
          <h4 className="font-serif font-bold text-sm text-vedic-goldLight tracking-wider uppercase">
            Contact Info
          </h4>
          <ul className="space-y-2.5 text-xs text-vedic-muted">
            <li className="flex items-center gap-2.5">
              <Phone className="w-4 h-4 text-vedic-gold shrink-0" />
              <span>+91 96348 76239 / +91 96213 04116</span>
            </li>
            <li className="flex items-center gap-2.5">
              <Mail className="w-4 h-4 text-vedic-gold shrink-0" />
              <span>Support@vedastructure.com / care@vedastructure.com</span>
            </li>
            <li className="flex items-start gap-2.5">
              <MapPin className="w-4 h-4 text-vedic-gold shrink-0 mt-0.5" />
              <span>Veda Structure, Varanasi, Uttar Pradesh 221001, India</span>
            </li>
          </ul>

          <div className="pt-2">
            <h5 className="text-[11px] font-bold text-vedic-goldLight mb-2 uppercase">Safe & Encrypted Payments</h5>
            <div className="flex items-center gap-2 flex-wrap text-[10px] text-vedic-muted">
              <span className="px-2 py-1 bg-vedic-charcoal rounded border border-vedic-gold/20">Razorpay</span>
              <span className="px-2 py-1 bg-vedic-charcoal rounded border border-vedic-gold/20">UPI</span>
              <span className="px-2 py-1 bg-vedic-charcoal rounded border border-vedic-gold/20">GPay</span>
              <span className="px-2 py-1 bg-vedic-charcoal rounded border border-vedic-gold/20">PhonePe</span>
              <span className="px-2 py-1 bg-vedic-charcoal rounded border border-vedic-gold/20">COD</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Copyright & Disclaimer */}
      <div className="max-w-7xl mx-auto px-4 mt-12 pt-6 border-t border-vedic-charcoal flex flex-col md:flex-row items-center justify-between text-[11px] text-vedic-muted gap-4">
        <p>© 2022-2026 Veda Structure. All rights reserved.</p>
        <p className="text-center max-w-xl text-[10px] leading-tight">
          Veda Structure is a platform combining Vedic astrology, consultations, horoscope predictions, numerology, online puja, pandit services, and authentic spiritual products.
        </p>
      </div>
    </footer>
  );
};
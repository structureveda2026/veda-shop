import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { X, ChevronRight, ChevronDown, Phone, ShieldCheck, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MobileMenu: React.FC<MobileMenuProps> = ({ isOpen, onClose }) => {
  const [openSection, setOpenSection] = useState<string | null>('rudraksha');
  const { isAuthenticated, user, openAuthModal } = useAuth();

  if (!isOpen) return null;

  const toggleSection = (section: string) => {
    setOpenSection((prev) => (prev === section ? null : section));
  };

  return (
    <div className="fixed inset-0 z-50 flex md:hidden">
      {/* Dark overlay backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Slide-over Drawer Panel */}
      <div className="relative flex flex-col w-full max-w-xs bg-vedic-ivory h-full shadow-2xl overflow-y-auto border-r border-vedic-gold/30">
        
        {/* Mobile Menu Header */}
        <div className="p-4 border-b border-vedic-gold/20 flex items-center justify-between bg-white sticky top-0 z-10">
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="Veda Store" className="h-8 w-auto" />
            <span className="font-serif font-bold text-sm text-vedic-brown">VEDA STORE</span>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-vedic-dark hover:text-vedic-maroon rounded-full hover:bg-vedic-ivory"
            aria-label="Close menu"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Navigation Tree Accordions */}
        <div className="flex-1 p-4 space-y-3">
          
          {/* Quick Home Link */}
          <Link
            to="/"
            onClick={onClose}
            className="flex items-center justify-between p-3 rounded-xl bg-white border border-vedic-gold/20 text-xs font-bold text-vedic-dark hover:text-vedic-maroon"
          >
            <span>HOME</span>
            <ChevronRight className="w-4 h-4 text-vedic-gold" />
          </Link>

          {/* 01. RUDRAKSHA */}
          <div className="rounded-xl border border-vedic-gold/20 bg-white overflow-hidden">
            <button
              onClick={() => toggleSection('rudraksha')}
              className="w-full p-3 flex items-center justify-between text-xs font-bold text-vedic-dark uppercase bg-vedic-ivory/50"
            >
              <span>RUDRAKSHA (1-14 MUKHI)</span>
              <ChevronDown
                className={`w-4 h-4 text-vedic-gold transition-transform ${
                  openSection === 'rudraksha' ? 'rotate-180' : ''
                }`}
              />
            </button>
            {openSection === 'rudraksha' && (
              <div className="p-3 border-t border-vedic-beige">
                <Link
                  to="/rudraksha"
                  onClick={onClose}
                  className="block mb-3 text-center py-2 rounded-lg bg-vedic-maroon text-vedic-ivory text-xs font-bold"
                >
                  View Rudraksha Page →
                </Link>
                <div className="grid grid-cols-2 gap-1.5 text-xs">
                  {Array.from({ length: 14 }).map((_, i) => (
                    <Link
                      key={i}
                      to={`/products/${i + 1}-mukhi-rudraksha`}
                      onClick={onClose}
                      className="p-2 rounded bg-vedic-ivory hover:bg-vedic-goldLight text-vedic-dark font-medium border border-vedic-gold/10"
                    >
                      {i + 1} Mukhi
                    </Link>
                  ))}
                </div>
                <div className="mt-3 pt-2 border-t border-vedic-beige space-y-1 text-xs font-semibold text-vedic-maroon">
                  <Link to="/products/gauri-shankar-rudraksha" onClick={onClose} className="block py-1">Gauri Shankar Rudraksha</Link>
                  <Link to="/products/ganesh-rudraksha" onClick={onClose} className="block py-1">Ganesha Rudraksha</Link>
                  <Link to="/collections/rudraksha" onClick={onClose} className="block py-1 text-vedic-goldDark">Explore All Rudraksha →</Link>
                </div>
              </div>
            )}
          </div>

          {/* 02. GEMSTONES */}
          <div className="rounded-xl border border-vedic-gold/20 bg-white overflow-hidden">
            <button
              onClick={() => toggleSection('gemstones')}
              className="w-full p-3 flex items-center justify-between text-xs font-bold text-vedic-dark uppercase bg-vedic-ivory/50"
            >
              <span>GEMSTONES</span>
              <ChevronDown
                className={`w-4 h-4 text-vedic-gold transition-transform ${
                  openSection === 'gemstones' ? 'rotate-180' : ''
                }`}
              />
            </button>
            {openSection === 'gemstones' && (
              <div className="p-3 space-y-1.5 border-t border-vedic-beige text-xs font-medium text-vedic-charcoal">
                <Link to="/gemstones" onClick={onClose} className="block py-1 font-semibold text-vedic-maroon">All Gemstones & Navratna</Link>
                <Link to="/gemstones#find-my-gemstone" onClick={onClose} className="block py-1 font-semibold text-vedic-brown">Find My Gemstone</Link>
                <Link to="/custom-gemstone-jewellery" onClick={onClose} className="block py-1">Custom Jewellery Builder</Link>
                <Link to="/guides/gemstone" onClick={onClose} className="block py-1">Gemstone Buying Guide</Link>
                <Link to="/contact?subject=Gemstone%20Consultation" onClick={onClose} className="block py-1 text-vedic-goldDark font-bold">Astrology Consultation →</Link>
              </div>
            )}
          </div>

          {/* 03. MALA & BRACELETS */}
          <div className="rounded-xl border border-vedic-gold/20 bg-white overflow-hidden">
            <button
              onClick={() => toggleSection('mala')}
              className="w-full p-3 flex items-center justify-between text-xs font-bold text-vedic-dark uppercase bg-vedic-ivory/50"
            >
              <span>MALA & BRACELETS</span>
              <ChevronDown
                className={`w-4 h-4 text-vedic-gold transition-transform ${
                  openSection === 'mala' ? 'rotate-180' : ''
                }`}
              />
            </button>
            {openSection === 'mala' && (
              <div className="p-3 space-y-1.5 border-t border-vedic-beige text-xs font-medium text-vedic-charcoal">
                <Link
                  to="/bracelets"
                  onClick={onClose}
                  className="block mb-3 text-center py-2 rounded-lg bg-vedic-maroon text-vedic-ivory text-xs font-bold"
                >
                  View Bracelet Page →
                </Link>
                <Link to="/collections/mala" onClick={onClose} className="block py-1 font-semibold text-vedic-maroon">108 Bead & Sacred Malas</Link>
                <Link to="/collections/bracelets" onClick={onClose} className="block py-1 font-semibold text-vedic-maroon">Crystal & Rudraksha Bracelets</Link>
                <Link to="/collections/bracelets" onClick={onClose} className="block py-1">Karungali Wood Bracelet</Link>
                <Link to="/collections/bracelets" onClick={onClose} className="block py-1">Navgrah Zodiac Bracelets</Link>
              </div>
            )}
          </div>

          {/* 04. PUJA SAMAGRI */}
          <div className="rounded-xl border border-vedic-gold/20 bg-white overflow-hidden">
            <button
              onClick={() => toggleSection('puja')}
              className="w-full p-3 flex items-center justify-between text-xs font-bold text-vedic-dark uppercase bg-vedic-ivory/50"
            >
              <span>PUJA SAMAGRI</span>
              <ChevronDown
                className={`w-4 h-4 text-vedic-gold transition-transform ${
                  openSection === 'puja' ? 'rotate-180' : ''
                }`}
              />
            </button>
            {openSection === 'puja' && (
              <div className="p-3 space-y-1.5 border-t border-vedic-beige text-xs font-medium text-vedic-charcoal">
                <Link to="/collections/puja-samagri" onClick={onClose} className="block py-1 font-semibold text-vedic-maroon">Puja Samagri & Essentials</Link>
                <Link to="/puja-kits" onClick={onClose} className="block py-1 font-semibold text-vedic-maroon">Complete Puja Kits</Link>
                <Link to="/puja-kits?type=rudrabhishek-kit" onClick={onClose} className="block py-1">Rudrabhishek Kit</Link>
                <Link to="/puja-kits?type=shiv-puja-kit" onClick={onClose} className="block py-1">Shiv Puja Kit</Link>
              </div>
            )}
          </div>

        </div>

        {/* Bottom Utility Footer */}
        <div className="p-4 border-t border-vedic-gold/30 bg-vedic-brown text-vedic-ivory space-y-3">
          <div className="grid grid-cols-2 gap-2 text-xs font-semibold">
            {isAuthenticated ? (
              <Link to="/account" onClick={onClose} className="flex items-center gap-2 p-2 rounded bg-white/10">
                <User className="w-4 h-4 text-vedic-gold" /> {(user?.fullName || 'Account').split(' ')[0]}
              </Link>
            ) : (
              <button
                onClick={() => {
                  onClose();
                  openAuthModal();
                }}
                className="flex items-center gap-2 p-2 rounded bg-white/10"
              >
                <User className="w-4 h-4 text-vedic-gold" /> Login / Register
              </button>
            )}
            <Link to="/track-order" onClick={onClose} className="flex items-center gap-2 p-2 rounded bg-white/10">
              <ShieldCheck className="w-4 h-4 text-vedic-gold" /> Track Order
            </Link>
          </div>

          <Link
            to="/contact?subject=Vedic%20Astrology%20Consultation"
            onClick={onClose}
            className="w-full py-2.5 bg-vedic-gold text-vedic-dark font-serif font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow"
          >
            <Phone className="w-4 h-4" /> CONSULT AN ASTROLOGER
          </Link>
        </div>

      </div>
    </div>
  );
};
import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Heart, ShoppingBag, User, Menu, X, Sparkles, ArrowRight } from 'lucide-react';
import { AnnouncementBar } from './AnnouncementBar';
import { MegaMenu } from './MegaMenu';
import { MobileMenu } from './MobileMenu';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import { MOCK_PRODUCTS } from '../data/products';
import { Product } from '../types/ecommerce';

export const Header: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  
  const { totalItems, setIsCartOpen } = useCart();
  const { wishlistCount } = useWishlist();
  const { isAuthenticated, user, openAuthModal } = useAuth();
  const navigate = useNavigate();
  const searchRef = useRef<HTMLDivElement>(null);

  // Live Predictive Search handler
  useEffect(() => {
    if (searchQuery.trim().length > 1) {
      const q = searchQuery.toLowerCase();
      const filtered = MOCK_PRODUCTS.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.tags.some((t) => t.toLowerCase().includes(q)) ||
          (p.mukhi && p.mukhi.toLowerCase().includes(q)) ||
          (p.rashi && p.rashi.some((r) => r.toLowerCase().includes(q)))
      ).slice(0, 5);
      setSearchResults(filtered);
      setIsSearchOpen(true);
    } else {
      setSearchResults([]);
      setIsSearchOpen(false);
    }
  }, [searchQuery]);

  // Click outside listener for search suggestions
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setIsSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setIsSearchOpen(false);
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-vedic-ivory shadow-md">
      <AnnouncementBar />

      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="md:hidden p-2 text-vedic-dark hover:text-vedic-maroon focus:outline-none"
            aria-label="Open Menu"
          >
            <Menu className="w-6 h-6" />
          </button>

          {/* Brand Logo */}
          <Link to="/" className="flex items-center group py-1">
            <img
              src="/logo.png"
              alt="Veda Structure - Making Worship Easier Through Online Worldwide"
              className="h-10 md:h-12 w-auto object-contain group-hover:scale-105 transition-transform duration-200"
            />
          </Link>

          {/* Desktop Search Bar */}
          <div ref={searchRef} className="hidden md:flex flex-1 max-w-md relative">
            <form onSubmit={handleSearchSubmit} className="w-full relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search Rudraksha, Evil Eye, Karungali, Pyrite, Rashi..."
                className="w-full pl-10 pr-10 py-2 text-xs bg-white rounded-full border border-vedic-gold/40 focus:border-vedic-gold focus:ring-2 focus:ring-vedic-gold/20 focus:outline-none shadow-inner text-vedic-dark placeholder:text-vedic-muted"
              />
              <Search className="w-4 h-4 text-vedic-muted absolute left-3.5 top-2.5" />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-2.5 text-vedic-muted hover:text-vedic-dark"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </form>

            {/* Predictive Search Suggestions Popup */}
            {isSearchOpen && (
              <div className="absolute left-0 right-0 top-full mt-2 bg-white rounded-2xl shadow-2xl border border-vedic-gold/30 p-3 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                <div className="text-[10px] font-bold text-vedic-muted uppercase tracking-wider mb-2 px-2">
                  Matching Spiritual Items ({searchResults.length})
                </div>

                {searchResults.length > 0 ? (
                  <div className="space-y-2">
                    {searchResults.map((prod) => (
                      <Link
                        key={prod.id}
                        to={`/products/${prod.slug}`}
                        onClick={() => setIsSearchOpen(false)}
                        className="flex items-center gap-3 p-2 hover:bg-vedic-ivory rounded-xl transition-colors group"
                      >
                        <img
                          src={prod.images[0]}
                          alt={prod.title}
                          className="w-10 h-10 object-cover rounded-lg border border-vedic-gold/20"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="text-xs font-semibold text-vedic-dark truncate group-hover:text-vedic-maroon">
                            {prod.title}
                          </h4>
                          <p className="text-[11px] font-bold text-vedic-maroon">
                            ₹{prod.price.toLocaleString('en-IN')}
                            <span className="text-[10px] text-vedic-muted line-through ml-2">
                              ₹{prod.compareAtPrice.toLocaleString('en-IN')}
                            </span>
                          </p>
                        </div>
                        <ArrowRight className="w-4 h-4 text-vedic-gold opacity-0 group-hover:opacity-100 transition-opacity" />
                      </Link>
                    ))}

                    <div className="pt-2 border-t border-vedic-beige text-center">
                      <button
                        onClick={handleSearchSubmit}
                        className="text-xs font-bold text-vedic-goldDark hover:underline"
                      >
                        See All Search Results →
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 text-center text-xs text-vedic-muted">
                    No matching items found for "{searchQuery}".
                  </div>
                )}
              </div>
            )}
          </div>

          {/* User Utility Actions */}
          <div className="flex items-center space-x-3 md:space-x-5">
            {isAuthenticated ? (
              <Link
                to="/account"
                className="hidden sm:flex flex-col items-center text-vedic-dark hover:text-vedic-maroon transition-colors"
                title="My Account"
              >
                <span className="w-5 h-5 rounded-full bg-vedic-maroon text-vedic-gold flex items-center justify-center text-[9px] font-bold border border-vedic-gold/40">
                  {(user?.fullName || 'U').trim().charAt(0).toUpperCase()}
                </span>
                <span className="text-[10px] font-medium mt-0.5">
                  {(user?.fullName || 'Account').split(' ')[0]}
                </span>
              </Link>
            ) : (
              <button
                onClick={() => openAuthModal()}
                className="hidden sm:flex flex-col items-center text-vedic-dark hover:text-vedic-maroon transition-colors"
                title="Login / Register"
              >
                <User className="w-5 h-5" />
                <span className="text-[10px] font-medium mt-0.5">Login</span>
              </button>
            )}

            <Link
              to="/wishlist"
              className="relative flex flex-col items-center text-vedic-dark hover:text-vedic-maroon transition-colors"
              title="Wishlist"
            >
              <Heart className="w-5 h-5" />
              {wishlistCount > 0 && (
                <span className="absolute -top-1.5 -right-2 bg-vedic-maroon text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {wishlistCount}
                </span>
              )}
              <span className="text-[10px] font-medium mt-0.5 hidden sm:inline">Wishlist</span>
            </Link>

            <button
              onClick={() => setIsCartOpen(true)}
              className="relative flex items-center gap-2 bg-vedic-maroon text-vedic-ivory px-3.5 py-1.5 rounded-full hover:bg-vedic-maroonDark transition-all shadow-md group"
              title="Shopping Cart"
            >
              <ShoppingBag className="w-4 h-4 text-vedic-gold group-hover:scale-110 transition-transform" />
              <span className="text-xs font-bold">{totalItems}</span>
              <span className="text-xs font-semibold hidden md:inline border-l border-vedic-gold/30 pl-2">
                Cart
              </span>
            </button>
          </div>
        </div>

        {/* Mobile Search input */}
        <div className="mt-3 md:hidden">
          <form onSubmit={handleSearchSubmit} className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search Rudraksha, Bracelets, Vastu..."
              className="w-full pl-9 pr-8 py-2 text-xs bg-white rounded-full border border-vedic-gold/40 focus:border-vedic-gold focus:outline-none text-vedic-dark placeholder:text-vedic-muted"
            />
            <Search className="w-4 h-4 text-vedic-muted absolute left-3 top-2.5" />
          </form>
        </div>
      </div>

      {/* Desktop Mega Menu */}
      <MegaMenu />

      {/* Mobile Drawer Menu */}
      <MobileMenu
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />
    </header>
  );
};
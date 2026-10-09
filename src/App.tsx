import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import { RecentlyViewedProvider } from './context/RecentlyViewedContext';
import { UnitProvider } from './context/UnitContext';
import { rememberReturnPath } from './lib/returnPath';

import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { CartDrawer } from './components/CartDrawer';
import { CartAddedToast } from './components/CartAddedToast';
import { StickyBottomNav } from './components/StickyBottomNav';
import { AuthModal } from './components/AuthModal';
import { CheckoutReturnWatcher } from './components/CheckoutReturnWatcher';

import { HomePage } from './pages/HomePage';
import { RudrakshaPage } from './pages/RudrakshaPage';
import { BraceletsPage } from './pages/BraceletsPage';
import { PujaKitsPage } from './pages/PujaKitsPage';
import { YantraPage } from './pages/YantraPage';
import { ShopPage } from './pages/ShopPage';
import { CategoryPage } from './pages/CategoryPage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { SearchPage } from './pages/SearchPage';
import { CartPage } from './pages/CartPage';
import { WishlistPage } from './pages/WishlistPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { OrderSuccessPage } from './pages/OrderSuccessPage';
import { TrackOrderPage } from './pages/TrackOrderPage';
import { RashiGuidePage } from './pages/RashiGuidePage';
import { SingleRashiPage } from './pages/SingleRashiPage';
import { SinglePurposePage } from './pages/SinglePurposePage';
import { RudrakshaGuidePage } from './pages/RudrakshaGuidePage';
import { GemstoneGuidePage } from './pages/GemstoneGuidePage';
import { PujaGuidePage } from './pages/PujaGuidePage';
import { BlogPage } from './pages/BlogPage';
import { VideosPage } from './pages/VideosPage';
import { FaqPage } from './pages/FaqPage';
import { AccountPage } from './pages/AccountPage';
import { OrdersPage } from './pages/OrdersPage';
import { OrderDetailPage } from './pages/OrderDetailPage';
import { AuthCallbackPage } from './pages/AuthCallbackPage';
import { AboutPage } from './pages/AboutPage';
import { ContactPage } from './pages/ContactPage';
import { AuthenticityPage } from './pages/AuthenticityPage';
import { PolicyPage } from './pages/PolicyPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { GemstonesPage } from './pages/GemstonesPage';
import { AllGemstonesPage } from './pages/AllGemstonesPage';
import { SingleGemstonePage } from './pages/SingleGemstonePage';
import { GemstoneListingDetailPage } from './pages/GemstoneListingDetailPage';
import { PlanetGemstonesPage } from './pages/PlanetGemstonesPage';
import { CertificationHubPage } from './pages/CertificationHubPage';
import { CustomJewelleryPage } from './pages/CustomJewelleryPage';
import { AdminPage } from './pages/AdminPage';

// Scroll to Top on route change
const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

// Remember the last normal page (Home, Rudraksha, Bracelets…) so a completed order can send the visitor back to it
const ReturnPathTracker = () => {
  const { pathname, search } = useLocation();
  useEffect(() => {
    rememberReturnPath(pathname + search);
  }, [pathname, search]);
  return null;
};

export const App: React.FC = () => {
  return (
    <Router>
      <AuthProvider>
      <UnitProvider>
        <CartProvider>
          <WishlistProvider>
            <RecentlyViewedProvider>
              <ScrollToTop />
              <ReturnPathTracker />
              <div className="min-h-screen flex flex-col bg-vedic-ivory text-vedic-dark font-sans selection:bg-vedic-gold selection:text-vedic-dark">
                <Header />

                <main className="flex-1">
                  <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/shop" element={<ShopPage />} />
                    
                    {/* Gemstone System 2.0 & Catalog Routes */}
                    <Route path="/gemstones" element={<GemstonesPage />} />
                    <Route path="/gemstones/zodiac-stones" element={<GemstonesPage />} />
                    <Route path="/gemstones/popular-vedic-gems" element={<GemstonesPage />} />
                    <Route path="/gemstones/exclusive" element={<GemstonesPage />} />
                    <Route path="/gemstones/other" element={<GemstonesPage />} />
                    <Route path="/gemstones/view-all" element={<AllGemstonesPage />} />
                    <Route path="/gemstones/:slug/listing/:productId" element={<GemstoneListingDetailPage />} />
                    <Route path="/gemstones/:slug" element={<SingleGemstonePage />} />
                    <Route path="/planets/:planetSlug" element={<PlanetGemstonesPage />} />
                    <Route path="/certification" element={<CertificationHubPage />} />
                    <Route path="/custom-gemstone-jewellery" element={<CustomJewelleryPage />} />

                    <Route path="/admin" element={<AdminPage />} />
                    <Route path="/search" element={<SearchPage />} />

                    {/* Collections */}
                    <Route path="/collections/:category" element={<CategoryPage />} />
                    <Route path="/collections/:category/:subcategory" element={<CategoryPage />} />

                    {/* Products */}
                    <Route path="/products/:slug" element={<ProductDetailPage />} />

                    {/* Astrological & Intentional Guides */}
                    <Route path="/rashi" element={<RashiGuidePage />} />
                    <Route path="/rashi/:rashi" element={<SingleRashiPage />} />
                    <Route path="/purpose/:purposeId" element={<SinglePurposePage />} />

                    {/* Learn & Guides */}
                    <Route path="/rudraksha" element={<RudrakshaPage />} />
                    <Route path="/bracelets" element={<BraceletsPage />} />
                    <Route path="/puja-kits" element={<PujaKitsPage />} />
                    <Route path="/yantra" element={<YantraPage />} />
                    <Route path="/yantras" element={<Navigate to="/yantra" replace />} />
                    <Route path="/guides/rudraksha" element={<RudrakshaGuidePage />} />
                    <Route path="/guides/gemstone" element={<GemstoneGuidePage />} />
                    <Route path="/guides/puja" element={<PujaGuidePage />} />
                    <Route path="/blog" element={<BlogPage />} />
                    <Route path="/videos" element={<VideosPage />} />
                    <Route path="/faqs" element={<FaqPage />} />

                    {/* E-Commerce Flow */}
                    <Route path="/cart" element={<CartPage />} />
                    <Route path="/wishlist" element={<WishlistPage />} />
                    <Route path="/checkout" element={<CheckoutPage />} />
                    <Route path="/order-success" element={<OrderSuccessPage />} />
                    <Route path="/track-order" element={<TrackOrderPage />} />

                    {/* User Account */}
                    <Route path="/account" element={<AccountPage />} />
                    <Route path="/account/orders" element={<OrdersPage />} />
                    <Route path="/account/orders/:orderId" element={<OrderDetailPage />} />
                    <Route path="/account/callback" element={<AuthCallbackPage />} />

                    {/* Brand & Support */}
                    <Route path="/about" element={<AboutPage />} />
                    <Route path="/contact" element={<ContactPage />} />
                    <Route path="/authenticity" element={<AuthenticityPage />} />

                    {/* Policy Pages */}
                    <Route path="/policies/:policyType" element={<PolicyPage />} />

                    {/* 404 Route */}
                    <Route path="*" element={<NotFoundPage />} />
                  </Routes>
                </main>

                <Footer />
                <CartDrawer />
                <CartAddedToast />
                <CheckoutReturnWatcher />
                <StickyBottomNav />
                <AuthModal />
              </div>
            </RecentlyViewedProvider>
          </WishlistProvider>
        </CartProvider>
      </UnitProvider>
      </AuthProvider>
    </Router>
  );
};

export default App;
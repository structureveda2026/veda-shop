import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { MOCK_PRODUCTS } from '../data/products';
import { Product, ProductVariant } from '../types/ecommerce';
import { fetchProductDetail, isShopifyEnabled, ShopifyProductDetail } from '../lib/shopify';
import { resolveDiscount } from '../lib/pricing';
import {
  OptionVariant,
  Selection,
  buildDemoOptions,
  defaultSelection,
  findVariant,
  selectionLabel,
  visibleOptions,
} from '../lib/purchaseOptions';
import { Breadcrumb } from '../components/Breadcrumb';
import { ProductCard } from '../components/ProductCard';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useRecentlyViewed } from '../context/RecentlyViewedContext';
import { AddToCartControl } from '../components/AddToCartControl';
import { PurchaseOptionsPanel } from '../components/PurchaseOptionsPanel';
import { BenefitBadges } from '../components/BenefitBadges';
import { ProductGallery } from '../components/ProductGallery';
import { CertificateViewerModal } from '../components/CertificateViewerModal';
import { ProductReviewsSection } from '../components/ProductReviewsSection';
import { FindMyGemstoneModal } from '../components/FindMyGemstoneModal';
import { FindMyProductModal } from '../components/FindMyProductModal';
import {
  Star, ShieldCheck, Truck, Heart, ArrowRight, CheckCircle2,
  Sparkles, Share2, Info, HelpCircle, Phone, FileText, Lock, Compass
} from 'lucide-react';

// WhatsApp's own logo — lucide-react has no brand icon for it, so it's drawn inline (currentColor, like the others).
const WhatsAppIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
    <path d="M12.01 2C6.48 2 2 6.48 2 12c0 1.85.5 3.58 1.36 5.07L2 22l5.06-1.33A9.94 9.94 0 0 0 12.01 22C17.53 22 22 17.52 22 12S17.53 2 12.01 2Zm5.78 14.12c-.24.68-1.4 1.33-1.93 1.4-.5.07-1.06.1-1.71-.11a12.9 12.9 0 0 1-1.87-.7c-3.3-1.43-5.32-4.79-5.48-5.01-.16-.22-1.31-1.74-1.31-3.33 0-1.58.83-2.36 1.12-2.68.29-.32.63-.4.84-.4h.6c.19 0 .45-.04.7.54.24.58.83 2 .9 2.15.08.15.13.32.02.52-.1.2-.16.32-.31.5-.16.18-.33.4-.47.53-.16.15-.32.32-.14.63.19.31.83 1.37 1.78 2.22 1.22 1.09 2.25 1.43 2.56 1.59.31.16.5.13.68-.08.19-.2.79-.92.99-1.24.2-.31.4-.26.68-.16.28.1 1.78.84 2.08 1 .31.15.51.23.58.36.08.13.08.75-.16 1.44Z"/>
  </svg>
);

// Passed as a query string, this becomes the message that's already typed in when the chat opens.
const WHATSAPP_NUMBER = '919621340116';
const whatsappChatUrl = (subject: string) =>
  `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(`Hi, I'd like to know more about ${subject}.`)}`;

export const ProductDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const baseProduct = MOCK_PRODUCTS.find((p) => p.slug === slug) || MOCK_PRODUCTS[0];

  // With Shopify enabled, Shopify is the source of truth for what this page shows and sells:
  // title, description, price / compare-at price, SKU and whether it's in stock. The local product
  // only fills in what Shopify doesn't hold (rating, benefits, category…) and is the fallback if
  // the request fails. The Shopify handle is the product's slug — same as the cart and gallery use.
  const shopifyOn = isShopifyEnabled();
  // undefined = still loading · null = Shopify has no such product / request failed · object = its data
  const [remote, setRemote] = useState<ShopifyProductDetail | null | undefined>(undefined);
  useEffect(() => {
    if (!shopifyOn) return;
    let live = true;
    setRemote(undefined);
    fetchProductDetail(baseProduct.slug)
      .then((detail) => live && setRemote(detail))
      .catch(() => live && setRemote(null));
    return () => {
      live = false;
    };
  }, [baseProduct.slug, shopifyOn]);
  const isSyncing = shopifyOn && remote === undefined;

  const isGemstone = baseProduct.category === 'gemstones';
  // Rudraksha products (incl. kavach / rakhis) get Rudraksha wording, the Rudraksha finder in the guidance box
  // and the purchase options (Only Bead / Silver Pendant, X-Ray Tested, Lab Certificate) under the buy buttons.
  const isRudraksha = baseProduct.category.startsWith('rudraksha');

  // Purchase options — with Shopify they are the product's own options and variants, so the price shown is the
  // very price Shopify charges. Until Shopify is connected a demo set is used. If Shopify is on but has nothing
  // for this product, it is simply sold as it is (no options).
  const purchase = useMemo(() => {
    if (!isRudraksha) return null;
    if (remote) return { options: visibleOptions(remote.options), variants: remote.variants };
    if (!shopifyOn) return buildDemoOptions(baseProduct);
    return null;
  }, [isRudraksha, remote, shopifyOn, baseProduct]);

  const [picked, setPicked] = useState<Selection | null>(null);
  useEffect(() => {
    setPicked(null);
  }, [purchase]);
  const selection = useMemo<Selection>(
    () => picked ?? (purchase ? defaultSelection(purchase.options, purchase.variants) : {}),
    [picked, purchase]
  );
  const optionLabel = purchase ? selectionLabel(purchase.options, selection) : '';

  // The variant this page is showing and selling right now.
  const activeVariant = useMemo<OptionVariant | undefined>(() => {
    if (purchase) return findVariant(purchase.variants, selection);
    return remote ? remote.variants.find((v) => v.availableForSale) ?? remote.variants[0] : undefined;
  }, [purchase, selection, remote]);
  // The ticked combination has no variant in Shopify (that combination was never created) → it can't be sold.
  const comboMissing = Boolean(purchase) && !activeVariant;

  const product = useMemo<Product>(() => {
    // Demo data (or Shopify unavailable): the % comes from the actual vs discounted price.
    const local = resolveDiscount(baseProduct.price, baseProduct.compareAtPrice);
    const base: Product = { ...baseProduct, compareAtPrice: local.compareAtPrice, discount: local.percent };
    if (remote) {
      // Prices are shown in ₹ — only trust Shopify's number when it's actually INR.
      const inr = activeVariant?.currencyCode === 'INR';
      return {
        ...base,
        title: remote.title || base.title,
        description: remote.description || base.description,
        sku: activeVariant?.sku || base.sku,
        price: inr ? activeVariant!.price : base.price,
        compareAtPrice: inr ? activeVariant!.compareAtPrice : base.compareAtPrice,
        discount: inr ? activeVariant!.discountPercent : base.discount,
        // Shopify only tells us in-stock / sold-out here; the cart sync trims a line to the real stock.
        stock: activeVariant?.availableForSale ? Math.max(base.stock, 20) : 0,
      };
    }
    // Demo options: price of the ticked combination.
    if (activeVariant) {
      return {
        ...base,
        price: activeVariant.price,
        compareAtPrice: activeVariant.compareAtPrice,
        discount: activeVariant.discountPercent,
      };
    }
    return base;
  }, [baseProduct, remote, activeVariant]);

  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'about' | 'specifications' | 'howToWear' | 'care' | 'reviews'>('about');

  // Gemstone Option Selection (Section 31 & PDP Spec)
  const [gemOption, setGemOption] = useState<'Loose Stone' | 'Silver Ring' | 'Gold Ring' | 'Pendant' | 'Custom Jewellery'>('Loose Stone');

  // Modals
  const [isCertViewerOpen, setIsCertViewerOpen] = useState(false);
  const [isFinderOpen, setIsFinderOpen] = useState(false);

  const { addToCart, getCartLine } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { addRecentlyViewed } = useRecentlyViewed();

  useEffect(() => {
    if (baseProduct) {
      addRecentlyViewed(baseProduct);
      setQuantity(1);
      window.scrollTo(0, 0);
    }
  }, [slug]);

  const isLiked = isInWishlist(product.id);

  // The line this page's Add control works on: for Rudraksha each option combination is its own line,
  // for gemstones each setting/fitting is.
  const cartLineOption = purchase ? optionLabel || undefined : isGemstone ? gemOption : undefined;
  // The chosen Shopify variant travels with the cart line, so the cart adds exactly that variant at its price.
  const cartVariant: ProductVariant | undefined =
    purchase && activeVariant
      ? {
          id: activeVariant.id,
          name: optionLabel || activeVariant.title,
          price: product.price,
          compareAtPrice: product.compareAtPrice,
          inStock: activeVariant.availableForSale,
        }
      : undefined;

  const maxQuantity = Math.min(20, product.stock > 0 ? product.stock : 20);

  // Can't be bought while Shopify's price is still loading, or when Shopify says it's sold out / has no such combination.
  const isSoldOut = product.stock === 0;
  const cannotBuy = isSoldOut || isSyncing;
  const unavailableLabel = comboMissing ? 'UNAVAILABLE' : 'SOLD OUT';

  const handleBuyNow = () => {
    if (cannotBuy) return;
    // Already in the cart (its stepper is showing) → go straight to checkout instead of adding one more.
    if (!getCartLine(product.id, cartLineOption)) addToCart(product, quantity, cartVariant, cartLineOption);
    navigate('/checkout');
  };

  const relatedProducts = MOCK_PRODUCTS.filter(
    (p) => p.category === product.category && p.id !== product.id
  ).slice(0, 4);

  // "Is this … right for you?" box (Finder + Consult Astrologer). Rendered in one place per product type — see below.
  const guidanceBox = (
    <div className="bg-amber-50 p-4 rounded-2xl border border-amber-200 space-y-2">
      <h4 className="font-serif font-bold text-xs text-amber-900 flex items-center gap-1.5">
        <Compass className="w-4 h-4 text-vedic-gold" /> Is this {isRudraksha ? 'Rudraksha' : 'gemstone'} right for you?
      </h4>
      <p className="text-[11px] text-amber-900 leading-snug">
        {isRudraksha ? 'Rudraksha' : 'Gemstone'} suitability depends on individual astrological factors. Get personalized guidance before purchase.
      </p>
      <div className="flex items-center justify-between gap-3 pt-1 text-xs">
        <button
          onClick={() => setIsFinderOpen(true)}
          className="font-bold text-vedic-maroon hover:underline"
        >
          CHECK MY {isRudraksha ? 'RUDRAKSHA' : 'GEMSTONE'} →
        </button>
        <a
          href={whatsappChatUrl(isRudraksha ? 'a Rudraksha' : 'a gemstone')}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 font-bold text-[#25D366] hover:underline"
        >
          <WhatsAppIcon className="w-4 h-4" />
          CHAT ON WHATSAPP
        </a>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-12 bg-vedic-ivory text-vedic-dark pb-24 md:pb-12">
      {/* Modals */}
      <CertificateViewerModal
        isOpen={isCertViewerOpen}
        onClose={() => setIsCertViewerOpen(false)}
        stoneTitle={product.title}
        labName={product.certificationLab || 'Government Approved Gemological Testing Lab'}
        reportNumber={product.certificateNumber || 'GTL-2026-9982'}
        weight={`${product.carat || 2.25} Carat`}
        treatment={product.treatment || 'No indications of heating observed / Untreated'}
      />
      {isRudraksha ? (
        <FindMyProductModal isOpen={isFinderOpen} onClose={() => setIsFinderOpen(false)} />
      ) : (
        <FindMyGemstoneModal isOpen={isFinderOpen} onClose={() => setIsFinderOpen(false)} />
      )}

      {/* Breadcrumb */}
      <Breadcrumb
        items={[
          { label: product.category, path: `/collections/${product.category}` },
          { label: product.title },
        ]}
      />

      {/* Main Product Hero Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        {/* Left Column: Image Gallery (6 Cols) — on desktop it stretches to the height of the info card
            beside it, so there's no empty space left under the picture. */}
        <div className="lg:col-span-6 space-y-4 lg:self-stretch lg:flex lg:flex-col">
          {/* Thumbnails (left, vertical) + main image/video. Images & videos come from the product's
              Shopify media when Shopify is enabled; each one can be opened in full view. */}
          <ProductGallery
            key={product.id}
            className="lg:flex-1 lg:min-h-0"
            title={product.title}
            handle={product.slug}
            images={product.images}
            videos={product.videos}
            overlay={
              <>
                {product.discount > 0 && (
                  <span className="absolute top-4 left-4 bg-vedic-maroon text-vedic-goldLight text-xs font-bold px-3 py-1 rounded-full shadow-md">
                    {product.discount}% OFF
                  </span>
                )}
                <button
                  onClick={() => toggleWishlist(product)}
                  aria-label={isLiked ? 'Remove from wishlist' : 'Add to wishlist'}
                  className="absolute top-4 right-4 bg-white/90 backdrop-blur-md p-2.5 rounded-full shadow-md text-vedic-maroon hover:bg-vedic-gold transition-colors"
                >
                  <Heart className={`w-5 h-5 ${isLiked ? 'fill-current text-red-600' : ''}`} />
                </button>
              </>
            }
          />

          {/* Lab Certificate Preview Trigger for Gemstones */}
          {isGemstone && (
            <div className="bg-white p-4 rounded-2xl border border-vedic-gold/30 flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-vedic-gold shrink-0" />
                <div>
                  <h4 className="font-serif font-bold text-xs text-vedic-brown">Government Approved Lab Report</h4>
                  <p className="text-[10px] text-vedic-muted">Species, Carat Weight & Treatment Verified</p>
                </div>
              </div>
              <button
                onClick={() => setIsCertViewerOpen(true)}
                className="bg-vedic-gold hover:bg-vedic-goldDark text-vedic-dark font-bold text-[10px] px-3.5 py-1.5 rounded-full shadow-sm shrink-0"
              >
                VIEW CERTIFICATE
              </button>
            </div>
          )}
        </div>

        {/* Right Column: Information & CTAs (6 Cols) */}
        <div className="lg:col-span-6 space-y-6 bg-white rounded-3xl p-6 md:p-8 border border-vedic-gold/20 shadow-card">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-vedic-goldDark bg-vedic-ivory px-3 py-1 rounded-full border border-vedic-gold/30">
                SKU: {product.sku}
              </span>
              {product.labCertified && (
                <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" /> Lab Certified
                </span>
              )}
            </div>

            <h1 className="font-serif font-extrabold text-2xl md:text-3xl text-vedic-maroon leading-snug">
              {product.title}
            </h1>

            <div className="flex items-center gap-3 mt-2">
              <div className="flex text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-current" />
                ))}
              </div>
              <span className="text-xs font-bold text-vedic-dark">{product.rating}</span>
              <span className="text-xs text-vedic-muted border-l border-vedic-beige pl-3">
                {product.reviewCount} Devotee Reviews
              </span>
            </div>
          </div>

          {/* Price Box */}
          <div className="p-4 bg-vedic-ivory rounded-2xl border border-vedic-gold/30 space-y-1">
            {isSyncing ? (
              <div className="h-9 w-40 rounded-lg bg-vedic-beige animate-pulse" aria-busy="true" />
            ) : (
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-extrabold text-vedic-maroon">
                  ₹{product.price.toLocaleString('en-IN')}
                </span>
                {product.compareAtPrice > product.price && (
                  <span className="text-base text-vedic-muted line-through">
                    ₹{product.compareAtPrice.toLocaleString('en-IN')}
                  </span>
                )}
                {product.discount > 0 && (
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                    {product.discount}% OFF
                  </span>
                )}
              </div>
            )}
            <p className="text-[10px] text-emerald-700 font-semibold">Taxes included. EMI options available.</p>
          </div>

          {/* Stone attribute chips — gemstones only; Rudraksha has its options under the buy buttons instead. */}
          {!isRudraksha && (
            <div className="flex flex-wrap gap-2 pt-1">
              <span className="px-3 py-1 bg-vedic-ivory border border-vedic-gold/30 rounded-full text-xs font-bold text-vedic-brown">
                Natural Mined
              </span>
              <span className="px-3 py-1 bg-vedic-ivory border border-vedic-gold/30 rounded-full text-xs font-bold text-vedic-brown">
                {product.origin || 'Ceylon (Sri Lanka)'}
              </span>
              <span className="px-3 py-1 bg-vedic-ivory border border-vedic-gold/30 rounded-full text-xs font-bold text-vedic-brown">
                {product.carat || 2.25} Carat
              </span>
              <span className="px-3 py-1 bg-vedic-ivory border border-vedic-gold/30 rounded-full text-xs font-bold text-vedic-brown">
                {product.shape || 'Oval Cut'}
              </span>
              <span className="px-3 py-1 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-full text-xs font-bold">
                Untreated
              </span>
            </div>
          )}

          {/* Select Your Option (Part 4) — Setting / Fitting selector temporarily disabled.
              gemOption keeps its default ("Loose Stone"), so cart lines are unchanged.
              To bring it back, remove this comment wrapper. */}
          {/*
          <div className="space-y-2 border-t border-vedic-beige pt-4">
            <label className="block text-xs font-bold text-vedic-dark uppercase tracking-wider">
              Select Setting / Fitting Option:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {(['Loose Stone', 'Silver Ring', 'Gold Ring', 'Pendant', 'Custom Jewellery'] as const).map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => setGemOption(opt)}
                  className={`py-2 px-2.5 rounded-xl border text-xs font-bold transition-all ${
                    gemOption === opt
                      ? 'bg-vedic-brown text-vedic-goldLight border-vedic-brown shadow-md'
                      : 'bg-vedic-ivory text-vedic-dark border-vedic-gold/30 hover:border-vedic-gold'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
          */}

          {/* Gemstones keep the guidance box here; on Rudraksha pages it sits at the very bottom of the card. */}
          {!isRudraksha && guidanceBox}

          {/* Rudraksha purchase options: Type (Only Bead / Silver Pendant), X-Ray Tested, Lab Certificate, Quantity. */}
          {purchase && (
            <div className="space-y-2.5">
              <PurchaseOptionsPanel
                options={purchase.options}
                variants={purchase.variants}
                selection={selection}
                onSelect={(name, value) => setPicked({ ...selection, [name]: value })}
                quantity={quantity}
                onQuantity={setQuantity}
                maxQuantity={maxQuantity}
              />
              {comboMissing && (
                <p className="text-xs font-semibold text-red-700">
                  This combination isn't available right now — please change your selection.
                </p>
              )}
            </div>
          )}

          {/* Rudraksha: benefits of this particular Rudraksha, shown as icons.
              Stones: the Treatment Disclosure box. */}
          {isRudraksha ? (
            <BenefitBadges benefits={product.benefits} />
          ) : (
            <div className="bg-vedic-ivory p-3 rounded-xl border border-vedic-gold/20 text-xs text-vedic-dark space-y-0.5">
              <strong>Treatment Disclosure:</strong> {product.treatment || 'No indications of heating observed. 100% Natural Earth Mined.'}
            </div>
          )}

          {/* Add to Cart & Buy Now Buttons */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-3">
              <AddToCartControl
                product={product}
                size="cta"
                appearance="solid"
                label="ADD TO CART"
                disabled={cannotBuy}
                disabledLabel={isSoldOut ? unavailableLabel : undefined}
                selectedSize={cartLineOption}
                selectedVariant={cartVariant}
                fixedQuantity={purchase ? quantity : undefined}
                className="flex-1"
                buttonClassName="py-3.5 rounded-full font-serif shadow-lg gap-2"
              />
              <button
                onClick={handleBuyNow}
                disabled={cannotBuy}
                className="flex-1 bg-gold-gradient text-vedic-dark py-3.5 rounded-full font-serif font-bold text-xs shadow-lg hover:brightness-105 transition-all flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                BUY NOW <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {isRudraksha && guidanceBox}
        </div>
      </div>

      {/* Structured Details Tabs Below Fold */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-vedic-gold/20 shadow-card space-y-6">
        <div className="flex border-b border-vedic-gold/20 space-x-6 overflow-x-auto no-scrollbar">
          {[
            { key: 'about', label: 'Overview & Traditional Association' },
            { key: 'specifications', label: 'Gemological Specifications' },
            { key: 'howToWear', label: 'How to Wear & Energization' },
            { key: 'care', label: 'Care & Maintenance' },
            { key: 'reviews', label: `Reviews (${product.reviewCount})` },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`pb-3 font-serif font-bold text-xs md:text-sm whitespace-nowrap transition-colors ${
                activeTab === tab.key
                  ? 'border-b-2 border-vedic-gold text-vedic-maroon font-bold'
                  : 'text-vedic-muted hover:text-vedic-dark'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'about' && (
          <div className="space-y-4 text-xs md:text-sm text-vedic-charcoal leading-relaxed">
            <h3 className="font-serif font-bold text-lg text-vedic-maroon">Product Overview</h3>
            <p>{product.description}</p>
            <h4 className="font-serif font-bold text-base text-vedic-brown pt-2">Traditional Vedic Association</h4>
            <p className="bg-vedic-ivory p-4 rounded-2xl border border-vedic-gold/20 italic">
              "In Vedic astrological tradition, this gemstone is traditionally associated with balancing planetary frequencies and inviting divine grace."
            </p>
          </div>
        )}

        {activeTab === 'specifications' && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
            {isRudraksha ? (
              // Rudraksha has no carat/mineral-family concept — these fields come from Shopify
              // product metafields once connected (per-Mukhi origin, bead size, certification…);
              // demo defaults from the local catalog fill in until then.
              <>
                <div className="p-3 bg-vedic-ivory rounded-xl border border-vedic-gold/20"><span className="text-vedic-muted block">Mukhi (Faces)</span><strong>{product.mukhi || 'Standard'}</strong></div>
                <div className="p-3 bg-vedic-ivory rounded-xl border border-vedic-gold/20"><span className="text-vedic-muted block">Origin</span><strong>{product.origin || 'Nepal (Himalayan Region)'}</strong></div>
                <div className="p-3 bg-vedic-ivory rounded-xl border border-vedic-gold/20"><span className="text-vedic-muted block">Bead Size</span><strong>{product.sizes?.[0] || product.dimensions || '—'}</strong></div>
                <div className="p-3 bg-vedic-ivory rounded-xl border border-vedic-gold/20"><span className="text-vedic-muted block">Weight</span><strong>{product.weight || '—'}</strong></div>
                <div className="p-3 bg-vedic-ivory rounded-xl border border-vedic-gold/20"><span className="text-vedic-muted block">Material</span><strong>{product.material || '100% Original Authentic Rudraksha'}</strong></div>
                <div className="p-3 bg-vedic-ivory rounded-xl border border-vedic-gold/20"><span className="text-vedic-muted block">Certification</span><strong>{product.labCertified ? (product.certificationLab || 'X-Ray Tested & Lab Certified') : 'Not Certified'}</strong></div>
                <div className="p-3 bg-vedic-ivory rounded-xl border border-vedic-gold/20"><span className="text-vedic-muted block">Energization</span><strong>{product.energizationNote || 'Traditionally Energized before dispatch'}</strong></div>
                <div className="p-3 bg-vedic-ivory rounded-xl border border-vedic-gold/20"><span className="text-vedic-muted block">Recommended Rashi</span><strong>{product.rashi?.join(', ') || 'All Rashis'}</strong></div>
              </>
            ) : (
              <>
                <div className="p-3 bg-vedic-ivory rounded-xl border border-vedic-gold/20"><span className="text-vedic-muted block">Mineral Family</span><strong>{product.material || 'Corundum'}</strong></div>
                <div className="p-3 bg-vedic-ivory rounded-xl border border-vedic-gold/20"><span className="text-vedic-muted block">Carat Weight</span><strong>{product.carat || 2.25} Ct</strong></div>
                <div className="p-3 bg-vedic-ivory rounded-xl border border-vedic-gold/20"><span className="text-vedic-muted block">Origin</span><strong>{product.origin || 'Ceylon'}</strong></div>
                <div className="p-3 bg-vedic-ivory rounded-xl border border-vedic-gold/20"><span className="text-vedic-muted block">Treatment</span><strong>{product.treatment || 'Untreated'}</strong></div>
                <div className="p-3 bg-vedic-ivory rounded-xl border border-vedic-gold/20"><span className="text-vedic-muted block">Shape & Cut</span><strong>{product.shape || 'Oval'}</strong></div>
                <div className="p-3 bg-vedic-ivory rounded-xl border border-vedic-gold/20"><span className="text-vedic-muted block">Certification Lab</span><strong>{product.certificationLab || 'GTL Lab'}</strong></div>
              </>
            )}
          </div>
        )}

        {activeTab === 'howToWear' && (
          <div className="space-y-3 text-xs md:text-sm text-vedic-charcoal leading-relaxed">
            <p><strong>Metal:</strong> Gold, Silver, or Panchdhatu as per birth chart requirement.</p>
            <p><strong>Finger:</strong> Prescribed finger based on planet (e.g. Ring finger for Sun, Little finger for Mercury, Middle finger for Saturn).</p>
            <p><strong>Ritual:</strong> Cleanse in Gangajal and energize with Vedic Beeja Mantras on the prescribed weekday morning.</p>
          </div>
        )}

        {activeTab === 'care' && (
          <div className="space-y-2 text-xs md:text-sm text-vedic-charcoal leading-relaxed">
            <p>• Clean gently using warm soapy water and a soft cloth.</p>
            <p>• Avoid harsh chemicals, household cleaners, and extreme heat.</p>
            <p>• Store separately in a velvet pouch to prevent scratches.</p>
          </div>
        )}

        {activeTab === 'reviews' && <ProductReviewsSection product={product} />}
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section className="space-y-6">
          <h3 className="font-serif font-extrabold text-2xl text-vedic-maroon border-b border-vedic-gold/20 pb-3">
            You May Also Like
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {relatedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
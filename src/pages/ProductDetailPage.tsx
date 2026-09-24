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
import { FindMyGemstoneModal } from '../components/FindMyGemstoneModal';
import { FindMyProductModal } from '../components/FindMyProductModal';
import {
  Star, ShieldCheck, Truck, Heart, ArrowRight, CheckCircle2,
  Sparkles, Share2, Info, HelpCircle, Phone, FileText, Lock, Compass
} from 'lucide-react';

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

          {/* Astrological Guidance Box */}
          <div className="bg-amber-50 p-4 rounded-2xl border border-amber-200 space-y-2">
            <h4 className="font-serif font-bold text-xs text-amber-900 flex items-center gap-1.5">
              <Compass className="w-4 h-4 text-vedic-gold" /> Is this {isRudraksha ? 'Rudraksha' : 'gemstone'} right for you?
            </h4>
            <p className="text-[11px] text-amber-900 leading-snug">
              {isRudraksha ? 'Rudraksha' : 'Gemstone'} suitability depends on individual astrological factors. Get personalized guidance before purchase.
            </p>
            <div className="flex gap-3 pt-1 text-xs">
              <button
                onClick={() => setIsFinderOpen(true)}
                className="font-bold text-vedic-maroon hover:underline"
              >
                CHECK MY {isRudraksha ? 'RUDRAKSHA' : 'GEMSTONE'} →
              </button>
              <Link to={`/contact?subject=${isRudraksha ? 'Rudraksha' : 'Gemstone'}%20Consultation`} className="font-bold text-vedic-goldDark hover:underline">
                CONSULT ASTROLOGER →
              </Link>
            </div>
          </div>

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

            {/* Under the buttons: pick Only Bead / Silver Pendant, tick X-Ray Tested / Lab Certificate, set quantity. */}
            {purchase && (
              <PurchaseOptionsPanel
                options={purchase.options}
                variants={purchase.variants}
                selection={selection}
                onSelect={(name, value) => setPicked({ ...selection, [name]: value })}
                quantity={quantity}
                onQuantity={setQuantity}
                maxQuantity={maxQuantity}
              />
            )}
            {comboMissing && (
              <p className="text-xs font-semibold text-red-700">
                This combination isn't available right now — please change your selection.
              </p>
            )}
          </div>
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
            <div className="p-3 bg-vedic-ivory rounded-xl border border-vedic-gold/20"><span className="text-vedic-muted block">Mineral Family</span><strong>{product.material || 'Corundum'}</strong></div>
            <div className="p-3 bg-vedic-ivory rounded-xl border border-vedic-gold/20"><span className="text-vedic-muted block">Carat Weight</span><strong>{product.carat || 2.25} Ct</strong></div>
            <div className="p-3 bg-vedic-ivory rounded-xl border border-vedic-gold/20"><span className="text-vedic-muted block">Origin</span><strong>{product.origin || 'Ceylon'}</strong></div>
            <div className="p-3 bg-vedic-ivory rounded-xl border border-vedic-gold/20"><span className="text-vedic-muted block">Treatment</span><strong>{product.treatment || 'Untreated'}</strong></div>
            <div className="p-3 bg-vedic-ivory rounded-xl border border-vedic-gold/20"><span className="text-vedic-muted block">Shape & Cut</span><strong>{product.shape || 'Oval'}</strong></div>
            <div className="p-3 bg-vedic-ivory rounded-xl border border-vedic-gold/20"><span className="text-vedic-muted block">Certification Lab</span><strong>{product.certificationLab || 'GTL Lab'}</strong></div>
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

        {activeTab === 'reviews' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-vedic-beige pb-3">
              <span className="font-serif font-bold text-sm text-vedic-brown">Customer Reviews</span>
              <span className="text-xs text-vedic-goldDark font-bold">5.0 Star Rating</span>
            </div>
            <div className="space-y-3 text-xs text-vedic-charcoal">
              <div className="bg-vedic-ivory p-4 rounded-2xl border border-vedic-gold/20">
                <div className="flex justify-between font-bold text-vedic-maroon"><span>Aarav S.</span><span>5.0 ★</span></div>
                <p className="mt-1">"Original natural gemstone with X-Ray lab report. Pristine quality!"</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Sticky Mobile Add to Cart Bottom Bar (Part 19 Requirement) */}
      <div className="fixed bottom-12 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-vedic-gold/30 p-3 flex md:hidden items-center justify-between shadow-2xl gap-3">
        <div>
          <span className="text-[10px] text-vedic-muted block">Total Price:</span>
          {isSyncing ? (
            <span className="block h-6 w-16 rounded bg-vedic-beige animate-pulse" aria-busy="true" />
          ) : (
            <span className="text-base font-extrabold text-vedic-maroon">
              ₹{product.price.toLocaleString('en-IN')}
            </span>
          )}
        </div>
        <div className="flex gap-2">
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
            buttonClassName="px-4 py-2.5 rounded-full shadow"
          />
          <button
            onClick={handleBuyNow}
            disabled={cannotBuy}
            className="bg-vedic-gold text-vedic-dark text-xs font-bold px-4 py-2.5 rounded-full shadow disabled:opacity-40 disabled:cursor-not-allowed"
          >
            BUY NOW
          </button>
        </div>
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
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Heart,
  Share2,
  ShieldCheck,
  Truck,
  Gem as GemIcon,
  Circle,
  Droplet,
  CircleDot,
  Sparkle,
  Star,
  ChevronRight,
  MessageCircle,
  FileText,
  UploadCloud,
  CheckCircle2,
  X,
  Eye
} from 'lucide-react';
import { Breadcrumb } from '../components/Breadcrumb';
import { GemstoneCard } from '../components/GemstoneCard';
import { CertificateViewerModal } from '../components/CertificateViewerModal';
import { GEMSTONE_CATALOG_DATA, WeightOption } from '../data/gemstoneCatalogData';
import {
  getVarietyProductById,
  resolveVarietyByHandle,
  getGemstoneThemeColor,
  buildTileGradient,
  VarietyProductTile
} from '../services/gemstoneCatalogService';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { AddToCartControl } from '../components/AddToCartControl';
import type { Product } from '../types/ecommerce';

/** "Select for Ring / Pendant / Bracelet" style fitting options (mirrors the reference PDP). */
const FITTING_OPTIONS: { key: string; label: string; icon: React.ReactNode }[] = [
  { key: 'loose', label: 'Loose Gemstone', icon: <GemIcon className="w-5 h-5" /> },
  { key: 'ring', label: 'Ring', icon: <Circle className="w-5 h-5" /> },
  { key: 'pendant', label: 'Pendant', icon: <Droplet className="w-5 h-5" /> },
  { key: 'bracelet', label: 'Bracelet', icon: <CircleDot className="w-5 h-5" /> },
  { key: 'brooch', label: 'Brooch', icon: <Sparkle className="w-5 h-5" /> }
];

const CERTIFICATION_OPTIONS = [
  { value: 'free-lab', label: 'Free Lab Certificate', extra: 0 },
  { value: 'grs', label: 'Government Approved Lab (GRS/GIA) — +₹1,500', extra: 1500 },
  { value: 'none', label: 'No Certificate' }
];

const ENERGIZATION_OPTIONS = [
  { value: 'none', label: 'No Energization', extra: 0 },
  { value: 'griha-shanti', label: 'Basic Griha Shanti Pooja — +₹501', extra: 501 },
  { value: 'navagraha', label: 'Vedic Navagraha Pooja — +₹1,100', extra: 1100 }
];

/**
 * Metal options for the setting once a Ring/Pendant/Bracelet/Brooch fitting is chosen —
 * demo pricing for now. Once Shopify is connected, swap this for the metal variant options
 * on that fitting's product record (each with its own real price delta).
 */
const METAL_OPTIONS = [
  { value: '', label: '-- Please Select --', extra: 0 },
  { value: 'silver', label: 'Silver (92.5 Sterling)', extra: 0 },
  { value: 'gold-yellow', label: 'Yellow Gold (18K)', extra: 8500 },
  { value: 'gold-white', label: 'White Gold (18K)', extra: 9200 },
  { value: 'panchdhatu', label: 'Panchdhatu (Five-Metal Alloy)', extra: 1200 }
];

type DesignVariant = 'solitaire' | 'halo' | 'double-halo';

/**
 * Design catalog shown once a Metal is picked — demo pricing/labels for now. Once Shopify is
 * connected, swap this for the real design/style variants under the chosen fitting + metal
 * (each with its own product image); the grid & selection logic below don't need to change.
 */
const DESIGN_OPTIONS: { key: string; label: string; priceExtra: number; variant?: DesignVariant; isCustom?: boolean }[] = [
  { key: 'custom', label: 'Customized Design', priceExtra: 4500, isCustom: true },
  { key: 'classic', label: 'Classic Solitaire', priceExtra: 1800, variant: 'solitaire' },
  { key: 'classic-sparkle', label: 'Solitaire Sparkle', priceExtra: 2500, variant: 'halo' },
  { key: 'classic-dazzle', label: 'Solitaire Dazzle', priceExtra: 3000, variant: 'double-halo' },
  { key: 'vintage', label: 'Vintage Round', priceExtra: 3000, variant: 'solitaire' },
  { key: 'vintage-sparkle', label: 'Vintage Sparkle', priceExtra: 2100, variant: 'halo' },
  { key: 'vintage-halo', label: 'Vintage Halo Sparkle', priceExtra: 3000, variant: 'halo' },
  { key: 'vintage-dazzle', label: 'Vintage Halo Dazzle', priceExtra: 3500, variant: 'double-halo' }
];

/** Convenience alias for a single entry from DESIGN_OPTIONS. */
type DesignOption = (typeof DESIGN_OPTIONS)[number];

/**
 * Placeholder "photo" for a design's hover/tap preview, tinted with this gemstone's own color
 * so it always looks plausibly "real" even with demo data. Once Shopify is connected, replace
 * this with that design variant's real product image (Product.featuredImage.url) — the hover
 * preview, mobile popup, and grid thumbnails below all just render whatever URL comes back, so
 * nothing else needs to change.
 */
function getDesignPreviewImage(label: string, colorHex: string): string {
  const bg = colorHex.replace('#', '');
  return `https://placehold.co/600x600/${bg}/FFFFFF?text=${encodeURIComponent(label)}`;
}

/** Working days from now, formatted for the "Expected Dispatch Date" line. */
function getExpectedDispatchDate(): string {
  const date = new Date();
  let added = 0;
  while (added < 4) {
    date.setDate(date.getDate() + 1);
    const day = date.getDay();
    if (day !== 0) added++; // skip Sundays
  }
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

export const GemstoneListingDetailPage: React.FC = () => {
  const { slug, productId } = useParams<{ slug: string; productId: string }>();
  const navigate = useNavigate();
  const { addToCart, getCartLine } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  const gem = useMemo(() => GEMSTONE_CATALOG_DATA.find((g) => g.slug === slug) || null, [slug]);

  const [product, setProduct] = useState<VarietyProductTile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCertViewerOpen, setIsCertViewerOpen] = useState(false);

  // Buy-box selections
  const [selectedWeight, setSelectedWeight] = useState<WeightOption | null>(null);
  const [certification, setCertification] = useState(CERTIFICATION_OPTIONS[0].value);
  const [energization, setEnergization] = useState(ENERGIZATION_OPTIONS[0].value);
  const [fitting, setFitting] = useState<string>('loose');
  const [isEditingFitting, setIsEditingFitting] = useState(false);
  const [metal, setMetal] = useState<string>('');
  const [selectedDesign, setSelectedDesign] = useState<string>('');
  const [customDesignFileName, setCustomDesignFileName] = useState<string | null>(null);
  const customDesignInputRef = useRef<HTMLInputElement>(null);
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [weightTouched, setWeightTouched] = useState(false);
  const [metalTouched, setMetalTouched] = useState(false);
  const [designTouched, setDesignTouched] = useState(false);

  // Design hover/tap preview — desktop swaps the main image on hover (no commitment until
  // clicked); touch devices don't get hover at all, so they get a proper preview popup instead.
  const [hoveredDesign, setHoveredDesign] = useState<DesignOption | null>(null);
  const [previewDesign, setPreviewDesign] = useState<DesignOption | null>(null);
  const [supportsHover, setSupportsHover] = useState(true);
  useEffect(() => {
    const mq = window.matchMedia('(hover: hover) and (pointer: fine)');
    setSupportsHover(mq.matches);
    const handleChange = (e: MediaQueryListEvent) => setSupportsHover(e.matches);
    mq.addEventListener('change', handleChange);
    return () => mq.removeEventListener('change', handleChange);
  }, []);

  useEffect(() => {
    if (!gem || !productId) {
      setIsLoading(false);
      return;
    }
    let isCancelled = false;
    setIsLoading(true);

    // A direct/shared link only has the gem slug + product id in the URL, so the variant's
    // name/image (used as this listing's fallback title/image) is rebuilt from the
    // collectionHandle embedded in productId — see resolveVarietyByHandle() for how that
    // matches the exact same variety names the "Types & Varieties" picker uses.
    const handle = productId.replace(/-demo-\d+$/, '');
    const variant = resolveVarietyByHandle(gem, handle);

    getVarietyProductById(productId, variant.name, variant.image, gem.startingPrice).then((tile) => {
      if (isCancelled) return;
      setProduct(tile);
      setSelectedImage(tile?.image || variant.image);
      setIsLoading(false);
    });

    return () => {
      isCancelled = true;
    };
  }, [gem, productId]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [productId]);

  const varietyCardGradient = useMemo(
    () => (gem ? buildTileGradient(getGemstoneThemeColor(gem.color, gem.gemstoneType)) : ''),
    [gem]
  );
  const gemSolidColor = useMemo(
    () => (gem ? getGemstoneThemeColor(gem.color, gem.gemstoneType) : '#E9A331'),
    [gem]
  );

  if (!gem) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-24 text-center">
        <h1 className="text-2xl font-serif font-bold text-vedic-maroon mb-3">Gemstone Not Found</h1>
        <Link to="/gemstones" className="text-vedic-goldDark font-semibold hover:underline">
          Return to Gemstone Catalog
        </Link>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-pulse">
        <div className="h-4 w-64 bg-vedic-beige/60 rounded-full mb-8" />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-6 aspect-square bg-vedic-beige/40 rounded-3xl" />
          <div className="lg:col-span-6 space-y-4">
            <div className="h-8 w-3/4 bg-vedic-beige/50 rounded-full" />
            <div className="h-6 w-1/3 bg-vedic-beige/50 rounded-full" />
            <div className="h-32 bg-vedic-beige/30 rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-24 text-center">
        <h1 className="text-2xl font-serif font-bold text-vedic-maroon mb-3">Listing Not Found</h1>
        <p className="text-sm text-vedic-muted mb-6">This listing may have been sold or removed.</p>
        <Link
          to={`/gemstones/${gem.slug}`}
          className="inline-flex items-center gap-1 text-vedic-goldDark font-semibold hover:underline"
        >
          Back to {gem.name} <ChevronRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  const [baseName, tier] = product.title.split(' — ');
  // DEMO DATA: this listing doesn't have its own photo set yet, so the gallery is stitched
  // together from the base gem's images as a stand-in. Once Shopify is connected, replace this
  // with that product's real `images` array from the Storefront API (Product.images.edges) —
  // everything below (thumbnail strip + main image swap) already works off whatever `gallery`
  // contains, so no other change is needed here.
  const gallery = Array.from(new Set([product.image, ...gem.gallery, gem.image])).filter(Boolean);
  const isLiked = isInWishlist(product.id);
  const sku = `GEM-${gem.id.toUpperCase()}-${product.handle.toUpperCase()}-${(productId || '').split('-demo-')[1] || '1'}`;

  const certExtra = CERTIFICATION_OPTIONS.find((c) => c.value === certification)?.extra || 0;
  const energizationExtra = ENERGIZATION_OPTIONS.find((e) => e.value === energization)?.extra || 0;
  const metalExtra = fitting !== 'loose' ? METAL_OPTIONS.find((m) => m.value === metal)?.extra || 0 : 0;
  const designExtra = fitting !== 'loose' ? DESIGN_OPTIONS.find((d) => d.key === selectedDesign)?.priceExtra || 0 : 0;
  const weightMultiplier = selectedWeight ? selectedWeight.priceMultiplier : 1;
  const finalPrice = Math.round(product.price * weightMultiplier) + certExtra + energizationExtra + metalExtra + designExtra;
  const finalCompareAtPrice =
    Math.round(product.compareAtPrice * weightMultiplier) + certExtra + energizationExtra + metalExtra + designExtra;

  const whatsappMessage = encodeURIComponent(
    `Hi, I'm interested in ${baseName}${tier ? ` (${tier})` : ''} — SKU ${sku}. Could you share more details?`
  );

  const cartPayload = {
    id: `${product.id}-${selectedWeight?.carat || 1}ct-${fitting}-${metal}-${selectedDesign}-${certification}-${energization}`,
    title: `${baseName}${tier ? ` — ${tier}` : ''}${selectedWeight ? ` (${selectedWeight.label})` : ''}`,
    subtitle: gem.hindiName || gem.category,
    price: finalPrice,
    originalPrice: finalCompareAtPrice,
    rating: product.rating,
    reviewsCount: product.reviewCount,
    images: gallery,
    category: gem.category,
    isBestSeller: !!gem.isPopular,
    isNew: !!gem.isExclusive,
    inStock: product.inStock,
    sku,
    description: gem.description,
    benefits: gem.benefits,
    tags: [gem.category, gem.gemstoneType, gem.origin]
  };

  /** Scrolls to + flags the first incomplete required field; returns true if everything is filled in. */
  const validateSelections = (): boolean => {
    if (!selectedWeight) {
      setWeightTouched(true);
      document.getElementById('weight-select')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return false;
    }
    if (fitting !== 'loose' && !metal) {
      setMetalTouched(true);
      document.getElementById('metal-select')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return false;
    }
    if (fitting !== 'loose' && metal && !selectedDesign) {
      setDesignTouched(true);
      document.getElementById('design-select')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return false;
    }
    return true;
  };

  const handleBuyNow = () => {
    if (!validateSelections()) return;
    // Already in the cart (its stepper is showing) → go straight to checkout instead of adding one more.
    if (!getCartLine(cartPayload.id, fitting)) addToCart(cartPayload as any, 1, undefined, fitting);
    navigate('/checkout');
  };

  const handleSelectFitting = (key: string) => {
    setFitting(key);
    setIsEditingFitting(false);
    if (key === 'loose') {
      setMetal('');
      setSelectedDesign('');
      setCustomDesignFileName(null);
      setMetalTouched(false);
      setDesignTouched(false);
    }
  };

  const handleSelectDesign = (design: (typeof DESIGN_OPTIONS)[number]) => {
    if (design.isCustom) {
      customDesignInputRef.current?.click();
    }
    setSelectedDesign(design.key);
    setDesignTouched(true);
  };

  // Desktop (real hover available): clicking a design tile selects it immediately, same as
  // before — hovering it separately shows the live preview on the left (see the main image
  // block below). Touch devices: tapping opens a popup with a big preview + a confirm button,
  // since there's no hover to preview with first. The "Upload Your Own Design" tile always
  // goes straight to its file picker either way — there's nothing to preview there.
  const handleDesignTileClick = (design: (typeof DESIGN_OPTIONS)[number]) => {
    if (supportsHover || design.isCustom) {
      handleSelectDesign(design);
    } else {
      setPreviewDesign(design);
    }
  };

  const activeFitting = FITTING_OPTIONS.find((f) => f.key === fitting) || FITTING_OPTIONS[0];

  const relatedGems = GEMSTONE_CATALOG_DATA.filter(
    (g) => g.gemstoneType === gem.gemstoneType && g.id !== gem.id
  ).slice(0, 4);

  return (
    <div className="bg-vedic-ivory min-h-screen pb-24 md:pb-12">
      <CertificateViewerModal
        isOpen={isCertViewerOpen}
        onClose={() => setIsCertViewerOpen(false)}
        stoneTitle={baseName}
        labName="Government Approved Gemological Testing Lab"
        reportNumber={`GTL-2026-${sku.slice(-4)}`}
        weight={`${selectedWeight?.carat || gem.availableWeights[0].carat} Carat`}
        treatment={gem.treatment || 'No indications of heating observed / Untreated'}
      />

      {/* Mobile/touch design preview popup — desktop previews inline via hover instead (see the
          main image block above), so this only ever opens on devices without real hover. */}
      {previewDesign && (
        <div
          className="fixed inset-0 z-50 bg-vedic-dark/70 backdrop-blur-sm flex items-end sm:items-center justify-center"
          onClick={() => setPreviewDesign(null)}
        >
          <div
            className="bg-white w-full sm:max-w-sm sm:rounded-3xl rounded-t-3xl overflow-hidden shadow-2xl animate-in slide-in-from-bottom sm:zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative aspect-square flex items-center justify-center p-8" style={{ background: varietyCardGradient }}>
              <button
                onClick={() => setPreviewDesign(null)}
                aria-label="Close preview"
                className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 flex items-center justify-center text-vedic-dark shadow-md"
              >
                <X className="w-4 h-4" />
              </button>
              <img
                src={getDesignPreviewImage(previewDesign.label, gemSolidColor)}
                alt={previewDesign.label}
                className="w-full h-full object-contain mix-blend-multiply"
              />
            </div>
            <div className="p-5 space-y-3">
              <div>
                <h3 className="font-serif font-bold text-lg text-vedic-dark">{previewDesign.label}</h3>
                <p className="text-sm font-bold text-vedic-goldDark mt-0.5">
                  +₹{previewDesign.priceExtra.toLocaleString('en-IN')}
                </p>
              </div>
              <button
                onClick={() => {
                  handleSelectDesign(previewDesign);
                  setPreviewDesign(null);
                }}
                className="w-full py-3 rounded-full font-serif font-bold text-sm bg-vedic-maroon text-vedic-ivory shadow-lg hover:bg-vedic-maroonDark transition-colors"
              >
                Select This Design
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Breadcrumb
          items={[
            { label: 'Gemstones', path: '/gemstones' },
            { label: `${gem.name}${gem.hindiName ? ` (${gem.hindiName.split(' ')[0]} Stone)` : ''}`, path: `/gemstones/${gem.slug}` },
            { label: product.title }
          ]}
        />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 pt-2 pb-12 lg:items-start">
          {/* Left: Image Gallery — sticky on desktop so it stays in view (and the Designs hover
              preview stays visible) as the long buy-box on the right is scrolled through. */}
          <div className="lg:col-span-6 space-y-4 lg:sticky lg:top-24 lg:self-start">
            {/*
              `gallery` (built above from product.image + gem.gallery) is DEMO data — every
              thumbnail here should be swapped for this exact product's own `images` array from
              the Shopify Storefront API once connected (Product.images.edges), in the same
              order returned by Shopify. No structural change needed below when that happens —
              just point `gallery` at the real array.
            */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              {/* Thumbnails — vertical strip to the left of the main image on tablet/desktop,
                  horizontal scroll strip below it on mobile where there isn't width to spare. */}
              {gallery.length > 1 && (
                <div className="flex sm:flex-col gap-3 overflow-x-auto sm:overflow-x-visible sm:overflow-y-auto sm:max-h-[520px] no-scrollbar order-2 sm:order-1 shrink-0">
                  {gallery.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImage(img)}
                      className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden border-2 shrink-0 bg-white p-1.5 transition-all ${
                        selectedImage === img
                          ? 'border-vedic-gold ring-2 ring-vedic-gold/40 scale-95 shadow-md'
                          : 'border-vedic-beige opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={img} alt="" className="w-full h-full object-contain rounded-xl" />
                    </button>
                  ))}
                </div>
              )}

              {/* Main image */}
              <div
                className="relative aspect-square flex-1 min-w-0 rounded-3xl overflow-hidden border border-vedic-gold/25 shadow-card flex items-center justify-center p-8 order-1 sm:order-2"
                style={{ background: varietyCardGradient }}
              >
                {product.discountPercent > 0 && (
                  <span className="absolute top-4 left-4 z-10 bg-vedic-maroon text-vedic-goldLight text-xs font-bold px-3 py-1 rounded-full shadow-md">
                    {product.discountPercent}% OFF
                  </span>
                )}
                {!product.inStock && (
                  <span className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 bg-vedic-dark/85 text-white text-[11px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-full">
                    Sold Out
                  </span>
                )}

                {/* While hovering a design tile (desktop only), this swaps to that design's
                    preview — it's a look, not a commitment; leaving the tile reverts it. */}
                {hoveredDesign && (
                  <span className="absolute top-4 right-4 z-10 inline-flex items-center gap-1.5 bg-vedic-dark/85 text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-full">
                    <Eye className="w-3 h-3" />
                    Previewing: {hoveredDesign.label}
                  </span>
                )}

                <img
                  key={hoveredDesign ? hoveredDesign.key : 'selected'}
                  src={hoveredDesign ? getDesignPreviewImage(hoveredDesign.label, gemSolidColor) : selectedImage}
                  alt={hoveredDesign ? hoveredDesign.label : baseName}
                  className={`w-full h-full object-contain mix-blend-multiply transition-opacity duration-200 ${
                    !product.inStock ? 'grayscale opacity-60' : ''
                  }`}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = `https://placehold.co/600x600/FFFFFF/E9A331?text=${encodeURIComponent(baseName)}`;
                  }}
                />
              </div>
            </div>

            {/* Lab certificate preview trigger */}
            <div className="bg-white p-4 rounded-2xl border border-vedic-gold/30 flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-2 min-w-0">
                <FileText className="w-5 h-5 text-vedic-gold shrink-0" />
                <div className="min-w-0">
                  <h4 className="font-serif font-bold text-xs text-vedic-brown">Government Approved Lab Report</h4>
                  <p className="text-[10px] text-vedic-muted">Species, Carat Weight & Treatment Verified</p>
                </div>
              </div>
              <button
                onClick={() => setIsCertViewerOpen(true)}
                className="bg-vedic-gold hover:bg-vedic-goldDark text-vedic-dark font-bold text-[10px] px-3.5 py-1.5 rounded-full shadow-sm shrink-0"
              >
                VIEW SAMPLE
              </button>
            </div>
          </div>

          {/* Right: Buy Box */}
          <div className="lg:col-span-6 space-y-5 bg-white rounded-3xl p-6 md:p-8 border border-vedic-gold/20 shadow-card h-fit">
            {/* Title row */}
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                {tier && (
                  <span className="text-[10px] font-bold tracking-[0.15em] text-vedic-goldDark uppercase">
                    {tier}
                  </span>
                )}
                <h1 className="font-serif font-extrabold text-xl md:text-2xl text-vedic-maroon leading-snug mt-0.5">
                  {product.title}
                </h1>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => toggleWishlist(cartPayload as any)}
                  aria-label="Add to Wishlist"
                  className={`p-2.5 rounded-full border transition-colors ${
                    isLiked
                      ? 'bg-red-50 text-red-600 border-red-200'
                      : 'bg-vedic-ivory text-vedic-muted border-vedic-gold/30 hover:text-red-500'
                  }`}
                >
                  <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
                </button>
                <button
                  onClick={() => navigator.share?.({ title: product.title, url: window.location.href })}
                  aria-label="Share"
                  className="p-2.5 rounded-full border border-vedic-gold/30 bg-vedic-ivory text-vedic-muted hover:text-vedic-maroon transition-colors"
                >
                  <Share2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Rating */}
            <div className="flex items-center gap-2">
              <div className="flex text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className={`w-3.5 h-3.5 ${i < Math.round(product.rating) ? 'fill-current' : 'text-gray-300'}`} />
                ))}
              </div>
              <span className="text-xs font-bold text-vedic-dark">{product.rating}</span>
              <span className="text-xs text-vedic-muted border-l border-vedic-beige pl-2">
                {product.reviewCount} Devotee Reviews
              </span>
            </div>

            {/* Price */}
            <div className="p-4 bg-vedic-ivory rounded-2xl border border-vedic-gold/30 space-y-1">
              <div className="flex items-baseline gap-3 flex-wrap">
                <span className="text-2xl md:text-3xl font-extrabold text-vedic-maroon">
                  ₹{finalPrice.toLocaleString('en-IN')}
                </span>
                {finalCompareAtPrice > finalPrice && (
                  <span className="text-sm md:text-base text-vedic-muted line-through">
                    ₹{finalCompareAtPrice.toLocaleString('en-IN')}
                  </span>
                )}
              </div>
              <p className="text-[10px] text-emerald-700 font-semibold">
                Inclusive of all taxes. Price updates automatically with your selections below.
              </p>
            </div>

            {/* SKU + Origin */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-vedic-dark">
              <span><strong className="font-bold">SKU:</strong> {sku}</span>
              <span className="w-px h-3 bg-vedic-beige hidden sm:block" />
              <span><strong className="font-bold">Origin:</strong> {gem.origin}</span>
              {product.inStock ? (
                <span className="inline-flex items-center gap-1 text-emerald-700 font-bold">
                  <ShieldCheck className="w-3.5 h-3.5" /> In Stock
                </span>
              ) : (
                <span className="text-red-600 font-bold">Sold Out</span>
              )}
            </div>

            {/* Weight */}
            <div id="weight-select" className="space-y-1.5 border-t border-dashed border-vedic-gold/30 pt-4">
              <label className="flex items-center gap-1 text-xs font-bold text-vedic-dark uppercase tracking-wider">
                Weight <span className="text-red-500">*</span>
              </label>
              <select
                value={selectedWeight?.carat ?? ''}
                onChange={(e) => {
                  const w = gem.availableWeights.find((wt) => wt.carat === Number(e.target.value)) || null;
                  setSelectedWeight(w);
                  setWeightTouched(true);
                }}
                className={`w-full bg-vedic-ivory border rounded-xl px-3.5 py-2.5 text-sm font-semibold text-vedic-dark focus:outline-none focus:ring-2 focus:ring-vedic-gold/40 ${
                  weightTouched && !selectedWeight ? 'border-red-400' : 'border-vedic-gold/30'
                }`}
              >
                <option value="">-- Please Select --</option>
                {gem.availableWeights.map((w) => (
                  <option key={w.carat} value={w.carat}>
                    {w.label}
                  </option>
                ))}
              </select>
              {weightTouched && !selectedWeight && (
                <p className="text-[11px] text-red-500 font-medium">Please select a weight to continue.</p>
              )}
            </div>

            {/* Certification */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-vedic-dark uppercase tracking-wider">Certification *</label>
              <select
                value={certification}
                onChange={(e) => setCertification(e.target.value)}
                className="w-full bg-vedic-ivory border border-vedic-gold/30 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-vedic-dark focus:outline-none focus:ring-2 focus:ring-vedic-gold/40"
              >
                {CERTIFICATION_OPTIONS.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Pooja / Energization */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-vedic-dark uppercase tracking-wider">Pooja / Energization *</label>
              <select
                value={energization}
                onChange={(e) => setEnergization(e.target.value)}
                className="w-full bg-vedic-ivory border border-vedic-gold/30 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-vedic-dark focus:outline-none focus:ring-2 focus:ring-vedic-gold/40"
              >
                {ENERGIZATION_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Select for Ring / Pendant / Bracelet */}
            <div className="space-y-2.5 border-t border-dashed border-vedic-gold/30 pt-4">
              <label className="flex items-center gap-1 text-xs font-bold text-vedic-dark uppercase tracking-wider">
                Select for Ring / Pendant / Bracelet <span className="text-red-500">*</span>
              </label>

              {fitting === 'loose' || isEditingFitting ? (
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                  {FITTING_OPTIONS.map((opt) => (
                    <button
                      key={opt.key}
                      type="button"
                      onClick={() => handleSelectFitting(opt.key)}
                      className={`flex flex-col items-center justify-center gap-1.5 py-2.5 px-1.5 rounded-xl border text-center transition-all ${
                        fitting === opt.key
                          ? 'bg-vedic-brown text-vedic-goldLight border-vedic-brown shadow-md'
                          : 'bg-vedic-ivory text-vedic-dark border-vedic-gold/30 hover:border-vedic-gold'
                      }`}
                    >
                      {opt.icon}
                      <span className="text-[10px] font-bold leading-tight">{opt.label}</span>
                    </button>
                  ))}
                </div>
              ) : (
                // A fitting other than "Loose Gemstone" is picked — collapse the picker into a
                // compact confirmation so Metal/Designs below get more visual room, matching
                // the flow shown in the reference screenshot.
                <div className="flex items-center gap-3 sm:gap-4 bg-vedic-ivory rounded-2xl border border-vedic-gold/25 p-3">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 shrink-0 rounded-xl bg-white border border-vedic-gold/30 flex flex-col items-center justify-center gap-1 text-vedic-maroon">
                    {activeFitting.icon}
                    <span className="text-[8px] font-bold text-vedic-dark leading-tight">{activeFitting.label}</span>
                  </div>
                  <p className="text-[11px] sm:text-xs text-vedic-muted leading-relaxed">
                    You have selected <strong className="text-vedic-dark">{activeFitting.label}</strong>. Click{' '}
                    <button
                      type="button"
                      onClick={() => setIsEditingFitting(true)}
                      className="text-vedic-maroon font-bold underline underline-offset-2 hover:text-vedic-brown"
                    >
                      here
                    </button>{' '}
                    to change your preference. You can opt to have your gemstone in a Ring, Pendant, Bracelet or Brooch.
                  </p>
                </div>
              )}
            </div>

            {/* Metal — only relevant once a fitting other than Loose Gemstone is picked */}
            {fitting !== 'loose' && (
              <div id="metal-select" className="space-y-1.5 border-t border-dashed border-vedic-gold/30 pt-4">
                <label className="text-xs font-bold text-vedic-dark uppercase tracking-wider">
                  Metal <span className="text-red-500">*</span>
                </label>
                <select
                  value={metal}
                  onChange={(e) => {
                    setMetal(e.target.value);
                    setMetalTouched(true);
                    setSelectedDesign('');
                    setCustomDesignFileName(null);
                  }}
                  className={`w-full bg-vedic-ivory border rounded-xl px-3.5 py-2.5 text-sm font-semibold text-vedic-dark focus:outline-none focus:ring-2 focus:ring-vedic-gold/40 ${
                    metalTouched && !metal ? 'border-red-400' : 'border-vedic-gold/30'
                  }`}
                >
                  {METAL_OPTIONS.map((m) => (
                    <option key={m.value} value={m.value}>
                      {m.label}
                      {m.extra > 0 ? ` — +₹${m.extra.toLocaleString('en-IN')}` : ''}
                    </option>
                  ))}
                </select>
                {metalTouched && !metal && (
                  <p className="text-[11px] text-red-500 font-medium">Please select a metal to continue.</p>
                )}
              </div>
            )}

            {/* Designs — only once a Metal is picked */}
            {fitting !== 'loose' && metal && (
              <div id="design-select" className="space-y-3 border-t border-dashed border-vedic-gold/30 pt-4">
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-1 text-xs font-bold text-vedic-dark uppercase tracking-wider">
                    Designs <span className="text-red-500">*</span>
                  </label>
                  {supportsHover && (
                    <span className="text-[10px] text-vedic-muted italic">Hover a design to preview it</span>
                  )}
                </div>
                <input
                  ref={customDesignInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => setCustomDesignFileName(e.target.files?.[0]?.name || null)}
                />
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {DESIGN_OPTIONS.map((design) => {
                    const isSelected = selectedDesign === design.key;
                    return (
                      <button
                        key={design.key}
                        type="button"
                        onClick={() => handleDesignTileClick(design)}
                        onMouseEnter={() => supportsHover && !design.isCustom && setHoveredDesign(design)}
                        onMouseLeave={() => supportsHover && setHoveredDesign(null)}
                        className={`relative flex flex-col overflow-hidden rounded-2xl border text-left transition-all ${
                          isSelected
                            ? 'bg-vedic-ivory border-vedic-gold ring-1 ring-vedic-gold shadow-md'
                            : 'bg-white border-vedic-beige hover:border-vedic-gold/50 hover:shadow-md hover:-translate-y-0.5'
                        }`}
                      >
                        {isSelected && (
                          <span className="absolute top-1.5 right-1.5 z-10 w-5 h-5 rounded-full bg-vedic-gold flex items-center justify-center shadow">
                            <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                          </span>
                        )}

                        <span
                          className="aspect-square flex items-center justify-center p-3"
                          style={{ background: design.isCustom ? '#F7F4EF' : varietyCardGradient }}
                        >
                          {design.isCustom ? (
                            <UploadCloud className="w-8 h-8 sm:w-9 sm:h-9 text-vedic-muted" />
                          ) : (
                            <img
                              src={getDesignPreviewImage(design.label, gemSolidColor)}
                              alt={design.label}
                              className="w-full h-full object-contain mix-blend-multiply"
                            />
                          )}
                        </span>

                        <span className="px-2 py-2 text-center border-t border-vedic-beige/70">
                          <span className="block text-[10px] sm:text-[11px] font-bold text-vedic-dark leading-tight truncate">
                            {design.isCustom && customDesignFileName ? customDesignFileName : design.label}
                          </span>
                          <span className="block text-[10px] sm:text-[11px] font-bold text-vedic-goldDark mt-0.5">
                            +₹{design.priceExtra.toLocaleString('en-IN')}
                          </span>
                        </span>
                      </button>
                    );
                  })}
                </div>
                {designTouched && !selectedDesign && (
                  <p className="text-[11px] text-red-500 font-medium">Please pick a design to continue.</p>
                )}
              </div>
            )}

            {/* Add to Cart / Buy Now */}
            <div className="hidden md:grid grid-cols-2 items-center gap-3 pt-2">
              <AddToCartControl
                product={cartPayload as unknown as Product}
                size="cta"
                appearance="solid"
                label="ADD TO CART"
                disabledLabel="SOLD OUT"
                disabled={!product.inStock}
                selectedSize={fitting}
                beforeAdd={validateSelections}
                buttonClassName="py-3.5 rounded-full font-serif shadow-lg gap-2"
              />
              <button
                onClick={handleBuyNow}
                disabled={!product.inStock}
                className="py-3.5 rounded-full font-serif font-bold text-xs bg-gold-gradient text-vedic-dark shadow-lg hover:brightness-105 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                BUY NOW
              </button>
            </div>

            {/* Ask Expert */}
            <a
              href={`https://wa.me/919876543210?text=${whatsappMessage}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden md:flex py-3 px-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 font-semibold text-xs transition-colors items-center justify-center gap-2 hover:bg-emerald-100"
            >
              <MessageCircle className="w-4 h-4 text-emerald-600" />
              <span>Ask an Expert on WhatsApp</span>
            </a>

            {/* Expected Dispatch Date */}
            <div className="flex items-center gap-2 text-xs text-vedic-dark pt-1">
              <Truck className="w-4 h-4 text-vedic-goldDark shrink-0" />
              <span>
                Expected Dispatch Date: <strong className="font-bold">{getExpectedDispatchDate()}</strong>
              </span>
            </div>

            {/* Treatment disclosure */}
            <div className="bg-vedic-ivory p-3 rounded-xl border border-vedic-gold/20 text-xs text-vedic-dark">
              <strong>Treatment Disclosure:</strong> {gem.treatment || 'No indications of heating observed. 100% Natural Earth Mined.'}
            </div>
          </div>
        </div>

        {/* Gemological Specification Chips + Description */}
        <div className="bg-white rounded-3xl p-6 md:p-8 border border-vedic-gold/20 shadow-card space-y-5 mb-12">
          <div className="flex flex-wrap gap-2">
            <span className="px-3 py-1 bg-vedic-ivory border border-vedic-gold/30 rounded-full text-xs font-bold text-vedic-brown">
              Natural Mined
            </span>
            <span className="px-3 py-1 bg-vedic-ivory border border-vedic-gold/30 rounded-full text-xs font-bold text-vedic-brown">
              {gem.origin}
            </span>
            <span className="px-3 py-1 bg-vedic-ivory border border-vedic-gold/30 rounded-full text-xs font-bold text-vedic-brown">
              {gem.hardness} Hardness
            </span>
            <span className="px-3 py-1 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-full text-xs font-bold">
              {gem.treatment || 'Untreated'}
            </span>
          </div>
          <div>
            <h3 className="font-serif font-bold text-lg text-vedic-maroon mb-2">About this Gemstone</h3>
            <p className="text-xs md:text-sm text-vedic-charcoal leading-relaxed">{gem.description}</p>
          </div>
        </div>

        {/* Related listings */}
        {relatedGems.length > 0 && (
          <section className="pb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-serif font-extrabold text-xl md:text-2xl text-vedic-maroon">You May Also Like</h2>
              <Link to="/gemstones" className="text-xs text-vedic-goldDark hover:text-vedic-maroon font-semibold flex items-center gap-1">
                <span>View Full Catalog</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
              {relatedGems.map((relGem) => (
                <GemstoneCard key={relGem.id} gem={relGem} onSelect={(s) => navigate(`/gemstones/${s}`)} />
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Sticky mobile Add to Cart bar */}
      <div className="fixed bottom-12 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-vedic-gold/30 p-3 flex md:hidden items-center justify-between shadow-2xl gap-3">
        <div className="min-w-0">
          <span className="text-[10px] text-vedic-muted block">Total Price:</span>
          <span className="text-base font-extrabold text-vedic-maroon truncate block">
            ₹{finalPrice.toLocaleString('en-IN')}
          </span>
        </div>
        <div className="flex gap-2 shrink-0">
          <AddToCartControl
            product={cartPayload as unknown as Product}
            size="cta"
            appearance="solid"
            label="ADD TO CART"
            disabledLabel="SOLD OUT"
            disabled={!product.inStock}
            selectedSize={fitting}
            beforeAdd={validateSelections}
            buttonClassName="px-4 py-2.5 rounded-full shadow"
          />
          <button
            onClick={handleBuyNow}
            disabled={!product.inStock}
            className="bg-vedic-gold text-vedic-dark text-xs font-bold px-4 py-2.5 rounded-full shadow disabled:opacity-40"
          >
            BUY NOW
          </button>
        </div>
      </div>
    </div>
  );
};
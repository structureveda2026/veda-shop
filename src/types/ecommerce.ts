export type CategorySlug = 
  | 'bracelets'
  | 'rudraksha'
  | 'rudraksha-kavach'
  | 'sawan-special-collection'
  | 'sawan-special'
  | 'crystal-rakhis'
  | 'rudraksha-rakhis'
  | 'sawan-special-puja'
  | 'sawan-puja'
  | 'vastu'
  | 'karungali'
  | 'temple-offering'
  | 'home-decor'
  | 'kirtimukh'
  | 'vatika'
  | 'gifting'
  | 'rakhi'
  | 'gemstones'
  | 'puja-kits'
  | 'puja-samagri'
  | 'yantra'
  | 'mala'
  | 'spiritual-essentials'
  | 'vedic-gifts';

export interface ProductVariant {
  id: string;
  name: string;
  price: number;
  compareAtPrice: number;
  inStock: boolean;
}

export interface Review {
  id: string;
  customerName: string;
  rating: number;
  date: string;
  comment: string;
  verifiedPurchase: boolean;
  location?: string;
  productPurchased?: string;
  userImage?: string;
  // Photos/videos the reviewer attached to their review (data URLs in demo mode,
  // hosted media URLs once a real reviews backend/app is connected).
  images?: string[];
  videos?: string[];
}

export interface Product {
  id: string;
  title: string;
  slug: string;
  category: CategorySlug;
  subcategory?: string;
  description: string;
  shortDescription: string;
  images: string[];
  videos?: string[];
  price: number;
  compareAtPrice: number;
  discount: number;
  rating: number;
  reviewCount: number;
  sku: string;
  stock: number;
  variants?: ProductVariant[];
  sizes?: string[];
  material?: string;
  weight?: string;
  dimensions?: string;
  tags: string[];
  rashi?: string[];
  mukhi?: string;
  benefits: string[];
  careInstructions?: string;
  shippingInformation?: string;
  returnInformation?: string;
  energizationNote?: string;
  labCertified?: boolean;
  isBestseller?: boolean;
  isNewArrival?: boolean;
  featuredInReels?: boolean;
  faqs?: { question: string; answer: string }[];
  reviews?: Review[];

  // Gemstone Market Additions
  carat?: number;
  ratti?: number;
  pricePerCarat?: number;
  origin?: string;
  certificationLab?: string;
  certificateNumber?: string;
  treatment?: string;
  shape?: string;
  qualityTier?: 'Entry' | 'Premium' | 'Collector';
  taxonomicCategory?: string;
  purposeTags?: string[];
}

export interface Category {
  id: string;
  name: string;
  slug: CategorySlug;
  description: string;
  image: string;
  subcategories: {
    name: string;
    slug: string;
    description?: string;
  }[];
  seoText?: string;
  faqs?: { question: string; answer: string }[];
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedVariant?: ProductVariant;
  selectedSize?: string;
}

export interface WishlistItem {
  product: Product;
  addedAt: string;
}

export interface Rashi {
  id: string;
  nameEn: string;
  nameHi: string;
  symbol: string;
  element: string;
  rulingPlanet: string;
  description: string;
  recommendedStone: string;
  recommendedBraceletSlug: string;
  imageUrl: string;
}

export interface RudrakshaMukhi {
  mukhi: string;
  rulingGod: string;
  rulingPlanet: string;
  beejaMantra: string;
  benefits: string[];
  whoShouldWear: string;
  description: string;
  imageUrl: string;
}

export interface FilterState {
  category?: CategorySlug | 'all';
  subcategory?: string;
  priceRange: [number, number];
  minDiscount: number;
  minRating: number;
  inStockOnly: boolean;
  rashi?: string;
  mukhi?: string;
  material?: string;
  sortBy: 'featured' | 'bestselling' | 'newest' | 'price-low-to-high' | 'price-high-to-low' | 'rating' | 'discount';
  searchQuery?: string;
}

export interface Order {
  id: string;
  date: string;
  items: CartItem[];
  subtotal: number;
  discountAmount: number;
  shippingFee: number;
  total: number;
  shippingAddress: {
    fullName: string;
    email: string;
    phone: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    pincode: string;
  };
  paymentMethod: string;
  status: 'Placed' | 'Confirmed' | 'Packed' | 'Shipped' | 'Out for Delivery' | 'Delivered';
  trackingNumber: string;
  estimatedDelivery: string;
}
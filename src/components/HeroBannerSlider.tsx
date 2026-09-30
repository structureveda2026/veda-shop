import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, ArrowRight, ShieldCheck, Sparkles, Pause, Play } from 'lucide-react';
import { Link } from 'react-router-dom';

const BANNERS = [
  {
    id: 1,
    image: '/images/banners/rudraksha-banner.png',
    title: 'Authentic Rudraksha for Your Spiritual Journey',
    subtitle: 'Explore carefully selected Rudraksha beads, malas and spiritual products with authenticity, guidance and expert support.',
    badge: 'RECOMMENDED BY ASTROLOGERS • VARANASI ENERGIZED',
    ctaText: 'FIND YOUR RUDRAKSHA',
    link: '/collections/rudraksha',
    tags: ['100% Nepalese Origin', 'Lab Certified', 'Prana Pratishtha Blessed']
  },
  {
    id: 2,
    image: '/images/banners/gemstones-banner.png',
    title: 'Discover the Right Gemstone for Your Journey',
    subtitle: 'Explore natural gemstones, understand their qualities and discover Vedic guidance before you choose.',
    badge: '100% NATURAL & LAB CERTIFIED • UNHEATED & UNTREATED',
    ctaText: 'EXPLORE GEMSTONES',
    link: '/gemstones',
    tags: ['Zodiac Alignment', 'Govt. Lab Report', 'Planetary Energies']
  },
  {
    id: 3,
    image: '/images/banners/bracelets-banner.png',
    title: 'Spiritual Bracelets, Made for Your Journey',
    subtitle: 'Explore Rudraksha, Gemstone, Crystal and traditional spiritual bracelets designed for everyday wear.',
    badge: 'HANDMADE ENERGY JEWELRY • EVERYDAY SPIRITUAL STYLE',
    ctaText: 'SHOP ALL BRACELETS',
    link: '/collections/bracelets',
    tags: ['Healing Crystals', 'Natural Beads', 'Adjustable Fit']
  },
  {
    id: 4,
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=1600',
    title: 'Everything You Need for Your Puja & Rituals',
    subtitle: 'Thoughtfully assembled ritual samagri kits & sacred items sourced directly from holy Varanasi ghats.',
    badge: 'VARANASI BLESSED • COMPLETE SAMAGRI KITS',
    ctaText: 'SHOP PUJA KITS',
    link: '/puja-kits',
    tags: ['Pure Samagri', 'Step-by-Step Manual', 'Festive Ready']
  }
];

const SLIDE_DURATION = 2000; // 2 seconds per slide

export const HeroBannerSlider: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const progressRef = useRef<HTMLDivElement>(null);

  // Minimum swipe distance
  const minSwipeDistance = 50;

  // Auto-slide effect
  useEffect(() => {
    if (!isPlaying) return;

    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % BANNERS.length);
    }, SLIDE_DURATION);

    return () => clearInterval(timer);
  }, [isPlaying, currentIndex]);

  // Keyboard Navigation (Left / Right Arrows)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        goToPrev();
      } else if (e.key === 'ArrowRight') {
        goToNext();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const goToPrev = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + BANNERS.length) % BANNERS.length);
  };

  const goToNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % BANNERS.length);
  };

  // Touch handlers for mobile swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    if (distance > minSwipeDistance) {
      goToNext();
    } else if (distance < -minSwipeDistance) {
      goToPrev();
    }
  };

  return (
    <section 
      className="relative w-full h-[calc(100vh-100px)] min-h-[560px] sm:min-h-[620px] lg:h-[calc(100vh-112px)] max-h-[920px] bg-vedic-dark overflow-hidden select-none group/hero"
      onMouseEnter={() => setIsPlaying(false)}
      onMouseLeave={() => setIsPlaying(true)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Full Page Sliding Container */}
      <div
        className="flex w-full h-full transition-transform duration-700 ease-[cubic-bezier(0.25,1,0.5,1)]"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {BANNERS.map((banner, index) => {
          const isActive = currentIndex === index;
          return (
            <div
              key={banner.id}
              className="w-full h-full flex-shrink-0 relative overflow-hidden bg-vedic-dark"
            >
              {/* Fullscreen Background Image */}
              <img
                src={banner.image}
                alt={banner.title}
                className={`w-full h-full object-cover object-center brightness-[0.6] transition-transform duration-[2000ms] ease-out ${
                  isActive ? 'scale-105' : 'scale-100'
                }`}
              />

              {/* Gradient Dark Overlays for Ultra Crisp Readability */}
              <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/65 to-black/30 z-10" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-black/40 z-10" />

              {/* Full Page Hero Content */}
              <div className="absolute inset-0 z-20 flex items-center">
                <div className="max-w-7xl mx-auto px-4 sm:px-8 md:px-12 w-full pt-12 pb-24 md:py-0">
                  <div className={`space-y-4 md:space-y-6 max-w-3xl transition-all duration-700 delay-100 transform ${
                    isActive ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
                  }`}>
                    
                    {/* Badge Pill */}
                    <div className="inline-flex items-center gap-2 bg-vedic-gold/25 border border-vedic-gold/50 text-vedic-goldLight text-[11px] sm:text-xs font-bold px-4 py-1.5 rounded-full backdrop-blur-md shadow-lg tracking-wider uppercase">
                      <Sparkles className="w-3.5 h-3.5 text-vedic-gold animate-pulse" />
                      <span>{banner.badge}</span>
                    </div>

                    {/* Main Title */}
                    <h1 className="font-serif font-extrabold text-2xl sm:text-4xl md:text-5xl lg:text-6xl text-white drop-shadow-2xl leading-[1.15] tracking-tight">
                      {banner.title.split(' ').map((word, wIdx) => 
                        ['Rudraksha', 'Gemstone', 'Bracelets', 'Puja'].includes(word.replace(/[^a-zA-Z]/g, '')) ? (
                          <span key={wIdx} className="text-vedic-goldLight drop-shadow-md"> {word} </span>
                        ) : (
                          ` ${word}`
                        )
                      )}
                    </h1>

                    {/* Subtitle */}
                    <p className="text-xs sm:text-base md:text-lg text-gray-200 font-light leading-relaxed max-w-2xl drop-shadow-md">
                      {banner.subtitle}
                    </p>

                    {/* Highlight Tags */}
                    <div className="flex flex-wrap gap-2 pt-1">
                      {banner.tags.map((tag, tIdx) => (
                        <span 
                          key={tIdx} 
                          className="inline-flex items-center gap-1.5 text-[11px] sm:text-xs bg-black/40 border border-white/20 text-vedic-goldLight px-3 py-1 rounded-full backdrop-blur-md font-medium"
                        >
                          <ShieldCheck className="w-3 h-3 text-vedic-gold" />
                          {tag}
                        </span>
                      ))}
                    </div>

                    {/* Action CTA Buttons */}
                    <div className="flex flex-wrap items-center gap-3 sm:gap-4 pt-3">
                      <Link
                        to={banner.link}
                        className="inline-flex items-center gap-2.5 bg-vedic-gold hover:bg-vedic-goldDark text-vedic-dark font-serif font-bold text-xs sm:text-base px-6 sm:px-8 py-3.5 sm:py-4 rounded-full shadow-2xl hover:scale-105 transition-all duration-300 group/btn"
                      >
                        <span>{banner.ctaText}</span>
                        <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover/btn:translate-x-1 transition-transform" />
                      </Link>

                      <Link
                        to="/shop"
                        className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white border border-white/30 font-serif font-semibold text-xs sm:text-base px-5 sm:px-7 py-3.5 sm:py-4 rounded-full backdrop-blur-md transition-all duration-300 hover:border-vedic-gold/60"
                      >
                        <span>EXPLORE CATALOG</span>
                      </Link>
                    </div>

                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Navigation Arrow Controls - Left & Right */}
      <button
        onClick={goToPrev}
        className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 p-3 sm:p-4 rounded-full bg-black/40 text-white hover:bg-vedic-gold hover:text-vedic-dark backdrop-blur-md border border-white/20 hover:border-vedic-gold transition-all duration-300 shadow-2xl z-30 group/arrow hover:scale-110"
        aria-label="Previous Slide"
      >
        <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 group-hover/arrow:-translate-x-0.5 transition-transform" />
      </button>

      <button
        onClick={goToNext}
        className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 p-3 sm:p-4 rounded-full bg-black/40 text-white hover:bg-vedic-gold hover:text-vedic-dark backdrop-blur-md border border-white/20 hover:border-vedic-gold transition-all duration-300 shadow-2xl z-30 group/arrow hover:scale-110"
        aria-label="Next Slide"
      >
        <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 group-hover/arrow:translate-x-0.5 transition-transform" />
      </button>

      {/* Slide Navigation Indicator Dots */}
      <div className="absolute bottom-4 sm:bottom-8 left-1/2 -translate-x-1/2 z-30 flex items-center space-x-2 bg-black/50 border border-white/20 backdrop-blur-md px-4 py-2 rounded-full shadow-xl">
        {BANNERS.map((banner, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentIndex(idx)}
            className={`h-2.5 rounded-full transition-all duration-500 relative ${
              currentIndex === idx
                ? 'w-8 sm:w-10 bg-vedic-gold shadow-glow'
                : 'w-2.5 bg-white/40 hover:bg-white/70'
            }`}
            aria-label={`Go to slide ${idx + 1}`}
            title={banner.ctaText}
          />
        ))}
      </div>
    </section>
  );
};
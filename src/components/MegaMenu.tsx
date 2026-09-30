import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';
import { NAVAGRAHA_GEMSTONES, PLANET_LIST } from '../data/gemstoneData';
import { CATEGORIES } from '../data/categories';

// Puja kit types for the PUJA KIT menu — read from the `puja-kits` category (data/categories.ts), so a new
// kit type added there shows up in this menu automatically. Each one opens /puja-kits filtered to that type.
const PUJA_KIT_TYPES = CATEGORIES.find((c) => c.slug === 'puja-kits')?.subcategories ?? [];

export const MegaMenu: React.FC = () => {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  return (
    <nav className="relative bg-vedic-ivory border-b border-vedic-gold/20 shadow-sm hidden md:block z-30">
      <div className="max-w-6xl mx-auto px-4">
        <ul className="flex items-center justify-between text-xs font-bold tracking-wider text-vedic-dark uppercase">
          
          {/* 01. RUDRAKSHA */}
          <li
            className="relative group py-3"
            onMouseEnter={() => setActiveMenu('rudraksha')}
            onMouseLeave={() => setActiveMenu(null)}
          >
            <Link
              to="/rudraksha"
              className="flex items-center gap-1 hover:text-vedic-maroon transition-colors py-1 px-2.5 rounded-full hover:bg-white/60"
            >
              <span>RUDRAKSHA</span>
              <ChevronDown className="w-3.5 h-3.5 text-vedic-gold transition-transform group-hover:rotate-180" />
            </Link>

            {activeMenu === 'rudraksha' && (
              <div className="absolute left-0 top-full w-[540px] bg-white rounded-b-2xl shadow-2xl border border-vedic-gold/30 p-5 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="flex items-center justify-between border-b border-vedic-beige pb-2 mb-3">
                  <span className="text-[11px] font-bold text-vedic-goldDark uppercase tracking-widest">
                    Authentic Nepalese Rudraksha (1 to 14 Mukhi)
                  </span>
                  <Link to="/collections/rudraksha" className="text-[11px] font-bold text-vedic-maroon hover:underline">
                    Explore All Rudraksha →
                  </Link>
                </div>

                <div className="grid grid-cols-4 gap-2 text-xs normal-case font-medium">
                  {Array.from({ length: 14 }).map((_, i) => (
                    <Link
                      key={i}
                      to={`/products/${i + 1}-mukhi-rudraksha`}
                      className="px-2 py-1 rounded hover:bg-vedic-ivory hover:text-vedic-maroon flex items-center justify-between border border-transparent hover:border-vedic-gold/30 transition-colors"
                    >
                      <span>{i + 1} Mukhi</span>
                      <span className="text-[9px] text-vedic-goldDark font-bold">Lab Cert</span>
                    </Link>
                  ))}
                </div>

                <div className="mt-4 pt-3 border-t border-vedic-beige flex items-center justify-around text-xs font-bold text-vedic-maroon">
                  <Link to="/products/gauri-shankar-rudraksha" className="hover:underline flex items-center gap-1">
                    <span>✨ Gauri Shankar Rudraksha</span>
                  </Link>
                  <Link to="/products/ganesh-rudraksha" className="hover:underline flex items-center gap-1">
                    <span>🐘 Ganesha Rudraksha</span>
                  </Link>
                </div>
              </div>
            )}
          </li>

          {/* 02. BRACELETS */}
          <li
            className="relative group py-3"
            onMouseEnter={() => setActiveMenu('bracelets')}
            onMouseLeave={() => setActiveMenu(null)}
          >
            <Link
              to="/bracelets"
              className="flex items-center gap-1 hover:text-vedic-maroon transition-colors py-1 px-2.5 rounded-full hover:bg-white/60"
            >
              <span>BRACELETS</span>
              <ChevronDown className="w-3.5 h-3.5 text-vedic-gold transition-transform group-hover:rotate-180" />
            </Link>

            {activeMenu === 'bracelets' && (
              <div className="absolute left-0 top-full w-80 bg-white rounded-b-2xl shadow-2xl border border-vedic-gold/30 p-4 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="text-[11px] font-bold text-vedic-goldDark uppercase tracking-widest mb-3 border-b border-vedic-beige pb-2">
                  Wear Your Spiritual Style
                </div>
                <div className="space-y-1.5 text-xs normal-case font-medium">
                  <Link to="/collections/bracelets" className="block hover:text-vedic-maroon py-1 px-2 rounded hover:bg-vedic-ivory">Rudraksha Bracelets</Link>
                  <Link to="/collections/bracelets" className="block hover:text-vedic-maroon py-1 px-2 rounded hover:bg-vedic-ivory">Gemstone & Crystal Bracelets</Link>
                  <Link to="/collections/bracelets" className="block hover:text-vedic-maroon py-1 px-2 rounded hover:bg-vedic-ivory">Everyday Spiritual Wear</Link>
                  <Link to="/collections/bracelets" className="block hover:text-vedic-maroon py-1 px-2 rounded hover:bg-vedic-ivory">Exclusive Designs</Link>
                </div>
              </div>
            )}
          </li>

          {/* 03. GEMSTONE */}
          <li
            className="relative group py-3"
            onMouseEnter={() => setActiveMenu('gemstones')}
            onMouseLeave={() => setActiveMenu(null)}
          >
            <Link
              to="/gemstones"
              className="flex items-center gap-1 hover:text-vedic-maroon transition-colors py-1 px-2.5 rounded-full hover:bg-white/60"
            >
              <span>GEMSTONE</span>
              <ChevronDown className="w-3.5 h-3.5 text-vedic-gold transition-transform group-hover:rotate-180" />
            </Link>

            {activeMenu === 'gemstones' && (
              <div className="absolute left-1/2 -translate-x-1/2 top-full w-[720px] bg-white rounded-b-2xl shadow-2xl border-2 border-vedic-gold p-6 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="grid grid-cols-4 gap-6 text-xs normal-case">
                  
                  {/* Col 1: BY GEMSTONE */}
                  <div className="space-y-2 border-r border-vedic-beige pr-3">
                    <span className="text-[11px] font-bold text-vedic-goldDark uppercase tracking-wider block border-b pb-1">
                      NAVRATNA GEMSTONES
                    </span>
                    {NAVAGRAHA_GEMSTONES.map((g) => (
                      <Link
                        key={g.id}
                        to={`/gemstones/${g.slug}`}
                        className="block py-1 hover:text-vedic-maroon font-semibold flex items-center justify-between"
                      >
                        <span>{g.name}</span>
                        <span className="text-[10px] text-vedic-muted">{g.localName.split(' ')[0]}</span>
                      </Link>
                    ))}
                  </div>

                  {/* Col 2: BY PLANET */}
                  <div className="space-y-2 border-r border-vedic-beige pr-3">
                    <span className="text-[11px] font-bold text-vedic-goldDark uppercase tracking-wider block border-b pb-1">
                      BY PLANET
                    </span>
                    {PLANET_LIST.map((p) => (
                      <Link
                        key={p.id}
                        to={`/planets/${p.slug}`}
                        className="block py-1 hover:text-vedic-maroon font-semibold flex items-center gap-1"
                      >
                        <span>{p.symbol}</span>
                        <span>{p.planetName.split(' ')[0]}</span>
                      </Link>
                    ))}
                  </div>

                  {/* Col 3: JEWELLERY */}
                  <div className="space-y-3 border-r border-vedic-beige pr-3">
                    <span className="text-[11px] font-bold text-vedic-goldDark uppercase tracking-wider block border-b pb-1">
                      CUSTOM JEWELLERY
                    </span>
                    <Link to="/collections/bracelets" className="block py-1 hover:text-vedic-maroon font-semibold">Gemstone Rings</Link>
                    <Link to="/collections/bracelets" className="block py-1 hover:text-vedic-maroon font-semibold">Astrological Pendants</Link>
                    <Link to="/collections/bracelets" className="block py-1 hover:text-vedic-maroon font-semibold">Crystal Bracelets</Link>
                    <Link to="/custom-gemstone-jewellery" className="block py-1 text-vedic-maroon font-bold hover:underline">
                      Custom Builder →
                    </Link>
                  </div>

                  {/* Col 4: CONSULT & GUIDE */}
                  <div className="space-y-3 bg-vedic-ivory p-3 rounded-xl border border-vedic-gold/20 flex flex-col justify-between">
                    <div>
                      <span className="text-[11px] font-bold text-vedic-maroon uppercase tracking-wider block border-b border-vedic-gold/20 pb-1 mb-2">
                        GEMSTONE GUIDE
                      </span>
                      <Link to="/guides/gemstone" className="block py-1 hover:underline font-semibold">Buying Guide</Link>
                      <Link to="/certification" className="block py-1 hover:underline font-semibold text-emerald-800">100% Lab Certified</Link>
                    </div>

                    <div className="pt-2 border-t border-vedic-gold/30 text-center">
                      <Link
                        to="/gemstones#find-my-gemstone"
                        className="bg-vedic-maroon text-vedic-ivory font-bold text-[10px] py-2 px-3 rounded-full block shadow hover:bg-vedic-maroonDark transition-colors"
                      >
                        FIND MY GEMSTONE
                      </Link>
                    </div>
                  </div>

                </div>
              </div>
            )}
          </li>

          {/* 04. SPIRITUAL ESSENTIALS */}
          <li
            className="relative group py-3"
            onMouseEnter={() => setActiveMenu('essentials')}
            onMouseLeave={() => setActiveMenu(null)}
          >
            <Link
              to="/collections/spiritual-essentials"
              className="flex items-center gap-1 hover:text-vedic-maroon transition-colors py-1 px-2.5 rounded-full hover:bg-white/60"
            >
              <span>SPIRITUAL ESSENTIALS</span>
              <ChevronDown className="w-3.5 h-3.5 text-vedic-gold transition-transform group-hover:rotate-180" />
            </Link>

            {activeMenu === 'essentials' && (
              <div className="absolute left-1/2 -translate-x-1/2 top-full w-80 bg-white rounded-b-2xl shadow-2xl border border-vedic-gold/30 p-4 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="text-[11px] font-bold text-vedic-goldDark uppercase tracking-widest mb-3 border-b border-vedic-beige pb-2">
                  Bring Spirituality Into Everyday Life
                </div>
                <div className="space-y-1.5 text-xs normal-case font-medium">
                  <Link to="/collections/spiritual-essentials" className="block hover:text-vedic-maroon py-1 px-2 rounded hover:bg-vedic-ivory">Daily Puja Essentials</Link>
                  <Link to="/collections/spiritual-essentials" className="block hover:text-vedic-maroon py-1 px-2 rounded hover:bg-vedic-ivory">Dhoop, Incense & Fragrance</Link>
                  <Link to="/collections/spiritual-essentials" className="block hover:text-vedic-maroon py-1 px-2 rounded hover:bg-vedic-ivory">Japa & Meditation Essentials</Link>
                  <Link to="/collections/spiritual-essentials" className="block hover:text-vedic-maroon py-1 px-2 rounded hover:bg-vedic-ivory">Sacred Accessories</Link>
                </div>
              </div>
            )}
          </li>

          {/* 05. YANTRAS */}
          <li
            className="relative group py-3"
            onMouseEnter={() => setActiveMenu('yantras')}
            onMouseLeave={() => setActiveMenu(null)}
          >
            <Link
              to="/collections/yantra"
              className="flex items-center gap-1 hover:text-vedic-maroon transition-colors py-1 px-2.5 rounded-full hover:bg-white/60"
            >
              <span>YANTRAS</span>
              <ChevronDown className="w-3.5 h-3.5 text-vedic-gold transition-transform group-hover:rotate-180" />
            </Link>

            {activeMenu === 'yantras' && (
              <div className="absolute right-1/4 top-full w-80 bg-white rounded-b-2xl shadow-2xl border border-vedic-gold/30 p-4 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="text-[11px] font-bold text-vedic-goldDark uppercase tracking-widest mb-3 border-b border-vedic-beige pb-2">
                  Explore Sacred Symbols & Traditions
                </div>
                <div className="space-y-1.5 text-xs normal-case font-medium">
                  <Link to="/collections/yantra" className="block hover:text-vedic-maroon py-1 px-2 rounded hover:bg-vedic-ivory">Deity Yantras</Link>
                  <Link to="/collections/yantra" className="block hover:text-vedic-maroon py-1 px-2 rounded hover:bg-vedic-ivory">Navgraha Yantras</Link>
                  <Link to="/collections/yantra" className="block hover:text-vedic-maroon py-1 px-2 rounded hover:bg-vedic-ivory">Vastu Yantras</Link>
                  <Link to="/collections/yantra" className="block hover:text-vedic-maroon py-1 px-2 rounded hover:bg-vedic-ivory">Puja & Energization Services</Link>
                </div>
              </div>
            )}
          </li>

          {/* 06. PUJA KIT */}
          <li
            className="relative group py-3"
            onMouseEnter={() => setActiveMenu('pujakit')}
            onMouseLeave={() => setActiveMenu(null)}
          >
            <Link
              to="/puja-kits"
              className="flex items-center gap-1 hover:text-vedic-maroon transition-colors py-1 px-2.5 rounded-full hover:bg-white/60"
            >
              <span>PUJA KIT</span>
              <ChevronDown className="w-3.5 h-3.5 text-vedic-gold transition-transform group-hover:rotate-180" />
            </Link>

            {activeMenu === 'pujakit' && (
              <div className="absolute right-0 top-full w-[560px] bg-white rounded-b-2xl shadow-2xl border border-vedic-gold/30 p-5 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="flex items-center justify-between border-b border-vedic-beige pb-2 mb-3">
                  <span className="text-[11px] font-bold text-vedic-goldDark uppercase tracking-widest">
                    Everything You Need for Your Puja
                  </span>
                  <Link
                    to="/puja-kits"
                    onClick={() => setActiveMenu(null)}
                    className="text-[11px] font-bold text-vedic-maroon hover:underline"
                  >
                    Explore All Puja Kits →
                  </Link>
                </div>

                <div className="grid grid-cols-[1fr_auto] gap-5">
                  {/* Shop by puja kit — one entry per kit type, each opens that category */}
                  <div>
                    <span className="text-[11px] font-bold text-vedic-maroon uppercase tracking-wider block mb-2">
                      Shop by Puja Kit
                    </span>
                    <div className="grid grid-cols-2 gap-x-2 gap-y-0.5 text-xs normal-case font-medium">
                      {PUJA_KIT_TYPES.map((type) => (
                        <Link
                          key={type.slug}
                          to={`/puja-kits?type=${type.slug}`}
                          onClick={() => setActiveMenu(null)}
                          title={type.description}
                          className="px-2 py-1.5 rounded border border-transparent hover:border-vedic-gold/30 hover:bg-vedic-ivory hover:text-vedic-maroon transition-colors"
                        >
                          {type.name}
                        </Link>
                      ))}
                    </div>
                  </div>

                  {/* Quick links */}
                  <div className="w-44 bg-vedic-ivory p-3 rounded-xl border border-vedic-gold/20 text-xs normal-case font-medium flex flex-col gap-0.5">
                    <span className="text-[11px] font-bold text-vedic-maroon uppercase tracking-wider block border-b border-vedic-gold/20 pb-1 mb-1.5">
                      By Occasion
                    </span>
                    <Link to="/puja-kits#puja-by-occasion" onClick={() => setActiveMenu(null)} className="block hover:text-vedic-maroon py-1">Festival Puja Kits</Link>
                    <Link to="/puja-kits?occasion=griha-pravesh" onClick={() => setActiveMenu(null)} className="block hover:text-vedic-maroon py-1">Special Occasion Kits</Link>
                    <Link to="/collections/puja-samagri" onClick={() => setActiveMenu(null)} className="block hover:text-vedic-maroon py-1 mt-1.5 pt-2 border-t border-vedic-gold/20">Carefully Selected Samagri</Link>
                  </div>
                </div>
              </div>
            )}
          </li>

          {/* 07. BLOG */}
          <li className="py-3">
            <Link
              to="/blog"
              className="flex items-center gap-1 hover:text-vedic-maroon transition-colors py-1 px-2.5 rounded-full hover:bg-white/60"
            >
              <span>BLOG</span>
            </Link>
          </li>

        </ul>
      </div>
    </nav>
  );
};
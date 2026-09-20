import React, { useState } from 'react';
import { Sparkles, Calendar, Clock, MapPin, Target, User, ArrowRight, ShieldAlert, RotateCcw, CheckCircle2 } from 'lucide-react';
import { AstrologyService } from '../services/astrologyService';
import { AstrologyRecommendationInput, AstrologyRecommendationResult } from '../types/gemstone';
import { GEMSTONE_PRODUCTS_LIST } from '../data/gemstoneData';
import { AddToCartControl } from './AddToCartControl';

export const GemstoneRecommendationEngine: React.FC = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<AstrologyRecommendationInput>({
    fullName: '',
    dob: '1995-06-15',
    tob: '08:30',
    pob: 'Varanasi, India',
    primaryGoal: 'Career',
    weightKg: 65
  });

  const [result, setResult] = useState<AstrologyRecommendationResult | null>(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (field: keyof AstrologyRecommendationInput, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleNextStep = () => {
    if (step < 5) {
      setStep(step + 1);
    } else {
      handleCalculate();
    }
  };

  const handleCalculate = () => {
    setLoading(true);
    setTimeout(() => {
      const res = AstrologyService.calculateRecommendation(formData);
      setResult(res);
      setLoading(false);
    }, 1200);
  };

  const handleReset = () => {
    setResult(null);
    setStep(1);
  };

  return (
    <div id="gemstone-recommendation-engine" className="bg-gradient-to-b from-vedic-dark via-stone-950 to-vedic-dark text-vedic-ivory py-16 px-4 rounded-3xl border border-vedic-gold/40 shadow-2xl relative overflow-hidden">
      {/* Subtle Background Sacred Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(#d4af37_1px,transparent_1px)] [background-size:24px_24px] opacity-10 pointer-events-none" />

      <div className="max-w-4xl mx-auto relative z-10">
        <div className="text-center space-y-3 mb-10">
          <span className="inline-flex items-center gap-2 bg-vedic-gold/20 text-vedic-gold border border-vedic-gold/40 px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest backdrop-blur-md">
            <Sparkles className="w-4 h-4" /> Vedic Astrology Gemstone Engine
          </span>
          <h2 className="font-serif font-extrabold text-3xl md:text-5xl text-vedic-goldLight drop-shadow-md">
            Discover Your Astrological Gemstone
          </h2>
          <p className="text-sm text-gray-300 font-light max-w-xl mx-auto">
            Input your birth details to generate an authentic Vedic horoscope recommendation for maximum wealth, health & planetary alignment.
          </p>
        </div>

        {!result ? (
          <div className="bg-white/5 backdrop-blur-xl border border-vedic-gold/30 rounded-3xl p-6 sm:p-10 shadow-2xl">
            {/* Step Indicators */}
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/10">
              {[1, 2, 3, 4, 5].map((s) => (
                <div key={s} className="flex items-center gap-2">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center font-serif font-bold text-xs transition-all ${
                      s === step
                        ? 'bg-vedic-gold text-vedic-dark ring-4 ring-vedic-gold/30'
                        : s < step
                        ? 'bg-emerald-600 text-white'
                        : 'bg-white/10 text-white/50'
                    }`}
                  >
                    {s < step ? <CheckCircle2 className="w-4 h-4" /> : s}
                  </div>
                  <span className="hidden sm:inline text-xs font-medium text-gray-300">
                    {s === 1 && 'Name'}
                    {s === 2 && 'DOB'}
                    {s === 3 && 'Time'}
                    {s === 4 && 'Place'}
                    {s === 5 && 'Goal'}
                  </span>
                </div>
              ))}
            </div>

            {/* Step Form Content */}
            <div className="min-h-[220px] flex flex-col justify-center">
              {step === 1 && (
                <div className="space-y-4 animate-in fade-in duration-300">
                  <label className="block text-sm font-serif font-semibold text-vedic-goldLight flex items-center gap-2">
                    <User className="w-4 h-4 text-vedic-gold" /> Step 1: Your Full Name
                  </label>
                  <input
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => handleChange('fullName', e.target.value)}
                    placeholder="Enter your full name (e.g. Aarav Sharma)"
                    className="w-full bg-white/10 border border-vedic-gold/30 rounded-2xl px-5 py-4 text-white placeholder-gray-400 focus:outline-none focus:border-vedic-gold text-base"
                  />
                  <p className="text-xs text-gray-400">Used to generate your custom astrological profile report.</p>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-4 animate-in fade-in duration-300">
                  <label className="block text-sm font-serif font-semibold text-vedic-goldLight flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-vedic-gold" /> Step 2: Date of Birth & Body Weight
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <span className="text-xs text-gray-300 mb-1 block">Date of Birth</span>
                      <input
                        type="date"
                        value={formData.dob}
                        onChange={(e) => handleChange('dob', e.target.value)}
                        className="w-full bg-white/10 border border-vedic-gold/30 rounded-2xl px-5 py-3.5 text-white focus:outline-none focus:border-vedic-gold text-sm"
                      />
                    </div>
                    <div>
                      <span className="text-xs text-gray-300 mb-1 block">Approx. Body Weight (kg)</span>
                      <input
                        type="number"
                        value={formData.weightKg}
                        onChange={(e) => handleChange('weightKg', Number(e.target.value))}
                        placeholder="e.g. 68"
                        className="w-full bg-white/10 border border-vedic-gold/30 rounded-2xl px-5 py-3.5 text-white focus:outline-none focus:border-vedic-gold text-sm"
                      />
                    </div>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-4 animate-in fade-in duration-300">
                  <label className="block text-sm font-serif font-semibold text-vedic-goldLight flex items-center gap-2">
                    <Clock className="w-4 h-4 text-vedic-gold" /> Step 3: Exact Time of Birth
                  </label>
                  <input
                    type="time"
                    value={formData.tob}
                    onChange={(e) => handleChange('tob', e.target.value)}
                    className="w-full bg-white/10 border border-vedic-gold/30 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-vedic-gold text-base"
                  />
                  <p className="text-xs text-gray-400">If exact time is unknown, select approximate time for sun/moon ascendant calculation.</p>
                </div>
              )}

              {step === 4 && (
                <div className="space-y-4 animate-in fade-in duration-300">
                  <label className="block text-sm font-serif font-semibold text-vedic-goldLight flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-vedic-gold" /> Step 4: Place of Birth
                  </label>
                  <input
                    type="text"
                    value={formData.pob}
                    onChange={(e) => handleChange('pob', e.target.value)}
                    placeholder="e.g. Mumbai, Maharashtra, India"
                    className="w-full bg-white/10 border border-vedic-gold/30 rounded-2xl px-5 py-4 text-white placeholder-gray-400 focus:outline-none focus:border-vedic-gold text-base"
                  />
                </div>
              )}

              {step === 5 && (
                <div className="space-y-4 animate-in fade-in duration-300">
                  <label className="block text-sm font-serif font-semibold text-vedic-goldLight flex items-center gap-2">
                    <Target className="w-4 h-4 text-vedic-gold" /> Step 5: What is your primary life goal?
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {[
                      'Career',
                      'Business',
                      'Relationships',
                      'Education',
                      'Confidence',
                      'Spirituality',
                      'General Wellbeing'
                    ].map((g) => (
                      <button
                        key={g}
                        type="button"
                        onClick={() => handleChange('primaryGoal', g)}
                        className={`p-3.5 rounded-2xl text-xs font-serif font-bold transition-all border text-left ${
                          formData.primaryGoal === g
                            ? 'bg-vedic-gold text-vedic-dark border-vedic-gold shadow-lg font-bold scale-105'
                            : 'bg-white/5 border-white/20 text-white hover:bg-white/10'
                        }`}
                      >
                        {g}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Buttons */}
            <div className="mt-8 pt-4 border-t border-white/10 flex items-center justify-between">
              {step > 1 ? (
                <button
                  type="button"
                  onClick={() => setStep(step - 1)}
                  className="text-xs font-bold text-gray-300 hover:text-white px-4 py-2"
                >
                  ← Previous
                </button>
              ) : <div />}

              <button
                type="button"
                onClick={handleNextStep}
                disabled={loading || (step === 1 && !formData.fullName.trim())}
                className="bg-gold-gradient text-vedic-dark px-8 py-3.5 rounded-full font-serif font-bold text-sm shadow-xl hover:scale-105 transition-transform flex items-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <span className="animate-pulse">Generating Vedic Chart...</span>
                ) : step === 5 ? (
                  <>Generate My Gemstone Report <Sparkles className="w-4 h-4" /></>
                ) : (
                  <>Next Step <ArrowRight className="w-4 h-4" /></>
                )}
              </button>
            </div>
          </div>
        ) : (
          /* RESULT REPORT INTERFACE */
          <div className="bg-white/10 backdrop-blur-2xl border border-vedic-gold/40 rounded-3xl p-6 sm:p-10 space-y-8 animate-in zoom-in-95 duration-500 shadow-2xl">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-vedic-gold/30 pb-6 gap-4">
              <div>
                <span className="text-xs font-bold text-vedic-gold uppercase tracking-widest">
                  Official Vedic Astro Report
                </span>
                <h3 className="font-serif font-extrabold text-2xl sm:text-3xl text-vedic-goldLight">
                  Astrological Gemstone Analysis for {formData.fullName}
                </h3>
              </div>
              <button
                onClick={handleReset}
                className="inline-flex items-center gap-2 text-xs font-bold bg-white/10 border border-white/20 hover:bg-white/20 px-4 py-2 rounded-full text-white"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Re-calculate
              </button>
            </div>

            {/* Grid of Astro Specifications */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="bg-black/30 border border-vedic-gold/30 rounded-2xl p-5">
                <span className="text-[11px] font-bold text-vedic-gold uppercase">Primary Recommended Stone</span>
                <h4 className="font-serif font-extrabold text-xl text-white mt-1">{result.primaryGemstone}</h4>
                <p className="text-xs text-gray-300 mt-1">Ruling Planet: <span className="text-vedic-gold">{result.rulingPlanet}</span></p>
              </div>

              <div className="bg-black/30 border border-vedic-gold/30 rounded-2xl p-5">
                <span className="text-[11px] font-bold text-vedic-gold uppercase">Alternative Gemstone</span>
                <h4 className="font-serif font-extrabold text-xl text-white mt-1">{result.alternativeGemstone}</h4>
                <p className="text-xs text-gray-300 mt-1">Secondary Planet Energy</p>
              </div>

              <div className="bg-black/30 border border-vedic-gold/30 rounded-2xl p-5">
                <span className="text-[11px] font-bold text-vedic-gold uppercase">Rashi & Nakshatra</span>
                <h4 className="font-serif font-extrabold text-xl text-white mt-1">{result.userRashi}</h4>
                <p className="text-xs text-gray-300 mt-1">Nakshatra: {result.nakshatra}</p>
              </div>

              <div className="bg-black/30 border border-vedic-gold/30 rounded-2xl p-5">
                <span className="text-[11px] font-bold text-vedic-gold uppercase">Suggested Carat Weight</span>
                <h4 className="font-serif font-bold text-base text-white mt-1">{result.suggestedCaratRange}</h4>
                <p className="text-xs text-gray-400 mt-1">Based on body mass of {formData.weightKg} kg</p>
              </div>

              <div className="bg-black/30 border border-vedic-gold/30 rounded-2xl p-5">
                <span className="text-[11px] font-bold text-vedic-gold uppercase">Metal & Finger</span>
                <h4 className="font-serif font-bold text-base text-white mt-1">{result.suggestedMetal}</h4>
                <p className="text-xs text-gray-300 mt-1">Wear on: <span className="text-vedic-gold">{result.suggestedFinger}</span></p>
              </div>

              <div className="bg-black/30 border border-vedic-gold/30 rounded-2xl p-5">
                <span className="text-[11px] font-bold text-vedic-gold uppercase">Wearing Day & Time</span>
                <h4 className="font-serif font-bold text-base text-white mt-1">{result.suggestedWearingDay}</h4>
                <p className="text-xs text-gray-300 mt-1">Shukla Paksha Morning</p>
              </div>
            </div>

            {/* Vedic Beej Mantra & Astrological Rationale */}
            <div className="bg-vedic-maroon/40 border border-vedic-gold/40 rounded-2xl p-6 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-vedic-gold uppercase tracking-wider">Auspicious Beeja Mantra</span>
                <span className="text-[10px] bg-vedic-gold/20 text-vedic-gold px-2.5 py-0.5 rounded-full font-bold">Chant 108 Times</span>
              </div>
              <p className="font-serif text-lg font-bold text-vedic-goldLight italic text-center py-2">
                "{result.traditionalMantra}"
              </p>
              <p className="text-xs text-gray-200 leading-relaxed pt-2 border-t border-white/10">
                {result.astrologicalReasoning}
              </p>
            </div>

            {/* Matched Certified Gemstone Products from Catalog */}
            <div className="space-y-4 pt-4">
              <h4 className="font-serif font-bold text-xl text-vedic-goldLight flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-vedic-gold" /> Certified Gemstones Matching Your Chart
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {GEMSTONE_PRODUCTS_LIST.slice(0, 2).map((prod) => (
                  <div key={prod.id} className="bg-white/10 rounded-2xl p-4 border border-vedic-gold/20 flex gap-4 items-center">
                    <img src={prod.images[0]} alt={prod.title} className="w-20 h-20 rounded-xl object-cover border border-vedic-gold/30 shrink-0" />
                    <div className="flex-1 space-y-1">
                      <h5 className="font-serif font-bold text-sm text-white line-clamp-1">{prod.title}</h5>
                      <p className="text-xs font-bold text-vedic-gold">INR ₹{prod.price.toLocaleString()}</p>
                      <AddToCartControl
                        product={prod}
                        size="full"
                        appearance="gold"
                        label="Add to Cart"
                        buttonClassName="text-[11px] px-3 py-1.5 rounded-lg gap-1.5"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Mandatory Astrology Disclaimer Notice */}
            <div className="bg-amber-950/60 border border-amber-500/40 rounded-2xl p-4 flex items-start gap-3 text-amber-200 text-xs">
              <ShieldAlert className="w-5 h-5 shrink-0 text-amber-400 mt-0.5" />
              <p className="leading-relaxed">
                {result.disclaimer}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
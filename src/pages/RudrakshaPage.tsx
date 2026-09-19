import React from 'react';
import { useNavigate } from 'react-router-dom';
import { RudrakshaHero } from '../components/RudrakshaHero';
import { RudrakshaQuickFinder } from '../components/RudrakshaQuickFinder';
import { RudrakshaShopByMukhi } from '../components/RudrakshaShopByMukhi';
import { RudrakshaBestsellers } from '../components/RudrakshaBestsellers';
import { RudrakshaShopByPurpose } from '../components/RudrakshaShopByPurpose';
import { RudrakshaShopByRashi } from '../components/RudrakshaShopByRashi';
import { RudrakshaShopByPlanet } from '../components/RudrakshaShopByPlanet';
import { RudrakshaSpecialRudraksha } from '../components/RudrakshaSpecialRudraksha';
import { RudrakshaMala } from '../components/RudrakshaMala';
import { RudrakshaJewellery } from '../components/RudrakshaJewellery';
import { RudrakshaAuthenticity } from '../components/RudrakshaAuthenticity';
import { RudrakshaWearAndEnergize } from '../components/RudrakshaWearAndEnergize';
import { RudrakshaGuidanceCTA } from '../components/RudrakshaGuidanceCTA';
import { RudrakshaReviews } from '../components/RudrakshaReviews';
import { RudrakshaFAQ } from '../components/RudrakshaFAQ';
import { RudrakshaLearnHub } from '../components/RudrakshaLearnHub';
import { RudrakshaFinalCTA } from '../components/RudrakshaFinalCTA';

// /rudraksha — the main Rudraksha landing page (per spec: Learn → Understand → Find Right
// Rudraksha → Compare → Trust → Buy → Energization → Consultation). Built section by section.
export const RudrakshaPage: React.FC = () => {
  const navigate = useNavigate();

  const scrollToQuickFinder = () => {
    document.getElementById('quick-finder')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="bg-vedic-ivory">
      <RudrakshaHero onFindRudrakshaClick={scrollToQuickFinder} />

      <div id="quick-finder">
        <RudrakshaQuickFinder onSelectMukhi={(mukhi) => navigate(`/products/${mukhi}-mukhi-rudraksha`)} />
      </div>

      {/* Section 5 (spec): Shop By Mukhi — reusable, data-driven 1–14 Mukhi grid.
          Demo data today via rudrakshaCatalogService.ts; swaps to the real Shopify
          "rudraksha-by-mukhi" collection later with no changes to this component. */}
      <RudrakshaShopByMukhi onSelectMukhi={(mukhi) => navigate(`/products/${mukhi}-mukhi-rudraksha`)} />

      {/* Section 6 (spec): Featured/Bestseller Rudraksha — "Most Loved Rudraksha" carousel.
          Reuses the site's real ProductCard + MOCK_PRODUCTS (same data source, cards, cart,
          wishlist and Quick View as the rest of the storefront) so it's already Shopify-ready:
          only the curated slug list swaps for a real collection fetch later. */}
      <RudrakshaBestsellers />

      {/* Section 7 (spec): Shop By Purpose — "Choose Rudraksha by Your Intention". Every card
          maps to a real /purpose/:slug page (src/data/purposeData.ts) via PURPOSE_LIST, and this
          section's id="shop-by-purpose" is exactly what the Quick Finder above already scrolls
          to for its "I Want Rudraksha for a Purpose" option — that flow is now fully wired. */}
      <RudrakshaShopByPurpose onSelectPurpose={(purposeSlug) => navigate(`/purpose/${purposeSlug}`)} />

      {/* Section 8 (spec): Shop By Rashi — "Rudraksha by Rashi". Data-driven via
          rashiService.ts (12 cards today from RASHI_LIST, a live Shopify "rashi" metaobject
          list later), same fetch/loading/empty-state pattern as Shop By Mukhi above. Every
          card routes to the existing /rashi/:slug detail page, and this section's
          id="shop-by-rashi" is exactly what the Quick Finder's "Choose by Rashi" option
          already scrolls to — that flow is now fully wired too. */}
      <RudrakshaShopByRashi onSelectRashi={(rashiSlug) => navigate(`/rashi/${rashiSlug}`)} />

      {/* Section 9 (spec): Shop By Planet — "Rudraksha by Planet". Data-driven via
          rudrakshaPlanetService.ts, which pairs the site's existing 9 Navagraha planets
          (already used by /planets/:planetSlug on the Gemstone side) with whichever Mukhis are
          currently associated with each, via getRudrakshaMukhiTiles(). Same fetch/loading/empty
          pattern as the sections above, and shares one planet identity across the whole store. */}
      <RudrakshaShopByPlanet onSelectPlanet={(planetSlug) => navigate(`/planets/${planetSlug}?category=rudraksha`)} />

      {/* Section 10 (spec): Rare & Special Rudraksha — Gauri Shankar, Ganesha Rudraksha today.
          Data-driven via getRudrakshaSpecialTiles() (rudrakshaCatalogService.ts), which reads
          every non-numbered entry from RUDRAKSHA_MUKHI_LIST, so a future Garbh Gauri / Nag /
          Nepal / Collector entry an admin adds shows up here automatically — no code changes. */}
      <RudrakshaSpecialRudraksha onSelectSpecial={(slug) => navigate(`/products/${slug}`)} />

      {/* Section 11 (spec): Rudraksha Mala Collection — a "shop by type" grid (5/6/7/8 Mukhi,
          Combination, Japa, Premium). Kept separate from Jewellery below per spec. */}
      <RudrakshaMala />

      {/* Section 12 (spec): Rudraksha Jewellery — "Wear Rudraksha Your Way". Its own section
          (bracelets/pendant/kavach types), plus the one real priced Kavach product the catalog
          currently has, via getFeaturedRudrakshaJewelleryProduct(). */}
      <RudrakshaJewellery />

      {/* Sections 13 + 14 merged (spec): Trust points + Authenticity Guide teaser, linking to
          the real /authenticity and /guides/rudraksha pages already built in this app. */}
      <RudrakshaAuthenticity />

      {/* Sections 15 + 16 merged (spec): How to Wear (5-step guide) + Energization service,
          shown together since Energization is step 3 of the wearing process itself. */}
      <RudrakshaWearAndEnergize />

      {/* Sections 17 + 18 merged (spec): Astrologer Consultation + Rudraksha Recommendation
          System — reuses the site's real FindMyProductModal (also used on the homepage) for
          the recommendation flow, and /contact?subject=... for the astrologer consultation. */}
      <RudrakshaGuidanceCTA />

      {/* Section 23 (spec): Customer Reviews. */}
      <RudrakshaReviews />

      {/* Section 24 (spec): FAQ preview (5 of the spec's 14 questions) — full list on /faqs. */}
      <RudrakshaFAQ />

      {/* Sections 25 + 26 merged (spec): Education Hub + Blog, since both are the same teaser-
          card format pointing at real content (guide, authenticity, blog, puja guide). */}
      <RudrakshaLearnHub />

      {/* Section 27 (spec): Final dark/premium closing CTA. */}
      <RudrakshaFinalCTA onFindRudrakshaClick={scrollToQuickFinder} />
    </div>
  );
};
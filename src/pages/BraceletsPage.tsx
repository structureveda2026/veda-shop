import React from 'react';
import { BraceletHero } from '../components/BraceletHero';
import { BraceletTrustBar } from '../components/BraceletTrustBar';
import { BraceletCategoryNav } from '../components/BraceletCategoryNav';
import { BraceletShopByPurpose } from '../components/BraceletShopByPurpose';
import { BraceletShopByMaterial } from '../components/BraceletShopByMaterial';
import { BraceletBestsellers } from '../components/BraceletBestsellers';
import { BraceletShopByMukhi } from '../components/BraceletShopByMukhi';
import { BraceletShopByGemstone } from '../components/BraceletShopByGemstone';
import { BraceletShopByRashi } from '../components/BraceletShopByRashi';
import { BraceletShopByPlanet } from '../components/BraceletShopByPlanet';
import { BraceletFindYourStyle } from '../components/BraceletFindYourStyle';
import { BraceletTileGrid } from '../components/BraceletTileGrid';
import { BraceletPersonalize } from '../components/BraceletPersonalize';
import { BraceletGuidanceCTA } from '../components/BraceletGuidanceCTA';
import { BraceletWhySection } from '../components/BraceletWhySection';
import { BraceletHowToChoose } from '../components/BraceletHowToChoose';
import { BraceletAuthenticity } from '../components/BraceletAuthenticity';
import { BraceletReviews } from '../components/BraceletReviews';
import { BraceletFAQ } from '../components/BraceletFAQ';
import { BraceletLearnHub } from '../components/BraceletLearnHub';
import { BraceletFinalCTA } from '../components/BraceletFinalCTA';
import {
  getBraceletStyleTiles,
  getBraceletGiftingTiles,
  getBraceletPremiumTiles
} from '../services/braceletCatalogService';

// /bracelets — the dedicated Bracelets landing page (per spec: Discover → Choose by Type →
// Choose by Purpose → Compare → Trust → Buy → Personalize). Same reusable/data-driven pattern as
// RudrakshaPage: a new material, gemstone, purpose, Rashi, planet, style or occasion is a data
// change in braceletCatalogService.ts / braceletContentService.ts, never a redesign (spec §42).
// /collections/bracelets stays the generic filterable listing (CategoryPage), same split as
// /rudraksha vs /collections/rudraksha.
export const BraceletsPage: React.FC = () => {
  const scrollToFindMyBracelet = () => {
    document.getElementById('find-my-bracelet')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="bg-vedic-ivory">
      <BraceletHero onFindBraceletClick={scrollToFindMyBracelet} />
      <BraceletTrustBar />
      <BraceletCategoryNav />
      <BraceletShopByPurpose />
      <BraceletShopByMaterial />
      <BraceletBestsellers />
      <BraceletShopByMukhi />
      <BraceletShopByGemstone />
      <BraceletShopByRashi />
      <BraceletShopByPlanet />
      <BraceletFindYourStyle />
      <BraceletTileGrid
        id="style-collection"
        eyebrow="Style Collection"
        title="Wear Your Spirituality"
        ctaLabel="Shop All Styles"
        ctaHref="/collections/bracelets"
        load={getBraceletStyleTiles}
        background="white"
      />
      <BraceletPersonalize />
      <BraceletGuidanceCTA />
      <BraceletWhySection />
      <BraceletHowToChoose />
      <BraceletTileGrid
        id="bracelet-gifting"
        eyebrow="Gifting"
        title="A Meaningful Gift for Someone Special"
        ctaLabel="Shop Gifts"
        ctaHref="/collections/bracelets"
        load={getBraceletGiftingTiles}
        background="ivory"
      />
      <BraceletTileGrid
        id="premium-collection"
        eyebrow="Premium Collection"
        title="Veda Premium Bracelets"
        subtitle="Dark luxury — premium materials and limited runs."
        ctaLabel="Explore Premium"
        ctaHref="/collections/bracelets"
        load={getBraceletPremiumTiles}
        background="dark"
      />
      <BraceletAuthenticity />
      <BraceletReviews />
      <BraceletFAQ />
      <BraceletLearnHub />
      <BraceletFinalCTA onFindBraceletClick={scrollToFindMyBracelet} />
    </div>
  );
};
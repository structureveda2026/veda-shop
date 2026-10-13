import React, { useEffect } from 'react';
import { useHomeContent } from '../hooks/useHomeContent';
import { track } from '../lib/analytics';
import { HomeHeroSection } from '../components/home/HomeHeroSection';
import { HomeTrustBar } from '../components/home/HomeTrustBar';
import { HomeCategoryGrid } from '../components/home/HomeCategoryGrid';
import { HomeFinder } from '../components/home/HomeFinder';
import { HomeProductGrid } from '../components/home/HomeProductGrid';
import { HomeEditorial } from '../components/home/HomeEditorial';
import { HomeRashiGrid } from '../components/home/HomeRashiGrid';
import { HomePurposeGrid } from '../components/home/HomePurposeGrid';
import { HomeWhy } from '../components/home/HomeWhy';
import { HomeVideoGrid } from '../components/home/HomeVideoGrid';
import { HomeLearn } from '../components/home/HomeLearn';
import { HomeReviews } from '../components/home/HomeReviews';
import { HomeSocial } from '../components/home/HomeSocial';
import { HomeNewsletter } from '../components/home/HomeNewsletter';
import { HomeFinalCTA } from '../components/home/HomeFinalCTA';

const SEO_TITLE = 'Veda Store – Authentic Rudraksha, Gemstones, Yantra & Spiritual Products';
const SEO_DESCRIPTION =
  'Explore Rudraksha, gemstones, spiritual jewellery, Yantra, Puja products and Vedic services at Veda Store.';

/** Title, meta description and structured data (Organization + WebSite/SearchAction) for the home page only. */
function useHomeSeo() {
  useEffect(() => {
    const previousTitle = document.title;
    document.title = SEO_TITLE;

    let meta = document.querySelector<HTMLMetaElement>('meta[name="description"]');
    const createdMeta = !meta;
    if (!meta) {
      meta = document.createElement('meta');
      meta.name = 'description';
      document.head.appendChild(meta);
    }
    const previousDescription = meta.content;
    meta.content = SEO_DESCRIPTION;

    const origin = window.location.origin;
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.text = JSON.stringify([
      {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: 'Veda Store',
        legalName: 'Veda Structure Private Limited',
        url: origin,
        logo: `${origin}/logo.png`,
      },
      {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: 'Veda Store',
        url: origin,
        potentialAction: {
          '@type': 'SearchAction',
          target: { '@type': 'EntryPoint', urlTemplate: `${origin}/search?q={search_term_string}` },
          'query-input': 'required name=search_term_string',
        },
      },
    ]);
    document.head.appendChild(script);

    return () => {
      document.title = previousTitle;
      if (createdMeta) meta?.remove();
      else if (meta) meta.content = previousDescription;
      script.remove();
    };
  }, []);
}

/**
 * Home — Discover → Navigate → Build trust → Convert.
 *
 * Section order follows the spec exactly (the announcement bar + header above and the footer below
 * are the site-wide ones). Every band reads from useHomeContent(): Shopify products + metaobjects
 * in production, local demo data until Shopify is connected. Rudraksha, Gemstones, Bracelets, Yantra,
 * Puja Kits and the Puja / Kashi bands are all live; an admin can hide any band or category tile by
 * setting its status to "hidden" in Shopify — no code change needed.
 */
export const HomePage: React.FC = () => {
  const { content, loading } = useHomeContent();
  const { sections: s } = content;

  useHomeSeo();
  useEffect(() => {
    track('homepage_view');
  }, []);

  return (
    <div className="bg-vedic-ivory text-vedic-dark">
      <HomeHeroSection content={s.hero} />
      <HomeTrustBar items={content.trust} />
      <HomeCategoryGrid content={s.categories} categories={content.categories} />
      <HomeFinder content={s.finder} options={content.finder} />
      <HomeProductGrid content={s.bestsellers} products={content.products} loading={loading} />

      <HomeEditorial id="discover-rudraksha" content={s.rudraksha} tone="ivory" />
      <HomeEditorial id="discover-gemstones" content={s.gemstones} tone="sand" imageRight />
      <HomeEditorial id="shop-bracelets" content={s.bracelets} tone="white" />
      <HomeEditorial id="discover-yantra" content={s.yantra} tone="ivory" imageRight />
      <HomeEditorial id="shop-puja-kits" content={s['puja-kits']} tone="sand" />

      <HomeRashiGrid content={s.rashi} rashi={content.rashi} />
      <HomePurposeGrid content={s.purpose} purposes={content.purposes} />

      <HomeEditorial id="puja-services" content={s.services} tone="white" />
      <HomeEditorial id="from-kashi" content={s.kashi} tone="ivory" imageRight />

      <HomeWhy content={s.why} items={content.why} />
      <HomeVideoGrid content={s.video} videos={content.videos} />
      <HomeLearn content={s.learn} cards={content.learn} />
      <HomeReviews content={s.reviews} reviews={content.reviews} />
      <HomeSocial content={s.social} tiles={content.social} />
      <HomeNewsletter content={s.newsletter} />
      <HomeFinalCTA content={s.final} />
    </div>
  );
};

export default HomePage;
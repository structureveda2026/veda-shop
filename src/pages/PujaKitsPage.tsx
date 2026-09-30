import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
import { PujaKitHero } from '../components/PujaKitHero';
import { PujaKitTrustBar } from '../components/PujaKitTrustBar';
import { PujaKitTypeNav } from '../components/PujaKitTypeNav';
import { PujaKitOccasions } from '../components/PujaKitOccasions';
import { PujaKitBestsellers } from '../components/PujaKitBestsellers';
import { PujaKitFinder } from '../components/PujaKitFinder';
import { PujaKitInside } from '../components/PujaKitInside';
import { PujaKitHowItWorks } from '../components/PujaKitHowItWorks';
import { PujaKitPurposes } from '../components/PujaKitPurposes';
import { PujaKitSamagri } from '../components/PujaKitSamagri';
import { PujaKitPanditCTA } from '../components/PujaKitPanditCTA';
import { PujaKitWhy } from '../components/PujaKitWhy';
import { PujaKitReviews } from '../components/PujaKitReviews';
import { PujaKitFAQ } from '../components/PujaKitFAQ';
import { PujaKitLearnHub } from '../components/PujaKitLearnHub';
import { PujaKitFinalCTA } from '../components/PujaKitFinalCTA';
import {
  DEFAULT_FILTERS,
  filtersFromParams,
  filtersToParams,
  getPujaKits,
  hasActiveFilters,
  type PujaKitFilters,
  type PujaKitView
} from '../services/pujaKitCatalogService';
import { track } from '../lib/analytics';

const FINDER_ID = 'puja-kit-finder';

// /puja-kits — the dedicated Puja Kits landing page (Discover → Choose kit / occasion → See what's inside → Trust → Buy →
// Perform → Pandit support). Same reusable, data-driven pattern as /rudraksha and /bracelets: kits, types, occasions and
// budgets all come from pujaKitCatalogService.ts (which reads data/categories.ts), so a new kit, kit type or festival is a
// data change, never a redesign. /collections/puja-kits stays the generic listing (CategoryPage), same split as
// /rudraksha vs /collections/rudraksha.
//
// Filters live in the URL (?type=…&occasion=…&budget=…&sort=…) — a single source of truth that also lets the menu, the home
// page or a WhatsApp share deep-link straight into a filtered view.
export const PujaKitsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  const [kits, setKits] = useState<PujaKitView[] | null>(null);

  const filters = useMemo(() => filtersFromParams(searchParams), [searchParams]);

  // Load the catalog once for the whole page (one network call once Shopify is connected).
  useEffect(() => {
    let isMounted = true;
    getPujaKits().then((result) => {
      if (isMounted) setKits(result);
    });
    return () => {
      isMounted = false;
    };
  }, []);

  // Tab title for this page only; restored on leave.
  useEffect(() => {
    const previous = document.title;
    document.title = 'Puja Kits – Complete Puja Samagri Kits | Veda Store';
    return () => {
      document.title = previous;
    };
  }, []);

  const scrollToId = useCallback((id: string) => {
    requestAnimationFrame(() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
  }, []);

  const updateFilters = useCallback(
    (patch: Partial<PujaKitFilters>) => {
      setSearchParams(filtersToParams({ ...filters, ...patch }), { replace: true });
    },
    [filters, setSearchParams]
  );

  const resetFilters = useCallback(() => {
    setSearchParams({}, { replace: true });
  }, [setSearchParams]);

  // A tile elsewhere on the page starts a fresh search on that one axis, then brings the finder into view.
  const selectType = useCallback(
    (type: string) => {
      track('puja_click', { source: 'puja_kits_type', id: type });
      updateFilters({ ...DEFAULT_FILTERS, sort: filters.sort, type });
      scrollToId(FINDER_ID);
    },
    [filters.sort, scrollToId, updateFilters]
  );

  const selectOccasion = useCallback(
    (occasion: string) => {
      track('puja_click', { source: 'puja_kits_occasion', id: occasion });
      updateFilters({ ...DEFAULT_FILTERS, sort: filters.sort, occasion });
      scrollToId(FINDER_ID);
    },
    [filters.sort, scrollToId, updateFilters]
  );

  const scrollToFinder = useCallback(() => {
    track('finder_start', { source: 'puja_kits' });
    scrollToId(FINDER_ID);
  }, [scrollToId]);

  // Arriving via a deep link (menu, shared URL, #anchor): bring the right section into view once the kits have loaded.
  // Chip clicks inside the finder never re-scroll, because the finder is already on screen then.
  useEffect(() => {
    if (!kits) return;
    const targetId = location.hash ? location.hash.slice(1) : hasActiveFilters(filters) ? FINDER_ID : null;
    if (!targetId) return;
    const timer = window.setTimeout(() => {
      const el = document.getElementById(targetId);
      if (!el) return;
      const { top, bottom } = el.getBoundingClientRect();
      const alreadyVisible = top < window.innerHeight * 0.6 && bottom > 0;
      if (!alreadyVisible) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 80);
    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kits, location.hash, location.search]);

  const loaded = kits ?? [];

  return (
    <div className="bg-vedic-ivory">
      <PujaKitHero onFindKitClick={scrollToFinder} />
      <PujaKitTrustBar />
      <PujaKitTypeNav kits={loaded} activeType={filters.type} onSelect={selectType} />
      <PujaKitOccasions kits={loaded} activeOccasion={filters.occasion} onSelect={selectOccasion} />
      <PujaKitBestsellers kits={loaded} />
      <PujaKitFinder kits={loaded} loading={kits === null} filters={filters} onChange={updateFilters} onReset={resetFilters} />
      <PujaKitInside kits={loaded} />
      <PujaKitHowItWorks />
      <PujaKitPurposes />
      <PujaKitSamagri />
      <PujaKitPanditCTA />
      <PujaKitWhy />
      <PujaKitReviews />
      <PujaKitFAQ />
      <PujaKitLearnHub />
      <PujaKitFinalCTA onFindKitClick={scrollToFinder} />
    </div>
  );
};

export default PujaKitsPage;
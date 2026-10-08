import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
import { YantraHero } from '../components/YantraHero';
import { YantraTrustBar } from '../components/YantraTrustBar';
import { YantraTypeNav } from '../components/YantraTypeNav';
import { YantraPurposes } from '../components/YantraPurposes';
import { YantraBestsellers } from '../components/YantraBestsellers';
import { YantraFinder } from '../components/YantraFinder';
import { YantraExplorer } from '../components/YantraExplorer';
import { YantraMaterials } from '../components/YantraMaterials';
import { YantraHowItWorks } from '../components/YantraHowItWorks';
import { YantraEnergizationCTA } from '../components/YantraEnergizationCTA';
import { YantraWhy } from '../components/YantraWhy';
import { YantraReviews } from '../components/YantraReviews';
import { YantraFAQ } from '../components/YantraFAQ';
import { YantraLearnHub } from '../components/YantraLearnHub';
import { YantraFinalCTA } from '../components/YantraFinalCTA';
import {
  DEFAULT_FILTERS,
  filtersFromParams,
  filtersToParams,
  getYantras,
  hasActiveFilters,
  type YantraFilters,
  type YantraView
} from '../services/yantraCatalogService';
import { track } from '../lib/analytics';

const FINDER_ID = 'yantra-finder';

// /yantra — the dedicated Yantra landing page (Discover → Choose yantra / purpose / material → Placement & worship →
// Trust → Buy → Energization & pandit support). Same reusable, data-driven pattern as /rudraksha, /bracelets and
// /puja-kits: yantras, types, purposes, materials and budgets all come from yantraCatalogService.ts (demo catalog
// until Shopify is connected, then the Shopify `yantra` collection), so a new yantra, type or material is a data
// change, never a redesign. /collections/yantra stays the generic listing (CategoryPage).
//
// Filters live in the URL (?type=…&purpose=…&material=…&budget=…&sort=…) — a single source of truth that also lets the
// menu, the home page or a WhatsApp share deep-link straight into a filtered view.
export const YantraPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  const [yantras, setYantras] = useState<YantraView[] | null>(null);

  const filters = useMemo(() => filtersFromParams(searchParams), [searchParams]);

  // Load the catalog once for the whole page (one network call once Shopify is connected).
  useEffect(() => {
    let isMounted = true;
    getYantras().then((result) => {
      if (isMounted) setYantras(result);
    });
    return () => {
      isMounted = false;
    };
  }, []);

  // Tab title for this page only; restored on leave.
  useEffect(() => {
    const previous = document.title;
    document.title = 'Yantras – Sacred Shree, Kuber & Navgraha Yantras | Veda Store';
    return () => {
      document.title = previous;
    };
  }, []);

  const scrollToId = useCallback((id: string) => {
    requestAnimationFrame(() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
  }, []);

  const updateFilters = useCallback(
    (patch: Partial<YantraFilters>) => {
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
      track('product_click', { source: 'yantra_type', id: type });
      updateFilters({ ...DEFAULT_FILTERS, sort: filters.sort, type });
      scrollToId(FINDER_ID);
    },
    [filters.sort, scrollToId, updateFilters]
  );

  const selectPurpose = useCallback(
    (purpose: string) => {
      track('purpose_click', { source: 'yantra_purpose', id: purpose });
      updateFilters({ ...DEFAULT_FILTERS, sort: filters.sort, purpose });
      scrollToId(FINDER_ID);
    },
    [filters.sort, scrollToId, updateFilters]
  );

  const selectMaterial = useCallback(
    (material: string) => {
      track('product_click', { source: 'yantra_material', id: material });
      updateFilters({ ...DEFAULT_FILTERS, sort: filters.sort, material });
      scrollToId(FINDER_ID);
    },
    [filters.sort, scrollToId, updateFilters]
  );

  const scrollToFinder = useCallback(() => {
    track('finder_start', { source: 'yantra' });
    scrollToId(FINDER_ID);
  }, [scrollToId]);

  // Arriving via a deep link (menu, shared URL, #anchor): bring the right section into view once the yantras have loaded.
  // Chip clicks inside the finder never re-scroll, because the finder is already on screen then.
  useEffect(() => {
    if (!yantras) return;
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
  }, [yantras, location.hash, location.search]);

  const loaded = yantras ?? [];

  return (
    <div className="bg-vedic-ivory">
      <YantraHero onFindYantraClick={scrollToFinder} />
      <YantraTrustBar />
      <YantraTypeNav yantras={loaded} activeType={filters.type} onSelect={selectType} />
      <YantraPurposes yantras={loaded} activePurpose={filters.purpose} onSelect={selectPurpose} />
      <YantraBestsellers yantras={loaded} />
      <YantraFinder yantras={loaded} loading={yantras === null} filters={filters} onChange={updateFilters} onReset={resetFilters} />
      <YantraExplorer yantras={loaded} />
      <YantraMaterials yantras={loaded} activeMaterial={filters.material} onSelect={selectMaterial} />
      <YantraHowItWorks />
      <YantraEnergizationCTA />
      <YantraWhy />
      <YantraReviews />
      <YantraFAQ />
      <YantraLearnHub />
      <YantraFinalCTA onFindYantraClick={scrollToFinder} />
    </div>
  );
};

export default YantraPage;
import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, RotateCcw, SlidersHorizontal } from 'lucide-react';
import {
  BUDGET_RANGES,
  SORT_OPTIONS,
  buildOccasionTiles,
  buildTypeTiles,
  filterPujaKits,
  hasActiveFilters,
  type PujaKitFilters,
  type PujaKitView,
  type PujaSortKey
} from '../services/pujaKitCatalogService';
import { PujaKitCard } from './PujaKitCard';
import { PujaKitSectionHeading } from './PujaKitSectionHeading';

export interface PujaKitFinderProps {
  kits: PujaKitView[];
  loading: boolean;
  filters: PujaKitFilters;
  onChange: (patch: Partial<PujaKitFilters>) => void;
  onReset: () => void;
}

const Chip: React.FC<{ active: boolean; onClick: () => void; children: React.ReactNode }> = ({ active, onClick, children }) => (
  <button
    type="button"
    onClick={onClick}
    aria-pressed={active}
    className={`shrink-0 px-3.5 py-2 rounded-full text-xs sm:text-[13px] font-semibold border transition-colors whitespace-nowrap ${
      active
        ? 'bg-vedic-gold text-vedic-dark border-vedic-gold shadow-sm'
        : 'bg-white text-vedic-charcoal border-vedic-gold/25 hover:border-vedic-gold/60'
    }`}
  >
    {children}
  </button>
);

const FilterRow: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div>
    <p className="text-[11px] font-bold tracking-[0.12em] text-vedic-muted uppercase mb-2">{label}</p>
    {/* one scrolling line on phones (saves height), wrapping chips from sm up */}
    <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-4 px-4 pb-1 sm:mx-0 sm:px-0 sm:flex-wrap sm:overflow-visible">{children}</div>
  </div>
);

/** Section 6: "Find Your Puja Kit" — the working finder. Kit type × occasion × budget × sort, all live, all URL-synced
 *  (so a filtered view can be shared or linked from the menu). Chips are built from the catalog, so nothing here needs
 *  editing when kits, types or occasions are added. */
export const PujaKitFinder: React.FC<PujaKitFinderProps> = ({ kits, loading, filters, onChange, onReset }) => {
  const typeTiles = useMemo(() => buildTypeTiles(kits).filter((t) => t.count > 0), [kits]);
  const occasionTiles = useMemo(() => buildOccasionTiles(kits).filter((t) => t.count > 0), [kits]);
  const budgets = useMemo(
    () => BUDGET_RANGES.filter((b) => kits.some((k) => k.product.price >= b.min && k.product.price <= b.max)),
    [kits]
  );
  const results = useMemo(() => filterPujaKits(kits, filters), [kits, filters]);
  const active = hasActiveFilters(filters);

  return (
    <section id="puja-kit-finder" className="bg-white scroll-mt-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <PujaKitSectionHeading
          align="center"
          eyebrow="Find Your Puja Kit"
          title="Not Sure Which Kit You Need?"
          subtitle="Choose the puja, the occasion and your budget — the kits update instantly."
        />

        <div className="rounded-3xl border border-vedic-gold/20 bg-vedic-ivory p-4 sm:p-6 space-y-4 sm:space-y-5 mb-6 sm:mb-8">
          <FilterRow label="Puja Kit">
            <Chip active={filters.type === 'all'} onClick={() => onChange({ type: 'all' })}>All Kits</Chip>
            {typeTiles.map((t) => (
              <Chip key={t.slug} active={filters.type === t.slug} onClick={() => onChange({ type: t.slug })}>
                {t.title}
              </Chip>
            ))}
          </FilterRow>
          <FilterRow label="Occasion">
            <Chip active={filters.occasion === 'all'} onClick={() => onChange({ occasion: 'all' })}>Any Occasion</Chip>
            {occasionTiles.map((o) => (
              <Chip key={o.id} active={filters.occasion === o.id} onClick={() => onChange({ occasion: o.id })}>
                {o.name}
              </Chip>
            ))}
          </FilterRow>
          <FilterRow label="Budget">
            <Chip active={filters.budget === 'all'} onClick={() => onChange({ budget: 'all' })}>Any Budget</Chip>
            {budgets.map((b) => (
              <Chip key={b.id} active={filters.budget === b.id} onClick={() => onChange({ budget: b.id })}>
                {b.label}
              </Chip>
            ))}
          </FilterRow>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 mb-4 sm:mb-6">
          <p className="text-sm text-vedic-muted" aria-live="polite">
            {loading ? 'Loading kits…' : (
              <>
                Showing <span className="font-bold text-vedic-dark">{results.length}</span> {results.length === 1 ? 'kit' : 'kits'}
              </>
            )}
          </p>
          <div className="flex items-center gap-3">
            {active && (
              <button type="button" onClick={onReset} className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-vedic-goldDeep hover:text-vedic-maroon transition-colors">
                <RotateCcw className="w-3.5 h-3.5" /> Clear filters
              </button>
            )}
            <label className="inline-flex items-center gap-2 text-xs sm:text-sm text-vedic-muted">
              <SlidersHorizontal className="w-4 h-4 text-vedic-goldDeep" />
              <span className="sr-only sm:not-sr-only">Sort</span>
              <select
                value={filters.sort}
                onChange={(e) => onChange({ sort: e.target.value as PujaSortKey })}
                className="rounded-full border border-vedic-gold/30 bg-white px-3 py-1.5 text-xs sm:text-sm font-semibold text-vedic-dark focus:outline-none focus:border-vedic-gold"
              >
                {SORT_OPTIONS.map((s) => (
                  <option key={s.id} value={s.id}>{s.label}</option>
                ))}
              </select>
            </label>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6" aria-hidden="true">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="rounded-2xl border border-vedic-gold/15 bg-vedic-ivory animate-pulse aspect-[3/4]" />
            ))}
          </div>
        ) : results.length === 0 ? (
          <div className="rounded-3xl border border-vedic-gold/20 bg-vedic-ivory p-8 sm:p-12 text-center">
            <h3 className="font-serif font-bold text-lg sm:text-xl text-vedic-dark mb-2">
              {kits.length === 0 ? 'Puja kits are coming soon' : 'No kit matches these filters yet'}
            </h3>
            <p className="text-sm text-vedic-muted max-w-md mx-auto mb-5">
              {kits.length === 0
                ? 'We are preparing new kits. Tell us which puja you are planning and we will help you.'
                : 'Try a different occasion or budget — or tell us what you need and we will help you put a kit together.'}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              {active && (
                <button type="button" onClick={onReset} className="w-full sm:w-auto px-6 py-3 rounded-full bg-vedic-gold hover:bg-vedic-goldDark text-vedic-dark text-sm font-bold transition-colors">
                  Clear Filters
                </button>
              )}
              <Link to="/contact?subject=Puja%20Kit%20Enquiry" className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full border border-vedic-goldDeep/40 text-vedic-dark text-sm font-bold hover:bg-white transition-colors">
                Ask for a Custom Kit <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6 items-start">
            {results.map((kit) => (
              <PujaKitCard key={kit.product.id} kit={kit} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, RotateCcw, SlidersHorizontal } from 'lucide-react';
import {
  BUDGET_RANGES,
  SORT_OPTIONS,
  buildMaterialTiles,
  buildPurposeTiles,
  buildTypeTiles,
  filterYantras,
  hasActiveFilters,
  type YantraFilters,
  type YantraSortKey,
  type YantraView
} from '../services/yantraCatalogService';
import { YantraCard } from './YantraCard';
import { YantraSectionHeading } from './YantraSectionHeading';

export interface YantraFinderProps {
  yantras: YantraView[];
  loading: boolean;
  filters: YantraFilters;
  onChange: (patch: Partial<YantraFilters>) => void;
  onReset: () => void;
}

const Chip: React.FC<{ active: boolean; onClick: () => void; children: React.ReactNode }> = ({ active, onClick, children }) => (
  <button
    type="button"
    onClick={onClick}
    aria-pressed={active}
    className={`shrink-0 px-3.5 py-2 rounded-full text-xs sm:text-[13px] font-semibold border transition-colors whitespace-nowrap ${
      active ? 'bg-vedic-gold text-vedic-dark border-vedic-gold shadow-sm' : 'bg-white text-vedic-charcoal border-vedic-gold/25 hover:border-vedic-gold/60'
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

/** Section 6: "Find Your Yantra" — the working finder. Yantra × purpose × material × budget × sort, all live, all
 *  URL-synced (so a filtered view can be shared or linked from the menu). Chips are built from the catalog, so nothing
 *  here needs editing when yantras, types, purposes or materials are added. */
export const YantraFinder: React.FC<YantraFinderProps> = ({ yantras, loading, filters, onChange, onReset }) => {
  const typeTiles = useMemo(() => buildTypeTiles(yantras).filter((t) => t.count > 0), [yantras]);
  const purposeTiles = useMemo(() => buildPurposeTiles(yantras).filter((t) => t.count > 0), [yantras]);
  const materialTiles = useMemo(() => buildMaterialTiles(yantras).filter((t) => t.count > 0), [yantras]);
  const budgets = useMemo(
    () => BUDGET_RANGES.filter((b) => yantras.some((y) => y.product.price >= b.min && y.product.price <= b.max)),
    [yantras]
  );
  const results = useMemo(() => filterYantras(yantras, filters), [yantras, filters]);
  const active = hasActiveFilters(filters);

  return (
    <section id="yantra-finder" className="bg-white scroll-mt-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <YantraSectionHeading
          align="center"
          eyebrow="Find Your Yantra"
          title="Not Sure Which Yantra You Need?"
          subtitle="Choose the yantra, the purpose, the material and your budget — the results update instantly."
        />

        <div className="rounded-3xl border border-vedic-gold/20 bg-vedic-ivory p-4 sm:p-6 space-y-4 sm:space-y-5 mb-6 sm:mb-8">
          <FilterRow label="Yantra">
            <Chip active={filters.type === 'all'} onClick={() => onChange({ type: 'all' })}>All Yantras</Chip>
            {typeTiles.map((t) => (
              <Chip key={t.slug} active={filters.type === t.slug} onClick={() => onChange({ type: t.slug })}>
                {t.title}
              </Chip>
            ))}
          </FilterRow>
          <FilterRow label="Purpose">
            <Chip active={filters.purpose === 'all'} onClick={() => onChange({ purpose: 'all' })}>Any Purpose</Chip>
            {purposeTiles.map((p) => (
              <Chip key={p.id} active={filters.purpose === p.id} onClick={() => onChange({ purpose: p.id })}>
                {p.name}
              </Chip>
            ))}
          </FilterRow>
          <FilterRow label="Material">
            <Chip active={filters.material === 'all'} onClick={() => onChange({ material: 'all' })}>Any Material</Chip>
            {materialTiles.map((m) => (
              <Chip key={m.id} active={filters.material === m.id} onClick={() => onChange({ material: m.id })}>
                {m.name}
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
            {loading ? 'Loading yantras…' : (
              <>
                Showing <span className="font-bold text-vedic-dark">{results.length}</span> {results.length === 1 ? 'yantra' : 'yantras'}
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
                onChange={(e) => onChange({ sort: e.target.value as YantraSortKey })}
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
              {yantras.length === 0 ? 'Yantras are coming soon' : 'No yantra matches these filters yet'}
            </h3>
            <p className="text-sm text-vedic-muted max-w-md mx-auto mb-5">
              {yantras.length === 0
                ? 'We are preparing our yantra collection. Tell us which yantra you are looking for and we will help you.'
                : 'Try a different purpose, material or budget — or tell us what you need and we will help you find it.'}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              {active && (
                <button type="button" onClick={onReset} className="w-full sm:w-auto px-6 py-3 rounded-full bg-vedic-gold hover:bg-vedic-goldDark text-vedic-dark text-sm font-bold transition-colors">
                  Clear Filters
                </button>
              )}
              <Link to="/contact?subject=Yantra%20Enquiry" className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full border border-vedic-goldDeep/40 text-vedic-dark text-sm font-bold hover:bg-white transition-colors">
                Ask for a Yantra <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6 items-start">
            {results.map((yantra) => (
              <YantraCard key={yantra.product.id} yantra={yantra} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
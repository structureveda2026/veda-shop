import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Check, Compass, Copy } from 'lucide-react';
import { getExplorerYantras, getMaterialName, type YantraView } from '../services/yantraCatalogService';
import { AddToCartControl } from './AddToCartControl';
import { YantraSectionHeading } from './YantraSectionHeading';

const shortLabel = (title: string) => title.replace(/\s*Yantra\s*/i, ' ').replace(/\s+/g, ' ').trim();

/** Section 7: "Placement & Worship" — pick a yantra, see its dedicated deity, direction, day and mantra. Reads each
 *  yantra's own metafields, so a new yantra with a mantra filled in appears here automatically. */
export const YantraExplorer: React.FC<{ yantras: YantraView[] }> = ({ yantras }) => {
  const options = useMemo(() => getExplorerYantras(yantras, 8), [yantras]);
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const selected = options.find((y) => y.product.slug === selectedSlug) ?? options[0];
  if (!selected) return null;

  const { product, meta, typeName } = selected;
  const inStock = product.stock > 0;
  const materialName = getMaterialName(meta.material, product.material ?? '');

  const facts = [
    { label: 'Dedicated to', value: meta.deity },
    { label: 'Material', value: materialName },
    { label: 'Size', value: meta.size },
    { label: 'Best day to begin', value: meta.day },
    { label: 'Direction', value: meta.direction }
  ].filter((f) => f.value);

  const copyMantra = async () => {
    try {
      await navigator.clipboard.writeText(meta.mantra);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard blocked (e.g. non-secure context) — the mantra stays visible to read */
    }
  };

  return (
    <section id="yantra-worship" className="bg-vedic-ivory scroll-mt-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <YantraSectionHeading
          align="center"
          eyebrow="Placement & Worship"
          title="Know Where to Place It and What to Chant"
          subtitle="The traditional direction, day and mantra for each yantra — listed up front."
        />

        <div role="tablist" aria-label="Choose a yantra" className="flex gap-2 overflow-x-auto no-scrollbar -mx-4 px-4 pb-1 sm:mx-0 sm:px-0 sm:flex-wrap sm:justify-center mb-6">
          {options.map((y) => {
            const active = y.product.slug === product.slug;
            return (
              <button
                key={y.product.id}
                role="tab"
                aria-selected={active}
                onClick={() => {
                  setSelectedSlug(y.product.slug);
                  setCopied(false);
                }}
                className={`shrink-0 px-4 py-2 rounded-full text-xs sm:text-[13px] font-semibold border whitespace-nowrap transition-colors ${
                  active ? 'bg-vedic-gold text-vedic-dark border-vedic-gold shadow-sm' : 'bg-white text-vedic-charcoal border-vedic-gold/25 hover:border-vedic-gold/60'
                }`}
              >
                {shortLabel(y.product.title)}
              </button>
            );
          })}
        </div>

        <div role="tabpanel" className="bg-white rounded-3xl border border-vedic-gold/20 shadow-card overflow-hidden grid md:grid-cols-[minmax(0,320px)_1fr]">
          <div className="p-5 sm:p-6 bg-vedic-card/60 border-b md:border-b-0 md:border-r border-vedic-gold/15 flex flex-col">
            <div className="aspect-square rounded-2xl overflow-hidden bg-white border border-vedic-gold/15 mb-4 max-w-[260px] w-full mx-auto md:max-w-none">
              <img
                src={product.images[0]}
                alt={product.title}
                loading="lazy"
                className="w-full h-full object-cover"
                onError={(e) => {
                  const fb = product.images[product.images.length - 1];
                  if (fb && e.currentTarget.getAttribute('src') !== fb) e.currentTarget.src = fb;
                }}
              />
            </div>
            <p className="text-[11px] font-bold tracking-[0.12em] text-vedic-goldDeep uppercase mb-1">{typeName}</p>
            <h3 className="font-serif font-bold text-vedic-dark text-xl leading-snug mb-3">{product.title}</h3>

            <div className="flex items-baseline gap-2 mb-4">
              <span className="text-xl font-extrabold text-vedic-dark">₹{product.price.toLocaleString('en-IN')}</span>
              {product.compareAtPrice > product.price && (
                <span className="text-sm text-vedic-muted line-through">₹{product.compareAtPrice.toLocaleString('en-IN')}</span>
              )}
            </div>

            <div className="mt-auto flex flex-col gap-2">
              <AddToCartControl product={product} disabled={!inStock} size="cta" label="Add Yantra to Cart" disabledLabel="Sold Out" className="w-full justify-center" />
              <Link to={`/products/${product.slug}`} className="inline-flex items-center justify-center gap-1.5 text-sm font-semibold text-vedic-goldDeep hover:text-vedic-maroon transition-colors py-1.5">
                View Yantra Details <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          <div className="p-5 sm:p-8">
            <h4 className="flex items-center gap-2 font-serif font-semibold text-vedic-dark text-lg mb-4">
              <Compass className="w-5 h-5 text-vedic-goldDeep" strokeWidth={1.5} />
              Traditional placement &amp; worship
            </h4>

            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
              {facts.map((f) => (
                <div key={f.label} className="rounded-xl bg-vedic-ivory border border-vedic-gold/15 px-4 py-3">
                  <dt className="text-[11px] font-bold tracking-[0.1em] uppercase text-vedic-muted">{f.label}</dt>
                  <dd className="text-sm font-semibold text-vedic-dark mt-0.5">{f.value}</dd>
                </div>
              ))}
            </dl>

            <div className="rounded-2xl border border-vedic-gold/30 bg-gradient-to-br from-vedic-card via-white to-vedic-card p-4 sm:p-5">
              <div className="flex items-center justify-between gap-3 mb-2">
                <p className="text-[11px] font-bold tracking-[0.12em] uppercase text-vedic-goldDeep">Mantra</p>
                <button
                  type="button"
                  onClick={copyMantra}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-vedic-goldDeep hover:text-vedic-maroon transition-colors"
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? 'Copied' : 'Copy'}
                </button>
              </div>
              <p className="font-serif text-base sm:text-lg text-vedic-dark leading-relaxed">{meta.mantra}</p>
            </div>

            {meta.includes.length > 0 && (
              <p className="text-xs text-vedic-muted mt-4">
                <span className="font-semibold text-vedic-dark">In the box:</span> {meta.includes.join(' · ')}
              </p>
            )}

            <p className="text-[11px] text-vedic-muted mt-6 pt-4 border-t border-vedic-beige">
              Directions, days and mantras follow common tradition and can vary by family or lineage — please confirm with your pandit if you follow a specific practice.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
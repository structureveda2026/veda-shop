import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Check, Package } from 'lucide-react';
import { getKitsWithContents, type PujaKitView } from '../services/pujaKitCatalogService';
import { AddToCartControl } from './AddToCartControl';
import { PujaKitSectionHeading } from './PujaKitSectionHeading';

/** Section 7: "What's Inside a Puja Kit" — pick a kit, see its full samagri checklist. Reads each kit's own
 *  `custom.kit_contents` list, so a new kit with contents filled in appears here automatically. */
export const PujaKitInside: React.FC<{ kits: PujaKitView[] }> = ({ kits }) => {
  const options = useMemo(() => getKitsWithContents(kits, 6), [kits]);
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const selected = options.find((k) => k.product.slug === selectedSlug) ?? options[0];
  if (!selected) return null;

  const { product, meta, typeName } = selected;
  const inStock = product.stock > 0;

  return (
    <section id="whats-inside" className="bg-vedic-ivory scroll-mt-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <PujaKitSectionHeading
          align="center"
          eyebrow="What's Inside"
          title="See Exactly What Comes in Your Kit"
          subtitle="Every item is listed up front, so you know what you are getting."
        />

        <div role="tablist" aria-label="Choose a kit" className="flex gap-2 overflow-x-auto no-scrollbar -mx-4 px-4 pb-1 sm:mx-0 sm:px-0 sm:flex-wrap sm:justify-center mb-6">
          {options.map((k) => {
            const active = k.product.slug === product.slug;
            return (
              <button
                key={k.product.id}
                role="tab"
                aria-selected={active}
                onClick={() => setSelectedSlug(k.product.slug)}
                className={`shrink-0 px-4 py-2 rounded-full text-xs sm:text-[13px] font-semibold border whitespace-nowrap transition-colors ${
                  active ? 'bg-vedic-gold text-vedic-dark border-vedic-gold shadow-sm' : 'bg-white text-vedic-charcoal border-vedic-gold/25 hover:border-vedic-gold/60'
                }`}
              >
                {k.product.title.replace(/\s*Puja\s*Kit$/i, '').replace(/\s*Kit$/i, '')}
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
            <h3 className="font-serif font-bold text-vedic-dark text-xl leading-snug mb-1">{product.title}</h3>
            {meta.deity && <p className="text-xs text-vedic-muted mb-3">{meta.deity}{meta.serves ? ` · ${meta.serves}` : ''}</p>}

            <div className="flex items-baseline gap-2 mb-4">
              <span className="text-xl font-extrabold text-vedic-dark">₹{product.price.toLocaleString('en-IN')}</span>
              {product.compareAtPrice > product.price && (
                <span className="text-sm text-vedic-muted line-through">₹{product.compareAtPrice.toLocaleString('en-IN')}</span>
              )}
            </div>

            <div className="mt-auto flex flex-col gap-2">
              <AddToCartControl product={product} disabled={!inStock} size="cta" label="Add Kit to Cart" disabledLabel="Sold Out" className="w-full justify-center" />
              <Link to={`/products/${product.slug}`} className="inline-flex items-center justify-center gap-1.5 text-sm font-semibold text-vedic-goldDeep hover:text-vedic-maroon transition-colors py-1.5">
                View Kit Details <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          <div className="p-5 sm:p-8">
            <h4 className="flex items-center gap-2 font-serif font-semibold text-vedic-dark text-lg mb-4">
              <Package className="w-5 h-5 text-vedic-goldDeep" strokeWidth={1.5} />
              {meta.contents.length} items in this kit
            </h4>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2.5">
              {meta.contents.map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-sm text-vedic-charcoal">
                  <span className="mt-0.5 w-5 h-5 rounded-full bg-vedic-gold/20 flex items-center justify-center shrink-0">
                    <Check className="w-3 h-3 text-vedic-goldDeep" strokeWidth={2.5} />
                  </span>
                  {item}
                </li>
              ))}
            </ul>
            <p className="text-[11px] text-vedic-muted mt-6 pt-4 border-t border-vedic-beige">
              Fresh items such as flowers, fruits, milk and curd are best bought fresh on the day of the puja. Exact contents are always listed on the kit&apos;s product page.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
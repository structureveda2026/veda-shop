import type { Product } from '../types/ecommerce';
import type { ShopifyProductOption, ShopifyVariantDetail } from './shopify';
import { resolveDiscount } from './pricing';

/**
 * Purchase options on a Rudraksha page — Type (Only Bead / Silver Pendant), X-Ray Tested, Lab Certificate…
 *
 * They come straight from the product's OPTIONS in Shopify admin, so the price the customer sees and the
 * price Shopify charges are always the same one — every combination is a Shopify variant with its own price:
 *
 *   • an option with two values other than Yes/No (e.g. Only Bead / Silver Pendant) → pick ONE (radio)
 *   • an option whose values are Yes and No (e.g. "X-Ray Tested", "Lab Certificate") → tick box (checkbox)
 *
 * The "+₹500" shown next to X-Ray Tested is simply (price of the Yes variant − price of the No variant),
 * i.e. whatever the admin set in Shopify. A free option (Lab Certificate) has the same price both ways.
 */
export type OptionDef = ShopifyProductOption;
export type OptionVariant = ShopifyVariantDetail;
/** option name → chosen value */
export type Selection = Record<string, string>;

const norm = (v: string) => v.trim().toLowerCase();
const isYes = (v: string) => norm(v) === 'yes';
const isNo = (v: string) => norm(v) === 'no';

export const isToggleOption = (o: OptionDef): boolean =>
  o.values.length === 2 && o.values.some(isYes) && o.values.some(isNo);

/** Shopify gives a product with no options a hidden "Title: Default Title" option — never show that one. */
export const visibleOptions = (options: OptionDef[]): OptionDef[] =>
  options.filter((o) => !(o.name === 'Title' && o.values.length === 1 && o.values[0] === 'Default Title'));

export const findVariant = (variants: OptionVariant[], selection: Selection): OptionVariant | undefined =>
  variants.find((v) => Object.entries(selection).every(([name, value]) => v.options[name] === value));

/** No boxes ticked and the first value of every other option; if that isn't on sale, the first variant that is. */
export function defaultSelection(options: OptionDef[], variants: OptionVariant[]): Selection {
  const shown = visibleOptions(options);
  const selection: Selection = {};
  for (const o of shown) selection[o.name] = isToggleOption(o) ? (o.values.find(isNo) as string) : o.values[0];
  if (findVariant(variants, selection)?.availableForSale) return selection;

  const fallback = variants.find((v) => v.availableForSale) ?? variants[0];
  if (!fallback) return selection;
  return Object.fromEntries(shown.map((o) => [o.name, fallback.options[o.name] ?? selection[o.name]]));
}

/** "Silver Pendant • X-Ray Tested" — what the cart shows for the line, and what tells one combination's line from another's. */
export function selectionLabel(options: OptionDef[], selection: Selection): string {
  const parts: string[] = [];
  for (const o of visibleOptions(options)) {
    const value = selection[o.name];
    if (!value) continue;
    if (isToggleOption(o)) {
      if (isYes(value)) parts.push(o.name);
    } else {
      parts.push(value);
    }
  }
  return parts.join(' • ');
}

/** Price of the combination you'd get by changing just `name` to `value` (null if no such variant exists). */
export function priceWith(variants: OptionVariant[], selection: Selection, name: string, value: string): number | null {
  return findVariant(variants, { ...selection, [name]: value })?.price ?? null;
}

/** Extra cost of ticking a Yes/No option, with everything else as currently chosen (null if unknown). */
export function toggleExtra(variants: OptionVariant[], selection: Selection, option: OptionDef): number | null {
  const yes = option.values.find(isYes) as string;
  const no = option.values.find(isNo) as string;
  const withIt = priceWith(variants, selection, option.name, yes);
  const without = priceWith(variants, selection, option.name, no);
  return withIt === null || without === null ? null : withIt - without;
}

export const isYesValue = isYes;

// ---------------------------------------------------------------------------
// Demo options — used only while Shopify isn't connected, so the page can be seen and tried.
// With Shopify on, none of this is used: the options and prices come from the product's variants.
// ---------------------------------------------------------------------------

/** PLACEHOLDER demo prices (₹ added on top of the bead's price). X-Ray Tested is ₹500 extra; the silver
 *  pendant figure is only a stand-in until real prices come from Shopify. */
export const DEMO_EXTRA_PRICE = { silverPendant: 700, xrayTested: 500, labCertificate: 0 };

export function buildDemoOptions(product: Product): { options: OptionDef[]; variants: OptionVariant[] } {
  const options: OptionDef[] = [
    { name: 'Type', values: ['Only Bead', 'Silver Pendant'] },
    { name: 'X-Ray Tested', values: ['No', 'Yes'] },
    { name: 'Lab Certificate', values: ['No', 'Yes'] },
  ];
  const variants: OptionVariant[] = [];
  for (const type of options[0].values) {
    for (const xray of options[1].values) {
      for (const cert of options[2].values) {
        const price =
          product.price +
          (type === 'Silver Pendant' ? DEMO_EXTRA_PRICE.silverPendant : 0) +
          (isYes(xray) ? DEMO_EXTRA_PRICE.xrayTested : 0) +
          (isYes(cert) ? DEMO_EXTRA_PRICE.labCertificate : 0);
        // keep the same discount % as the bead so it doesn't jump around as options are ticked
        const compareAt = Math.round((price * product.compareAtPrice) / product.price);
        const pricing = resolveDiscount(price, compareAt);
        const selected = { Type: type, 'X-Ray Tested': xray, 'Lab Certificate': cert };
        variants.push({
          id: `demo:${product.slug}:${type}:${xray}:${cert}`,
          title: `${type} / ${xray} / ${cert}`,
          sku: product.sku,
          availableForSale: true,
          price: pricing.price,
          compareAtPrice: pricing.compareAtPrice,
          discountPercent: pricing.percent,
          currencyCode: 'INR',
          options: selected,
        });
      }
    }
  }
  return { options, variants };
}
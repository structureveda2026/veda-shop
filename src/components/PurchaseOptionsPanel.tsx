import React from 'react';
import { Check, Minus, Plus } from 'lucide-react';
import {
  OptionDef,
  OptionVariant,
  Selection,
  isToggleOption,
  isYesValue,
  priceWith,
  toggleExtra,
} from '../lib/purchaseOptions';

interface PurchaseOptionsPanelProps {
  /** Options to show (the hidden "Default Title" option already removed). */
  options: OptionDef[];
  variants: OptionVariant[];
  selection: Selection;
  onSelect: (name: string, value: string) => void;
  quantity: number;
  onQuantity: (quantity: number) => void;
  maxQuantity: number;
}

const rupees = (n: number) => `₹${n.toLocaleString('en-IN')}`;

/**
 * The purchase options on a Rudraksha page, laid out as a tidy block of equal-height rows (all 44px, same
 * corners and borders, two even columns from tablet up, one column on phones): pick one of the multi-value options (e.g. Only Bead / Silver Pendant),
 * tick the Yes/No add-ons (X-Ray Tested, Lab Certificate) and set the quantity.
 * Prices shown here are the Shopify variants' own prices — see src/lib/purchaseOptions.ts.
 */
export const PurchaseOptionsPanel: React.FC<PurchaseOptionsPanelProps> = ({
  options,
  variants,
  selection,
  onSelect,
  quantity,
  onQuantity,
  maxQuantity,
}) => {
  const choices = options.filter((o) => !isToggleOption(o));
  const addOns = options.filter(isToggleOption);

  const row = 'h-11 rounded-xl border px-3.5 flex items-center gap-2.5 text-xs font-bold transition-all';
  const idle = 'bg-vedic-ivory text-vedic-dark border-vedic-gold/30 hover:border-vedic-gold';

  return (
    <div className="space-y-2.5">
      {/* One-of options: Only Bead / Silver Pendant */}
      {choices.map((option) => (
        <div key={option.name} role="radiogroup" aria-label={option.name}>
          <span className="block mb-1.5 text-[11px] font-bold text-vedic-dark uppercase tracking-wider">{option.name}</span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {option.values.map((value) => {
              const selected = selection[option.name] === value;
              const price = priceWith(variants, selection, option.name, value);
              return (
                <button
                  key={value}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  onClick={() => onSelect(option.name, value)}
                  className={`${row} justify-between ${
                    selected ? 'bg-vedic-brown text-vedic-goldLight border-vedic-brown shadow-md' : idle
                  }`}
                >
                  <span className="truncate">{value}</span>
                  {price !== null && <span className="shrink-0 text-[11px] font-semibold opacity-80">{rupees(price)}</span>}
                </button>
              );
            })}
          </div>
        </div>
      ))}

      {/* Tick-box add-ons, two to a row: X-Ray Tested (+₹500), Lab Certificate (FREE) */}
      {addOns.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {addOns.map((option) => {
            const checked = isYesValue(selection[option.name] ?? '');
            const yes = option.values.find(isYesValue) as string;
            const no = option.values.find((v) => !isYesValue(v)) as string;
            const extra = toggleExtra(variants, selection, option);
            return (
              <button
                key={option.name}
                type="button"
                role="checkbox"
                aria-checked={checked}
                onClick={() => onSelect(option.name, checked ? no : yes)}
                className={`${row} ${checked ? 'bg-vedic-gold/10 border-vedic-gold shadow-sm text-vedic-dark' : idle}`}
              >
                <span
                  className={`w-5 h-5 shrink-0 rounded-md border flex items-center justify-center transition-colors ${
                    checked ? 'bg-vedic-maroon border-vedic-maroon text-vedic-goldLight' : 'bg-white border-vedic-gold/50'
                  }`}
                >
                  {checked && <Check className="w-3.5 h-3.5" strokeWidth={3} />}
                </span>
                <span className="flex-1 min-w-0 truncate text-left">{option.name}</span>
                {extra === 0 && <span className="shrink-0 text-[11px] font-extrabold text-emerald-700 tracking-wide">FREE</span>}
                {extra !== null && extra > 0 && (
                  <span className="shrink-0 text-xs font-extrabold text-vedic-maroon">+{rupees(extra)}</span>
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* Quantity — same row height as everything above */}
      <div className={`${row} justify-between ${idle} hover:border-vedic-gold/30`}>
        <span className="uppercase tracking-wider text-[11px]">Quantity</span>
        <div className="flex items-center text-vedic-maroon">
          <button
            type="button"
            onClick={() => onQuantity(Math.max(1, quantity - 1))}
            disabled={quantity <= 1}
            aria-label="Decrease quantity"
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-vedic-gold/15 disabled:text-vedic-muted disabled:cursor-not-allowed"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>
          <span aria-live="polite" aria-label={`Quantity ${quantity}`} className="w-9 text-center text-sm font-bold tabular-nums text-vedic-dark">
            {quantity}
          </span>
          <button
            type="button"
            onClick={() => onQuantity(Math.min(maxQuantity, quantity + 1))}
            disabled={quantity >= maxQuantity}
            aria-label="Increase quantity"
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-vedic-gold/15 disabled:text-vedic-muted disabled:cursor-not-allowed"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
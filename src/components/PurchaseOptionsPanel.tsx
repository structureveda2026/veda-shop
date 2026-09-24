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
 * Sits under the Add to Cart / Buy Now buttons on a Rudraksha page: pick one of the multi-value options
 * (e.g. Only Bead / Silver Pendant), tick the Yes/No add-ons (X-Ray Tested, Lab Certificate) and set the quantity.
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

  return (
    <div className="space-y-4 border-t border-vedic-beige pt-4">
      {/* One-of options: Only Bead / Silver Pendant */}
      {choices.map((option) => (
        <div key={option.name} role="radiogroup" aria-label={option.name} className="space-y-2">
          <span className="block text-xs font-bold text-vedic-dark uppercase tracking-wider">{option.name}</span>
          <div className="grid grid-cols-2 gap-2">
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
                  className={`py-2.5 px-3 rounded-xl border text-xs font-bold text-left transition-all ${
                    selected
                      ? 'bg-vedic-brown text-vedic-goldLight border-vedic-brown shadow-md'
                      : 'bg-vedic-ivory text-vedic-dark border-vedic-gold/30 hover:border-vedic-gold'
                  }`}
                >
                  <span className="block">{value}</span>
                  {price !== null && <span className="block mt-0.5 text-[11px] font-semibold opacity-80">{rupees(price)}</span>}
                </button>
              );
            })}
          </div>
        </div>
      ))}

      {/* Tick-box add-ons: X-Ray Tested (+₹500), Lab Certificate (FREE) */}
      {addOns.length > 0 && (
        <div className="space-y-2">
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
                className={`w-full flex items-center gap-3 py-2.5 px-3.5 rounded-xl border text-left transition-all ${
                  checked ? 'bg-vedic-gold/10 border-vedic-gold shadow-sm' : 'bg-vedic-ivory border-vedic-gold/30 hover:border-vedic-gold'
                }`}
              >
                <span
                  className={`w-5 h-5 shrink-0 rounded-md border flex items-center justify-center transition-colors ${
                    checked ? 'bg-vedic-maroon border-vedic-maroon text-vedic-goldLight' : 'bg-white border-vedic-gold/50'
                  }`}
                >
                  {checked && <Check className="w-3.5 h-3.5" strokeWidth={3} />}
                </span>
                <span className="flex-1 text-xs font-bold text-vedic-dark">{option.name}</span>
                {extra === 0 && <span className="text-[11px] font-extrabold text-emerald-700 tracking-wide">FREE</span>}
                {extra !== null && extra > 0 && (
                  <span className="text-xs font-extrabold text-vedic-maroon">+{rupees(extra)}</span>
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* Quantity */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-vedic-dark uppercase tracking-wider">Quantity</span>
        <div className="flex items-center rounded-full border border-vedic-gold/30 bg-vedic-ivory text-vedic-maroon">
          <button
            type="button"
            onClick={() => onQuantity(Math.max(1, quantity - 1))}
            disabled={quantity <= 1}
            aria-label="Decrease quantity"
            className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-vedic-gold/15 disabled:text-vedic-muted disabled:cursor-not-allowed"
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
            className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-vedic-gold/15 disabled:text-vedic-muted disabled:cursor-not-allowed"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
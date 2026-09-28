import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Wand2 } from 'lucide-react';

// Data-driven option groups (spec section 13) — a new bead/thread/metal option is a row here.
interface OptionGroup {
  id: string;
  label: string;
  options: string[];
}

const OPTION_GROUPS: OptionGroup[] = [
  { id: 'type', label: '1. Bracelet Type', options: ['Rudraksha', 'Gemstone', 'Crystal', 'Combination'] },
  { id: 'bead', label: '2. Bead / Material', options: ['5 Mukhi Rudraksha', 'Tiger Eye', 'Amethyst', 'Citrine', 'Clear Quartz', 'Other'] },
  { id: 'size', label: '3. Size', options: ['Small', 'Medium', 'Large', 'Custom Wrist Size'] },
  { id: 'thread', label: '4. Thread / Cord', options: ['Black', 'Red', 'Brown', 'Adjustable'] },
  { id: 'metal', label: '5. Metal', options: ['Silver', 'Gold finish', 'No metal'] },
  { id: 'energization', label: '6. Optional Energization', options: ['Yes', 'No'] }
];

/** Section 13 (spec): Create Your Own Bracelet. Selections are carried into the consultation
 *  request until a real customization checkout (Shopify line-item properties) is wired. */
export const BraceletPersonalize: React.FC = () => {
  const navigate = useNavigate();
  const [choices, setChoices] = useState<Record<string, string>>({});

  const submit = () => {
    const summary = OPTION_GROUPS.filter((g) => choices[g.id])
      .map((g) => `${g.label.replace(/^\d\.\s/, '')}: ${choices[g.id]}`)
      .join(', ');
    navigate(`/contact?subject=${encodeURIComponent('Custom Bracelet Request')}&message=${encodeURIComponent(summary)}`);
  };

  return (
    <section id="personalize-bracelet" className="bg-vedic-ivory">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="text-center mb-8">
          <p className="text-[11px] sm:text-xs font-bold tracking-[0.15em] text-vedic-goldDark uppercase mb-2 flex items-center justify-center gap-1.5">
            <Wand2 className="w-3.5 h-3.5" strokeWidth={1.5} /> Personalized
          </p>
          <h2 className="font-serif font-semibold text-vedic-dark text-2xl sm:text-3xl">Create Your Own Bracelet</h2>
        </div>

        <div className="bg-white border border-vedic-gold/20 rounded-3xl p-5 sm:p-8 shadow-card space-y-5">
          {OPTION_GROUPS.map((group) => (
            <div key={group.id}>
              <p className="text-xs font-bold uppercase tracking-wide text-vedic-dark mb-2">{group.label}</p>
              <div className="flex flex-wrap gap-2">
                {group.options.map((opt) => {
                  const active = choices[group.id] === opt;
                  return (
                    <button
                      key={opt}
                      onClick={() => setChoices((c) => ({ ...c, [group.id]: opt }))}
                      aria-pressed={active}
                      className={`px-4 py-2 rounded-full text-xs sm:text-sm font-semibold border transition-colors ${
                        active ? 'bg-vedic-gold text-vedic-dark border-vedic-gold' : 'bg-vedic-ivory text-vedic-muted border-vedic-gold/20 hover:border-vedic-gold/50'
                      }`}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          <button
            onClick={submit}
            disabled={!choices.type}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3 rounded-full bg-vedic-dark text-vedic-gold font-bold text-sm hover:bg-vedic-maroon hover:text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Wand2 className="w-4 h-4" />
            Create My Bracelet
          </button>
        </div>
      </div>
    </section>
  );
};
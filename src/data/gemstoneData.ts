export interface GemstoneInfo {
  id: string;
  slug: string;
  name: string;
  localName: string;
  sanskritName: string;
  rulingPlanet: string;
  planetSymbol: string;
  mineralFamily: string;
  color: string;
  birthstoneMonth: string;
  shortDescription: string;
  description: string;
  whyChoose: string;
  image: string;
  heroBanner: string;
  pricePerCaratStarting: number;
  availableOrigins: string[];
  types: { name: string; desc: string }[];
  qualityTiers: { tier: 'Entry' | 'Premium' | 'Collector'; description: string; priceRange: string }[];
  faqs: { question: string; answer: string }[];
  seoTitle: string;
  seoDescription: string;
}

export interface PlanetGemstoneInfo {
  id: string;
  slug: string;
  planetName: string;
  symbol: string;
  /** Demo hero banner image for /planets/:planetSlug (both the Gemstone and Rudraksha views).
   *  Swap for a real per-planet image from Shopify/CMS once connected — everything that reads
   *  this field (PlanetGemstonesPage.tsx) needs no change either way. */
  bannerImage: string;
  primaryGemstone: string;
  primaryGemstoneSlug: string;
  alternativeGemstones: string[];
  description: string;
  astrologicalSignificance: string;
}

export const NAVAGRAHA_GEMSTONES: GemstoneInfo[] = [
  {
    id: 'ruby',
    slug: 'ruby',
    name: 'Ruby',
    localName: 'Manik (माणिक)',
    sanskritName: 'Manikya',
    rulingPlanet: 'Sun (Surya Dev)',
    planetSymbol: '☀️',
    mineralFamily: 'Corundum',
    color: 'Deep Pigeon Blood Red',
    birthstoneMonth: 'July',
    shortDescription: 'The King of Gemstones. Governed by Surya Dev for leadership, confidence, and vital stamina.',
    description: 'Ruby (Manik) is a precious red gemstone belonging to the Corundum mineral family. In Vedic astrology, Ruby represents the Sun (Surya), the soul of the cosmic chart. Wearing a natural Ruby infuses divine energy, administrative authority, and royal confidence.',
    whyChoose: 'In Vedic tradition, Ruby is traditionally associated with Surya Dev, enhancing leadership, public prestige, and physical vitality.',
    image: 'https://images.unsplash.com/photo-1590736704728-f4730bb30770?auto=format&fit=crop&q=80&w=600',
    heroBanner: 'https://images.unsplash.com/photo-1590736704728-f4730bb30770?auto=format&fit=crop&q=80&w=1400',
    pricePerCaratStarting: 2500,
    availableOrigins: ['Burma (Myanmar)', 'Mozambique', 'Madagascar', 'Sri Lanka'],
    types: [
      { name: 'Unheated Burmese Ruby', desc: 'The most prized natural Rubies with vibrant pigeon blood color.' },
      { name: 'Mozambique Ruby', desc: 'High clarity natural Rubies with exceptional luster and rich red tone.' },
      { name: 'Star Ruby', desc: 'Unique Ruby exhibiting a 6-ray star asterism effect.' }
    ],
    qualityTiers: [
      { tier: 'Entry', description: 'Accessible price, deep color with visible natural inclusions.', priceRange: '₹2,500 - ₹5,000 / ct' },
      { tier: 'Premium', description: 'Vibrant color saturation, superior clarity and cut.', priceRange: '₹6,000 - ₹15,000 / ct' },
      { tier: 'Collector', description: 'Unheated Burmese origin, rare pigeon blood red, exceptional clarity.', priceRange: '₹20,000+ / ct' }
    ],
    faqs: [
      { question: 'Which planet does Ruby represent?', answer: 'Ruby represents the Sun (Surya Dev), governing leadership, health, and authority.' },
      { question: 'What metal should Ruby be set in?', answer: 'Ruby is traditionally set in Yellow Gold or Copper, worn on the ring finger of the dominant hand.' }
    ],
    seoTitle: 'Natural Ruby (Manik) Gemstones — Ceylon & Burmese | Veda Store',
    seoDescription: 'Shop 100% natural lab-certified Ruby (Manik) gemstones. Unheated Burmese and Mozambique Rubies for Vedic astrology.'
  },
  {
    id: 'yellow-sapphire',
    slug: 'yellow-sapphire',
    name: 'Yellow Sapphire',
    localName: 'Pukhraj (पुखराज)',
    sanskritName: 'Pushparaja',
    rulingPlanet: 'Jupiter (Guru Dev)',
    planetSymbol: '♃',
    mineralFamily: 'Corundum',
    color: 'Canary Yellow / Golden',
    birthstoneMonth: 'September',
    shortDescription: 'The Stone of Wisdom & Wealth. Governed by Jupiter (Guru) for prosperity, marriage, and luck.',
    description: 'Yellow Sapphire (Pukhraj) is one of the most revered Navratnas in Vedic astrology. Governed by Brihaspati (Jupiter), Pukhraj attracts financial abundance, harmonious marriage, higher intellect, and auspicious luck.',
    whyChoose: 'In Vedic tradition, Yellow Sapphire is traditionally associated with Jupiter, promoting divine wisdom, academic excellence, and marital happiness.',
    image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&q=80&w=600',
    heroBanner: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&q=80&w=1400',
    pricePerCaratStarting: 3500,
    availableOrigins: ['Sri Lanka (Ceylon)', 'Thailand', 'Madagascar'],
    types: [
      { name: 'Ceylon Yellow Sapphire', desc: 'World famous Sri Lankan Pukhraj prized for lemon yellow clarity.' },
      { name: 'Golden Sapphire', desc: 'Deep golden-yellow sapphire with intense warmth.' }
    ],
    qualityTiers: [
      { tier: 'Entry', description: 'Natural yellow shade with slight inclusions, ideal for budget remedy.', priceRange: '₹3,500 - ₹7,000 / ct' },
      { tier: 'Premium', description: 'Untreated Ceylon origin, brilliant luster and eye-clean clarity.', priceRange: '₹8,000 - ₹20,000 / ct' },
      { tier: 'Collector', description: 'Top-tier unheated Ceylon Pukhraj with intense bright canary yellow tone.', priceRange: '₹25,000+ / ct' }
    ],
    faqs: [
      { question: 'Why is Ceylon Pukhraj considered best for Vedic astrology?', answer: 'Sri Lankan (Ceylon) Yellow Sapphires possess natural bright color and zero artificial heating, ensuring maximum planetary effectiveness.' }
    ],
    seoTitle: 'Natural Ceylon Yellow Sapphire (Pukhraj) | Veda Store',
    seoDescription: 'Buy 100% natural Sri Lankan Yellow Sapphire (Pukhraj) certified by government-approved labs. Ideal for Jupiter (Guru) remedies.'
  },
  {
    id: 'emerald',
    slug: 'emerald',
    name: 'Emerald',
    localName: 'Panna (पन्ना)',
    sanskritName: 'Marakata',
    rulingPlanet: 'Mercury (Budh Dev)',
    planetSymbol: '☿',
    mineralFamily: 'Beryl',
    color: 'Vibrant Grass Green',
    birthstoneMonth: 'May',
    shortDescription: 'The Stone of Intellect & Commerce. Governed by Mercury (Budh) for communication and business.',
    description: 'Emerald (Panna) is a captivating green gemstone of the Beryl family. Representing Budh Dev (Mercury), Panna sharpens analytical thinking, commercial wit, public speaking, and artistic creativity.',
    whyChoose: 'In Vedic astrology, Emerald is traditionally associated with Mercury, fostering sharp business acumen, eloquent speech, and academic distinction.',
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=600',
    heroBanner: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=1400',
    pricePerCaratStarting: 2000,
    availableOrigins: ['Colombia', 'Zambia', 'Brazil', 'Russia'],
    types: [
      { name: 'Zambian Emerald', desc: 'Deep bluish-green emerald with excellent clarity and hardness.' },
      { name: 'Colombian Emerald', desc: 'World renowned velvety bright green emerald.' }
    ],
    qualityTiers: [
      { tier: 'Entry', description: 'Natural green shade with typical Jardin inclusions.', priceRange: '₹2,000 - ₹5,000 / ct' },
      { tier: 'Premium', description: 'Intense green color saturation, fine luster, minimal oiling.', priceRange: '₹6,000 - ₹18,000 / ct' },
      { tier: 'Collector', description: 'Rare Colombian un-oiled Emerald with vivid green brilliance.', priceRange: '₹25,000+ / ct' }
    ],
    faqs: [
      { question: 'Which finger should Emerald be worn on?', answer: 'Emerald (Panna) is worn on the little finger (kanishtha) of the right hand in Gold or Silver on Wednesday morning.' }
    ],
    seoTitle: 'Natural Emerald (Panna) Gemstones — Zambian & Colombian | Veda Store',
    seoDescription: 'Shop natural lab-certified Emerald (Panna) gemstones. Zambian & Colombian Panna for Budh Dev planetary remedies.'
  },
  {
    id: 'blue-sapphire',
    slug: 'blue-sapphire',
    name: 'Blue Sapphire',
    localName: 'Neelam (नीलम)',
    sanskritName: 'Indranila',
    rulingPlanet: 'Saturn (Shani Dev)',
    planetSymbol: '♄',
    mineralFamily: 'Corundum',
    color: 'Royal Velvet Blue',
    birthstoneMonth: 'September',
    shortDescription: 'The Most Powerful Fast-Acting Gemstone. Governed by Saturn (Shani) for discipline and breakthroughs.',
    description: 'Blue Sapphire (Neelam) is the fastest acting gemstone in Vedic astrology. Governed by Lord Shani (Saturn), Neelam can grant sudden wealth, career elevation, and immunity from malefic Saturn Sade Sati transits.',
    whyChoose: 'In Vedic tradition, Blue Sapphire is traditionally associated with Saturn, bringing focus, resilience, and rapid karmic clearance.',
    image: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&q=80&w=600',
    heroBanner: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&q=80&w=1400',
    pricePerCaratStarting: 4000,
    availableOrigins: ['Sri Lanka (Ceylon)', 'Kashmir (India)', 'Burma', 'Madagascar'],
    types: [
      { name: 'Ceylon Blue Sapphire', desc: 'Cornflower blue natural sapphire with magnificent transparency.' },
      { name: 'Kashmir Blue Sapphire', desc: 'Extremely rare velvety peacock blue sapphire specimen.' }
    ],
    qualityTiers: [
      { tier: 'Entry', description: 'Deep blue shade with natural inclusions, suitable for trial wearing.', priceRange: '₹4,000 - ₹8,000 / ct' },
      { tier: 'Premium', description: 'Ceylon origin, vivid royal blue tone with eye-clean clarity.', priceRange: '₹9,000 - ₹30,000 / ct' },
      { tier: 'Collector', description: 'Unheated Ceylon / Kashmir Blue Sapphire with legendary silk luster.', priceRange: '₹35,000+ / ct' }
    ],
    faqs: [
      { question: 'Why must Blue Sapphire be tested before wearing?', answer: 'Neelam is fast-acting. Astrologers recommend trial wearing under your pillow or wrist for 3 days to verify positive alignment.' }
    ],
    seoTitle: 'Certified Natural Blue Sapphire (Neelam) | Veda Store',
    seoDescription: 'Authentic Sri Lankan Ceylon Blue Sapphire (Neelam) gemstones. Tested and lab certified for Lord Shani Dev.'
  },
  {
    id: 'pearl',
    slug: 'pearl',
    name: 'Natural Pearl',
    localName: 'Moti (मोती)',
    sanskritName: 'Mukta',
    rulingPlanet: 'Moon (Chandra Dev)',
    planetSymbol: '🌙',
    mineralFamily: 'Organic Calcium Carbonate',
    color: 'Iridescent White / Cream',
    birthstoneMonth: 'June',
    shortDescription: 'The Soothing Lunar Gemstone. Governed by Moon (Chandra) for peace, emotional composure, and intuition.',
    description: 'Natural Pearl (Moti) is a soothing organic gemstone created inside marine mollusks. In Vedic astrology, Moti represents Chandra (Moon), nurturing mental peace, emotional stability, and inner tranquility.',
    whyChoose: 'In Vedic astrology, Pearl is traditionally associated with Chandra Dev, soothing anxiety and balancing emotional energy.',
    image: 'https://images.unsplash.com/photo-1509718443690-d8e2fb3474b7?auto=format&fit=crop&q=80&w=600',
    heroBanner: 'https://images.unsplash.com/photo-1509718443690-d8e2fb3474b7?auto=format&fit=crop&q=80&w=1400',
    pricePerCaratStarting: 800,
    availableOrigins: ['South Sea (Australia)', 'Basra (Natural Persian)', 'Japan'],
    types: [
      { name: 'South Sea Pearl', desc: 'Large lustrous natural white cultured pearls with thick nacre.' },
      { name: 'Basra Pearl', desc: 'Rare vintage natural wild pearls from the Persian Gulf.' }
    ],
    qualityTiers: [
      { tier: 'Entry', description: 'Smooth off-white pearl with good surface luster.', priceRange: '₹800 - ₹2,000 / ct' },
      { tier: 'Premium', description: 'South Sea pearl with brilliant mirror shine and round symmetry.', priceRange: '₹2,500 - ₹6,000 / ct' },
      { tier: 'Collector', description: 'Natural wild Basra pearl certified for zero artificial intervention.', priceRange: '₹10,000+ / ct' }
    ],
    faqs: [
      { question: 'Who should wear a Pearl?', answer: 'Anyone suffering from hyper-anxiety, rapid mood swings, or Moon (Chandra) dosha in their horoscope.' }
    ],
    seoTitle: 'Natural Pearl (Moti) Gemstones — South Sea & Basra | Veda Store',
    seoDescription: 'Buy certified 100% natural Pearl (Moti) gemstones. South Sea white pearls for Moon (Chandra) remedies.'
  },
  {
    id: 'red-coral',
    slug: 'red-coral',
    name: 'Red Coral',
    localName: 'Moonga (मूंगा)',
    sanskritName: 'Pravala',
    rulingPlanet: 'Mars (Mangal Dev)',
    planetSymbol: '♂',
    mineralFamily: 'Organic Coral',
    color: 'Crimson Red / Blood Red',
    birthstoneMonth: 'October',
    shortDescription: 'The Gemstone of Courage & Vitality. Governed by Mars (Mangal) for stamina and overcoming obstacles.',
    description: 'Red Coral (Moonga) is an organic gemstone formed by coral polyps in deep ocean waters. Governed by Mangal Dev (Mars), Moonga infuses stamina, physical bravery, immune strength, and victory over adversaries.',
    whyChoose: 'In Vedic tradition, Red Coral is traditionally associated with Mars, overcoming Mangal Dosha and boosting vital energy.',
    image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&q=80&w=600',
    heroBanner: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&q=80&w=1400',
    pricePerCaratStarting: 600,
    availableOrigins: ['Italy (Mediterranean)', 'Japan', 'Taiwan'],
    types: [
      { name: 'Italian Red Coral', desc: 'Smooth, deep red Italian Moonga preferred worldwide for Vedic remedies.' },
      { name: 'Japanese Red Coral', desc: 'Extremely dense crimson coral with high polished luster.' }
    ],
    qualityTiers: [
      { tier: 'Entry', description: 'Natural red shade, suitable for daily protective wear.', priceRange: '₹600 - ₹1,500 / ct' },
      { tier: 'Premium', description: 'Italian origin, vibrant red tone without surface pits.', priceRange: '₹1,800 - ₹4,000 / ct' },
      { tier: 'Collector', description: 'Japanese ox-blood red coral with immaculate capsule shape.', priceRange: '₹5,000+ / ct' }
    ],
    faqs: [
      { question: 'How does Red Coral help Mangal Dosha?', answer: 'Moonga neutralizes aggressive Mars transits, promoting constructive courage and protection against accidents.' }
    ],
    seoTitle: 'Natural Italian Red Coral (Moonga) | Veda Store',
    seoDescription: 'Authentic 100% natural Italian Red Coral (Moonga) gemstones certified for Mars (Mangal Dev) remedies.'
  },
  {
    id: 'hessonite',
    slug: 'hessonite',
    name: 'Hessonite',
    localName: 'Gomed (गोमेद)',
    sanskritName: 'Rahu-ratna',
    rulingPlanet: 'Rahu (North Node)',
    planetSymbol: '☊',
    mineralFamily: 'Grossular Garnet',
    color: 'Honey Yellow / Cinnamon Red',
    birthstoneMonth: 'January',
    shortDescription: 'The Shadow Planet Remedy. Governed by Rahu for protection against illusions and sudden success.',
    description: 'Hessonite Garnet (Gomed) is a warm honey-colored gemstone representing the shadow planet Rahu. Wearing a natural Gomed protects against confusion, addiction, political rivalries, and sudden financial losses.',
    whyChoose: 'In Vedic astrology, Hessonite is traditionally associated with Rahu, granting clarity and shielding against negative energies.',
    image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=600',
    heroBanner: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=1400',
    pricePerCaratStarting: 500,
    availableOrigins: ['Sri Lanka (Ceylon)', 'India', 'Africa'],
    types: [
      { name: 'Ceylon Hessonite (Gomed)', desc: 'Transparent cinnamon-honey Ceylon garnet of highest quality.' }
    ],
    qualityTiers: [
      { tier: 'Entry', description: 'Natural honey shade with mild internal swirls.', priceRange: '₹500 - ₹1,200 / ct' },
      { tier: 'Premium', description: 'Sri Lankan origin, eye-clean clarity with reddish-orange hue.', priceRange: '₹1,500 - ₹3,500 / ct' },
      { tier: 'Collector', description: 'Unheated Ceylon Gomed with crystal clear transparency.', priceRange: '₹4,000+ / ct' }
    ],
    faqs: [
      { question: 'When is Gomed recommended?', answer: 'Gomed is prescribed during Rahu Mahadasha or Antardasha transits to overcome mental confusion and hurdles.' }
    ],
    seoTitle: 'Certified Natural Hessonite (Gomed) Gemstones | Veda Store',
    seoDescription: 'Shop natural Sri Lankan Hessonite (Gomed) gemstones certified for Rahu shadow planet remedies.'
  },
  {
    id: 'cats-eye',
    slug: 'cats-eye',
    name: 'Cat\'s Eye',
    localName: 'Lehsunia (लहसुनिया)',
    sanskritName: 'Vaidurya',
    rulingPlanet: 'Ketu (South Node)',
    planetSymbol: '☋',
    mineralFamily: 'Chrysoberyl',
    color: 'Greenish Yellow with Chatoyancy Band',
    birthstoneMonth: 'November',
    shortDescription: 'The Mystical Shield Gemstone. Governed by Ketu for intuition, spiritual liberation, and protection.',
    description: 'Cat\'s Eye Chrysoberyl (Lehsunia) exhibits a striking ray of light resembling a cat\'s eye across its surface (chatoyancy). Representing Ketu, Lehsunia grants spiritual protection, guards against secret enemies, and recovers lost wealth.',
    whyChoose: 'In Vedic tradition, Cat\'s Eye is traditionally associated with Ketu, enhancing spiritual intuition and aura defense.',
    image: 'https://images.unsplash.com/photo-1611591475281-b1c970f7596d?auto=format&fit=crop&q=80&w=600',
    heroBanner: 'https://images.unsplash.com/photo-1611591475281-b1c970f7596d?auto=format&fit=crop&q=80&w=1400',
    pricePerCaratStarting: 1200,
    availableOrigins: ['Sri Lanka (Ceylon)', 'India', 'Brazil'],
    types: [
      { name: 'Chrysoberyl Cat\'s Eye', desc: 'The most authentic natural Lehsunia with sharp central eye ray.' }
    ],
    qualityTiers: [
      { tier: 'Entry', description: 'Natural green-yellow stone with visible chatoyant line.', priceRange: '₹1,200 - ₹2,500 / ct' },
      { tier: 'Premium', description: 'Ceylon origin with razor-sharp luminous cat\'s eye band.', priceRange: '₹3,000 - ₹7,000 / ct' },
      { tier: 'Collector', description: 'Honey-colored Ceylon Chrysoberyl with intense chatoyant brilliance.', priceRange: '₹8,000+ / ct' }
    ],
    faqs: [
      { question: 'What is chatoyancy in Lehsunia?', answer: 'Chatoyancy is the silken reflection of light creating a sharp moving eye band across the gemstone surface.' }
    ],
    seoTitle: 'Natural Chrysoberyl Cat\'s Eye (Lehsunia) | Veda Store',
    seoDescription: 'Buy certified natural Chrysoberyl Cat\'s Eye (Lehsunia) gemstones for Ketu planetary remedies.'
  },
  {
    id: 'diamond',
    slug: 'diamond',
    name: 'Natural Diamond',
    localName: 'Heera (हीरा)',
    sanskritName: 'Vajra',
    rulingPlanet: 'Venus (Shukra Dev)',
    planetSymbol: '♀',
    mineralFamily: 'Crystalline Carbon',
    color: 'Colorless D-F / White',
    birthstoneMonth: 'April',
    shortDescription: 'The Ultimate Venusian Jewel. Governed by Shukra Dev for glamour, affluence, and artistic charm.',
    description: 'Diamond (Heera / White Zircon) is the hardest natural substance on earth. Governed by Shukra Dev (Venus), Diamond bestows magnetic charm, financial prosperity, artistic perfection, and marital harmony.',
    whyChoose: 'In Vedic astrology, Diamond is traditionally associated with Venus, amplifying charm, prosperity, and creative brilliance.',
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=600',
    heroBanner: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=1400',
    pricePerCaratStarting: 15000,
    availableOrigins: ['India (Golconda)', 'South Africa', 'Russia', 'Australia'],
    types: [
      { name: 'Natural White Diamond', desc: 'Vedic certified natural diamonds with VS/VVS clarity.' },
      { name: 'White Zircon (Uparatna)', desc: 'Natural substitute stone for Venusian energy at accessible price.' }
    ],
    qualityTiers: [
      { tier: 'Entry', description: 'SI clarity natural diamond / Natural White Zircon.', priceRange: '₹3,000 - ₹15,000' },
      { tier: 'Premium', description: 'VS/VVS clarity, G-H color certified natural diamond.', priceRange: '₹25,000 - ₹75,000' },
      { tier: 'Collector', description: 'D-F Colorless VVS1 Golconda / GIA certified diamond.', priceRange: '₹1,000,00+ / ct' }
    ],
    faqs: [
      { question: 'What is the natural Uparatna for Diamond?', answer: 'Natural White Zircon (Jarkan) is the primary traditional astrological alternative for Venus remedies.' }
    ],
    seoTitle: 'Vedic Certified Diamonds & White Zircons (Heera) | Veda Store',
    seoDescription: 'Explore natural lab-certified Diamonds (Heera) and White Zircons for Venus (Shukra Dev) astrological remedies.'
  }
];

export const PLANET_LIST: PlanetGemstoneInfo[] = [
  {
    id: 'sun',
    slug: 'sun',
    planetName: 'Sun (Surya Dev)',
    symbol: '☀️',
    bannerImage: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=1200',
    primaryGemstone: 'Ruby (Manik)',
    primaryGemstoneSlug: 'ruby',
    alternativeGemstones: ['Red Garnet', 'Sunstone'],
    description: 'Surya governs soul, vitality, father, leadership, and public authority.',
    astrologicalSignificance: 'Enhances administrative success, social prestige, and physical immunity.'
  },
  {
    id: 'moon',
    slug: 'moon',
    planetName: 'Moon (Chandra Dev)',
    symbol: '🌙',
    bannerImage: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&q=80&w=1200',
    primaryGemstone: 'Natural Pearl (Moti)',
    primaryGemstoneSlug: 'pearl',
    alternativeGemstones: ['Moonstone', 'White Sapphire'],
    description: 'Chandra governs mind, emotions, mother, peace, and intuitive power.',
    astrologicalSignificance: 'Soothes anxiety, balances emotional intelligence, and brings inner peace.'
  },
  {
    id: 'mars',
    slug: 'mars',
    planetName: 'Mars (Mangal Dev)',
    symbol: '♂',
    bannerImage: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=1200',
    primaryGemstone: 'Red Coral (Moonga)',
    primaryGemstoneSlug: 'red-coral',
    alternativeGemstones: ['Red Carnelian', 'Red Jasper'],
    description: 'Mangal governs energy, bravery, blood, real estate, and physical strength.',
    astrologicalSignificance: 'Mitigates Mangal Dosha, enhances stamina, and shields against accidents.'
  },
  {
    id: 'mercury',
    slug: 'mercury',
    planetName: 'Mercury (Budh Dev)',
    symbol: '☿',
    bannerImage: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&q=80&w=1200',
    primaryGemstone: 'Emerald (Panna)',
    primaryGemstoneSlug: 'emerald',
    alternativeGemstones: ['Peridot', 'Green Tourmaline', 'Green Aventurine'],
    description: 'Budh governs intellect, speech, commerce, mathematics, and trade.',
    astrologicalSignificance: 'Sharpens business acumen, public speaking, and intellectual absorption.'
  },
  {
    id: 'jupiter',
    slug: 'jupiter',
    planetName: 'Jupiter (Guru Dev)',
    symbol: '♃',
    bannerImage: 'https://images.unsplash.com/photo-1545205597-3d9d02c29597?auto=format&fit=crop&q=80&w=1200',
    primaryGemstone: 'Yellow Sapphire (Pukhraj)',
    primaryGemstoneSlug: 'yellow-sapphire',
    alternativeGemstones: ['Yellow Topaz', 'Citrine'],
    description: 'Guru governs higher wisdom, fortune, marriage, spirituality, and wealth.',
    astrologicalSignificance: 'Invites financial abundance, auspicious marriage, and spiritual light.'
  },
  {
    id: 'venus',
    slug: 'venus',
    planetName: 'Venus (Shukra Dev)',
    symbol: '♀',
    bannerImage: 'https://images.unsplash.com/photo-1499209974431-9dddcece7f88?auto=format&fit=crop&q=80&w=1200',
    primaryGemstone: 'Diamond / White Zircon (Heera)',
    primaryGemstoneSlug: 'diamond',
    alternativeGemstones: ['White Zircon', 'Opal'],
    description: 'Shukra governs luxury, love, artistic expression, vehicles, and affluence.',
    astrologicalSignificance: 'Boosts personal charisma, marital harmony, and creative abundance.'
  },
  {
    id: 'saturn',
    slug: 'saturn',
    planetName: 'Saturn (Shani Dev)',
    symbol: '♄',
    bannerImage: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&q=80&w=1200',
    primaryGemstone: 'Blue Sapphire (Neelam)',
    primaryGemstoneSlug: 'blue-sapphire',
    alternativeGemstones: ['Amethyst', 'Blue Spinel', 'Lapis Lazuli'],
    description: 'Shani governs karma, discipline, longevity, career structure, and patience.',
    astrologicalSignificance: 'Harmonizes Sade Sati transits, grants career stability, and fast breakthroughs.'
  },
  {
    id: 'rahu',
    slug: 'rahu',
    planetName: 'Rahu (North Node)',
    symbol: '☊',
    bannerImage: 'https://images.unsplash.com/photo-1604881991720-f91add269bed?auto=format&fit=crop&q=80&w=1200',
    primaryGemstone: 'Hessonite (Gomed)',
    primaryGemstoneSlug: 'hessonite',
    alternativeGemstones: ['Honey Spessartine'],
    description: 'Rahu governs innovation, foreign travel, ambition, and clearing illusions.',
    astrologicalSignificance: 'Protects against confusion, political rivals, and sudden setbacks.'
  },
  {
    id: 'ketu',
    slug: 'ketu',
    planetName: 'Ketu (South Node)',
    symbol: '☋',
    bannerImage: 'https://images.unsplash.com/photo-1602523961358-f9f03ba1cd3a?auto=format&fit=crop&q=80&w=1200',
    primaryGemstone: 'Cat\'s Eye (Lehsunia)',
    primaryGemstoneSlug: 'cats-eye',
    alternativeGemstones: ['Turquoise', 'Tiger Eye'],
    description: 'Ketu governs intuition, spiritual liberation, occult wisdom, and aura protection.',
    astrologicalSignificance: 'Enhances inner vision, spiritual growth, and aura defense.'
  }
];

import { Product } from '../types/ecommerce';

export const GEMSTONE_PRODUCTS_LIST: Product[] = [
  {
    id: 'prod-gem-ruby',
    title: 'Natural Ceylon Ruby (Manik) — 2.15 Carat',
    slug: 'ruby-manik',
    category: 'gemstones',
    subcategory: 'ruby',
    description: '100% Untreated Natural Ceylon Ruby with deep pigeon blood red color. Governed by Surya Dev.',
    shortDescription: 'Certified Natural Ceylon Ruby (Manik) for Sun remedies.',
    images: ['https://images.unsplash.com/photo-1590736704728-f4730bb30770?auto=format&fit=crop&q=80&w=800'],
    price: 18500,
    compareAtPrice: 22000,
    discount: 16,
    rating: 5.0,
    reviewCount: 48,
    sku: 'VS-GEM-001',
    stock: 8,
    tags: ['ruby', 'manik', 'sun', 'surya', 'gemstones'],
    benefits: ['Leadership authority', 'Vital energy'],
    labCertified: true,
    carat: 2.15,
    origin: 'Sri Lanka (Ceylon)',
    certificationLab: 'GTL Lab',
    treatment: 'No indications of heating'
  },
  {
    id: 'prod-gem-pukhraj',
    title: 'Natural Ceylon Yellow Sapphire (Pukhraj) — 2.25 Carat',
    slug: 'yellow-sapphire-pukhraj',
    category: 'gemstones',
    subcategory: 'yellow-sapphire',
    description: 'Vivid canary yellow untreated Sri Lankan Pukhraj gemstone with high eye-clean transparency.',
    shortDescription: 'Certified Natural Ceylon Yellow Sapphire for Jupiter remedies.',
    images: ['https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&q=80&w=800'],
    price: 24500,
    compareAtPrice: 28000,
    discount: 12,
    rating: 4.9,
    reviewCount: 65,
    sku: 'VS-GEM-002',
    stock: 12,
    tags: ['pukhraj', 'yellow sapphire', 'jupiter', 'guru', 'gemstones'],
    benefits: ['Wealth & prosperity', 'Divine wisdom'],
    labCertified: true,
    carat: 2.25,
    origin: 'Sri Lanka (Ceylon)',
    certificationLab: 'GTL Lab',
    treatment: 'Untreated'
  },
  {
    id: 'prod-gem-panna',
    title: 'Natural Zambian Emerald (Panna) — 3.10 Carat',
    slug: 'emerald-panna',
    category: 'gemstones',
    subcategory: 'emerald',
    description: 'Vibrant grass green natural Emerald with deep color saturation and lustrous cut.',
    shortDescription: 'Certified Natural Zambian Emerald for Mercury remedies.',
    images: ['https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=800'],
    price: 19800,
    compareAtPrice: 24000,
    discount: 17,
    rating: 4.8,
    reviewCount: 39,
    sku: 'VS-GEM-003',
    stock: 6,
    tags: ['emerald', 'panna', 'mercury', 'budh', 'gemstones'],
    benefits: ['Business intellect', 'Eloquence'],
    labCertified: true,
    carat: 3.10,
    origin: 'Zambia',
    certificationLab: 'GTL Lab',
    treatment: 'Natural Oiling'
  }
];

export const BLOG_ARTICLES_DATA = [
  {
    id: 'b1',
    title: '5 Mukhi Rudraksha: Complete Guide & Benefits',
    category: 'Rudraksha',
    date: 'September 2026',
    author: 'Veda Store Team',
    summary: 'Comprehensive guide to wearing authentic Nepalese 5 Mukhi Rudraksha.'
  }
];

export const VERIFIED_GEMSTONE_REVIEWS = [
  {
    id: 'r1',
    customerName: 'Aarav Sharma',
    rating: 5,
    date: 'August 2026',
    comment: 'Received 2.25 Ct Ceylon Yellow Sapphire with government lab report.',
    verifiedPurchase: true
  }
];
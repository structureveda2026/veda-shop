import { Category } from '../types/ecommerce';

export const CATEGORIES: Category[] = [
  {
    id: 'cat-rudraksha',
    name: 'Rudraksha',
    slug: 'rudraksha',
    description: '100% Genuine Nepali Origin Rudraksha (1 Mukhi to 14 Mukhi, Gauri Shankar, Ganesh Rudraksha & Zodiac-based Rudraksha).',
    image: 'https://images.unsplash.com/photo-1608755728617-aefab37d159c?auto=format&fit=crop&q=80&w=800',
    subcategories: [
      { name: '1 Mukhi Rudraksha', slug: '1-mukhi', description: 'Rare & powerful talisman of Lord Shiva.' },
      { name: '2 Mukhi Rudraksha', slug: '2-mukhi', description: 'Lord Shiva & Goddess Parvati (Ardhanarishvara).' },
      { name: '3 Mukhi Rudraksha', slug: '3-mukhi', description: 'Revered seed in Hinduism associated with Agni Dev.' },
      { name: '4 Mukhi Rudraksha', slug: '4-mukhi', description: 'Symbol associated with Lord Ganesha & Brahma.' },
      { name: '5 Mukhi Rudraksha', slug: '5-mukhi', description: 'Spiritually significant Rudraksha for peace & health.' },
      { name: '6 Mukhi Rudraksha', slug: '6-mukhi', description: 'Lord Kartikeya for focus & courage.' },
      { name: '7 Mukhi Rudraksha', slug: '7-mukhi', description: 'Associated with Goddess Lakshmi for wealth.' },
      { name: '8 Mukhi Rudraksha', slug: '8-mukhi', description: 'Associated with Lord Ganesha for obstacle removal.' },
      { name: '9 Mukhi Rudraksha', slug: '9-mukhi', description: 'Symbolism of nine forms of Goddess Durga.' },
      { name: '10 Mukhi Rudraksha', slug: '10-mukhi', description: 'Revered bead in Hindu spirituality (Lord Vishnu).' },
      { name: '11 Mukhi Rudraksha', slug: '11-mukhi', description: 'Rare and mystical gift of nature (Lord Hanuman).' },
      { name: '12 Mukhi Rudraksha', slug: '12-mukhi', description: 'Brilliance of the twelve Adityas (Surya Dev).' },
      { name: '13 Mukhi Rudraksha', slug: '13-mukhi', description: 'Described as a wonder in itself (Lord Kamdev).' },
      { name: '14 Mukhi Rudraksha', slug: '14-mukhi', description: 'Supreme form associated with fourteen faces.' },
      { name: 'Gauri Shankar Rudraksha', slug: 'gauri-shankar', description: 'Unique and highly revered bead of Shiva-Parvati.' },
      { name: 'Ganesh Rudraksha', slug: 'ganesh', description: 'Powerful and beloved bead associated with Lord Ganesha.' },
      { name: 'Zodiac Rudraksha (By Rashi)', slug: 'zodiac-rudraksha', description: 'Rudraksha selection tailored to your zodiac sign.' },
    ],
    seoText: 'Veda Store provides authentic lab-certified Nepalese Rudraksha beads. Accompanied by government-approved lab certificates and Vedic energization instructions.',
    faqs: [
      { question: 'Are Veda Store Rudraksha beads genuine Nepali origin?', answer: 'Yes, 100% of our Rudraksha beads are authentic Nepali origin, verified by government registered X-Ray lab reports.' },
      { question: 'Can anyone wear a Rudraksha?', answer: 'Yes, Rudraksha is a divine gift for all human beings regardless of age, gender, or zodiac sign.' }
    ]
  },
  {
    id: 'cat-gemstones',
    name: 'Gemstones',
    slug: 'gemstones',
    description: '100% Untreated Natural Precious Gemstones (Navratna, Birthstones & Planetary Crystals).',
    image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&q=80&w=800',
    subcategories: [
      { name: 'Ruby (Manik)', slug: 'ruby', description: 'Surya Dev gemstone for power & authority.' },
      { name: 'Emerald (Panna)', slug: 'emerald', description: 'Budh Dev stone for intellect & business.' },
      { name: 'Yellow Sapphire (Pukhraj)', slug: 'yellow-sapphire', description: 'Guru Dev gemstone for prosperity & wisdom.' },
      { name: 'Blue Sapphire (Neelam)', slug: 'blue-sapphire', description: 'Shani Dev stone for quick breakthrough.' },
      { name: 'Hessonite (Gomed)', slug: 'hessonite', description: 'Rahu planet remedy stone.' },
      { name: 'Cat\'s Eye (Lahsuniya)', slug: 'cats-eye', description: 'Ketu planet remedy stone.' },
      { name: 'Pearl (Moti)', slug: 'pearl', description: 'Chandra Dev stone for emotional balance.' },
      { name: 'Red Coral (Moonga)', slug: 'red-coral', description: 'Mangal Dev stone for courage & energy.' },
    ]
  },
  {
    id: 'cat-puja-kits',
    name: 'Puja Kits',
    slug: 'puja-kits',
    description: 'Complete authentic Puja Kits with pure brass, organic dhoop, akshat, and step-by-step ritual guides.',
    image: 'https://images.unsplash.com/photo-1609357605129-26f69add5d6e?auto=format&fit=crop&q=80&w=800',
    subcategories: [
      { name: 'Rudrabhishek Kit', slug: 'rudrabhishek-kit', description: 'Complete kit for Lord Shiva Abhishekam ritual.' },
      { name: 'Shiv Puja Kit', slug: 'shiv-puja-kit', description: 'Essential samagri for daily & Shivratri worship.' },
      { name: 'Ganesh Puja Kit', slug: 'ganesh-puja-kit', description: 'Everything needed for Siddhivinayak blessings.' },
      { name: 'Lakshmi Puja Kit', slug: 'lakshmi-puja-kit', description: 'Diwali & Friday prosperity puja package.' },
      { name: 'Navgraha Shanti Kit', slug: 'navgraha-kit', description: '9 planetary pacification samagri set.' },
      { name: 'Satyanarayan Kit', slug: 'satyanarayan-kit', description: 'Full samagri set for Satyanarayan Katha.' },
      { name: 'Griha Pravesh Kit', slug: 'griha-pravesh-kit', description: 'Traditional samagri for a housewarming puja.' },
      { name: 'Hanuman Puja Kit', slug: 'hanuman-puja-kit', description: 'Tuesday, Saturday & Hanuman Jayanti worship set.' },
      { name: 'Durga Puja Kit', slug: 'durga-puja-kit', description: 'Navratri Devi puja & Kanya Pujan samagri.' },
      { name: 'Daily Puja Kit', slug: 'daily-puja-kit', description: 'Everyday essentials for your home mandir.' }
    ],
    seoText: 'Veda Store puja kits bring together the dry samagri traditionally used for a particular puja — Rudrabhishek, Ganesh, Lakshmi, Satyanarayan, Navagraha and more — in one sealed box, with a simple step-by-step vidhi guide. Fresh items such as flowers, fruits and milk are best bought on the day of the puja.',
    faqs: [
      { question: 'What is included in a puja kit?', answer: 'Each kit lists its full samagri under "What\'s inside" on the product page, along with a step-by-step vidhi guide.' },
      { question: 'Can I perform the puja at home without a pandit?', answer: 'Many families do, by following the vidhi guide. If you would like a pandit to guide or perform the puja, contact us and we will help you arrange it.' },
      { question: 'Do I need to buy anything separately?', answer: 'Fresh items such as flowers, fruits, milk and curd are best bought fresh on the day of the puja. The kit covers the dry samagri.' }
    ]
  },
  {
    id: 'cat-puja-samagri',
    name: 'Puja Samagri',
    slug: 'puja-samagri',
    description: 'Pure Organic Agarbatti, Dhoop, Kashi Gangajal, Pure Cow Ghee, Akshat, and Hawan items.',
    image: 'https://images.unsplash.com/photo-1609357605129-26f69add5d6e?auto=format&fit=crop&q=80&w=800',
    subcategories: [
      { name: 'Kashi Sacred Gangajal', slug: 'kashi-gangajal', description: 'Original holy water sealed at Kashi Ghats.' },
      { name: 'Pure Organic Incense', slug: 'incense', description: 'Charcoal-free natural temple agarbatti.' },
      { name: 'Pure Cow Ghee Diya Wicks', slug: 'ghee-wicks', description: 'Ready-to-use pure ghee diya wicks.' }
    ]
  },
  {
    id: 'cat-yantra',
    name: 'Yantra',
    slug: 'yantra',
    description: 'Sacred Vedic Copper & 24K Gold-plated Yantras precision carved with divine geometry.',
    image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=800',
    subcategories: [
      { name: 'Shree Yantra', slug: 'shree-yantra', description: 'Supreme geometry for wealth & abundance.' },
      { name: 'Kuber Yantra', slug: 'kuber-yantra', description: 'Attract financial stability & luck.' },
      { name: 'Mahamrityunjay Yantra', slug: 'mahamrityunjay-yantra', description: 'Health, longevity & protection shield.' },
      { name: 'Navgraha Yantra', slug: 'navgraha-yantra', description: 'Comprehensive 9-planet balancing frame.' }
    ]
  },
  {
    id: 'cat-mala',
    name: 'Mala',
    slug: 'mala',
    description: 'Authentic 108 Bead Nepalese Rudraksha Malas, Sphatik Malas, and Gemstone Japa Malas.',
    image: 'https://images.unsplash.com/photo-1608755728617-aefab37d159c?auto=format&fit=crop&q=80&w=800',
    subcategories: [
      { name: '5 Mukhi Rudraksha 108 Mala', slug: '5-mukhi-mala', description: 'Authentic Nepalese 108+1 bead Japa Mala.' },
      { name: 'Sphatik (Clear Quartz) Mala', slug: 'sphatik-mala', description: 'Cooling crystal mala for mental peace.' },
      { name: 'Tulsi Japa Mala', slug: 'tulsi-mala', description: 'Sacred Vishnu & Krishna devotional mala.' }
    ]
  },
  {
    id: 'cat-bracelets',
    name: 'Bracelets',
    slug: 'bracelets',
    description: 'Authentic gemstone & crystal energy bracelets for protection, positivity, love attraction, and planetary balance.',
    image: 'https://images.unsplash.com/photo-1611591475281-b1c970f7596d?auto=format&fit=crop&q=80&w=800',
    subcategories: [
      { name: 'White Aura Quartz', slug: 'white-aura-quartz', description: 'Positioned around Joy, Protection & Grounding.' },
      { name: 'Black Tourmaline Bracelet', slug: 'black-tourmaline', description: 'Spiritual and protective properties.' },
      { name: 'Red Carnelian Bracelet', slug: 'red-carnelian', description: 'Embrace the Fire Within.' },
      { name: 'Citrine Bracelet', slug: 'citrine', description: 'A Stone of Sunshine.' },
      { name: 'Evil Eye Bracelet', slug: 'evil-eye', description: 'Positioned as jewelry intended for protection.' },
      { name: 'Howlite Bracelet', slug: 'howlite', description: 'Beautiful white stone with gray/black veining.' },
      { name: '7 Chakra Lava Bracelet', slug: '7-chakra-lava', description: 'Presented around the seven-chakra concept.' },
      { name: 'Amethyst Bracelet', slug: 'amethyst', description: 'Purple crystal for mental calm & intuition.' },
    ]
  },
  {
    id: 'cat-spiritual-essentials',
    name: 'Spiritual Essentials',
    slug: 'spiritual-essentials',
    description: 'Brass idols, Mandir accessories, Shankh, Brass Diyas, and Copper Jalapatra.',
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=800',
    subcategories: [
      { name: 'Brass Shivling & Jaladhari', slug: 'brass-shivling', description: 'Heavy brass Shivling set for home worship.' },
      { name: 'Natural Dakshinavarti Shankh', slug: 'shankh', description: 'Blowing & puja blowing shankh.' }
    ]
  },
  {
    id: 'cat-vedic-gifts',
    name: 'Vedic Gifts',
    slug: 'vedic-gifts',
    description: 'Thoughtfully packaged Vedic hampers for weddings, housewarming, and festivals.',
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=800',
    subcategories: [
      { name: 'Kashi Blessing Gift Box', slug: 'kashi-gift-box', description: 'Rudraksha, Gangajal, and brass diya gift hamper.' },
      { name: 'Divine Lakshmi Gift Hamper', slug: 'lakshmi-gift-hamper', description: 'Shree Yantra and silver coin gift box.' }
    ]
  }
];
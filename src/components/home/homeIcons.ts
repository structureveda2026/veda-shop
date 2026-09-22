import {
  Award, BookOpen, Briefcase, CheckCircle2, Coins, Compass, Eye, FileText, Flame, Gem, Headphones,
  Heart, HelpCircle, Leaf, LifeBuoy, Lock, MessageCircle, Moon, Package, Phone, Search, Shield,
  ShieldCheck, ShoppingBag, Smile, Sparkles, Star, Sun, Target, Truck, Users,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

/**
 * Admin-friendly icon names. A Shopify metaobject stores an icon as plain text ("shield-check",
 * "Compass", "gem"…); this turns it into the component. Unknown / empty names fall back to a
 * sparkle, so a typo in the admin never breaks the page.
 */
const ICONS: Record<string, LucideIcon> = {
  award: Award,
  'book-open': BookOpen,
  briefcase: Briefcase,
  'check-circle': CheckCircle2,
  coins: Coins,
  compass: Compass,
  eye: Eye,
  'file-text': FileText,
  flame: Flame,
  gem: Gem,
  headphones: Headphones,
  heart: Heart,
  help: HelpCircle,
  leaf: Leaf,
  'life-buoy': LifeBuoy,
  lock: Lock,
  message: MessageCircle,
  moon: Moon,
  package: Package,
  phone: Phone,
  search: Search,
  shield: Shield,
  'shield-check': ShieldCheck,
  'shopping-bag': ShoppingBag,
  smile: Smile,
  sparkles: Sparkles,
  star: Star,
  sun: Sun,
  target: Target,
  truck: Truck,
  users: Users,
};

export function resolveIcon(name?: string, fallback: LucideIcon = Sparkles): LucideIcon {
  if (!name) return fallback;
  return ICONS[name.trim().toLowerCase().replace(/[\s_]+/g, '-')] ?? fallback;
}
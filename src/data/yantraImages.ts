/**
 * YANTRA IMAGES — one place that decides which photo a yantra shows.
 *
 * TODAY (demo mode): a yantra's photo comes from the /public folder, using the file names below.
 *                    A slug with no entry (or a file that isn't uploaded yet) simply shows the built-in
 *                    sacred-geometry art, so no image is ever broken.
 * LATER (Shopify):   the Storefront API returns the product's own images — pass them as `remote` to
 *                    `resolveYantraImages()` and they win automatically.
 *
 * TO ADD / CHANGE A PHOTO: put the file in  public/images/yantra/  and edit its name in the map below.
 */

/** Folder inside /public (served from the site root). */
export const YANTRA_IMAGE_DIR = '/images/yantra';

/** yantra slug → file name(s) inside YANTRA_IMAGE_DIR. First file = the main photo shown on cards. */
export const YANTRA_LOCAL_IMAGES: Record<string, string[]> = {
  'shree-yantra-copper': ['ShreeYantraCopper.png'],
  'shree-yantra-gold-plated': ['ShreeYantraGold.png'],
  'shree-yantra-sphatik': ['ShreeYantraSphatik.png'],
  'shree-yantra-silver': ['ShreeYantraSilver.png'],
  'kuber-yantra-copper': ['KuberYantraCopper.png'],
  'kuber-yantra-gold-plated': ['KuberYantraGold.png'],
  'mahamrityunjay-yantra-copper': ['MahamrityunjayYantra.png'],
  'navgraha-yantra-copper': ['NavgrahaYantraCopper.png'],
  'navgraha-yantra-ashtadhatu': ['NavgrahaYantraAshtadhatu.png'],
  'shani-yantra-copper': ['ShaniYantra.png'],
  'surya-yantra-copper': ['SuryaYantra.png'],
  'guru-yantra-brass': ['GuruYantra.png'],
  'vastu-yantra-copper': ['VastuYantra.png'],
  'durga-bisa-yantra-copper': ['DurgaBisaYantra.png'],
  'saraswati-yantra-brass': ['SaraswatiYantra.png'],
  'ganesh-yantra-copper': ['GaneshYantra.png']
};

/** Local (public folder) photos for a yantra slug — [] when none is listed above. */
export function localYantraPhotos(slug: string): string[] {
  return (YANTRA_LOCAL_IMAGES[slug] ?? []).map((file) => `${YANTRA_IMAGE_DIR}/${file}`);
}

/**
 * Final `images` array for a yantra.
 *   remote  → image URLs from Shopify. If present they replace the local photos.
 *   art     → generated sacred-geometry art, always appended last as the "never broken" fallback.
 */
export function resolveYantraImages(slug: string, art: string, remote?: string[]): string[] {
  const shopify = (remote ?? []).filter(Boolean);
  const photos = shopify.length > 0 ? shopify : localYantraPhotos(slug);
  return [...photos, art];
}
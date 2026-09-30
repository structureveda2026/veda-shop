/**
 * PUJA KIT IMAGES — one place that decides which photo a kit shows.
 *
 * TODAY (demo mode): every kit's photo comes from the /public folder, using the file names below.
 * LATER (Shopify):   the Storefront API returns the product's own images — pass them as `remote` to
 *                    `resolveKitImages()` and they win automatically; the local files are then ignored.
 *                    (On the product page, ProductGallery already fetches Shopify media by handle when
 *                    Shopify is configured, so nothing changes there.)
 *
 * The themed SVG art is always kept as the LAST entry, so a missing / mis-named file never shows a
 * broken image — PujaKitCard and PujaKitInside fall back to it on error.
 *
 * TO ADD / CHANGE A PHOTO: put the file in  public/images/puja-kit/  and edit its name in the map below.
 * Nothing else in the project needs to change.
 */

/** Folder inside /public (served from the site root). */
export const PUJA_KIT_IMAGE_DIR = '/images/puja-kit';

/** kit slug → file name(s) inside PUJA_KIT_IMAGE_DIR. First file = the main photo shown on cards. */
export const PUJA_KIT_LOCAL_IMAGES: Record<string, string[]> = {
  'rudrabhishek-puja-kit': ['RudraAbhishek.png'],
  'shiv-puja-kit': ['ShivPujaKit.png'],
  'ganesh-puja-kit': ['GaneshPujaKit.png'],
  'lakshmi-puja-kit': ['LakshmiPujaKit.png'],
  'navgraha-shanti-puja-kit': ['NavGrahPujaKit.png'],
  'satyanarayan-puja-kit': ['SatyaNarayanPujaKit.png'],
  'griha-pravesh-puja-kit': ['GrahPraveshPujaKit.png'],
  'hanuman-puja-kit': ['HanumanPujaKit.png'],
  'durga-navratri-puja-kit': ['DurgaNavaratriPujaKit.png'],
  'daily-puja-essentials-kit': ['DailyPujaKit.png']
};

/** Local (public folder) photos for a kit slug — [] when none is listed above. */
export function localKitPhotos(slug: string): string[] {
  return (PUJA_KIT_LOCAL_IMAGES[slug] ?? []).map((file) => `${PUJA_KIT_IMAGE_DIR}/${file}`);
}

/**
 * Final `images` array for a kit.
 *   remote  → image URLs from Shopify (when connected). If present they replace the local photos.
 *   art     → themed placeholder, always appended last as the "never broken" fallback.
 */
export function resolveKitImages(slug: string, art: string, remote?: string[]): string[] {
  const shopify = (remote ?? []).filter(Boolean);
  const photos = shopify.length > 0 ? shopify : localKitPhotos(slug);
  return [...photos, art];
}
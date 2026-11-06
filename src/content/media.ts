/**
 * Brand media slots. Everything under /brand/ is the creator's own public media
 * (store, Payhip, Beacons, YouTube), processed by scripts/process-brand-media.mjs;
 * sources are listed in assets/brand-manifest.json. Client-supplied originals
 * can still be dropped into assets/raw/ and run through scripts/import-media.mjs.
 */
export const media = {
  /** Short muted loop for the hero, e.g. '/brand/hero.mp4'. null = use the photo. */
  heroVideo: null as string | null,
  /** Poster / fallback image for the hero: a frame from one of Dez's Shorts. */
  heroImage: '/brand/shorts/2frgLSoZuzU.webp',
  heroAlt: 'Dez holding two meal-prep bowls of mac and cheese with glazed chicken',
  /** Portrait of Dez for the story page. */
  portrait: '/brand/dez-kitchen.webp' as string | null,
  mealprep: '/brand/dez-mealprep.webp',
  before: '/brand/dez-before.webp',
  after: '/brand/dez-after.webp',
};

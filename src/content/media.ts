/**
 * Brand media slots. Drop the creator's real files into assets/raw/ and run
 * `node scripts/import-media.mjs` (writes optimised copies to public/brand/),
 * then point these at them. Until then the site uses the AI placeholder recipe
 * photos (MISSING_CONTENT.md).
 */
export const media = {
  /** Short muted loop for the hero, e.g. '/brand/hero.mp4'. null = use the photo. */
  heroVideo: null as string | null,
  /** Poster / fallback image for the hero. */
  heroImage: '/recipes/r031.png',
  heroAlt: 'Buffalo ranch burger, an Aussie Fitness high-protein recipe',
  /** Portrait of Dez for the story page. null = marked placeholder. */
  portrait: null as string | null,
};

import localFont from 'next/font/local';

/**
 * Self-hosted (both SIL Open Font License) so builds never depend on fetching
 * Google Fonts, and the browser gets them from our own CDN.
 * Latin subset only; re-download from Google Fonts to add more scripts.
 */
export const inter = localFont({
  src: './inter-latin.woff2',
  weight: '400 700',
  variable: '--font-inter',
  display: 'swap',
});

/** Display serif (Fraunces, OFL): roman + italic, variable weight and optical size. */
export const display = localFont({
  src: './fraunces-normal-latin.woff2',
  weight: '400 700',
  style: 'normal',
  variable: '--font-site-display',
  display: 'swap',
});

/** Italic as its own face, not preloaded: it's accent-only, so it mustn't compete with the LCP image. */
export const displayItalic = localFont({
  src: './fraunces-italic-latin.woff2',
  weight: '400 700',
  style: 'italic',
  variable: '--font-site-display-italic',
  display: 'swap',
  preload: false,
});

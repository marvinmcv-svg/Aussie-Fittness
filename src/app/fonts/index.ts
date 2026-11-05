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

export const bricolage = localFont({
  src: './bricolage-latin.woff2',
  weight: '700 800',
  variable: '--font-site-display',
  display: 'swap',
});

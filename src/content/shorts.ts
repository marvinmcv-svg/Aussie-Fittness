/**
 * Dez's most-watched YouTube Shorts. Titles and view counts are from the public
 * Aussie Fitness channel (UCblexCGILCHMDAlIM62Xpbw), read on SHORTS_CHECKED;
 * id ↔ title pairs were confirmed with YouTube oEmbed. Frames are in
 * public/brand/shorts/ (scripts/process-brand-media.mjs). Refresh the numbers
 * before relying on them in ads.
 */
import data from './shorts.json';

export type Short = { id: string; title: string; views: number; viewsLabel: string };

export const SHORTS_CHECKED = '2026-11-06';
/** Sum of views on the channel's latest 48 Shorts on SHORTS_CHECKED. */
export const SHORTS_TOTAL_VIEWS = 13_744_000;
export const SHORTS_COUNT = 48;

/** Ranked by views, highest first. */
export const topShorts = (data as Short[]).filter((s) => s.views >= 280_000).sort((a, b) => b.views - a.views);

export const shortUrl = (id: string) => `https://www.youtube.com/shorts/${id}`;
export const shortFrame = (id: string) => `/brand/shorts/${id}.webp`;
export const CHANNEL_URL = 'https://www.youtube.com/channel/UCblexCGILCHMDAlIM62Xpbw/shorts';

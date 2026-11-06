/**
 * Site content — every fact here traces to a source in research/01-brand-profile.md.
 * Shaped like a CMS schema (siteSettings, press, ebooks) so it can move to Sanity
 * without changing components. Do not add claims without a source.
 */

export const siteSettings = {
  brand: 'Aussie Fitness',
  creator: 'Dez Cerimagic',
  email: 'realaussiefitness@gmail.com',
  socials: [
    { name: 'Instagram', handle: '@_aussiefitness', url: 'https://www.instagram.com/_aussiefitness/' },
    { name: 'TikTok', handle: '@aussiefitness', url: 'https://www.tiktok.com/@aussiefitness' },
    { name: 'YouTube', handle: 'Aussie Fitness', url: 'https://www.youtube.com/channel/UCblexCGILCHMDAlIM62Xpbw' },
    { name: 'Facebook', handle: 'aussiefitnessofficial', url: 'https://www.facebook.com/aussiefitnessofficial' },
  ],
  storeUrl: 'https://aussiefitnessbooks.com/collections/all',
} as const;

/** Verified press coverage (text links only — no publisher logos without permission). */
export const press = [
  {
    outlet: 'NZ Herald',
    headline: 'Man loses 60kg with drool-worthy fast food swaps',
    url: 'https://nzherald.co.nz/lifestyle/healthy-mcmuffin-recipe-man-loses-60kg-with-drool-worthy-fast-food-swaps/RYWH37RZQH4HP5LFYLOVQSYRC4',
  },
  {
    outlet: 'LA FM',
    headline: 'Aussie TikToker loses 60kg with the help of his McMuffin recipe',
    url: 'https://new.lafm.com.au/entertainment/best-of-the-web/119272-aussie-tiktoker-loses-60kg-with-the-help-of-his-mcmuffin-recipe',
  },
  {
    outlet: 'The Nightly',
    headline: "Hungry Jack's becomes gym junkie heaven thanks to simple $2 protein hack",
    url: 'https://thenightly.com.au/lifestyle/food/hungry-jacks-becomes-gym-junkie-heaven-paradise-thanks-to-simple-2-protein-hack-c-21741007',
  },
] as const;

export type Ebook = {
  id: string;
  title: string;
  recipes: string;
  /** Prices as listed on aussiefitnessbooks.com on PRICES_CHECKED (AUD). null = not verified. */
  priceSale: number | null;
  priceRegular: number | null;
  url: string;
  tone: 'ink' | 'green' | 'sauce' | 'paper';
  /** Official cover art from the store listing (public/brand/). */
  cover: string;
};

export const PRICES_CHECKED = '2026-11-05';

export const ebooks: Ebook[] = [
  {
    id: 'bundle',
    cover: '/brand/cover-bundle.webp',
    title: 'The Bundle',
    recipes: '300+',
    priceSale: 79.99,
    priceRegular: 123.97,
    url: 'https://aussiefitnessbooks.com/collections/all',
    tone: 'ink',
  },
  {
    id: 'elite',
    cover: '/brand/cover-elite.webp',
    title: 'Elite Low Calorie / High Protein',
    recipes: '150+',
    priceSale: 44.99,
    priceRegular: 89.98,
    url: 'https://aussiefitnessbooks.com/collections/all',
    tone: 'green',
  },
  {
    id: 'fakeaway',
    cover: '/brand/cover-fakeaway.webp',
    title: 'Fakeaway Favourites',
    recipes: '80+',
    priceSale: 38.99,
    priceRegular: 77.98,
    url: 'https://aussiefitnessbooks.com/collections/all',
    tone: 'sauce',
  },
  {
    id: 'mealprep',
    cover: '/brand/cover-mealprep.webp',
    title: 'High Protein Meal Prep',
    recipes: '73',
    // Sold out on Shopify at check time; the creator's live link is Payhip.
    priceSale: null,
    priceRegular: null,
    url: 'https://payhip.com/b/eJiQc',
    tone: 'paper',
  },
];

/** Fast-food-style recipes from the real recipe set, used by the Fakeaway Wall. */
export const FAKEAWAY_IDS_HINT = ['pizza', 'burger', 'big mac', 'kebab', 'mcmuffin', 'nachos', 'burrito', 'katsu', 'fries', 'quesadilla', 'parma', 'kfc', 'donut', 'gyros'];

/* ── WhatsApp order funnel ──────────────────────────────────── */

/** Orders go to this WhatsApp number (international format, digits only). */
export const WHATSAPP_NUMBER = '59177165787';

export function whatsappUrl(text: string) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
}

export type Product = {
  id: 'app' | Ebook['id'];
  /** AUD. null = price not verified; confirmed in chat. */
  price: number | null;
  recipes: string;
};

/** Everything the order builder can sell. Prices from PRICES_CHECKED / src/lib/pricing.ts. */
export const products: Product[] = [
  { id: 'bundle', price: 79.99, recipes: '300+' },
  { id: 'elite', price: 44.99, recipes: '150+' },
  { id: 'fakeaway', price: 38.99, recipes: '80+' },
  { id: 'mealprep', price: null, recipes: '73' },
  { id: 'app', price: 9.99, recipes: '135' },
];

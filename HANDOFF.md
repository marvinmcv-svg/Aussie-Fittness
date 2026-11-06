# Handoff: Aussie Fitness website

## Update 6 Nov 2026 (later): real media, new copy, conversion audit
- **Real media:** 31 images from Dez's own store, Payhip, Beacons and YouTube replace the placeholders in the hero, the proof section (before/after), the story page and the ebook covers. A new **Shorts reel** shows his 8 most-watched videos with public view counts.
- **Copy:** rewritten in Dez's voice (EN + ES) with the `copywriting` skill in `.claude/skills/`.
- **Audit:** `CONVERSION_AUDIT.md`. Top three: turn on analytics + TikTok/Meta pixels, add instant Shopify checkout next to WhatsApp, add email capture.

## Update 6 Nov 2026: night edition + WhatsApp funnel
- **New look:** dark, warm and editorial: Fraunces serif with italics, one ember CTA, a marquee, film grain and sharp corners.
- **Order on WhatsApp:** a 4-step builder (goal & cravings → pack + extras → details → send) with a live phone preview. Send opens `wa.me/59177165787` with the order pre-written. There's also a floating WhatsApp button on every page.
- **Your photos and videos:** `scripts/import-media.mjs` + `src/content/media.ts` (Instagram blocked automated access).

## Concept: "The Swap"
Aussie Fitness's real story is fast-food swaps: Dez Cerimagic lost 60kg (135kg → 75kg) without giving up takeaway (NZ Herald, LA FM, The Nightly). The site dramatises that idea:

- **Headline:** *Eat the food you crave. Hit your macros anyway.*
- **Signature moment:** the **Fakeaway Wall**. Scrolling down slides real fast-food-style recipes sideways while their protein counts up. It's pure CSS, needs no JavaScript, and becomes a swipeable row on older browsers or with reduced motion.
- **Look:** bold editorial type (Bricolage Grotesque), warm paper and ink, the app's green for "good numbers" and an orange "sauce" accent for cravings.

## What's built
| | |
|---|---|
| Pages | Home, Recipes (121 static recipe pages), Ebooks, Story, 404. All in **English and Spanish** (`/es`) |
| App | Moved to `/app`; old links redirect |
| SEO | Per-page titles/descriptions/OG, canonical + hreflang, sitemap with language alternates, Recipe / Organization / FAQPage schema |
| Buy paths | App → `/app` paywall; ebooks → official Shopify store / Payhip (existing checkouts) |
| Admin | Content in `src/content/*`, editable on GitHub (see `ADMIN_GUIDE.md`); users/premium in the app's Admin tab |

## Key decisions (full list: `DECISIONS.md`)
- Built inside the existing Next.js app: one deploy, shared recipe data, recipe pages link straight into the app.
- CSS-only motion and self-hosted fonts, both chosen for performance and reliable builds.
- No follower counts, reviews or "limited time" claims: none could be verified.
- Sanity CMS **not** set up: its connector isn't authorised in this session. Content files are shaped like CMS documents for an easy move later.

## QA results (5 Nov 2026)
| Check | Result |
|---|---|
| Lighthouse desktop | 99–100 performance; 100 accessibility, best practices and SEO on every page tested |
| Lighthouse mobile (local) | Home 90–91 (EN/ES), Ebooks/About 94–96, recipe pages 87–88; 100 a11y/BP/SEO |
| Lighthouse mobile (Vercel preview) | Home 89–91 (warm), /es 92, recipe page 90, /recipes 88; accessibility 100. Preview-only: SEO 69 (Vercel's `noindex` on previews) and BP 93 (CSP blocks Vercel's preview comment toolbar). Neither applies in production. |
| CLS | 0 on every page |
| Responsive | No horizontal scroll at 360, 390, 768, 1024, 1440, 1920 on 8 pages |
| Keyboard | Skip link, visible 3px focus ring, menu (Esc closes), FAQ all keyboard-operable |
| Reduced motion / no JS | Wall becomes a static swipeable row; all content and numbers render without JS |
| Premium protection | 0 of 649 premium-only steps appear in any built page or script |
| Links | Every CTA resolves (app, recipes, store, Payhip, socials, email) |

## The client must still provide or approve
1. **Written permission** from Aussie Fitness to use the recipes and brand (`ASSET_RIGHTS_REVIEW.md`).
2. **Real food photography.** Every current photo is AI-generated and some don't match their recipe.
3. A **portrait of Dez** (placeholder on `/about`), logo files and ebook cover art.
4. **Fix recipe data:** 9 "Untitled Recipe" entries, 5 duplicate titles, typos (list in `MISSING_CONTENT.md`).
5. A **native-speaker review** of the Spanish copy.
6. **Approval to publish to production** (aussiefit.vercel.app) and, when ready, a custom domain.
7. Database/login secrets in Vercel (`DATABASE_URL`, `DIRECT_URL`, `NEXTAUTH_SECRET`) and Stripe keys, so `/app` sign-up and payments work.

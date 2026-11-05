# Decisions

| # | Decision | Why |
|---|---|---|
| 1 | Brand identified as **Aussie Fitness / Dez Cerimagic** (@_aussiefitness, aussiefitnessbooks.com) | Handles cross-link on aussiefitness.info; press confirms creator. User confirmed (5 Nov 2026) they build this **with the creator's permission**. |
| 2 | Run mode: **autonomous**; production deploy only after approval | Master prompt default + section 8 rule. Preview deployment is used for review. |
| 3 | Site role: **one home for everything** (app + ebooks) | User choice. Existing Shopify checkout links stay as the ebook purchase path. |
| 4 | Build inside the existing Next.js app, not a separate `/site` project | One deploy, shared recipe data, shared design tokens, recipe pages can link straight into the app. Marketing routes live in `src/app/(site)` and `src/app/es`. |
| 5 | Existing app moves from `/` to `/app`; old `/?recipe=` and `/?tab=` links redirect | Root URL is the brand's front door. |
| 6 | Concept **"The Swap"** (research/06) | It is the brand's real idea and its proven press hook. |
| 7 | Fonts: Bricolage Grotesque + Inter (both OFL via Google Fonts) | No brand typeface exists; both are licensed for web. |
| 8 | i18n: **EN default + ES**, via a small typed dictionary and `/es` routes instead of next-intl | Master prompt default languages. Only five pages, so next-intl's middleware and locale routing would add more machinery than it saves. Recipe titles and steps stay in English (source content); UI and marketing copy are translated. |
| 9 | CMS: typed content modules shaped like a Sanity schema; **Sanity not set up** | Sanity connector requires authorisation that isn't available in this session (blocker in section 3). Migration path documented in HANDOFF.md. |
| 10 | Motion: **CSS only** on the marketing site: scroll-driven reveals and a scroll-driven Fakeaway Wall (`view-timeline`); no GSAP, Lenis or Motion | First build used Motion for the wall; QA showed ~50KB of JS holding mobile Lighthouse under 90. CSS runs off the main thread, needs no JS, and falls back to a swipeable row where unsupported or with reduced motion. |
| 11 | Follower counts and reviews are **not shown** | Sources disagree and no reviews could be verified (truth rule). |
| 12 | Press shown as text links (NZ Herald, LA FM, The Nightly), not logos | Verified articles; publisher logos need permission. |
| 13 | Ebook prices shown are the store's current sale/regular prices with "checked" date; the site avoids "limited time" urgency copy | Accuracy, and to avoid misleading-pricing risk under Australian Consumer Law. |
| 14 | Fonts self-hosted from `src/app/fonts/` (latin subsets) instead of `next/font/google` | Google Fonts fetches failed intermittently at build time (2 of ~8 builds), which would break Vercel deploys. Self-hosting is reliable and serves fonts from our CDN. |
| 15 | Session, theme and toast providers moved from the root layout into `/app` | Marketing pages don't use them; removing them cut main-thread work on mobile. |
| 16 | Marketing site publishes 121 of the 135 recipes (23 free) | Untitled and duplicate recipes are excluded until the data is fixed (MISSING_CONTENT.md). |
| 17 | Fakeaway Wall and hero use only recipes whose photo was checked against the title | Several AI photos don't match their recipe or contain garbled text. |

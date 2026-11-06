# 07 — Build plan

## Sitemap (EN at `/`, ES at `/es/…`)
| URL | Purpose | Sections | Content source | Primary CTA |
|---|---|---|---|---|
| `/` | Convert social traffic | Hero → proof (60kg + press) → Fakeaway Wall → How the app works → Ebook shelf → FAQ → Follow | Research 01, recipe data | Open the app (`/app`) |
| `/recipes` | SEO hub and browsing | Category filter, grid of 135 (free = full, premium = teaser) | data/recipes.public.json | Recipe page |
| `/recipes/[id]` | SEO landing page per recipe | Photo, macros, ingredients/steps (free) or teaser (premium), related recipes | Public data plus full free content | Unlock in app / Save in app |
| `/ebooks` | Single home for the books | 4 products with verified prices, links to existing checkout | Shopify listing (5 Nov 2026) | Buy on aussiefitnessbooks.com |
| `/about` | Story and trust | The swap story, press links, channels, contact | Press articles, Beacons | Follow / email |
| `/app` | The product (existing SPA) | — | — | Unlock |

## Journeys
1. TikTok → `/` → Fakeaway Wall → `/recipes/[id]` → `/app` → paywall.
2. Google "high protein big mac quesadilla" → `/recipes/[id]` → app.
3. Book fan → `/ebooks` → Shopify checkout.

## Motion spec
| Section | Trigger | Effect | Duration | Easing |
|---|---|---|---|---|
| Hero headline | load | lines rise 24px and fade in, staggered 80ms | 700ms | expo-out |
| Section headings | enters viewport | rise 32px + fade (CSS view timeline) | 0→35% of view range | linear (scroll-linked) |
| Fakeaway Wall | scroll through a 300vh section | track translates X 0 → −(width − viewport) | scroll-linked | linear |
| Protein numerals | card enters | count from 0 to its value | 900ms | expo-out |
| Media hover | pointer | scale 1.02 | 400ms | expo-out |
| Buttons | press | scale .97 | 150ms | ease |

## Admin / content model
Sanity is the default but **its connector isn't authorised in this session** (blocker). Content lives in typed modules shaped like a CMS schema, ready to move:
- `src/content/site.ts`: `siteSettings{socials, email}`, `press[]`, `ebooks[]{title, priceSale, priceRegular, url, blurb, status}`, `faq[]`.
- `src/content/i18n.ts`: UI strings in EN/ES.

User/premium administration stays in the existing app admin screen.

## SEO
- **Keywords:** high protein recipes, low calorie fakeaway, healthy McMuffin, high protein meal prep Australia, macro friendly recipes.
- **Metadata:** per-page title/description and OG image; canonical plus `hreflang` en / es / x-default.
- **Schema:** Organization (sameAs socials), WebSite, Recipe on every recipe page (nutrition, cookTime, recipeYield, image; ingredients/instructions only for free recipes), FAQPage on the home page.
- **URLs:** `/recipes/r001`. Slugs could replace ids later (redirects needed).

## Components
SiteHeader, SiteFooter, LangToggle, Button/LinkButton, RecipeTile, MacroLine, FakeawayWall, CountUp, EbookCard, PressStrip, Faq, SectionHeading.

## Architecture
The same Next.js 16 app. The marketing routes are server components under `src/app/(site)` and `src/app/es`, and the existing SPA moves from `/` to `/app`. Old `/?recipe=` and `/?tab=` links redirect.

## Acceptance criteria
- All CTAs resolve.
- No invented facts.
- Lighthouse mobile ≥ 90 on `/` and on a recipe page.
- No horizontal scroll at 360–1920px.
- Keyboard-navigable with visible focus.
- The reduced-motion experience is complete.
- Premium recipe steps don't appear on any marketing page.

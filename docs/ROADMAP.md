# AussieFit — Product Audit & Revenue Roadmap

**Goal:** A$1,000+/month in revenue by 31 Dec 2026 (≈8 weeks from 2 Nov 2026).
**Plan in one line:** stop giving the product away (done), deploy for real, switch to recurring pricing with a trial, add a goal-based onboarding quiz in front of the paywall, then push traffic in during the New Year fitness peak.

---

## 1. Audit

### What's strong ✅
| Area | Why it matters |
|---|---|
| **135 real recipes with macros + photos** | That's a real product, not a demo. The Aussie high-protein niche has a clear buyer. |
| **Planner → shopping list** | This is the feature people pay for. It turns recipes into a weekly habit. |
| **Server-side premium flag + Stripe webhook with signature check** | The payment plumbing is mostly right already. |
| **GDPR basics** (export, delete, change password), rate limiting, password reset | Saves weeks of work later. |
| **PWA + deep links + OG tags** | Installable on phones. Shared links open the right recipe. |

### What's broken or costing money ❌ (ranked by revenue impact)
| # | Problem | Impact | Status |
|---|---|---|---|
| 1 | **The paywall didn't gate anything.** Locked recipes still showed every ingredient and step. Only a badge changed. | Nobody had a reason to pay | ✅ **Fixed in this PR** |
| 2 | **All 110 premium recipes shipped in the client JS bundle** and through public `/api/recipes/*`. Anyone could read them in DevTools. | Content free to scrape | ✅ **Fixed in this PR** |
| 3 | **Checkout "demo mode" gave premium away for free** if Stripe env vars were missing, including in production | One bad deploy = free product for everyone | ✅ **Fixed** (returns 503 in prod) |
| 4 | Profile upgrade button said *"Demo purchase — no real charge"* | Kills trust at the moment of purchase | ✅ **Fixed** |
| 5 | "Unlock" buttons went to the Profile tab instead of opening checkout | An extra step with drop-off right where buying intent is highest | ✅ **Fixed** (global paywall) |
| 6 | **A$9.99 once, forever.** No recurring revenue, no trial, no annual plan | You'd need ~105 *new* buyers every month just to hold A$1k | 🔜 Week 2 |
| 7 | **SQLite + in-memory rate limiter.** Won't survive Vercel/serverless (the DB file isn't persisted) | Can't deploy as is | 🔜 Week 1 |
| 8 | **SPA with `/?recipe=r001` URLs.** No server-rendered recipe pages, no `Recipe` schema | Google recipe results (the biggest free traffic source for recipe sites) are unreachable | 🔜 Week 4 |
| 9 | No onboarding or personalisation. The app opens straight onto a recipe grid | Misses the proven nutrition-app funnel: quiz → personal plan → paywall | 🔜 Week 3 |
| 10 | No analytics or funnel events | You can't tell what's working | 🔜 Week 1 |
| 11 | Email login only. No Google/Apple sign-in | Sign-up friction right before payment | 🔜 Week 3 |
| 12 | Visuals: generic shadcn dark-green, emoji logo, amber/orange "premium" gradients that clash with the green brand | Doesn't look like something worth paying for | 🔜 Weeks 3–6 |
| 13 | Repo has unrelated cruft (`skills/` quiz/fortune/blog tools, `tool-results/`, `upload/*.docx`, `.zscripts/`, `worklog.md`) | Bloats deploys and risks leaking internal files | 🔜 Week 1 |
| 14 | ~25 MB of PNG recipe photos | Slow first load on 4G | 🔜 Week 4 (convert to WebP/AVIF at source) |
| 15 | Terms say "premium subscription", but the product is a one-off unlock | Legal copy doesn't match the product | Fix together with the pricing change |

> ⚠️ **Rights check:** the recipes appear to come from a cookbook (`sourcePage` field, `upload/Cook Book 101…docx`). Before charging money, confirm you own or have a licence for this content and the "Aussie Fitness" name.

---

## 2. The money math

Net per sale ≈ price − Stripe fee (~1.75% + A$0.30 for domestic cards).

| Model | Price | Net/sale | Sales needed for A$1k/mo | Compounds? |
|---|---|---|---|---|
| Current lifetime | A$9.99 | ~A$9.50 | **~105 every month** | ❌ starts from zero each month |
| Lifetime (re-priced) | A$59 | ~A$57.70 | ~18/mo | ❌ |
| Monthly sub | A$9.99/mo | ~A$9.50 | 105 *active* subs | ✅ |
| **Annual sub (recommended default)** | **A$49.99/yr, 7-day free trial** | ~A$48.80 | ~21 new annual subs/mo (cash) | ✅ renewals |

**Recommended paywall (3 options, annual pre-selected — the pattern used by Cal AI, Recime and Julienne on Mobbin):**
- **Annual — A$49.99/yr** · "7 days free" · shows *A$0.96/week* · badge "Best value" ← default
- **Monthly — A$9.99/mo**
- **Lifetime — A$99** (price anchor; a few buyers will take it)

Funnel to hit A$1k/mo: **~4,000 visitors/mo → 25% finish the quiz → 10% start a trial → 55% convert ≈ 55 paid/mo** at a blended ~A$20+ in month-one cash. That clears the target with room to spare. Traffic is the bottleneck, so weeks 4–8 are about distribution.

---

## 3. Roadmap (dated)

### ✅ Week 0 — Stop the leak (done in this PR)
- Premium recipes stripped from client data. Full content only comes from `/api/recipes/[id]` after a DB check.
- Recipe detail shows a 3-ingredient teaser, blurred rows and a locked directions card.
- One global Apple-style paywall, opened from any screen. Signed-out users sign up and land straight back on the paywall.
- Demo-mode free unlock is blocked in production.

### Week 1 (2–8 Nov) — Make it live
- [ ] Move to **Postgres on Supabase** (Supabase MCP is connected): change the `prisma/schema.prisma` provider and run `db push`.
- [ ] Deploy on **Vercel** (MCP connected), add the domain and HTTPS, and set env vars (`NEXTAUTH_*`, `STRIPE_*`, `RESEND_API_KEY`).
- [ ] Swap the in-memory rate limiter for Upstash Redis (serverless-safe).
- [ ] **Analytics:** Vercel Analytics + PostHog events: `quiz_start`, `quiz_complete`, `paywall_view{source}`, `checkout_start`, `purchase`.
- [ ] Clean the repo: remove `skills/`, `tool-results/`, `upload/`, `.zscripts/`, `examples/`, `worklog.md`.
- [ ] Stripe live mode. Run the LAUNCH.md smoke test.

### Week 2 (9–15 Nov) — Pricing that compounds
- [ ] Stripe **subscriptions** (annual + monthly with `trial_period_days: 7`) plus a lifetime one-off.
- [ ] Schema: replace `isPremium` with `plan`, `status`, `currentPeriodEnd` and `stripeCustomerId`. Handle `customer.subscription.updated/deleted` and `invoice.payment_failed`.
- [ ] **Stripe Customer Portal** link in Profile (cancel/upgrade without support emails).
- [ ] Paywall v2: 3-plan selector, annual pre-selected, "Cancel anytime", reminder before the trial ends.
- [ ] More paywall triggers: 4th free-recipe view, a planner day beyond Monday, and "Import to shopping" with premium meals.
- [ ] Update Terms/Refund copy to match.

### Week 3 (16–22 Nov) — Onboarding quiz → personal plan → paywall
Pattern: [Cal AI onboarding](https://mobbin.com/flows/05ca2ff4-106a-4fda-a0dd-3cc9b73a83c1) and [Lifesum onboarding](https://mobbin.com/flows/f373ce15-3f4e-4d88-aa24-365969ad35eb).
- [ ] 6–8 one-question screens: goal (cut / maintain / build) → sex → age/height/weight → activity → diet preferences → "how did you hear about us" (free attribution data).
- [ ] Compute calories and protein targets (Mifflin-St Jeor) and prefill `goals` and a **7-day plan built from the recipes**.
- [ ] "Your plan is ready" screen with a weekly macro chart, then **Continue with Google / Apple / Email**, then the paywall.
- [ ] Google OAuth in NextAuth (Apple later, with the App Store build).

### Week 4 (23–29 Nov) — SEO + Black Friday
- [ ] Server-rendered `/recipes/[slug]` pages with **`Recipe` JSON-LD** (calories, protein, cook time, image). Free recipes show in full. Premium pages show macros, a teaser and the paywall.
- [ ] Category pages: `/high-protein-desserts`, `/meal-prep`, `/under-400-calories`.
- [ ] Per-recipe OG images (`next/og`) so shared links look premium.
- [ ] Convert photos to WebP/AVIF at source.
- [ ] **Black Friday (27 Nov – 1 Dec):** 40% off annual. The landing hero carries the offer.

### Weeks 5–6 (30 Nov – 13 Dec) — Apple-grade redesign (see §4)
- [ ] Design tokens, then light-mode default plus dark mode, a large-title nav, inset grouped lists and a translucent tab bar.
- [ ] Recipe card and detail redesign: full-bleed photo, macro ring (MyFitnessPal/BitePal style), sticky "Start cooking" CTA.
- [ ] Cook mode: full-screen steps, screen wake lock, timers.

### Weeks 7–8 (14–31 Dec) — Distribution for the New Year peak
- [ ] **Lead magnet:** free "7-Day High-Protein Kickstart" PDF in exchange for an email (Resend audience), then a 5-email nurture sequence ending with a trial offer.
- [ ] **Short-form video:** 1–2 Reels/TikToks a day from the recipe photos and macros ("600-cal burrito, 52g protein"). Bio link goes to `/quiz`.
- [ ] Creator/affiliate program: Stripe promo codes, 30% commission for gym PTs and fitness creators.
- [ ] **New Year campaign (26 Dec – 7 Jan):** "New Year, New Macros." Trial plus annual discount.

### Q1 2027 — Scale
- Capacitor wrapper → **App Store / Play Store** (RevenueCat for IAP).
- AI meal-plan generator from goals and pantry. Weekly new-recipe drops (this is what justifies the subscription).
- Progress tracking (weight and streaks) for retention.

---

## 4. Design direction — "Apple-grade" (from Mobbin research)

**References**
- Paywalls: [Cal AI](https://mobbin.com/screens/e145982d-dec3-4809-9325-816c72f9db32) · [Julienne](https://mobbin.com/screens/321d991f-a691-45e8-8da8-59b702cc8be9) · [Recime](https://mobbin.com/screens/f89f0917-99c3-4075-909a-af87e6ee4ee5) · [CREME](https://mobbin.com/screens/2d996403-3c1f-4b54-add9-8aee1c5245f7) · [Kitchen Stories](https://mobbin.com/screens/69690089-d01d-4918-a307-39642320e4b2)
- Recipe and macros: [MyFitnessPal](https://mobbin.com/screens/d7116fe0-5bed-4092-a095-78d6571ed3f4) · [BitePal](https://mobbin.com/screens/1ac5fda3-e96e-45c7-aa0c-b2df907e3fd7) · [MacroFactor](https://mobbin.com/screens/7774ef8b-ee7f-4ff5-b120-8655fe04a862) · [Cal AI nutrition](https://mobbin.com/screens/8f1819cc-d091-4085-934d-e01e1295f717)
- Onboarding: [Cal AI flow](https://mobbin.com/flows/05ca2ff4-106a-4fda-a0dd-3cc9b73a83c1) · [Lifesum flow](https://mobbin.com/flows/f373ce15-3f4e-4d88-aa24-365969ad35eb)

**What they have in common, and the rules for AussieFit**
1. **One accent colour.** Keep the green for macros and progress only. CTAs are **solid black pills** (white pills in dark mode), as in Cal AI, CREME and Julienne. Drop the amber/orange gradients.
2. **Food photography carries the design.** Full-bleed photo headers, everything else neutral.
3. **System-like type:** `-apple-system, "SF Pro Display", Inter`. Large titles 34/41 bold with −0.4 tracking, body 17, captions 13.
4. **Neutral surfaces:** light `#F2F2F7` page with `#FFFFFF` cards. Dark `#000` page with `#1C1C1E` cards. Hairlines at 0.5px `rgba(60,60,67,.29)`.
5. **Radius scale:** 12 (rows), 20 (cards), 28 (sheets), full (pills). Soft single shadow `0 8px 30px rgba(0,0,0,.08)`.
6. **Glass where it's earned:** translucent tab bar and nav (`backdrop-filter: saturate(180%) blur(20px)`), never on content.
7. **Motion:** spring sheet presentation (framer-motion, `stiffness 400, damping 32`), 0.98 press scale, no bouncing badges.
8. **Paywall anatomy:** photo header → 2-line headline → 3–4 ✓ benefits → plan selector (annual pre-selected) → black CTA → "Cancel anytime · Restore · Terms".

---

## 5. Metrics to watch weekly
| Metric | Target by Dec |
|---|---|
| Visitors / mo | 4,000+ |
| Quiz completion | ≥ 25% of visitors |
| Paywall view → trial/checkout start | ≥ 10% |
| Trial → paid | ≥ 50% |
| Refund rate | < 5% |
| **MRR + one-off revenue** | **≥ A$1,000** |

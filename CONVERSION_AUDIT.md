# Conversion audit: Aussie Fitness website

Date: 6 Nov 2026. Method: the `cro` and `copywriting` skills from [coreyhaines31/marketingskills](https://github.com/coreyhaines31/marketingskills) (MIT, installed in `.claude/skills/`), applied to the built site at desktop (1440px) and mobile (390px).

**Page type:** brand homepage + recipe SEO pages. **Primary conversion:** an ebook or app purchase. **Traffic (inference):** cold, mobile, arriving from TikTok, Instagram and YouTube Shorts.

## What changed in this pass

| Area | Before | After |
|---|---|---|
| Hero | AI burger photo, "Eat the food you crave. Hit your macros anyway." | Frame from Dez's own Short; "Eat the takeaway. Lose the weight." with two real macro numbers (96g pizza, 70g nuggets) and a 13.7M-views badge linking to YouTube |
| Proof | A big "60kg" and text | Real before/after photos from Dez's Payhip shop, with a results disclaimer |
| Social proof | Press links only | **New reel:** Dez's 8 most-watched Shorts with public view counts (2.6M, 2.2M, 1.1M …), each opening the video |
| App | Copy existed but the section wasn't on the page | Restored: 3 steps, $9.99 once, "Unlock all 135 recipes" |
| Cookbooks | Typographic cards, only on /ebooks | Official covers (real food photography), now also on the homepage |
| Story page | "[NEEDS CLIENT INPUT]" placeholder | Real photo of Dez meal-prepping, Dez's own quote |
| Copy | Generic, with AI tells ("Zero bland", "No bland chicken and broccoli", "didn't lose 60kg by… He swapped.") | Rewritten in Dez's voice with only checkable claims. EN + ES |
| FAQ | 5 questions | Added "Which cookbook should I start with?" and "I'm not in Australia. Can I still buy?" |

## Quick wins (do now)

1. **Turn on analytics.** `src/lib/track.ts` is a no-op, so nothing is measured today. Add Plausible or GA4, plus the **TikTok and Meta pixels**, since that's where the traffic comes from. Without them there's no conversion rate to improve and no audience to retarget. Events are already named in the code; they just go nowhere.
2. **Add an instant "Buy now" next to WhatsApp.** The main funnel ends in a WhatsApp chat where a person has to reply and arrange payment. Every hour of wait loses buyers, and the number is Bolivian (+591) for an Australian brand, which some visitors will hesitate over. Keep WhatsApp for questions and custom orders, and make the Shopify checkout (instant download) the primary button on each pack. Recommended pack → "Buy now · instant download" → Shopify.
3. **Cut a field from the order builder.** Step 3 asks for name, email, country and a note before WhatsApp opens. WhatsApp already identifies the sender. Ask only for email (where the ebook goes) and drop country.
4. **Add a sticky mobile CTA.** The mobile homepage is about 14,000px tall and the main CTA only appears in the hero, the order section and the follow card. A slim bottom bar ("Find my cookbook · from $38.99") after the hero scrolls away would keep the next step in reach.
5. **Show the Bundle maths.** Elite + Fakeaway cost $83.98 separately; the Bundle (all four books) is $79.99. Put that line on the Bundle card. The copy already says it in the order builder.

## High-impact changes (prioritise)

1. **Capture email before you ask for money.** This is the biggest gap. Cold TikTok visitors mostly aren't ready to pay on the first visit, and the site has no way to bring them back. Offer a free PDF ("5 fakeaway swaps Dez still eats every week") for an email, then send a 5-email sequence: story → 3 recipes → Bundle offer. `RESEND_API_KEY` is already wired for email in the app.
2. **Replace the AI food photos.** The Fakeaway Wall, the free-recipe tiles and all 121 recipe pages still use AI-generated images (`public/recipes/`). Next to the real before/after and Shorts frames they now look *more* fake. Fastest fix: the client sends one finished-dish frame per recipe from the original videos; `scripts/import-media.mjs` already handles the import. Until then, consider linking each recipe page to its Short ("Watch Dez make it").
3. **Get real testimonials.** No customer reviews are shown, because none could be verified. Ask for (a) screenshots of DMs/comments from people who cooked the recipes or lost weight, with permission, and (b) the Shopify/Payhip review or sales count. One sentence like "4,000+ cookbooks sold" next to the CTA would outperform anything else on the page. `[NEED: sales count or review export]`
4. **Fix the refund contradiction.** The store says digital copies have "no refunds"; the app has a 14-day guarantee. A risk reversal on the cookbooks ("Cook 3 recipes. Not for you? Full refund within 14 days.") removes the main objection to a $79.99 PDF. The client must approve the policy first.
5. **Make recipe pages convert.** They're the SEO entry points. Each locked recipe should show the macros, a photo, "Watch the video", and two offers: the app ($9.99, this recipe plus 134 more) and the cookbook it comes from (`sourcePage` exists in the data). Add the email capture here too.

## Test ideas (A/B, once analytics is live)

| Test | Hypothesis |
|---|---|
| Hero headline: "Eat the takeaway. Lose the weight." vs "Dez lost 60kg eating burgers. Here's how he made them." vs "The fast-food cookbook that took Dez from 135kg to 75kg." | Story-led and specific beats clever; the third adds the product |
| Hero CTA: "Find my cookbook" (quiz) vs "Get the Bundle · $79.99" (direct) | Direct pricing converts warm traffic; the quiz converts cold |
| Before/after above the fold on mobile vs in the proof section | The transformation is the hook on TikTok, so it may need to be seen first |
| Reel cards open YouTube vs play inline in a modal | Inline keeps people on the page (needs `frame-src https://www.youtube-nocookie.com` in the CSP) |
| WhatsApp-first vs Shopify-first on pack cards | Measures the chat-reply drop-off directly |

## Copy alternatives

**Headline**
- A: *Eat the takeaway. Lose the weight.* (live). Short, mirrors the brand's whole promise.
- B: *Dez lost 60kg eating burgers. Here are the recipes.* Leads with the proof and points at the product.
- C: *Your Friday night order, with 96g of protein.* Specific and visual; good for ads on the pizza Short.

**Primary CTA**
- A: *Find my cookbook* (live). Matches the quiz.
- B: *Get the recipes Dez used*. Ties to the story.
- C: *Start with the Bundle · $79.99*. Shows the price for warm traffic.

## Claims declined (and what would unlock them)

| Wanted claim | Why not | Unlock |
|---|---|---|
| Follower count ("4M followers") | Sources disagree (1.3M vs 4.4M) | Screenshot of each platform's profile |
| "Thousands of people have lost weight" | No evidence | Customer stories with permission |
| Number of cookbooks sold | Unknown | Shopify/Payhip sales export |
| "New recipe every week" | Posting cadence unverified | Client confirms the schedule |
| Before photo labelled "135kg" | The photo isn't dated or weighed | Client confirms when it was taken |

## Compliance notes

- Before/after photos now carry "Dez's own result. Yours will depend on your diet, training and starting point." Keep it under any transformation image or ad (ACL / platform ad policies on weight-loss claims).
- "Was" prices on every ebook are a permanent sale per the store. Under the ACL, strike-through prices must reflect a genuine former price. Review with the client (DECISIONS.md #13).
- YouTube view counts are dated (6 Nov 2026) on the page. Refresh them before quoting in ads.

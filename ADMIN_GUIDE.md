# Admin guide (no coding needed)

Website content lives in two files on GitHub. You edit them in the browser, and Vercel republishes the site about 2 minutes after you save.

## How to edit
1. Open the repository on GitHub and go to the file (paths below).
2. Click the ✏️ pencil icon ("Edit this file").
3. Change only the text **between quote marks** `'like this'`. Keep the quotes, commas and brackets.
4. Click **Commit changes**. If it asks, choose "Commit directly to the main branch".
5. Wait ~2 minutes, then refresh the website.

If something breaks, open the file's **History** on GitHub and revert your last change. A broken edit fails the build, so the live site keeps showing the previous version.

## What to edit where
| I want to change… | File | Look for |
|---|---|---|
| Ebook prices, links, titles | `src/content/site.ts` | `ebooks` and `PRICES_CHECKED` (update the date when you re-check prices) |
| Instagram/TikTok/YouTube/Facebook links | `src/content/site.ts` | `socials` |
| Business email | `src/content/site.ts` | `email` |
| Press articles | `src/content/site.ts` | `press` |
| Headlines, buttons, FAQ (English) | `src/content/i18n.ts` | the `en` block |
| Same in Spanish | `src/content/i18n.ts` | the `es` block |
| The app's price label | `src/lib/pricing.ts` | `PRICE_LABEL` (must match the Stripe price) |

## Users, premium and refunds
Use the app's **Admin** tab (sign in at `/app` with an admin account) to find users, grant or remove premium, and add accounts.

## Rules
- Only publish facts you can prove: no made-up reviews, follower numbers or "limited time" claims.
- Recipes themselves (ingredients/steps) are in `data/recipes.json`. Ask a developer before editing that file.

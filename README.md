# Aussie Fitness: website + AussieFit app

One Next.js 16 app serving:

| URL | What |
|---|---|
| `/`, `/recipes`, `/recipes/[id]`, `/ebooks`, `/about` | Marketing website (English) |
| `/es/...` | The same pages in Spanish |
| `/app` | The AussieFit recipe app (planner, shopping list, paywall) |
| `/api/...` | App API (auth, Stripe, user data) |

## Run locally
```bash
bun install          # also runs prisma generate
cp .env.example .env.local   # fill in values (see below)
bun run dev          # http://localhost:3000
```
`bun run build` builds for production. `predev`/`prebuild` regenerate `data/recipes.public.json` (the stripped recipe data the browser is allowed to see).

## Environment variables
See `.env.example`. Required: `DATABASE_URL`, `DIRECT_URL` (Supabase Postgres), `NEXTAUTH_SECRET`, `NEXTAUTH_URL`. Optional until launch: `STRIPE_*`, `RESEND_API_KEY`.
The marketing pages build and run without any secrets. Only `/app` and `/api` need them.

## Deploy
Vercel project **aussiefit** (team marvinmcv-svg's projects), functions in `syd1` (`vercel.json`), next to the Supabase database (`aussiefit`, ap-southeast-2). Set env vars in Vercel → Settings → Environment Variables.

## Where things live
| Path | Contents |
|---|---|
| `src/content/site.ts` | Brand facts, socials, press links, ebooks and prices |
| `src/content/i18n.ts` | All website copy, English + Spanish |
| `src/content/site-recipes.ts` | Which recipes the website publishes |
| `src/components/site/` | Website components and pages |
| `src/app/(site)/` | Website routes |
| `src/app/app/` + `src/components/screens/` | The app |
| `data/recipes.json` | Full recipes (**server only**) |
| `research/`, `DECISIONS.md`, `MISSING_CONTENT.md`, `ASSET_RIGHTS_REVIEW.md` | Brand research and project decisions |

Editing content without code: see `ADMIN_GUIDE.md`.

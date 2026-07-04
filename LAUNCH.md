# Launch Checklist — Aussie Fitness Cookbook

Complete this checklist to go live. Items are ordered by priority.

---

## 🔴 Must-Do Before Launch (blocking)

### 1. Set a Real NEXTAUTH_SECRET ✅ Done
Already generated in `.env`. The secret is a random 32-byte base64 string.
If you need to regenerate: `openssl rand -base64 32`

### 2. Configure Stripe (for real payments)

1. **Create a Stripe account** at https://stripe.com
2. **Create a product**:
   - Go to Stripe Dashboard → Products → Add product
   - Name: "Premium Unlock"
   - Pricing: One-time, $9.99 AUD
   - Copy the **Price ID** (starts with `price_`)
3. **Get your API keys**:
   - Dashboard → Developers → API Keys
   - Copy the **Secret key** (starts with `sk_test_` for test mode, `sk_live_` for production)
4. **Set up the webhook**:
   - Dashboard → Developers → Webhooks → Add endpoint
   - URL: `https://yourdomain.com/api/stripe/webhook`
   - Events: `checkout.session.completed`
   - Copy the **Signing secret** (starts with `whsec_`)
5. **Update `.env`**:
   ```
   STRIPE_SECRET_KEY=sk_live_your_real_key
   STRIPE_WEBHOOK_SECRET=whsec_your_real_secret
   STRIPE_PRICE_ID=price_your_real_price_id
   ```

### 3. Get a Domain + HTTPS

1. Buy a domain (e.g., via Namecheap, GoDaddy)
2. Set up DNS to point to your hosting provider
3. Ensure HTTPS is enabled (most hosts provide free SSL via Let's Encrypt)
4. Update `.env`:
   ```
   NEXTAUTH_URL=https://yourdomain.com
   ```

---

## 🟡 Should-Do Before Launch (important)

### 4. Configure Email (for password reset)

1. **Sign up for Resend** at https://resend.com (free tier: 3,000 emails/month)
2. **Verify your sending domain** (follow Resend's DNS setup guide)
3. **Get your API key** (starts with `re_`)
4. **Update `.env`**:
   ```
   RESEND_API_KEY=re_your_real_key
   ```
5. **Update `src/lib/email.ts`** line 14:
   ```ts
   const FROM_EMAIL = 'Aussie Fitness <noreply@yourdomain.com>';
   ```
   Replace `yourdomain.com` with your verified domain.

### 5. Migrate to PostgreSQL (for production)

SQLite works for <100 concurrent users, but PostgreSQL is recommended for production.

1. **Create a database** (free options):
   - [Supabase](https://supabase.com) — Free tier, 500MB
   - [Neon](https://neon.tech) — Free tier, 3GB
   - [Railway](https://railway.app) — $5/month
2. **Get the connection string** (starts with `postgresql://`)
3. **Update `prisma/schema.prisma`**:
   ```prisma
   datasource db {
     provider = "postgresql"  // Change from "sqlite"
     url      = env("DATABASE_URL")
   }
   ```
4. **Update `.env`**:
   ```
   DATABASE_URL=postgresql://user:password@host:5432/dbname
   ```
5. **Push the schema**:
   ```bash
   bun run db:push
   ```
6. **Seed the admin user**:
   ```bash
   bun scripts/seed_admin.ts
   ```

### 6. Legal Pages ✅ Done
Terms of Service, Privacy Policy, and Refund Policy are built into the app
(accessible from Profile → Legal section).

---

## 🟢 Post-Launch (nice to have)

### 7. Add Analytics
- [Plausible](https://plausible.io) — $9/month, privacy-friendly
- [PostHog](https://posthog.com) — Free tier, more features
- Add the tracking script to `src/app/layout.tsx`

### 8. Add Error Tracking
- [Sentry](https://sentry.io) — Free tier, 5,000 errors/month
- `bun add @sentry/nextjs`
- Follow [Sentry's Next.js setup guide](https://docs.sentry.io/platforms/javascript/guides/nextjs/)

### 9. Set Up Backups
- If using Supabase/Neon: automatic daily backups included
- If self-hosted: set up `pg_dump` cron job

### 10. Monitor Uptime
- [UptimeRobot](https://uptimerobot.com) — Free, monitors your site every 5 minutes

---

## Pre-Launch Smoke Test

After completing the must-do items, verify:

- [ ] App loads at `https://yourdomain.com`
- [ ] User can sign up with a real email
- [ ] User can sign in
- [ ] User can favorite a recipe (syncs to DB)
- [ ] User can add a meal to the planner (syncs to DB)
- [ ] User can add a shopping item (syncs to DB)
- [ ] User can complete a Stripe checkout (test mode first, then live)
- [ ] Premium is granted after payment
- [ ] Password reset email arrives (check spam folder)
- [ ] Admin can log in and see the dashboard
- [ ] sitemap.xml is accessible at `/sitemap.xml`
- [ ] robots.txt is accessible at `/robots.txt`

---

## Environment Variables Summary

| Variable | Required | Example |
|----------|----------|---------|
| `DATABASE_URL` | Yes | `postgresql://...` or `file:./db/custom.db` |
| `NEXTAUTH_SECRET` | Yes | `openssl rand -base64 32` |
| `NEXTAUTH_URL` | Yes | `https://yourdomain.com` |
| `STRIPE_SECRET_KEY` | For payments | `sk_live_...` |
| `STRIPE_WEBHOOK_SECRET` | For payments | `whsec_...` |
| `STRIPE_PRICE_ID` | For payments | `price_...` |
| `RESEND_API_KEY` | For email | `re_...` |

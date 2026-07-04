/**
 * Environment variable validation.
 * Importing this module fails fast if required vars are missing.
 * Stripe vars are optional — the app runs in "demo mode" without them
 * (admin can manually grant premium via the admin panel).
 */

const required = {
  DATABASE_URL: process.env.DATABASE_URL,
  NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
  NEXTAUTH_URL: process.env.NEXTAUTH_URL,
} as const;

const missing = Object.entries(required).filter(([, v]) => !v).map(([k]) => k);

if (missing.length > 0) {
  throw new Error(
    `Missing required environment variables: ${missing.join(', ')}.\n` +
    `Set these in your .env file or deployment environment.\n` +
    `NEXTAUTH_SECRET must be a random string (run: openssl rand -base64 32).`
  );
}

// Stripe is optional — if not configured, payments are disabled (demo mode)
const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
const stripeConfigured = !!stripeSecretKey && !stripeSecretKey.includes('placeholder');

export const env = {
  DATABASE_URL: required.DATABASE_URL!,
  NEXTAUTH_SECRET: required.NEXTAUTH_SECRET!,
  NEXTAUTH_URL: required.NEXTAUTH_URL!,
  NODE_ENV: process.env.NODE_ENV ?? 'development',
  STRIPE_SECRET_KEY: stripeSecretKey,
  STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
  STRIPE_PRICE_ID: process.env.STRIPE_PRICE_ID,
  STRIPE_ENABLED: stripeConfigured,
  RESEND_API_KEY: process.env.RESEND_API_KEY,
} as const;

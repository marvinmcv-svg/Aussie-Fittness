import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import Stripe from 'stripe';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { env } from '@/lib/env';

export const dynamic = 'force-dynamic';

/**
 * POST /api/stripe/checkout
 * Creates a Stripe Checkout session for the one-time premium unlock.
 *
 * - Requires authentication (we need to know WHO is paying)
 * - If Stripe is not configured (demo mode), grants premium directly in DB
 * - If Stripe IS configured, returns a checkout URL to redirect to
 */
export async function POST() {
  // 1. Authenticate the user
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'You must be signed in to purchase' }, { status: 401 });
  }

  // 2. Check if already premium (no need to pay twice)
  const user = await db.user.findUnique({ where: { id: session.user.id } });
  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }
  if (user.isPremium) {
    return NextResponse.json({ error: 'You already have premium access' }, { status: 400 });
  }

  // 3. If Stripe is NOT configured → demo mode: grant premium directly
  //    This is for development/testing only. In production, Stripe MUST be configured.
  if (!env.STRIPE_ENABLED) {
    await db.user.update({
      where: { id: user.id },
      data: { isPremium: true },
    });
    console.warn(
      `[DEMO MODE] Granted premium to ${user.email} without Stripe payment. ` +
      `Set STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, and STRIPE_PRICE_ID to enable real payments.`
    );
    return NextResponse.json({
      demo: true,
      message: 'Premium granted in demo mode (Stripe not configured)',
    });
  }

  // 4. Stripe IS configured → create a real Checkout session
  try {
    const stripe = new Stripe(env.STRIPE_SECRET_KEY!);

    const checkoutSession = await stripe.checkout.sessions.create({
      mode: 'payment', // one-time payment (not subscription)
      line_items: [
        {
          price: env.STRIPE_PRICE_ID,
          quantity: 1,
        },
      ],
      // Pass the user ID so the webhook knows who to upgrade
      client_reference_id: user.id,
      customer_email: user.email,
      success_url: `${env.NEXTAUTH_URL}/?payment=success`,
      cancel_url: `${env.NEXTAUTH_URL}/?payment=cancelled`,
      metadata: {
        userId: user.id,
        email: user.email,
      },
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (error) {
    console.error('Stripe checkout error:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}

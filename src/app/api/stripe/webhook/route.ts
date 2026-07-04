import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { db } from '@/lib/db';
import { env } from '@/lib/env';

export const dynamic = 'force-dynamic';

/**
 * POST /api/stripe/webhook
 * Receives Stripe webhook events and grants premium on successful payment.
 *
 * This endpoint does NOT use NextAuth — it authenticates via the Stripe
 * signature header instead. The route must be registered in the Stripe
 * Dashboard → Developers → Webhooks.
 *
 * Key event: `checkout.session.completed` → mark user as premium in DB
 */
export async function POST(request: Request) {
  // If Stripe isn't configured, no webhooks to process
  if (!env.STRIPE_ENABLED || !env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json(
      { error: 'Webhook not configured' },
      { status: 501 }
    );
  }

  const stripe = new Stripe(env.STRIPE_SECRET_KEY!);
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json(
      { error: 'Missing stripe-signature header' },
      { status: 400 }
    );
  }

  // Verify the webhook signature (prevents forged requests)
  let event: Stripe.Event;
  try {
    const body = await request.text(); // Raw body needed for signature verification
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return NextResponse.json(
      { error: 'Invalid signature' },
      { status: 400 }
    );
  }

  // Handle the checkout.session.completed event
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;

    // Get the user ID from client_reference_id or metadata
    const userId = session.client_reference_id ?? session.metadata?.userId;

    if (!userId) {
      console.error('Webhook: no userId in checkout session', session.id);
      return NextResponse.json(
        { error: 'No user ID associated with this payment' },
        { status: 400 }
      );
    }

    // Grant premium in the database
    try {
      const updated = await db.user.update({
        where: { id: userId },
        data: { isPremium: true },
        select: { id: true, email: true, isPremium: true },
      });
      console.log(`[Stripe Webhook] Granted premium to ${updated.email} (${updated.id})`);
    } catch (err) {
      console.error('Webhook: failed to update user:', err);
      return NextResponse.json(
        { error: 'Failed to grant premium' },
        { status: 500 }
      );
    }
  }

  // Acknowledge receipt of the event
  return NextResponse.json({ received: true });
}

import { NextResponse } from 'next/server';
import { randomBytes } from 'crypto';
import { db } from '@/lib/db';
import { env } from '@/lib/env';
import { z } from 'zod';
import { rateLimit } from '@/lib/rateLimit';
import { sendPasswordResetEmail } from '@/lib/email';

export const dynamic = 'force-dynamic';

const schema = z.object({
  email: z.string().email('Invalid email address'),
});

/**
 * POST /api/auth/forgot-password
 * Generates a password reset token and "sends" a reset email.
 *
 * In production: integrate with Resend, SendGrid, or similar.
 * In dev mode: logs the reset link to the server console.
 *
 * Always returns 200 (even if email doesn't exist) to prevent email enumeration.
 */
export async function POST(request: Request) {
  // Rate limit: 3 requests per IP per 15 minutes (prevent abuse)
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0] ?? 'unknown';
  const { allowed } = rateLimit(`forgot:${ip}`, 3, 15 * 60 * 1000);
  if (!allowed) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      { status: 429 }
    );
  }

  try {
    const body = await request.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }

    const email = parsed.data.email.toLowerCase().trim();
    const user = await db.user.findUnique({ where: { email } });

    // Always return success — don't reveal if email exists
    if (!user) {
      return NextResponse.json({ success: true });
    }

    // Generate a secure random token
    const token = randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Invalidate any existing tokens for this user
    await db.passwordResetToken.updateMany({
      where: { userId: user.id, used: false },
      data: { used: true },
    });

    // Create the new token
    await db.passwordResetToken.create({
      data: {
        userId: user.id,
        token,
        expiresAt,
      },
    });

    // Build the reset URL
    const resetUrl = `${env.NEXTAUTH_URL}/?reset=${token}`;

    // Send the email (uses Resend if configured, falls back to console.log)
    await sendPasswordResetEmail(user.email!, resetUrl);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
}

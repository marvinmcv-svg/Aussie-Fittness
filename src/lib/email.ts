import { Resend } from 'resend';
import { env } from '@/lib/env';

/**
 * Email service — uses Resend when RESEND_API_KEY is set,
 * falls back to console.log in development.
 *
 * To enable real emails:
 * 1. Sign up at https://resend.com (free tier: 3,000 emails/month)
 * 2. Add RESEND_API_KEY=re_xxxxx to your .env
 * 3. Verify your sending domain in Resend dashboard
 * 4. Update FROM_EMAIL below to your verified domain
 */

const FROM_EMAIL = 'Aussie Fitness <noreply@yourdomain.com>';

const resend = env.RESEND_API_KEY ? new Resend(env.RESEND_API_KEY) : null;

export async function sendPasswordResetEmail(to: string, resetUrl: string) {
  if (resend) {
    // Production: send real email via Resend
    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: 'Reset your password — Aussie Fitness Cookbook',
      html: `
        <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
          <h2 style="color: #0a0f0d;">Reset your password</h2>
          <p style="color: #555; line-height: 1.6;">
            We received a request to reset your password for your Aussie Fitness Cookbook account.
            Click the button below to set a new password:
          </p>
          <a href="${resetUrl}" style="display: inline-block; background: #22c55e; color: white; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-weight: bold; margin: 16px 0;">
            Reset Password
          </a>
          <p style="color: #999; font-size: 13px; line-height: 1.5;">
            This link expires in 1 hour. If you didn't request this, you can safely ignore this email.
          </p>
          <p style="color: #999; font-size: 13px;">
            Or copy this link: ${resetUrl}
          </p>
        </div>
      `,
    });

    if (error) {
      console.error('Failed to send password reset email:', error);
      throw new Error('Failed to send email');
    }
  } else {
    // Dev mode: log to console
    console.log('\n📧 PASSWORD RESET EMAIL (dev mode — set RESEND_API_KEY for real emails)');
    console.log(`   To: ${to}`);
    console.log(`   Reset URL: ${resetUrl}`);
    console.log('');
  }
}

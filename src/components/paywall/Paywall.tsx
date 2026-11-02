'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useSession } from 'next-auth/react';
import { Check, ShieldCheck, X } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { AuthModal } from '@/components/auth/AuthModal';
import { usePaywall } from '@/store/paywall';
import { usePremium } from '@/store/premium';
import { getRecipeStats } from '@/lib/recipes';

const PRICE_LABEL = '$9.99';

/**
 * Single, global paywall. Mounted once in page.tsx and opened via
 * `usePaywall.getState().show(source)` from any screen.
 *
 * Layout follows the iOS paywall pattern common to top recipe/nutrition apps
 * (photo header → benefit checklist → price card → one black pill CTA →
 * reassurance line). Signed-out users are sent through sign-up first and land
 * straight back on the paywall afterwards.
 */
export function Paywall() {
  const { open, hide } = usePaywall();
  const { status } = useSession();
  const isPremium = usePremium((s) => s.isPremium);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const stats = getRecipeStats();

  if (!open || isPremium || status === 'loading') return null;

  if (status === 'unauthenticated') {
    // Sign up first; on success the session flips to authenticated and the
    // paywall below renders without the user having to find the button again.
    return <AuthModal open onClose={hide} onSuccess={() => {}} mode="signup" />;
  }

  const handlePurchase = async () => {
    setProcessing(true);
    setError(null);
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to start checkout');
      if (data.url) {
        window.location.href = data.url;
        return;
      }
      if (data.demo) {
        window.location.reload();
        return;
      }
      throw new Error('Unexpected response from server');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
      setProcessing(false);
    }
  };

  const benefits = [
    `All ${stats.total} recipes — ${stats.premiumCount} premium unlocked`,
    'Full ingredients, steps & serving scaler',
    'Weekly planner → one-tap shopping list',
    'Every new recipe we add, free',
  ];

  return (
    <Dialog open onOpenChange={(o) => !o && hide()}>
      <DialogContent
        showCloseButton={false}
        className="max-w-md gap-0 overflow-hidden rounded-[28px] border-white/10 p-0"
        aria-describedby="paywall-desc"
      >
        <div className="relative h-44 w-full">
          <Image
            src="/recipes/hero-spread.png"
            alt=""
            fill
            sizes="448px"
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-background" />
          <button
            onClick={hide}
            aria-label="Close"
            className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-md"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="px-6 pb-6">
          <DialogTitle className="text-[26px] font-bold leading-tight tracking-tight">
            Cook every recipe.
            <br />
            <span className="text-muted-foreground">Hit every macro.</span>
          </DialogTitle>
          <DialogDescription id="paywall-desc" className="sr-only">
            Unlock all premium recipes with a one-time payment.
          </DialogDescription>

          <ul className="mt-4 space-y-2.5">
            {benefits.map((b) => (
              <li key={b} className="flex items-center gap-3 text-[15px]">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary">
                  <Check className="h-3 w-3 text-primary-foreground" strokeWidth={3} aria-hidden="true" />
                </span>
                {b}
              </li>
            ))}
          </ul>

          <div className="mt-5 flex items-center justify-between rounded-2xl border-2 border-primary bg-primary/5 px-4 py-3.5">
            <div>
              <div className="text-[15px] font-semibold">Lifetime access</div>
              <div className="text-xs text-muted-foreground">Pay once. No subscription.</div>
            </div>
            <div className="text-right">
              <div className="text-xl font-bold tracking-tight">{PRICE_LABEL}</div>
              <div className="text-[11px] text-muted-foreground">AUD</div>
            </div>
          </div>

          {error && (
            <div role="alert" className="mt-3 rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}

          <button
            onClick={handlePurchase}
            disabled={processing}
            className="mt-4 flex h-14 w-full items-center justify-center gap-2 rounded-full bg-foreground text-[17px] font-semibold text-background transition-transform active:scale-[0.98] disabled:opacity-70"
          >
            {processing ? (
              <span className="h-5 w-5 animate-spin rounded-full border-2 border-background/30 border-t-background" />
            ) : (
              `Unlock everything — ${PRICE_LABEL}`
            )}
          </button>

          <p className="mt-3 flex items-center justify-center gap-1.5 text-center text-xs text-muted-foreground">
            <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
            14-day money-back guarantee · Secure checkout by Stripe
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

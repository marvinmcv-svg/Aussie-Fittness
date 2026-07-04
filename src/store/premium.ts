'use client';

import { create } from 'zustand';

interface PremiumState {
  /** Whether the user has premium access. Set ONLY from the server session. */
  isPremium: boolean;
  /** Internal setter — only called by the session sync effect in page.tsx */
  _setPremium: (value: boolean) => void;
}

/**
 * Premium store — READ ONLY from the client's perspective.
 *
 * The `isPremium` value is synced from the NextAuth session (server-side DB
 * check) in page.tsx. There is NO `unlockPremium()` method — premium can only
 * be granted by:
 *   1. A successful Stripe payment (via webhook → DB update)
 *   2. An admin manually toggling it (via admin API → DB update)
 *
 * This prevents the previous bypass where users could set localStorage to
 * get free premium.
 */
export const usePremium = create<PremiumState>()((set) => ({
  isPremium: false,
  _setPremium: (value) => set({ isPremium: value }),
}));

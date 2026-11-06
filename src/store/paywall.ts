'use client';

import { create } from 'zustand';

interface PaywallState {
  open: boolean;
  /** Where the paywall was triggered from (for analytics / copy tweaks). */
  source: string | null;
  show: (source: string) => void;
  hide: () => void;
}

/**
 * Global paywall trigger. Any screen can call `usePaywall.getState().show('recipe')`
 * and the single <Paywall /> mounted in page.tsx opens — no detour via Profile.
 */
export const usePaywall = create<PaywallState>()((set) => ({
  open: false,
  source: null,
  show: (source) => set({ open: true, source }),
  hide: () => set({ open: false }),
}));

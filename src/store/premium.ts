'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface PremiumState {
  isPremium: boolean;
  unlockPremium: () => void;
  lockPremium: () => void;
  togglePremium: () => void;
}

export const usePremium = create<PremiumState>()(
  persist(
    (set) => ({
      isPremium: false,
      unlockPremium: () => set({ isPremium: true }),
      lockPremium: () => set({ isPremium: false }),
      togglePremium: () => set((state) => ({ isPremium: !state.isPremium })),
    }),
    {
      name: 'aussie_fitness_premium',
      storage: createJSONStorage(() => localStorage),
    }
  )
);

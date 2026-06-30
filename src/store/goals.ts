'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface DailyGoals {
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
}

const DEFAULT_GOALS: DailyGoals = {
  calories: 2200,
  protein: 150,
  carbs: 220,
  fats: 70,
};

interface GoalsState {
  goals: DailyGoals;
  setGoals: (goals: Partial<DailyGoals>) => void;
  resetGoals: () => void;
}

export const useGoals = create<GoalsState>()(
  persist(
    (set) => ({
      goals: DEFAULT_GOALS,
      setGoals: (partial) =>
        set((state) => ({ goals: { ...state.goals, ...partial } })),
      resetGoals: () => set({ goals: DEFAULT_GOALS }),
    }),
    {
      name: 'aussie_fitness_goals',
      storage: createJSONStorage(() => localStorage),
    }
  )
);

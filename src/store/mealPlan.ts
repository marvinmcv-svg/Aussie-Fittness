'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { PlannedMeal, MealType } from '@/types';

interface MealPlanState {
  meals: PlannedMeal[];
  addMeal: (recipeId: string, day: number, mealType: MealType, servings?: number) => void;
  removeMeal: (id: string) => void;
  updateServings: (id: string, servings: number) => void;
  clearDay: (day: number) => void;
  clearAll: () => void;
  getMealsForDay: (day: number) => PlannedMeal[];
}

export const useMealPlan = create<MealPlanState>()(
  persist(
    (set, get) => ({
      meals: [],
      addMeal: (recipeId, day, mealType, servings = 1) =>
        set((state) => ({
          meals: [
            ...state.meals,
            {
              id: `m_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
              recipeId,
              day,
              mealType,
              servings,
            },
          ],
        })),
      removeMeal: (id) =>
        set((state) => ({ meals: state.meals.filter((m) => m.id !== id) })),
      updateServings: (id, servings) =>
        set((state) => ({
          meals: state.meals.map((m) =>
            m.id === id ? { ...m, servings: Math.max(1, servings) } : m
          ),
        })),
      clearDay: (day) =>
        set((state) => ({ meals: state.meals.filter((m) => m.day !== day) })),
      clearAll: () => set({ meals: [] }),
      getMealsForDay: (day) => get().meals.filter((m) => m.day === day),
    }),
    {
      name: 'aussie_fitness_mealplan',
      storage: createJSONStorage(() => localStorage),
    }
  )
);

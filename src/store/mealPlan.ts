'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { PlannedMeal, MealType } from '@/types';

interface MealPlanState {
  meals: PlannedMeal[];
  /** Whether data has been synced with the server (false = guest mode) */
  _synced: boolean;
  /** Replace all meals (used during server sync) */
  _replaceAll: (meals: PlannedMeal[]) => void;
  /** Mark as synced with server */
  _setSynced: (synced: boolean) => void;
  addMeal: (recipeId: string, day: number, mealType: MealType, servings?: number) => void;
  removeMeal: (id: string) => void;
  updateServings: (id: string, servings: number) => void;
  clearDay: (day: number) => void;
  clearAll: () => void;
  getMealsForDay: (day: number) => PlannedMeal[];
}

function uid(): string {
  return `m_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

export const useMealPlan = create<MealPlanState>()(
  persist(
    (set, get) => ({
      meals: [],
      _synced: false,
      _replaceAll: (meals) => set({ meals, _synced: true }),
      _setSynced: (synced) => set({ _synced: synced }),
      addMeal: (recipeId, day, mealType, servings = 1) => {
        const meal: PlannedMeal = { id: uid(), recipeId, day, mealType, servings };
        // Optimistic update
        set((state) => ({ meals: [...state.meals, meal] }));
        // Server sync
        if (get()._synced) {
          fetch('/api/user/mealplan', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ recipeId, day, mealType, servings }),
          })
            .then((r) => r.json())
            .then((data) => {
              if (data.id) {
                // Replace temp ID with server ID
                set((state) => ({
                  meals: state.meals.map((m) =>
                    m.id === meal.id ? { ...m, id: data.id } : m
                  ),
                }));
              }
            })
            .catch(() => {});
        }
      },
      removeMeal: (id) => {
        set((state) => ({ meals: state.meals.filter((m) => m.id !== id) }));
        if (get()._synced) {
          fetch(`/api/user/mealplan/${id}`, { method: 'DELETE' }).catch(() => {});
        }
      },
      updateServings: (id, servings) => {
        set((state) => ({
          meals: state.meals.map((m) =>
            m.id === id ? { ...m, servings: Math.max(1, servings) } : m
          ),
        }));
        if (get()._synced) {
          fetch(`/api/user/mealplan/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ servings }),
          }).catch(() => {});
        }
      },
      clearDay: (day) => {
        const toRemove = get().meals.filter((m) => m.day === day);
        set((state) => ({ meals: state.meals.filter((m) => m.day !== day) }));
        if (get()._synced) {
          for (const meal of toRemove) {
            fetch(`/api/user/mealplan/${meal.id}`, { method: 'DELETE' }).catch(() => {});
          }
        }
      },
      clearAll: () => {
        const all = get().meals;
        set({ meals: [] });
        if (get()._synced) {
          for (const meal of all) {
            fetch(`/api/user/mealplan/${meal.id}`, { method: 'DELETE' }).catch(() => {});
          }
        }
      },
      getMealsForDay: (day) => get().meals.filter((m) => m.day === day),
    }),
    {
      name: 'aussie_fitness_mealplan',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ meals: state.meals }),
    }
  )
);

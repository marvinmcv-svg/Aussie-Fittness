'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { ShoppingItem } from '@/types';

interface ShoppingListState {
  items: ShoppingItem[];
  addItem: (name: string, quantity?: string, category?: string, fromRecipe?: string) => void;
  addItems: (items: { name: string; quantity?: string; fromRecipe?: string }[]) => void;
  removeItem: (id: string) => void;
  toggleChecked: (id: string) => void;
  updateItem: (id: string, updates: Partial<ShoppingItem>) => void;
  clearChecked: () => void;
  clearAll: () => void;
}

function guessCategory(name: string): string {
  const n = name.toLowerCase();
  if (n.includes('chicken') || n.includes('beef') || n.includes('mince') || n.includes('pork') || n.includes('bacon') || n.includes('turkey') || n.includes('fish') || n.includes('salmon') || n.includes('tuna') || n.includes('egg')) return 'Protein';
  if (n.includes('rice') || n.includes('pasta') || n.includes('noodle') || n.includes('bread') || n.includes('tortilla') || n.includes('oat') || n.includes('flour') || n.includes('wrap')) return 'Carbs';
  if (n.includes('milk') || n.includes('cheese') || n.includes('yogurt') || n.includes('cream') || n.includes('butter')) return 'Dairy';
  if (n.includes('apple') || n.includes('banana') || n.includes('berry') || n.includes('strawberry') || n.includes('blueberry') || n.includes('fruit') || n.includes('lemon') || n.includes('lime')) return 'Fruit';
  if (n.includes('onion') || n.includes('garlic') || n.includes('tomato') || n.includes('carrot') || n.includes('potato') || n.includes('spinach') || n.includes('lettuce') || n.includes('pepper') || n.includes('broccoli')) return 'Vegetables';
  if (n.includes('oil') || n.includes('sauce') || n.includes('honey') || n.includes('salt') || n.includes('pepper') || n.includes('spice') || n.includes('powder') || n.includes('seasoning')) return 'Pantry';
  return 'Other';
}

export const useShoppingList = create<ShoppingListState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (name, quantity, category, fromRecipe) =>
        set((state) => ({
          items: [
            ...state.items,
            {
              id: `s_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
              name: name.trim(),
              quantity: quantity?.trim(),
              category: category || guessCategory(name),
              checked: false,
              fromRecipe,
            },
          ],
        })),
      addItems: (newItems) =>
        set((state) => ({
          items: [
            ...state.items,
            ...newItems.map((item) => ({
              id: `s_${Date.now()}_${Math.random().toString(36).slice(2, 8)}_${item.name.slice(0, 3)}`,
              name: item.name.trim(),
              quantity: item.quantity?.trim(),
              category: guessCategory(item.name),
              checked: false,
              fromRecipe: item.fromRecipe,
            })),
          ],
        })),
      removeItem: (id) =>
        set((state) => ({ items: state.items.filter((i) => i.id !== id) })),
      toggleChecked: (id) =>
        set((state) => ({
          items: state.items.map((i) =>
            i.id === id ? { ...i, checked: !i.checked } : i
          ),
        })),
      updateItem: (id, updates) =>
        set((state) => ({
          items: state.items.map((i) => (i.id === id ? { ...i, ...updates } : i)),
        })),
      clearChecked: () =>
        set((state) => ({ items: state.items.filter((i) => !i.checked) })),
      clearAll: () => set({ items: [] }),
    }),
    {
      name: 'aussie_fitness_shopping',
      storage: createJSONStorage(() => localStorage),
    }
  )
);

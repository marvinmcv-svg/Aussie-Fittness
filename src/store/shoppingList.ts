'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { ShoppingItem } from '@/types';

interface ShoppingListState {
  items: ShoppingItem[];
  addItem: (name: string, quantity?: string, category?: string, fromRecipe?: string) => void;
  addItems: (items: { name: string; quantity?: string; fromRecipe?: string }[]) => number;
  removeItem: (id: string) => void;
  toggleChecked: (id: string) => void;
  updateItem: (id: string, updates: Partial<ShoppingItem>) => void;
  clearChecked: () => void;
  clearAll: () => void;
}

// Generate a unique ID (crypto.randomUUID in modern browsers, fallback otherwise)
function uid(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return `s_${crypto.randomUUID()}`;
  }
  return `s_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

// Normalize an ingredient name for dedup comparison.
// Strips quantities/numbers and lowercases.
function normalizeName(name: string): string {
  return name
    .toLowerCase()
    .replace(/\d+\s*(g|kg|ml|l|tbsp|tsp|cups?|cloves?|pieces?|eggs?|cans?)?\b/gi, '')
    .replace(/\(.*?\)/g, '') // remove parenthetical notes
    .replace(/[^a-z\s]/g, '')
    .trim()
    .replace(/\s+/g, ' ');
}

// Improved category guesser with word-boundary matching and larger keyword map.
function guessCategory(name: string): string {
  const n = ' ' + name.toLowerCase() + ' ';
  // Use word-boundary-ish matching to avoid "eggplant" → Protein, "black pepper" → Vegetables
  const has = (words: string[]) => words.some((w) => n.includes(' ' + w + ' ') || n.includes(' ' + w + 's ') || n.includes(' ' + w + 'es '));

  if (has(['chicken', 'beef', 'mince', 'pork', 'bacon', 'turkey', 'fish', 'salmon', 'tuna', 'egg', 'prawn', 'shrimp', 'sausage', 'ham', 'lamb', 'duck', 'protein powder'])) return 'Protein';
  if (has(['rice', 'pasta', 'noodle', 'spaghetti', 'bread', 'tortilla', 'wrap', 'oat', 'flour', 'quinoa', 'couscous', 'crumb', 'cornflake', 'cereal'])) return 'Carbs';
  if (has(['milk', 'cheese', 'yogurt', 'yoghurt', 'cream', 'butter', 'mozzarella', 'feta', 'parmesan'])) return 'Dairy';
  if (has(['apple', 'banana', 'berry', 'strawberry', 'blueberry', 'raspberry', 'fruit', 'lemon', 'lime', 'orange', 'mango', 'pineapple', 'peach', 'pear', 'grape', 'watermelon', 'sorbet'])) return 'Fruit';
  if (has(['onion', 'garlic', 'tomato', 'carrot', 'potato', 'spinach', 'lettuce', 'broccoli', 'cucumber', 'capsicum', 'zucchini', 'mushroom', 'corn', 'peas', 'avocado', 'ginger', 'chilli', 'chili', 'jalapeno', 'spring onion', 'shallot', 'kale', 'cauliflower'])) return 'Vegetables';
  if (has(['oil', 'sauce', 'honey', 'salt', 'pepper', 'spice', 'powder', 'seasoning', 'paprika', 'cumin', 'turmeric', 'curry', 'oregano', 'basil', 'parsley', 'chives', 'mayonnaise', 'mustard', 'vinegar', 'soy', 'worcestershire', 'baking', 'cocoa', 'stevia', 'sweetener', 'sugar', 'vanilla', 'cinnamon', 'nut', 'seed', 'almond', 'peanut', 'biscoff', 'chocolate'])) return 'Pantry';
  return 'Other';
}

// Merge a quantity string into an existing one (best-effort text concatenation)
function mergeQuantities(existing: string | undefined, incoming: string | undefined): string | undefined {
  if (!existing && !incoming) return undefined;
  if (!existing) return incoming;
  if (!incoming) return existing;
  if (existing === incoming) return existing;
  return `${existing}, ${incoming}`;
}

export const useShoppingList = create<ShoppingListState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (name, quantity, category, fromRecipe) => {
        const trimmedName = name.trim();
        if (!trimmedName) return;
        const norm = normalizeName(trimmedName);
        // Dedup: if an unchecked item with the same normalized name exists, merge quantity
        const existing = get().items.find(
          (i) => !i.checked && normalizeName(i.name) === norm
        );
        if (existing) {
          set((state) => ({
            items: state.items.map((i) =>
              i.id === existing.id
                ? {
                    ...i,
                    quantity: mergeQuantities(i.quantity, quantity?.trim()),
                    fromRecipe: i.fromRecipe ?? fromRecipe,
                  }
                : i
            ),
          }));
          return;
        }
        set((state) => ({
          items: [
            ...state.items,
            {
              id: uid(),
              name: trimmedName,
              quantity: quantity?.trim() || undefined,
              category: category || guessCategory(trimmedName),
              checked: false,
              fromRecipe,
            },
          ],
        }));
      },
      addItems: (newItems) => {
        let added = 0;
        for (const item of newItems) {
          const trimmedName = item.name.trim();
          if (!trimmedName) continue;
          const norm = normalizeName(trimmedName);
          const existing = get().items.find(
            (i) => !i.checked && normalizeName(i.name) === norm
          );
          if (existing) {
            set((state) => ({
              items: state.items.map((i) =>
                i.id === existing.id
                  ? {
                      ...i,
                      quantity: mergeQuantities(i.quantity, item.quantity?.trim()),
                      fromRecipe: i.fromRecipe ?? item.fromRecipe,
                    }
                  : i
              ),
            }));
          } else {
            const newItem: ShoppingItem = {
              id: uid(),
              name: trimmedName,
              quantity: item.quantity?.trim() || undefined,
              category: guessCategory(trimmedName),
              checked: false,
              fromRecipe: item.fromRecipe,
            };
            set((state) => ({ items: [...state.items, newItem] }));
            added++;
          }
        }
        return added;
      },
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

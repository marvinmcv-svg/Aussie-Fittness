'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { ShoppingItem } from '@/types';

interface ShoppingListState {
  items: ShoppingItem[];
  /** Whether data has been synced with the server (false = guest mode) */
  _synced: boolean;
  /** Replace all items (used during server sync) */
  _replaceAll: (items: ShoppingItem[]) => void;
  /** Mark as synced with server */
  _setSynced: (synced: boolean) => void;
  addItem: (name: string, quantity?: string, category?: string, fromRecipe?: string) => void;
  addItems: (items: { name: string; quantity?: string; fromRecipe?: string }[]) => number;
  removeItem: (id: string) => void;
  toggleChecked: (id: string) => void;
  updateItem: (id: string, updates: Partial<ShoppingItem>) => void;
  clearChecked: () => void;
  clearAll: () => void;
}

function uid(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return `s_${crypto.randomUUID()}`;
  }
  return `s_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

function normalizeName(name: string): string {
  return name
    .toLowerCase()
    .replace(/\d+\s*(g|kg|ml|l|tbsp|tsp|cups?|cloves?|pieces?|eggs?|cans?)?\b/gi, '')
    .replace(/\(.*?\)/g, '')
    .replace(/[^a-z\s]/g, '')
    .trim()
    .replace(/\s+/g, ' ');
}

function guessCategory(name: string): string {
  const n = ' ' + name.toLowerCase() + ' ';
  const has = (words: string[]) => words.some((w) => n.includes(' ' + w + ' ') || n.includes(' ' + w + 's ') || n.includes(' ' + w + 'es '));

  if (has(['chicken', 'beef', 'mince', 'pork', 'bacon', 'turkey', 'fish', 'salmon', 'tuna', 'egg', 'prawn', 'shrimp', 'sausage', 'ham', 'lamb', 'duck', 'protein powder'])) return 'Protein';
  if (has(['rice', 'pasta', 'noodle', 'spaghetti', 'bread', 'tortilla', 'wrap', 'oat', 'flour', 'quinoa', 'couscous', 'crumb', 'cornflake', 'cereal'])) return 'Carbs';
  if (has(['milk', 'cheese', 'yogurt', 'yoghurt', 'cream', 'butter', 'mozzarella', 'feta', 'parmesan'])) return 'Dairy';
  if (has(['apple', 'banana', 'berry', 'strawberry', 'blueberry', 'raspberry', 'fruit', 'lemon', 'lime', 'orange', 'mango', 'pineapple', 'peach', 'pear', 'grape', 'watermelon', 'sorbet'])) return 'Fruit';
  if (has(['onion', 'garlic', 'tomato', 'carrot', 'potato', 'spinach', 'lettuce', 'broccoli', 'cucumber', 'capsicum', 'zucchini', 'mushroom', 'corn', 'peas', 'avocado', 'ginger', 'chilli', 'chili', 'jalapeno', 'spring onion', 'shallot', 'kale', 'cauliflower'])) return 'Vegetables';
  if (has(['oil', 'sauce', 'honey', 'salt', 'pepper', 'spice', 'powder', 'seasoning', 'paprika', 'cumin', 'turmeric', 'curry', 'oregano', 'basil', 'parsley', 'chives', 'mayonnaise', 'mustard', 'vinegar', 'soy', 'worcestershire', 'baking', 'cocoa', 'stevia', 'sweetener', 'sugar', 'vanilla', 'cinnamon', 'nut', 'seed', 'almond', 'peanut', 'biscoff', 'chocolate'])) return 'Pantry';
  return 'Other';
}

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
      _synced: false,
      _replaceAll: (items) => set({ items, _synced: true }),
      _setSynced: (synced) => set({ _synced: synced }),
      addItem: (name, quantity, category, fromRecipe) => {
        const trimmedName = name.trim();
        if (!trimmedName) return;
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
                    quantity: mergeQuantities(i.quantity, quantity?.trim()),
                    fromRecipe: i.fromRecipe ?? fromRecipe,
                  }
                : i
            ),
          }));
          // Server sync: update the existing item's quantity
          if (get()._synced) {
            fetch(`/api/user/shopping/${existing.id}`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ quantity: mergeQuantities(existing.quantity, quantity?.trim()) }),
            }).catch(() => {});
          }
          return;
        }
        const newItem: ShoppingItem = {
          id: uid(),
          name: trimmedName,
          quantity: quantity?.trim() || undefined,
          category: category || guessCategory(trimmedName),
          checked: false,
          fromRecipe,
        };
        set((state) => ({ items: [...state.items, newItem] }));
        // Server sync
        if (get()._synced) {
          fetch('/api/user/shopping', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              name: newItem.name,
              quantity: newItem.quantity,
              category: newItem.category,
              fromRecipe: newItem.fromRecipe,
            }),
          })
            .then((r) => r.json())
            .then((data) => {
              if (data.id) {
                set((state) => ({
                  items: state.items.map((i) =>
                    i.id === newItem.id ? { ...i, id: data.id } : i
                  ),
                }));
              }
            })
            .catch(() => {});
        }
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
            // Server sync
            if (get()._synced) {
              fetch('/api/user/shopping', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  name: newItem.name,
                  quantity: newItem.quantity,
                  category: newItem.category,
                  fromRecipe: newItem.fromRecipe,
                }),
              })
                .then((r) => r.json())
                .then((data) => {
                  if (data.id) {
                    set((state) => ({
                      items: state.items.map((i) =>
                        i.id === newItem.id ? { ...i, id: data.id } : i
                      ),
                    }));
                  }
                })
                .catch(() => {});
            }
          }
        }
        return added;
      },
      removeItem: (id) => {
        set((state) => ({ items: state.items.filter((i) => i.id !== id) }));
        if (get()._synced) {
          fetch(`/api/user/shopping/${id}`, { method: 'DELETE' }).catch(() => {});
        }
      },
      toggleChecked: (id) => {
        const item = get().items.find((i) => i.id === id);
        if (!item) return;
        const newChecked = !item.checked;
        set((state) => ({
          items: state.items.map((i) =>
            i.id === id ? { ...i, checked: newChecked } : i
          ),
        }));
        if (get()._synced) {
          fetch(`/api/user/shopping/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ checked: newChecked }),
          }).catch(() => {});
        }
      },
      updateItem: (id, updates) => {
        set((state) => ({
          items: state.items.map((i) => (i.id === id ? { ...i, ...updates } : i)),
        }));
        if (get()._synced) {
          fetch(`/api/user/shopping/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updates),
          }).catch(() => {});
        }
      },
      clearChecked: () => {
        const toRemove = get().items.filter((i) => i.checked);
        set((state) => ({ items: state.items.filter((i) => !i.checked) }));
        if (get()._synced) {
          for (const item of toRemove) {
            fetch(`/api/user/shopping/${item.id}`, { method: 'DELETE' }).catch(() => {});
          }
        }
      },
      clearAll: () => {
        const all = get().items;
        set({ items: [] });
        if (get()._synced) {
          for (const item of all) {
            fetch(`/api/user/shopping/${item.id}`, { method: 'DELETE' }).catch(() => {});
          }
        }
      },
    }),
    {
      name: 'aussie_fitness_shopping',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ items: state.items }),
    }
  )
);

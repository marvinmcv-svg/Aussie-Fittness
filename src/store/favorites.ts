'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface FavoritesState {
  favorites: string[]; // recipe IDs
  /** Whether data has been synced with the server (false = guest mode) */
  _synced: boolean;
  /** Replace all favorites (used during server sync) */
  _replaceAll: (ids: string[]) => void;
  /** Mark as synced with server */
  _setSynced: (synced: boolean) => void;
  toggleFavorite: (id: string) => void;
  isFavorite: (id: string) => boolean;
  clearFavorites: () => void;
}

export const useFavorites = create<FavoritesState>()(
  persist(
    (set, get) => ({
      favorites: [],
      _synced: false,
      _replaceAll: (ids) => set({ favorites: ids, _synced: true }),
      _setSynced: (synced) => set({ _synced: synced }),
      toggleFavorite: (id) => {
        const isFav = get().favorites.includes(id);
        // Optimistic update
        set((state) => ({
          favorites: isFav
            ? state.favorites.filter((f) => f !== id)
            : [...state.favorites, id],
        }));
        // Server sync (fire and forget)
        if (get()._synced) {
          if (isFav) {
            fetch(`/api/user/favorites/${id}`, { method: 'DELETE' }).catch(() => {});
          } else {
            fetch('/api/user/favorites', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ recipeId: id }),
            }).catch(() => {});
          }
        }
      },
      isFavorite: (id) => get().favorites.includes(id),
      clearFavorites: () => set({ favorites: [] }),
    }),
    {
      name: 'aussie_fitness_favorites',
      storage: createJSONStorage(() => localStorage),
      // Don't persist the _synced flag — always start as false on reload
      partialize: (state) => ({ favorites: state.favorites }),
    }
  )
);

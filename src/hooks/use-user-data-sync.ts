'use client';

import { useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useFavorites } from '@/store/favorites';
import { useMealPlan } from '@/store/mealPlan';
import { useShoppingList } from '@/store/shoppingList';

/**
 * Syncs user data (favorites, meal plan, shopping list) between localStorage
 * and the server database based on authentication state.
 *
 * - On login: uploads local localStorage data to DB, then downloads the merged
 *   result and replaces local state. Sets _synced=true on all stores.
 * - On logout: sets _synced=false on all stores. Local data remains in
 *   localStorage for guest mode.
 * - While logged in: all store mutations automatically fire API calls
 *   (see the _synced checks in each store).
 */
export function useUserDataSync() {
  const { status } = useSession();
  const lastStatus = useRef(status);

  const favReplaceAll = useFavorites((s) => s._replaceAll);
  const favSetSynced = useFavorites((s) => s._setSynced);
  const favGet = useFavorites.getState;
  const mealReplaceAll = useMealPlan((s) => s._replaceAll);
  const mealSetSynced = useMealPlan((s) => s._setSynced);
  const mealGet = useMealPlan.getState;
  const shopReplaceAll = useShoppingList((s) => s._replaceAll);
  const shopSetSynced = useShoppingList((s) => s._setSynced);
  const shopGet = useShoppingList.getState;

  useEffect(() => {
    // Only run when status changes
    if (status === lastStatus.current) return;
    lastStatus.current = status;

    if (status === 'authenticated') {
      // LOGIN: sync local data to server, then download merged result
      const sync = async () => {
        try {
          const favs = favGet().favorites;
          const meals = mealGet().meals.map((m) => ({
            recipeId: m.recipeId,
            day: m.day,
            mealType: m.mealType,
            servings: m.servings,
          }));
          const shopping = shopGet().items.map((i) => ({
            name: i.name,
            quantity: i.quantity,
            category: i.category,
            checked: i.checked,
            fromRecipe: i.fromRecipe,
          }));

          const res = await fetch('/api/user/sync', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ favorites: favs, mealPlan: meals, shopping }),
          });

          if (res.ok) {
            const data = await res.json();
            // Replace local state with server state (merged)
            favReplaceAll(data.favorites ?? []);
            mealReplaceAll(data.mealPlan ?? []);
            shopReplaceAll(data.shopping ?? []);
          } else {
            // Sync failed — still mark as synced so mutations attempt API calls
            favSetSynced(true);
            mealSetSynced(true);
            shopSetSynced(true);
          }
        } catch {
          // Network error — mark as synced so mutations attempt API calls
          favSetSynced(true);
          mealSetSynced(true);
          shopSetSynced(true);
        }
      };
      sync();
    } else if (status === 'unauthenticated') {
      // LOGOUT: mark as not synced (guest mode)
      favSetSynced(false);
      mealSetSynced(false);
      shopSetSynced(false);
    }
  }, [status]);
}

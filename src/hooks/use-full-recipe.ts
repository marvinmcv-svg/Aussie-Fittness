'use client';

import { useEffect, useState } from 'react';
import { usePremium } from '@/store/premium';
import type { Recipe } from '@/types';

/**
 * Returns the full recipe for display.
 * - Free recipes: the public data already contains everything.
 * - Premium recipes + premium user: fetches full content from the API.
 * - Premium recipes + free user: returns the public teaser, `locked: true`.
 */
export function useFullRecipe(recipe: Recipe | undefined) {
  const isPremium = usePremium((s) => s.isPremium);
  const needsFetch = !!recipe?.premium && isPremium;
  const [fetched, setFetched] = useState<{ id: string; recipe: Recipe } | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!needsFetch || !recipe) return;
    if (fetched?.id === recipe.id) return;
    let cancelled = false;
    fetch(`/api/recipes/${recipe.id}`)
      .then((res) => res.json())
      .then((data: { recipe?: Recipe; locked?: boolean }) => {
        if (cancelled) return;
        if (data.recipe && !data.locked) setFetched({ id: recipe.id, recipe: data.recipe });
        else setError(true);
      })
      .catch(() => !cancelled && setError(true));
    return () => {
      cancelled = true;
    };
  }, [needsFetch, recipe, fetched?.id]);

  if (!recipe) return { recipe: undefined, locked: false, loading: false, error: false };
  if (!recipe.premium) return { recipe, locked: false, loading: false, error: false };
  if (!isPremium) return { recipe, locked: true, loading: false, error: false };
  if (fetched?.id === recipe.id) return { recipe: fetched.recipe, locked: false, loading: false, error: false };
  return { recipe, locked: false, loading: !error, error };
}

/** Fetch full ingredient lists for many recipes (used by planner → shopping). */
export async function fetchFullRecipes(ids: string[]): Promise<Map<string, Recipe>> {
  const out = new Map<string, Recipe>();
  await Promise.all(
    ids.map(async (id) => {
      try {
        const res = await fetch(`/api/recipes/${id}`);
        const data = (await res.json()) as { recipe?: Recipe; locked?: boolean };
        if (data.recipe && !data.locked) out.set(id, data.recipe);
      } catch {
        /* skip — caller falls back to public data */
      }
    })
  );
  return out;
}

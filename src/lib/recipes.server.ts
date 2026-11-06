/**
 * SERVER ONLY — never import this from a 'use client' component.
 *
 * Holds the full recipe content (including premium ingredients/directions).
 * Client code must use '@/lib/recipes' (public, stripped data) and fetch full
 * premium content from /api/recipes/[id], which checks the session.
 */
import fullData from '@/../data/recipes.json';
import type { Recipe } from '@/types';

const fullRecipes: Recipe[] = (fullData.recipes as Recipe[]).map((r) => ({
  ...r,
  ingredientCount: r.ingredients.length,
  stepCount: r.directions.length,
}));

export function getFullRecipeById(id: string): Recipe | undefined {
  return fullRecipes.find((r) => r.id === id);
}

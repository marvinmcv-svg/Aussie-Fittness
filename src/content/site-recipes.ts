import { getAllRecipes } from '@/lib/recipes';
import type { Recipe } from '@/types';

/**
 * Recipes the marketing site publishes. Excludes data-quality problems found
 * in QA (see MISSING_CONTENT.md): recipes titled "Untitled Recipe" and later
 * duplicates of the same title. The app itself still uses the full list.
 */
const published: Recipe[] = (() => {
  const seen = new Set<string>();
  return getAllRecipes().filter((r) => {
    const key = r.title.trim().toLowerCase();
    if (key === 'untitled recipe' || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
})();

export function getSiteRecipes() {
  return published;
}

export function getSiteRecipe(id: string) {
  return published.find((r) => r.id === id);
}

import recipesData from '@/../data/recipes.json';
import type { Recipe, SortOption, RecipeFilters } from '@/types';

const recipes: Recipe[] = recipesData.recipes as Recipe[];

export function getAllRecipes(): Recipe[] {
  return recipes;
}

export function getRecipeById(id: string): Recipe | undefined {
  return recipes.find((r) => r.id === id);
}

export function getFeaturedRecipes(limit = 6): Recipe[] {
  // High protein, reasonable calories, visually appealing
  return [...recipes]
    .sort((a, b) => b.protein - a.protein)
    .slice(0, limit);
}

export function getFreeRecipes(): Recipe[] {
  return recipes.filter((r) => !r.premium);
}

export function getPremiumRecipes(): Recipe[] {
  return recipes.filter((r) => r.premium);
}

export function getAllTags(): string[] {
  const tagSet = new Set<string>();
  recipes.forEach((r) => r.tags.forEach((t) => tagSet.add(t)));
  return Array.from(tagSet).sort();
}

export function getCategories(): { name: string; count: number; emoji: string }[] {
  const savoury = recipes.filter((r) => r.category === 'Savoury').length;
  const sweet = recipes.filter((r) => r.category === 'Sweet').length;
  return [
    { name: 'Savoury', count: savoury, emoji: '🍗' },
    { name: 'Sweet', count: sweet, emoji: '🍰' },
  ];
}

export function searchRecipes(
  filters: RecipeFilters,
  sort: SortOption = 'relevance'
): Recipe[] {
  let result = recipes.filter((r) => {
    // Search
    if (filters.search.trim()) {
      const q = filters.search.toLowerCase();
      const inTitle = r.title.toLowerCase().includes(q);
      const inTags = r.tags.some((t) => t.toLowerCase().includes(q));
      const inIngredients = r.ingredients.some((i) => i.toLowerCase().includes(q));
      if (!inTitle && !inTags && !inIngredients) return false;
    }
    // Category
    if (filters.category !== 'all' && r.category !== filters.category) return false;
    // Tag
    if (filters.tag !== 'all' && !r.tags.includes(filters.tag)) return false;
    // Max calories
    if (filters.maxCalories != null && r.calories > filters.maxCalories) return false;
    // Min protein
    if (filters.minProtein != null && r.protein < filters.minProtein) return false;
    // Max cook time
    if (filters.maxCookTime != null && r.cookTime > filters.maxCookTime) return false;
    // Premium filter
    if (filters.premiumFilter === 'free' && r.premium) return false;
    if (filters.premiumFilter === 'premium' && !r.premium) return false;
    return true;
  });

  // Sort
  switch (sort) {
    case 'calories-asc':
      result.sort((a, b) => a.calories - b.calories);
      break;
    case 'calories-desc':
      result.sort((a, b) => b.calories - a.calories);
      break;
    case 'protein-desc':
      result.sort((a, b) => b.protein - a.protein);
      break;
    case 'protein-asc':
      result.sort((a, b) => a.protein - b.protein);
      break;
    case 'cooktime-asc':
      result.sort((a, b) => a.cookTime - b.cookTime);
      break;
    case 'title-asc':
      result.sort((a, b) => a.title.localeCompare(b.title));
      break;
    default:
      // relevance: keep original order (sorted by page)
      break;
  }

  return result;
}

export function getRecipeStats() {
  const total = recipes.length;
  const totalCalories = recipes.reduce((s, r) => s + r.calories, 0);
  const totalProtein = recipes.reduce((s, r) => s + r.protein, 0);
  const avgCalories = Math.round(totalCalories / total);
  const avgProtein = Math.round(totalProtein / total);
  const freeCount = recipes.filter((r) => !r.premium).length;
  const premiumCount = recipes.filter((r) => r.premium).length;
  const savoury = recipes.filter((r) => r.category === 'Savoury').length;
  const sweet = recipes.filter((r) => r.category === 'Sweet').length;
  return { total, avgCalories, avgProtein, freeCount, premiumCount, savoury, sweet };
}

// Helper to compute macro totals for a set of recipes
export function computeMacroTotals(recipeIds: string[], servingsMultiplier = 1) {
  let calories = 0, carbs = 0, fats = 0, protein = 0;
  for (const id of recipeIds) {
    const r = getRecipeById(id);
    if (r) {
      calories += r.calories * servingsMultiplier;
      carbs += r.carbs * servingsMultiplier;
      fats += r.fats * servingsMultiplier;
      protein += r.protein * servingsMultiplier;
    }
  }
  return { calories: Math.round(calories), carbs: Math.round(carbs), fats: Math.round(fats), protein: Math.round(protein) };
}

// Generate a deterministic gradient + emoji for a recipe (used as visual placeholder).
// Every recipe has a generated photo at /recipes/{id}.png — the ImageWithFallback
// component gracefully falls back to the emoji if the photo hasn't been generated yet.
const RECIPE_PHOTOS: Record<string, string> = {
  r001: '/recipes/hero-curry.png',
  r002: '/recipes/hero-burrito.png',
};

export function getRecipeVisual(recipe: Recipe): { gradient: string; emoji: string; photo: string } {
  const title = recipe.title.toLowerCase();
  let emoji = '🍽️';
  if (title.includes('chicken')) emoji = '🍗';
  else if (title.includes('beef') || title.includes('steak') || title.includes('mince')) emoji = '🥩';
  else if (title.includes('pizza')) emoji = '🍕';
  else if (title.includes('burger')) emoji = '🍔';
  else if (title.includes('pasta') || title.includes('noodle') || title.includes('spaghetti')) emoji = '🍝';
  else if (title.includes('burrito') || title.includes('taco') || title.includes('bowl')) emoji = '🌯';
  else if (title.includes('curry')) emoji = '🍛';
  else if (title.includes('rice')) emoji = '🍚';
  else if (title.includes('egg') || title.includes('breakfast')) emoji = '🍳';
  else if (title.includes('shake') || title.includes('smoothie')) emoji = '🥤';
  else if (title.includes('cake') || title.includes('brownie') || title.includes('cookie')) emoji = '🍰';
  else if (title.includes('oats') || title.includes('pancake')) emoji = '🥞';
  else if (title.includes('ice cream') || title.includes('sorbet')) emoji = '🍨';
  else if (title.includes('chocolate')) emoji = '🍫';
  else if (title.includes('fruit') || title.includes('berry') || title.includes('strawberry') || title.includes('blueberry')) emoji = '🫐';
  else if (title.includes('soup')) emoji = '🍲';
  else if (title.includes('salad')) emoji = '🥗';
  else if (title.includes('bread') || title.includes('toast')) emoji = '🍞';
  else if (title.includes('fries') || title.includes('chips')) emoji = '🍟';
  else if (title.includes('fish') || title.includes('salmon') || title.includes('tuna')) emoji = '🐟';
  else if (title.includes('pork') || title.includes('bacon')) emoji = '🥓';

  // Deterministic gradient based on category + protein level
  const gradients = recipe.category === 'Sweet'
    ? [
        'from-pink-500 via-rose-500 to-orange-400',
        'from-fuchsia-500 via-pink-500 to-amber-400',
        'from-rose-500 via-pink-500 to-purple-500',
        'from-orange-400 via-pink-500 to-fuchsia-500',
      ]
    : [
        'from-emerald-500 via-teal-500 to-cyan-500',
        'from-lime-500 via-green-500 to-emerald-500',
        'from-amber-500 via-orange-500 to-red-500',
        'from-teal-500 via-emerald-500 to-lime-500',
      ];
  const idx = recipe.id.charCodeAt(1) % gradients.length; // use id char for determinism
  // Every recipe gets a photo path. Special-case the two hero images that use
  // a landscape aspect; the rest use the standard /recipes/{id}.png square.
  const photo = RECIPE_PHOTOS[recipe.id] ?? `/recipes/${recipe.id}.png`;
  return { gradient: gradients[idx], emoji, photo };
}

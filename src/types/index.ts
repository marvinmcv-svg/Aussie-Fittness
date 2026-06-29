// Recipe data types for the Aussie Fitness Cookbook

export type RecipeCategory = 'Savoury' | 'Sweet';

export interface Recipe {
  id: string;
  title: string;
  category: RecipeCategory;
  calories: number;
  carbs: number;
  fats: number;
  protein: number;
  sugar: number | null;
  servings: number;
  servingsUnit: string;
  cookTime: number; // minutes
  ingredients: string[];
  directions: string[];
  tags: string[];
  sourcePage: number | null;
  premium: boolean;
  isTotal?: boolean; // true if macros shown are for the whole recipe (not per serving)
}

export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export interface PlannedMeal {
  id: string; // unique entry id
  recipeId: string;
  day: number; // 0-6 (Mon-Sun)
  mealType: MealType;
  servings: number;
}

export interface ShoppingItem {
  id: string;
  name: string;
  quantity?: string;
  category: string;
  checked: boolean;
  fromRecipe?: string;
}

export type SortOption = 'relevance' | 'calories-asc' | 'calories-desc' | 'protein-desc' | 'protein-asc' | 'cooktime-asc' | 'title-asc';

export interface RecipeFilters {
  search: string;
  category: 'all' | RecipeCategory;
  tag: string | 'all';
  maxCalories: number | null;
  minProtein: number | null;
  maxCookTime: number | null;
  premiumFilter: 'all' | 'free' | 'premium';
}

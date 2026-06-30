import { NextRequest, NextResponse } from 'next/server';
import { getAllRecipes, searchRecipes, getAllTags, getRecipeStats } from '@/lib/recipes';
import type { SortOption, RecipeFilters } from '@/types';

export const dynamic = 'force-static';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const hasFilters = searchParams.has('search') || searchParams.has('category') ||
    searchParams.has('tag') || searchParams.has('maxCalories') ||
    searchParams.has('minProtein') || searchParams.has('maxCookTime') ||
    searchParams.has('premiumFilter') || searchParams.has('sort');

  if (searchParams.get('meta') === 'true') {
    return NextResponse.json({
      tags: getAllTags(),
      stats: getRecipeStats(),
    });
  }

  if (!hasFilters) {
    return NextResponse.json({ recipes: getAllRecipes() });
  }

  const filters: RecipeFilters = {
    search: searchParams.get('search') || '',
    category: (searchParams.get('category') as RecipeFilters['category']) || 'all',
    tag: searchParams.get('tag') || 'all',
    maxCalories: searchParams.get('maxCalories') ? Number(searchParams.get('maxCalories')) : null,
    minProtein: searchParams.get('minProtein') ? Number(searchParams.get('minProtein')) : null,
    maxCookTime: searchParams.get('maxCookTime') ? Number(searchParams.get('maxCookTime')) : null,
    premiumFilter: (searchParams.get('premiumFilter') as RecipeFilters['premiumFilter']) || 'all',
  };

  const sort = (searchParams.get('sort') as SortOption) || 'relevance';
  const recipes = searchRecipes(filters, sort);
  return NextResponse.json({ recipes, count: recipes.length });
}

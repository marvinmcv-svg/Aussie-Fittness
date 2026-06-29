'use client';

import { useState, useMemo } from 'react';
import { Search, SlidersHorizontal, X, ArrowUpDown, Heart } from 'lucide-react';
import { RecipeCard } from '@/components/recipe/RecipeCard';
import { getAllRecipes, getAllTags } from '@/lib/recipes';
import { useFavorites } from '@/store/favorites';
import type { Recipe, SortOption, RecipeFilters } from '@/types';
import type { Screen } from '../page';

interface BrowseScreenProps {
  onNavigate: (screen: Screen, recipeId?: string) => void;
  initialCategory?: 'all' | 'Savoury' | 'Sweet' | 'favorites';
}

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'relevance', label: 'Relevance' },
  { value: 'protein-desc', label: 'Protein (high→low)' },
  { value: 'protein-asc', label: 'Protein (low→high)' },
  { value: 'calories-asc', label: 'Calories (low→high)' },
  { value: 'calories-desc', label: 'Calories (high→low)' },
  { value: 'cooktime-asc', label: 'Quickest' },
  { value: 'title-asc', label: 'A → Z' },
];

export function BrowseScreen({ onNavigate, initialCategory = 'all' }: BrowseScreenProps) {
  const allRecipes = useMemo(() => getAllRecipes(), []);
  const tags = useMemo(() => getAllTags(), []);
  const favorites = useFavorites((s) => s.favorites);
  const [filters, setFilters] = useState<RecipeFilters>({
    search: '',
    category: initialCategory === 'Savoury' || initialCategory === 'Sweet' ? initialCategory : 'all',
    tag: 'all',
    maxCalories: null,
    minProtein: null,
    maxCookTime: null,
    premiumFilter: 'all',
  });
  const [sort, setSort] = useState<SortOption>('relevance');
  const [showFilters, setShowFilters] = useState(false);
  const [favoritesOnly, setFavoritesOnly] = useState(initialCategory === 'favorites');

  const filtered = useMemo(() => {
    let result = allRecipes.filter((r) => {
      if (favoritesOnly && !favorites.includes(r.id)) return false;
      if (filters.search.trim()) {
        const q = filters.search.toLowerCase();
        const inTitle = r.title.toLowerCase().includes(q);
        const inTags = r.tags.some((t) => t.toLowerCase().includes(q));
        const inIngredients = r.ingredients.some((i) => i.toLowerCase().includes(q));
        if (!inTitle && !inTags && !inIngredients) return false;
      }
      if (filters.category !== 'all' && r.category !== filters.category) return false;
      if (filters.tag !== 'all' && !r.tags.includes(filters.tag)) return false;
      if (filters.maxCalories != null && r.calories > filters.maxCalories) return false;
      if (filters.minProtein != null && r.protein < filters.minProtein) return false;
      if (filters.maxCookTime != null && r.cookTime > filters.maxCookTime) return false;
      if (filters.premiumFilter === 'free' && r.premium) return false;
      if (filters.premiumFilter === 'premium' && !r.premium) return false;
      return true;
    });

    switch (sort) {
      case 'calories-asc': result.sort((a, b) => a.calories - b.calories); break;
      case 'calories-desc': result.sort((a, b) => b.calories - a.calories); break;
      case 'protein-desc': result.sort((a, b) => b.protein - a.protein); break;
      case 'protein-asc': result.sort((a, b) => a.protein - b.protein); break;
      case 'cooktime-asc': result.sort((a, b) => a.cookTime - b.cookTime); break;
      case 'title-asc': result.sort((a, b) => a.title.localeCompare(b.title)); break;
    }
    return result;
  }, [allRecipes, filters, sort, favoritesOnly, favorites]);

  const activeFilterCount = [
    filters.category !== 'all',
    filters.tag !== 'all',
    filters.maxCalories != null,
    filters.minProtein != null,
    filters.maxCookTime != null,
    filters.premiumFilter !== 'all',
  ].filter(Boolean).length;

  const clearFilters = () => {
    setFilters({
      search: '',
      category: 'all',
      tag: 'all',
      maxCalories: null,
      minProtein: null,
      maxCookTime: null,
      premiumFilter: 'all',
    });
    setFavoritesOnly(false);
  };

  return (
    <div className="space-y-4 pb-6">
      {/* Search bar */}
      <div className="sticky top-[3.25rem] z-20 -mx-4 bg-background/80 px-4 py-3 backdrop-blur-md">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
            <input
              type="text"
              value={filters.search}
              onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
              placeholder="Search recipes, ingredients, tags..."
              aria-label="Search recipes"
              className="w-full rounded-full border border-border bg-card py-2.5 pl-10 pr-4 text-sm outline-none transition-colors focus:border-primary"
            />
            {filters.search && (
              <button
                onClick={() => setFilters((f) => ({ ...f, search: '' }))}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          <button
            onClick={() => setShowFilters((v) => !v)}
            className="relative flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card transition-colors hover:border-primary"
          >
            <SlidersHorizontal className="h-4 w-4" />
            {activeFilterCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>

        {/* Quick category chips */}
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1 custom-scroll">
          <button
            onClick={() => setFavoritesOnly((v) => !v)}
            aria-pressed={favoritesOnly}
            className={`shrink-0 inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
              favoritesOnly
                ? 'bg-red-500 text-white'
                : 'bg-card border border-border hover:border-primary/50'
            }`}
          >
            <Heart className={`h-3 w-3 ${favoritesOnly ? 'fill-white' : ''}`} aria-hidden="true" />
            Favorites
            {favorites.length > 0 && (
              <span className="ml-0.5 rounded-full bg-black/20 px-1 text-[10px]">{favorites.length}</span>
            )}
          </button>
          <div className="shrink-0 w-px self-stretch bg-border" aria-hidden="true" />
          {(['all', 'Savoury', 'Sweet'] as const).map((c) => (
            <button
              key={c}
              onClick={() => setFilters((f) => ({ ...f, category: c }))}
              aria-pressed={filters.category === c}
              className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                filters.category === c
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-card border border-border hover:border-primary/50'
              }`}
            >
              {c === 'all' ? 'All' : c}
            </button>
          ))}
          {tags.map((t) => (
            <button
              key={t}
              onClick={() => setFilters((f) => ({ ...f, tag: f.tag === t ? 'all' : t }))}
              aria-pressed={filters.tag === t}
              className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                filters.tag === t
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-card border border-border hover:border-primary/50'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Filters panel */}
      {showFilters && (
        <div className="rounded-2xl border border-border bg-card p-4">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-semibold">Filters</h3>
            {activeFilterCount > 0 && (
              <button onClick={clearFilters} className="text-xs text-primary hover:underline">
                Clear all
              </button>
            )}
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FilterField label="Premium">
              <div className="flex gap-2">
                {(['all', 'free', 'premium'] as const).map((p) => (
                  <button
                    key={p}
                    onClick={() => setFilters((f) => ({ ...f, premiumFilter: p }))}
                    className={`flex-1 rounded-lg border px-3 py-2 text-xs font-medium capitalize transition-colors ${
                      filters.premiumFilter === p
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </FilterField>
            <FilterField label={`Max calories: ${filters.maxCalories ?? 'any'}`}>
              <input
                type="range" min={100} max={900} step={50}
                value={filters.maxCalories ?? 900}
                onChange={(e) => setFilters((f) => ({
                  ...f,
                  maxCalories: Number(e.target.value) === 900 ? null : Number(e.target.value),
                }))}
                className="w-full accent-primary"
              />
            </FilterField>
            <FilterField label={`Min protein: ${filters.minProtein ?? 'any'}g`}>
              <input
                type="range" min={0} max={100} step={5}
                value={filters.minProtein ?? 0}
                onChange={(e) => setFilters((f) => ({
                  ...f,
                  minProtein: Number(e.target.value) === 0 ? null : Number(e.target.value),
                }))}
                className="w-full accent-primary"
              />
            </FilterField>
            <FilterField label={`Max cook time: ${filters.maxCookTime ?? 'any'}min`}>
              <input
                type="range" min={5} max={60} step={5}
                value={filters.maxCookTime ?? 60}
                onChange={(e) => setFilters((f) => ({
                  ...f,
                  maxCookTime: Number(e.target.value) === 60 ? null : Number(e.target.value),
                }))}
                className="w-full accent-primary"
              />
            </FilterField>
          </div>
        </div>
      )}

      {/* Sort + count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          <span className="font-semibold text-foreground">{filtered.length}</span> recipes
        </p>
        <div className="relative">
          <ArrowUpDown className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortOption)}
            className="appearance-none rounded-full border border-border bg-card py-2 pl-8 pr-8 text-xs font-medium outline-none focus:border-primary"
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Results grid */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
          {favoritesOnly ? (
            <>
              <Heart className="h-10 w-10 text-muted-foreground/50" />
              <div>
                <p className="font-semibold">No favorites yet</p>
                <p className="text-sm text-muted-foreground">Tap the heart on any recipe to save it here</p>
              </div>
              <button onClick={() => setFavoritesOnly(false)} className="text-sm text-primary hover:underline">
                Browse all recipes
              </button>
            </>
          ) : (
            <>
              <Search className="h-10 w-10 text-muted-foreground/50" />
              <div>
                <p className="font-semibold">No recipes found</p>
                <p className="text-sm text-muted-foreground">Try adjusting your filters</p>
              </div>
              {(activeFilterCount > 0 || favoritesOnly) && (
                <button onClick={clearFilters} className="text-sm text-primary hover:underline">
                  Clear filters
                </button>
              )}
            </>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {filtered.map((r: Recipe) => (
            <RecipeCard
              key={r.id}
              recipe={r}
              onClick={() => onNavigate('recipe', r.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function FilterField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium text-muted-foreground">{label}</label>
      {children}
    </div>
  );
}

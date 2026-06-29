'use client';

import { Heart, Lock, Clock, Flame } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getRecipeVisual } from '@/lib/recipes';
import { ImageWithFallback } from '@/components/recipe/ImageWithFallback';
import type { Recipe } from '@/types';
import { useFavorites } from '@/store/favorites';
import { usePremium } from '@/store/premium';

interface MacroChipsProps {
  recipe: Recipe;
  variant?: 'default' | 'compact';
}

export function MacroChips({ recipe, variant = 'default' }: MacroChipsProps) {
  const isCompact = variant === 'compact';
  return (
    <div className={cn('flex flex-wrap items-center gap-1.5', isCompact && 'gap-1')}>
      <span className="inline-flex items-center gap-1 rounded-md bg-calories/15 px-1.5 py-0.5 text-[10px] font-semibold text-calories">
        <Flame className="h-2.5 w-2.5" />
        {recipe.calories}
      </span>
      <span className="inline-flex items-center gap-1 rounded-md bg-protein/15 px-1.5 py-0.5 text-[10px] font-semibold text-protein">
        P {recipe.protein}g
      </span>
      <span className="inline-flex items-center gap-1 rounded-md bg-carbs/15 px-1.5 py-0.5 text-[10px] font-semibold text-carbs">
        C {recipe.carbs}g
      </span>
      <span className="inline-flex items-center gap-1 rounded-md bg-fats/15 px-1.5 py-0.5 text-[10px] font-semibold text-fats">
        F {recipe.fats}g
      </span>
    </div>
  );
}

interface RecipeCardProps {
  recipe: Recipe;
  onClick?: () => void;
  compact?: boolean;
}

export function RecipeCard({ recipe, onClick, compact = false }: RecipeCardProps) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const { isPremium } = usePremium();
  const visual = getRecipeVisual(recipe);
  const fav = isFavorite(recipe.id);
  const locked = recipe.premium && !isPremium;

  return (
    <button
      onClick={onClick}
      className={cn(
        'group relative w-full overflow-hidden rounded-2xl border border-border bg-card text-left transition-all hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-ring'
      )}
    >
      {/* Image / Visual */}
      <div className={cn(
        'relative w-full overflow-hidden bg-gradient-to-br',
        visual.gradient,
        compact ? 'aspect-[4/3]' : 'aspect-square'
      )}>
        <ImageWithFallback
          src={visual.photo}
          alt={recipe.title}
          className="absolute inset-0 h-full w-full object-cover"
          fallbackClassName={cn(
            'absolute inset-0 flex items-center justify-center',
            compact ? 'text-5xl' : 'text-6xl'
          )}
          fallback={
            <span className="drop-shadow-lg transition-transform group-hover:scale-110">
              {visual.emoji}
            </span>
          }
        />
        {/* Subtle dark overlay for badge contrast when photo loads */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/10" />
        {/* Top row: fav + lock */}
        <div className="absolute inset-x-0 top-0 flex items-center justify-between p-2">
          <span
            onClick={(e) => {
              e.stopPropagation();
              toggleFavorite(recipe.id);
            }}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-black/30 backdrop-blur-sm transition-colors hover:bg-black/50"
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.stopPropagation();
                toggleFavorite(recipe.id);
              }
            }}
          >
            <Heart
              className={cn(
                'h-4 w-4 transition-all',
                fav ? 'fill-red-500 text-red-500' : 'text-white'
              )}
            />
          </span>
          {locked && (
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-black/40 backdrop-blur-sm">
              <Lock className="h-4 w-4 text-amber-300" />
            </span>
          )}
        </div>
        {/* Cook time badge */}
        <div className="absolute bottom-2 left-2 flex items-center gap-1 rounded-md bg-black/40 px-1.5 py-0.5 text-[10px] font-medium text-white backdrop-blur-sm">
          <Clock className="h-2.5 w-2.5" />
          {recipe.cookTime}m
        </div>
        {/* Category badge */}
        <div className="absolute bottom-2 right-2 rounded-md bg-black/40 px-1.5 py-0.5 text-[10px] font-medium text-white backdrop-blur-sm">
          {recipe.category}
        </div>
      </div>
      {/* Content */}
      <div className="p-3">
        <h3 className={cn(
          'font-semibold leading-tight line-clamp-2',
          compact ? 'text-sm' : 'text-sm sm:text-base'
        )}>
          {recipe.title}
        </h3>
        <div className="mt-2">
          <MacroChips recipe={recipe} variant="compact" />
        </div>
      </div>
    </button>
  );
}

'use client';

import { Heart, Lock, Clock, Flame } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getRecipeVisual } from '@/lib/recipes';
import { ImageWithFallback } from '@/components/recipe/ImageWithFallback';
import type { Recipe } from '@/types';
import { useFavorites } from '@/store/favorites';
import { usePremium } from '@/store/premium';
import { useToast } from '@/hooks/use-toast';

interface MacroChipsProps {
  recipe: Recipe;
  variant?: 'default' | 'compact';
}

export function MacroChips({ recipe, variant = 'default' }: MacroChipsProps) {
  const isCompact = variant === 'compact';
  return (
    <div className={cn('flex flex-wrap items-center gap-1.5', isCompact && 'gap-1')}>
      <span className="inline-flex items-center gap-1 rounded-md bg-calories/15 px-1.5 py-0.5 text-[10px] font-semibold text-calories">
        <Flame className="h-2.5 w-2.5" aria-hidden="true" />
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
  // Selectors: only re-render this card when THIS recipe's favorite status changes
  const fav = useFavorites((s) => s.favorites.includes(recipe.id));
  const toggleFavorite = useFavorites((s) => s.toggleFavorite);
  const isPremium = usePremium((s) => s.isPremium);
  const { toast } = useToast();
  const visual = getRecipeVisual(recipe);
  const locked = recipe.premium && !isPremium;

  const handleFavorite = (e: React.MouseEvent | React.KeyboardEvent) => {
    e.stopPropagation();
    toggleFavorite(recipe.id);
    toast({
      title: fav ? 'Removed from favorites' : 'Added to favorites',
      description: recipe.title,
    });
  };

  return (
    <div
      onClick={onClick}
      role="button"
      tabIndex={0}
      aria-label={`View recipe: ${recipe.title}. ${recipe.calories} calories, ${recipe.protein}g protein.`}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick?.();
        }
      }}
      className={cn(
        'pressable group relative w-full cursor-pointer text-left',
        'rounded-[20px] focus:outline-none focus-visible:ring-2 focus-visible:ring-ring'
      )}
    >
      {/* Photo */}
      <div className={cn(
        'relative w-full overflow-hidden rounded-[20px] bg-gradient-to-br shadow-[var(--shadow-card)]',
        visual.gradient,
        compact ? 'aspect-[4/5]' : 'aspect-square'
      )}>
        <ImageWithFallback
          src={visual.photo}
          alt={recipe.title}
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          fallbackClassName={cn(
            'absolute inset-0 flex items-center justify-center',
            compact ? 'text-5xl' : 'text-6xl'
          )}
          fallback={<span className="drop-shadow-lg">{visual.emoji}</span>}
        />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-black/25 to-transparent" />
        <div className="absolute inset-x-0 top-0 flex items-center justify-between p-2">
          {locked ? (
            <span
              className="inline-flex h-7 items-center gap-1 rounded-full bg-black/45 px-2.5 text-[11px] font-semibold text-white backdrop-blur-md"
              aria-label="Premium recipe"
            >
              <Lock className="h-3 w-3" aria-hidden="true" />
              Premium
            </span>
          ) : (
            <span />
          )}
          <button
            type="button"
            onClick={handleFavorite}
            aria-label={fav ? `Remove ${recipe.title} from favorites` : `Add ${recipe.title} to favorites`}
            aria-pressed={fav}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-black/35 backdrop-blur-md transition-colors hover:bg-black/55 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            <Heart
              className={cn('h-4 w-4', fav ? 'fill-[#ff375f] text-[#ff375f]' : 'text-white')}
              aria-hidden="true"
            />
          </button>
        </div>
      </div>
      {/* Text */}
      <div className="px-1 pb-1 pt-2.5">
        <h3 className="line-clamp-2 text-[15px] font-semibold leading-tight">{recipe.title}</h3>
        <p className="mt-1 flex items-center gap-1.5 text-[13px] text-muted-foreground">
          <span className="font-semibold text-protein">{recipe.protein}g protein</span>
          <span aria-hidden="true">·</span>
          <span>{recipe.calories} kcal</span>
          <span aria-hidden="true" className="hidden sm:inline">·</span>
          <span className="hidden items-center gap-0.5 sm:inline-flex">
            <Clock className="h-3 w-3" aria-hidden="true" />
            {recipe.cookTime}m
          </span>
        </p>
      </div>
    </div>
  );
}

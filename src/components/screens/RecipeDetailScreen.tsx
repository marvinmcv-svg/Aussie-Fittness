'use client';

import { useState, useMemo } from 'react';
import {
  ArrowLeft, Clock, Users, Heart, Lock, Check, Plus, Minus,
  CalendarPlus, ShoppingCart, ChefHat, ListChecks, Crown
} from 'lucide-react';
import { getRecipeById, getRecipeVisual } from '@/lib/recipes';
import { MacroRing, MacroBar } from '@/components/recipe/MacroBar';
import { ImageWithFallback } from '@/components/recipe/ImageWithFallback';
import { useFavorites } from '@/store/favorites';
import { usePaywall } from '@/store/paywall';
import { useFullRecipe } from '@/hooks/use-full-recipe';
import { useMealPlan } from '@/store/mealPlan';
import { useShoppingList } from '@/store/shoppingList';
import { useToast } from '@/hooks/use-toast';
import type { MealType } from '@/types';
import type { Screen } from '@/types';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const DAYS_SHORT = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const MEAL_TYPES: { value: MealType; label: string; emoji: string }[] = [
  { value: 'breakfast', label: 'Breakfast', emoji: '🍳' },
  { value: 'lunch', label: 'Lunch', emoji: '🥗' },
  { value: 'dinner', label: 'Dinner', emoji: '🍽️' },
  { value: 'snack', label: 'Snack', emoji: '🥤' },
];

interface RecipeDetailScreenProps {
  recipeId: string;
  onNavigate: (screen: Screen, recipeId?: string) => void;
  onBack: () => void;
}

export function RecipeDetailScreen({ recipeId, onNavigate, onBack }: RecipeDetailScreenProps) {
  const publicRecipe = useMemo(() => getRecipeById(recipeId), [recipeId]);
  // Premium content is fetched from the server only for premium users.
  const { recipe, locked, loading } = useFullRecipe(publicRecipe);
  const [servings, setServings] = useState(recipe?.servings ?? 1);
  const [checkedSteps, setCheckedSteps] = useState<Set<number>>(new Set());
  const [checkedIngredients, setCheckedIngredients] = useState<Set<number>>(new Set());
  const [showAddToPlan, setShowAddToPlan] = useState(false);
  const [addedToShopping, setAddedToShopping] = useState(false);

  const fav = useFavorites((s) => s.favorites.includes(recipeId));
  const toggleFavorite = useFavorites((s) => s.toggleFavorite);
  const addMeal = useMealPlan((s) => s.addMeal);
  const addItems = useShoppingList((s) => s.addItems);
  const { toast } = useToast();

  if (!recipe) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-20 text-center">
        <p className="font-semibold">Recipe not found</p>
        <button onClick={onBack} className="text-sm text-primary hover:underline">
          Go back
        </button>
      </div>
    );
  }

  const visual = getRecipeVisual(recipe);
  const openPaywall = () => usePaywall.getState().show(`recipe:${recipe.id}`);
  const totalIngredients = recipe.ingredientCount ?? recipe.ingredients.length;
  const totalSteps = recipe.stepCount ?? recipe.directions.length;
  const servingsMultiplier = servings / recipe.servings;

  const toggleStep = (i: number) => {
    setCheckedSteps((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
  };

  const toggleIngredient = (i: number) => {
    setCheckedIngredients((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
  };

  const addToPlan = (day: number, mealType: MealType) => {
    addMeal(recipe.id, day, mealType, servings);
    setShowAddToPlan(false);
    toast({
      title: 'Added to meal plan',
      description: `${recipe.title} → ${DAYS[day]} ${MEAL_TYPES.find((m) => m.value === mealType)?.label}`,
    });
  };

  const addIngredientsToShopping = () => {
    if (locked) {
      openPaywall();
      return;
    }
    const items = recipe.ingredients.map((ing) => ({
      name: ing,
      quantity: servingsMultiplier !== 1 ? `×${servingsMultiplier.toFixed(1)} servings` : undefined,
      fromRecipe: recipe.title,
    }));
    const added = addItems(items);
    setAddedToShopping(true);
    toast({
      title: added < items.length ? `Added ${added} new items` : 'Added to shopping list',
      description: `${items.length} ingredients from ${recipe.title}${added < items.length ? ` (${items.length - added} already on your list)` : ''}.`,
    });
    setTimeout(() => setAddedToShopping(false), 2500);
  };

  const handleFavorite = () => {
    toggleFavorite(recipe.id);
    toast({
      title: fav ? 'Removed from favorites' : 'Added to favorites',
      description: recipe.title,
    });
  };

  return (
    <div className="space-y-5">
      {/* Hero — full-bleed photo with floating glass controls */}
      <div className={`relative -mx-4 -mt-4 aspect-[4/3] overflow-hidden bg-gradient-to-br sm:mx-0 sm:mt-0 sm:aspect-[16/9] sm:rounded-[28px] ${visual.gradient}`}>
        <ImageWithFallback
          src={visual.photo}
          alt={recipe.title}
          className="absolute inset-0 h-full w-full object-cover"
          fallbackClassName="absolute inset-0 flex items-center justify-center"
          fallback={<span className="text-8xl drop-shadow-2xl">{visual.emoji}</span>}
        />
        <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/35 to-transparent" />
        <div className="absolute inset-x-0 top-0 flex items-center justify-between p-4">
          <button
            onClick={onBack}
            aria-label="Back"
            className="pressable flex h-10 w-10 items-center justify-center rounded-full bg-black/35 text-white backdrop-blur-md focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            <ArrowLeft className="h-5 w-5" aria-hidden="true" />
          </button>
          <div className="flex items-center gap-2">
            {locked && (
              <span className="inline-flex h-10 items-center gap-1.5 rounded-full bg-black/35 px-3.5 text-[13px] font-semibold text-white backdrop-blur-md">
                <Lock className="h-3.5 w-3.5" aria-hidden="true" />
                Premium
              </span>
            )}
            <button
              onClick={handleFavorite}
              aria-label={fav ? `Remove ${recipe.title} from favorites` : `Add ${recipe.title} to favorites`}
              aria-pressed={fav}
              className="pressable flex h-10 w-10 items-center justify-center rounded-full bg-black/35 backdrop-blur-md focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              <Heart className={`h-5 w-5 ${fav ? 'fill-[#ff375f] text-[#ff375f]' : 'text-white'}`} aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>

      {/* Title + tags */}
      <div>
        <h1 className="text-[28px] font-bold leading-tight tracking-tight sm:text-4xl">{recipe.title}</h1>
        <p className="mt-1 flex items-center gap-3 text-[15px] text-muted-foreground">
          <span className="inline-flex items-center gap-1"><Clock className="h-4 w-4" aria-hidden="true" />{recipe.cookTime} min</span>
          <span className="inline-flex items-center gap-1"><Users className="h-4 w-4" aria-hidden="true" />{recipe.servings} {recipe.servingsUnit}</span>
        </p>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {recipe.tags.map((t) => (
            <span key={t} className="rounded-full bg-secondary px-2.5 py-1 text-[12px] font-medium text-muted-foreground">
              {t}
            </span>
          ))}
        </div>
      </div>

      {/* Macros */}
      <div className="surface rounded-[20px] p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-semibold">
            Nutrition {recipe.isTotal ? '(whole recipe)' : '(per serving)'}
          </h2>
          {recipe.servings > 1 && (
            <span className="text-xs text-muted-foreground">
              {recipe.servings} {recipe.servingsUnit}
            </span>
          )}
        </div>
        <div className="grid grid-cols-4 gap-2">
          <MacroRing label="Calories" value={recipe.calories} unit="kcal" color="calories" />
          <MacroRing label="Protein" value={recipe.protein} unit="g" color="protein" max={Math.max(50, recipe.protein)} />
          <MacroRing label="Carbs" value={recipe.carbs} unit="g" color="carbs" max={Math.max(60, recipe.carbs)} />
          <MacroRing label="Fats" value={recipe.fats} unit="g" color="fats" max={Math.max(30, recipe.fats)} />
        </div>
        <div className="mt-4">
          <MacroBar protein={recipe.protein} carbs={recipe.carbs} fats={recipe.fats} calories={recipe.calories} />
          <div className="mt-2 flex justify-between text-[10px] text-muted-foreground">
            <span>Protein {Math.round((recipe.protein * 4 / (recipe.protein * 4 + recipe.carbs * 4 + recipe.fats * 9)) * 100)}%</span>
            <span>Carbs {Math.round((recipe.carbs * 4 / (recipe.protein * 4 + recipe.carbs * 4 + recipe.fats * 9)) * 100)}%</span>
            <span>Fats {Math.round((recipe.fats * 9 / (recipe.protein * 4 + recipe.carbs * 4 + recipe.fats * 9)) * 100)}%</span>
          </div>
        </div>
      </div>

      {/* Servings adjuster */}
      <div className="surface rounded-[20px] p-5">
        <h2 className="mb-3 font-semibold">Adjust servings</h2>
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">
            Scales ingredients ({servings} {servings === 1 ? 'serving' : recipe.servingsUnit})
          </span>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setServings((s) => Math.max(1, s - 1))}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-border transition-colors hover:border-primary hover:bg-primary/10"
            >
              <Minus className="h-4 w-4" />
            </button>
            <span className="w-8 text-center text-lg font-bold">{servings}</span>
            <button
              onClick={() => setServings((s) => s + 1)}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-border transition-colors hover:border-primary hover:bg-primary/10"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
        </div>
        <div className="mt-3 grid grid-cols-4 gap-2 text-center">
          <div className="rounded-lg bg-calories/10 p-2">
            <div className="text-sm font-bold text-calories">{Math.round(recipe.calories * servingsMultiplier)}</div>
            <div className="text-[10px] text-muted-foreground">kcal</div>
          </div>
          <div className="rounded-lg bg-protein/10 p-2">
            <div className="text-sm font-bold text-protein">{Math.round(recipe.protein * servingsMultiplier)}g</div>
            <div className="text-[10px] text-muted-foreground">protein</div>
          </div>
          <div className="rounded-lg bg-carbs/10 p-2">
            <div className="text-sm font-bold text-carbs">{Math.round(recipe.carbs * servingsMultiplier)}g</div>
            <div className="text-[10px] text-muted-foreground">carbs</div>
          </div>
          <div className="rounded-lg bg-fats/10 p-2">
            <div className="text-sm font-bold text-fats">{Math.round(recipe.fats * servingsMultiplier)}g</div>
            <div className="text-[10px] text-muted-foreground">fats</div>
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => setShowAddToPlan((v) => !v)}
          className="flex items-center justify-center gap-2 pressable h-12 rounded-full bg-primary px-4 text-[15px] font-semibold text-primary-foreground"
        >
          <CalendarPlus className="h-4 w-4" />
          Add to plan
        </button>
        <button
          onClick={addIngredientsToShopping}
          disabled={addedToShopping || loading}
          className="pressable flex h-12 items-center justify-center gap-2 rounded-full bg-secondary px-4 text-[15px] font-semibold disabled:opacity-60"
        >
          {addedToShopping ? <Check className="h-4 w-4 text-protein" /> : <ShoppingCart className="h-4 w-4" />}
          {addedToShopping ? 'Added!' : locked ? 'Unlock to shop' : 'Add to shopping'}
        </button>
      </div>

      {/* Add to plan picker */}
      {showAddToPlan && (
        <div className="rounded-2xl border border-primary/30 bg-card p-4">
          <h3 className="mb-3 font-semibold">Add to which day & meal?</h3>
          <div className="mb-3 grid grid-cols-7 gap-1.5">
            {DAYS_SHORT.map((d, i) => (
              <div key={d} className="text-center">
                <div className="mb-1 text-[10px] text-muted-foreground">{d}</div>
              </div>
            ))}
          </div>
          <div className="space-y-2">
            {MEAL_TYPES.map((mt) => (
              <div key={mt.value} className="flex items-center gap-2">
                <span className="w-24 shrink-0 text-sm font-medium">
                  {mt.emoji} {mt.label}
                </span>
                <div className="flex flex-1 gap-1">
                  {DAYS_SHORT.map((d, i) => (
                    <button
                      key={d}
                      onClick={() => addToPlan(i, mt.value)}
                      className="flex-1 rounded-md border border-border py-1.5 text-xs font-medium transition-colors hover:border-primary hover:bg-primary/10"
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Ingredients */}
      <div className="surface rounded-[20px] p-5">
        <div className="mb-3 flex items-center gap-2">
          <ChefHat className="h-5 w-5 text-primary" />
          <h2 className="font-semibold">Ingredients</h2>
          <span className="ml-auto text-xs text-muted-foreground">
            {locked ? `${totalIngredients} items` : `${checkedIngredients.size}/${totalIngredients}`}
          </span>
        </div>
        <ul className="space-y-2">
          {recipe.ingredients.map((ing, i) => (
            <li key={i}>
              <button
                onClick={() => toggleIngredient(i)}
                className="flex w-full items-start gap-3 rounded-lg p-2 text-left transition-colors hover:bg-muted/50"
              >
                <span className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border transition-colors ${
                  checkedIngredients.has(i)
                    ? 'border-protein bg-protein text-white'
                    : 'border-border'
                }`}>
                  {checkedIngredients.has(i) && <Check className="h-3 w-3" />}
                </span>
                <span className={`text-sm ${checkedIngredients.has(i) ? 'text-muted-foreground line-through' : ''}`}>
                  {ing}
                </span>
              </button>
            </li>
          ))}
        </ul>
        {locked && totalIngredients > recipe.ingredients.length && (
          <div className="relative mt-1" aria-hidden="true">
            <ul className="space-y-2 select-none blur-[5px]">
              {Array.from({ length: Math.min(4, totalIngredients - recipe.ingredients.length) }).map((_, i) => (
                <li key={i} className="flex items-center gap-3 p-2">
                  <span className="h-5 w-5 rounded border border-border" />
                  <span className="h-3 rounded bg-muted-foreground/40" style={{ width: `${55 + ((i * 17) % 35)}%` }} />
                </li>
              ))}
            </ul>
            <div className="absolute inset-0 bg-gradient-to-b from-card/0 to-card" />
          </div>
        )}
        {loading && <p className="mt-2 text-xs text-muted-foreground">Loading full recipe…</p>}
      </div>

      {/* Directions */}
      <div className="surface rounded-[20px] p-5">
        <div className="mb-3 flex items-center gap-2">
          <ListChecks className="h-5 w-5 text-primary" />
          <h2 className="font-semibold">Directions</h2>
          <span className="ml-auto text-xs text-muted-foreground">
            {locked ? `${totalSteps} steps` : `${checkedSteps.size}/${totalSteps} done`}
          </span>
        </div>
        {locked && (
          <button
            onClick={openPaywall}
            className="flex w-full flex-col items-center gap-2 rounded-xl border border-dashed border-border bg-muted/30 px-4 py-6 text-center transition-colors hover:border-primary/50"
          >
            <Lock className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
            <span className="text-sm font-semibold">{totalSteps} step-by-step directions</span>
            <span className="text-xs text-muted-foreground">Included with lifetime access</span>
          </button>
        )}
        <ol className="space-y-3">
          {recipe.directions.map((step, i) => (
            <li key={i}>
              <button
                onClick={() => toggleStep(i)}
                className="flex w-full items-start gap-3 rounded-lg p-2 text-left transition-colors hover:bg-muted/50"
              >
                <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-colors ${
                  checkedSteps.has(i)
                    ? 'bg-protein text-white'
                    : 'bg-primary/10 text-primary'
                }`}>
                  {checkedSteps.has(i) ? <Check className="h-3.5 w-3.5" /> : i + 1}
                </span>
                <span className={`pt-0.5 text-sm leading-relaxed ${checkedSteps.has(i) ? 'text-muted-foreground line-through' : ''}`}>
                  {step}
                </span>
              </button>
            </li>
          ))}
        </ol>
      </div>

      {/* Premium upsell */}
      {locked && (
        <div className="surface relative overflow-hidden rounded-[20px] p-5">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-foreground">
              <Crown className="h-5 w-5 text-background" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold">Premium Recipe</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Unlock the full ingredients and directions for this recipe and
                every other premium recipe — one payment, yours forever.
              </p>
              <button
                onClick={openPaywall}
                className="pressable mt-3 inline-flex h-11 items-center gap-2 rounded-full bg-foreground px-5 text-[15px] font-semibold text-background"
              >
                <Crown className="h-4 w-4" />
                Unlock now
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

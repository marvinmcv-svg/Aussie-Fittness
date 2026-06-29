'use client';

import { useState, useMemo } from 'react';
import {
  Plus, Trash2, X, ChevronLeft, ChevronRight, Flame, Beef,
  Wheat, Droplet, ShoppingBasket, CalendarDays
} from 'lucide-react';
import { getRecipeById, getRecipeVisual, getAllRecipes } from '@/lib/recipes';
import { useMealPlan } from '@/store/mealPlan';
import { useShoppingList } from '@/store/shoppingList';
import type { MealType } from '@/types';
import type { Screen } from '../page';

interface PlannerScreenProps {
  onNavigate: (screen: Screen, recipeId?: string) => void;
}

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const DAYS_SHORT = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const MEAL_TYPES: { value: MealType; label: string; emoji: string }[] = [
  { value: 'breakfast', label: 'Breakfast', emoji: '🍳' },
  { value: 'lunch', label: 'Lunch', emoji: '🥗' },
  { value: 'dinner', label: 'Dinner', emoji: '🍽️' },
  { value: 'snack', label: 'Snack', emoji: '🥤' },
];

export function PlannerScreen({ onNavigate }: PlannerScreenProps) {
  const { meals, removeMeal, clearDay, clearAll } = useMealPlan();
  const { addItems } = useShoppingList();
  const [activeDay, setActiveDay] = useState(0);
  const [pickMealType, setPickMealType] = useState<MealType | null>(null);

  const dayMeals = useMemo(
    () => meals.filter((m) => m.day === activeDay),
    [meals, activeDay]
  );

  const dayTotals = useMemo(() => {
    const totals = { calories: 0, protein: 0, carbs: 0, fats: 0 };
    for (const m of dayMeals) {
      const r = getRecipeById(m.recipeId);
      if (r) {
        const mult = m.servings / r.servings;
        totals.calories += r.calories * mult;
        totals.protein += r.protein * mult;
        totals.carbs += r.carbs * mult;
        totals.fats += r.fats * mult;
      }
    }
    return {
      calories: Math.round(totals.calories),
      protein: Math.round(totals.protein),
      carbs: Math.round(totals.carbs),
      fats: Math.round(totals.fats),
    };
  }, [dayMeals]);

  const weekTotals = useMemo(() => {
    const totals = { calories: 0, protein: 0, carbs: 0, fats: 0 };
    for (const m of meals) {
      const r = getRecipeById(m.recipeId);
      if (r) {
        const mult = m.servings / r.servings;
        totals.calories += r.calories * mult;
        totals.protein += r.protein * mult;
        totals.carbs += r.carbs * mult;
        totals.fats += r.fats * mult;
      }
    }
    return {
      calories: Math.round(totals.calories),
      protein: Math.round(totals.protein),
      carbs: Math.round(totals.carbs),
      fats: Math.round(totals.fats),
    };
  }, [meals]);

  const importToShopping = () => {
    const recipeMap = new Map<string, { servings: number; recipe: NonNullable<ReturnType<typeof getRecipeById>> }>();
    for (const m of meals) {
      const r = getRecipeById(m.recipeId);
      if (!r) continue;
      const existing = recipeMap.get(m.recipeId);
      if (existing) {
        existing.servings += m.servings;
      } else {
        recipeMap.set(m.recipeId, { servings: m.servings, recipe: r });
      }
    }
    const items: { name: string; fromRecipe: string }[] = [];
    for (const { servings, recipe } of recipeMap.values()) {
      const mult = servings / recipe.servings;
      for (const ing of recipe.ingredients) {
        items.push({
          name: mult === 1 ? ing : `${ing} (×${mult.toFixed(1)})`,
          fromRecipe: recipe.title,
        });
      }
    }
    if (items.length === 0) return;
    addItems(items);
    onNavigate('shopping');
  };

  return (
    <div className="space-y-5 pb-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold">Meal Planner</h1>
        <p className="text-sm text-muted-foreground">Plan your week, track your macros</p>
      </div>

      {/* Day selector */}
      <div className="flex gap-2 overflow-x-auto pb-1 custom-scroll">
        {DAYS_SHORT.map((d, i) => {
          const count = meals.filter((m) => m.day === i).length;
          return (
            <button
              key={d}
              onClick={() => setActiveDay(i)}
              className={`relative shrink-0 rounded-2xl border px-4 py-3 text-center transition-all ${
                activeDay === i
                  ? 'border-primary bg-primary/10'
                  : 'border-border bg-card hover:border-primary/40'
              }`}
            >
              <div className="text-xs font-medium">{d}</div>
              <div className="mt-0.5 text-lg font-bold">{count}</div>
              {count > 0 && (
                <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-primary" />
              )}
            </button>
          );
        })}
      </div>

      {/* Day totals */}
      <div className="rounded-2xl border border-border bg-card p-5">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-semibold">{DAYS[activeDay]} totals</h2>
          {dayMeals.length > 0 && (
            <button
              onClick={() => clearDay(activeDay)}
              className="text-xs text-destructive hover:underline"
            >
              Clear day
            </button>
          )}
        </div>
        <div className="grid grid-cols-4 gap-3">
          <TotalChip icon={<Flame className="h-4 w-4" />} label="Calories" value={dayTotals.calories} unit="kcal" color="text-calories" bg="bg-calories/10" />
          <TotalChip icon={<Beef className="h-4 w-4" />} label="Protein" value={dayTotals.protein} unit="g" color="text-protein" bg="bg-protein/10" />
          <TotalChip icon={<Wheat className="h-4 w-4" />} label="Carbs" value={dayTotals.carbs} unit="g" color="text-carbs" bg="bg-carbs/10" />
          <TotalChip icon={<Droplet className="h-4 w-4" />} label="Fats" value={dayTotals.fats} unit="g" color="text-fats" bg="bg-fats/10" />
        </div>
      </div>

      {/* Meals for the day */}
      <div className="space-y-3">
        {MEAL_TYPES.map((mt) => {
          const mealsOfType = dayMeals.filter((m) => m.mealType === mt.value);
          return (
            <div key={mt.value} className="rounded-2xl border border-border bg-card p-4">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="font-semibold">
                  <span className="mr-1.5">{mt.emoji}</span>
                  {mt.label}
                </h3>
                <button
                  onClick={() => setPickMealType(mt.value)}
                  className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary hover:bg-primary/20"
                >
                  <Plus className="h-3 w-3" />
                  Add
                </button>
              </div>
              {mealsOfType.length === 0 ? (
                <p className="py-4 text-center text-xs text-muted-foreground">
                  No {mt.label.toLowerCase()} planned
                </p>
              ) : (
                <div className="space-y-2">
                  {mealsOfType.map((m) => {
                    const r = getRecipeById(m.recipeId);
                    if (!r) return null;
                    const visual = getRecipeVisual(r);
                    const mult = m.servings / r.servings;
                    return (
                      <div
                        key={m.id}
                        className="flex items-center gap-3 rounded-xl border border-border p-2"
                      >
                        <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br ${visual.gradient} text-2xl`}>
                          {visual.emoji}
                        </div>
                        <div className="min-w-0 flex-1">
                          <button
                            onClick={() => onNavigate('recipe', r.id)}
                            className="block truncate text-left text-sm font-medium hover:text-primary"
                          >
                            {r.title}
                          </button>
                          <div className="mt-0.5 flex items-center gap-2 text-[10px] text-muted-foreground">
                            <span>{m.servings} {r.servingsUnit}</span>
                            <span>·</span>
                            <span className="text-calories">{Math.round(r.calories * mult)} cal</span>
                            <span className="text-protein">{Math.round(r.protein * mult)}p</span>
                          </div>
                        </div>
                        <button
                          onClick={() => removeMeal(m.id)}
                          className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Week summary + actions */}
      <div className="rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/10 to-card p-5">
        <div className="mb-3 flex items-center gap-2">
          <CalendarDays className="h-5 w-5 text-primary" />
          <h2 className="font-semibold">Week overview</h2>
        </div>
        <div className="mb-4 grid grid-cols-4 gap-2 text-center">
          <div>
            <div className="text-xl font-bold text-calories">{weekTotals.calories}</div>
            <div className="text-[10px] text-muted-foreground">calories</div>
          </div>
          <div>
            <div className="text-xl font-bold text-protein">{weekTotals.protein}g</div>
            <div className="text-[10px] text-muted-foreground">protein</div>
          </div>
          <div>
            <div className="text-xl font-bold text-carbs">{weekTotals.carbs}g</div>
            <div className="text-[10px] text-muted-foreground">carbs</div>
          </div>
          <div>
            <div className="text-xl font-bold text-fats">{weekTotals.fats}g</div>
            <div className="text-[10px] text-muted-foreground">fats</div>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={importToShopping}
            disabled={meals.length === 0}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-transform hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100"
          >
            <ShoppingBasket className="h-4 w-4" />
            Import to shopping list
          </button>
          {meals.length > 0 && (
            <button
              onClick={clearAll}
              className="flex items-center justify-center gap-2 rounded-xl border border-border px-4 py-2.5 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Empty state */}
      {meals.length === 0 && (
        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border py-12 text-center">
          <CalendarDays className="h-10 w-10 text-muted-foreground/50" />
          <div>
            <p className="font-semibold">Your week is empty</p>
            <p className="text-sm text-muted-foreground">Add recipes from any meal type above</p>
          </div>
          <button
            onClick={() => onNavigate('browse')}
            className="text-sm font-medium text-primary hover:underline"
          >
            Browse recipes →
          </button>
        </div>
      )}

      {/* Day navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setActiveDay((d) => (d + 6) % 7)}
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="h-4 w-4" />
          {DAYS_SHORT[(activeDay + 6) % 7]}
        </button>
        <span className="text-xs text-muted-foreground">
          {activeDay + 1} / 7
        </span>
        <button
          onClick={() => setActiveDay((d) => (d + 1) % 7)}
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          {DAYS_SHORT[(activeDay + 1) % 7]}
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* Recipe picker modal */}
      {pickMealType && (
        <RecipePicker
          mealType={pickMealType}
          day={activeDay}
          onClose={() => setPickMealType(null)}
          onNavigate={onNavigate}
        />
      )}
    </div>
  );
}

function TotalChip({
  icon, label, value, unit, color, bg,
}: { icon: React.ReactNode; label: string; value: number; unit: string; color: string; bg: string }) {
  return (
    <div className={`rounded-xl ${bg} p-3 text-center`}>
      <div className={`mb-1 flex justify-center ${color}`}>{icon}</div>
      <div className={`text-lg font-bold ${color}`}>{value}</div>
      <div className="text-[10px] text-muted-foreground">{label} ({unit})</div>
    </div>
  );
}

// Inline recipe picker — lets user pick from a compact list
function RecipePicker({
  mealType, day, onClose, onNavigate,
}: {
  mealType: MealType;
  day: number;
  onClose: () => void;
  onNavigate: (screen: Screen, recipeId?: string) => void;
}) {
  const { addMeal } = useMealPlan();
  const allRecipes = useMemo(() => getAllRecipes(), []);
  const [search, setSearch] = useState('');

  const filtered = allRecipes.filter((r) =>
    !search || r.title.toLowerCase().includes(search.toLowerCase()) ||
    r.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()))
  );

  const pick = (recipeId: string) => {
    addMeal(recipeId, day, mealType, 1);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-0 sm:items-center sm:p-4" onClick={onClose}>
      <div
        className="max-h-[80vh] w-full max-w-2xl overflow-hidden rounded-t-3xl border border-border bg-card sm:rounded-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-border p-4">
          <h3 className="font-semibold">Add a recipe to {MEAL_TYPES.find((m) => m.value === mealType)?.label}</h3>
          <button onClick={onClose} className="rounded-full p-1 hover:bg-muted">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="p-4">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search recipes..."
            autoFocus
            className="w-full rounded-full border border-border bg-background px-4 py-2 text-sm outline-none focus:border-primary"
          />
        </div>
        <div className="max-h-[50vh] overflow-y-auto custom-scroll px-4 pb-4">
          <div className="space-y-1.5">
            {filtered.slice(0, 50).map((r) => {
              const visual = getRecipeVisual(r);
              return (
                <button
                  key={r.id}
                  onClick={() => pick(r.id)}
                  className="flex w-full items-center gap-3 rounded-xl border border-border p-2 text-left transition-colors hover:border-primary hover:bg-primary/5"
                >
                  <div className={`flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br ${visual.gradient} text-xl`}>
                    {visual.emoji}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium">{r.title}</div>
                    <div className="text-[10px] text-muted-foreground">
                      {r.calories} cal · {r.protein}g protein · {r.cookTime}min
                    </div>
                  </div>
                  {r.premium && (
                    <span className="rounded bg-amber-500/20 px-1.5 py-0.5 text-[9px] font-bold text-amber-400">
                      PRO
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

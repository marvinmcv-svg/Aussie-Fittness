'use client';

import { Flame, TrendingUp, Sparkles, Crown, ChevronRight, Clock, Egg } from 'lucide-react';
import { RecipeCard } from '@/components/recipe/RecipeCard';
import { getRecipeStats, getFeaturedRecipes, getFreeRecipes } from '@/lib/recipes';
import { usePremium } from '@/store/premium';
import type { Screen } from '../page';

interface HomeScreenProps {
  onNavigate: (screen: Screen, recipeId?: string) => void;
}

export function HomeScreen({ onNavigate }: HomeScreenProps) {
  const stats = getRecipeStats();
  const featured = getFeaturedRecipes(6);
  const free = getFreeRecipes().slice(0, 8);
  const { isPremium } = usePremium();

  return (
    <div className="space-y-8 pb-6">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/20 via-card to-card">
        <div className="absolute inset-0">
          <img
            src="/recipes/hero-spread.png"
            alt="Assorted healthy high-protein fitness meals"
            className="h-full w-full object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-background/80 via-background/60 to-background/30" />
        </div>
        <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute -bottom-12 -left-12 h-40 w-40 rounded-full bg-amber-500/10 blur-3xl" />
        <div className="relative p-6 sm:p-8">
          <div className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-primary/15 px-3 py-1 text-xs font-medium text-primary">
            <Sparkles className="h-3 w-3" />
            Aussie Fitness Cookbook
          </div>
          <h1 className="text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl">
            <span className="gradient-text">{stats.total} High-Protein</span>
            <br />Recipes, Zero Guesswork
          </h1>
          <p className="mt-3 max-w-md text-sm text-muted-foreground sm:text-base">
            Low-calorie, macro-friendly meals and snacks. Plan your week, track
            your macros, and generate shopping lists in seconds.
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            <button
              onClick={() => onNavigate('browse')}
              className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-transform hover:scale-105"
            >
              Browse all recipes
              <ChevronRight className="h-4 w-4" />
            </button>
            <button
              onClick={() => onNavigate('planner')}
              className="inline-flex items-center gap-2 rounded-full border border-border bg-card/80 px-5 py-2.5 text-sm font-semibold backdrop-blur-sm transition-colors hover:border-primary/50"
            >
              <Egg className="h-4 w-4" />
              Plan my week
            </button>
          </div>
        </div>
      </section>

      {/* Stats strip */}
      <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard icon={<Flame className="h-4 w-4" />} label="Avg calories" value={`${stats.avgCalories}`} sub="per meal" color="text-calories" />
        <StatCard icon={<TrendingUp className="h-4 w-4" />} label="Avg protein" value={`${stats.avgProtein}g`} sub="per meal" color="text-protein" />
        <StatCard icon={<Clock className="h-4 w-4" />} label="Recipes" value={`${stats.total}`} sub={`${stats.savoury} sav · ${stats.sweet} sweet`} color="text-carbs" />
        <StatCard icon={<Crown className="h-4 w-4" />} label="Free to try" value={`${stats.freeCount}`} sub={`of ${stats.total}`} color="text-amber-400" />
      </section>

      {/* Featured */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold">Featured High-Protein</h2>
            <p className="text-xs text-muted-foreground">Top picks by protein content</p>
          </div>
          <button
            onClick={() => onNavigate('browse')}
            className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
          >
            See all <ChevronRight className="h-4 w-4" />
          </button>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {featured.map((r) => (
            <RecipeCard
              key={r.id}
              recipe={r}
              compact
              onClick={() => onNavigate('recipe', r.id)}
            />
          ))}
        </div>
      </section>

      {/* Categories */}
      <section>
        <h2 className="mb-4 text-xl font-bold">Categories</h2>
        <div className="grid grid-cols-2 gap-3">
          <CategoryCard
            emoji="🍗"
            name="Savoury"
            count={stats.savoury}
            gradient="from-emerald-500/20 to-teal-500/10"
            onClick={() => onNavigate('browse')}
          />
          <CategoryCard
            emoji="🍰"
            name="Sweet"
            count={stats.sweet}
            gradient="from-pink-500/20 to-rose-500/10"
            onClick={() => onNavigate('browse')}
          />
        </div>
      </section>

      {/* Free recipes */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold">Free Recipes</h2>
            <p className="text-xs text-muted-foreground">No premium unlock required</p>
          </div>
          <button
            onClick={() => onNavigate('browse')}
            className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
          >
            See all <ChevronRight className="h-4 w-4" />
          </button>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {free.map((r) => (
            <RecipeCard
              key={r.id}
              recipe={r}
              onClick={() => onNavigate('recipe', r.id)}
            />
          ))}
        </div>
      </section>

      {/* Premium CTA */}
      {!isPremium && (
        <section className="relative overflow-hidden rounded-3xl border border-amber-500/30 bg-gradient-to-br from-amber-500/15 via-card to-card p-6">
          <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-amber-500/20 blur-2xl" />
          <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-amber-500/20 px-3 py-1 text-xs font-semibold text-amber-400">
                <Crown className="h-3 w-3" />
                Premium Unlock
              </div>
              <h3 className="text-xl font-bold">Unlock all {stats.premiumCount} premium recipes</h3>
              <p className="mt-1 max-w-md text-sm text-muted-foreground">
                Get full access to every recipe, the meal planner, and smart
                shopping lists. One-time unlock, yours forever.
              </p>
            </div>
            <button
              onClick={() => onNavigate('profile')}
              className="inline-flex shrink-0 items-center gap-2 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-amber-500/20 transition-transform hover:scale-105"
            >
              <Crown className="h-4 w-4" />
              Unlock Premium
            </button>
          </div>
        </section>
      )}
    </div>
  );
}

function StatCard({
  icon, label, value, sub, color,
}: { icon: React.ReactNode; label: string; value: string; sub: string; color: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <div className={`mb-2 flex h-8 w-8 items-center justify-center rounded-lg bg-muted ${color}`}>
        {icon}
      </div>
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="text-[10px] text-muted-foreground/70">{sub}</div>
    </div>
  );
}

function CategoryCard({
  emoji, name, count, gradient, onClick,
}: { emoji: string; name: string; count: number; gradient: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`group relative flex items-center gap-4 overflow-hidden rounded-2xl border border-border bg-gradient-to-br ${gradient} p-5 text-left transition-all hover:border-primary/40 hover:shadow-lg`}
    >
      <span className="text-4xl transition-transform group-hover:scale-110">{emoji}</span>
      <div>
        <div className="text-lg font-bold">{name}</div>
        <div className="text-xs text-muted-foreground">{count} recipes</div>
      </div>
      <ChevronRight className="ml-auto h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-1" />
    </button>
  );
}

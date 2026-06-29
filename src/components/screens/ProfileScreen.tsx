'use client';

import {
  Crown, Check, Heart, ChefHat, Calendar, ShoppingBasket, Sparkles,
  Lock, Star, Zap, Infinity as InfinityIcon, Target, X
} from 'lucide-react';
import { usePremium } from '@/store/premium';
import { useFavorites } from '@/store/favorites';
import { useMealPlan } from '@/store/mealPlan';
import { useShoppingList } from '@/store/shoppingList';
import { useGoals } from '@/store/goals';
import { getRecipeStats } from '@/lib/recipes';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import type { Screen } from '../page';

interface ProfileScreenProps {
  onNavigate: (screen: Screen, recipeId?: string) => void;
}

export function ProfileScreen({ onNavigate }: ProfileScreenProps) {
  const { isPremium, unlockPremium } = usePremium();
  const favorites = useFavorites((s) => s.favorites);
  const mealCount = useMealPlan((s) => s.meals.length);
  const shoppingCount = useShoppingList((s) => s.items.length);
  const { goals, setGoals, resetGoals } = useGoals();
  const { toast } = useToast();
  const stats = getRecipeStats();
  const [showPaywall, setShowPaywall] = useState(false);
  const [showGoals, setShowGoals] = useState(false);

  return (
    <div className="space-y-6 pb-6">
      {/* Profile header */}
      <div className="flex flex-col items-center gap-3 rounded-3xl border border-border bg-gradient-to-br from-primary/10 to-card p-6 text-center">
        <div className={`flex h-20 w-20 items-center justify-center rounded-full ${isPremium ? 'bg-gradient-to-br from-amber-500 to-orange-500' : 'bg-primary/15'}`}>
          {isPremium ? <Crown className="h-10 w-10 text-white" /> : <ChefHat className="h-10 w-10 text-primary" />}
        </div>
        <div>
          <h1 className="text-xl font-extrabold">Aussie Fitness Cook</h1>
          <p className="text-sm text-muted-foreground">Your personal macro kitchen</p>
        </div>
        {isPremium ? (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 px-4 py-1.5 text-xs font-bold text-white">
            <Crown className="h-3 w-3" />
            PREMIUM MEMBER
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-4 py-1.5 text-xs font-medium text-muted-foreground">
            <Sparkles className="h-3 w-3" />
            Free plan
          </span>
        )}
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-3 gap-3">
        <StatBox icon={<Heart className="h-4 w-4" />} value={favorites.length} label="Favorites" color="text-red-400" onClick={() => onNavigate('browse')} />
        <StatBox icon={<Calendar className="h-4 w-4" />} value={mealCount} label="Planned" color="text-primary" onClick={() => onNavigate('planner')} />
        <StatBox icon={<ShoppingBasket className="h-4 w-4" />} value={shoppingCount} label="Shopping" color="text-carbs" onClick={() => onNavigate('shopping')} />
      </div>

      {/* Daily goals */}
      <div className="rounded-2xl border border-border bg-card p-5">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="flex items-center gap-2 font-semibold">
            <Target className="h-5 w-5 text-primary" aria-hidden="true" />
            Daily macro goals
          </h2>
          <button
            onClick={() => setShowGoals(true)}
            className="text-xs text-primary hover:underline"
          >
            Edit
          </button>
        </div>
        <div className="grid grid-cols-4 gap-2 text-center">
          <div className="rounded-lg bg-calories/10 p-2">
            <div className="text-lg font-bold text-calories">{goals.calories}</div>
            <div className="text-[10px] text-muted-foreground">cal</div>
          </div>
          <div className="rounded-lg bg-protein/10 p-2">
            <div className="text-lg font-bold text-protein">{goals.protein}g</div>
            <div className="text-[10px] text-muted-foreground">protein</div>
          </div>
          <div className="rounded-lg bg-carbs/10 p-2">
            <div className="text-lg font-bold text-carbs">{goals.carbs}g</div>
            <div className="text-[10px] text-muted-foreground">carbs</div>
          </div>
          <div className="rounded-lg bg-fats/10 p-2">
            <div className="text-lg font-bold text-fats">{goals.fats}g</div>
            <div className="text-[10px] text-muted-foreground">fats</div>
          </div>
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          Used to show progress bars in your meal planner.
        </p>
      </div>

      {/* Premium paywall card */}
      {!isPremium ? (
        <div className="relative overflow-hidden rounded-3xl border border-amber-500/30 bg-gradient-to-br from-amber-500/15 via-card to-card p-6">
          <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-amber-500/20 blur-2xl" />
          <div className="relative">
            <div className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-amber-500/20 px-3 py-1 text-xs font-bold text-amber-400">
              <Crown className="h-3 w-3" />
              PREMIUM UNLOCK
            </div>
            <h2 className="text-2xl font-extrabold">Unlock everything</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Get instant access to all {stats.total} recipes plus powerful planning tools.
            </p>

            <div className="mt-5 space-y-2.5">
              <Feature icon={<ChefHat className="h-4 w-4" />} text={`All ${stats.premiumCount} premium recipes`} />
              <Feature icon={<Calendar className="h-4 w-4" />} text="7-day meal planner with live macros" />
              <Feature icon={<ShoppingBasket className="h-4 w-4" />} text="Smart shopping list with auto-categorization" />
              <Feature icon={<InfinityIcon className="h-4 w-4" />} text="One-time payment — yours forever" />
              <Feature icon={<Zap className="h-4 w-4" />} text="No ads, no subscriptions" />
            </div>

            <button
              onClick={() => setShowPaywall(true)}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-3.5 text-base font-bold text-white shadow-lg shadow-amber-500/20 transition-transform hover:scale-[1.02]"
            >
              <Crown className="h-5 w-5" />
              Unlock Premium — $9.99
            </button>
            <p className="mt-2 text-center text-[11px] text-muted-foreground">
              Demo purchase — no real charge. Tap to simulate unlock.
            </p>
          </div>
        </div>
      ) : (
        <div className="rounded-3xl border border-protein/30 bg-gradient-to-br from-protein/10 to-card p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-protein/20">
              <Check className="h-6 w-6 text-protein" />
            </div>
            <div>
              <h2 className="font-bold">Premium active</h2>
              <p className="text-sm text-muted-foreground">All recipes unlocked. Enjoy!</p>
            </div>
          </div>
        </div>
      )}

      {/* Quick links */}
      <div className="space-y-2">
        <h3 className="px-1 text-sm font-semibold text-muted-foreground">About</h3>
        <LinkRow icon={<ChefHat className="h-4 w-4" />} label="Browse all recipes" value={`${stats.total} recipes`} onClick={() => onNavigate('browse')} />
        <LinkRow icon={<Star className="h-4 w-4" />} label="Free recipes" value={`${stats.freeCount} available`} onClick={() => onNavigate('browse')} />
        <LinkRow icon={<Heart className="h-4 w-4" />} label="Your favorites" value={`${favorites.length} saved`} onClick={() => onNavigate('browse')} />
      </div>

      {/* Author / credits */}
      <div className="rounded-2xl border border-border bg-card p-5">
        <h3 className="mb-2 font-semibold">About this cookbook</h3>
        <p className="text-sm leading-relaxed text-muted-foreground">
          {stats.total} low-calorie, high-protein recipes extracted from the
          Aussie Fitness Cookbook. {stats.savoury} savoury meals and {stats.sweet}{' '}
          sweet treats, averaging {stats.avgCalories} calories and {stats.avgProtein}g
          protein per serving.
        </p>
        <div className="mt-3 grid grid-cols-2 gap-2 text-center">
          <div className="rounded-lg bg-muted/50 p-2">
            <div className="text-lg font-bold text-calories">{stats.avgCalories}</div>
            <div className="text-[10px] text-muted-foreground">avg cal/meal</div>
          </div>
          <div className="rounded-lg bg-muted/50 p-2">
            <div className="text-lg font-bold text-protein">{stats.avgProtein}g</div>
            <div className="text-[10px] text-muted-foreground">avg protein/meal</div>
          </div>
        </div>
      </div>

      {/* Paywall modal */}
      {showPaywall && (
        <PaywallModal
          onClose={() => setShowPaywall(false)}
          onUnlock={() => {
            unlockPremium();
            setShowPaywall(false);
            toast({ title: 'Premium unlocked!', description: 'All 135 recipes are now yours.' });
          }}
        />
      )}

      {/* Goals modal */}
      <GoalsModal
        open={showGoals}
        onClose={() => setShowGoals(false)}
        goals={goals}
        onSave={(g) => {
          setGoals(g);
          setShowGoals(false);
          toast({ title: 'Goals updated', description: 'Your daily macro goals have been saved.' });
        }}
        onReset={() => {
          resetGoals();
          toast({ title: 'Goals reset', description: 'Restored to default values.' });
        }}
      />
    </div>
  );
}

function StatBox({
  icon, value, label, color, onClick,
}: { icon: React.ReactNode; value: number; label: string; color: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="rounded-2xl border border-border bg-card p-4 text-center transition-colors hover:border-primary/40"
    >
      <div className={`mb-1 flex justify-center ${color}`}>{icon}</div>
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-[10px] text-muted-foreground">{label}</div>
    </button>
  );
}

function Feature({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex items-center gap-2.5">
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-amber-500/20 text-amber-400">
        {icon}
      </div>
      <span className="text-sm">{text}</span>
    </div>
  );
}

function LinkRow({
  icon, label, value, onClick,
}: { icon: React.ReactNode; label: string; value: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex w-full items-center gap-3 rounded-2xl border border-border bg-card p-4 text-left transition-colors hover:border-primary/40"
    >
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted text-muted-foreground">
        {icon}
      </div>
      <span className="flex-1 text-sm font-medium">{label}</span>
      <span className="text-xs text-muted-foreground">{value}</span>
    </button>
  );
}

function PaywallModal({ onClose, onUnlock }: { onClose: () => void; onUnlock: () => void }) {
  const [processing, setProcessing] = useState(false);
  const [done, setDone] = useState(false);

  const handlePurchase = () => {
    setProcessing(true);
    setTimeout(() => {
      setProcessing(false);
      setDone(true);
      setTimeout(onUnlock, 800);
    }, 1200);
  };

  return (
    <Dialog open onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="max-w-md gap-0 p-0" aria-describedby="paywall-desc">
        <DialogDescription id="paywall-desc" className="sr-only">
          Unlock premium to access all recipes, the meal planner, and smart shopping lists.
        </DialogDescription>
        <div className="relative bg-gradient-to-br from-amber-500 to-orange-500 p-6 text-center text-white">
          <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-white/20">
            <Crown className="h-8 w-8" aria-hidden="true" />
          </div>
          <DialogTitle className="text-xl font-extrabold text-white">Unlock Premium</DialogTitle>
          <p className="mt-1 text-sm text-white/90">All recipes, forever</p>
        </div>
        <div className="p-6">
          <div className="mb-4 space-y-2">
            {[
              'All 110+ premium recipes unlocked',
              'Meal planner with macro tracking',
              'Smart shopping list',
              'No ads, ever',
            ].map((t) => (
              <div key={t} className="flex items-center gap-2.5">
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-protein/20">
                  <Check className="h-3 w-3 text-protein" aria-hidden="true" />
                </div>
                <span className="text-sm">{t}</span>
              </div>
            ))}
          </div>
          <div className="mb-4 rounded-xl bg-muted/50 p-3 text-center">
            <div className="text-3xl font-extrabold">$9.99</div>
            <div className="text-xs text-muted-foreground">one-time payment</div>
          </div>
          <button
            onClick={handlePurchase}
            disabled={processing || done}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-3.5 text-base font-bold text-white shadow-lg shadow-amber-500/20 transition-transform hover:scale-[1.02] disabled:opacity-70"
          >
            {processing ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                Processing...
              </>
            ) : done ? (
              <>
                <Check className="h-5 w-5" aria-hidden="true" />
                Unlocked!
              </>
            ) : (
              <>
                <Crown className="h-5 w-5" aria-hidden="true" />
                Purchase & Unlock
              </>
            )}
          </button>
          <p className="mt-3 text-center text-[11px] text-muted-foreground">
            This is a demo purchase — no real payment is processed.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function GoalsModal({
  open, onClose, goals, onSave, onReset,
}: {
  open: boolean;
  onClose: () => void;
  goals: { calories: number; protein: number; carbs: number; fats: number };
  onSave: (g: Partial<typeof goals>) => void;
  onReset: () => void;
}) {
  const [draft, setDraft] = useState(goals);

  // Sync draft when modal opens
  const [lastOpen, setLastOpen] = useState(open);
  if (open !== lastOpen) {
    setLastOpen(open);
    if (open) setDraft(goals);
  }

  if (!open) return null;

  const presets = [
    { label: 'Cut', values: { calories: 1800, protein: 160, carbs: 160, fats: 60 } },
    { label: 'Maintain', values: { calories: 2200, protein: 150, carbs: 220, fats: 70 } },
    { label: 'Bulk', values: { calories: 2800, protein: 180, carbs: 300, fats: 90 } },
  ];

  return (
    <Dialog open onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Daily macro goals</DialogTitle>
          <DialogDescription>
            Set your daily targets. Used to show progress bars in the meal planner.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          {/* Presets */}
          <div className="flex gap-2">
            {presets.map((p) => (
              <button
                key={p.label}
                onClick={() => setDraft(p.values)}
                className="flex-1 rounded-lg border border-border px-3 py-2 text-xs font-medium transition-colors hover:border-primary hover:bg-primary/5"
              >
                {p.label}
              </button>
            ))}
          </div>
          {/* Sliders */}
          <GoalSlider label="Calories" value={draft.calories} min={1200} max={4000} step={50} unit="kcal" color="text-calories" onChange={(v) => setDraft((d) => ({ ...d, calories: v }))} />
          <GoalSlider label="Protein" value={draft.protein} min={80} max={250} step={5} unit="g" color="text-protein" onChange={(v) => setDraft((d) => ({ ...d, protein: v }))} />
          <GoalSlider label="Carbs" value={draft.carbs} min={100} max={400} step={10} unit="g" color="text-carbs" onChange={(v) => setDraft((d) => ({ ...d, carbs: v }))} />
          <GoalSlider label="Fats" value={draft.fats} min={30} max={150} step={5} unit="g" color="text-fats" onChange={(v) => setDraft((d) => ({ ...d, fats: v }))} />
        </div>
        <div className="flex gap-2">
          <button
            onClick={onReset}
            className="rounded-xl border border-border px-4 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted"
          >
            Reset
          </button>
          <button
            onClick={() => onSave(draft)}
            className="flex-1 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-transform hover:scale-[1.02]"
          >
            Save goals
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function GoalSlider({
  label, value, min, max, step, unit, color, onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit: string;
  color: string;
  onChange: (v: number) => void;
}) {
  return (
    <div>
      <div className="mb-1 flex items-center justify-between">
        <span className="text-sm font-medium">{label}</span>
        <span className={`text-sm font-bold ${color}`}>{value}{unit}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-primary"
        aria-label={label}
      />
    </div>
  );
}

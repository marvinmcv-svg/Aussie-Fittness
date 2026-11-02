'use client';

import {
  Crown, Check, Heart, ChefHat, Calendar, ShoppingBasket, Sparkles,
  Lock, Star, Zap, Infinity as InfinityIcon, Target, Shield, LogIn, LogOut
} from 'lucide-react';
import { useSession, signOut } from 'next-auth/react';
import { usePremium } from '@/store/premium';
import { usePaywall } from '@/store/paywall';
import { PRICE_LABEL } from '@/lib/pricing';
import { useFavorites } from '@/store/favorites';
import { useMealPlan } from '@/store/mealPlan';
import { useShoppingList } from '@/store/shoppingList';
import { useGoals } from '@/store/goals';
import { getRecipeStats } from '@/lib/recipes';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { AuthModal } from '@/components/auth/AuthModal';
import { LegalSection } from '@/components/legal/LegalSection';
import { SettingsSection } from '@/components/settings/SettingsSection';
import { useState } from 'react';
import type { Screen } from '@/types';

interface ProfileScreenProps {
  onNavigate: (screen: Screen, recipeId?: string) => void;
}

export function ProfileScreen({ onNavigate }: ProfileScreenProps) {
  const { data: session, status } = useSession();
  const { isPremium } = usePremium();
  const favorites = useFavorites((s) => s.favorites);
  const mealCount = useMealPlan((s) => s.meals.length);
  const shoppingCount = useShoppingList((s) => s.items.length);
  const { goals, setGoals, resetGoals } = useGoals();
  const { toast } = useToast();
  const stats = getRecipeStats();
  const [showGoals, setShowGoals] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');

  const isLoggedIn = status === 'authenticated' && !!session?.user;
  const isAdmin = session?.user?.role === 'ADMIN';
  const displayName = session?.user?.name || session?.user?.email?.split('@')[0] || 'Aussie Fitness Cook';

  const openAuth = (mode: 'login' | 'signup') => {
    setAuthMode(mode);
    setShowAuth(true);
  };

  return (
    <div className="space-y-6 pb-6">
      {/* Profile header */}
      <div className="flex flex-col items-center gap-3 rounded-3xl border border-border bg-gradient-to-br from-primary/10 to-card p-6 text-center">
        <div className={`flex h-20 w-20 items-center justify-center rounded-full ${isPremium ? 'bg-foreground' : 'bg-secondary'}`}>
          {isPremium ? <Crown className="h-10 w-10 text-background" /> : <ChefHat className="h-10 w-10 text-foreground" />}
        </div>
        <div>
          <h1 className="text-xl font-extrabold">{displayName}</h1>
          <p className="text-sm text-muted-foreground">
            {isLoggedIn ? (session?.user?.email ?? '') : 'Your personal macro kitchen'}
          </p>
        </div>
        {isPremium ? (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-foreground px-4 py-1.5 text-xs font-semibold text-background">
            <Crown className="h-3 w-3" />
            PREMIUM MEMBER
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-4 py-1.5 text-xs font-medium text-muted-foreground">
            <Sparkles className="h-3 w-3" />
            Free plan
          </span>
        )}

        {/* Auth actions */}
        {!isLoggedIn ? (
          <div className="mt-2 flex gap-2">
            <button
              onClick={() => openAuth('login')}
              className="inline-flex items-center gap-1.5 rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground transition-transform hover:scale-105"
            >
              <LogIn className="h-4 w-4" />
              Sign in
            </button>
            <button
              onClick={() => openAuth('signup')}
              className="inline-flex items-center gap-1.5 rounded-full surface px-5 py-2 text-sm font-semibold transition-colors hover:border-primary/50"
            >
              Sign up
            </button>
          </div>
        ) : (
          <div className="mt-2 flex gap-2">
            {isAdmin && (
              <button
                onClick={() => onNavigate('admin')}
                className="inline-flex items-center gap-1.5 rounded-full bg-primary/15 px-4 py-2 text-sm font-semibold text-primary transition-colors hover:bg-primary/25"
              >
                <Shield className="h-4 w-4" />
                Admin panel
              </button>
            )}
            <button
              onClick={() => signOut({ callbackUrl: '/' })}
              className="inline-flex items-center gap-1.5 rounded-full border border-border px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:border-destructive/50 hover:text-destructive"
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </button>
          </div>
        )}
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-3 gap-3">
        <StatBox icon={<Heart className="h-4 w-4" />} value={favorites.length} label="Favorites" color="text-red-400" onClick={() => onNavigate('browse')} />
        <StatBox icon={<Calendar className="h-4 w-4" />} value={mealCount} label="Planned" color="text-primary" onClick={() => onNavigate('planner')} />
        <StatBox icon={<ShoppingBasket className="h-4 w-4" />} value={shoppingCount} label="Shopping" color="text-carbs" onClick={() => onNavigate('shopping')} />
      </div>

      {/* Daily goals */}
      <div className="surface rounded-[20px] p-5">
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
        <div className="surface relative overflow-hidden rounded-[28px] p-6">
          <div className="relative">
            <div className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-muted-foreground">
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
              onClick={() => usePaywall.getState().show('profile')}
              className="pressable mt-6 flex h-[52px] w-full items-center justify-center gap-2 rounded-full bg-foreground px-6 text-[17px] font-semibold text-background"
            >
              <Crown className="h-5 w-5" />
              Unlock everything — {PRICE_LABEL}
            </button>
            <p className="mt-2 text-center text-[11px] text-muted-foreground">
              One-time payment · 14-day money-back guarantee
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

      {/* Settings (only when logged in) */}
      {isLoggedIn && <SettingsSection />}

      {/* Legal */}
      <LegalSection />

      {/* Author / credits */}
      <div className="surface rounded-[20px] p-5">
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

      {/* Auth modal */}
      <AuthModal open={showAuth} onClose={() => setShowAuth(false)} mode={authMode} />
    </div>
  );
}

function StatBox({
  icon, value, label, color, onClick,
}: { icon: React.ReactNode; value: number; label: string; color: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="surface rounded-[20px] p-4 text-center transition-colors hover:border-primary/40"
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
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-secondary text-foreground">
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
      className="flex w-full items-center gap-3 surface rounded-[20px] p-4 text-left transition-colors hover:border-primary/40"
    >
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted text-muted-foreground">
        {icon}
      </div>
      <span className="flex-1 text-sm font-medium">{label}</span>
      <span className="text-xs text-muted-foreground">{value}</span>
    </button>
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

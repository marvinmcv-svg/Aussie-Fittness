'use client';

import {
  Crown, Check, Heart, ChefHat, Calendar, ShoppingBasket, Sparkles,
  Lock, Unlock, Star, Zap, Infinity as InfinityIcon
} from 'lucide-react';
import { usePremium } from '@/store/premium';
import { useFavorites } from '@/store/favorites';
import { useMealPlan } from '@/store/mealPlan';
import { useShoppingList } from '@/store/shoppingList';
import { getRecipeStats } from '@/lib/recipes';
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
  const stats = getRecipeStats();
  const [showPaywall, setShowPaywall] = useState(false);

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
          }}
        />
      )}
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
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 sm:items-center sm:p-4" onClick={onClose}>
      <div
        className="w-full max-w-md overflow-hidden rounded-t-3xl border border-amber-500/30 bg-card sm:rounded-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative bg-gradient-to-br from-amber-500 to-orange-500 p-6 text-center text-white">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 rounded-full bg-white/20 p-1.5 transition-colors hover:bg-white/30"
          >
            <Unlock className="h-4 w-4" />
          </button>
          <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-white/20">
            <Crown className="h-8 w-8" />
          </div>
          <h2 className="text-xl font-extrabold">Unlock Premium</h2>
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
                  <Check className="h-3 w-3 text-protein" />
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
                <Check className="h-5 w-5" />
                Unlocked!
              </>
            ) : (
              <>
                <Crown className="h-5 w-5" />
                Purchase & Unlock
              </>
            )}
          </button>
          <p className="mt-3 text-center text-[11px] text-muted-foreground">
            This is a demo purchase — no real payment is processed.
          </p>
        </div>
      </div>
    </div>
  );
}

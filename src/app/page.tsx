'use client';

import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { Home, Search, Calendar, ShoppingCart, User, Shield, LogOut } from 'lucide-react';
import { HomeScreen } from '@/components/screens/HomeScreen';
import { BrowseScreen } from '@/components/screens/BrowseScreen';
import { RecipeDetailScreen } from '@/components/screens/RecipeDetailScreen';
import { PlannerScreen } from '@/components/screens/PlannerScreen';
import { ShoppingScreen } from '@/components/screens/ShoppingScreen';
import { ProfileScreen } from '@/components/screens/ProfileScreen';
import { AdminScreen } from '@/components/screens/AdminScreen';
import { Paywall } from '@/components/paywall/Paywall';
import { usePremium } from '@/store/premium';
import { useToast } from '@/hooks/use-toast';
import { useUserDataSync } from '@/hooks/use-user-data-sync';
import type { Screen } from '@/types';

interface Tab {
  id: Screen;
  label: string;
  icon: React.ReactNode;
}

const BASE_TABS: Tab[] = [
  { id: 'home', label: 'Home', icon: <Home className="h-6 w-6" /> },
  { id: 'browse', label: 'Recipes', icon: <Search className="h-6 w-6" /> },
  { id: 'planner', label: 'Planner', icon: <Calendar className="h-6 w-6" /> },
  { id: 'shopping', label: 'Shopping', icon: <ShoppingCart className="h-6 w-6" /> },
  { id: 'profile', label: 'Profile', icon: <User className="h-6 w-6" /> },
];

// Read initial screen/recipe from URL on first load (deep linking)
function getInitialScreen(): { screen: Screen; recipeId?: string } {
  if (typeof window === 'undefined') return { screen: 'home' };
  const params = new URLSearchParams(window.location.search);
  const recipeParam = params.get('recipe');
  const tabParam = params.get('tab');
  if (recipeParam) return { screen: 'recipe', recipeId: recipeParam };
  if (tabParam) {
    const validTabs: Screen[] = ['home', 'browse', 'planner', 'shopping', 'profile'];
    if (validTabs.includes(tabParam as Screen)) return { screen: tabParam as Screen };
  }
  return { screen: 'home' };
}

export default function Home_() {
  const { data: session, status } = useSession();
  const [initial] = useState(getInitialScreen);
  const [screen, setScreen] = useState<Screen>(initial.screen);
  const [recipeId, setRecipeId] = useState<string | undefined>(initial.recipeId);
  const [browseCategory, setBrowseCategory] = useState<'all' | 'Savoury' | 'Sweet' | 'favorites'>('all');
  const [history, setHistory] = useState<Screen>('home');

  // Sync premium store from the server session (DB is the source of truth).
  // When logged out, premium is always false. There is no client-side bypass.
  const _setPremium = usePremium((s) => s._setPremium);
  useEffect(() => {
    if (status === 'authenticated' && session?.user) {
      _setPremium(session.user.isPremium);
    } else if (status === 'unauthenticated') {
      _setPremium(false);
    }
  }, [session, status, _setPremium]);

  // Sync user data (favorites, meal plan, shopping) with server on login/logout
  useUserDataSync();

  // Handle Stripe redirect back (success/cancel query param)
  const { toast } = useToast();
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const payment = params.get('payment');
    if (payment === 'success') {
      // Force session refresh so the new premium status is picked up
      window.location.href = window.location.pathname;
    } else if (payment === 'cancelled') {
      toast({ title: 'Payment cancelled', description: 'Your premium unlock was not completed.' });
      // Clean the URL
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, [toast]);

  // Update URL when screen/recipe changes (for shareable deep links)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const url = new URL(window.location.href);
    // Only manage ?recipe= and ?tab= — leave ?payment= and ?reset= alone
    if (screen === 'recipe' && recipeId) {
      url.searchParams.set('recipe', recipeId);
      url.searchParams.delete('tab');
    } else if (screen !== 'home') {
      url.searchParams.set('tab', screen);
      url.searchParams.delete('recipe');
    } else {
      url.searchParams.delete('recipe');
      url.searchParams.delete('tab');
    }
    // Don't add a history entry on every render — replace current
    window.history.replaceState({}, '', url.toString());
  }, [screen, recipeId]);

  const isAdmin = session?.user?.role === 'ADMIN';
  const tabs = isAdmin
    ? [...BASE_TABS.slice(0, 4), { id: 'admin' as Screen, label: 'Admin', icon: <Shield className="h-6 w-6" /> }, BASE_TABS[4]]
    : BASE_TABS;

  const navigate = (next: Screen, id?: string) => {
    setHistory(screen);
    setScreen(next);
    if (id) setRecipeId(id);
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const navigateToBrowse = (category?: 'all' | 'Savoury' | 'Sweet' | 'favorites') => {
    setBrowseCategory(category ?? 'all');
    setHistory(screen);
    setScreen('browse');
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const goBack = () => {
    setScreen(history);
    setRecipeId(undefined);
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const renderScreen = () => {
    switch (screen) {
      case 'home':
        return <HomeScreen onNavigate={navigate} onBrowseCategory={navigateToBrowse} />;
      case 'browse':
        return <BrowseScreen onNavigate={navigate} initialCategory={browseCategory} />;
      case 'recipe':
        return recipeId ? (
          <RecipeDetailScreen recipeId={recipeId} onNavigate={navigate} onBack={goBack} />
        ) : (
          <BrowseScreen onNavigate={navigate} initialCategory={browseCategory} />
        );
      case 'planner':
        return <PlannerScreen onNavigate={navigate} />;
      case 'shopping':
        return <ShoppingScreen onNavigate={navigate} />;
      case 'profile':
        return <ProfileScreen onNavigate={navigate} />;
      case 'admin':
        return isAdmin ? <AdminScreen onNavigate={navigate} /> : <ProfileScreen onNavigate={navigate} />;
      default:
        return <HomeScreen onNavigate={navigate} onBrowseCategory={navigateToBrowse} />;
    }
  };

  const isLanding = screen === 'home';

  return (
    <div className="flex min-h-screen flex-col">
      {/* Top bar — translucent, iOS style */}
      <header className="glass sticky top-0 z-30 border-b border-border/60 pt-[env(safe-area-inset-top)]">
        <div className="mx-auto flex h-12 max-w-5xl items-center justify-between px-4">
          <button
            onClick={() => navigate('home')}
            className="pressable flex items-center gap-2"
            aria-label="AussieFit home"
          >
            <span className="flex h-7 w-7 items-center justify-center rounded-[9px] bg-foreground text-[13px] font-black text-background">
              A
            </span>
            <span className="text-[17px] font-semibold tracking-tight">
              Aussie<span className="text-brand">Fit</span>
            </span>
          </button>
          <div className="flex items-center gap-2">
            {session?.user ? (
              <button
                onClick={() => signOut({ callbackUrl: '/' })}
                className="pressable inline-flex h-8 items-center gap-1.5 rounded-full bg-secondary px-3 text-[13px] font-medium text-muted-foreground"
                aria-label="Sign out"
              >
                <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
                <span className="hidden sm:inline">Sign out</span>
              </button>
            ) : (
              isLanding && (
                <button
                  onClick={() => navigate('profile')}
                  className="pressable inline-flex h-8 items-center rounded-full bg-foreground px-4 text-[13px] font-semibold text-background"
                >
                  Sign in
                </button>
              )
            )}
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 pb-6 pt-4">
        {renderScreen()}
      </main>

      {/* Global paywall — opened from any screen via usePaywall().show() */}
      <Paywall />

      {/* Tab bar — translucent, tinted active state, no indicator line */}
      <nav className="glass sticky bottom-0 z-30 border-t border-border/60" aria-label="Main">
        <div className="mx-auto flex max-w-5xl items-stretch justify-around px-1 pb-[max(env(safe-area-inset-bottom),6px)] pt-1.5">
          {tabs.map((tab) => {
            const active = screen === tab.id || (tab.id === 'browse' && screen === 'recipe');
            return (
              <button
                key={tab.id}
                onClick={() => navigate(tab.id)}
                className={`flex flex-1 flex-col items-center gap-0.5 py-1 transition-colors ${
                  active ? 'text-foreground' : 'text-muted-foreground/80 hover:text-foreground'
                }`}
                aria-label={tab.label}
                aria-current={active ? 'page' : undefined}
              >
                <span className={active ? '[&_svg]:stroke-[2.4]' : ''}>{tab.icon}</span>
                <span className={`text-[10px] ${active ? 'font-semibold' : 'font-medium'}`}>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}

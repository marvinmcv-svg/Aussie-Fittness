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
  { id: 'home', label: 'Home', icon: <Home className="h-5 w-5" /> },
  { id: 'browse', label: 'Recipes', icon: <Search className="h-5 w-5" /> },
  { id: 'planner', label: 'Planner', icon: <Calendar className="h-5 w-5" /> },
  { id: 'shopping', label: 'Shopping', icon: <ShoppingCart className="h-5 w-5" /> },
  { id: 'profile', label: 'Profile', icon: <User className="h-5 w-5" /> },
];

export default function Home_() {
  const { data: session, status } = useSession();
  const [screen, setScreen] = useState<Screen>('home');
  const [recipeId, setRecipeId] = useState<string | undefined>();
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

  const isAdmin = session?.user?.role === 'ADMIN';
  const tabs = isAdmin
    ? [...BASE_TABS.slice(0, 4), { id: 'admin' as Screen, label: 'Admin', icon: <Shield className="h-5 w-5" /> }, BASE_TABS[4]]
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

  return (
    <div className="flex min-h-screen flex-col">
      {/* Top bar */}
      <header className="sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <button
            onClick={() => navigate('home')}
            className="flex items-center gap-2"
          >
            <span className="text-xl">🍳</span>
            <span className="font-extrabold tracking-tight">
              Aussie<span className="text-primary">Fit</span>
            </span>
          </button>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="hidden sm:inline">135 recipes</span>
            {session?.user && (
              <button
                onClick={() => signOut({ callbackUrl: '/' })}
                className="inline-flex items-center gap-1 rounded-full border border-border px-2.5 py-1 text-xs font-medium transition-colors hover:border-destructive/50 hover:text-destructive"
                aria-label="Sign out"
              >
                <LogOut className="h-3 w-3" aria-hidden="true" />
                <span className="hidden sm:inline">Sign out</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-5">
        {renderScreen()}
      </main>

      {/* Bottom tab navigation */}
      <nav className="sticky bottom-0 z-30 border-t border-border bg-background/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-stretch justify-around px-1 pb-[env(safe-area-inset-bottom)] pt-1 sm:px-2">
          {tabs.map((tab) => {
            const active = screen === tab.id || (tab.id === 'browse' && screen === 'recipe');
            return (
              <button
                key={tab.id}
                onClick={() => navigate(tab.id)}
                className={`relative flex flex-1 flex-col items-center gap-0.5 py-2 transition-colors ${
                  active ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
                }`}
                aria-label={tab.label}
              >
                <span className={`transition-transform ${active ? 'scale-110' : ''}`}>
                  {tab.icon}
                </span>
                <span className="text-[10px] font-medium">{tab.label}</span>
                {active && (
                  <span className="absolute -top-px h-0.5 w-8 rounded-full bg-primary" />
                )}
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}

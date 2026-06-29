'use client';

import { useState, useEffect } from 'react';
import { Home, Search, Calendar, ShoppingCart, User } from 'lucide-react';
import { HomeScreen } from '@/components/screens/HomeScreen';
import { BrowseScreen } from '@/components/screens/BrowseScreen';
import { RecipeDetailScreen } from '@/components/screens/RecipeDetailScreen';
import { PlannerScreen } from '@/components/screens/PlannerScreen';
import { ShoppingScreen } from '@/components/screens/ShoppingScreen';
import { ProfileScreen } from '@/components/screens/ProfileScreen';

export type Screen = 'home' | 'browse' | 'recipe' | 'planner' | 'shopping' | 'profile';

interface Tab {
  id: Screen;
  label: string;
  icon: React.ReactNode;
}

const TABS: Tab[] = [
  { id: 'home', label: 'Home', icon: <Home className="h-5 w-5" /> },
  { id: 'browse', label: 'Recipes', icon: <Search className="h-5 w-5" /> },
  { id: 'planner', label: 'Planner', icon: <Calendar className="h-5 w-5" /> },
  { id: 'shopping', label: 'Shopping', icon: <ShoppingCart className="h-5 w-5" /> },
  { id: 'profile', label: 'Profile', icon: <User className="h-5 w-5" /> },
];

export default function Home_() {
  const [screen, setScreen] = useState<Screen>('home');
  const [recipeId, setRecipeId] = useState<string | undefined>();
  const [browseCategory, setBrowseCategory] = useState<'all' | 'Savoury' | 'Sweet' | 'favorites'>('all');
  const [history, setHistory] = useState<Screen>('home');

  const navigate = (next: Screen, id?: string) => {
    setHistory(screen);
    setScreen(next);
    if (id) setRecipeId(id);
    // Reset browse category when navigating to browse from non-home sources
    if (next === 'browse' && !id) {
      // keep existing category if coming from home category click (handled separately)
    }
    // Scroll to top on navigation
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
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <span className="hidden sm:inline">135 recipes</span>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-5">
        {renderScreen()}
      </main>

      {/* Bottom tab navigation */}
      <nav className="sticky bottom-0 z-30 border-t border-border bg-background/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-stretch justify-around px-2 pb-[env(safe-area-inset-bottom)] pt-1">
          {TABS.map((tab) => {
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

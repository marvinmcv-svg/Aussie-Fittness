'use client';

import { useState, useEffect } from 'react';
import { signIn } from 'next-auth/react';
import { Mail, Lock, User, Loader2, ChefHat, ArrowLeft } from 'lucide-react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';

interface AuthModalProps {
  open: boolean;
  onClose: () => void;
  mode?: 'login' | 'signup';
}

type View = 'login' | 'signup' | 'forgot' | 'reset';

export function AuthModal({ open, onClose, mode: initialMode = 'login' }: AuthModalProps) {
  const [view, setView] = useState<View>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [forgotSent, setForgotSent] = useState(false);
  const { toast } = useToast();

  // Sync view when initialMode changes
  useEffect(() => {
    if (open) setView(initialMode);
  }, [open, initialMode]);

  // Check for ?reset=TOKEN in URL on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const reset = params.get('reset');
    if (reset) {
      setResetToken(reset);
      setView('reset');
      // Clean URL
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (view === 'signup') {
        const res = await fetch('/api/auth/signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password, name }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to sign up');

        const result = await signIn('credentials', { email, password, redirect: false });
        if (result?.error) throw new Error(result.error);

        toast({ title: 'Welcome aboard!', description: 'Your account has been created.' });
        resetAndClose();
      } else if (view === 'login') {
        const result = await signIn('credentials', { email, password, redirect: false });
        if (result?.error) throw new Error(result.error);

        toast({ title: 'Welcome back!', description: 'You are now signed in.' });
        resetAndClose();
      } else if (view === 'forgot') {
        const res = await fetch('/api/auth/forgot-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to send reset email');

        setForgotSent(true);
        toast({
          title: 'Reset link sent',
          description: 'If an account exists for that email, a reset link has been sent. Check the server console in dev mode.',
        });
      } else if (view === 'reset') {
        const res = await fetch('/api/auth/reset-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token: resetToken, password: newPassword }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to reset password');

        toast({ title: 'Password reset!', description: 'You can now sign in with your new password.' });
        setView('login');
        setPassword('');
        setNewPassword('');
        setResetToken('');
      }
    } catch (err) {
      toast({
        title: 'Authentication failed',
        description: err instanceof Error ? err.message : 'Something went wrong',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const resetAndClose = () => {
    setEmail('');
    setPassword('');
    setName('');
    setNewPassword('');
    setResetToken('');
    setForgotSent(false);
    onClose();
  };

  const titles: Record<View, string> = {
    login: 'Welcome back',
    signup: 'Create your account',
    forgot: 'Reset your password',
    reset: 'Set a new password',
  };
  const descriptions: Record<View, string> = {
    login: 'Sign in to sync your favorites, meal plans, and shopping lists',
    signup: 'Join to save your progress and unlock premium recipes',
    forgot: 'Enter your email and we\'ll send you a reset link',
    reset: 'Choose a new password for your account',
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) resetAndClose(); }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="mx-auto mb-2 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
            <ChefHat className="h-7 w-7 text-primary" aria-hidden="true" />
          </div>
          <DialogTitle className="text-center text-xl">{titles[view]}</DialogTitle>
          <DialogDescription className="text-center">{descriptions[view]}</DialogDescription>
        </DialogHeader>

        {view === 'forgot' && forgotSent ? (
          <div className="space-y-4 py-4 text-center">
            <Mail className="mx-auto h-10 w-10 text-primary" aria-hidden="true" />
            <div>
              <p className="font-semibold">Check your email</p>
              <p className="mt-1 text-sm text-muted-foreground">
                If an account exists for <strong>{email}</strong>, a reset link has been sent.
                In development mode, check the server console for the link.
              </p>
            </div>
            <button
              onClick={() => { setView('login'); setForgotSent(false); }}
              className="text-sm font-medium text-primary hover:underline"
            >
              Back to sign in
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            {view === 'signup' && (
              <div>
                <label htmlFor="auth-name" className="mb-1 block text-xs font-medium text-muted-foreground">
                  Name (optional)
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
                  <input
                    id="auth-name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your name"
                    className="w-full rounded-lg border border-border bg-background py-2.5 pl-10 pr-3 text-sm outline-none focus:border-primary"
                  />
                </div>
              </div>
            )}

            {(view === 'login' || view === 'signup' || view === 'forgot') && (
              <div>
                <label htmlFor="auth-email" className="mb-1 block text-xs font-medium text-muted-foreground">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
                  <input
                    id="auth-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    autoComplete="email"
                    className="w-full rounded-lg border border-border bg-background py-2.5 pl-10 pr-3 text-sm outline-none focus:border-primary"
                  />
                </div>
              </div>
            )}

            {(view === 'login' || view === 'signup') && (
              <div>
                <label htmlFor="auth-password" className="mb-1 block text-xs font-medium text-muted-foreground">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
                  <input
                    id="auth-password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={view === 'signup' ? 'At least 6 characters' : 'Your password'}
                    autoComplete={view === 'signup' ? 'new-password' : 'current-password'}
                    className="w-full rounded-lg border border-border bg-background py-2.5 pl-10 pr-3 text-sm outline-none focus:border-primary"
                  />
                </div>
              </div>
            )}

            {view === 'reset' && (
              <div>
                <label htmlFor="auth-new-password" className="mb-1 block text-xs font-medium text-muted-foreground">
                  New Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
                  <input
                    id="auth-new-password"
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    autoComplete="new-password"
                    className="w-full rounded-lg border border-border bg-background py-2.5 pl-10 pr-3 text-sm outline-none focus:border-primary"
                  />
                </div>
              </div>
            )}

            {view === 'login' && (
              <div className="text-right">
                <button
                  type="button"
                  onClick={() => setView('forgot')}
                  className="text-xs text-muted-foreground hover:text-primary hover:underline"
                >
                  Forgot password?
                </button>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-transform hover:scale-[1.02] disabled:opacity-70"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
              {view === 'login' && 'Sign in'}
              {view === 'signup' && 'Create account'}
              {view === 'forgot' && 'Send reset link'}
              {view === 'reset' && 'Set new password'}
            </button>
          </form>
        )}

        <div className="text-center text-sm text-muted-foreground">
          {(view === 'forgot' || view === 'reset') && (
            <button
              onClick={() => setView('login')}
              className="inline-flex items-center gap-1 font-medium text-primary hover:underline"
            >
              <ArrowLeft className="h-3 w-3" />
              Back to sign in
            </button>
          )}
          {view === 'login' && (
            <>
              Don&apos;t have an account?{' '}
              <button onClick={() => setView('signup')} className="font-medium text-primary hover:underline">
                Sign up
              </button>
            </>
          )}
          {view === 'signup' && (
            <>
              Already have an account?{' '}
              <button onClick={() => setView('login')} className="font-medium text-primary hover:underline">
                Sign in
              </button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

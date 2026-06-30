'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Users, Crown, DollarSign, TrendingUp, Search, Plus, Trash2,
  Shield, Star, UserPlus, Mail, Loader2, ChevronDown, X, AlertCircle
} from 'lucide-react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import type { Screen } from '../page';

interface AdminScreenProps {
  onNavigate: (screen: Screen, recipeId?: string) => void;
}

interface AdminUser {
  id: string;
  email: string;
  name: string | null;
  role: string;
  isPremium: boolean;
  createdAt: string;
}

interface AdminStats {
  users: { total: number; premium: number; free: number; admin: number; newThisWeek: number };
  revenue: { total: number; perUser: number };
  conversionRate: number;
  recipes: { total: number; avgCalories: number; avgProtein: number; freeCount: number; premiumCount: number; savoury: number; sweet: number };
}

export function AdminScreen({ onNavigate: _onNavigate }: AdminScreenProps) {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'premium' | 'free' | 'admin'>('all');
  const [showCreate, setShowCreate] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<AdminUser | null>(null);
  const { toast } = useToast();

  const loadData = useCallback(async () => {
    try {
      const [statsRes, usersRes] = await Promise.all([
        fetch('/api/admin/stats'),
        fetch('/api/admin/users'),
      ]);
      if (statsRes.ok) setStats(await statsRes.json());
      if (usersRes.ok) {
        const data = await usersRes.json();
        setUsers(data.users ?? data ?? []);
      }
    } catch {
      toast({ title: 'Failed to load admin data', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const updateUser = async (id: string, updates: Partial<AdminUser>) => {
    // Optimistic update
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, ...updates } : u)));
    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to update');
      }
      const updated = await res.json();
      setUsers((prev) => prev.map((u) => (u.id === id ? updated : u)));
    } catch (err) {
      // Revert on error
      await loadData();
      toast({
        title: 'Update failed',
        description: err instanceof Error ? err.message : 'Unknown error',
        variant: 'destructive',
      });
    }
  };

  const togglePremium = (user: AdminUser) => {
    updateUser(user.id, { isPremium: !user.isPremium });
    toast({
      title: user.isPremium ? 'Downgraded to free' : 'Upgraded to premium',
      description: user.email,
    });
  };

  const toggleAdmin = (user: AdminUser) => {
    updateUser(user.id, { role: user.role === 'ADMIN' ? 'USER' : 'ADMIN' });
    toast({
      title: user.role === 'ADMIN' ? 'Admin removed' : 'Admin granted',
      description: user.email,
    });
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      const res = await fetch(`/api/admin/users/${deleteTarget.id}`, { method: 'DELETE' });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to delete');
      }
      setUsers((prev) => prev.filter((u) => u.id !== deleteTarget.id));
      toast({ title: 'User deleted', description: deleteTarget.email });
    } catch (err) {
      toast({
        title: 'Delete failed',
        description: err instanceof Error ? err.message : 'Unknown error',
        variant: 'destructive',
      });
    } finally {
      setDeleteTarget(null);
    }
  };

  const filtered = users.filter((u) => {
    if (filter === 'premium' && !u.isPremium) return false;
    if (filter === 'free' && u.isPremium) return false;
    if (filter === 'admin' && u.role !== 'ADMIN') return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return u.email.toLowerCase().includes(q) || (u.name?.toLowerCase().includes(q) ?? false);
    }
    return true;
  });

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" aria-hidden="true" />
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-20 text-center">
        <AlertCircle className="h-10 w-10 text-destructive" />
        <p className="font-semibold">Access denied</p>
        <p className="text-sm text-muted-foreground">You need admin privileges to view this page.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-extrabold">
            <Shield className="h-6 w-6 text-primary" aria-hidden="true" />
            Admin Dashboard
          </h1>
          <p className="text-sm text-muted-foreground">Manage users, track revenue, and run your business</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-transform hover:scale-105"
        >
          <UserPlus className="h-4 w-4" aria-hidden="true" />
          <span className="hidden sm:inline">New user</span>
        </button>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          icon={<Users className="h-5 w-5" />}
          label="Total users"
          value={stats.users.total}
          sub={`${stats.users.newThisWeek} new this week`}
          color="text-primary"
          bg="bg-primary/10"
        />
        <StatCard
          icon={<Crown className="h-5 w-5" />}
          label="Premium users"
          value={stats.users.premium}
          sub={`${stats.users.free} free`}
          color="text-amber-400"
          bg="bg-amber-500/10"
        />
        <StatCard
          icon={<DollarSign className="h-5 w-5" />}
          label="Revenue"
          value={`$${stats.revenue.total.toFixed(2)}`}
          sub={`$${stats.revenue.perUser.toFixed(2)} / premium user`}
          color="text-protein"
          bg="bg-protein/10"
        />
        <StatCard
          icon={<TrendingUp className="h-5 w-5" />}
          label="Conversion rate"
          value={`${stats.conversionRate}%`}
          sub={`${stats.users.admin} admins`}
          color="text-carbs"
          bg="bg-carbs/10"
        />
      </div>

      {/* User management */}
      <div className="rounded-2xl border border-border bg-card">
        <div className="border-b border-border p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="font-semibold">User management</h2>
            <div className="flex gap-2">
              <div className="relative flex-1 sm:w-56">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by email or name..."
                  aria-label="Search users"
                  className="w-full rounded-full border border-border bg-background py-1.5 pl-9 pr-3 text-sm outline-none focus:border-primary"
                />
              </div>
            </div>
          </div>
          {/* Filter chips */}
          <div className="mt-3 flex gap-2">
            {(['all', 'premium', 'free', 'admin'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                aria-pressed={filter === f}
                className={`rounded-full px-3 py-1 text-xs font-medium capitalize transition-colors ${
                  filter === f
                    ? 'bg-primary text-primary-foreground'
                    : 'border border-border hover:border-primary/50'
                }`}
              >
                {f}
                {f === 'all' ? ` (${users.length})` : f === 'premium' ? ` (${stats.users.premium})` : f === 'free' ? ` (${stats.users.free})` : ` (${stats.users.admin})`}
              </button>
            ))}
          </div>
        </div>

        {/* User table — desktop */}
        <div className="hidden overflow-x-auto md:block">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border text-left text-xs text-muted-foreground">
                <th className="px-4 py-3 font-medium">User</th>
                <th className="px-4 py-3 font-medium">Role</th>
                <th className="px-4 py-3 font-medium">Plan</th>
                <th className="px-4 py-3 font-medium">Joined</th>
                <th className="px-4 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((user) => (
                <tr key={user.id} className="border-b border-border/50 last:border-0 hover:bg-muted/30">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold ${
                        user.role === 'ADMIN' ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'
                      }`}>
                        {(user.name || user.email)[0].toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <div className="truncate text-sm font-medium">{user.name || 'No name'}</div>
                        <div className="truncate text-xs text-muted-foreground">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {user.role === 'ADMIN' ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-primary/15 px-2 py-0.5 text-xs font-medium text-primary">
                        <Shield className="h-3 w-3" aria-hidden="true" /> Admin
                      </span>
                    ) : (
                      <span className="text-xs text-muted-foreground">User</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {user.isPremium ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 px-2 py-0.5 text-xs font-medium text-amber-400">
                        <Crown className="h-3 w-3" aria-hidden="true" /> Premium
                      </span>
                    ) : (
                      <span className="text-xs text-muted-foreground">Free</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">
                    {new Date(user.createdAt).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => togglePremium(user)}
                        title={user.isPremium ? 'Downgrade to free' : 'Upgrade to premium'}
                        aria-label={user.isPremium ? `Downgrade ${user.email} to free` : `Upgrade ${user.email} to premium`}
                        className={`flex h-8 w-8 items-center justify-center rounded-lg transition-colors ${
                          user.isPremium
                            ? 'bg-amber-500/15 text-amber-400 hover:bg-amber-500/25'
                            : 'bg-muted text-muted-foreground hover:bg-amber-500/15 hover:text-amber-400'
                        }`}
                      >
                        <Crown className="h-4 w-4" aria-hidden="true" />
                      </button>
                      <button
                        onClick={() => toggleAdmin(user)}
                        title={user.role === 'ADMIN' ? 'Remove admin' : 'Make admin'}
                        aria-label={user.role === 'ADMIN' ? `Remove admin from ${user.email}` : `Make ${user.email} admin`}
                        className={`flex h-8 w-8 items-center justify-center rounded-lg transition-colors ${
                          user.role === 'ADMIN'
                            ? 'bg-primary/15 text-primary hover:bg-primary/25'
                            : 'bg-muted text-muted-foreground hover:bg-primary/15 hover:text-primary'
                        }`}
                      >
                        <Shield className="h-4 w-4" aria-hidden="true" />
                      </button>
                      <button
                        onClick={() => setDeleteTarget(user)}
                        title="Delete user"
                        aria-label={`Delete ${user.email}`}
                        className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted text-muted-foreground transition-colors hover:bg-destructive/15 hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" aria-hidden="true" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* User list — mobile */}
        <div className="divide-y divide-border/50 md:hidden">
          {filtered.map((user) => (
            <div key={user.id} className="p-4">
              <div className="flex items-center gap-3">
                <div className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold ${
                  user.role === 'ADMIN' ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'
                }`}>
                  {(user.name || user.email)[0].toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium">{user.name || 'No name'}</div>
                  <div className="truncate text-xs text-muted-foreground">{user.email}</div>
                </div>
              </div>
              <div className="mt-2 flex items-center gap-2">
                {user.role === 'ADMIN' && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-medium text-primary">
                    <Shield className="h-2.5 w-2.5" /> Admin
                  </span>
                )}
                {user.isPremium ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] font-medium text-amber-400">
                    <Crown className="h-2.5 w-2.5" /> Premium
                  </span>
                ) : (
                  <span className="text-[10px] text-muted-foreground">Free</span>
                )}
                <span className="text-[10px] text-muted-foreground">
                  {new Date(user.createdAt).toLocaleDateString('en-AU', { day: 'numeric', month: 'short' })}
                </span>
              </div>
              <div className="mt-3 flex gap-2">
                <button
                  onClick={() => togglePremium(user)}
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-border py-1.5 text-xs font-medium transition-colors hover:border-amber-500/50"
                >
                  <Crown className="h-3 w-3" /> {user.isPremium ? 'Downgrade' : 'Upgrade'}
                </button>
                <button
                  onClick={() => toggleAdmin(user)}
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-border py-1.5 text-xs font-medium transition-colors hover:border-primary/50"
                >
                  <Shield className="h-3 w-3" /> {user.role === 'ADMIN' ? 'Remove admin' : 'Make admin'}
                </button>
                <button
                  onClick={() => setDeleteTarget(user)}
                  aria-label={`Delete ${user.email}`}
                  className="flex items-center justify-center rounded-lg border border-border px-3 py-1.5 text-destructive transition-colors hover:bg-destructive/10"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="py-12 text-center text-sm text-muted-foreground">
            {search ? 'No users match your search' : 'No users found'}
          </div>
        )}
      </div>

      {/* Create user modal */}
      {showCreate && (
        <CreateUserModal
          onClose={() => setShowCreate(false)}
          onCreated={(newUser) => {
            setUsers((prev) => [newUser, ...prev]);
            setShowCreate(false);
            toast({ title: 'User created', description: newUser.email });
          }}
        />
      )}

      {/* Delete confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this user?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete <strong>{deleteTarget?.email}</strong>. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete user
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function StatCard({
  icon, label, value, sub, color, bg,
}: { icon: React.ReactNode; label: string; value: string | number; sub: string; color: string; bg: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <div className={`mb-2 flex h-9 w-9 items-center justify-center rounded-lg ${bg} ${color}`}>
        {icon}
      </div>
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="text-[10px] text-muted-foreground/70">{sub}</div>
    </div>
  );
}

function CreateUserModal({
  onClose, onCreated,
}: {
  onClose: () => void;
  onCreated: (user: AdminUser) => void;
}) {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [isPremium, setIsPremium] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email, password, name,
          role: isAdmin ? 'ADMIN' : 'USER',
          isPremium,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create user');
      onCreated(data);
    } catch (err) {
      toast({
        title: 'Failed to create user',
        description: err instanceof Error ? err.message : 'Unknown error',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-primary" aria-hidden="true" />
            Create new user
          </DialogTitle>
          <DialogDescription>
            Add a user account. You can grant premium or admin access.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label htmlFor="cu-name" className="mb-1 block text-xs font-medium text-muted-foreground">Name</label>
            <input
              id="cu-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="User's name"
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
            />
          </div>
          <div>
            <label htmlFor="cu-email" className="mb-1 block text-xs font-medium text-muted-foreground">Email *</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
              <input
                id="cu-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="user@example.com"
                className="w-full rounded-lg border border-border bg-background py-2 pl-10 pr-3 text-sm outline-none focus:border-primary"
              />
            </div>
          </div>
          <div>
            <label htmlFor="cu-password" className="mb-1 block text-xs font-medium text-muted-foreground">Password *</label>
            <input
              id="cu-password"
              type="text"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 6 characters"
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
            />
          </div>
          <div className="space-y-2 rounded-lg border border-border p-3">
            <label className="flex cursor-pointer items-center justify-between">
              <span className="flex items-center gap-2 text-sm">
                <Crown className="h-4 w-4 text-amber-400" aria-hidden="true" />
                Premium access
              </span>
              <input
                type="checkbox"
                checked={isPremium}
                onChange={(e) => setIsPremium(e.target.checked)}
                className="h-4 w-4 accent-primary"
              />
            </label>
            <label className="flex cursor-pointer items-center justify-between">
              <span className="flex items-center gap-2 text-sm">
                <Shield className="h-4 w-4 text-primary" aria-hidden="true" />
                Admin privileges
              </span>
              <input
                type="checkbox"
                checked={isAdmin}
                onChange={(e) => setIsAdmin(e.target.checked)}
                className="h-4 w-4 accent-primary"
              />
            </label>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-transform hover:scale-[1.02] disabled:opacity-70"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
            Create user
          </button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

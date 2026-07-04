'use client';

import { useState } from 'react';
import { signOut } from 'next-auth/react';
import {
  KeyRound, Download, Trash2, Loader2, AlertTriangle,
} from 'lucide-react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';

export function SettingsSection() {
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [showDeleteAccount, setShowDeleteAccount] = useState(false);
  const { toast } = useToast();

  const handleExportData = async () => {
    try {
      const res = await fetch('/api/user/export-data');
      if (!res.ok) throw new Error('Failed to export data');

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'aussiefit-data-export.json';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({ title: 'Data exported', description: 'Your data has been downloaded as a JSON file.' });
    } catch {
      toast({ title: 'Export failed', description: 'Could not export your data.', variant: 'destructive' });
    }
  };

  return (
    <div className="space-y-2">
      <h3 className="px-1 text-sm font-semibold text-muted-foreground">Settings</h3>

      <button
        onClick={() => setShowChangePassword(true)}
        className="flex w-full items-center gap-3 rounded-2xl border border-border bg-card p-4 text-left transition-colors hover:border-primary/40"
      >
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted text-muted-foreground">
          <KeyRound className="h-4 w-4" />
        </div>
        <div className="flex-1">
          <div className="text-sm font-medium">Change password</div>
          <div className="text-xs text-muted-foreground">Update your account password</div>
        </div>
      </button>

      <button
        onClick={handleExportData}
        className="flex w-full items-center gap-3 rounded-2xl border border-border bg-card p-4 text-left transition-colors hover:border-primary/40"
      >
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted text-muted-foreground">
          <Download className="h-4 w-4" />
        </div>
        <div className="flex-1">
          <div className="text-sm font-medium">Export my data</div>
          <div className="text-xs text-muted-foreground">Download all your data as JSON</div>
        </div>
      </button>

      <button
        onClick={() => setShowDeleteAccount(true)}
        className="flex w-full items-center gap-3 rounded-2xl border border-destructive/30 bg-card p-4 text-left transition-colors hover:border-destructive/60"
      >
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-destructive/10 text-destructive">
          <Trash2 className="h-4 w-4" />
        </div>
        <div className="flex-1">
          <div className="text-sm font-medium text-destructive">Delete account</div>
          <div className="text-xs text-muted-foreground">Permanently remove your account and data</div>
        </div>
      </button>

      {showChangePassword && (
        <ChangePasswordModal onClose={() => setShowChangePassword(false)} />
      )}

      <AlertDialog open={showDeleteAccount} onOpenChange={setShowDeleteAccount}>
        <DeleteAccountDialog
          onCancel={() => setShowDeleteAccount(false)}
          onSuccess={() => {
            setShowDeleteAccount(false);
            signOut({ callbackUrl: '/' });
          }}
        />
      </AlertDialog>
    </div>
  );
}

function ChangePasswordModal({ onClose }: { onClose: () => void }) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/user/change-password', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to change password');

      toast({ title: 'Password changed', description: 'Your password has been updated.' });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <KeyRound className="h-5 w-5 text-primary" />
            Change password
          </DialogTitle>
          <DialogDescription>Enter your current password and a new password.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label htmlFor="current-pw" className="mb-1 block text-xs font-medium text-muted-foreground">Current password</label>
            <input
              id="current-pw"
              type="password"
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              autoComplete="current-password"
              className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary"
            />
          </div>
          <div>
            <label htmlFor="new-pw" className="mb-1 block text-xs font-medium text-muted-foreground">New password</label>
            <input
              id="new-pw"
              type="password"
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="At least 6 characters"
              autoComplete="new-password"
              className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary"
            />
          </div>
          <div>
            <label htmlFor="confirm-pw" className="mb-1 block text-xs font-medium text-muted-foreground">Confirm new password</label>
            <input
              id="confirm-pw"
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              autoComplete="new-password"
              className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary"
            />
          </div>
          {error && (
            <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}
          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-transform hover:scale-[1.02] disabled:opacity-70"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            Change password
          </button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function DeleteAccountDialog({
  onCancel,
  onSuccess,
}: {
  onCancel: () => void;
  onSuccess: () => void;
}) {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleDelete = async () => {
    if (!password) {
      setError('Please enter your password to confirm');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/user/delete-account', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete account');

      toast({ title: 'Account deleted', description: 'Your account and all data have been permanently removed.' });
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle className="flex items-center gap-2 text-destructive">
          <AlertTriangle className="h-5 w-5" />
          Delete account?
        </AlertDialogTitle>
        <AlertDialogDescription>
          This will <strong>permanently delete</strong> your account, including all favorites,
          meal plans, shopping lists, and premium access. This action cannot be undone.
        </AlertDialogDescription>
      </AlertDialogHeader>

      <div className="space-y-2">
        <label htmlFor="delete-pw" className="block text-xs font-medium text-muted-foreground">
          Enter your password to confirm
        </label>
        <input
          id="delete-pw"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Your password"
          autoComplete="current-password"
          className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-destructive"
        />
        {error && <p className="text-sm text-destructive">{error}</p>}
      </div>

      <AlertDialogFooter>
        <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
        <AlertDialogAction
          onClick={(e) => {
            e.preventDefault();
            handleDelete();
          }}
          disabled={loading}
          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Deleting...
            </>
          ) : (
            'Delete permanently'
          )}
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  );
}

'use client';

import { useState, useMemo } from 'react';
import { Plus, Trash2, Check, X, ShoppingBasket, CheckCircle2 } from 'lucide-react';
import { useShoppingList } from '@/store/shoppingList';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import type { Screen } from '../page';

interface ShoppingScreenProps {
  onNavigate: (screen: Screen, recipeId?: string) => void;
}

const CATEGORIES = ['Protein', 'Carbs', 'Dairy', 'Fruit', 'Vegetables', 'Pantry', 'Other'];
const CATEGORY_EMOJI: Record<string, string> = {
  Protein: '🥩', Carbs: '🍞', Dairy: '🥛', Fruit: '🍎',
  Vegetables: '🥕', Pantry: '🧂', Other: '📦',
};

export function ShoppingScreen({ onNavigate }: ShoppingScreenProps) {
  const { items, addItem, removeItem, toggleChecked, clearChecked, clearAll } = useShoppingList();
  const { toast } = useToast();
  const [newName, setNewName] = useState('');
  const [newQty, setNewQty] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [confirmClearAll, setConfirmClearAll] = useState(false);

  const grouped = useMemo(() => {
    const g: Record<string, typeof items> = {};
    for (const c of CATEGORIES) g[c] = [];
    for (const item of items) {
      if (!g[item.category]) g[item.category] = [];
      g[item.category].push(item);
    }
    return g;
  }, [items]);

  const checkedCount = items.filter((i) => i.checked).length;
  const progress = items.length > 0 ? (checkedCount / items.length) * 100 : 0;

  const handleAdd = () => {
    if (!newName.trim()) return;
    addItem(newName, newQty || undefined);
    toast({ title: 'Item added', description: newName.trim() });
    setNewName('');
    setNewQty('');
    setShowAdd(false);
  };

  return (
    <div className="space-y-5 pb-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold">Shopping List</h1>
        <p className="text-sm text-muted-foreground">
          {items.length === 0
            ? 'Add items manually or import from your meal plan'
            : `${checkedCount} of ${items.length} items checked`}
        </p>
      </div>

      {/* Progress bar */}
      {items.length > 0 && (
        <div className="rounded-2xl border border-border bg-card p-4">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-medium">Progress</span>
            <span className="text-sm font-bold text-primary">{Math.round(progress)}%</span>
          </div>
          <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full bg-primary transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Add item */}
      {showAdd ? (
        <div className="rounded-2xl border border-primary/30 bg-card p-4">
          <h3 className="mb-3 font-semibold">Add item</h3>
          <div className="flex gap-2">
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
              placeholder="Item name (e.g. Chicken breast)"
              autoFocus
              className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
            />
            <input
              type="text"
              value={newQty}
              onChange={(e) => setNewQty(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
              placeholder="Qty"
              className="w-24 rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
            />
          </div>
          <div className="mt-3 flex gap-2">
            <button
              onClick={handleAdd}
              className="flex-1 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
            >
              Add item
            </button>
            <button
              onClick={() => { setShowAdd(false); setNewName(''); setNewQty(''); }}
              className="rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-muted"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => setShowAdd(true)}
            className="flex items-center justify-center gap-2 rounded-2xl border border-border bg-card px-4 py-3 text-sm font-semibold transition-colors hover:border-primary"
          >
            <Plus className="h-4 w-4" />
            Add item
          </button>
          <button
            onClick={() => onNavigate('planner')}
            className="flex items-center justify-center gap-2 rounded-2xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground transition-transform hover:scale-[1.02]"
          >
            <ShoppingBasket className="h-4 w-4" />
            Import from planner
          </button>
        </div>
      )}

      {/* Items grouped by category */}
      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border py-12 text-center">
          <ShoppingBasket className="h-10 w-10 text-muted-foreground/50" />
          <div>
            <p className="font-semibold">Your list is empty</p>
            <p className="text-sm text-muted-foreground">Add items or import from your meal plan</p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {CATEGORIES.map((cat) => {
            const catItems = grouped[cat] || [];
            if (catItems.length === 0) return null;
            const catChecked = catItems.filter((i) => i.checked).length;
            return (
              <div key={cat} className="rounded-2xl border border-border bg-card p-4">
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="flex items-center gap-2 font-semibold">
                    <span>{CATEGORY_EMOJI[cat]}</span>
                    {cat}
                    <span className="text-xs font-normal text-muted-foreground">
                      ({catChecked}/{catItems.length})
                    </span>
                  </h3>
                </div>
                <ul className="space-y-1">
                  {catItems.map((item) => (
                    <li key={item.id}>
                      <div className="flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-muted/50">
                        <button
                          onClick={() => toggleChecked(item.id)}
                          className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border transition-colors ${
                            item.checked
                              ? 'border-protein bg-protein text-white'
                              : 'border-border'
                          }`}
                        >
                          {item.checked && <Check className="h-3 w-3" />}
                        </button>
                        <div className="min-w-0 flex-1">
                          <div className={`text-sm ${item.checked ? 'text-muted-foreground line-through' : ''}`}>
                            {item.name}
                          </div>
                          {item.quantity && (
                            <div className={`text-xs text-muted-foreground ${item.checked ? 'line-through' : ''}`}>
                              {item.quantity}
                            </div>
                          )}
                          {item.fromRecipe && (
                            <div className="text-[10px] text-primary/70">
                              from {item.fromRecipe}
                            </div>
                          )}
                        </div>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="flex h-7 w-7 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      )}

      {/* Footer actions */}
      {items.length > 0 && (
        <div className="flex gap-2">
          {checkedCount > 0 && (
            <button
              onClick={() => {
                const count = checkedCount;
                clearChecked();
                toast({ title: `Cleared ${count} item${count !== 1 ? 's' : ''}` });
              }}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-medium transition-colors hover:bg-muted"
            >
              <CheckCircle2 className="h-4 w-4 text-protein" aria-hidden="true" />
              Clear checked ({checkedCount})
            </button>
          )}
          <button
            onClick={() => setConfirmClearAll(true)}
            aria-label="Clear entire shopping list"
            className="flex items-center justify-center gap-2 rounded-xl border border-border px-4 py-2.5 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10"
          >
            <Trash2 className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      )}

      {/* Clear all confirmation */}
      <AlertDialog open={confirmClearAll} onOpenChange={setConfirmClearAll}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Clear entire shopping list?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove all {items.length} item{items.length !== 1 ? 's' : ''} from your shopping list. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                clearAll();
                setConfirmClearAll(false);
                toast({ title: 'Shopping list cleared' });
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Clear all
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

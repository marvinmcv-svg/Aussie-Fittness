'use client';

import { useMemo, useState } from 'react';
import { RecipeTile, type RecipeSummary } from './RecipeTile';
import { dict, type Locale } from '@/content/i18n';

type Filter = 'all' | 'free' | 'Savoury' | 'Sweet';

export function RecipeBrowser({ recipes, locale }: { recipes: RecipeSummary[]; locale: Locale }) {
  const t = dict[locale].recipes;
  const [filter, setFilter] = useState<Filter>('all');
  const shown = useMemo(
    () =>
      recipes.filter((r) =>
        filter === 'all' ? true : filter === 'free' ? !r.premium : r.category === filter
      ),
    [recipes, filter]
  );
  const options: { id: Filter; label: string }[] = [
    { id: 'all', label: t.all },
    { id: 'free', label: t.free },
    { id: 'Savoury', label: t.savoury },
    { id: 'Sweet', label: t.sweet },
  ];

  return (
    <>
      <div role="group" aria-label="Filter recipes" className="flex flex-wrap gap-2">
        {options.map((o) => (
          <button
            key={o.id}
            type="button"
            aria-pressed={filter === o.id}
            onClick={() => setFilter(o.id)}
            className={`h-11 rounded-full px-5 text-[15px] font-semibold transition-colors ${
              filter === o.id
                ? 'bg-[var(--s-ink)] text-[var(--s-paper)]'
                : 'bg-[var(--s-card)] text-[var(--s-ink)] ring-1 ring-[var(--s-line)] hover:ring-[var(--s-ink)]'
            }`}
          >
            {o.label}
          </button>
        ))}
        <span className="ml-auto self-center text-[14px] text-[var(--s-muted)]" aria-live="polite">
          {t.count(shown.length)}
        </span>
      </div>
      <ul className="mt-10 grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 lg:grid-cols-4">
        {shown.map((r, i) => (
          <li key={r.id}>
            <RecipeTile recipe={r} locale={locale} heading="h2" priority={i < 2} />
          </li>
        ))}
      </ul>
    </>
  );
}

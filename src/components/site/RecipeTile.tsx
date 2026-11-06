import Image from 'next/image';
import Link from 'next/link';
import { dict, localePath, type Locale } from '@/content/i18n';
import type { Recipe } from '@/types';

/** Only what a tile needs — keeps client payloads small. */
export type RecipeSummary = Pick<Recipe, 'id' | 'title' | 'category' | 'protein' | 'calories' | 'cookTime' | 'premium'>;

export function toSummary(r: Recipe): RecipeSummary {
  const { id, title, category, protein, calories, cookTime, premium } = r;
  return { id, title, category, protein, calories, cookTime, premium };
}

export function recipePhoto(r: Pick<Recipe, 'id'>) {
  if (r.id === 'r001') return '/recipes/hero-curry.png';
  if (r.id === 'r002') return '/recipes/hero-burrito.png';
  return `/recipes/${r.id}.png`;
}

export function RecipeTile({
  recipe,
  locale,
  sizes = '(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw',
  heading = 'h3',
  priority = false,
}: {
  recipe: RecipeSummary;
  locale: Locale;
  sizes?: string;
  /** Keep heading order valid: h2 when tiles sit directly under the page h1. */
  heading?: 'h2' | 'h3';
  /** Above-the-fold tiles load eagerly (LCP). */
  priority?: boolean;
}) {
  const Heading = heading;
  const t = dict[locale].recipes;
  return (
    <Link href={localePath(`/recipes/${recipe.id}`, locale)} className="group block">
      <div className="s-media relative aspect-[4/5]">
        <Image src={recipePhoto(recipe)} alt={recipe.title} fill sizes={sizes} priority={priority} quality={65} className="object-cover" />
        <span
          className={`absolute left-3 top-3 rounded-full px-2.5 py-1 text-[12px] font-semibold ${
            recipe.premium ? 'bg-black/60 text-white backdrop-blur' : 'bg-[var(--s-green)] text-[var(--s-paper)]'
          }`}
        >
          {recipe.premium ? t.premium : t.free}
        </span>
      </div>
      <Heading className="mt-3 text-[18px] font-bold leading-tight tracking-[-0.02em] group-hover:underline group-hover:underline-offset-4">
        {recipe.title}
      </Heading>
      <p className="mt-1 text-[14px] text-[var(--s-muted)]">
        <span className="font-semibold text-[var(--s-green-ink)]">{recipe.protein}g {t.protein}</span>
        {' · '}
        {recipe.calories} {t.kcal}
        {' · '}
        {recipe.cookTime} {t.min}
      </p>
    </Link>
  );
}

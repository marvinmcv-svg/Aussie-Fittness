import Image from 'next/image';
import Link from 'next/link';
import { SiteShell } from '../SiteShell';
import { RecipeTile, recipePhoto } from '../RecipeTile';
import { dict, localePath, type Locale } from '@/content/i18n';
import { siteSettings } from '@/content/site';
import { getSiteRecipes } from '@/content/site-recipes';
import type { Recipe } from '@/types';

/**
 * Uses ONLY the public recipe data: premium recipes here carry a 3-ingredient
 * teaser and no directions, so nothing premium can leak through this page.
 */
export function RecipeDetailPage({ recipe, locale, siteUrl }: { recipe: Recipe; locale: Locale; siteUrl: string }) {
  const t = dict[locale].recipes;
  const totalIngredients = recipe.ingredientCount ?? recipe.ingredients.length;
  const totalSteps = recipe.stepCount ?? recipe.directions.length;
  const related = getSiteRecipes()
    .filter((r) => r.category === recipe.category && r.id !== recipe.id)
    .sort((a, b) => Math.abs(a.calories - recipe.calories) - Math.abs(b.calories - recipe.calories))
    .slice(0, 4);
  const path = `/recipes/${recipe.id}`;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Recipe',
    name: recipe.title,
    image: [`${siteUrl}${recipePhoto(recipe)}`],
    author: { '@type': 'Organization', name: siteSettings.brand },
    recipeCategory: recipe.category,
    keywords: recipe.tags.join(', '),
    totalTime: `PT${recipe.cookTime}M`,
    recipeYield: `${recipe.servings} ${recipe.servingsUnit}`,
    nutrition: {
      '@type': 'NutritionInformation',
      calories: `${recipe.calories} calories`,
      proteinContent: `${recipe.protein} g`,
      carbohydrateContent: `${recipe.carbs} g`,
      fatContent: `${recipe.fats} g`,
      ...(recipe.isTotal ? {} : { servingSize: '1 serving' }),
    },
    // Full ingredients and steps are published only for free recipes.
    ...(recipe.premium
      ? {}
      : {
          recipeIngredient: recipe.ingredients,
          recipeInstructions: recipe.directions.map((d) => ({ '@type': 'HowToStep', text: d })),
        }),
  };

  const macros = [
    { label: t.calories, value: recipe.calories, unit: '' },
    { label: t.proteinCap, value: recipe.protein, unit: 'g', strong: true },
    { label: t.carbs, value: recipe.carbs, unit: 'g' },
    { label: t.fats, value: recipe.fats, unit: 'g' },
  ];

  return (
    <SiteShell locale={locale} altPath={locale === 'en' ? `/es${path}` : path}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }} />

      <article className="s-wrap pb-[var(--s-section)] pt-8 md:pt-14">
        <Link href={localePath('/recipes', locale)} className="text-[15px] font-semibold text-[var(--s-muted)] hover:text-[var(--s-ink)]">
          ← {t.back}
        </Link>

        <div className="mt-6 grid gap-10 lg:grid-cols-[1.1fr_1fr] lg:gap-16">
          <div className="s-media s-rise relative aspect-[4/3] lg:sticky lg:top-24 lg:aspect-[4/5] lg:self-start">
            <Image src={recipePhoto(recipe)} alt={recipe.title} fill priority quality={65} sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover" />
          </div>

          <div>
            <p className="t-kicker s-rise text-[var(--s-green-ink)]">
              {recipe.category} · {recipe.premium ? t.premium : t.free}
            </p>
            <h1 className="s-rise mt-3 text-[clamp(44px,6.5vw,96px)] leading-[0.92]">{recipe.title}</h1>
            <p className="mt-4 text-[17px] text-[var(--s-muted)]">
              {recipe.cookTime} {t.min} · {t.serves} {recipe.servings} {recipe.servingsUnit}
            </p>

            <dl className="mt-8 grid grid-cols-4 overflow-hidden rounded-[2px] bg-[var(--s-card)] ring-1 ring-[var(--s-line)]">
              {macros.map((m) => (
                <div key={m.label} className={`px-3 py-5 text-center ${m.strong ? 'bg-[var(--s-green)] text-[var(--s-paper)]' : ''}`}>
                  <dt className={`text-[12px] font-semibold uppercase tracking-[0.08em] ${m.strong ? '' : 'opacity-70'}`}>{m.label}</dt>
                  <dd className="display mt-1 text-[clamp(26px,3vw,40px)] leading-none">
                    {m.value}
                    <span className="text-[0.55em]">{m.unit}</span>
                  </dd>
                </div>
              ))}
            </dl>
            <p className="mt-2 text-[13px] text-[var(--s-muted)]">{recipe.isTotal ? t.wholeRecipe : t.perServing}</p>

            <section className="mt-12" aria-labelledby="ing">
              <h2 id="ing" className="t-h3">
                {t.ingredients} <span className="text-[var(--s-muted)]">({totalIngredients})</span>
              </h2>
              {recipe.premium && <p className="mt-1 text-[14px] text-[var(--s-muted)]">{t.teaser}:</p>}
              <ul className="mt-4 divide-y divide-[var(--s-line)] border-y border-[var(--s-line)]">
                {recipe.ingredients.map((ing, i) => (
                  <li key={i} className="py-3 text-[17px]">{ing}</li>
                ))}
              </ul>
            </section>

            {recipe.premium ? (
              <div className="mt-10 border border-[var(--s-line-strong)] bg-[var(--s-card)] p-8">
                <h2 className="t-h3">{t.lockedTitle}</h2>
                <p className="mt-3 text-white/70">{t.lockedBody(totalIngredients, totalSteps)}</p>
                <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                  <a href={`${localePath('/', locale)}#order`} className="s-btn s-btn-ember">
                    {dict[locale].hero.ctaPrimary} <span className="s-arrow" aria-hidden="true">→</span>
                  </a>
                  <Link href={`/app?recipe=${recipe.id}`} className="s-btn s-btn-line">
                    {t.unlock}
                  </Link>
                </div>
              </div>
            ) : (
              <>
                <section className="mt-12" aria-labelledby="method">
                  <h2 id="method" className="t-h3">{t.method}</h2>
                  <ol className="mt-4 space-y-6">
                    {recipe.directions.map((step, i) => (
                      <li key={i} className="grid grid-cols-[44px_1fr] gap-3">
                        <span className="display text-[28px] leading-none text-[var(--s-green-ink)]">{i + 1}</span>
                        <p className="text-[17px]">{step}</p>
                      </li>
                    ))}
                  </ol>
                </section>
                <Link href={`/app?recipe=${recipe.id}`} className="s-btn s-btn-ink mt-10 w-full sm:w-auto">
                  {t.saveInApp}
                </Link>
              </>
            )}
          </div>
        </div>

        {related.length > 0 && (
          <section className="mt-[var(--s-section)]" aria-labelledby="more">
            <h2 id="more" className="t-h2">{t.more}</h2>
            <ul className="mt-10 grid grid-cols-2 gap-x-4 gap-y-10 lg:grid-cols-4">
              {related.map((r) => (
                <li key={r.id} className="reveal">
                  <RecipeTile recipe={r} locale={locale} />
                </li>
              ))}
            </ul>
          </section>
        )}
      </article>
    </SiteShell>
  );
}

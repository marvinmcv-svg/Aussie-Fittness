import { SiteShell } from '../SiteShell';
import { RecipeBrowser } from '../RecipeBrowser';
import { toSummary } from '../RecipeTile';
import { dict, type Locale } from '@/content/i18n';
import { getSiteRecipes } from '@/content/site-recipes';

export function RecipesPage({ locale }: { locale: Locale }) {
  const t = dict[locale].recipes;
  // Free recipes first: they're the ones a visitor can cook right now.
  const recipes = [...getSiteRecipes()].sort((a, b) => Number(a.premium) - Number(b.premium)).map(toSummary);
  return (
    <SiteShell locale={locale} altPath={locale === 'en' ? '/es/recipes' : '/recipes'}>
      <section className="s-wrap pb-[var(--s-section)] pt-12 md:pt-20">
        <p className="t-kicker s-rise text-[var(--s-green-ink)]">{t.kicker}</p>
        <h1 className="t-display s-rise mt-4 max-w-[12ch] !text-[clamp(52px,9vw,128px)]">{t.title}</h1>
        <p className="s-rise mt-6 max-w-xl text-[19px] text-[var(--s-muted)]">{t.sub}</p>
        <div className="mt-12">
          <RecipeBrowser recipes={recipes} locale={locale} />
        </div>
      </section>
    </SiteShell>
  );
}

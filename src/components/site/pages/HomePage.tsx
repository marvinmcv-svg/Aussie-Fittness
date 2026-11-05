import Image from 'next/image';
import Link from 'next/link';
import { SiteShell } from '../SiteShell';
import { FakeawayWall } from '../FakeawayWall';
import { RecipeTile, recipePhoto, toSummary } from '../RecipeTile';
import { EbookShelf } from '../EbookShelf';
import { Faq } from '../Faq';
import { dict, localePath, type Locale } from '@/content/i18n';
import { press, siteSettings } from '@/content/site';
import { getRecipeById, getRecipeStats } from '@/lib/recipes';
import { getSiteRecipes } from '@/content/site-recipes';
import { PRICE_LABEL, PRICE_CURRENCY } from '@/lib/pricing';
import type { Recipe } from '@/types';

// Photos checked against titles in QA (r024's photo is a pizza, r052's has baked-in text).
const WALL_IDS = ['r009', 'r031', 'r007', 'r026', 'r036', 'r081', 'r059', 'r001'];
const HERO_IDS = ['r031', 'r007', 'r009'];

export function HomePage({ locale }: { locale: Locale }) {
  const t = dict[locale];
  const stats = getRecipeStats();
  const wall = WALL_IDS.map((id) => getRecipeById(id)).filter(Boolean) as Recipe[];
  const hero = HERO_IDS.map((id) => getRecipeById(id)).filter(Boolean) as Recipe[];
  const allFree = getSiteRecipes().filter((r) => !r.premium);
  const free = allFree.slice(0, 4);

  return (
    <SiteShell locale={locale} altPath={locale === 'en' ? '/es' : '/'}>
      {/* ── Hero ───────────────────────────────────────── */}
      <section className="s-wrap pb-16 pt-10 md:pt-16">
        <p className="t-kicker s-rise text-[var(--s-green-ink)]">{t.hero.eyebrow}</p>
        <h1 className="t-display mt-5 !text-[clamp(56px,10vw,156px)]">
          <span className="s-rise block" style={{ animationDelay: '80ms' }}>{t.hero.line1}</span>{' '}
          <span className="s-rise block" style={{ animationDelay: '160ms' }}>{t.hero.line2}</span>
        </h1>
        <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.35fr)] lg:items-end lg:gap-16">
          <div>
            <p
              className="s-rise display text-[clamp(26px,3.2vw,44px)] leading-[1.02] text-[var(--s-green-ink)]"
              style={{ animationDelay: '240ms' }}
            >
              {t.hero.line3}
            </p>
            <p className="s-rise mt-5 max-w-[34rem] text-[19px] text-[var(--s-muted)]" style={{ animationDelay: '320ms' }}>
              {t.hero.sub}
            </p>
            <div className="s-rise mt-8 flex flex-col gap-3 sm:flex-row" style={{ animationDelay: '400ms' }}>
              <Link href={localePath('/recipes', locale)} className="s-btn s-btn-ink">{t.hero.ctaPrimary}</Link>
              <Link href="/app" className="s-btn s-btn-line">{t.nav.app}</Link>
            </div>
            <p className="mt-4 text-[14px] text-[var(--s-muted)]">
              <strong className="text-[var(--s-ink)]">{allFree.length}</strong> {t.hero.freeNote}
            </p>
          </div>

          {/* Three real recipes with their macros */}
          <div className="grid grid-cols-3 gap-3 sm:gap-4" aria-hidden="true">
            {hero.map((r, i) => (
              <div
                key={r.id}
                className={`s-media s-rise relative aspect-[3/4] ${i === 1 ? 'lg:-translate-y-10' : ''}`}
                style={{ animationDelay: `${200 + i * 120}ms` }}
              >
                <Image
                  src={recipePhoto(r)}
                  alt=""
                  fill
                  priority={i === 0}
                  sizes="(min-width: 1024px) 18vw, 33vw"
                  className="object-cover"
                />
                <span className="absolute inset-x-2 bottom-2 rounded-full bg-white/95 px-2 py-1 text-center text-[11px] font-semibold text-[var(--s-ink)] shadow-[0_6px_20px_rgb(0_0_0/0.18)] sm:text-[13px]">
                  {r.protein}g {t.recipes.protein}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Proof ──────────────────────────────────────── */}
      <section className="border-y border-[var(--s-line)] bg-[var(--s-card)]">
        <div className="s-wrap s-section grid gap-12 lg:grid-cols-[auto_minmax(0,1fr)] lg:gap-20">
          <div className="reveal">
            <p className="t-kicker text-[var(--s-muted)]">{t.proof.kicker}</p>
            <div className="display mt-2 text-[clamp(120px,19vw,260px)] leading-[0.8] tracking-[-0.06em]">
              {t.proof.stat}
            </div>
          </div>
          <div className="reveal flex flex-col justify-end">
            <p className="t-h3 max-w-[22ch]">{t.proof.statLabel}</p>
            <p className="mt-5 max-w-[40rem] text-[var(--s-muted)]">{t.proof.body}</p>
            <div className="mt-8">
              <p className="t-kicker text-[var(--s-muted)]">{t.proof.pressTitle}</p>
              <ul className="mt-3 divide-y divide-[var(--s-line)] border-y border-[var(--s-line)]">
                {press.map((p) => (
                  <li key={p.outlet}>
                    <a
                      href={p.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex items-baseline justify-between gap-6 py-4"
                    >
                      <span className="text-[17px] font-bold">{p.outlet}</span>
                      <span className="hidden flex-1 truncate text-[15px] text-[var(--s-muted)] sm:block">{p.headline}</span>
                      <span aria-hidden="true" className="transition-transform group-hover:translate-x-1">↗</span>
                    </a>
                  </li>
                ))}
              </ul>
              <Link href={localePath('/about', locale)} className="mt-5 inline-block font-semibold underline underline-offset-4">
                {t.proof.readStory}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Signature: Fakeaway Wall ──────────────────── */}
      <FakeawayWall recipes={wall.map(toSummary)} locale={locale} />

      {/* ── The app ────────────────────────────────────── */}
      <section className="s-wrap s-section">
        <div className="reveal max-w-3xl">
          <p className="t-kicker text-[var(--s-green-ink)]">{t.how.kicker}</p>
          <h2 className="t-h2 mt-3">{t.how.title}</h2>
        </div>
        <div className="mt-14 grid gap-12 lg:grid-cols-[1fr_420px] lg:gap-20">
          <ol className="divide-y divide-[var(--s-line)] border-y border-[var(--s-line)]">
            {t.how.steps.map((s, i) => (
              <li key={s.t} className="reveal grid grid-cols-[64px_1fr] gap-4 py-8 sm:grid-cols-[120px_1fr]">
                <span className="display text-[48px] leading-none text-[var(--s-green-ink)] sm:text-[72px]">{i + 1}</span>
                <div>
                  <h3 className="t-h3">{s.t}</h3>
                  <p className="mt-2 max-w-[36rem] text-[var(--s-muted)]">{s.b}</p>
                </div>
              </li>
            ))}
          </ol>
          <aside className="reveal self-start rounded-[24px] bg-[var(--s-ink)] p-8 text-[var(--s-paper)] lg:sticky lg:top-24">
            <p className="t-kicker text-[var(--s-green)]">{t.how.priceLine}</p>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="display text-[88px] leading-none tracking-[-0.05em]">{PRICE_LABEL}</span>
              <span className="text-[15px] text-white/60">{PRICE_CURRENCY}</span>
            </div>
            <p className="mt-2 text-[15px] text-white/65">{t.how.priceNote}</p>
            <p className="mt-6 text-[15px] text-white/80">{t.recipes.count(stats.total)}</p>
            <Link href="/app" className="s-btn s-btn-green mt-8 w-full">{t.how.cta}</Link>
          </aside>
        </div>
      </section>

      {/* ── Free recipes ───────────────────────────────── */}
      <section className="s-wrap pb-[var(--s-section)]">
        <div className="reveal flex flex-wrap items-end justify-between gap-4">
          <h2 className="t-h2 max-w-[12ch]">{t.recipes.title}</h2>
          <Link href={localePath('/recipes', locale)} className="font-semibold underline underline-offset-4">
            {t.hero.ctaSecondary} →
          </Link>
        </div>
        <div className="mt-10 grid grid-cols-2 gap-x-4 gap-y-10 lg:grid-cols-4">
          {free.map((r) => (
            <div key={r.id} className="reveal">
              <RecipeTile recipe={r} locale={locale} />
            </div>
          ))}
        </div>
      </section>

      {/* ── Ebooks ─────────────────────────────────────── */}
      <EbookShelf locale={locale} />

      {/* ── FAQ + Follow ───────────────────────────────── */}
      <section className="s-wrap s-section grid gap-16 lg:grid-cols-2">
        <Faq locale={locale} />
        <div className="reveal self-start rounded-[24px] bg-[var(--s-green)] p-8 sm:p-12">
          <h2 className="t-h2 max-w-[10ch]">{t.follow.title}</h2>
          <p className="mt-4 text-[17px]">{t.follow.sub}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            {siteSettings.socials.map((s) => (
              <a
                key={s.name}
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                className="s-btn s-btn-ink !h-12 !px-5 !text-[15px]"
              >
                {s.name}
              </a>
            ))}
          </div>
        </div>
      </section>
    </SiteShell>
  );
}

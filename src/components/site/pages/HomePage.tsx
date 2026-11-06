import Image from 'next/image';
import Link from 'next/link';
import { SiteShell } from '../SiteShell';
import { FakeawayWall } from '../FakeawayWall';
import { OrderBuilder } from '../OrderBuilder';
import { RecipeTile, toSummary } from '../RecipeTile';
import { Faq } from '../Faq';
import { dict, localePath, type Locale } from '@/content/i18n';
import { press, siteSettings } from '@/content/site';
import { media } from '@/content/media';
import { getRecipeById } from '@/lib/recipes';
import { getSiteRecipes } from '@/content/site-recipes';
import type { Recipe } from '@/types';

// Photos checked against titles in QA (r024's photo is a pizza, r052's has baked-in text).
const WALL_IDS = ['r009', 'r031', 'r007', 'r026', 'r036', 'r081', 'r059', 'r001'];

export function HomePage({ locale }: { locale: Locale }) {
  const t = dict[locale];
  const wall = WALL_IDS.map((id) => getRecipeById(id)).filter(Boolean) as Recipe[];
  const allFree = getSiteRecipes().filter((r) => !r.premium);
  const free = allFree.slice(0, 4);
  const heroRecipe = getRecipeById('r031');
  const orderHref = `${localePath('/', locale)}#order`;

  return (
    <SiteShell locale={locale} altPath={locale === 'en' ? '/es' : '/'}>
      {/* ── Hero ─────────────────────────────────────────── */}
      <section className="s-wrap grid items-end gap-12 pb-20 pt-12 md:pt-20 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,0.7fr)] lg:gap-16">
        <div>
          <p className="t-kicker s-rise text-[var(--s-muted)]">{t.hero.eyebrow}</p>
          <h1 className="t-display mt-8">
            <span className="s-mask"><span style={{ animationDelay: '60ms' }}>{t.hero.line1}</span></span>{' '}
            <span className="s-mask"><span style={{ animationDelay: '160ms' }}><em className="text-[var(--s-ember-text)]">{t.hero.line2}</em></span></span>
          </h1>
          <p className="s-rise mt-8 max-w-[30rem] text-[19px] text-[var(--s-muted)]" style={{ animationDelay: '320ms' }}>
            <span className="text-[var(--s-ink)]">{t.hero.line3}</span> {t.hero.sub}
          </p>
          <div className="s-rise mt-10 flex flex-col gap-3 sm:flex-row" style={{ animationDelay: '420ms' }}>
            <a href={orderHref} className="s-btn s-btn-ember">
              {t.hero.ctaPrimary} <span className="s-arrow" aria-hidden="true">→</span>
            </a>
            <Link href={localePath('/recipes', locale)} className="s-btn s-btn-line">
              {t.hero.ctaFree} · {allFree.length}
            </Link>
          </div>
        </div>

        <figure className="relative">
          <div className="s-media relative aspect-[4/5]">
            {media.heroVideo ? (
              <video
                className="absolute inset-0 h-full w-full object-cover"
                src={media.heroVideo}
                poster={media.heroImage}
                autoPlay
                muted
                loop
                playsInline
                aria-label={media.heroAlt}
              />
            ) : (
              <Image src={media.heroImage} alt={media.heroAlt} fill priority quality={70} sizes="(min-width: 1024px) 34vw, 92vw" className="object-cover" />
            )}
          </div>
          {heroRecipe && (
            <figcaption className="absolute -bottom-6 left-4 right-4 flex items-end justify-between gap-4 border border-[var(--s-line)] bg-[var(--s-paper)]/90 px-5 py-4 backdrop-blur-md sm:-left-10 sm:right-auto sm:min-w-[300px]">
              <div>
                <div className="t-kicker text-[10px] text-[var(--s-muted)]">No. 031</div>
                <div className="display mt-1 text-[20px] leading-tight">{heroRecipe.title}</div>
              </div>
              <div className="text-right">
                <div className="display text-[36px] leading-none text-[var(--s-green)]">{heroRecipe.protein}g</div>
                <div className="text-[11px] uppercase tracking-[0.2em] text-[var(--s-muted)]">{t.recipes.protein}</div>
              </div>
            </figcaption>
          )}
        </figure>
      </section>

      {/* ── Marquee ──────────────────────────────────────── */}
      <div className="marquee border-y border-[var(--s-line)] py-6" aria-hidden="true">
        {[0, 1].map((k) => (
          <div key={k} className="marquee-track">
            {t.marquee.map((w) => (
              <span key={w} className="display flex items-center gap-12 whitespace-nowrap text-[clamp(28px,4vw,52px)] italic text-[var(--s-ink)]/85">
                {w} <span className="text-[18px] not-italic text-[var(--s-ember-text)]">✦</span>
              </span>
            ))}
          </div>
        ))}
      </div>

      {/* ── Proof ────────────────────────────────────────── */}
      <section className="s-wrap s-section grid gap-14 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-24">
        <div className="reveal">
          <p className="t-kicker text-[var(--s-muted)]">{t.proof.kicker}</p>
          <div className="display mt-6 text-[clamp(120px,20vw,280px)] leading-[0.82] tracking-[-0.05em]">
            {t.proof.stat}
          </div>
          <p className="display mt-6 max-w-[16ch] text-[clamp(26px,3vw,38px)] italic leading-[1.1]">{t.proof.statLabel}</p>
        </div>
        <div className="reveal flex flex-col justify-end">
          <p className="max-w-[34rem] text-[19px] text-[var(--s-muted)]">{t.proof.body}</p>
          <p className="t-kicker mt-12 text-[var(--s-muted)]">{t.proof.pressTitle}</p>
          <ul className="mt-4 border-t border-[var(--s-line)]">
            {press.map((p) => (
              <li key={p.outlet} className="border-b border-[var(--s-line)]">
                <a href={p.url} target="_blank" rel="noopener noreferrer" className="group grid grid-cols-[120px_minmax(0,1fr)_auto] items-baseline gap-4 py-5">
                  <span className="text-[13px] font-semibold uppercase tracking-[0.2em]">{p.outlet}</span>
                  <span className="display truncate text-[18px] italic text-[var(--s-muted)] transition-colors group-hover:text-[var(--s-ink)]">{p.headline}</span>
                  <span aria-hidden="true" className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5">↗</span>
                </a>
              </li>
            ))}
          </ul>
          <Link href={localePath('/about', locale)} className="s-link mt-8 self-start">{t.proof.readStory}</Link>
        </div>
      </section>

      {/* ── Signature: Fakeaway Wall ──────────────────── */}
      <FakeawayWall recipes={wall.map(toSummary)} locale={locale} />

      {/* ── Order builder (the funnel) ────────────────── */}
      <section id="order" className="s-wrap scroll-mt-16 pb-[var(--s-section)] pt-[clamp(64px,8vw,112px)]">
        <div className="reveal mb-12 grid gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:items-end lg:gap-20">
          <div>
            <p className="t-kicker text-[var(--s-ember-text)]">{t.order.kicker}</p>
            <h2 className="mt-4 text-[clamp(36px,4.8vw,68px)] leading-[1]">
              {t.order.title} <em className="text-[var(--s-muted)]">{t.order.titleItalic}</em>
            </h2>
          </div>
          <p className="max-w-md text-[17px] text-[var(--s-muted)]">{t.order.sub}</p>
        </div>
        <OrderBuilder locale={locale} />
      </section>

      {/* ── Free recipes ───────────────────────────────── */}
      <section className="s-wrap pb-[var(--s-section)]">
        <div className="reveal flex flex-wrap items-end justify-between gap-6 border-t border-[var(--s-line)] pt-12">
          <h2 className="t-h2 max-w-[14ch]">{t.recipes.title}</h2>
          <Link href={localePath('/recipes', locale)} className="s-link">{t.hero.ctaSecondary} →</Link>
        </div>
        <div className="mt-12 grid grid-cols-2 gap-x-4 gap-y-12 lg:grid-cols-4">
          {free.map((r) => (
            <div key={r.id} className="reveal">
              <RecipeTile recipe={r} locale={locale} />
            </div>
          ))}
        </div>
      </section>

      {/* ── FAQ + Follow ───────────────────────────────── */}
      <section className="s-wrap pb-[var(--s-section)] grid gap-16 lg:grid-cols-2">
        <Faq locale={locale} />
        <div className="reveal self-start border border-[var(--s-line)] p-8 sm:p-12">
          <p className="t-kicker text-[var(--s-muted)]">@_aussiefitness</p>
          <h2 className="t-h2 mt-5 max-w-[11ch]">{t.follow.title}</h2>
          <p className="mt-4 text-[var(--s-muted)]">{t.follow.sub}</p>
          <div className="mt-10 flex flex-wrap gap-x-8 gap-y-4">
            {siteSettings.socials.map((s) => (
              <a key={s.name} href={s.url} target="_blank" rel="noopener noreferrer" className="s-link">
                {s.name}
              </a>
            ))}
          </div>
          <a href={orderHref} className="s-btn s-btn-ember mt-12 w-full">
            {t.hero.ctaPrimary} <span className="s-arrow" aria-hidden="true">→</span>
          </a>
        </div>
      </section>
    </SiteShell>
  );
}

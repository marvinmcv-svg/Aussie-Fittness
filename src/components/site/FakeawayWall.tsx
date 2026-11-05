import Image from 'next/image';
import Link from 'next/link';
import { CountUp } from './CountUp';
import { recipePhoto, type RecipeSummary } from './RecipeTile';
import { dict, localePath, type Locale } from '@/content/i18n';

/**
 * Signature moment: vertical scroll drives a horizontal run of fast-food-style
 * recipes. Pure CSS scroll-driven animation (see `.wall` in globals.css): no
 * JavaScript, runs off the main thread. Where unsupported, or with reduced
 * motion, it's a native horizontal scroller. Cards always render.
 */
export function FakeawayWall({ recipes, locale }: { recipes: RecipeSummary[]; locale: Locale }) {
  const t = dict[locale].wall;
  return (
    <section aria-labelledby="wall-title" className="wall bg-[var(--s-ink)] text-[var(--s-paper)]">
      <div className="wall-sticky">
        <div className="s-wrap flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="t-kicker text-[var(--s-green)]">{t.kicker}</p>
            <h2 id="wall-title" className="t-h2 mt-3 max-w-[14ch]">{t.title}</h2>
          </div>
          <p className="max-w-xs text-[15px] text-white/65">{t.sub}</p>
        </div>
        <div className="wall-viewport mt-8">
          <ul className="wall-track flex w-max gap-5 px-[clamp(16px,4vw,48px)]">
            {recipes.map((r, i) => (
              <li key={r.id} className="w-[min(78vw,46vh)] shrink-0 snap-start">
                <Link href={localePath(`/recipes/${r.id}`, locale)} className="group relative block">
                  <div className="s-media relative aspect-[4/5]">
                    <Image src={recipePhoto(r)} alt={r.title} fill quality={65} sizes="(min-width: 640px) 40vw, 78vw" className="object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
                    <div className="absolute left-5 top-5 rounded-full bg-[var(--s-sauce)] px-3 py-1 text-[13px] font-semibold text-[var(--s-ink)]">
                      {String(i + 1).padStart(2, '0')} · {t.cravings[r.id] ?? r.category}
                    </div>
                    <div className="absolute inset-x-5 bottom-5 text-white">
                      <div className="display flex items-baseline gap-2 leading-none">
                        <CountUp value={Math.round(r.protein)} className="text-[clamp(72px,9vw,128px)] tracking-[-0.05em]" />
                        <span className="text-[28px]">g</span>
                      </div>
                      <div className="mt-1 text-[14px] font-semibold uppercase tracking-[0.1em] text-[var(--s-green)]">{t.protein}</div>
                      <h3 className="mt-3 text-[24px] font-bold leading-tight tracking-[-0.02em]">{r.title}</h3>
                      <p className="text-[15px] text-white/70">{r.calories} {t.kcal} · {t.view} →</p>
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

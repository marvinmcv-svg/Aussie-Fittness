import Image from 'next/image';
import { dict, type Locale } from '@/content/i18n';
import { CHANNEL_URL, shortFrame, shortUrl, topShorts } from '@/content/shorts';

/**
 * Social proof that can be checked: Dez's most-watched Shorts with their public
 * YouTube view counts. Each card opens the video on YouTube.
 */
export function ShortsReel({ locale }: { locale: Locale }) {
  const t = dict[locale].reel;
  const items = topShorts.slice(0, 8);
  return (
    <section aria-labelledby="reel-title" className="s-wrap s-section">
      <div className="reveal grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)] lg:items-end lg:gap-20">
        <div>
          <p className="t-kicker text-[var(--s-ember-text)]">{t.kicker}</p>
          <h2 id="reel-title" className="t-h2 mt-4 max-w-[16ch]">{t.title}</h2>
        </div>
        <p className="max-w-md text-[17px] text-[var(--s-muted)]">{t.sub}</p>
      </div>
      <ul className="mt-12 grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-4">
        {items.map((s, i) => (
          <li key={s.id} className="reveal">
            <a href={shortUrl(s.id)} target="_blank" rel="noopener noreferrer" className="group block">
              <div className="s-media relative aspect-[4/5]">
                <Image src={shortFrame(s.id)} alt="" fill quality={65} sizes="(min-width: 768px) 23vw, 46vw" className="object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                <span className="absolute left-3 top-3 bg-black/60 px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-white backdrop-blur-sm">
                  #{i + 1}
                </span>
                <span aria-hidden="true" className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-white/90 text-[13px] text-black transition-transform duration-300 group-hover:scale-110">
                  ▶
                </span>
                <div className="absolute inset-x-3 bottom-3 text-white">
                  <div className="display text-[clamp(34px,4vw,52px)] leading-none tracking-[-0.04em]">{s.viewsLabel}</div>
                  <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/75">{t.views}</div>
                </div>
              </div>
              <h3 className="mt-3 font-sans text-[15px] font-semibold leading-snug tracking-normal text-[var(--s-ink)]/90 group-hover:text-[var(--s-ink)]">{s.title}</h3>
            </a>
          </li>
        ))}
      </ul>
      <div className="mt-12 flex flex-wrap items-center justify-between gap-4 border-t border-[var(--s-line)] pt-6">
        <p className="text-[13px] text-[var(--s-muted)]">{t.checked}</p>
        <a href={CHANNEL_URL} target="_blank" rel="noopener noreferrer" className="s-link">{t.watch} ↗</a>
      </div>
    </section>
  );
}

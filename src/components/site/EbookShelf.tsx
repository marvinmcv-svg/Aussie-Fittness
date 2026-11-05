import Link from 'next/link';
import { dict, localePath, type Locale } from '@/content/i18n';
import { ebooks, PRICES_CHECKED, type Ebook } from '@/content/site';

const tones: Record<Ebook['tone'], string> = {
  ink: 'bg-[var(--s-ink)] text-[var(--s-paper)]',
  green: 'bg-[var(--s-green)] text-[var(--s-ink)]',
  sauce: 'bg-[var(--s-sauce)] text-[var(--s-ink)]',
  paper: 'bg-[var(--s-card)] text-[var(--s-ink)] ring-1 ring-[var(--s-line)]',
};

function formatDate(iso: string, locale: Locale) {
  return new Date(iso + 'T00:00:00').toLocaleDateString(locale === 'es' ? 'es' : 'en-AU', { day: 'numeric', month: 'short', year: 'numeric' });
}

/** Ebook grid. `full` = the /ebooks page (adds the store policy line). */
export function EbookShelf({ locale, full = false }: { locale: Locale; full?: boolean }) {
  const t = dict[locale].ebooks;
  return (
    <section className={full ? 's-wrap pb-[var(--s-section)]' : 'border-t border-[var(--s-line)] bg-[var(--s-card)]'}>
      <div className={full ? '' : 's-wrap s-section'}>
        {!full && (
          <div className="reveal flex flex-wrap items-end justify-between gap-6">
            <div>
              <p className="t-kicker text-[var(--s-green-ink)]">{t.kicker}</p>
              <h2 className="t-h2 mt-3 max-w-[14ch]">{t.title}</h2>
              <p className="mt-4 max-w-md text-[var(--s-muted)]">{t.sub}</p>
            </div>
            <Link href={localePath('/ebooks', locale)} className="font-semibold underline underline-offset-4">
              {t.allBooks} →
            </Link>
          </div>
        )}
        <ul className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {ebooks.map((b) => (
            <li key={b.id} className="reveal flex flex-col">
              <div className={`flex aspect-[3/4] flex-col justify-between rounded-[24px] p-6 ${tones[b.tone]}`}>
                <span className="text-[12px] font-semibold uppercase tracking-[0.14em] opacity-70">Aussie Fitness</span>
                <div>
                  <div className="display text-[72px] leading-[0.85] tracking-[-0.05em]">{b.recipes}</div>
                  <div className="text-[13px] font-semibold uppercase tracking-[0.1em] opacity-70">{t.recipes}</div>
                  <h3 className="mt-4 text-[26px] font-extrabold leading-[1] tracking-[-0.03em]">{b.title}</h3>
                </div>
              </div>
              <div className="mt-4 flex items-baseline gap-2">
                {b.priceSale !== null ? (
                  <>
                    <span className="text-[20px] font-bold">${b.priceSale.toFixed(2)}</span>
                    <span className="text-[14px] text-[var(--s-muted)]">
                      AUD · {t.was} <s>${b.priceRegular?.toFixed(2)}</s>
                    </span>
                  </>
                ) : (
                  <span className="text-[15px] text-[var(--s-muted)]">Payhip</span>
                )}
              </div>
              <a
                href={b.url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-flex font-semibold underline underline-offset-4 hover:text-[var(--s-green-ink)]"
              >
                {b.priceSale !== null ? t.buy : t.buyPayhip} ↗
              </a>
            </li>
          ))}
        </ul>
        <p className="mt-10 text-[13px] text-[var(--s-muted)]">
          {t.checked} {formatDate(PRICES_CHECKED, locale)}.{full && <> {t.policy}</>}
        </p>
      </div>
    </section>
  );
}

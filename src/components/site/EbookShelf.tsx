import Image from 'next/image';
import Link from 'next/link';
import { dict, localePath, type Locale } from '@/content/i18n';
import { ebooks, PRICES_CHECKED } from '@/content/site';


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
        <ul className="mt-12 grid grid-cols-2 gap-x-4 gap-y-10 lg:grid-cols-4 lg:gap-x-5">
          {ebooks.map((b) => (
            <li key={b.id} className="reveal flex flex-col">
              <a href={b.url} target="_blank" rel="noopener noreferrer" className="group block" tabIndex={-1} aria-hidden="true">
                <div className="s-media relative aspect-[1414/2000] shadow-[0_30px_60px_-30px_rgba(0,0,0,0.8)]">
                  <Image src={b.cover} alt="" fill quality={75} sizes="(min-width: 1024px) 24vw, (min-width: 640px) 46vw, 92vw" className="object-cover" />
                </div>
              </a>
              <div className="mt-5 text-[13px] font-semibold uppercase tracking-[0.14em] text-[var(--s-muted)]">
                {b.recipes} {t.recipes}
              </div>
              {full ? (
                <h2 className="mt-1 text-[clamp(18px,2.2vw,24px)] font-extrabold leading-[1.05] tracking-[-0.02em]">{b.title}</h2>
              ) : (
                <h3 className="mt-1 text-[clamp(18px,2.2vw,24px)] font-extrabold leading-[1.05] tracking-[-0.02em]">{b.title}</h3>
              )}
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
        <a href={`${localePath('/', locale)}#order`} className="s-btn s-btn-ember mt-12">
          {dict[locale].order.kicker} <span className="s-arrow" aria-hidden="true">→</span>
        </a>
        <p className="mt-6 text-[13px] text-[var(--s-muted)]">
          {t.checked} {formatDate(PRICES_CHECKED, locale)}.{full && <> {t.policy}</>}
        </p>
      </div>
    </section>
  );
}

import { SiteShell } from '../SiteShell';
import { EbookShelf } from '../EbookShelf';
import { dict, type Locale } from '@/content/i18n';

export function EbooksPage({ locale }: { locale: Locale }) {
  const t = dict[locale].ebooks;
  return (
    <SiteShell locale={locale} altPath={locale === 'en' ? '/es/ebooks' : '/ebooks'}>
      <section className="s-wrap pt-12 md:pt-20">
        <p className="t-kicker s-rise text-[var(--s-green-ink)]">{t.kicker}</p>
        <h1 className="t-display s-rise mt-4 max-w-[12ch] !text-[clamp(52px,9vw,128px)]">{t.pageTitle}</h1>
        <p className="s-rise mt-6 max-w-xl text-[19px] text-[var(--s-muted)]">{t.pageSub}</p>
      </section>
      <EbookShelf locale={locale} full />
    </SiteShell>
  );
}

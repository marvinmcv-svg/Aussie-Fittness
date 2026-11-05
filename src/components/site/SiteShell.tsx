import Link from 'next/link';
import { SiteHeader } from './SiteHeader';
import { dict, localePath, type Locale } from '@/content/i18n';
import { siteSettings } from '@/content/site';

/** Wraps every marketing page: skip link, header, footer, language attribute. */
export function SiteShell({
  locale,
  altPath,
  children,
}: {
  locale: Locale;
  /** The same page in the other language (for the toggle). */
  altPath: string;
  children: React.ReactNode;
}) {
  const t = dict[locale];
  return (
    <div className="site min-h-screen" lang={locale}>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-[var(--s-ink)] focus:px-4 focus:py-2 focus:text-[var(--s-paper)]"
      >
        {t.nav.skip}
      </a>
      <SiteHeader locale={locale} altPath={altPath} />
      <main id="main">{children}</main>
      <footer className="bg-[var(--s-ink)] text-[var(--s-paper)]">
        <div className="s-wrap grid gap-12 py-16 md:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <div className="display text-[clamp(40px,7vw,88px)] leading-[0.9]">AUSSIE<br />FITNESS</div>
            <p className="mt-5 max-w-sm text-[15px] text-white/65">{t.footer.tagline}</p>
          </div>
          <nav aria-label="Footer" className="grid content-start gap-3 text-[15px]">
            <Link href={localePath('/recipes', locale)} className="hover:text-[var(--s-green)]">{t.nav.recipes}</Link>
            <Link href={localePath('/ebooks', locale)} className="hover:text-[var(--s-green)]">{t.nav.ebooks}</Link>
            <Link href={localePath('/about', locale)} className="hover:text-[var(--s-green)]">{t.nav.about}</Link>
            <Link href="/app" className="hover:text-[var(--s-green)]">{t.nav.app}</Link>
            <Link href="/app?tab=profile" className="text-white/60 hover:text-[var(--s-green)]">{t.footer.legal}</Link>
          </nav>
          <div className="grid content-start gap-3 text-[15px]">
            {siteSettings.socials.map((s) => (
              <a key={s.name} href={s.url} target="_blank" rel="noopener noreferrer" className="hover:text-[var(--s-green)]">
                {s.name} <span className="text-white/50">{s.handle}</span>
              </a>
            ))}
            <a href={`mailto:${siteSettings.email}`} className="mt-2 text-white/60 hover:text-[var(--s-green)]">
              {siteSettings.email}
            </a>
          </div>
        </div>
        <div className="s-wrap flex flex-wrap items-center justify-between gap-4 border-t border-white/10 py-6 text-[13px] text-white/50">
          <span>© {new Date().getFullYear()} {t.footer.rights}</span>
          <span>
            {t.footer.language}:{' '}
            <Link href={altPath} className="underline underline-offset-4 hover:text-white">
              {locale === 'en' ? 'Español' : 'English'}
            </Link>
          </span>
        </div>
      </footer>
    </div>
  );
}

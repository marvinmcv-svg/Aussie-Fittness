'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { dict, localePath, type Locale } from '@/content/i18n';

export function SiteHeader({ locale, altPath }: { locale: Locale; altPath: string }) {
  const t = dict[locale];
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open]);

  const links = [
    { href: localePath('/recipes', locale), label: t.nav.recipes },
    { href: localePath('/ebooks', locale), label: t.nav.ebooks },
    { href: localePath('/about', locale), label: t.nav.about },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--s-line)] bg-[var(--s-paper)]/90 backdrop-blur-md">
      <div className="s-wrap flex h-16 items-center justify-between gap-3 sm:gap-6">
        <Link href={localePath('/', locale)} className="display text-[19px] leading-none tracking-[-0.03em] sm:text-[22px]">
          AUSSIE<span className="text-[var(--s-green-ink)]">FITNESS</span>
        </Link>

        <nav aria-label="Main" className="hidden items-center gap-8 text-[15px] font-medium md:flex">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="hover:text-[var(--s-green-ink)]">{l.label}</Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href={altPath}
            hrefLang={locale === 'en' ? 'es' : 'en'}
            className="hidden h-10 items-center rounded-full px-3 text-[14px] font-semibold text-[var(--s-muted)] hover:text-[var(--s-ink)] sm:inline-flex"
          >
            {locale === 'en' ? 'ES' : 'EN'}
          </Link>
          <span className="hidden sm:block"><Link href="/app" className="s-btn s-btn-ink !h-10 !px-5 !text-[15px] whitespace-nowrap">{t.nav.app}</Link></span>
          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full md:hidden"
            aria-expanded={open}
            aria-controls="site-menu"
            aria-label={open ? t.nav.close : t.nav.menu}
            onClick={() => setOpen((v) => !v)}
          >
            <span aria-hidden="true" className="relative block h-3 w-5">
              <span className={`absolute left-0 top-0 h-[2px] w-5 bg-current transition-transform duration-200 ${open ? 'translate-y-[5px] rotate-45' : ''}`} />
              <span className={`absolute bottom-0 left-0 h-[2px] w-5 bg-current transition-transform duration-200 ${open ? '-translate-y-[5px] -rotate-45' : ''}`} />
            </span>
          </button>
        </div>
      </div>

      {open && (
        <div id="site-menu" className="fixed inset-x-0 bottom-0 top-16 z-40 bg-[var(--s-paper)] md:hidden">
          <nav aria-label="Mobile" className="s-wrap flex flex-col gap-2 pt-8">
            {links.map((l, i) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="display s-rise border-b border-[var(--s-line)] py-4 text-[44px] leading-none"
                style={{ animationDelay: `${i * 60}ms` }}
              >
                {l.label}
              </Link>
            ))}
            <Link href="/app" onClick={() => setOpen(false)} className="s-btn s-btn-ink mt-8">
              {t.nav.app}
            </Link>
            <Link href={altPath} onClick={() => setOpen(false)} className="mt-6 text-[17px] font-semibold text-[var(--s-muted)]">
              {locale === 'en' ? 'Español' : 'English'}
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}

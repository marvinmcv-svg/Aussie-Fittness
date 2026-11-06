import Link from 'next/link';
import { display, displayItalic } from './fonts';
import { dict } from '@/content/i18n';

export default function NotFound() {
  const t = dict.en.notFound;
  return (
    <div className={`site ${display.variable} ${displayItalic.variable} flex min-h-screen flex-col items-start justify-center gap-6 px-[clamp(16px,6vw,96px)]`}>
      <p className="t-kicker text-[var(--s-green-ink)]">404</p>
      <h1 className="t-display max-w-[10ch]">{t.title}</h1>
      <p className="text-[19px] text-[var(--s-muted)]">{t.sub}</p>
      <div className="flex flex-wrap gap-3">
        <Link href="/" className="s-btn s-btn-ink">{t.home}</Link>
        <Link href="/recipes" className="s-btn s-btn-line">{dict.en.nav.recipes}</Link>
      </div>
    </div>
  );
}

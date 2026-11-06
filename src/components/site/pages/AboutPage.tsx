import Image from 'next/image';
import Link from 'next/link';
import { media } from '@/content/media';
import { SiteShell } from '../SiteShell';
import { dict, type Locale } from '@/content/i18n';
import { press, siteSettings } from '@/content/site';

export function AboutPage({ locale }: { locale: Locale }) {
  const t = dict[locale];
  const a = t.about;
  return (
    <SiteShell locale={locale} altPath={locale === 'en' ? '/es/about' : '/about'}>
      <section className="s-wrap grid gap-12 pb-[var(--s-section)] pt-12 md:pt-20 lg:grid-cols-[1.2fr_1fr] lg:gap-20">
        <div>
          <p className="t-kicker s-rise text-[var(--s-green-ink)]">{a.kicker}</p>
          <h1 className="s-rise mt-4 text-[clamp(48px,7.5vw,112px)] leading-[0.92]">{a.title}</h1>
          <div className="mt-10 max-w-[38rem] space-y-6 text-[19px]">
            <p className="reveal">{a.p1}</p>
            <p className="reveal">{a.p2}</p>
          </div>
        </div>
        {media.portrait ? (
          <figure className="s-media relative aspect-[4/5] lg:sticky lg:top-24 lg:self-start">
            <Image src={media.portrait} alt={a.kitchenAlt} fill quality={75} sizes="(min-width: 1024px) 40vw, 100vw" className="object-cover" />
          </figure>
        ) : (
          /* Placeholder until the client supplies a real portrait (MISSING_CONTENT.md). */
          <figure
            className="flex aspect-[4/5] flex-col items-center justify-center gap-3 border border-dashed border-[var(--s-ember)] bg-[var(--s-card)] p-8 text-center lg:sticky lg:top-24 lg:self-start"
            aria-label={a.portrait}
          >
            <span className="bg-[var(--s-ember)] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-white">
              [{t.needsInput}]
            </span>
            <figcaption className="text-[15px] text-[var(--s-muted)]">{a.portrait} · {siteSettings.creator}</figcaption>
          </figure>
        )}
      </section>

      <section className="bg-[var(--s-card)] text-[var(--s-ink)]">
        <div className="s-wrap s-section">
          <p className="t-kicker text-[var(--s-green)]">{a.missionTitle}</p>
          <blockquote className="reveal display mt-6 max-w-[18ch] text-[clamp(40px,6vw,88px)] leading-[0.95]">
            {a.mission}
          </blockquote>
          <p className="mt-6 text-white/60">— {a.missionSource}</p>
        </div>
      </section>

      <section className="s-wrap s-section grid gap-16 lg:grid-cols-3">
        <div className="reveal lg:col-span-2">
          <h2 className="t-h2">{a.pressTitle}</h2>
          <ul className="mt-8 divide-y divide-[var(--s-line)] border-y border-[var(--s-line)]">
            {press.map((p) => (
              <li key={p.outlet}>
                <a href={p.url} target="_blank" rel="noopener noreferrer" className="group block py-6">
                  <span className="t-kicker text-[var(--s-muted)]">{p.outlet}</span>
                  <span className="mt-2 block text-[24px] font-bold leading-tight tracking-[-0.02em] group-hover:underline group-hover:underline-offset-4">
                    {p.headline} ↗
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </div>
        <div className="reveal space-y-10">
          <div>
            <h2 className="t-h3">{a.followTitle}</h2>
            <ul className="mt-4 space-y-2">
              {siteSettings.socials.map((s) => (
                <li key={s.name}>
                  <a href={s.url} target="_blank" rel="noopener noreferrer" className="font-semibold hover:text-[var(--s-green-ink)]">
                    {s.name} <span className="font-normal text-[var(--s-muted)]">{s.handle}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="t-h3">{a.contactTitle}</h2>
            <a href={`mailto:${siteSettings.email}`} className="mt-3 inline-block break-all font-semibold underline underline-offset-4">
              {siteSettings.email}
            </a>
          </div>
          <Link href="/app" className="s-btn s-btn-ink">{t.nav.app}</Link>
        </div>
      </section>
    </SiteShell>
  );
}

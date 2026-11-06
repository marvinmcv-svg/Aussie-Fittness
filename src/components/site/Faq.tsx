import { dict, type Locale } from '@/content/i18n';

export function Faq({ locale }: { locale: Locale }) {
  const t = dict[locale].faq;
  return (
    <div className="reveal">
      <h2 className="t-h2">{t.title}</h2>
      <div className="mt-8 divide-y divide-[var(--s-line)] border-y border-[var(--s-line)]">
        {t.items.map((f) => (
          <details key={f.q} className="group py-5 [&_summary::-webkit-details-marker]:hidden">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-6 text-[19px] font-semibold">
              {f.q}
              <span aria-hidden="true" className="text-[28px] font-light leading-none transition-transform duration-300 group-open:rotate-45">+</span>
            </summary>
            <p className="mt-3 max-w-[40rem] text-[var(--s-muted)]">{f.a}</p>
          </details>
        ))}
      </div>
    </div>
  );
}

export function faqJsonLd(locale: Locale) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: dict[locale].faq.items.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  };
}

import type { Metadata } from 'next';
import type { Locale } from '@/content/i18n';
import { siteSettings } from '@/content/site';

export const SITE_URL = process.env.NEXTAUTH_URL ?? 'https://aussiefit.vercel.app';

/** Per-page metadata with canonical + hreflang (en, es, x-default). `path` is the EN path. */
export function pageMetadata({
  locale,
  path,
  title,
  description,
  image = '/recipes/hero-spread.png',
}: {
  locale: Locale;
  path: string;
  title: string;
  description: string;
  image?: string;
}): Metadata {
  const en = path;
  const es = path === '/' ? '/es' : `/es${path}`;
  const self = locale === 'en' ? en : es;
  return {
    title,
    description,
    alternates: {
      canonical: self,
      languages: { en, es, 'x-default': en },
    },
    openGraph: {
      title,
      description,
      url: self,
      siteName: siteSettings.brand,
      locale: locale === 'en' ? 'en_AU' : 'es_ES',
      type: 'website',
      images: [{ url: image }],
    },
    twitter: { card: 'summary_large_image', title, description, images: [image] },
  };
}

export const organizationJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: siteSettings.brand,
  url: SITE_URL,
  email: siteSettings.email,
  founder: { '@type': 'Person', name: siteSettings.creator },
  sameAs: siteSettings.socials.map((s) => s.url),
};

export function JsonLd({ data }: { data: object }) {
  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, '\\u003c') }} />
  );
}

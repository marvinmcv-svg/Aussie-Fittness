import type { MetadataRoute } from 'next';
import { getSiteRecipes } from '@/content/site-recipes';
import { SITE_URL } from '@/lib/seo';

export const dynamic = 'force-static';

/** Every marketing page in EN + ES, with hreflang alternates. */
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const paths = ['/', '/recipes', '/ebooks', '/about', ...getSiteRecipes().map((r) => `/recipes/${r.id}`)];
  const es = (p: string) => (p === '/' ? '/es' : `/es${p}`);
  return [
    ...paths.flatMap((p) => {
      const languages = { en: `${SITE_URL}${p === '/' ? '' : p}`, es: `${SITE_URL}${es(p)}` };
      const priority = p === '/' ? 1 : p.startsWith('/recipes/') ? 0.7 : 0.8;
      return [
        { url: languages.en, lastModified: now, priority, alternates: { languages } },
        { url: languages.es, lastModified: now, priority: priority - 0.1, alternates: { languages } },
      ];
    }),
    { url: `${SITE_URL}/app`, lastModified: now, priority: 0.6 },
  ];
}

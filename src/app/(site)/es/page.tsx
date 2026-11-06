import { HomePage } from '@/components/site/pages/HomePage';
import { faqJsonLd } from '@/components/site/Faq';
import { JsonLd, organizationJsonLd, pageMetadata } from '@/lib/seo';

export const metadata = pageMetadata({
  locale: 'es',
  path: '/',
  title: 'Aussie Fitness: recetas fakeaway altas en proteína, planes y ebooks',
  description:
    'Come lo que se te antoja y cumple tus macros igual. Versiones altas en proteína y bajas en calorías de hamburguesas, pizza y comida rápida.',
});

export default function Page() {
  return (
    <>
      <JsonLd data={organizationJsonLd} />
      <JsonLd data={faqJsonLd('es')} />
      <HomePage locale="es" />
    </>
  );
}

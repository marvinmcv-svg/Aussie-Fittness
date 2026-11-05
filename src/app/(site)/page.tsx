import { HomePage } from '@/components/site/pages/HomePage';
import { faqJsonLd } from '@/components/site/Faq';
import { JsonLd, organizationJsonLd, pageMetadata } from '@/lib/seo';

export const metadata = pageMetadata({
  locale: 'en',
  path: '/',
  title: 'Aussie Fitness: High-protein fakeaway recipes, meal plans & ebooks',
  description:
    'Eat the food you crave and hit your macros anyway. High-protein, low-calorie versions of burgers, pizza and takeaway favourites from Aussie Fitness.',
});

export default function Page() {
  return (
    <>
      <JsonLd data={organizationJsonLd} />
      <JsonLd data={faqJsonLd('en')} />
      <HomePage locale="en" />
    </>
  );
}

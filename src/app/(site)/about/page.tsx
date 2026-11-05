import { AboutPage } from '@/components/site/pages/AboutPage';
import { pageMetadata } from '@/lib/seo';

export const metadata = pageMetadata({ locale: 'en', path: '/about', title: 'The story: 60kg lost on fakeaway swaps', description: 'How Dez Cerimagic went from 135kg to 75kg without giving up takeaway, and started Aussie Fitness.' });

export default function Page() {
  return <AboutPage locale="en" />;
}

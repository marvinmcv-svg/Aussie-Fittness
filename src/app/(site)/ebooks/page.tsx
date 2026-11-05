import { EbooksPage } from '@/components/site/pages/EbooksPage';
import { pageMetadata } from '@/lib/seo';

export const metadata = pageMetadata({ locale: 'en', path: '/ebooks', title: 'Aussie Fitness ebooks', description: 'The original Aussie Fitness high-protein cookbooks: the bundle, Elite, Fakeaway Favourites and Meal Prep.' });

export default function Page() {
  return <EbooksPage locale="en" />;
}

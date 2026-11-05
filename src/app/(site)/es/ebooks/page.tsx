import { EbooksPage } from '@/components/site/pages/EbooksPage';
import { pageMetadata } from '@/lib/seo';

export const metadata = pageMetadata({ locale: 'es', path: '/ebooks', title: 'Ebooks de Aussie Fitness', description: 'Los recetarios originales de Aussie Fitness: el paquete, Elite, Fakeaway Favourites y Meal Prep.' });

export default function Page() {
  return <EbooksPage locale="es" />;
}

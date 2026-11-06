import { RecipesPage } from '@/components/site/pages/RecipesPage';
import { pageMetadata } from '@/lib/seo';

export const metadata = pageMetadata({ locale: 'es', path: '/recipes', title: 'Recetas altas en proteína con macros', description: 'Explora 135 recetas altas en proteína y bajas en calorías con calorías, proteína, carbohidratos y grasas.' });

export default function Page() {
  return <RecipesPage locale="es" />;
}

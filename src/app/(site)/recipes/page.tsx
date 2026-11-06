import { RecipesPage } from '@/components/site/pages/RecipesPage';
import { pageMetadata } from '@/lib/seo';

export const metadata = pageMetadata({ locale: 'en', path: '/recipes', title: 'High-protein recipes with macros', description: 'Browse 135 high-protein, low-calorie recipes with calories, protein, carbs and fats. Free recipes in full.' });

export default function Page() {
  return <RecipesPage locale="en" />;
}

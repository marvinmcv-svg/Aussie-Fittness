import { notFound } from 'next/navigation';
import { RecipeDetailPage } from '@/components/site/pages/RecipeDetailPage';
import { recipePhoto } from '@/components/site/RecipeTile';
import { getSiteRecipes, getSiteRecipe } from '@/content/site-recipes';
import { pageMetadata, SITE_URL } from '@/lib/seo';

export const dynamicParams = false;

export function generateStaticParams() {
  return getSiteRecipes().map((r) => ({ id: r.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const r = getSiteRecipe(id);
  if (!r) return {};
  return pageMetadata({
    locale: 'en',
    path: `/recipes/${r.id}`,
    title: `${r.title}: ${r.protein}g protein, ${r.calories} kcal`,
    description: `${r.title}. ${r.protein}g protein, ${r.calories} calories, ${r.carbs}g carbs, ${r.fats}g fat. Ready in ${r.cookTime} min.`,
    image: recipePhoto(r),
  });
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const recipe = getSiteRecipe(id);
  if (!recipe) notFound();
  return <RecipeDetailPage recipe={recipe} locale="en" siteUrl={SITE_URL} />;
}

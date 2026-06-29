import { NextResponse } from 'next/server';
import { getRecipeById } from '@/lib/recipes';

export const dynamic = 'force-static';

export async function generateStaticParams() {
  const { getAllRecipes } = await import('@/lib/recipes');
  return getAllRecipes().map((r) => ({ id: r.id }));
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const recipe = getRecipeById(id);
  if (!recipe) {
    return NextResponse.json({ error: 'Recipe not found' }, { status: 404 });
  }
  return NextResponse.json(recipe);
}

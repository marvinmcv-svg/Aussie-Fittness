import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

/**
 * GET /api/user/export-data
 * Exports all of the user's data as a downloadable JSON file.
 * Required for GDPR compliance (right to data portability).
 */
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = session.user.id;

  // Fetch all user data
  const [user, favorites, mealPlan, shoppingItems] = await Promise.all([
    db.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isPremium: true,
        createdAt: true,
        updatedAt: true,
      },
    }),
    db.favorite.findMany({
      where: { userId },
      select: { recipeId: true, createdAt: true },
    }),
    db.mealPlanEntry.findMany({
      where: { userId },
      select: { id: true, recipeId: true, day: true, mealType: true, servings: true, createdAt: true },
    }),
    db.shoppingItem.findMany({
      where: { userId },
      select: { id: true, name: true, quantity: true, category: true, checked: true, fromRecipe: true, createdAt: true },
    }),
  ]);

  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  const exportData = {
    exportedAt: new Date().toISOString(),
    account: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      isPremium: user.isPremium,
      memberSince: user.createdAt,
    },
    favorites: favorites.map((f) => ({
      recipeId: f.recipeId,
      addedAt: f.createdAt,
    })),
    mealPlan: mealPlan.map((m) => ({
      id: m.id,
      recipeId: m.recipeId,
      day: m.day,
      mealType: m.mealType,
      servings: m.servings,
      addedAt: m.createdAt,
    })),
    shoppingList: shoppingItems.map((s) => ({
      id: s.id,
      name: s.name,
      quantity: s.quantity,
      category: s.category,
      checked: s.checked,
      fromRecipe: s.fromRecipe,
      addedAt: s.createdAt,
    })),
  };

  // Return as a downloadable JSON file
  return new NextResponse(JSON.stringify(exportData, null, 2), {
    headers: {
      'Content-Type': 'application/json',
      'Content-Disposition': `attachment; filename="aussiefit-data-${user.email}.json"`,
    },
  });
}

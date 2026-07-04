import { NextResponse } from 'next/server';
import { requireUser, db } from '@/lib/user-auth';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

/**
 * POST /api/user/sync
 *
 * Two-phase sync:
 * 1. Upload phase: client sends local localStorage data (favorites, mealplan, shopping)
 *    Server merges it into the DB (dedup favorites, append mealplan/shopping)
 * 2. Download phase: server returns the complete merged dataset
 *
 * This is called once on login. After that, individual mutations go through
 * their respective /api/user/* endpoints.
 */

const syncSchema = z.object({
  favorites: z.array(z.string()).default([]), // array of recipeIds
  mealPlan: z.array(z.object({
    recipeId: z.string(),
    day: z.number().int().min(0).max(6),
    mealType: z.enum(['breakfast', 'lunch', 'dinner', 'snack']),
    servings: z.number().int().min(1).max(20),
  })).default([]),
  shopping: z.array(z.object({
    name: z.string().min(1).max(200),
    quantity: z.string().max(100).optional(),
    category: z.string().max(50).optional(),
    checked: z.boolean().optional(),
    fromRecipe: z.string().max(200).optional(),
  })).default([]),
});

export async function POST(request: Request) {
  const session = await requireUser();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = session.user.id;

  try {
    const body = await request.json();
    const parsed = syncSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? 'Invalid input' },
        { status: 400 }
      );
    }

    const { favorites, mealPlan, shopping } = parsed.data;

    // 1. Upload: merge local favorites into DB (dedup via upsert)
    for (const recipeId of favorites) {
      await db.favorite.upsert({
        where: { userId_recipeId: { userId, recipeId } },
        update: {},
        create: { userId, recipeId },
      });
    }

    // 2. Upload: merge local meal plan entries (append — no dedup since entries are unique by ID)
    for (const entry of mealPlan) {
      await db.mealPlanEntry.create({
        data: { userId, ...entry },
      });
    }

    // 3. Upload: merge local shopping items (append — no dedup for simplicity)
    for (const item of shopping) {
      await db.shoppingItem.create({
        data: {
          userId,
          name: item.name,
          quantity: item.quantity ?? null,
          category: item.category ?? 'Other',
          checked: item.checked ?? false,
          fromRecipe: item.fromRecipe ?? null,
        },
      });
    }

    // 4. Download: return the complete merged dataset
    const [dbFavorites, dbMealPlan, dbShopping] = await Promise.all([
      db.favorite.findMany({
        where: { userId },
        select: { id: true, recipeId: true },
      }),
      db.mealPlanEntry.findMany({ where: { userId } }),
      db.shoppingItem.findMany({ where: { userId } }),
    ]);

    return NextResponse.json({
      favorites: dbFavorites.map((f) => f.recipeId),
      mealPlan: dbMealPlan.map((m) => ({
        id: m.id,
        recipeId: m.recipeId,
        day: m.day,
        mealType: m.mealType as 'breakfast' | 'lunch' | 'dinner' | 'snack',
        servings: m.servings,
      })),
      shopping: dbShopping.map((s) => ({
        id: s.id,
        name: s.name,
        quantity: s.quantity ?? undefined,
        category: s.category,
        checked: s.checked,
        fromRecipe: s.fromRecipe ?? undefined,
      })),
    });
  } catch (error) {
    console.error('Sync error:', error);
    return NextResponse.json({ error: 'Sync failed' }, { status: 500 });
  }
}

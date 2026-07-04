import { NextResponse } from 'next/server';
import { requireUser, db } from '@/lib/user-auth';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const mealPlanSchema = z.object({
  recipeId: z.string(),
  day: z.number().int().min(0).max(6),
  mealType: z.enum(['breakfast', 'lunch', 'dinner', 'snack']),
  servings: z.number().int().min(1).max(20).optional(),
});

// GET /api/user/mealplan — list all meal plan entries
export async function GET() {
  const session = await requireUser();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const entries = await db.mealPlanEntry.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json({ entries });
}

// POST /api/user/mealplan — add a meal plan entry
export async function POST(request: Request) {
  const session = await requireUser();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsed = mealPlanSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? 'Invalid input' },
        { status: 400 }
      );
    }

    const { recipeId, day, mealType, servings } = parsed.data;

    const entry = await db.mealPlanEntry.create({
      data: {
        userId: session.user.id,
        recipeId,
        day,
        mealType,
        servings: servings ?? 1,
      },
    });

    return NextResponse.json(entry);
  } catch (error) {
    console.error('Add meal plan error:', error);
    return NextResponse.json({ error: 'Failed to add meal' }, { status: 500 });
  }
}

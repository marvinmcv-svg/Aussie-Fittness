import { NextResponse } from 'next/server';
import { requireUser, db } from '@/lib/user-auth';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const updateSchema = z.object({
  servings: z.number().int().min(1).max(20).optional(),
});

// PATCH /api/user/mealplan/[id] — update servings
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireUser();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await params;
    const body = await request.json();
    const parsed = updateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? 'Invalid input' },
        { status: 400 }
      );
    }

    const entry = await db.mealPlanEntry.updateMany({
      where: { id, userId: session.user.id },
      data: parsed.data,
    });

    if (entry.count === 0) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Update meal plan error:', error);
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
  }
}

// DELETE /api/user/mealplan/[id] — remove a meal plan entry
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireUser();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await params;

    await db.mealPlanEntry.deleteMany({
      where: { id, userId: session.user.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete meal plan error:', error);
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import { requireUser, db } from '@/lib/user-auth';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const updateSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  quantity: z.string().max(100).optional(),
  category: z.string().max(50).optional(),
  checked: z.boolean().optional(),
  fromRecipe: z.string().max(200).optional().nullable(),
});

// PATCH /api/user/shopping/[id] — update a shopping item
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

    const item = await db.shoppingItem.updateMany({
      where: { id, userId: session.user.id },
      data: parsed.data,
    });

    if (item.count === 0) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Update shopping item error:', error);
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
  }
}

// DELETE /api/user/shopping/[id] — remove a shopping item
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

    await db.shoppingItem.deleteMany({
      where: { id, userId: session.user.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete shopping item error:', error);
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import { requireUser, db } from '@/lib/user-auth';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const itemSchema = z.object({
  name: z.string().min(1).max(200),
  quantity: z.string().max(100).optional(),
  category: z.string().max(50).optional(),
  checked: z.boolean().optional(),
  fromRecipe: z.string().max(200).optional(),
});

// GET /api/user/shopping — list all shopping items
export async function GET() {
  const session = await requireUser();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const items = await db.shoppingItem.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json({ items });
}

// POST /api/user/shopping — add a shopping item
export async function POST(request: Request) {
  const session = await requireUser();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsed = itemSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? 'Invalid input' },
        { status: 400 }
      );
    }

    const item = await db.shoppingItem.create({
      data: {
        userId: session.user.id,
        name: parsed.data.name,
        quantity: parsed.data.quantity ?? null,
        category: parsed.data.category ?? 'Other',
        checked: parsed.data.checked ?? false,
        fromRecipe: parsed.data.fromRecipe ?? null,
      },
    });

    return NextResponse.json(item);
  } catch (error) {
    console.error('Add shopping item error:', error);
    return NextResponse.json({ error: 'Failed to add item' }, { status: 500 });
  }
}

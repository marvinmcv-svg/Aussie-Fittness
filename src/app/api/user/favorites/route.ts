import { NextResponse } from 'next/server';
import { requireUser, db } from '@/lib/user-auth';

export const dynamic = 'force-dynamic';

// GET /api/user/favorites — list user's favorite recipe IDs
export async function GET() {
  const session = await requireUser();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const favorites = await db.favorite.findMany({
    where: { userId: session.user.id },
    select: { id: true, recipeId: true, createdAt: true },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json({ favorites });
}

// POST /api/user/favorites — add a favorite
export async function POST(request: Request) {
  const session = await requireUser();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { recipeId } = await request.json();
    if (!recipeId || typeof recipeId !== 'string') {
      return NextResponse.json({ error: 'recipeId is required' }, { status: 400 });
    }

    // upsert prevents duplicate errors (unique constraint on userId+recipeId)
    const favorite = await db.favorite.upsert({
      where: {
        userId_recipeId: {
          userId: session.user.id,
          recipeId,
        },
      },
      update: {}, // no-op if exists
      create: {
        userId: session.user.id,
        recipeId,
      },
      select: { id: true, recipeId: true },
    });

    return NextResponse.json(favorite);
  } catch (error) {
    console.error('Add favorite error:', error);
    return NextResponse.json({ error: 'Failed to add favorite' }, { status: 500 });
  }
}

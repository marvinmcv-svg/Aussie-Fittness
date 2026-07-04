import { NextResponse } from 'next/server';
import { requireUser, db } from '@/lib/user-auth';

export const dynamic = 'force-dynamic';

// DELETE /api/user/favorites/[id] — remove a favorite by recipe ID
// Note: [id] here is the recipeId, not the Favorite.id, for easier client usage
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireUser();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id: recipeId } = await params;

    await db.favorite.deleteMany({
      where: {
        userId: session.user.id,
        recipeId,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Remove favorite error:', error);
    return NextResponse.json({ error: 'Failed to remove favorite' }, { status: 500 });
  }
}

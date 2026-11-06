import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { getRecipeById } from '@/lib/recipes';
import { getFullRecipeById } from '@/lib/recipes.server';

// Must be dynamic: the response depends on who is asking.
export const dynamic = 'force-dynamic';

/**
 * GET /api/recipes/[id]
 * - Free recipe → full content for everyone.
 * - Premium recipe → full content only for premium users (checked against the
 *   DB, not just the JWT, so refunds/downgrades take effect immediately).
 *   Everyone else gets the public teaser with `locked: true`.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const full = getFullRecipeById(id);
  if (!full) {
    return NextResponse.json({ error: 'Recipe not found' }, { status: 404 });
  }

  if (!full.premium) {
    return NextResponse.json({ recipe: full, locked: false });
  }

  const session = await getServerSession(authOptions);
  let isPremium = false;
  if (session?.user?.id) {
    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: { isPremium: true },
    });
    isPremium = !!user?.isPremium;
  }

  if (!isPremium) {
    return NextResponse.json(
      { recipe: getRecipeById(id), locked: true },
      { status: 403, headers: { 'Cache-Control': 'private, no-store' } }
    );
  }

  return NextResponse.json(
    { recipe: full, locked: false },
    { headers: { 'Cache-Control': 'private, no-store' } }
  );
}

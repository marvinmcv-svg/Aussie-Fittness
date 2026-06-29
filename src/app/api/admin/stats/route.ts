import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin';
import { db } from '@/lib/db';
import { getRecipeStats } from '@/lib/recipes';

export const dynamic = 'force-dynamic';

// GET /api/admin/stats — dashboard stats
export async function GET() {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const [totalUsers, premiumUsers, adminUsers, recentUsers] = await Promise.all([
    db.user.count(),
    db.user.count({ where: { isPremium: true } }),
    db.user.count({ where: { role: 'ADMIN' } }),
    db.user.count({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        },
      },
    }),
  ]);

  const freeUsers = totalUsers - premiumUsers;
  const recipeStats = getRecipeStats();

  // Revenue estimate: premium users × $9.99
  const revenue = premiumUsers * 9.99;

  // Conversion rate
  const conversionRate = totalUsers > 0 ? (premiumUsers / totalUsers) * 100 : 0;

  return NextResponse.json({
    users: {
      total: totalUsers,
      premium: premiumUsers,
      free: freeUsers,
      admin: adminUsers,
      newThisWeek: recentUsers,
    },
    revenue: {
      total: Number(revenue.toFixed(2)),
      perUser: premiumUsers > 0 ? Number((revenue / premiumUsers).toFixed(2)) : 0,
    },
    conversionRate: Number(conversionRate.toFixed(1)),
    recipes: recipeStats,
  });
}

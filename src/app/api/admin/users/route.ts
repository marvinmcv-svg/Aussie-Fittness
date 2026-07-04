import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { requireAdmin } from '@/lib/admin';
import { db } from '@/lib/db';
import { adminCreateUserSchema, parseBody } from '@/lib/validation';

export const dynamic = 'force-dynamic';

// GET /api/admin/users — list all users
export async function GET() {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const users = await db.user.findMany({
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      isPremium: true,
      createdAt: true,
    },
  });

  return NextResponse.json({ users });
}

// POST /api/admin/users — create a new user (admin can set role/premium)
export async function POST(request: Request) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const parsed = parseBody(adminCreateUserSchema, body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error }, { status: 400 });
    }
    const { email, password, name, role, isPremium } = parsed.data;

    const normalizedEmail = email.toLowerCase().trim();

    const existing = await db.user.findUnique({
      where: { email: normalizedEmail },
    });
    if (existing) {
      return NextResponse.json(
        { error: 'An account with that email already exists' },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await db.user.create({
      data: {
        email: normalizedEmail,
        name: name?.trim() || null,
        password: hashedPassword,
        role: role === 'ADMIN' ? 'ADMIN' : 'USER',
        isPremium: Boolean(isPremium),
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isPremium: true,
        createdAt: true,
      },
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error('Admin create user error:', error);
    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    );
  }
}

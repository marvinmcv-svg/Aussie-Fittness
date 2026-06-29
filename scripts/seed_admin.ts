/**
 * Seed an admin user. Run with: bun scripts/seed_admin.ts
 * Default admin: admin@aussiefit.com / admin123
 */
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

const db = new PrismaClient();

async function main() {
  const email = 'admin@aussiefit.com';
  const password = 'admin123';

  const existing = await db.user.findUnique({ where: { email } });
  if (existing) {
    // Ensure existing admin has correct role
    if (existing.role !== 'ADMIN' || !existing.isPremium) {
      await db.user.update({
        where: { id: existing.id },
        data: { role: 'ADMIN', isPremium: true },
      });
      console.log(`Updated ${email} to ADMIN with premium`);
    } else {
      console.log(`Admin user already exists: ${email}`);
    }
  } else {
    const hashed = await bcrypt.hash(password, 10);
    await db.user.create({
      data: {
        email,
        name: 'Admin',
        password: hashed,
        role: 'ADMIN',
        isPremium: true,
      },
    });
    console.log(`Created admin user: ${email} / ${password}`);
  }

  // Also create a demo regular user
  const demoEmail = 'user@aussiefit.com';
  const demoExists = await db.user.findUnique({ where: { email: demoEmail } });
  if (!demoExists) {
    const hashed = await bcrypt.hash('user123', 10);
    await db.user.create({
      data: {
        email: demoEmail,
        name: 'Demo User',
        password: hashed,
        role: 'USER',
        isPremium: false,
      },
    });
    console.log(`Created demo user: ${demoEmail} / user123`);
  } else {
    console.log(`Demo user already exists: ${demoEmail}`);
  }

  // Show user count
  const count = await db.user.count();
  console.log(`\nTotal users in database: ${count}`);
}

main().catch(console.error).finally(() => db.$disconnect());

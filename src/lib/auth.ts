import type { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { db } from '@/lib/db';
import { env } from '@/lib/env';
import { rateLimit } from '@/lib/rateLimit';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials, req) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email and password are required');
        }

        // Rate limit: 10 login attempts per IP per 15 minutes
        const ip = req?.headers?.['x-forwarded-for']?.toString().split(',')[0] ?? 'unknown';
        const { allowed } = rateLimit(`login:${ip}`, 10, 15 * 60 * 1000);
        if (!allowed) {
          throw new Error('Too many login attempts. Please try again later.');
        }

        const user = await db.user.findUnique({
          where: { email: credentials.email.toLowerCase() },
        });

        if (!user) {
          throw new Error('No account found with that email');
        }

        const isValid = await bcrypt.compare(credentials.password, user.password);
        if (!isValid) {
          throw new Error('Incorrect password');
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          isPremium: user.isPremium,
        };
      },
    }),
  ],
  session: { strategy: 'jwt' },
  pages: {
    signIn: '/',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as { role?: string }).role ?? 'USER';
        token.isPremium = (user as { isPremium?: boolean }).isPremium ?? false;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as { id?: string }).id = token.id as string;
        (session.user as { role?: string }).role = token.role as string;
        (session.user as { isPremium?: boolean }).isPremium = token.isPremium as boolean;
      }
      return session;
    },
  },
  secret: env.NEXTAUTH_SECRET,
};

// Extend the type declarations
declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      email: string;
      name?: string | null;
      role: string;
      isPremium: boolean;
    };
  }
  interface User {
    role?: string;
    isPremium?: boolean;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id?: string;
    role?: string;
    isPremium?: boolean;
  }
}
